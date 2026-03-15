import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { TOOL_CATALOG } from "../_shared/tool-catalog.ts";
import { getAllStatesForFlow, type StateDefinition } from "../_shared/state-machine.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IspAgentWithTemplate {
  id: string;
  isp_id: string;
  agent_id: string;
  display_name: string | null;
  voice_tone: string | null;
  is_enabled: boolean;
  additional_prompt: string | null;
  chunk_size: number | null;
  ai_agents: {
    id: string;
    name: string;
    slug: string;
    system_prompt: string | null;
    model: string | null;
    temperature: number | null;
    max_tokens: number | null;
    is_active: boolean;
    uses_knowledge_base: boolean;
    scope: string;
  };
}

function buildSystemPrompt(
  template: IspAgentWithTemplate["ai_agents"],
  ispAgent: IspAgentWithTemplate,
  securityClauses: { content: string; name: string; applies_to: string }[],
  knowledgeBase: { question: string; answer: string; category: string | null }[],
  ispName: string,
  hasErp: boolean,
  flowStates: StateDefinition[],
  flowToolHandlers: Set<string>,
): string {
  const parts: string[] = [];

  if (template.system_prompt) parts.push(template.system_prompt);
  if (ispAgent.voice_tone) parts.push(`\nAdote o seguinte tom de voz em suas respostas: ${ispAgent.voice_tone}`);

  if (knowledgeBase.length > 0) {
    const kbSection = knowledgeBase.map((item) => `P: ${item.question}\nR: ${item.answer}`).join("\n\n");
    parts.push(`\n## Perguntas Frequentes\n${kbSection}`);
  }

  if (securityClauses.length > 0) {
    const clausesText = securityClauses.map((c) => `- ${c.content}`).join("\n");
    parts.push(`\n## REGRAS OBRIGATÓRIAS DE SEGURANÇA\nVocê DEVE seguir estas regras em todas as interações:\n${clausesText}`);
  }

  const availableTools = Object.values(TOOL_CATALOG).filter(
    (t) => flowToolHandlers.has(t.handler) && (!t.requires_erp || hasErp),
  );
  if (availableTools.length > 0) {
    const toolsList = availableTools.map((t) => `- ${t.handler}: ${t.description}`).join("\n");
    parts.push(`\n## Ferramentas Disponíveis\n${toolsList}`);
  }

  // Flow states section (replaces old flow steps)
  if (flowStates.length > 0) {
    const statesText = flowStates.map((state, i) => {
      let line = `${i + 1}. ${state.state_key.toUpperCase()}\n   Objetivo: ${state.objective}`;
      if (state.allowed_tools.length > 0) {
        const toolNames = state.allowed_tools
          .map(h => TOOL_CATALOG[h]?.display_name || h)
          .join(", ");
        line += `\n   Ferramentas: ${toolNames}`;
      }
      if (state.fallback_message) line += `\n   Fallback: ${state.fallback_message}`;
      if (state.transition_rules.length > 0) {
        const rulesText = state.transition_rules.map((r: any) => {
          return `   - ${r.type}${r.tool_name ? `(${r.tool_name})` : ''}${r.pattern ? `(/${r.pattern}/)` : ''} → ${r.goto_state}`;
        }).join("\n");
        line += `\n   Transições:\n${rulesText}`;
      }
      return line;
    }).join("\n\n");

    parts.push(`\n## Estados do Fluxo (State Machine)\n\n${statesText}`);
  }

  const contextAnchor = `\n## Contexto Atual\n- Provedor: ${ispName}\n- Data: ${new Date().toLocaleDateString("pt-BR")}\n- Agente: ${ispAgent.display_name || template.name}`;
  parts.push(contextAnchor);

  return parts.join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authError } = await supabaseAuth.auth.getClaims(token);
    if (authError || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claims.claims.sub as string;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: roleCheck } = await supabaseAdmin
      .from("user_roles").select("id").eq("user_id", userId).eq("role", "super_admin").single();
    if (!roleCheck) {
      return new Response(JSON.stringify({ error: "Forbidden", message: "Apenas super admins podem auditar prompts" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { isp_agent_id } = await req.json();
    if (!isp_agent_id) {
      return new Response(JSON.stringify({ error: "isp_agent_id é obrigatório" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: ispAgent, error: agentError } = await supabaseAdmin
      .from("isp_agents")
      .select(`id, isp_id, agent_id, display_name, voice_tone, is_enabled, additional_prompt, chunk_size,
        ai_agents (id, name, slug, system_prompt, model, temperature, max_tokens, is_active, uses_knowledge_base, scope)`)
      .eq("id", isp_agent_id)
      .single() as { data: IspAgentWithTemplate | null; error: unknown };

    if (agentError || !ispAgent) {
      return new Response(JSON.stringify({ error: "Agente não encontrado" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const template = ispAgent.ai_agents;

    const { data: isp } = await supabaseAdmin.from("isps").select("name").eq("id", ispAgent.isp_id).single();
    const ispName = isp?.name || "ISP";

    const { data: securityClauses } = await supabaseAdmin
      .from("ai_security_clauses").select("id, name, content, applies_to")
      .eq("is_active", true).in("applies_to", ["all", "tenant"]).order("sort_order");

    let knowledgeBase: { question: string; answer: string; category: string | null }[] = [];
    if (template.uses_knowledge_base) {
      const { data: kbItems } = await supabaseAdmin
        .from("agent_knowledge_base").select("question, answer, category")
        .eq("isp_agent_id", ispAgent.id).eq("is_active", true).order("sort_order");
      knowledgeBase = kbItems || [];
    }

    const { count: documentCount } = await supabaseAdmin
      .from("knowledge_documents").select("id", { count: "exact", head: true })
      .eq("isp_agent_id", ispAgent.id).eq("status", "indexed");

    let hasActiveErp = false;
    const { data: erpConfig } = await supabaseAdmin
      .from("erp_configs").select("id, provider")
      .eq("isp_id", ispAgent.isp_id).eq("is_active", true).eq("is_connected", true).limit(1).single();
    hasActiveErp = !!erpConfig;

    // Flow links → flow_state_definitions
    const { data: flowLinks } = await supabaseAdmin
      .from("ai_agent_flow_links").select("flow_id")
      .eq("agent_id", template.id).eq("is_active", true);

    const flowIds = (flowLinks || []).map((fl: any) => fl.flow_id);
    let allStates: StateDefinition[] = [];

    if (flowIds.length > 0) {
      for (const fid of flowIds) {
        const states = await getAllStatesForFlow(supabaseAdmin, fid);
        allStates.push(...states);
      }
    }

    const flowToolHandlers = new Set<string>();
    for (const state of allStates) {
      for (const t of state.allowed_tools) flowToolHandlers.add(t);
    }

    const prompt = buildSystemPrompt(
      template, ispAgent, securityClauses || [], knowledgeBase, ispName, hasActiveErp, allStates, flowToolHandlers,
    );

    const availableTools = Object.values(TOOL_CATALOG).filter(
      (t) => flowToolHandlers.has(t.handler) && (!t.requires_erp || hasActiveErp),
    );

    const { data: usageHistory } = await supabaseAdmin
      .from("ai_usage").select("id, created_at, tokens_total, tokens_input, tokens_output, metadata")
      .filter("metadata->>isp_agent_id", "eq", isp_agent_id)
      .not("metadata->system_prompt", "is", null)
      .order("created_at", { ascending: false }).limit(10);

    const history = (usageHistory || []).map((item: any) => ({
      id: item.id, created_at: item.created_at,
      prompt: item.metadata?.system_prompt || "",
      tokens_total: item.tokens_total || 0,
      tokens_input: item.tokens_input || 0,
      tokens_output: item.tokens_output || 0,
    }));

    return new Response(JSON.stringify({
      prompt, isp_name: ispName,
      agent_name: ispAgent.display_name || template.name,
      template_name: template.name, history,
      metadata: {
        template_id: template.id, template_name: template.name,
        model: template.model || "gpt-4o-mini", temperature: template.temperature || 0.7,
        max_tokens: template.max_tokens || 1000, voice_tone: ispAgent.voice_tone || null,
        security_clauses_count: securityClauses?.length || 0,
        security_clauses: (securityClauses || []).map((c) => c.name),
        knowledge_base_count: knowledgeBase.length, document_count: documentCount || 0,
        states: allStates.map(s => ({
          state_key: s.state_key, objective: s.objective,
          tools: s.allowed_tools, transitions: s.transition_rules.length,
        })),
        tools: availableTools.map((t) => t.handler),
        has_erp: hasActiveErp, erp_provider: erpConfig?.provider || null,
      },
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: unknown) {
    console.error("❌ Error in audit-prompt:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: "Internal error", message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

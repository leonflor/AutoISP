import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { TOOL_CATALOG } from "../_shared/tool-catalog.ts";

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

interface FlowStepRecord {
  name: string;
  instruction: string;
  expected_input: string | null;
  tool_handler: string | null;
  tool_auto_execute: boolean;
  condition_to_advance: string | null;
}

interface AgentFlowRecord {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  trigger_keywords: string[];
  trigger_prompt: string | null;
  is_fixed: boolean;
  steps: FlowStepRecord[];
}

// Exact same buildSystemPrompt as ai-chat
function buildSystemPrompt(
  template: IspAgentWithTemplate["ai_agents"],
  ispAgent: IspAgentWithTemplate,
  securityClauses: { content: string; name: string; applies_to: string }[],
  knowledgeBase: { question: string; answer: string; category: string | null }[],
  ispName: string,
  hasErp: boolean,
  agentFlows: AgentFlowRecord[],
  flowToolHandlers: Set<string>
): string {
  const parts: string[] = [];

  // 1. Base system prompt from template
  if (template.system_prompt) {
    parts.push(template.system_prompt);
  }

  // 2. Voice tone injection
  if (ispAgent.voice_tone) {
    parts.push(`\nAdote o seguinte tom de voz em suas respostas: ${ispAgent.voice_tone}`);
  }

  // 3. Document chunks - skipped in audit (no user query for RAG)

  // 4. Knowledge base Q&A context
  if (knowledgeBase.length > 0) {
    const kbSection = knowledgeBase
      .map((item) => `P: ${item.question}\nR: ${item.answer}`)
      .join("\n\n");
    parts.push(`\n## Perguntas Frequentes\n${kbSection}`);
  }

  // 5. Security clauses
  if (securityClauses.length > 0) {
    const clausesText = securityClauses
      .map((c) => `- ${c.content}`)
      .join("\n");
    parts.push(`\n## REGRAS OBRIGATÓRIAS DE SEGURANÇA\nVocê DEVE seguir estas regras em todas as interações:\n${clausesText}`);
  }

  // 5.5 Tools section
  const availableTools = Object.values(TOOL_CATALOG).filter(
    (t) => flowToolHandlers.has(t.handler) && (!t.requires_erp || hasErp)
  );
  if (availableTools.length > 0) {
    const toolsList = availableTools
      .map((t) => `- ${t.handler}: ${t.description}`)
      .join("\n");
    parts.push(`\n## Ferramentas Disponíveis\nVocê tem acesso às seguintes funções. Use-as quando necessário:\n${toolsList}`);
  }

  // 5.6 Flows section
  if (agentFlows.length > 0) {
    const flowsSections = agentFlows.map((flow) => {
      const typeLabel = flow.is_fixed ? "roteiro fixo" : "guia flexível";
      const triggerLine = flow.trigger_keywords.length > 0
        ? `Ative quando: ${flow.trigger_keywords.join(", ")}`
        : flow.trigger_prompt || "";

      const stepsText = flow.steps.map((step, i) => {
        let line = `${i + 1}. ${step.name.toUpperCase()}\n   Instrução: ${step.instruction}`;
        if (step.tool_handler) {
          const tool = TOOL_CATALOG[step.tool_handler];
          if (tool) line += `\n   Ferramenta: ${tool.display_name}`;
        }
        if (step.expected_input) line += `\n   Input esperado: ${step.expected_input}`;
        if (step.condition_to_advance) line += `\n   Avance quando: ${step.condition_to_advance}`;
        return line;
      }).join("\n\n");

      const instructions = flow.is_fixed
        ? "Siga as etapas na ordem. Não pule etapas."
        : "Use as etapas como guia, adaptando conforme a conversa.";

      return `### Fluxo: ${flow.name} (${typeLabel})\n${triggerLine}\n${instructions}\n\n${stepsText}`;
    }).join("\n\n");

    parts.push(`\n## Fluxos Conversacionais\n\n${flowsSections}`);
  }

  // 6. Context anchoring
  const contextAnchor = `\n## Contexto Atual\n- Provedor: ${ispName}\n- Data: ${new Date().toLocaleDateString("pt-BR")}\n- Agente: ${ispAgent.display_name || template.name}`;
  parts.push(contextAnchor);

  return parts.join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claims.claims.sub as string;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify super_admin role
    const { data: roleCheck } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "super_admin")
      .single();

    if (!roleCheck) {
      return new Response(JSON.stringify({ error: "Forbidden", message: "Apenas super admins podem auditar prompts" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { isp_agent_id } = await req.json();

    if (!isp_agent_id) {
      return new Response(JSON.stringify({ error: "isp_agent_id é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch ISP agent with template
    const { data: ispAgent, error: agentError } = await supabaseAdmin
      .from("isp_agents")
      .select(`
        id, isp_id, agent_id, display_name, voice_tone, is_enabled, additional_prompt, chunk_size,
        ai_agents (id, name, slug, system_prompt, model, temperature, max_tokens, is_active, uses_knowledge_base, scope)
      `)
      .eq("id", isp_agent_id)
      .single() as { data: IspAgentWithTemplate | null; error: unknown };

    if (agentError || !ispAgent) {
      return new Response(JSON.stringify({ error: "Agente não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const template = ispAgent.ai_agents;

    // ISP name
    const { data: isp } = await supabaseAdmin
      .from("isps")
      .select("name")
      .eq("id", ispAgent.isp_id)
      .single();
    const ispName = isp?.name || "ISP";

    // Security clauses
    const { data: securityClauses } = await supabaseAdmin
      .from("ai_security_clauses")
      .select("id, name, content, applies_to")
      .eq("is_active", true)
      .in("applies_to", ["all", "tenant"])
      .order("sort_order");

    // Knowledge base (Q&A only, no RAG since there's no user query)
    let knowledgeBase: { question: string; answer: string; category: string | null }[] = [];
    if (template.uses_knowledge_base) {
      const { data: kbItems } = await supabaseAdmin
        .from("agent_knowledge_base")
        .select("question, answer, category")
        .eq("isp_agent_id", ispAgent.id)
        .eq("is_active", true)
        .order("sort_order");
      knowledgeBase = kbItems || [];
    }

    // Document count (for metadata)
    const { count: documentCount } = await supabaseAdmin
      .from("knowledge_documents")
      .select("id", { count: "exact", head: true })
      .eq("isp_agent_id", ispAgent.id)
      .eq("status", "indexed");

    // ERP config
    let hasActiveErp = false;
    const { data: erpConfig } = await supabaseAdmin
      .from("erp_configs")
      .select("id, provider")
      .eq("isp_id", ispAgent.isp_id)
      .eq("is_active", true)
      .eq("is_connected", true)
      .limit(1)
      .single();
    hasActiveErp = !!erpConfig;

    // Flow links
    const { data: flowLinks } = await supabaseAdmin
      .from("ai_agent_flow_links")
      .select("flow_id")
      .eq("agent_id", template.id)
      .eq("is_active", true);

    const flowIds = (flowLinks || []).map((fl: any) => fl.flow_id);
    let agentFlows: AgentFlowRecord[] = [];

    if (flowIds.length > 0) {
      const { data: flowsData } = await supabaseAdmin
        .from("ai_agent_flows")
        .select("id, name, slug, description, trigger_keywords, trigger_prompt, is_fixed")
        .in("id", flowIds)
        .eq("is_active", true)
        .order("sort_order");

      if (flowsData && flowsData.length > 0) {
        const activeFlowIds = flowsData.map((f: any) => f.id);
        const { data: stepsData } = await supabaseAdmin
          .from("ai_agent_flow_steps")
          .select("flow_id, name, instruction, expected_input, tool_handler, tool_auto_execute, condition_to_advance")
          .in("flow_id", activeFlowIds)
          .eq("is_active", true)
          .order("step_order");

        const stepsMap: Record<string, FlowStepRecord[]> = {};
        for (const s of (stepsData || []) as any[]) {
          if (s.tool_handler && TOOL_CATALOG[s.tool_handler]?.requires_erp && !hasActiveErp) continue;
          if (!stepsMap[s.flow_id]) stepsMap[s.flow_id] = [];
          stepsMap[s.flow_id].push(s);
        }

        agentFlows = (flowsData as any[]).map((f) => ({
          ...f,
          steps: stepsMap[f.id] || [],
        }));
      }
    }

    // Collect tool handlers
    const flowToolHandlers = new Set<string>();
    for (const flow of agentFlows) {
      for (const step of flow.steps) {
        if (step.tool_handler) flowToolHandlers.add(step.tool_handler);
      }
    }

    // Build the prompt
    const prompt = buildSystemPrompt(
      template,
      ispAgent,
      securityClauses || [],
      knowledgeBase,
      ispName,
      hasActiveErp,
      agentFlows,
      flowToolHandlers
    );

    const availableTools = Object.values(TOOL_CATALOG).filter(
      (t) => flowToolHandlers.has(t.handler) && (!t.requires_erp || hasActiveErp)
    );

    return new Response(
      JSON.stringify({
        prompt,
        isp_name: ispName,
        agent_name: ispAgent.display_name || template.name,
        template_name: template.name,
        metadata: {
          template_id: template.id,
          template_name: template.name,
          model: template.model || "gpt-4o-mini",
          temperature: template.temperature || 0.7,
          max_tokens: template.max_tokens || 1000,
          voice_tone: ispAgent.voice_tone || null,
          security_clauses_count: securityClauses?.length || 0,
          security_clauses: (securityClauses || []).map((c) => c.name),
          knowledge_base_count: knowledgeBase.length,
          document_count: documentCount || 0,
          flows: agentFlows.map((f) => ({
            name: f.name,
            slug: f.slug,
            steps_count: f.steps.length,
            is_fixed: f.is_fixed,
          })),
          tools: availableTools.map((t) => t.handler),
          has_erp: hasActiveErp,
          erp_provider: erpConfig?.provider || null,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("❌ Error in audit-prompt:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: "Internal error", message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

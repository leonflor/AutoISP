import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { executeToolHandler, type ToolExecutionContext } from "../_shared/tool-handlers.ts";
import { TOOL_CATALOG, buildOpenAITools } from "../_shared/tool-catalog.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatRequest {
  isp_id: string;
  isp_agent_id: string;
  messages: ChatMessage[];
  stream?: boolean;
}

interface IspAgentWithTemplate {
  id: string;
  isp_id: string;
  agent_id: string;
  display_name: string | null;
  avatar_url: string | null;
  voice_tone: string | null;
  escalation_config: unknown;
  is_enabled: boolean;
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

interface SecurityClause {
  id: string;
  name: string;
  content: string;
  applies_to: string;
}

interface KnowledgeItem {
  question: string;
  answer: string;
  category: string | null;
}

interface DocumentChunk {
  content: string;
  similarity: number;
  document_title?: string;
}

interface SourcesPayload {
  documents: { content: string; similarity: number; document_title?: string }[];
  knowledge: { question: string; category?: string }[];
}

interface OpenAIConfigValue {
  api_key_encrypted?: string;
  encryption_iv?: string;
  default_model?: string;
  masked_key?: string;
  configured?: boolean;
}

// ============= ENCRYPTION HELPERS =============
async function deriveKey(masterKey: string): Promise<CryptoKey> {
  const keyMaterial = new TextEncoder().encode(masterKey);
  const keyData = keyMaterial.slice(0, 32);
  return await crypto.subtle.importKey("raw", keyData, "AES-GCM", false, ["decrypt"]);
}

async function decrypt(ciphertext: string, iv: string, masterKey: string): Promise<string> {
  const key = await deriveKey(masterKey);
  const ivBytes = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
  const ciphertextBytes = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: ivBytes }, key, ciphertextBytes);
  return new TextDecoder().decode(decrypted);
}

// Get OpenAI API key from platform config (encrypted)
async function getOpenAIKey(supabaseAdmin: SupabaseClient): Promise<string> {
  const masterKey = Deno.env.get("ENCRYPTION_KEY");
  if (!masterKey) {
    throw new Error("ENCRYPTION_KEY not configured");
  }

  const { data: config, error } = await supabaseAdmin
    .from("platform_config")
    .select("value")
    .eq("key", "integration_openai")
    .single();

  if (error || !config) {
    console.error("Failed to fetch OpenAI config:", error);
    throw new Error("OpenAI config not found");
  }

  const value = config.value as OpenAIConfigValue;
  
  if (!value?.api_key_encrypted || !value?.encryption_iv) {
    throw new Error("OpenAI not configured. Configure via admin panel.");
  }

  try {
    return await decrypt(value.api_key_encrypted, value.encryption_iv, masterKey);
  } catch (decryptError) {
    console.error("Failed to decrypt OpenAI key:", decryptError);
    throw new Error("Failed to decrypt OpenAI key");
  }
}

// Generate embedding for RAG query using OpenAI API
async function generateQueryEmbedding(query: string, apiKey: string): Promise<number[]> {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: query.slice(0, 2000),
      dimensions: 768
    })
  });
  
  if (!response.ok) {
    console.warn("Failed to generate embedding for RAG");
    return [];
  }
  
  const data = await response.json();
  return data.data[0].embedding;
}

// Interfaces for flows (tools now come from hardcoded catalog)
interface ConditionalRouteRecord {
  condition: string;
  goto_step: number | null;
  label: string;
}

interface FlowStepRecord {
  name: string;
  instruction: string;
  expected_input: string | null;
  tool_handler: string | null;
  tool_auto_execute: boolean;
  condition_to_advance: string | null;
  fallback_instruction: string | null;
  conditional_routes: ConditionalRouteRecord[];
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

// Build the final system prompt with all layers
function buildSystemPrompt(
  template: IspAgentWithTemplate["ai_agents"],
  ispAgent: IspAgentWithTemplate,
  securityClauses: SecurityClause[],
  knowledgeBase: KnowledgeItem[],
  documentChunks: DocumentChunk[],
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

  // 2. Voice tone injection (if configured by ISP)
  if (ispAgent.voice_tone) {
    parts.push(`\nAdote o seguinte tom de voz em suas respostas: ${ispAgent.voice_tone}`);
  }

  // 3. Document chunks context (RAG - higher priority)
  if (documentChunks.length > 0) {
    const chunksSection = documentChunks
      .map((chunk, i) => `[Trecho ${i + 1} - relevância ${(chunk.similarity * 100).toFixed(0)}%]\n${chunk.content}`)
      .join("\n\n");
    
    parts.push(`\n## Documentos Relevantes\nUse estes trechos de documentos para responder:\n\n${chunksSection}`);
  }

  // 4. Knowledge base Q&A context
  if (knowledgeBase.length > 0) {
    const kbSection = knowledgeBase
      .map((item) => `P: ${item.question}\nR: ${item.answer}`)
      .join("\n\n");
    
    parts.push(`\n## Perguntas Frequentes\n${kbSection}`);
  }

  // 5. Security clauses (always injected)
  if (securityClauses.length > 0) {
    const clausesText = securityClauses
      .map((c) => `- ${c.content}`)
      .join("\n");
    
    parts.push(`\n## REGRAS OBRIGATÓRIAS DE SEGURANÇA\nVocê DEVE seguir estas regras em todas as interações:\n${clausesText}`);
  }

  // 5.5 Tools section (only tools referenced by linked flows)
  const availableTools = Object.values(TOOL_CATALOG).filter(t => flowToolHandlers.has(t.handler) && (!t.requires_erp || hasErp));
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
        if (step.fallback_instruction) line += `\n   Fallback: ${step.fallback_instruction}`;
        if (step.conditional_routes && step.conditional_routes.length > 0) {
          const routesLines = step.conditional_routes.map(r => {
            const dest = r.goto_step ? `Vá para etapa ${r.goto_step} (${r.label})` : `Siga para a próxima etapa`;
            return `   - Se ${r.condition} → ${dest}`;
          }).join("\n");
          line += `\n   Rotas:\n${routesLines}`;
        }
        return line;
      }).join("\n\n");

      const hasConditionalRoutes = flow.steps.some(s => s.conditional_routes && s.conditional_routes.length > 0);
      const instructions = flow.is_fixed
        ? hasConditionalRoutes
          ? "Siga as etapas na ordem. Não pule etapas, exceto quando uma rota condicional indicar explicitamente um salto."
          : "Siga as etapas na ordem. Não pule etapas."
        : hasConditionalRoutes
          ? "Use as etapas como guia, adaptando conforme a conversa. As rotas condicionais são sugestões fortes de navegação."
          : "Use as etapas como guia, adaptando conforme a conversa.";

      return `### Fluxo: ${flow.name} (${typeLabel})\n${triggerLine}\n${instructions}\n\n${stepsText}`;
    }).join("\n\n");

    parts.push(`\n## Fluxos Conversacionais\n\n${flowsSections}`);
  }

  // 6. Context anchoring (prevent cross-tenant data leakage)
  const contextAnchor = `\n## Contexto Atual\n- Provedor: ${ispName}\n- Data: ${new Date().toLocaleDateString("pt-BR")}\n- Agente: ${ispAgent.display_name || template.name}`;
  parts.push(contextAnchor);

  return parts.join("\n");
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only accept POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Validate JWT
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Unauthorized", message: "Token não fornecido" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Validate user token
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authError } = await supabaseAuth.auth.getClaims(token);
    
    if (authError || !claims?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", message: "Token inválido" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claims.claims.sub;

    // Parse request body
    const body: ChatRequest = await req.json();
    
    if (!body.isp_id || !body.isp_agent_id || !body.messages?.length) {
      return new Response(
        JSON.stringify({ error: "Validation error", message: "Campos obrigatórios: isp_id, isp_agent_id, messages" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get OpenAI API key from platform_config (encrypted)
    let openAIKey: string;
    try {
      openAIKey = await getOpenAIKey(supabaseAdmin);
    } catch (keyError) {
      console.warn("⚠️ OpenAI API key not configured:", keyError);
      return new Response(
        JSON.stringify({
          error: "SERVICE_NOT_CONFIGURED",
          message: "Integração OpenAI não configurada. Configure a chave da API no painel Admin → Configurações → Integrações.",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user belongs to ISP
    const { data: membership } = await supabaseAdmin
      .from("isp_users")
      .select("role")
      .eq("isp_id", body.isp_id)
      .eq("user_id", userId)
      .eq("is_active", true)
      .single();

    if (!membership) {
      return new Response(
        JSON.stringify({ error: "Forbidden", message: "Usuário não pertence a este ISP" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get ISP agent with template data via JOIN
    const { data: ispAgent, error: agentError } = await supabaseAdmin
      .from("isp_agents")
      .select(`
        id,
        isp_id,
        agent_id,
        display_name,
        avatar_url,
        voice_tone,
        escalation_config,
        is_enabled,
        ai_agents (
          id,
          name,
          slug,
          system_prompt,
          model,
          temperature,
          max_tokens,
          is_active,
          uses_knowledge_base,
          scope
        )
      `)
      .eq("id", body.isp_agent_id)
      .eq("isp_id", body.isp_id)
      .single() as { data: IspAgentWithTemplate | null; error: unknown };

    if (agentError || !ispAgent) {
      return new Response(
        JSON.stringify({ error: "Not found", message: "Agente de IA não encontrado para este ISP" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const template = ispAgent.ai_agents;
    const model = template.model || "gpt-4o-mini";

    // Validate agent is enabled and active
    if (!ispAgent.is_enabled) {
      return new Response(
        JSON.stringify({ error: "Unavailable", message: "Este agente está desativado pelo ISP" }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!template.is_active) {
      return new Response(
        JSON.stringify({ error: "Unavailable", message: "Este template de agente foi desativado pelo administrador" }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get ISP name for context anchoring
    const { data: isp } = await supabaseAdmin
      .from("isps")
      .select("name")
      .eq("id", body.isp_id)
      .single();

    const ispName = isp?.name || "ISP";

    // Fetch active security clauses (applies to 'all' or 'tenant')
    const { data: securityClauses } = await supabaseAdmin
      .from("ai_security_clauses")
      .select("id, name, content, applies_to")
      .eq("is_active", true)
      .in("applies_to", ["all", "tenant"])
      .order("sort_order");

    // Fetch knowledge base if enabled for this agent
    let knowledgeBase: KnowledgeItem[] = [];
    let documentChunks: DocumentChunk[] = [];
    
    if (template.uses_knowledge_base) {
      // Fetch Q&A knowledge base
      const { data: kbItems } = await supabaseAdmin
        .from("agent_knowledge_base")
        .select("question, answer, category")
        .eq("isp_agent_id", ispAgent.id)
        .eq("is_active", true)
        .order("sort_order");
      
      knowledgeBase = kbItems || [];
      
      // RAG: Search document chunks if available
      const lastUserMessage = body.messages.filter(m => m.role === "user").pop();
      if (lastUserMessage) {
        try {
          const queryEmbedding = await generateQueryEmbedding(lastUserMessage.content, openAIKey);
          
          if (queryEmbedding.length > 0) {
            const { data: chunks } = await supabaseAdmin.rpc("match_document_chunks", {
              query_embedding: `[${queryEmbedding.join(",")}]`,
              match_isp_agent_id: ispAgent.id,
              match_threshold: 0.7,
              match_count: 5
            });
            
            if (chunks && chunks.length > 0) {
              documentChunks = chunks.map((c: { content: string; similarity: number; document_title?: string }) => ({
                content: c.content,
                similarity: c.similarity,
                document_title: c.document_title || undefined,
              }));
            }
          }
        } catch (ragError) {
          console.warn("RAG search failed:", ragError);
        }
      }
    }

    // Check AI usage limits
    const { data: subscription } = await supabaseAdmin
      .from("subscriptions")
      .select("plan_id")
      .eq("isp_id", body.isp_id)
      .eq("status", "ativa")
      .single();

    if (subscription) {
      const { data: limits } = await supabaseAdmin
        .from("ai_limits")
        .select("monthly_limit, daily_limit")
        .eq("plan_id", subscription.plan_id)
        .eq("agent_id", template.id)
        .single();

      if (limits?.monthly_limit) {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const { data: usage } = await supabaseAdmin
          .from("ai_usage")
          .select("tokens_total")
          .eq("isp_id", body.isp_id)
          .gte("created_at", `${currentMonth}-01`)
          .lt("created_at", `${currentMonth}-32`);

        const totalTokens = usage?.reduce((sum, u) => sum + (u.tokens_total || 0), 0) || 0;

        if (totalTokens >= limits.monthly_limit) {
          return new Response(
            JSON.stringify({ 
              error: "Limit exceeded", 
              message: `Limite mensal de ${limits.monthly_limit.toLocaleString()} tokens atingido.`,
              usage: { current: totalTokens, limit: limits.monthly_limit }
            }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    // ── Load flows via flow_links + tools from hardcoded catalog ──
    let agentFlows: AgentFlowRecord[] = [];
    let hasActiveErp = false;

    // 1. Get flow links for this agent
    const { data: flowLinks } = await supabaseAdmin
      .from("ai_agent_flow_links")
      .select("flow_id")
      .eq("agent_id", template.id)
      .eq("is_active", true);

    const flowIds = (flowLinks || []).map((fl: any) => fl.flow_id);

    // Check if any tool requires ERP
    const anyToolRequiresErp = Object.values(TOOL_CATALOG).some(t => t.requires_erp);
    if (anyToolRequiresErp) {
      const { data: erpConfig } = await supabaseAdmin
        .from("erp_configs")
        .select("id")
        .eq("isp_id", body.isp_id)
        .eq("is_active", true)
        .eq("is_connected", true)
        .limit(1)
        .single();
      hasActiveErp = !!erpConfig;
    }

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
          // Skip steps with ERP tools if ISP has no ERP
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

    // Collect tool_handlers from active flow steps
    const flowToolHandlers = new Set<string>();
    for (const flow of agentFlows) {
      for (const step of flow.steps) {
        if (step.tool_handler) flowToolHandlers.add(step.tool_handler);
      }
    }

    // Build complete system prompt with all layers (hybrid RAG + tools + flows)
    const systemPrompt = buildSystemPrompt(
      template,
      ispAgent,
      securityClauses || [],
      knowledgeBase,
      documentChunks,
      ispName,
      hasActiveErp,
      agentFlows,
      flowToolHandlers
    );

    // Combine system prompt + user messages into the messages array
    const messages: any[] = [
      { role: "system", content: systemPrompt },
      ...body.messages,
    ];

    // Build OpenAI tools filtered by flow handlers
    const filteredTools = Object.values(TOOL_CATALOG).filter(
      t => flowToolHandlers.has(t.handler) && (!t.requires_erp || hasActiveErp)
    );
    const openaiTools = filteredTools.length > 0
      ? filteredTools.map(t => ({
          type: "function" as const,
          function: { name: t.handler, description: t.description, parameters: t.parameters_schema },
        }))
      : undefined;

    console.log(`🤖 AI Chat: ISP=${ispName}, Agent=${template.name}, KB=${knowledgeBase.length}, Docs=${documentChunks.length}, Tools=${filteredTools.length}/${Object.keys(TOOL_CATALOG).length}, Flows=${agentFlows.length}, FlowHandlers=[${[...flowToolHandlers].join(",")}]`);

    // 🔍 DEBUG: Log system prompt completo (8 camadas)
    console.log(`📋 SYSTEM PROMPT:\n${systemPrompt}`);

    // Tool execution context
    const encryptionKey = Deno.env.get("ENCRYPTION_KEY") || "";
    const toolCtx: ToolExecutionContext = {
      supabaseAdmin,
      ispId: body.isp_id,
      encryptionKey,
    };

    // ── Tool call loop (max 3 iterations) ──
    const MAX_TOOL_ITERATIONS = 3;
    let finalResponse: any = null;

    for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
      const isLastIteration = iteration === MAX_TOOL_ITERATIONS - 1;
      const shouldStream = (body.stream || false) && (iteration === 0 || isLastIteration);

      // 🔍 DEBUG: Log payload completo antes de cada chamada à OpenAI
      console.log(`📤 OpenAI request (iteration ${iteration}): messages=${messages.length}, tools=${openaiTools?.length || 0}`);
      console.log(`📤 Messages dump:\n${JSON.stringify(messages, null, 2)}`);

      const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAIKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: template.temperature || 0.7,
          max_tokens: template.max_tokens || 1000,
          ...(openaiTools ? { tools: openaiTools } : {}),
          // Only stream on the final response (no tool calls expected)
          stream: false, // We'll handle streaming separately after the loop
          ...(false ? { stream_options: { include_usage: true } } : {})
        })
      });

      if (!aiResponse.ok) {
        const errorData = await aiResponse.json();
        console.error("❌ OpenAI API error:", errorData);
        return new Response(
          JSON.stringify({ 
            error: "OpenAI API error", 
            message: errorData.error?.message || "Erro ao processar requisição de IA"
          }),
          { status: aiResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const aiData = await aiResponse.json();
      const choice = aiData.choices?.[0];

      // Check if the model wants to call tools
      if (choice?.message?.tool_calls && choice.message.tool_calls.length > 0 && !isLastIteration) {
        // Add assistant message with tool_calls
        messages.push(choice.message);

        // Execute each tool call
        for (const toolCall of choice.message.tool_calls) {
          const fnName = toolCall.function.name;
          const fnArgs = JSON.parse(toolCall.function.arguments || "{}");

          console.log(`🔧 Tool call: ${fnName}(${JSON.stringify(fnArgs)})`);

          // Tools are now resolved by handler name directly (fnName === handler_type)
          const result = await executeToolHandler(fnName, toolCtx, fnArgs);

          console.log(`🔧 Tool result: ${fnName} -> success=${result.success}`, JSON.stringify(result));

          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          });
        }

        // Continue loop to get next response from model
        continue;
      }

      // No tool calls - this is the final response
      finalResponse = aiData;
      break;
    }

    if (!finalResponse) {
      return new Response(
        JSON.stringify({ error: "Max tool iterations exceeded" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build sources payload
    const sources: SourcesPayload = {
      documents: documentChunks.map(d => ({
        content: d.content.slice(0, 200),
        similarity: d.similarity,
        document_title: d.document_title,
      })),
      knowledge: knowledgeBase.map(k => ({
        question: k.question,
        category: k.category || undefined,
      })),
    };

    // Handle streaming response - re-call OpenAI with stream=true using enriched messages
    // (tool calls were already resolved in the loop above without streaming)
    if (body.stream) {
      // 🔍 DEBUG: Log payload final do streaming
      console.log(`📤 Final streaming request: messages=${messages.length}`);
      console.log(`📤 Final messages dump:\n${JSON.stringify(messages, null, 2)}`);

      const streamResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAIKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: template.temperature || 0.7,
          max_tokens: template.max_tokens || 1000,
          stream: true,
          stream_options: { include_usage: true }
          // No tools here - tool calls already resolved
        })
      });

      if (!streamResponse.ok) {
        const errorData = await streamResponse.json();
        console.error("❌ OpenAI streaming error:", errorData);
        return new Response(
          JSON.stringify({ error: "OpenAI API error", message: errorData.error?.message || "Erro ao processar streaming" }),
          { status: streamResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const openaiBody = streamResponse.body;
      if (!openaiBody) {
        return new Response(JSON.stringify({ error: "No stream body" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const reader = openaiBody.getReader();
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      let totalTokens = 0;
      let promptTokens = 0;
      let completionTokens = 0;

      const stream = new ReadableStream({
        async start(controller) {
          try {
            let buffer = "";
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";

              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith(":")) continue;
                if (!trimmed.startsWith("data: ")) continue;

                const jsonStr = trimmed.slice(6);
                if (jsonStr === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(jsonStr);
                  if (parsed.usage) {
                    totalTokens = parsed.usage.total_tokens || 0;
                    promptTokens = parsed.usage.prompt_tokens || 0;
                    completionTokens = parsed.usage.completion_tokens || 0;
                  }
                } catch { /* partial JSON, just forward */ }

                controller.enqueue(encoder.encode(trimmed + "\n\n"));
              }
            }

            // Send sources + usage event before DONE
            const sourcesEvent = `data: ${JSON.stringify({ sources, usage: { total_tokens: totalTokens, prompt_tokens: promptTokens, completion_tokens: completionTokens } })}\n\n`;
            controller.enqueue(encoder.encode(sourcesEvent));
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();

            // Log usage async
            supabaseAdmin.from("ai_usage").insert({
              isp_id: body.isp_id,
              agent_id: template.id,
              user_id: userId,
              tokens_total: totalTokens,
              tokens_input: promptTokens,
              tokens_output: completionTokens,
              metadata: {
                model,
                isp_agent_id: ispAgent.id,
                system_prompt: systemPrompt,
                knowledge_items: knowledgeBase.length,
                document_chunks: documentChunks.length,
                security_clauses: securityClauses?.length || 0
              }
            }).then(() => {
              console.log(`✅ Streaming usage logged: ${totalTokens} tokens`);
            });
          } catch (err) {
            console.error("Stream error:", err);
            controller.error(err);
          }
        }
      });

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive"
        }
      });
    }

    // Non-streaming response - use finalResponse already parsed in the loop
    const assistantMessage = finalResponse.choices?.[0]?.message?.content || "";
    const tokensUsed = finalResponse.usage?.total_tokens || 0;

    console.log(`✅ AI response generated, tokens: ${tokensUsed}`);

    // Log usage
    await supabaseAdmin.from("ai_usage").insert({
      isp_id: body.isp_id,
      agent_id: template.id,
      user_id: userId,
      tokens_total: tokensUsed,
      tokens_input: finalResponse.usage?.prompt_tokens || 0,
      tokens_output: finalResponse.usage?.completion_tokens || 0,
      metadata: {
        model,
        isp_agent_id: ispAgent.id,
        system_prompt: systemPrompt,
        knowledge_items: knowledgeBase.length,
        security_clauses: securityClauses?.length || 0
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: assistantMessage,
        sources,
        usage: {
          tokens_used: tokensUsed,
          prompt_tokens: finalResponse.usage?.prompt_tokens || 0,
          completion_tokens: finalResponse.usage?.completion_tokens || 0
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("❌ Error in AI chat:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: "Internal error", message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

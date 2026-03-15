import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { executeToolHandler, type ToolExecutionContext } from "../_shared/tool-handlers.ts";
import { TOOL_CATALOG, buildOpenAITools } from "../_shared/tool-catalog.ts";
import {
  getOrCreateSession,
  getCurrentStateDefinition,
  evaluateTransition,
  advanceState,
  completeSession,
  validateToolCall,
  incrementAttempts,
  logAction,
  recordToolExecution,
  getAllStatesForFlow,
  type ConversationSession,
  type StateDefinition,
  type SessionContext,
} from "../_shared/state-machine.ts";

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
  conversation_id?: string;
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

async function getOpenAIKey(supabaseAdmin: SupabaseClient): Promise<string> {
  const masterKey = Deno.env.get("ENCRYPTION_KEY");
  if (!masterKey) throw new Error("ENCRYPTION_KEY not configured");

  const { data: config, error } = await supabaseAdmin
    .from("platform_config")
    .select("value")
    .eq("key", "integration_openai")
    .single();

  if (error || !config) throw new Error("OpenAI config not found");

  const value = config.value as OpenAIConfigValue;
  if (!value?.api_key_encrypted || !value?.encryption_iv) {
    throw new Error("OpenAI not configured. Configure via admin panel.");
  }

  try {
    return await decrypt(value.api_key_encrypted, value.encryption_iv, masterKey);
  } catch {
    throw new Error("Failed to decrypt OpenAI key");
  }
}

async function generateQueryEmbedding(query: string, apiKey: string): Promise<number[]> {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "text-embedding-3-small", input: query.slice(0, 2000), dimensions: 768 }),
  });
  if (!response.ok) { console.warn("Failed to generate embedding for RAG"); return []; }
  const data = await response.json();
  return data.data[0].embedding;
}

// ============= SYSTEM PROMPT BUILDER (State Machine version) =============

function buildSystemPrompt(
  template: IspAgentWithTemplate["ai_agents"],
  ispAgent: IspAgentWithTemplate,
  securityClauses: SecurityClause[],
  knowledgeBase: KnowledgeItem[],
  documentChunks: DocumentChunk[],
  ispName: string,
  hasErp: boolean,
  currentState: StateDefinition | null,
  allStates: StateDefinition[],
  session: ConversationSession | null,
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

  // 3. Document chunks context (RAG)
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

  // 5. Security clauses
  if (securityClauses.length > 0) {
    const clausesText = securityClauses.map((c) => `- ${c.content}`).join("\n");
    parts.push(`\n## REGRAS OBRIGATÓRIAS DE SEGURANÇA\nVocê DEVE seguir estas regras em todas as interações:\n${clausesText}`);
  }

  // 6. State Machine — current state objective & tools
  if (currentState) {
    const allowedToolsDefs = currentState.allowed_tools
      .map(h => TOOL_CATALOG[h])
      .filter(Boolean)
      .filter(t => !t.requires_erp || hasErp);

    parts.push(`\n## ESTADO ATUAL: ${currentState.state_key.toUpperCase()}`);
    parts.push(`Objetivo: ${currentState.objective}`);

    if (currentState.fallback_message) {
      parts.push(`Se não conseguir cumprir o objetivo, responda: "${currentState.fallback_message}"`);
    }

    if (allowedToolsDefs.length > 0) {
      const toolsList = allowedToolsDefs.map(t => `- ${t.handler}: ${t.description}`).join("\n");
      parts.push(`\nFerramentas disponíveis neste estado:\n${toolsList}`);
    }

    // Show flow overview (all states) for context
    if (allStates.length > 1) {
      const overview = allStates.map((s, i) => {
        const marker = s.state_key === currentState.state_key ? "→" : " ";
        return `${marker} ${i + 1}. ${s.state_key}: ${s.objective.slice(0, 80)}`;
      }).join("\n");
      parts.push(`\nVisão geral do fluxo (você está no estado marcado com →):\n${overview}`);
    }

    // Context from session
    if (session?.context) {
      const { executed_tools, action_log, ...userContext } = session.context;
      const contextEntries = Object.entries(userContext).filter(([_, v]) => v !== null && v !== undefined);
      if (contextEntries.length > 0) {
        const contextText = contextEntries.map(([k, v]) => `- ${k}: ${JSON.stringify(v)}`).join("\n");
        parts.push(`\nContexto coletado:\n${contextText}`);
      }
    }

    // Behavioral constraints
    parts.push(`\n## REGRAS DE COMPORTAMENTO`);
    parts.push(`- Execute APENAS o objetivo do estado atual`);
    parts.push(`- NÃO invente dados — use apenas informações do contexto e ferramentas`);
    parts.push(`- NÃO pule estados ou execute ações de outros estados`);
    parts.push(`- Use APENAS as ferramentas listadas acima (se houver)`);
  } else if (allStates.length === 0) {
    // No flow configured — free-form mode with all available tools
    const availableTools = Object.values(TOOL_CATALOG).filter(t => !t.requires_erp || hasErp);
    if (availableTools.length > 0) {
      const toolsList = availableTools.map(t => `- ${t.handler}: ${t.description}`).join("\n");
      parts.push(`\n## Ferramentas Disponíveis\n${toolsList}`);
    }
  }

  // 7. Context anchoring
  parts.push(`\n## Contexto Atual\n- Provedor: ${ispName}\n- Data: ${new Date().toLocaleDateString("pt-BR")}\n- Agente: ${ispAgent.display_name || template.name}`);

  return parts.join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized", message: "Token não fornecido" }), {
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
      return new Response(JSON.stringify({ error: "Unauthorized", message: "Token inválido" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claims.claims.sub;

    const body: ChatRequest = await req.json();

    if (!body.isp_id || !body.isp_agent_id || !body.messages?.length) {
      return new Response(JSON.stringify({ error: "Validation error", message: "Campos obrigatórios: isp_id, isp_agent_id, messages" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get OpenAI API key
    let openAIKey: string;
    try {
      openAIKey = await getOpenAIKey(supabaseAdmin);
    } catch (keyError) {
      console.warn("⚠️ OpenAI API key not configured:", keyError);
      return new Response(JSON.stringify({
        error: "SERVICE_NOT_CONFIGURED",
        message: "Integração OpenAI não configurada. Configure a chave da API no painel Admin → Configurações → Integrações.",
      }), { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
      return new Response(JSON.stringify({ error: "Forbidden", message: "Usuário não pertence a este ISP" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get ISP agent with template
    const { data: ispAgent, error: agentError } = await supabaseAdmin
      .from("isp_agents")
      .select(`
        id, isp_id, agent_id, display_name, avatar_url, voice_tone, escalation_config, is_enabled,
        ai_agents (id, name, slug, system_prompt, model, temperature, max_tokens, is_active, uses_knowledge_base, scope)
      `)
      .eq("id", body.isp_agent_id)
      .eq("isp_id", body.isp_id)
      .single() as { data: IspAgentWithTemplate | null; error: unknown };

    if (agentError || !ispAgent) {
      return new Response(JSON.stringify({ error: "Not found", message: "Agente de IA não encontrado para este ISP" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const template = ispAgent.ai_agents;
    const model = template.model || "gpt-4o-mini";

    if (!ispAgent.is_enabled) {
      return new Response(JSON.stringify({ error: "Unavailable", message: "Este agente está desativado pelo ISP" }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!template.is_active) {
      return new Response(JSON.stringify({ error: "Unavailable", message: "Este template de agente foi desativado pelo administrador" }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ISP name
    const { data: isp } = await supabaseAdmin.from("isps").select("name").eq("id", body.isp_id).single();
    const ispName = isp?.name || "ISP";

    // Security clauses
    const { data: securityClauses } = await supabaseAdmin
      .from("ai_security_clauses")
      .select("id, name, content, applies_to")
      .eq("is_active", true)
      .in("applies_to", ["all", "tenant"])
      .order("sort_order");

    // Knowledge base & RAG
    let knowledgeBase: KnowledgeItem[] = [];
    let documentChunks: DocumentChunk[] = [];

    if (template.uses_knowledge_base) {
      const { data: kbItems } = await supabaseAdmin
        .from("agent_knowledge_base")
        .select("question, answer, category")
        .eq("isp_agent_id", ispAgent.id)
        .eq("is_active", true)
        .order("sort_order");
      knowledgeBase = kbItems || [];

      const lastUserMessage = body.messages.filter(m => m.role === "user").pop();
      if (lastUserMessage) {
        try {
          const queryEmbedding = await generateQueryEmbedding(lastUserMessage.content, openAIKey);
          if (queryEmbedding.length > 0) {
            const { data: chunks } = await supabaseAdmin.rpc("match_document_chunks", {
              query_embedding: `[${queryEmbedding.join(",")}]`,
              match_isp_agent_id: ispAgent.id,
              match_threshold: 0.7,
              match_count: 5,
            });
            if (chunks?.length > 0) {
              documentChunks = chunks.map((c: any) => ({
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

    // AI usage limits
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
          return new Response(JSON.stringify({
            error: "Limit exceeded",
            message: `Limite mensal de ${limits.monthly_limit.toLocaleString()} tokens atingido.`,
            usage: { current: totalTokens, limit: limits.monthly_limit },
          }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }
    }

    // ── State Machine: get or create session ──
    let session: ConversationSession | null = null;
    let currentState: StateDefinition | null = null;
    let allStates: StateDefinition[] = [];
    let hasActiveErp = false;

    // Check ERP
    const { data: erpConfig } = await supabaseAdmin
      .from("erp_configs")
      .select("id")
      .eq("isp_id", body.isp_id)
      .eq("is_active", true)
      .eq("is_connected", true)
      .limit(1)
      .single();
    hasActiveErp = !!erpConfig;

    try {
      session = await getOrCreateSession(
        supabaseAdmin, body.isp_id, body.isp_agent_id, userId as string, template.id, body.conversation_id,
      );

      if (session.flow_id) {
        currentState = await getCurrentStateDefinition(supabaseAdmin, session.flow_id, session.current_state);
        allStates = await getAllStatesForFlow(supabaseAdmin, session.flow_id);
      }
    } catch (sessionError) {
      console.warn("Session creation failed, proceeding without state machine:", sessionError);
    }

    // Check max_attempts
    if (session && currentState && session.attempts >= currentState.max_attempts) {
      const fallback = currentState.fallback_message || "Desculpe, não consegui avançar. Vou encaminhar para um atendente humano.";
      await completeSession(supabaseAdmin, session.id, "escalated");
      return new Response(JSON.stringify({
        success: true,
        message: fallback,
        conversation_id: session.id,
        state: "escalated",
        sources: { documents: [], knowledge: [] },
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Determine allowed tools for current state
    let allowedToolHandlers: Set<string>;
    if (currentState && currentState.allowed_tools.length > 0) {
      allowedToolHandlers = new Set(currentState.allowed_tools);
    } else if (allStates.length > 0) {
      // In a flow but no tools for this state
      allowedToolHandlers = new Set<string>();
    } else {
      // No flow — allow all tools from linked flows (backward compat for agents without states)
      const { data: flowLinks } = await supabaseAdmin
        .from("ai_agent_flow_links")
        .select("flow_id")
        .eq("agent_id", template.id)
        .eq("is_active", true);
      const flowIds = (flowLinks || []).map((fl: any) => fl.flow_id);

      if (flowIds.length > 0) {
        const { data: statesDefs } = await supabaseAdmin
          .from("flow_state_definitions")
          .select("allowed_tools")
          .in("flow_id", flowIds)
          .eq("is_active", true);
        const allTools = new Set<string>();
        for (const s of statesDefs || []) {
          for (const t of (s.allowed_tools || [])) allTools.add(t);
        }
        allowedToolHandlers = allTools;
      } else {
        allowedToolHandlers = new Set<string>();
      }
    }

    // Build system prompt
    const systemPrompt = buildSystemPrompt(
      template, ispAgent, securityClauses || [], knowledgeBase, documentChunks,
      ispName, hasActiveErp, currentState, allStates, session,
    );

    const messages: any[] = [
      { role: "system", content: systemPrompt },
      ...body.messages,
    ];

    // Build OpenAI tools filtered by state's allowed_tools
    const filteredTools = Object.values(TOOL_CATALOG).filter(
      t => allowedToolHandlers.has(t.handler) && (!t.requires_erp || hasActiveErp),
    );
    const openaiTools = filteredTools.length > 0
      ? filteredTools.map(t => ({
          type: "function" as const,
          function: { name: t.handler, description: t.description, parameters: t.parameters_schema },
        }))
      : undefined;

    console.log(`🤖 AI Chat: ISP=${ispName}, Agent=${template.name}, State=${currentState?.state_key || "free"}, KB=${knowledgeBase.length}, Docs=${documentChunks.length}, Tools=${filteredTools.length}, Session=${session?.id || "none"}`);

    // Tool execution context
    const encryptionKey = Deno.env.get("ENCRYPTION_KEY") || "";
    const toolCtx: ToolExecutionContext = { supabaseAdmin, ispId: body.isp_id, encryptionKey };

    // ── Tool call loop (max 3 iterations) ──
    const MAX_TOOL_ITERATIONS = 3;
    let finalResponse: any = null;
    let sessionContext = session?.context || {};

    for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
      const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${openAIKey}` },
        body: JSON.stringify({
          model, messages,
          temperature: template.temperature || 0.7,
          max_tokens: template.max_tokens || 1000,
          ...(openaiTools ? { tools: openaiTools } : {}),
          stream: false,
        }),
      });

      if (!aiResponse.ok) {
        const errorData = await aiResponse.json();
        console.error("❌ OpenAI API error:", errorData);
        return new Response(JSON.stringify({
          error: "OpenAI API error",
          message: errorData.error?.message || "Erro ao processar requisição de IA",
        }), { status: aiResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const aiData = await aiResponse.json();
      const choice = aiData.choices?.[0];

      if (choice?.message?.tool_calls?.length > 0 && iteration < MAX_TOOL_ITERATIONS - 1) {
        messages.push(choice.message);

        for (const toolCall of choice.message.tool_calls) {
          const fnName = toolCall.function.name;
          const fnArgs = JSON.parse(toolCall.function.arguments || "{}");

          console.log(`🔧 Tool call: ${fnName}(${JSON.stringify(fnArgs)})`);

          // ── Tool Guardrail: validate before execution ──
          const validation = validateToolCall(
            fnName,
            currentState?.allowed_tools || [],
            (sessionContext as SessionContext).executed_tools || [],
            hasActiveErp,
          );

          let result;
          if (!validation.valid) {
            console.warn(`🚫 Tool blocked: ${validation.reason}`);
            result = { success: false, error: validation.reason };
            sessionContext = logAction(sessionContext as SessionContext, "tool_blocked", currentState?.state_key || "free", fnName, validation.reason);
          } else {
            result = await executeToolHandler(fnName, toolCtx, fnArgs);
            console.log(`🔧 Tool result: ${fnName} -> success=${result.success}`);

            // Record execution
            sessionContext = recordToolExecution(sessionContext as SessionContext, fnName, currentState?.state_key || "free", result.success);
            sessionContext = logAction(sessionContext as SessionContext, "tool_executed", currentState?.state_key || "free", fnName, result.success ? "success" : "error");

            // Evaluate transition after successful tool call
            if (result.success && currentState && session) {
              const nextState = evaluateTransition(currentState.transition_rules, {
                type: "tool_success",
                tool_name: fnName,
              });

              if (nextState) {
                const targetDef = allStates.find(s => s.state_key === nextState);
                if (targetDef) {
                  // Store tool result in context
                  (sessionContext as any)[`${fnName}_result`] = result.data;
                  await advanceState(supabaseAdmin, session.id, nextState, targetDef.step_order, sessionContext as SessionContext);
                  session.current_state = nextState;
                  session.step = targetDef.step_order;
                  session.context = sessionContext as SessionContext;
                  currentState = targetDef;
                }
              }
            }
          }

          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          });
        }

        continue;
      }

      finalResponse = aiData;
      break;
    }

    if (!finalResponse) {
      return new Response(JSON.stringify({ error: "Max tool iterations exceeded" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Increment attempts for current state
    if (session && currentState) {
      await incrementAttempts(supabaseAdmin, session.id, session.attempts, sessionContext as SessionContext);
    }

    // Evaluate user_input transition
    const lastUserMsg = body.messages.filter(m => m.role === "user").pop();
    if (lastUserMsg && currentState && session) {
      const nextState = evaluateTransition(currentState.transition_rules, {
        type: "user_input",
        user_message: lastUserMsg.content,
      });
      if (nextState) {
        const targetDef = allStates.find(s => s.state_key === nextState);
        if (targetDef) {
          await advanceState(supabaseAdmin, session.id, nextState, targetDef.step_order, sessionContext as SessionContext);
          session.current_state = nextState;
        }
      }
    }

    // Build sources payload
    const sources: SourcesPayload = {
      documents: documentChunks.map(d => ({ content: d.content.slice(0, 200), similarity: d.similarity, document_title: d.document_title })),
      knowledge: knowledgeBase.map(k => ({ question: k.question, category: k.category || undefined })),
    };

    // Handle streaming
    if (body.stream) {
      const streamResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${openAIKey}` },
        body: JSON.stringify({
          model, messages,
          temperature: template.temperature || 0.7,
          max_tokens: template.max_tokens || 1000,
          stream: true,
          stream_options: { include_usage: true },
        }),
      });

      if (!streamResponse.ok) {
        const errorData = await streamResponse.json();
        return new Response(JSON.stringify({ error: "OpenAI API error", message: errorData.error?.message || "Erro ao processar streaming" }), {
          status: streamResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const openaiBody = streamResponse.body;
      if (!openaiBody) {
        return new Response(JSON.stringify({ error: "No stream body" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
                } catch { /* partial JSON */ }

                controller.enqueue(encoder.encode(trimmed + "\n\n"));
              }
            }

            // Send sources + usage + state event
            const sourcesEvent = `data: ${JSON.stringify({
              sources,
              usage: { total_tokens: totalTokens, prompt_tokens: promptTokens, completion_tokens: completionTokens },
              conversation_id: session?.id,
              state: session?.current_state,
            })}\n\n`;
            controller.enqueue(encoder.encode(sourcesEvent));
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();

            // Log usage
            supabaseAdmin.from("ai_usage").insert({
              isp_id: body.isp_id,
              agent_id: template.id,
              user_id: userId,
              tokens_total: totalTokens,
              tokens_input: promptTokens,
              tokens_output: completionTokens,
              metadata: {
                model, isp_agent_id: ispAgent.id, system_prompt: systemPrompt,
                knowledge_items: knowledgeBase.length, document_chunks: documentChunks.length,
                security_clauses: securityClauses?.length || 0,
                state: session?.current_state, session_id: session?.id,
              },
            }).then(() => console.log(`✅ Streaming usage logged: ${totalTokens} tokens`));
          } catch (err) {
            console.error("Stream error:", err);
            controller.error(err);
          }
        },
      });

      return new Response(stream, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" },
      });
    }

    // Non-streaming response
    const assistantMessage = finalResponse.choices?.[0]?.message?.content || "";
    const tokensUsed = finalResponse.usage?.total_tokens || 0;

    await supabaseAdmin.from("ai_usage").insert({
      isp_id: body.isp_id,
      agent_id: template.id,
      user_id: userId,
      tokens_total: tokensUsed,
      tokens_input: finalResponse.usage?.prompt_tokens || 0,
      tokens_output: finalResponse.usage?.completion_tokens || 0,
      metadata: {
        model, isp_agent_id: ispAgent.id, system_prompt: systemPrompt,
        knowledge_items: knowledgeBase.length, security_clauses: securityClauses?.length || 0,
        state: session?.current_state, session_id: session?.id,
      },
    });

    return new Response(JSON.stringify({
      success: true, message: assistantMessage, sources,
      conversation_id: session?.id,
      state: session?.current_state,
      usage: {
        tokens_used: tokensUsed,
        prompt_tokens: finalResponse.usage?.prompt_tokens || 0,
        completion_tokens: finalResponse.usage?.completion_tokens || 0,
      },
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error: unknown) {
    console.error("❌ Error in AI chat:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: "Internal error", message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

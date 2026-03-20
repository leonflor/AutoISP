/**
 * Context Builder — mounts the full runtime state for the AI engine.
 *
 * buildRuntimeContext(supabaseAdmin, conversationId) → RuntimeContext
 * buildSystemPrompt(context) → system prompt string
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decrypt } from "./crypto.ts";

// ─── Types ───────────────────────────────────────────────────────────

export interface ProcedureStep {
  instruction: string;
  available_functions?: string[];
  advance_condition?: string;
  stuck_after_turns?: number;
  on_complete?: Record<string, unknown>;
}

export interface ProcedureDefinition {
  triggers?: { keywords?: string[]; min_confidence?: number };
  steps: ProcedureStep[];
}

export interface RuntimeContext {
  conversation: Record<string, unknown>;
  tenantAgent: Record<string, unknown>;
  template: Record<string, unknown>;
  procedure: Record<string, unknown> | null;
  currentStep: ProcedureStep | null;
  messages: Array<Record<string, unknown>>;
  erpConfig: Record<string, unknown> | null;
  ragChunks: Array<{ content: string; title: string | null; similarity: number }>;
  ispName: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────

export async function getOpenAIKey(
  supabaseAdmin: SupabaseClient
): Promise<string | null> {
  const masterKey = Deno.env.get("ENCRYPTION_KEY");
  if (!masterKey || masterKey.length < 32) return null;

  const { data } = await supabaseAdmin
    .from("platform_config")
    .select("value")
    .eq("key", "integration_openai")
    .maybeSingle();

  if (!data?.value) return null;

  const cfg = data.value as Record<string, unknown>;
  if (
    !cfg.configured ||
    !cfg.api_key_encrypted ||
    !cfg.encryption_iv
  )
    return null;

  try {
    return await decrypt(
      cfg.api_key_encrypted as string,
      cfg.encryption_iv as string,
      masterKey
    );
  } catch (err) {
    console.warn("[context-builder] Failed to decrypt OpenAI key:", err);
    return null;
  }
}

async function generateEmbedding(
  text: string,
  apiKey: string
): Promise<number[] | null> {
  try {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text.slice(0, 8000),
      }),
    });

    if (!res.ok) {
      console.warn("[context-builder] Embedding API error:", res.status);
      return null;
    }

    const json = await res.json();
    return json.data?.[0]?.embedding ?? null;
  } catch (err) {
    console.warn("[context-builder] Embedding request failed:", err);
    return null;
  }
}

// ─── Main Functions ──────────────────────────────────────────────────

export async function buildRuntimeContext(
  supabaseAdmin: SupabaseClient,
  conversationId: string
): Promise<RuntimeContext> {
  const t0 = performance.now();

  // 1. Conversation + tenant_agent + template + ISP name
  const { data: conversation, error: convError } = await supabaseAdmin
    .from("conversations")
    .select(
      `
      *,
      tenant_agents!inner (
        *,
        agent_templates!inner ( * )
      ),
      isps!inner ( name )
    `
    )
    .eq("id", conversationId)
    .single();

  if (convError || !conversation) {
    throw new Error(
      `Conversation ${conversationId} not found: ${convError?.message}`
    );
  }

  const tenantAgent = conversation.tenant_agents as Record<string, unknown>;
  const template = tenantAgent.agent_templates as Record<string, unknown>;
  const ispName = (conversation.isps as Record<string, unknown>)?.name as string ?? "ISP";

  // 2. Last 20 messages (ASC)
  const { data: messages } = await supabaseAdmin
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(20);

  // 3. Active procedure (if any)
  let procedure: Record<string, unknown> | null = null;
  let currentStep: ProcedureStep | null = null;

  if (conversation.active_procedure_id) {
    const { data: proc } = await supabaseAdmin
      .from("procedures")
      .select("*")
      .eq("id", conversation.active_procedure_id)
      .maybeSingle();

    if (proc) {
      procedure = proc;
      const def = proc.definition as ProcedureDefinition;
      const stepIndex = (conversation.step_index as number) ?? 0;
      currentStep = def?.steps?.[stepIndex] ?? null;
    }
  }

  // 4. ERP config
  const { data: erpConfig } = await supabaseAdmin
    .from("erp_configs")
    .select("*")
    .eq("isp_id", conversation.isp_id)
    .eq("is_active", true)
    .maybeSingle();

  // 5. RAG — optional, fails silently
  let ragChunks: RuntimeContext["ragChunks"] = [];

  const lastUserMsg = (messages ?? [])
    .filter((m: Record<string, unknown>) => m.role === "user")
    .pop();

  if (lastUserMsg?.content) {
    const openaiKey = await getOpenAIKey(supabaseAdmin);

    if (openaiKey) {
      const embedding = await generateEmbedding(
        lastUserMsg.content as string,
        openaiKey
      );

      if (embedding) {
        const tenantAgentId = tenantAgent.id as string;
        const { data: chunks } = await supabaseAdmin.rpc("match_knowledge", {
          query_embedding: embedding,
          p_tenant_agent_id: tenantAgentId,
          match_threshold: 0.78,
          match_count: 5,
        });

        if (chunks && Array.isArray(chunks)) {
          ragChunks = chunks;
        }
      }
    }
  }

  const elapsed = Math.round(performance.now() - t0);
  console.log(
    `[context-builder] Built context for ${conversationId} in ${elapsed}ms — ` +
      `msgs=${messages?.length ?? 0} rag=${ragChunks.length} proc=${procedure ? "yes" : "no"}`
  );

  // Clean nested joins from conversation object
  const { tenant_agents: _ta, isps: _isp, ...conversationClean } = conversation;

  return {
    conversation: conversationClean,
    tenantAgent,
    template,
    procedure,
    currentStep,
    messages: messages ?? [],
    erpConfig,
    ragChunks,
    ispName,
  };
}

export function buildSystemPrompt(context: RuntimeContext): string {
  const { template, tenantAgent, procedure, currentStep, ragChunks, conversation } =
    context;

  const agentName =
    (tenantAgent.custom_name as string) ||
    (template.default_name as string) ||
    "Assistente";

  // 1. Base prompt
  let prompt = ((template.system_prompt_base as string) ?? "").replace(
    /\{agent_name\}/g,
    agentName
  );

  // 2. Active procedure + current step
  if (procedure && currentStep) {
    const procName = procedure.name as string;
    prompt += `\n\n## Procedimento ativo: ${procName}\n${currentStep.instruction}`;

    if (currentStep.available_functions?.length) {
      prompt += `\n\nFerramentas disponíveis neste passo: ${currentStep.available_functions.join(", ")}`;
    }
  }

  // 3. RAG chunks
  if (ragChunks.length > 0) {
    const chunksText = ragChunks
      .map((c) => {
        const header = c.title ? `**${c.title}**\n` : "";
        return `${header}${c.content}`;
      })
      .join("\n---\n");

    prompt += `\n\n## Base de conhecimento relevante:\n${chunksText}`;
  }

  // 4. Collected context
  const collected = conversation.collected_context as Record<string, unknown> | null;
  if (collected && Object.keys(collected).length > 0) {
    prompt += `\n\n## Dados coletados nesta conversa:\n${JSON.stringify(collected, null, 2)}`;
  }

  // 5. Current date/time in BRT
  const now = new Date();
  const brt = now.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  prompt += `\n\n## Data/hora atual: ${brt}`;

  // 6. ISP name anchoring
  prompt += `\n## Provedor: ${context.ispName}`;

  return prompt;
}

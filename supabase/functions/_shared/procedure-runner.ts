/**
 * Procedure Runner — executes procedure steps, handles tool calls,
 * evaluates advance conditions, and resolves step outcomes.
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  buildRuntimeContext,
  buildSystemPrompt,
  getOpenAIKey,
  RuntimeContext,
  ProcedureStep,
  ProcedureDefinition,
} from "./context-builder.ts";
import { TOOL_CATALOG } from "./tool-catalog.ts";
import {
  executeToolHandler,
  ToolExecutionContext,
} from "./tool-handlers.ts";

// ─── Types ───────────────────────────────────────────────────────────

interface OpenAIMessage {
  role: string;
  content?: string | null;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }>;
  tool_call_id?: string;
  name?: string;
}

interface RunResult {
  reply: string;
  debug: Record<string, unknown>;
}

const MAX_TOOL_ITERATIONS = 5;

// ─── OpenAI caller ──────────────────────────────────────────────────

async function callOpenAI(
  apiKey: string,
  model: string,
  temperature: number,
  systemPrompt: string,
  messages: OpenAIMessage[],
  tools?: unknown[],
): Promise<Record<string, unknown>> {
  const body: Record<string, unknown> = {
    model,
    temperature,
    messages: [{ role: "system", content: systemPrompt }, ...messages],
  };
  if (tools && tools.length > 0) {
    body.tools = tools;
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${text}`);
  }

  return await res.json();
}

async function callOpenAIMini(
  apiKey: string,
  prompt: string,
): Promise<string> {
  const res = await callOpenAI(apiKey, "gpt-4o-mini", 0, prompt, [
    { role: "user", content: prompt },
  ]);
  const choices = res.choices as Array<{ message: { content: string } }>;
  return choices?.[0]?.message?.content ?? "";
}

// ─── Format messages for OpenAI ─────────────────────────────────────

function formatMessagesForOpenAI(
  messages: Array<Record<string, unknown>>,
): OpenAIMessage[] {
  return messages.map((m) => {
    const hasToolCalls = Array.isArray(m.tool_calls) && (m.tool_calls as unknown[]).length > 0;
    const msg: OpenAIMessage = {
      role: m.role as string,
      content: hasToolCalls ? null : (m.content as string | null),
    };
    if (m.tool_call_id) {
      msg.tool_call_id = m.tool_call_id as string;
      msg.name = m.tool_name as string;
    }
    if (m.tool_calls) {
      msg.tool_calls = m.tool_calls as OpenAIMessage["tool_calls"];
    }
    return msg;
  });
}

// ─── Build filtered tools for a step ────────────────────────────────

function buildStepTools(
  step: ProcedureStep | null,
  hasErp: boolean,
  hasProcedure: boolean,
): unknown[] | undefined {
  // Only include transfer_to_human when:
  // - No procedure is active (free conversation), OR
  // - The step explicitly lists it in available_functions
  const shouldIncludeTransfer =
    !hasProcedure || (step?.available_functions?.includes("transfer_to_human") ?? false);

  const transferTool = TOOL_CATALOG["transfer_to_human"];
  const alwaysAvailable =
    shouldIncludeTransfer && transferTool
      ? [
          {
            type: "function" as const,
            function: {
              name: transferTool.handler,
              description: transferTool.description,
              parameters: transferTool.parameters_schema,
            },
          },
        ]
      : [];

  if (!step?.available_functions?.length) {
    // No procedure step — only transfer_to_human (if allowed)
    return alwaysAvailable.length > 0 ? alwaysAvailable : undefined;
  }

  const stepTools = step.available_functions
    .filter((name) => {
      if (name === "transfer_to_human") return false; // already handled above
      const tool = TOOL_CATALOG[name];
      return tool && (!tool.requires_erp || hasErp);
    })
    .map((name) => {
      const t = TOOL_CATALOG[name];
      return {
        type: "function" as const,
        function: {
          name: t.handler,
          description: t.description,
          parameters: t.parameters_schema,
        },
      };
    });

  const allTools = [...alwaysAvailable, ...stepTools];
  return allTools.length > 0 ? allTools : undefined;
}

// ─── Main: runProcedureStep ─────────────────────────────────────────

export async function runProcedureStep(
  supabaseAdmin: SupabaseClient,
  conversationId: string,
  userMessage: string,
  _depth = 0,
): Promise<RunResult> {
  const t0 = performance.now();

  // 1. Build context
  let context = await buildRuntimeContext(supabaseAdmin, conversationId);

  // 2. Get OpenAI key
  const openaiKey = await getOpenAIKey(supabaseAdmin);
  if (!openaiKey) {
    throw new Error("OpenAI key not configured or failed to decrypt");
  }

  // 3. Detect procedure if none active
  const templateId = context.template.id as string;
  if (!context.procedure) {
    // Get last bot message for context-aware detection
    const lastBotMsg = [...(context.messages || [])]
      .reverse()
      .find((m: Record<string, unknown>) => m.role === "assistant")?.content as string | undefined;

    const detected = await detectProcedure(
      supabaseAdmin,
      userMessage,
      templateId,
      lastBotMsg,
    );
    if (detected) {
      await supabaseAdmin
        .from("conversations")
        .update({
          active_procedure_id: detected.id,
          step_index: 0,
          turns_on_current_step: 0,
        })
        .eq("id", conversationId);

      // Re-build context with the activated procedure
      context = await buildRuntimeContext(supabaseAdmin, conversationId);
    }
  }

  // 3b. Handle pending_handover confirmation
  if (context.conversation.mode === "pending_handover") {
    const msgLower = userMessage.trim().toLowerCase();
    const confirmWords = ["sim", "yes", "quero", "pode", "ok", "por favor", "transfira", "atendente"];
    const denyWords = ["não", "nao", "no", "nope", "continuar", "bot", "continua"];

    const isConfirm = confirmWords.some((w) => msgLower.includes(w));
    const isDeny = denyWords.some((w) => msgLower.includes(w));

    if (isConfirm && !isDeny) {
      // User confirmed handover
      await supabaseAdmin
        .from("conversations")
        .update({
          mode: "human",
          handover_at: new Date().toISOString(),
        })
        .eq("id", conversationId);

      await supabaseAdmin.from("messages").insert({
        conversation_id: conversationId,
        role: "user",
        content: userMessage,
      });

      const transferMsg = "Entendido! Vou transferir você para um atendente humano. Aguarde um momento, por favor.";
      await supabaseAdmin.from("messages").insert({
        conversation_id: conversationId,
        role: "assistant",
        content: transferMsg,
      });

      return {
        reply: transferMsg,
        debug: { action: "handover_confirmed", elapsed_ms: Math.round(performance.now() - t0) },
      };
    } else {
      // User denied handover — reset and continue
      await supabaseAdmin
        .from("conversations")
        .update({
          mode: "bot",
          handover_reason: null,
          turns_on_current_step: 0,
        })
        .eq("id", conversationId);

      context = await buildRuntimeContext(supabaseAdmin, conversationId);
    }
  }

  await resolveContractSelectionFromMessage(supabaseAdmin, conversationId, userMessage);
  await resolveInvoiceSelectionFromMessage(supabaseAdmin, conversationId, userMessage);
  await resolvePaymentMethodFromMessage(supabaseAdmin, conversationId, userMessage);

  // 4b. Save user message
  await supabaseAdmin.from("messages").insert({
    conversation_id: conversationId,
    role: "user",
    content: userMessage,
  });

  // 4c. Re-build context if contract was resolved (so system prompt reflects it)
  context = await buildRuntimeContext(supabaseAdmin, conversationId);

  let step = context.currentStep;
  const hasErp = !!context.erpConfig;
  const temperature = (context.template.temperature as number) ?? 0.4;

  // 5. Build system prompt + message history + tools
  const systemPrompt = buildSystemPrompt(context);
  const historyMessages = formatMessagesForOpenAI(context.messages);
  const tools = buildStepTools(step, hasErp, !!context.procedure);

  // 6. Call OpenAI
  let response = await callOpenAI(
    openaiKey,
    "gpt-4o",
    temperature,
    systemPrompt,
    historyMessages,
    tools,
  );

  // 7. Tool call loop
  let toolIterations = 0;
  let lastToolSuccess = false;
  const debugToolCalls: unknown[] = [];
  const ispId = context.conversation.isp_id as string;
  const encryptionKey = Deno.env.get("ENCRYPTION_KEY") ?? "";

  const toolCtx: ToolExecutionContext = {
    supabaseAdmin,
    ispId,
    encryptionKey,
    conversationId,
  };

  while (toolIterations < MAX_TOOL_ITERATIONS) {
    const choices = response.choices as Array<{
      message: {
        content: string | null;
        tool_calls?: Array<{
          id: string;
          type: "function";
          function: { name: string; arguments: string };
        }>;
      };
    }>;
    const assistantMsg = choices?.[0]?.message;
    if (!assistantMsg?.tool_calls?.length) break;

    toolIterations++;

    // Add assistant message with tool_calls to history
    const assistantToolCallContent = assistantMsg.tool_calls?.length
      ? null
      : assistantMsg.content;

    historyMessages.push({
      role: "assistant",
      content: assistantToolCallContent,
      tool_calls: assistantMsg.tool_calls,
    });

    // Persist assistant message with tool_calls to DB (required for history reconstruction)
    await supabaseAdmin.from("messages").insert({
      conversation_id: conversationId,
      role: "assistant",
      content: assistantToolCallContent,
      tool_calls: assistantMsg.tool_calls,
    });

    // Execute each tool call
    for (const tc of assistantMsg.tool_calls) {
      const args = JSON.parse(tc.function.arguments);
      const result = await executeToolHandler(
        tc.function.name,
        toolCtx,
        args,
      );

      lastToolSuccess = result.success;
      debugToolCalls.push({
        name: tc.function.name,
        args,
        success: result.success,
      });

      // Save tool result in DB
      await supabaseAdmin.from("messages").insert({
        conversation_id: conversationId,
        role: "tool",
        tool_name: tc.function.name,
        tool_call_id: tc.id,
        tool_result: result,
        content: JSON.stringify(result.data ?? result.error),
      });

      // Merge relevant data into collected_context
      if (result.success && result.data) {
        await mergeToContext(supabaseAdmin, conversationId, result.data, tc.function.name);
      }

      // If this was a contract lookup, try to resolve a numeric selection from the user message
      if (tc.function.name === "erp_contract_lookup" && result.success && result.data) {
        await tryResolveContractSelection(
          supabaseAdmin,
          conversationId,
          userMessage,
          result.data as Record<string, unknown>,
        );
      }

      // Add tool result to history for re-call
      historyMessages.push({
        role: "tool",
        tool_call_id: tc.id,
        name: tc.function.name,
        content: JSON.stringify(result.data ?? result.error),
      });
    }

    // Re-call OpenAI with tool results
    response = await callOpenAI(
      openaiKey,
      "gpt-4o",
      temperature,
      systemPrompt,
      historyMessages,
      tools,
    );
  }

  if (toolIterations > 0) {
    context = await buildRuntimeContext(supabaseAdmin, conversationId);
    step = context.currentStep;
  }

  // 8. Extract final reply
  const finalChoices = response.choices as Array<{
    message: { content: string | null };
  }>;
  const reply = finalChoices?.[0]?.message?.content ?? "";

  // 9. Evaluate advance condition
  if (step && context.procedure) {
    const shouldAdvance = await evaluateAdvanceCondition(
      step.advance_condition ?? "always",
      context,
      userMessage,
      reply,
      lastToolSuccess,
      openaiKey,
    );

    if (shouldAdvance) {
      const oldStepIndex = (context.conversation.step_index as number) ?? 0;
      const outcome = step.on_complete ?? { action: "next_step" };
      await resolveStepOutcome(
        outcome as Record<string, unknown>,
        supabaseAdmin,
        conversationId,
        context,
        openaiKey,
      );

      // Auto-advance: re-run next step immediately to avoid "dead turn"
      if (_depth < 2) {
        const { data: refreshed } = await supabaseAdmin
          .from("conversations")
          .select("step_index, active_procedure_id, mode")
          .eq("id", conversationId)
          .single();

        const newStepIndex = refreshed?.step_index ?? 0;

        if (
          refreshed?.active_procedure_id &&
          refreshed?.mode === "bot" &&
          newStepIndex !== oldStepIndex
        ) {
          console.log(
            `[procedure-runner] Auto-advance: step ${oldStepIndex} → ${newStepIndex} (depth=${_depth})`,
          );

          // Save current reply before auto-advancing
          await supabaseAdmin.from("messages").insert({
            conversation_id: conversationId,
            role: "assistant",
            content: reply,
          });

          const autoResult = await runProcedureStep(
            supabaseAdmin,
            conversationId,
            "[continuar]",
            _depth + 1,
          );

          // Combine replies and return early
          const combinedReply = reply + "\n\n" + autoResult.reply;
          const elapsed = Math.round(performance.now() - t0);
          return {
            reply: combinedReply,
            debug: {
              ...autoResult.debug,
              auto_advanced_from: oldStepIndex,
              elapsed_ms: elapsed,
            },
          };
        }
      }
    } else {
      // Increment turns_on_current_step
      const currentTurns =
        ((context.conversation.turns_on_current_step as number) ?? 0) + 1;
      const stuckLimit = step.stuck_after_turns ?? 5;

      if (currentTurns >= stuckLimit) {
        // Stuck — set pending_handover and ask user for confirmation
        await supabaseAdmin
          .from("conversations")
          .update({
            mode: "pending_handover",
            handover_reason: `Stuck on step after ${stuckLimit} turns`,
            turns_on_current_step: currentTurns,
          })
          .eq("id", conversationId);

        // Override LLM reply with handover confirmation question
        reply = "Parece que estou com dificuldade para avançar nesse passo. Deseja que eu transfira você para um atendente humano?";
      } else {
        await supabaseAdmin
          .from("conversations")
          .update({ turns_on_current_step: currentTurns })
          .eq("id", conversationId);
      }
    }
  }

  // 10. Save assistant reply
  await supabaseAdmin.from("messages").insert({
    conversation_id: conversationId,
    role: "assistant",
    content: reply,
  });

  const elapsed = Math.round(performance.now() - t0);
  console.log(
    `[procedure-runner] Completed in ${elapsed}ms — ` +
      `tools=${toolIterations} advance=${!!step}`,
  );

  // Re-read conversation to get latest mode (may have changed via transfer_to_human)
  const { data: updatedConv } = await supabaseAdmin
    .from("conversations")
    .select("mode, handover_reason")
    .eq("id", conversationId)
    .single();

  return {
    reply,
    debug: {
      elapsed_ms: elapsed,
      tool_iterations: toolIterations,
      tool_calls: debugToolCalls,
      procedure: context.procedure
        ? (context.procedure.name as string)
        : null,
      step_index: context.conversation.step_index,
      mode: updatedConv?.mode ?? context.conversation.mode,
      handover_reason: updatedConv?.handover_reason ?? null,
    },
  };
}

// ─── evaluateAdvanceCondition ───────────────────────────────────────

async function evaluateAdvanceCondition(
  condition: string,
  context: RuntimeContext,
  userMessage: string,
  botReply: string,
  lastToolSuccess: boolean,
  openaiKey: string,
): Promise<boolean> {
  switch (condition) {
    case "always":
      return true;

    case "function_success":
      return lastToolSuccess;

    case "user_confirmation": {
      // Synthetic auto-advance message is never a real confirmation
      if (userMessage.trim() === "[continuar]") return false;

      const answer = await callOpenAIMini(
        openaiKey,
        `Analise a seguinte mensagem do usuário e determine se é uma confirmação positiva (sim, ok, confirmo, pode fazer, etc). Responda APENAS "sim" ou "não".\n\nMensagem: "${userMessage}"`,
      );
      return answer.trim().toLowerCase().startsWith("sim");
    }

    case "data_collected": {
      const step = context.currentStep;
      const requiredFields = (step as Record<string, unknown>)
        ?.required_fields as string[] | undefined;
      if (!requiredFields?.length) return true;

      const collected = (context.conversation.collected_context as Record<
        string,
        unknown
      >) ?? {};
      return requiredFields.every(
        (f) => collected[f] !== undefined && collected[f] !== null,
      );
    }

    case "llm_judge": {
      const step = context.currentStep;
      const instruction = step?.instruction ?? "";
      const hadToolSuccess = lastToolSuccess ? "Sim" : "Não";
      const answer = await callOpenAIMini(
        openaiKey,
        `Dado o objetivo do passo: "${instruction}"\n\nMensagem do usuário: "${userMessage}"\nHouve chamada de ferramenta com sucesso neste turno: ${hadToolSuccess}\nResposta do assistente: "${botReply}"\n\nO objetivo deste passo foi cumprido? Responda APENAS "sim" ou "não".`,
      );
      const result = answer.trim().toLowerCase().startsWith("sim");
      console.log(`[procedure-runner] llm_judge: userMsg="${userMessage.slice(0, 50)}" toolSuccess=${lastToolSuccess} result=${result}`);
      return result;
    }

    default:
      return false;
  }
}

// ─── resolveStepOutcome ─────────────────────────────────────────────

async function resolveStepOutcome(
  outcome: Record<string, unknown>,
  supabaseAdmin: SupabaseClient,
  conversationId: string,
  context: RuntimeContext,
  openaiKey: string,
): Promise<void> {
  const action = (outcome.action as string) ?? "next_step";

  switch (action) {
    case "next_step": {
      const currentIndex =
        (context.conversation.step_index as number) ?? 0;
      const proc = context.procedure as Record<string, unknown>;
      const def = proc.definition as ProcedureDefinition;
      const totalSteps = def?.steps?.length ?? 0;

      if (currentIndex + 1 >= totalSteps) {
        // End of procedure — clean context
        await supabaseAdmin
          .from("conversations")
          .update({
            active_procedure_id: null,
            step_index: 0,
            turns_on_current_step: 0,
            collected_context: {},
          })
          .eq("id", conversationId);
      } else {
        await supabaseAdmin
          .from("conversations")
          .update({
            step_index: currentIndex + 1,
            turns_on_current_step: 0,
          })
          .eq("id", conversationId);
      }
      break;
    }

    case "end_procedure":
      await supabaseAdmin
        .from("conversations")
        .update({
          active_procedure_id: null,
          step_index: 0,
          turns_on_current_step: 0,
          collected_context: {},
        })
        .eq("id", conversationId);
      break;

    case "handover_human":
      await supabaseAdmin
        .from("conversations")
        .update({
          mode: "human",
          handover_reason:
            (outcome.reason as string) ?? "Procedure escalation",
          handover_at: new Date().toISOString(),
        })
        .eq("id", conversationId);
      break;

    case "conditional": {
      const conditions = (outcome.conditions as Array<{
        if_context: string;
        then: Record<string, unknown>;
      }>) ?? [];
      const collected = (context.conversation.collected_context as Record<
        string,
        unknown
      >) ?? {};

      for (const cond of conditions) {
        const answer = await callOpenAIMini(
          openaiKey,
          `Dado este contexto: ${JSON.stringify(collected)}\n\n${cond.if_context}\n\nResponda APENAS "sim" ou "não".`,
        );
        if (answer.trim().toLowerCase().startsWith("sim")) {
          await resolveStepOutcome(
            cond.then,
            supabaseAdmin,
            conversationId,
            context,
            openaiKey,
          );
          return;
        }
      }
      // No condition matched — default to next_step
      await resolveStepOutcome(
        { action: "next_step" },
        supabaseAdmin,
        conversationId,
        context,
        openaiKey,
      );
      break;
    }

    default:
      console.warn(`[procedure-runner] Unknown outcome action: ${action}`);
  }
}

// ─── detectProcedure ────────────────────────────────────────────────

export async function detectProcedure(
  supabaseAdmin: SupabaseClient,
  message: string,
  templateId: string,
  lastBotMessage?: string,
): Promise<Record<string, unknown> | null> {
  const { data: procedures } = await supabaseAdmin
    .from("procedures")
    .select("*")
    .eq("template_id", templateId)
    .eq("is_current", true)
    .eq("is_active", true);

  if (!procedures?.length) return null;

  const messageLower = message.toLowerCase().trim();

  // If user sent a short confirmation, combine with last bot message for context
  const confirmationWords = ["sim", "isso", "quero", "pode", "ok", "s", "claro", "por favor", "yes", "positivo", "exato", "isso mesmo"];
  const isConfirmation = confirmationWords.includes(messageLower) || messageLower.length <= 5;
  const searchText = isConfirmation && lastBotMessage
    ? `${messageLower} ${lastBotMessage.toLowerCase()}`
    : messageLower;

  let bestMatch: Record<string, unknown> | null = null;
  let bestScore = 0;

  for (const proc of procedures) {
    const def = proc.definition as ProcedureDefinition;
    const triggers = def?.triggers;
    if (!triggers?.keywords?.length) continue;

    const keywords = triggers.keywords;
    const matchedCount = keywords.filter((kw) =>
      searchText.includes(kw.toLowerCase()),
    ).length;

    if (matchedCount > 0 && matchedCount > bestScore) {
      bestScore = matchedCount;
      bestMatch = proc;
    }
  }

  return bestMatch;
}

// ─── tryResolveContractSelection ────────────────────────────────────
// When user sends a numeric choice and we have contract items in context,
// resolve and persist the selected contract as structured data.

async function tryResolveContractSelection(
  supabaseAdmin: SupabaseClient,
  conversationId: string,
  userMessage: string,
  _toolData: Record<string, unknown>,
): Promise<void> {
  // This runs right after erp_contract_lookup returns. The items are already
  // in collected_context via mergeToContext. We don't need to do anything yet;
  // the actual selection happens on the NEXT user turn (user sends "8").
}

// Called before the OpenAI call to check if the user is selecting a contract
async function resolveContractSelectionFromMessage(
  supabaseAdmin: SupabaseClient,
  conversationId: string,
  userMessage: string,
): Promise<void> {
  const trimmed = userMessage.trim();
  const num = parseInt(trimmed, 10);
  if (isNaN(num) || num < 1) return;

  // Read current context
  const { data: conv } = await supabaseAdmin
    .from("conversations")
    .select("collected_context")
    .eq("id", conversationId)
    .single();

  const ctx = (conv?.collected_context as Record<string, unknown>) ?? {};

  // Already resolved
  if (ctx.selected_contract_id) return;

  // Look for contract items (namespaced key from erp_contract_lookup)
  const itens = (ctx.contract_options ?? ctx.itens) as Array<Record<string, unknown>> | undefined;
  if (!itens?.length) return;

  // Find the item matching the user's numeric choice
  const selected = itens.find(
    (item) => Number(item.opcao) === num,
  );
  if (!selected) return;

  // Persist structured selection — omit null fields so LLM never sees them
  const selection: Record<string, unknown> = {
    selected_contract_option: num,
  };
  if (selected.contrato_id ?? selected.id) selection.selected_contract_id = selected.contrato_id ?? selected.id;
  if (selected.endereco) selection.selected_contract_address = selected.endereco;
  if (selected.plano) selection.selected_contract_plan = selected.plano;

  console.log(
    `[procedure-runner] Resolved contract selection: option=${num}, address=${selection.selected_contract_address}`,
  );

  await mergeToContext(supabaseAdmin, conversationId, selection);
}

// Called before the OpenAI call to check if the user is selecting an invoice
async function resolveInvoiceSelectionFromMessage(
  supabaseAdmin: SupabaseClient,
  conversationId: string,
  userMessage: string,
): Promise<void> {
  const trimmed = userMessage.trim();
  const num = parseInt(trimmed, 10);
  if (isNaN(num) || num < 1) return;

  const { data: conv } = await supabaseAdmin
    .from("conversations")
    .select("collected_context")
    .eq("id", conversationId)
    .single();

  const ctx = (conv?.collected_context as Record<string, unknown>) ?? {};

  // Only resolve if we have invoice_options and no selected_invoice_id yet
  if (ctx.selected_invoice_id) return;
  if (!ctx.selected_contract_id) return; // contract must be selected first

  const invoices = ctx.invoice_options as Array<Record<string, unknown>> | undefined;
  if (!invoices?.length || invoices.length <= 1) return; // single invoice is auto-selected

  // Match by position (1-indexed)
  if (num > invoices.length) return;
  const selected = invoices[num - 1];
  if (!selected) return;

  console.log(`[procedure-runner] Resolved invoice selection: option=${num}, id=${selected.id}`);
  await mergeToContext(supabaseAdmin, conversationId, { selected_invoice_id: selected.id });
}

// Called before the OpenAI call to check if the user is choosing a payment method
async function resolvePaymentMethodFromMessage(
  supabaseAdmin: SupabaseClient,
  conversationId: string,
  userMessage: string,
): Promise<void> {
  const { data: conv } = await supabaseAdmin
    .from("conversations")
    .select("collected_context")
    .eq("id", conversationId)
    .single();

  const ctx = (conv?.collected_context as Record<string, unknown>) ?? {};

  // Only resolve if invoice is selected and payment method is not yet chosen
  if (ctx.selected_payment_method) return;
  if (!ctx.selected_invoice_id) return;

  const msg = userMessage.toLowerCase().trim();

  // Map user input to payment method
  const methodMap: Record<string, string> = {
    "1": "linha_digitavel",
    "linha": "linha_digitavel",
    "linha digitavel": "linha_digitavel",
    "linha digitável": "linha_digitavel",
    "codigo de barras": "linha_digitavel",
    "código de barras": "linha_digitavel",
    "barras": "linha_digitavel",
    "2": "pix",
    "pix": "pix",
    "3": "boleto_pdf",
    "boleto": "boleto_pdf",
    "pdf": "boleto_pdf",
    "segunda via": "boleto_pdf",
    "4": "boleto_sms",
    "sms": "boleto_sms",
  };

  const method = methodMap[msg];
  if (!method) return;

  console.log(`[procedure-runner] Resolved payment method: ${method}`);
  await mergeToContext(supabaseAdmin, conversationId, { selected_payment_method: method });
}

// ─── mergeToContext ─────────────────────────────────────────────────

async function mergeToContext(
  supabaseAdmin: SupabaseClient,
  conversationId: string,
  data: unknown,
  toolName?: string,
): Promise<void> {
  if (!data || typeof data !== "object") return;

  const { data: conv } = await supabaseAdmin
    .from("conversations")
    .select("collected_context")
    .eq("id", conversationId)
    .single();

  const existing = (conv?.collected_context as Record<string, unknown>) ?? {};
  const envelope = data as Record<string, unknown>;

  // Namespace tool results to prevent key collisions between contract and invoice data
  if (toolName === "erp_contract_lookup" && Array.isArray(envelope.itens)) {
    existing.contract_options = envelope.itens;
    // Clear stale downstream data when re-querying contracts
    delete existing.invoice_options;
    delete existing.invoice_summary;
    delete existing.selected_contract_id;
    delete existing.selected_contract_address;
    delete existing.selected_contract_plan;
    delete existing.selected_contract_option;
    delete existing.selected_invoice_id;
    delete existing.selected_payment_method;
  } else if (toolName === "erp_invoice_search" && Array.isArray(envelope.itens)) {
    existing.invoice_options = envelope.itens;
    existing.invoice_summary = envelope.mensagem;
    delete existing.selected_invoice_id;
    delete existing.selected_payment_method;
    // Auto-select if single invoice
    if (envelope.itens.length === 1) {
      const inv = envelope.itens[0] as Record<string, unknown>;
      existing.selected_invoice_id = inv.id;
    }
  } else {
    // Generic merge for other tools (client lookup, selection fields, etc.)
    Object.assign(existing, envelope);
  }

  await supabaseAdmin
    .from("conversations")
    .update({ collected_context: existing })
    .eq("id", conversationId);
}

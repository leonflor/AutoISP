

# Fix "dead turn" — auto-execute next step after advancing

## Problem

The current flow:
```text
User: "sim"
→ Bot generates reply: "Perfeito! Vou consultar seus contratos agora."
→ llm_judge evaluates → YES → advances step_index to 1
→ STOPS. Waits for next user message.
→ User confused: bot said it would check contracts but did nothing.
```

The advance happens AFTER the reply is generated (line 329). The next step's tools only run when a NEW user message arrives. This creates a dead turn where the bot promises action but doesn't deliver.

## Solution

After `resolveStepOutcome` advances to a new step, **re-run the procedure engine** for the new step using the bot's last reply as a synthetic context trigger. This eliminates the dead turn.

Concretely, in `runProcedureStep` (after line 347):

1. After `resolveStepOutcome` completes and the step advanced (not end_procedure or handover), **re-read the conversation state** to get the new `step_index`.
2. If the step changed, **recursively call** `runProcedureStep` with a synthetic message like `"[auto-advance]"` — or better, re-build context and call OpenAI again for the new step within the same function, appending the bot's reply to history.
3. The new step's tools (e.g., `erp_contract_lookup`) will be available, and the LLM will execute them proactively per the step 1 instruction.
4. Combine the replies: original reply + new step's reply.

### Implementation detail

After line 347 in `procedure-runner.ts`:

```typescript
if (shouldAdvance) {
  const outcome = step.on_complete ?? { action: "next_step" };
  await resolveStepOutcome(outcome, ...);

  // Check if we moved to a new step (not end/handover)
  const { data: refreshed } = await supabaseAdmin
    .from("conversations")
    .select("step_index, active_procedure_id, mode")
    .eq("id", conversationId)
    .single();

  const newStepIndex = refreshed?.step_index ?? 0;
  const oldStepIndex = (context.conversation.step_index as number) ?? 0;

  if (
    refreshed?.active_procedure_id &&
    refreshed?.mode === "bot" &&
    newStepIndex !== oldStepIndex
  ) {
    // Auto-execute next step — recursive call
    const autoResult = await runProcedureStep(
      supabaseAdmin,
      conversationId,
      "[continuar]",  // synthetic message
    );
    // Combine replies
    reply = reply + "\n\n" + autoResult.reply;
    // Merge debug info
    Object.assign(debugInfo, autoResult.debug);
  }
}
```

The synthetic message `"[continuar]"` will be saved as a user message but step 1's instruction says "IMEDIATAMENTE ao receber qualquer mensagem" — so it will trigger `erp_contract_lookup`.

### Safeguard

Add a recursion depth limit (max 2 auto-advances) via an optional parameter to prevent infinite loops.

## Expected corrected flow

```text
User: "sim"
→ Step 0: Bot replies "Perfeito! Vou consultar seus contratos agora."
→ llm_judge → YES → advances to step 1
→ AUTO-EXECUTE step 1 with "[continuar]"
→ Step 1: Bot calls erp_contract_lookup → lists contracts
→ Combined reply: "Perfeito! Vou consultar... \n\n Encontrei os seguintes contratos: 1. ..."
```

## Files changed

| File | Change |
|---|---|
| `supabase/functions/_shared/procedure-runner.ts` | Add auto-advance logic after `resolveStepOutcome`, with recursion depth limit |

No database migration needed.


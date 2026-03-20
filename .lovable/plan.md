

# Plano: Context Builder — Estado da Conversa para o LLM

## Status: ✅ Concluído

## Arquivos Criados

1. **Migration SQL** — `match_knowledge` function criada via migration tool
2. **`supabase/functions/_shared/crypto.ts`** — `deriveKey`, `encrypt`, `decrypt` (AES-GCM) compartilhados
3. **`supabase/functions/_shared/context-builder.ts`** — `buildRuntimeContext` + `buildSystemPrompt`

---

# Plano: Procedure Runner — Step Executor + Condition Evaluator

## Status: ✅ Concluído

## Arquivos Criados / Alterados

1. **`supabase/functions/_shared/procedure-runner.ts`** — `runProcedureStep`, `evaluateAdvanceCondition`, `resolveStepOutcome`, `detectProcedure`
2. **`supabase/functions/_shared/context-builder.ts`** — `getOpenAIKey` exportada (era privada)

## Camadas já implementadas

- ✅ Schema multi-tenant (agent_templates, tenant_agents, procedures, conversations, messages, knowledge_bases)
- ✅ LLM Tool Layer (tool-catalog.ts, tool-handlers.ts, erp-driver.ts)
- ✅ Context Builder (context-builder.ts + crypto.ts + match_knowledge SQL)
- ✅ Procedure Runner (procedure-runner.ts — state machine + tool loop + advance conditions)
- ⬜ Motor de execução (Edge Function que orquestra tudo)
- ⬜ Reescrita do whatsapp-webhook para usar o novo schema



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

---

# Plano: Webhook WhatsApp — Integrar com Motor Existente

## Status: ✅ Concluído

## Arquivos Alterados

1. **`supabase/functions/whatsapp-webhook/index.ts`** — reescrita do fluxo de processamento

## O que foi feito

- Conversation lookup migrado para novo schema (`user_phone`, `tenant_agent_id`, `resolved_at IS NULL`)
- Resolução de `tenant_agent_id` via `tenant_agents` + `agent_templates.type = 'atendente'`
- Controle de modo: `human` (broadcast Realtime + save only), `paused` (save only), `bot` (motor IA)
- `processWithAI` removida, substituída por `runProcedureStep` do procedure-runner
- `escalateToHuman` implementada: atualiza modo, gera summary via gpt-4o-mini, envia mensagem de fallback, broadcast Realtime
- Suporte a test mode via header `X-Test-Mode: true` (retorna JSON sem enviar WhatsApp)
- `detectProcedure` integrado para ativação automática de procedures
- Controle de `intent_attempts` com escalação automática
- `sendWhatsAppMessage` mantida idêntica (tipagem melhorada)

## Camadas já implementadas

- ✅ Schema multi-tenant (agent_templates, tenant_agents, procedures, conversations, messages, knowledge_bases)
- ✅ LLM Tool Layer (tool-catalog.ts, tool-handlers.ts, erp-driver.ts)
- ✅ Context Builder (context-builder.ts + crypto.ts + match_knowledge SQL)
- ✅ Procedure Runner (procedure-runner.ts — state machine + tool loop + advance conditions)
- ✅ Webhook WhatsApp (integrado com motor, controle de modo, escalação)



# Plano: Webhook WhatsApp — Integrar com Motor Existente

## Resumo

Reescrever o fluxo de processamento de mensagens no `whatsapp-webhook/index.ts` para usar o novo motor (`procedure-runner` + `context-builder`), mantendo intactos: verificação de assinatura, rate limiting, sanitização, parsing de payload, status updates, e função `sendWhatsAppMessage`.

## O que muda

### 1. Lookup de conversation (linhas ~416-454)

Substituir a query antiga (que usa campos legados `status`, `metadata->wa_id`, `started_at`, `messages` JSONB) pela nova:

```sql
SELECT * FROM conversations
WHERE user_phone = $phone
  AND tenant_agent_id = $agentId
  AND isp_id = $ispId
  AND resolved_at IS NULL
ORDER BY created_at DESC LIMIT 1
```

Se não existe → INSERT com campos do novo schema (`user_phone`, `tenant_agent_id`, `isp_id`, `mode: 'bot'`, `channel: 'whatsapp'`, `user_identifier: senderName`).

**Pré-requisito**: Resolver `tenant_agent_id` — buscar `tenant_agents` do ISP com `is_active = true` e template type `'atendente'`. Se nenhum encontrado, enviar fallback e retornar.

### 2. Verificar `conversation.mode` (novo)

- `'human'` → salvar mensagem em `messages` (role: 'user', wamid) + broadcast Realtime no canal `human-queue` + retornar 200 sem chamar LLM
- `'paused'` → salvar mensagem, retornar 200
- `'bot'` → continuar fluxo normal

### 3. Salvar mensagem em `messages` (substituir JSONB)

Remover lógica de `existingMessages` / `updatedMessages` / `conversation.messages` JSONB. Usar apenas INSERT em tabela `messages` com `conversation_id`, `role: 'user'`, `content`, `wamid`.

### 4. Suporte a `is_test` (novo, via query param ou header)

Se request contém `X-Test-Mode: true` header, após processar com o motor, retornar `{ reply, debug }` diretamente sem enviar pelo WhatsApp.

### 5. Substituir `processWithAI` por novo motor

Remover a função `processWithAI` inteira (linhas 576-705) que usa `ai_limits`, `ai_agents`, e `ai-chat` edge function — tudo legado.

Novo fluxo:
1. Se sem `active_procedure_id` → `detectProcedure(message, templateId)`
2. Se não detectou → incrementar `intent_attempts`
   - Se `intent_attempts >= max_intent_attempts` do template → `escalateToHuman()`
3. Chamar `runProcedureStep(supabase, conversationId, messageContent)`
4. Enviar `result.reply` via `sendWhatsAppMessage` existente

### 6. Criar função `escalateToHuman` (nova)

```typescript
async function escalateToHuman(
  supabase, conversationId, reason, template, whatsappConfig, recipientPhone, ispId
)
```

- UPDATE conversations SET `mode='human'`, `handover_reason`, `handover_at`
- Gerar `handover_summary` via gpt-4o-mini com histórico das messages
- UPDATE conversations SET `handover_summary`
- Enviar `template.intent_failure_message` ao usuário via WhatsApp
- Broadcast Realtime: `supabase.channel('agent-notifications').send({ type: 'broadcast', event: 'new_handover', payload })`

### 7. Manter intacto

- Linhas 1-167: imports, crypto, rate limiting, signature verification, sanitization, types
- Linhas 220-326: Deno.serve, GET verification, POST signature check, payload parsing, webhook_logs
- Linhas 328-364: Status update processing (`whatsapp_messages` update)
- Linhas 366-383: ISP lookup via `whatsapp_configs`
- Linhas 386-398: Phone sanitization + rate limit check
- Linhas 707-814: `sendWhatsAppMessage` function (manter idêntica)

## Imports novos

```typescript
import { runProcedureStep, detectProcedure } from "../_shared/procedure-runner.ts";
import { buildRuntimeContext, buildSystemPrompt, getOpenAIKey } from "../_shared/context-builder.ts";
```

## Arquivos alterados

1. **`supabase/functions/whatsapp-webhook/index.ts`** — reescrita do fluxo de processamento
2. **`.lovable/plan.md`** — atualizar status

## Nenhuma migration SQL necessária

O schema (conversations, messages, tenant_agents, procedures) já está implementado.


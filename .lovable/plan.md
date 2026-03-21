

# Plano: Simulador de Agente (Chat de Testes)

## Resumo

Criar um Edge Function dedicado para testes do agente sem WhatsApp, um componente reutilizável de chat com debug, e integrá-lo nas páginas de templates (admin) e agent-config (tenant).

## 1. Migration: tabela `test_conversations`

```sql
CREATE TABLE public.test_conversations (
  id text PRIMARY KEY,
  tenant_agent_id uuid REFERENCES tenant_agents(id) ON DELETE CASCADE,
  template_id uuid REFERENCES agent_templates(id) ON DELETE SET NULL,
  user_id uuid NOT NULL,
  messages jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT now() + interval '24 hours'
);

ALTER TABLE public.test_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own test conversations"
  ON public.test_conversations FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

## 2. Edge Function `simulate-agent`

**`supabase/functions/simulate-agent/index.ts`**

Receives `{ tenant_agent_id, template_id?, message, test_conversation_id }` + JWT.

Flow:
- Auth via JWT, get user_id
- If no `test_conversation_id`: create new conversation in `conversations` table with a special prefix marker and `mode='bot'`, return the id
- Use the existing `runProcedureStep` + `detectProcedure` from `_shared/procedure-runner.ts` directly (same engine as webhook)
- Skip WhatsApp sending entirely
- Return `{ reply, debug, conversation_id }` where debug includes: procedure name, step index, tool calls, tokens

Key difference from webhook: no WhatsApp config lookup, no message sending, direct procedure engine call.

Uses a **real conversation row** (not test_conversations table) so `runProcedureStep` works without modification. The conversation gets a `channel='simulator'` marker to distinguish from real ones. Cleanup via `expires_at` or manual delete.

Revised approach: Use `conversations` table with `channel='simulator'` instead of a separate `test_conversations` table. This avoids modifying `runProcedureStep` which expects real conversation rows. No migration needed.

## 3. Component `AgentSimulator.tsx`

**`src/components/AgentSimulator.tsx`**

Props: `tenantAgentId?: string`, `templateId?: string`, `showDebug?: boolean`, `onClose?: () => void`

Two-panel layout in a Dialog/Sheet:

**Left panel (config, 280px)**:
- Temperature (read-only from template)
- Active procedure detected (updates per response from debug)
- Current step (index + instruction snippet)
- Toggle "Show prompt debug"
- Button "Reset conversation" (creates new conversation_id)

**Right panel (chat, flex-1)**:
- Header: agent name + avatar + Badge "Modo Teste"
- Message history (bot/user bubbles)
- If debug on: gray card before each bot message showing procedure, step, tool calls (name + result snippet), token count
- Input textarea (Enter=send, Shift+Enter=newline)
- Sends via `supabase.functions.invoke('simulate-agent', { body: {...} })`
- Optimistic UI for user messages

State: conversation messages stored locally in component state (populated from API responses).

## 4. Integration points

**`src/pages/admin/Templates.tsx`**: Add "Testar" button on each template card → opens AgentSimulator as Dialog with `templateId={t.id}`

**`src/pages/painel/AgentConfig.tsx`**: Add "Testar agente" button in header → opens AgentSimulator with `tenantAgentId={agent.id}`

**`src/App.tsx`**: No standalone pages needed initially — the component opens as a Dialog overlay from existing pages.

## 5. Config.toml

Register `simulate-agent` with `verify_jwt = false` (JWT validated in code).

## Files

| Action | File |
|--------|------|
| Create | `supabase/functions/simulate-agent/index.ts` |
| Create | `src/components/AgentSimulator.tsx` |
| Edit | `src/pages/admin/Templates.tsx` — add "Testar" button |
| Edit | `src/pages/painel/AgentConfig.tsx` — add "Testar agente" button |
| Edit | `src/App.tsx` — no route changes needed |
| Edit | `supabase/config.toml` — register function |

No migration needed — reuses `conversations` table with `channel='simulator'`.


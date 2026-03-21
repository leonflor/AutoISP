

# Plano: Edge Functions de Atendimento Humano

## Análise do existente

- **`send-human-reply`** já existe e funciona bem. Precisa de dois ajustes: (1) validar `mode='human'`, (2) auto-assign `assigned_agent_id` se ainda null.
- **`resolve-conversation`** e **`transfer-conversation`** não existem — criar.
- O hook `useLiveSupport` faz resolve/transfer via cliente direto. Após criar as EFs, atualizar o hook para usar as EFs em vez de updates diretos.

## 1. Atualizar `send-human-reply`

Dois ajustes no arquivo existente:
- Após buscar a conversa, validar que `mode === 'human'` (retornar 400 se não)
- Após inserir mensagem, se `assigned_agent_id` é null, fazer UPDATE para atribuir ao agente atual

## 2. Criar `resolve-conversation`

**`supabase/functions/resolve-conversation/index.ts`**

- Recebe `{ conversation_id, return_to_bot }` + JWT
- Valida JWT → busca user → busca agent record
- Busca conversa, valida que é mode='human' e que o user é assigned ou ISP admin
- UPDATE conversations: `resolved_at=now()`, `resolved_by='human'`, `assigned_agent_id=null`, `mode = return_to_bot ? 'bot' : 'human'`
- Decrementa `human_agents.current_chat_count` do agente
- Se `return_to_bot=true`: envia mensagem de encerramento via WhatsApp (reutilizar padrão de decrypt/send do `send-human-reply`)
- Retorna `{ success: true }`

## 3. Criar `transfer-conversation`

**`supabase/functions/transfer-conversation/index.ts`**

- Recebe `{ conversation_id, to_agent_id }` + JWT
- Valida JWT → busca user → busca agent record do remetente
- Valida que user é assigned agent ou ISP admin
- Valida `to_agent_id`: `is_available=true` AND `current_chat_count < max_concurrent_chats`
- UPDATE conversations: `assigned_agent_id = to_agent_id`
- Decrementa `current_chat_count` do from_agent
- Incrementa `current_chat_count` do to_agent
- Retorna `{ success: true }`

## 4. Atualizar hook `useLiveSupport`

Substituir chamadas diretas ao Supabase client por invocações das EFs:
- `resolveConversation` → `supabase.functions.invoke('resolve-conversation')`
- `transferConversation` → `supabase.functions.invoke('transfer-conversation')`
- `returnToBot` → `supabase.functions.invoke('resolve-conversation', { return_to_bot: true })`

## Sem Migration

Todas as tabelas e colunas necessárias já existem.

## Arquivos

| Acao | Arquivo |
|------|---------|
| Editar | `supabase/functions/send-human-reply/index.ts` |
| Criar | `supabase/functions/resolve-conversation/index.ts` |
| Criar | `supabase/functions/transfer-conversation/index.ts` |
| Editar | `src/hooks/painel/useLiveSupport.ts` |


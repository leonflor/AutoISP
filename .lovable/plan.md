

# Plano: Painel de Atendimento Humano (`/painel/suporte`)

## Resumo

Criar interface de atendimento em tempo real com layout de três colunas: fila de conversas escaladas (Realtime), chat unificado com histórico do bot, e painel de contexto com briefing e dados do cliente. Inclui Edge Function para envio de mensagens pelo atendente.

## 1. Edge Function `send-human-reply`

**`supabase/functions/send-human-reply/index.ts`**

- Recebe `{ conversation_id, message }` + JWT
- Valida que o user é `assigned_agent_id` da conversa (ou ISP admin)
- INSERT em `messages` com role='agent', sent_by_agent_id
- Envia via WhatsApp Cloud API (reutilizar padrão de decrypt do `send-whatsapp`)
- Busca `whatsapp_configs` do ISP para credenciais
- Retorna `{ success, message_id }`

## 2. Hook `useLiveSupport`

**`src/hooks/painel/useLiveSupport.ts`**

### Estado do atendente
- Query `human_agents` para obter registro do user atual
- Mutation toggle `is_available`

### Fila de conversas
- Query `conversations` where `mode='human'` and `isp_id=ispId`
- Separar: "Aguardando" (`assigned_agent_id IS NULL`) e "Meus" (`assigned_agent_id = meuId`)
- Join com último `messages` para prévia
- Ordenar por `handover_at ASC`

### Realtime
- Subscribe `postgres_changes` em `conversations` filtrado por `isp_id`
- INSERT/UPDATE com `mode='human'` → atualizar fila + tocar som + Notification API
- Conversa resolvida (`resolved_at NOT NULL`) → remover

### Chat ativo
- Query `messages` da conversa selecionada, ordered by `created_at`
- Subscribe Realtime em `messages` filtrado por `conversation_id`
- Query `quick_replies` do template + ISP

### Ações
- Assumir: UPDATE `conversations.assigned_agent_id`
- Enviar: invoke `send-human-reply` + insert otimístico
- Devolver ao bot: UPDATE `mode='bot'`, clear `assigned_agent_id`
- Resolver: UPDATE `resolved_at=now()`, `resolved_by='human'`
- Transferir: UPDATE `assigned_agent_id` para outro agente

## 3. Página `/painel/suporte`

**`src/pages/painel/LiveSupport.tsx`**

### Layout: 3 colunas (flex, h-screen)

**Coluna esquerda (260px)**:
- Toggle online/offline (Switch → `human_agents.is_available`)
- Tabs "Aguardando" / "Meus"
- Cards de conversa: nome/telefone, prévia, tempo desde handover, badge reason, dot não-lido

**Coluna central (flex-1)**:
- Header: nome/telefone do cliente
- ScrollArea com mensagens diferenciadas:
  - User: balão esquerda, fundo neutro
  - Bot (role='assistant'): balão esquerda, fundo roxo claro, label "Sofia (bot)"
  - Agent (role='agent'): balão direita, fundo roxo
  - Divisória visual no ponto do handover (baseado em `handover_at`)
- Chips de respostas rápidas
- Textarea (Enter=enviar, Shift+Enter=newline)
- Botões "Devolver ao bot" e "Resolver"

**Coluna direita (280px)**:
- Card "Briefing" (`handover_summary`)
- Card "Dados do cliente" (`collected_context.customer`)
- Card "Boletos" (se `collected_context` contém invoices)
- Card "Atendentes online" (query `human_agents.is_available=true`)
- Botão "Transferir" → dialog com lista

## 4. Rota e Sidebar

- **`App.tsx`**: Rota `suporte` dentro de `/painel`
- **`PainelSidebar.tsx`**: Adicionar "Suporte ao Vivo" (icon `Headset`) após "Atendimentos"

## Sem Migration

Tabelas `conversations`, `messages`, `human_agents`, `quick_replies` já existem com RLS adequado. Campo `assigned_agent_id` já existe em `conversations`.

## Arquivos

| Ação | Arquivo |
|------|---------|
| Criar | `supabase/functions/send-human-reply/index.ts` |
| Criar | `src/hooks/painel/useLiveSupport.ts` |
| Criar | `src/pages/painel/LiveSupport.tsx` |
| Editar | `src/components/painel/PainelSidebar.tsx` |
| Editar | `src/App.tsx` |


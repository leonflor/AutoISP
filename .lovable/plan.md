

# Plano: Configuração do Agente e WhatsApp (`/painel/agent-config`)

## Resumo

Criar página no painel ISP para personalizar identidade do agente (nome, avatar), visualizar template base, configurar WhatsApp e ver status de conexão. Reutilizar lógica existente de WhatsApp do `useWhatsAppConfig`.

## 1. Rota e Sidebar

- **`App.tsx`**: Adicionar rota `agent-config` dentro de `/painel`
- **`PainelSidebar.tsx`**: Adicionar item "Agente IA" (icon `Bot`) após "Comunicação"

## 2. Hook `useAgentConfig`

**`src/hooks/painel/useAgentConfig.ts`**

- Query `tenant_agents` filtrado por `isp_id` (do `useIspMembership`), join com `agent_templates` para dados do template base
- Query `conversations` para métricas de status (total hoje, última mensagem)
- Query `whatsapp_configs` para status de conexão
- Mutation para UPDATE `tenant_agents` (custom_name, custom_avatar_url)
- Upload de avatar para bucket `agent-avatars/{ispId}/` via Supabase Storage

## 3. Página `/painel/agent-config`

**`src/pages/painel/AgentConfig.tsx`**

### Seção 1 — Identidade do Agente
- Input "Nome do agente" (placeholder: nome padrão do template)
- Upload de avatar com preview circular, fallback para avatar do template
- Card read-only com info do template: nome, tipo, tom, temperatura
- Texto informativo sobre tom/comportamento

### Seção 2 — Conexão WhatsApp
- Reutilizar `useWhatsAppConfig` existente
- Inputs: Phone Number ID, Access Token (password), Verify Token (auto-gerado, read-only + copiar)
- Webhook URL para copiar
- Instruções colapsáveis (Collapsible) passo a passo Meta
- Botão "Testar conexão" → Edge Function existente `test-whatsapp-connection`

### Seção 3 — Status
- Badge ativo/inativo (is_connected)
- Última mensagem recebida (query `messages` mais recente)
- Total conversas hoje (count `conversations` where created_at >= today)

### Salvar
- UPDATE `tenant_agents` para nome e avatar
- Credenciais WhatsApp via `saveConfig` do `useWhatsAppConfig` (já criptografa via Edge Function)

## 4. Sem Migration

- Tabelas `tenant_agents`, `whatsapp_configs`, `conversations`, `messages` já existem com RLS adequado
- Bucket `agent-avatars` já existe e é público
- Edge Functions `save-whatsapp-config` e `test-whatsapp-connection` já existem

## Arquivos

| Ação | Arquivo |
|------|---------|
| Criar | `src/hooks/painel/useAgentConfig.ts` |
| Criar | `src/pages/painel/AgentConfig.tsx` |
| Editar | `src/components/painel/PainelSidebar.tsx` — adicionar "Agente IA" |
| Editar | `src/App.tsx` — adicionar rota `agent-config` |


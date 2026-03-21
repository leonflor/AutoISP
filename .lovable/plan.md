

# Plano: Mover seção WhatsApp do AgentConfig para Settings > Integrações

## O que muda

A seção "Conexão WhatsApp" (linhas 349-449 de `AgentConfig.tsx`) e a seção "Status" (linhas 302-347) que inclui status de conexão WhatsApp estão atualmente dentro da página de Agentes de IA. Elas devem ser removidas de lá e a página `WhatsAppConfig.tsx` (já existente em `/painel/whatsapp`) já contém toda a funcionalidade completa de configuração WhatsApp.

O que precisa acontecer:

### 1. `src/pages/painel/AgentConfig.tsx`
- Remover toda a seção "Conexão WhatsApp" (linhas 349-449) e a seção "Status" de conexão (linhas 302-347)
- Remover imports e estado relacionados ao WhatsApp (`useWhatsAppConfig`, `phoneNumberId`, `accessToken`, `phoneNumber`, `verifyToken`, `copiedField`, `webhookUrl`, `handleSaveWhatsApp`, `copyToClipboard`, `SUPABASE_PROJECT_ID`)
- Manter apenas o grid de agentes e o painel de edição

### 2. `src/pages/painel/Settings.tsx`
- Atualizar o status do WhatsApp na lista de integrações para refletir dados reais usando `useWhatsAppConfig`
- Mudar o status de `'pendente' as const` (hardcoded) para verificar `config?.is_connected`

### Arquivos afetados

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/painel/AgentConfig.tsx` | Remover seções WhatsApp e Status de conexão |
| `src/pages/painel/Settings.tsx` | Usar `useWhatsAppConfig` para status real do WhatsApp |


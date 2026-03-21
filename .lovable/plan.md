

# Plano: Simulador de Agente (Chat de Testes) ✅

## Implementado

1. **Edge Function `simulate-agent`** — Recebe mensagem + JWT, cria conversa com `channel='simulator'`, executa `runProcedureStep` sem enviar WhatsApp, retorna reply + debug detalhado.

2. **Componente `AgentSimulator.tsx`** — Dialog reutilizável com dois painéis: debug (procedimento, step, latência, tool calls) e chat (bolhas user/bot, loading, input com Enter para enviar).

3. **Integração em Templates** — Botão ▶ "Testar" em cada card de template admin, abre simulador com `templateId`.

4. **Integração em AgentConfig** — Botão "Testar agente" no header da configuração do tenant, abre simulador com `tenantAgentId`.

## Arquivos

| Ação | Arquivo |
|------|---------|
| Criado | `supabase/functions/simulate-agent/index.ts` |
| Criado | `src/components/AgentSimulator.tsx` |
| Editado | `src/pages/admin/Templates.tsx` |
| Editado | `src/pages/painel/AgentConfig.tsx` |
| Editado | `supabase/config.toml` |

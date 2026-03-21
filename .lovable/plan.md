

# Plano: Dashboard de Analytics de Conversas ✅

## Implementado

1. **4 Views SQL** — `conversation_stats`, `handover_reason_stats`, `procedure_stats`, `hourly_volume_stats` com `security_invoker = true`.

2. **Hook `useConversationAnalytics`** — Busca dados das views e conversas recentes, computa KPIs (total, resolução bot %, handover %, tempo médio, msgs/conversa).

3. **Página Tenant `/painel/analytics`** — Seletor de período (7d/30d/90d), 5 cards KPI, 4 gráficos Recharts, tabela últimas 20 conversas com modal de histórico.

4. **Página Admin `/admin/analytics`** — Mesma página com seletor de ISP adicional para filtrar por tenant.

5. **Sidebar** — Item "Analytics" adicionado em ambos os painéis.

## Arquivos

| Ação | Arquivo |
|------|---------|
| Criado | `src/hooks/painel/useConversationAnalytics.ts` |
| Criado | `src/pages/painel/Analytics.tsx` |
| Criado | `src/pages/admin/Analytics.tsx` |
| Editado | `src/App.tsx` |
| Editado | `src/components/painel/PainelSidebar.tsx` |
| Editado | `src/components/admin/AdminSidebar.tsx` |
| Migration | 4 VIEWs + security_invoker |

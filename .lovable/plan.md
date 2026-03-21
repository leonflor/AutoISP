

# Plano: Dashboard de Analytics de Conversas

## Resumo

Criar duas páginas de analytics (`/painel/analytics` e `/admin/analytics`) com métricas reais de conversas do Supabase, 4 gráficos Recharts, e tabela das últimas conversas. Inclui uma VIEW SQL para otimizar aggregations.

## 1. Migration: VIEW `conversation_stats`

```sql
CREATE OR REPLACE VIEW public.conversation_stats AS
SELECT
  c.isp_id,
  DATE(c.created_at) as date,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE c.resolved_by = 'bot') as resolved_by_bot,
  COUNT(*) FILTER (WHERE c.resolved_by = 'human' OR c.mode = 'human') as went_to_human,
  AVG(EXTRACT(EPOCH FROM (c.resolved_at - c.created_at))/60)
    FILTER (WHERE c.resolved_at IS NOT NULL) as avg_minutes,
  AVG(msg_counts.msg_count) as avg_messages
FROM conversations c
LEFT JOIN (
  SELECT conversation_id, COUNT(*) as msg_count
  FROM messages GROUP BY conversation_id
) msg_counts ON msg_counts.conversation_id = c.id
WHERE c.channel != 'simulator'
GROUP BY c.isp_id, DATE(c.created_at);
```

RLS on views follows the underlying table's RLS, so `conversations` RLS (ISP member check) applies automatically. No extra policy needed.

Also create a view for handover reasons and procedure stats:

```sql
CREATE OR REPLACE VIEW public.handover_reason_stats AS
SELECT
  c.isp_id,
  c.handover_reason,
  COUNT(*) as count
FROM conversations c
WHERE c.handover_reason IS NOT NULL AND c.channel != 'simulator'
GROUP BY c.isp_id, c.handover_reason;

CREATE OR REPLACE VIEW public.procedure_stats AS
SELECT
  c.isp_id,
  p.name as procedure_name,
  COUNT(*) as total_triggered,
  COUNT(*) FILTER (WHERE c.resolved_at IS NOT NULL) as completed,
  ROUND(
    COUNT(*) FILTER (WHERE c.resolved_at IS NOT NULL)::numeric / NULLIF(COUNT(*), 0) * 100
  ) as completion_rate
FROM conversations c
JOIN procedures p ON p.id = c.active_procedure_id
WHERE c.channel != 'simulator'
GROUP BY c.isp_id, p.name;

CREATE OR REPLACE VIEW public.hourly_volume_stats AS
SELECT
  c.isp_id,
  EXTRACT(HOUR FROM c.created_at) as hour,
  COUNT(*) as count
FROM conversations c
WHERE c.channel != 'simulator'
GROUP BY c.isp_id, EXTRACT(HOUR FROM c.created_at);
```

## 2. Hook `useConversationAnalytics`

**`src/hooks/painel/useConversationAnalytics.ts`**

Receives `{ period: '7d' | '30d' | '90d', ispId?: string }`.

Queries:
- `conversation_stats` filtered by date range → KPI cards + line chart
- `handover_reason_stats` filtered by isp → bar chart (top 5)
- `procedure_stats` filtered by isp → bar chart
- `hourly_volume_stats` filtered by isp → bar chart
- `conversations` last 20 with join to `procedures` → table

Returns computed KPIs: total, bot resolution %, handover %, avg minutes, avg messages.

## 3. Tenant Analytics Page

**`src/pages/painel/Analytics.tsx`**

- Period selector (7d/30d/90d) persisted in URL search params
- 5 KPI cards (total conversations, bot resolution %, handover %, avg time, avg messages)
- Line chart: daily volume (total + bot-resolved)
- Horizontal bar chart: top 5 handover reasons
- Horizontal bar chart: procedures triggered + completion rate
- Bar chart: hourly volume (0-23h)
- Table: last 20 conversations with click → dialog showing message history

## 4. Admin Analytics Page

**`src/pages/admin/Analytics.tsx`**

Same as tenant but with an ISP selector dropdown at the top. When no ISP selected, shows aggregated data across all ISPs (super_admin can see all via RLS).

## 5. Routes and Sidebar

- **`App.tsx`**: Add `analytics` route under `/painel` and `/admin`
- **`PainelSidebar.tsx`**: Add "Analytics" item with `Activity` icon after "Relatórios"
- **`AdminSidebar.tsx`**: Add "Analytics" item after "Relatórios"

## Files

| Action | File |
|--------|------|
| Migration | 4 VIEWs (conversation_stats, handover_reason_stats, procedure_stats, hourly_volume_stats) |
| Create | `src/hooks/painel/useConversationAnalytics.ts` |
| Create | `src/pages/painel/Analytics.tsx` |
| Create | `src/pages/admin/Analytics.tsx` |
| Edit | `src/App.tsx` — add routes |
| Edit | `src/components/painel/PainelSidebar.tsx` — add menu item |
| Edit | `src/components/admin/AdminSidebar.tsx` — add menu item |


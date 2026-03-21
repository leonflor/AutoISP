
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
  EXTRACT(HOUR FROM c.created_at)::int as hour,
  COUNT(*) as count
FROM conversations c
WHERE c.channel != 'simulator'
GROUP BY c.isp_id, EXTRACT(HOUR FROM c.created_at);

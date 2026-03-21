import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, format } from 'date-fns';

type Period = '7d' | '30d' | '90d';

const periodToDays: Record<Period, number> = { '7d': 7, '30d': 30, '90d': 90 };

export function useConversationAnalytics({ period, ispId }: { period: Period; ispId?: string }) {
  const startDate = format(subDays(new Date(), periodToDays[period]), 'yyyy-MM-dd');

  const statsQuery = useQuery({
    queryKey: ['conversation-stats', period, ispId],
    queryFn: async () => {
      let query = supabase
        .from('conversation_stats' as any)
        .select('*')
        .gte('date', startDate);
      if (ispId) query = query.eq('isp_id', ispId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Array<{
        isp_id: string; date: string; total: number; resolved_by_bot: number;
        went_to_human: number; avg_minutes: number | null; avg_messages: number | null;
      }>;
    },
  });

  const handoverQuery = useQuery({
    queryKey: ['handover-reason-stats', ispId],
    queryFn: async () => {
      let query = supabase.from('handover_reason_stats' as any).select('*');
      if (ispId) query = query.eq('isp_id', ispId);
      const { data, error } = await query.order('count', { ascending: false }).limit(5);
      if (error) throw error;
      return (data || []) as Array<{ isp_id: string; handover_reason: string; count: number }>;
    },
  });

  const procedureQuery = useQuery({
    queryKey: ['procedure-stats', ispId],
    queryFn: async () => {
      let query = supabase.from('procedure_stats' as any).select('*');
      if (ispId) query = query.eq('isp_id', ispId);
      const { data, error } = await query.order('total_triggered', { ascending: false }).limit(10);
      if (error) throw error;
      return (data || []) as Array<{
        isp_id: string; procedure_name: string; total_triggered: number;
        completed: number; completion_rate: number;
      }>;
    },
  });

  const hourlyQuery = useQuery({
    queryKey: ['hourly-volume-stats', ispId],
    queryFn: async () => {
      let query = supabase.from('hourly_volume_stats' as any).select('*');
      if (ispId) query = query.eq('isp_id', ispId);
      const { data, error } = await query.order('hour', { ascending: true });
      if (error) throw error;
      return (data || []) as Array<{ isp_id: string; hour: number; count: number }>;
    },
  });

  const recentQuery = useQuery({
    queryKey: ['recent-conversations', ispId],
    queryFn: async () => {
      let query = supabase
        .from('conversations')
        .select('id, user_phone, user_identifier, created_at, resolved_at, mode, resolved_by, handover_reason, active_procedure_id, channel, procedures(name)')
        .neq('channel', 'simulator')
        .order('created_at', { ascending: false })
        .limit(20);
      if (ispId) query = query.eq('isp_id', ispId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Compute KPIs from stats
  const stats = statsQuery.data || [];
  const totalConversations = stats.reduce((s, r) => s + Number(r.total), 0);
  const totalBotResolved = stats.reduce((s, r) => s + Number(r.resolved_by_bot), 0);
  const totalHuman = stats.reduce((s, r) => s + Number(r.went_to_human), 0);
  const avgMinutesArr = stats.filter(r => r.avg_minutes != null).map(r => Number(r.avg_minutes));
  const avgMinutes = avgMinutesArr.length ? avgMinutesArr.reduce((a, b) => a + b, 0) / avgMinutesArr.length : 0;
  const avgMsgArr = stats.filter(r => r.avg_messages != null).map(r => Number(r.avg_messages));
  const avgMessages = avgMsgArr.length ? avgMsgArr.reduce((a, b) => a + b, 0) / avgMsgArr.length : 0;

  const botResolutionRate = totalConversations > 0 ? (totalBotResolved / totalConversations) * 100 : 0;
  const handoverRate = totalConversations > 0 ? (totalHuman / totalConversations) * 100 : 0;

  // Aggregate hourly data across ISPs if no ispId
  const hourlyData = (() => {
    const map = new Map<number, number>();
    for (let i = 0; i < 24; i++) map.set(i, 0);
    (hourlyQuery.data || []).forEach(r => map.set(r.hour, (map.get(r.hour) || 0) + Number(r.count)));
    return Array.from(map.entries()).map(([hour, count]) => ({ hour: `${hour}h`, count }));
  })();

  // Daily chart data
  const dailyData = (() => {
    const map = new Map<string, { total: number; bot: number }>();
    stats.forEach(r => {
      const existing = map.get(r.date) || { total: 0, bot: 0 };
      existing.total += Number(r.total);
      existing.bot += Number(r.resolved_by_bot);
      map.set(r.date, existing);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, total: v.total, bot: v.bot }));
  })();

  return {
    kpis: { totalConversations, botResolutionRate, handoverRate, avgMinutes, avgMessages },
    dailyData,
    handoverReasons: handoverQuery.data || [],
    procedures: procedureQuery.data || [],
    hourlyData,
    recentConversations: recentQuery.data || [],
    isLoading: statsQuery.isLoading || handoverQuery.isLoading || procedureQuery.isLoading || hourlyQuery.isLoading || recentQuery.isLoading,
  };
}

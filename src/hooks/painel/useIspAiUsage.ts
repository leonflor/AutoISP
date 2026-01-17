import { useState, useEffect } from 'react';
import { useIspMembership } from '@/hooks/useIspMembership';
import { supabase } from '@/integrations/supabase/client';

interface AiUsageStats {
  totalTokens: number;
  totalRequests: number;
  tokenLimit: number;
  requestLimit: number;
  costUsd: number;
  usageByAgent: Array<{
    agentId: string;
    agentName: string;
    tokens: number;
    requests: number;
  }>;
}

interface UseIspAiUsageReturn {
  stats: AiUsageStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useIspAiUsage(): UseIspAiUsageReturn {
  const { membership } = useIspMembership();
  const [stats, setStats] = useState<AiUsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!membership?.ispId) {
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get current month start/end
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

      // Fetch AI usage for current month
      const { data: usageData, error: usageError } = await supabase
        .from('ai_usage')
        .select('*')
        .eq('isp_id', membership.ispId)
        .gte('created_at', monthStart)
        .lte('created_at', monthEnd) as { data: any[] | null; error: any };

      if (usageError) throw usageError;

      // Fetch subscription to get plan limits
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select(`
          plan_id,
          plans (
            limits
          )
        `)
        .eq('isp_id', membership.ispId)
        .eq('status', 'ativa')
        .maybeSingle() as { data: any | null; error: any };

      if (subError) throw subError;

      const typedUsageData = usageData || [];

      // Calculate totals
      const totalTokens = typedUsageData.reduce((sum: number, u: any) => sum + (u.total_tokens || 0), 0);
      const totalRequests = typedUsageData.length;
      const costUsd = typedUsageData.reduce((sum: number, u: any) => sum + (u.cost_usd || 0), 0);

      // Get limits from plan
      const planLimits = subData?.plans?.limits || {};
      const tokenLimit = planLimits.monthly_tokens || 100000;
      const requestLimit = planLimits.monthly_requests || 1000;

      // Group by agent
      const agentUsage = new Map<string, { tokens: number; requests: number }>();
      typedUsageData.forEach((u: any) => {
        const current = agentUsage.get(u.agent_id) || { tokens: 0, requests: 0 };
        agentUsage.set(u.agent_id, {
          tokens: current.tokens + (u.total_tokens || 0),
          requests: current.requests + 1,
        });
      });

      setStats({
        totalTokens,
        totalRequests,
        tokenLimit,
        requestLimit,
        costUsd,
        usageByAgent: Array.from(agentUsage.entries()).map(([agentId, data]) => ({
          agentId,
          agentName: agentId, // Will be resolved later
          tokens: data.tokens,
          requests: data.requests,
        })),
      });
    } catch (err) {
      console.error('Error fetching AI usage stats:', err);
      setError('Erro ao carregar estatísticas de IA');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [membership?.ispId]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays } from 'date-fns';

interface ConversationMetrics {
  total: number;
  botResolved: number;
  botRate: number;
  handovers: number;
  avgHandlingMinutes: number;
}

interface AgentInfo {
  id: string;
  customName: string | null;
  customAvatarUrl: string | null;
  templateName: string;
  templateId: string;
  isActive: boolean;
}

interface ErpInfo {
  provider: string;
  maskedUrl: string | null;
  isConnected: boolean;
}

interface KnowledgeBaseInfo {
  documentCount: number;
  totalSizeChars: number;
}

export interface IspDetailData {
  metrics7d: ConversationMetrics;
  metrics30d: ConversationMetrics;
  agent: AgentInfo | null;
  erp: ErpInfo | null;
  whatsappConfigured: boolean;
  knowledgeBase: KnowledgeBaseInfo;
}

function maskUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.hostname}`;
  } catch {
    return url.substring(0, 20) + '***';
  }
}

function computeMetrics(
  conversations: Array<{
    created_at: string | null;
    resolved_by: string | null;
    resolved_at: string | null;
    mode: string;
    handover_at: string | null;
  }>,
  since: Date
): ConversationMetrics {
  const filtered = conversations.filter(
    (c) => c.created_at && new Date(c.created_at) >= since
  );
  const total = filtered.length;
  if (total === 0)
    return { total: 0, botResolved: 0, botRate: 0, handovers: 0, avgHandlingMinutes: 0 };

  const botResolved = filtered.filter((c) => c.resolved_by === 'bot').length;
  const handovers = filtered.filter((c) => c.handover_at !== null).length;

  const handlingTimes = filtered
    .filter((c) => c.resolved_at && c.created_at)
    .map((c) => {
      const start = new Date(c.created_at!).getTime();
      const end = new Date(c.resolved_at!).getTime();
      return (end - start) / 60000;
    })
    .filter((m) => m > 0 && m < 1440);

  const avgHandlingMinutes =
    handlingTimes.length > 0
      ? Math.round(handlingTimes.reduce((a, b) => a + b, 0) / handlingTimes.length)
      : 0;

  return {
    total,
    botResolved,
    botRate: total > 0 ? Math.round((botResolved / total) * 100) : 0,
    handovers,
    avgHandlingMinutes,
  };
}

export function useIspDetail(ispId: string | undefined) {
  return useQuery({
    queryKey: ['isp-detail', ispId],
    enabled: !!ispId,
    queryFn: async (): Promise<IspDetailData> => {
      const now = new Date();
      const since30d = subDays(now, 30);

      // Parallel queries
      const [conversationsRes, agentRes, erpRes, whatsappRes] = await Promise.all([
        supabase
          .from('conversations')
          .select('created_at, resolved_by, resolved_at, mode, handover_at')
          .eq('isp_id', ispId!)
          .gte('created_at', since30d.toISOString()),
        supabase
          .from('tenant_agents')
          .select('id, custom_name, custom_avatar_url, is_active, template_id, agent_templates(name)')
          .eq('isp_id', ispId!)
          .eq('is_active', true)
          .limit(1)
          .single(),
        supabase
          .from('erp_configs')
          .select('provider, api_url, is_connected')
          .eq('isp_id', ispId!)
          .limit(1)
          .single(),
        supabase
          .from('whatsapp_configs')
          .select('is_connected')
          .eq('isp_id', ispId!)
          .limit(1)
          .single(),
      ]);

      const conversations = conversationsRes.data ?? [];
      const since7d = subDays(now, 7);

      // Agent info
      let agent: AgentInfo | null = null;
      if (agentRes.data) {
        const a = agentRes.data as any;
        agent = {
          id: a.id,
          customName: a.custom_name,
          customAvatarUrl: a.custom_avatar_url,
          templateName: a.agent_templates?.name ?? 'Desconhecido',
          templateId: a.template_id,
          isActive: a.is_active,
        };
      }

      // ERP info
      let erp: ErpInfo | null = null;
      if (erpRes.data) {
        erp = {
          provider: erpRes.data.provider,
          maskedUrl: maskUrl(erpRes.data.api_url),
          isConnected: erpRes.data.is_connected ?? false,
        };
      }

      // Knowledge base - need tenant_agent_id
      let knowledgeBase: KnowledgeBaseInfo = { documentCount: 0, totalSizeChars: 0 };
      if (agent) {
        const { data: kbData } = await supabase
          .from('knowledge_bases')
          .select('content')
          .eq('tenant_agent_id', agent.id);

        if (kbData) {
          knowledgeBase = {
            documentCount: kbData.length,
            totalSizeChars: kbData.reduce((sum, doc) => sum + (doc.content?.length ?? 0), 0),
          };
        }
      }

      return {
        metrics7d: computeMetrics(conversations, since7d),
        metrics30d: computeMetrics(conversations, since30d),
        agent,
        erp,
        whatsappConfigured: whatsappRes.data?.is_connected ?? false,
        knowledgeBase,
      };
    },
  });
}

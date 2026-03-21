import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useIspMembership } from '@/hooks/useIspMembership';
import { toast } from 'sonner';

interface AgentWithTemplate {
  id: string;
  custom_name: string | null;
  custom_avatar_url: string | null;
  is_active: boolean | null;
  isp_id: string;
  template_id: string;
  template: {
    name: string;
    type: string;
    tone: string;
    temperature: number;
    default_name: string;
    default_avatar_url: string | null;
  };
}

interface StatusMetrics {
  conversationsToday: number;
  lastMessageAt: string | null;
  isConnected: boolean;
}

export function useAgentConfig() {
  const queryClient = useQueryClient();
  const { membership } = useIspMembership();
  const ispId = membership?.ispId;

  const { data: agent, isLoading: agentLoading } = useQuery({
    queryKey: ['agent-config', ispId],
    queryFn: async () => {
      if (!ispId) return null;

      const { data, error } = await supabase
        .from('tenant_agents')
        .select('id, custom_name, custom_avatar_url, is_active, isp_id, template_id, agent_templates!inner(name, type, tone, temperature, default_name, default_avatar_url)')
        .eq('isp_id', ispId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const tpl = data.agent_templates as any;
      return {
        id: data.id,
        custom_name: data.custom_name,
        custom_avatar_url: data.custom_avatar_url,
        is_active: data.is_active,
        isp_id: data.isp_id,
        template_id: data.template_id,
        template: {
          name: tpl.name,
          type: tpl.type,
          tone: tpl.tone,
          temperature: tpl.temperature,
          default_name: tpl.default_name,
          default_avatar_url: tpl.default_avatar_url,
        },
      } as AgentWithTemplate;
    },
    enabled: !!ispId,
  });

  const { data: status } = useQuery({
    queryKey: ['agent-status', ispId],
    queryFn: async (): Promise<StatusMetrics> => {
      if (!ispId) return { conversationsToday: 0, lastMessageAt: null, isConnected: false };

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [convRes, waRes, msgRes] = await Promise.all([
        supabase
          .from('conversations')
          .select('*', { count: 'exact', head: true })
          .eq('isp_id', ispId)
          .gte('created_at', today.toISOString()),
        supabase
          .from('whatsapp_configs')
          .select('is_connected')
          .eq('isp_id', ispId)
          .maybeSingle(),
        supabase
          .from('whatsapp_messages')
          .select('created_at')
          .eq('isp_id', ispId)
          .eq('direction', 'inbound')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      return {
        conversationsToday: convRes.count ?? 0,
        lastMessageAt: msgRes.data?.created_at ?? null,
        isConnected: waRes.data?.is_connected ?? false,
      };
    },
    enabled: !!ispId,
    refetchInterval: 30000,
  });

  const updateAgent = useMutation({
    mutationFn: async (updates: { custom_name?: string; custom_avatar_url?: string }) => {
      if (!agent?.id) throw new Error('Agente não encontrado');

      const { error } = await supabase
        .from('tenant_agents')
        .update(updates)
        .eq('id', agent.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-config', ispId] });
      toast.success('Agente atualizado com sucesso!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao atualizar agente');
    },
  });

  const uploadAvatar = async (file: File): Promise<string> => {
    if (!ispId) throw new Error('ISP não encontrado');

    const ext = file.name.split('.').pop();
    const path = `${ispId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('agent-avatars')
      .upload(path, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('agent-avatars')
      .getPublicUrl(path);

    return `${data.publicUrl}?t=${Date.now()}`;
  };

  return {
    agent,
    agentLoading,
    status: status ?? { conversationsToday: 0, lastMessageAt: null, isConnected: false },
    updateAgent,
    uploadAvatar,
    ispId,
  };
}

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TemplateIspAgent {
  id: string; // isp_agent_id
  isp_id: string;
  display_name: string | null;
  is_enabled: boolean;
  voice_tone: string | null;
  isp_name: string;
}

export function useTemplateIspAgents(templateId: string | undefined) {
  return useQuery({
    queryKey: ['template-isp-agents', templateId],
    queryFn: async (): Promise<TemplateIspAgent[]> => {
      if (!templateId) return [];

      const { data, error } = await supabase
        .from('isp_agents')
        .select(`
          id,
          isp_id,
          display_name,
          is_enabled,
          voice_tone,
          isps!inner (name)
        `)
        .eq('agent_id', templateId);

      if (error) throw error;

      return (data || []).map((agent: any) => ({
        id: agent.id,
        isp_id: agent.isp_id,
        display_name: agent.display_name,
        is_enabled: agent.is_enabled,
        voice_tone: agent.voice_tone,
        isp_name: agent.isps.name,
      }));
    },
    enabled: !!templateId,
  });
}

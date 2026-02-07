import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AgentTool {
  id: string;
  agent_id: string;
  name: string;
  description: string;
  parameters_schema: Record<string, unknown>;
  handler_type: string;
  handler_config: Record<string, unknown> | null;
  is_active: boolean;
  requires_erp: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AgentToolInsert {
  agent_id: string;
  name: string;
  description: string;
  parameters_schema: Record<string, unknown>;
  handler_type: string;
  handler_config?: Record<string, unknown>;
  is_active?: boolean;
  requires_erp?: boolean;
  sort_order?: number;
}

export function useAgentTools(agentId: string | undefined) {
  return useQuery({
    queryKey: ['agent-tools', agentId],
    queryFn: async () => {
      if (!agentId) return [];
      const { data, error } = await supabase
        .from('ai_agent_tools' as any)
        .select('*')
        .eq('agent_id', agentId)
        .order('sort_order');
      if (error) throw error;
      return (data || []) as unknown as AgentTool[];
    },
    enabled: !!agentId,
  });
}

export function useCreateAgentTool() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (tool: AgentToolInsert) => {
      const { data, error } = await supabase
        .from('ai_agent_tools' as any)
        .insert(tool as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['agent-tools', vars.agent_id] });
      toast({ title: 'Tool criada', description: 'Ferramenta adicionada ao agente.' });
    },
    onError: (e: Error) => {
      toast({ title: 'Erro ao criar tool', description: e.message, variant: 'destructive' });
    },
  });
}

export function useUpdateAgentTool() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, agent_id, ...data }: Partial<AgentTool> & { id: string; agent_id: string }) => {
      const { error } = await supabase
        .from('ai_agent_tools' as any)
        .update(data as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['agent-tools', vars.agent_id] });
      toast({ title: 'Tool atualizada' });
    },
    onError: (e: Error) => {
      toast({ title: 'Erro ao atualizar tool', description: e.message, variant: 'destructive' });
    },
  });
}

export function useDeleteAgentTool() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, agent_id }: { id: string; agent_id: string }) => {
      const { error } = await supabase
        .from('ai_agent_tools' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['agent-tools', vars.agent_id] });
      toast({ title: 'Tool excluída' });
    },
    onError: (e: Error) => {
      toast({ title: 'Erro ao excluir', description: e.message, variant: 'destructive' });
    },
  });
}

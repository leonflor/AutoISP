import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { FlowState, AgentFlow, FlowStateInsert } from './useAgentFlows';

export function useGlobalFlows() {
  return useQuery({
    queryKey: ['global-flows'],
    queryFn: async () => {
      const { data: flows, error } = await supabase
        .from('ai_agent_flows' as any)
        .select('*')
        .order('sort_order');
      if (error) throw error;

      const flowIds = (flows || []).map((f: any) => f.id);
      let statesMap: Record<string, FlowState[]> = {};

      if (flowIds.length > 0) {
        const { data: states } = await supabase
          .from('flow_state_definitions' as any)
          .select('*')
          .in('flow_id', flowIds)
          .order('step_order');

        for (const state of (states || []) as unknown as FlowState[]) {
          if (!statesMap[state.flow_id]) statesMap[state.flow_id] = [];
          statesMap[state.flow_id].push(state);
        }
      }

      return ((flows || []) as unknown as AgentFlow[]).map(f => ({
        ...f,
        states: statesMap[f.id] || [],
      }));
    },
  });
}

export interface GlobalFlowInsert {
  name: string;
  slug: string;
  description?: string;
  trigger_keywords?: string[];
  trigger_prompt?: string;
  is_active?: boolean;
  is_fixed?: boolean;
  sort_order?: number;
}

export function useCreateGlobalFlow() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (flow: GlobalFlowInsert) => {
      const { data, error } = await supabase
        .from('ai_agent_flows' as any)
        .insert(flow as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as AgentFlow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['global-flows'] });
      toast({ title: 'Fluxo criado' });
    },
    onError: (e: Error) => {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    },
  });
}

export function useUpdateGlobalFlow() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<AgentFlow> & { id: string }) => {
      const { states, ...flowData } = data as any;
      const { error } = await supabase
        .from('ai_agent_flows' as any)
        .update(flowData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['global-flows'] });
      toast({ title: 'Fluxo atualizado' });
    },
    onError: (e: Error) => {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    },
  });
}

export function useDeleteGlobalFlow() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ai_agent_flows' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['global-flows'] });
      toast({ title: 'Fluxo excluído' });
    },
    onError: (e: Error) => {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    },
  });
}

export function useSaveGlobalFlowStates() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ flowId, states }: { flowId: string; states: FlowStateInsert[] }) => {
      await supabase.from('flow_state_definitions' as any).delete().eq('flow_id', flowId);
      if (states.length > 0) {
        const { error } = await supabase
          .from('flow_state_definitions' as any)
          .insert(states.map((s, i) => ({ ...s, flow_id: flowId, step_order: i + 1 })) as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['global-flows'] });
      toast({ title: 'Estados salvos' });
    },
    onError: (e: Error) => {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    },
  });
}

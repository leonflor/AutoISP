import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// ── Types ──

export interface TransitionRule {
  type: 'tool_success' | 'user_input' | 'option_selected' | 'switch_flow' | 'auto';
  tool_name?: string;
  pattern?: string;
  options?: string[];
  target_flow_slug?: string;
  goto_state: string;
}

export interface FlowState {
  id: string;
  flow_id: string;
  state_key: string;
  step_order: number;
  objective: string;
  allowed_tools: string[];
  transition_rules: TransitionRule[];
  fallback_message: string | null;
  max_attempts: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgentFlow {
  id: string;
  agent_id: string;
  name: string;
  slug: string;
  description: string | null;
  trigger_keywords: string[];
  trigger_prompt: string | null;
  is_active: boolean;
  is_fixed: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  states?: FlowState[];
}

export interface AgentFlowInsert {
  agent_id: string;
  name: string;
  slug: string;
  description?: string;
  trigger_keywords?: string[];
  trigger_prompt?: string;
  is_active?: boolean;
  is_fixed?: boolean;
  sort_order?: number;
}

export interface FlowStateInsert {
  flow_id: string;
  state_key: string;
  step_order: number;
  objective: string;
  allowed_tools?: string[];
  transition_rules?: TransitionRule[];
  fallback_message?: string;
  max_attempts?: number;
  is_active?: boolean;
}

// ── Hooks ──

export function useAgentFlows(agentId: string | undefined) {
  return useQuery({
    queryKey: ['agent-flows', agentId],
    queryFn: async () => {
      if (!agentId) return [];
      const { data: flows, error } = await supabase
        .from('ai_agent_flows' as any)
        .select('*')
        .eq('agent_id', agentId)
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
    enabled: !!agentId,
  });
}

export function useCreateAgentFlow() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (flow: AgentFlowInsert) => {
      const { data, error } = await supabase
        .from('ai_agent_flows' as any)
        .insert(flow as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as AgentFlow;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['agent-flows', vars.agent_id] });
      toast({ title: 'Fluxo criado' });
    },
    onError: (e: Error) => {
      toast({ title: 'Erro ao criar fluxo', description: e.message, variant: 'destructive' });
    },
  });
}

export function useUpdateAgentFlow() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, agent_id, ...data }: Partial<AgentFlow> & { id: string; agent_id: string }) => {
      const { states, ...flowData } = data as any;
      const { error } = await supabase
        .from('ai_agent_flows' as any)
        .update(flowData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['agent-flows', vars.agent_id] });
      toast({ title: 'Fluxo atualizado' });
    },
    onError: (e: Error) => {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    },
  });
}

export function useDeleteAgentFlow() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, agent_id }: { id: string; agent_id: string }) => {
      const { error } = await supabase
        .from('ai_agent_flows' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['agent-flows', vars.agent_id] });
      toast({ title: 'Fluxo excluído' });
    },
    onError: (e: Error) => {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    },
  });
}

// ── Flow States ──

export function useSaveFlowStates() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ flowId, agentId, states }: { flowId: string; agentId: string; states: FlowStateInsert[] }) => {
      // Delete existing states, then insert new ones
      await supabase.from('flow_state_definitions' as any).delete().eq('flow_id', flowId);

      if (states.length > 0) {
        const { error } = await supabase
          .from('flow_state_definitions' as any)
          .insert(states.map((s, i) => ({ ...s, flow_id: flowId, step_order: i + 1 })) as any);
        if (error) throw error;
      }
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['agent-flows', vars.agentId] });
      toast({ title: 'Estados salvos' });
    },
    onError: (e: Error) => {
      toast({ title: 'Erro ao salvar estados', description: e.message, variant: 'destructive' });
    },
  });
}

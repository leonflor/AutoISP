import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FlowStep {
  id: string;
  flow_id: string;
  step_order: number;
  name: string;
  instruction: string;
  expected_input: string | null;
  tool_id: string | null;
  tool_auto_execute: boolean;
  condition_to_advance: string | null;
  fallback_instruction: string | null;
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
  steps?: FlowStep[];
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

export interface FlowStepInsert {
  flow_id: string;
  step_order: number;
  name: string;
  instruction: string;
  expected_input?: string;
  tool_id?: string | null;
  tool_auto_execute?: boolean;
  condition_to_advance?: string;
  fallback_instruction?: string;
  is_active?: boolean;
}

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

      // Load steps for each flow
      const flowIds = (flows || []).map((f: any) => f.id);
      let stepsMap: Record<string, FlowStep[]> = {};

      if (flowIds.length > 0) {
        const { data: steps } = await supabase
          .from('ai_agent_flow_steps' as any)
          .select('*')
          .in('flow_id', flowIds)
          .order('step_order');

        for (const step of (steps || []) as unknown as FlowStep[]) {
          if (!stepsMap[step.flow_id]) stepsMap[step.flow_id] = [];
          stepsMap[step.flow_id].push(step);
        }
      }

      return ((flows || []) as unknown as AgentFlow[]).map(f => ({
        ...f,
        steps: stepsMap[f.id] || [],
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
      const { steps, ...flowData } = data as any;
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

// ── Flow Steps ──

export function useSaveFlowSteps() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ flowId, agentId, steps }: { flowId: string; agentId: string; steps: FlowStepInsert[] }) => {
      // Delete existing steps, then insert new ones
      await supabase.from('ai_agent_flow_steps' as any).delete().eq('flow_id', flowId);

      if (steps.length > 0) {
        const { error } = await supabase
          .from('ai_agent_flow_steps' as any)
          .insert(steps.map((s, i) => ({ ...s, flow_id: flowId, step_order: i + 1 })) as any);
        if (error) throw error;
      }
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['agent-flows', vars.agentId] });
      toast({ title: 'Etapas salvas' });
    },
    onError: (e: Error) => {
      toast({ title: 'Erro ao salvar etapas', description: e.message, variant: 'destructive' });
    },
  });
}

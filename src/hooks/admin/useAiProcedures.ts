import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AiProcedure {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  tools_count?: number;
  flows_count?: number;
  agents_count?: number;
}

export interface AiProcedureInsert {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  is_active?: boolean;
  sort_order?: number;
}

// ── Procedures CRUD ──

export function useAiProcedures() {
  return useQuery({
    queryKey: ['ai-procedures'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_procedures' as any)
        .select('*')
        .order('sort_order');
      if (error) throw error;

      const procedures = (data || []) as unknown as AiProcedure[];

      // Load counts
      const procIds = procedures.map(p => p.id);
      if (procIds.length === 0) return procedures;

      const [toolsRes, flowsRes, agentsRes] = await Promise.all([
        supabase.from('ai_procedure_tools' as any).select('procedure_id').in('procedure_id', procIds),
        supabase.from('ai_procedure_flows' as any).select('procedure_id').in('procedure_id', procIds),
        supabase.from('ai_agent_procedures' as any).select('procedure_id').in('procedure_id', procIds).eq('is_active', true),
      ]);

      const countBy = (arr: any[] | null, key: string) => {
        const map: Record<string, number> = {};
        (arr || []).forEach(r => { map[r[key]] = (map[r[key]] || 0) + 1; });
        return map;
      };

      const toolsCounts = countBy(toolsRes.data, 'procedure_id');
      const flowsCounts = countBy(flowsRes.data, 'procedure_id');
      const agentsCounts = countBy(agentsRes.data, 'procedure_id');

      return procedures.map(p => ({
        ...p,
        tools_count: toolsCounts[p.id] || 0,
        flows_count: flowsCounts[p.id] || 0,
        agents_count: agentsCounts[p.id] || 0,
      }));
    },
  });
}

export function useAiProcedure(id: string | undefined) {
  return useQuery({
    queryKey: ['ai-procedure', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('ai_procedures' as any)
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as unknown as AiProcedure;
    },
    enabled: !!id,
  });
}

export function useCreateProcedure() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (proc: AiProcedureInsert) => {
      const { data, error } = await supabase
        .from('ai_procedures' as any)
        .insert(proc as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as AiProcedure;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai-procedures'] });
      toast({ title: 'Procedimento criado' });
    },
    onError: (e: Error) => {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    },
  });
}

export function useUpdateProcedure() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<AiProcedure> & { id: string }) => {
      const { tools_count, flows_count, agents_count, ...cleanData } = data as any;
      const { error } = await supabase
        .from('ai_procedures' as any)
        .update(cleanData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['ai-procedures'] });
      qc.invalidateQueries({ queryKey: ['ai-procedure', vars.id] });
      toast({ title: 'Procedimento atualizado' });
    },
    onError: (e: Error) => {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    },
  });
}

export function useDeleteProcedure() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ai_procedures' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai-procedures'] });
      toast({ title: 'Procedimento excluído' });
    },
    onError: (e: Error) => {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    },
  });
}

// ── Procedure Tools junction ──

export function useProcedureTools(procedureId: string | undefined) {
  return useQuery({
    queryKey: ['procedure-tools', procedureId],
    queryFn: async () => {
      if (!procedureId) return [];
      const { data, error } = await supabase
        .from('ai_procedure_tools' as any)
        .select('*')
        .eq('procedure_id', procedureId)
        .order('sort_order');
      if (error) throw error;
      return (data || []) as unknown as { id: string; procedure_id: string; tool_id: string; sort_order: number }[];
    },
    enabled: !!procedureId,
  });
}

export function useToggleProcedureTool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ procedureId, toolId, add }: { procedureId: string; toolId: string; add: boolean }) => {
      if (add) {
        const { error } = await supabase
          .from('ai_procedure_tools' as any)
          .insert({ procedure_id: procedureId, tool_id: toolId } as any);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ai_procedure_tools' as any)
          .delete()
          .eq('procedure_id', procedureId)
          .eq('tool_id', toolId);
        if (error) throw error;
      }
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['procedure-tools', vars.procedureId] });
      qc.invalidateQueries({ queryKey: ['ai-procedures'] });
    },
  });
}

// ── Procedure Flows junction ──

export function useProcedureFlows(procedureId: string | undefined) {
  return useQuery({
    queryKey: ['procedure-flows', procedureId],
    queryFn: async () => {
      if (!procedureId) return [];
      const { data, error } = await supabase
        .from('ai_procedure_flows' as any)
        .select('*')
        .eq('procedure_id', procedureId)
        .order('sort_order');
      if (error) throw error;
      return (data || []) as unknown as { id: string; procedure_id: string; flow_id: string; sort_order: number }[];
    },
    enabled: !!procedureId,
  });
}

export function useToggleProcedureFlow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ procedureId, flowId, add }: { procedureId: string; flowId: string; add: boolean }) => {
      if (add) {
        const { error } = await supabase
          .from('ai_procedure_flows' as any)
          .insert({ procedure_id: procedureId, flow_id: flowId } as any);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ai_procedure_flows' as any)
          .delete()
          .eq('procedure_id', procedureId)
          .eq('flow_id', flowId);
        if (error) throw error;
      }
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['procedure-flows', vars.procedureId] });
      qc.invalidateQueries({ queryKey: ['ai-procedures'] });
    },
  });
}

// ── Agent Procedures junction ──

export function useAgentProcedures(agentId: string | undefined) {
  return useQuery({
    queryKey: ['agent-procedures', agentId],
    queryFn: async () => {
      if (!agentId) return [];
      const { data, error } = await supabase
        .from('ai_agent_procedures' as any)
        .select('*')
        .eq('agent_id', agentId)
        .order('sort_order');
      if (error) throw error;
      return (data || []) as unknown as { id: string; agent_id: string; procedure_id: string; is_active: boolean; sort_order: number }[];
    },
    enabled: !!agentId,
  });
}

export function useToggleAgentProcedure() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ agentId, procedureId, add }: { agentId: string; procedureId: string; add: boolean }) => {
      if (add) {
        const { error } = await supabase
          .from('ai_agent_procedures' as any)
          .insert({ agent_id: agentId, procedure_id: procedureId } as any);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ai_agent_procedures' as any)
          .delete()
          .eq('agent_id', agentId)
          .eq('procedure_id', procedureId);
        if (error) throw error;
      }
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['agent-procedures', vars.agentId] });
      qc.invalidateQueries({ queryKey: ['ai-procedures'] });
      toast({ title: 'Procedimentos atualizados' });
    },
    onError: (e: Error) => {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    },
  });
}

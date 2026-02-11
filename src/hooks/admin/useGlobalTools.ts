import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GlobalTool {
  id: string;
  agent_id: string | null;
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

export interface GlobalToolInsert {
  name: string;
  description: string;
  parameters_schema: Record<string, unknown>;
  handler_type: string;
  handler_config?: Record<string, unknown>;
  is_active?: boolean;
  requires_erp?: boolean;
  sort_order?: number;
}

export function useGlobalTools() {
  return useQuery({
    queryKey: ['global-tools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_agent_tools' as any)
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return (data || []) as unknown as GlobalTool[];
    },
  });
}

export function useCreateGlobalTool() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (tool: GlobalToolInsert) => {
      const { data, error } = await supabase
        .from('ai_agent_tools' as any)
        .insert(tool as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['global-tools'] });
      toast({ title: 'Ferramenta criada' });
    },
    onError: (e: Error) => {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    },
  });
}

export function useUpdateGlobalTool() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<GlobalTool> & { id: string }) => {
      const { error } = await supabase
        .from('ai_agent_tools' as any)
        .update(data as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['global-tools'] });
      toast({ title: 'Ferramenta atualizada' });
    },
    onError: (e: Error) => {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    },
  });
}

export function useDeleteGlobalTool() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ai_agent_tools' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['global-tools'] });
      toast({ title: 'Ferramenta excluída' });
    },
    onError: (e: Error) => {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    },
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, Json } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';

export type ProcedureDefinition = {
  triggers: {
    keywords: string[];
    min_confidence: number;
  };
  steps: ProcedureStep[];
};

/** DB/backend format — matches procedure-runner.ts */
export type ProcedureStep = {
  name?: string;
  instruction: string;
  available_functions?: string[];
  advance_condition?: string; // "always" | "function_success" | "data_collected" | "user_confirmation" | "llm_judge"
  on_complete?: {
    action: string; // "next_step" | "end_procedure" | "handover_agent" | "handover_human" | "conditional"
    resolution?: string;
    reason?: string;
    agent_type?: string;
    conditions?: { if_context: string; then: Record<string, unknown> | string }[];
  };
  stuck_after_turns?: number;
  stuck_action?: string;
};

export type ProcedureWithMeta = Tables<'procedures'> & {
  template_name: string;
  active_conversations: number;
  definition: ProcedureDefinition;
};

export function useProcedures(templateFilter?: string) {
  const queryClient = useQueryClient();

  const proceduresQuery = useQuery({
    queryKey: ['procedures', templateFilter],
    queryFn: async (): Promise<ProcedureWithMeta[]> => {
      let query = supabase
        .from('procedures')
        .select('*')
        .eq('is_current', true)
        .order('created_at', { ascending: false });

      if (templateFilter) {
        query = query.eq('template_id', templateFilter);
      }

      const { data: procedures, error } = await query;
      if (error) throw error;
      if (!procedures?.length) return [];

      // Fetch template names and conversation counts in parallel
      const templateIds = [...new Set(procedures.map(p => p.template_id))];

      const [templatesRes, ...convCounts] = await Promise.all([
        supabase
          .from('agent_templates')
          .select('id, name')
          .in('id', templateIds),
        ...procedures.map(p =>
          supabase
            .from('conversations')
            .select('id', { count: 'exact', head: true })
            .eq('active_procedure_id', p.id)
            .is('resolved_at', null)
            .then(r => ({ id: p.id, count: r.count ?? 0 }))
        ),
      ]);

      const templateMap = Object.fromEntries(
        (templatesRes.data ?? []).map(t => [t.id, t.name])
      );
      const convMap = Object.fromEntries(
        convCounts.map(c => [c.id, c.count])
      );

      return procedures.map(p => ({
        ...p,
        definition: p.definition as unknown as ProcedureDefinition,
        template_name: templateMap[p.template_id] ?? 'Desconhecido',
        active_conversations: convMap[p.id] ?? 0,
      }));
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      description: string | null;
      template_id: string;
      is_active: boolean;
      definition: ProcedureDefinition;
    }) => {
      const row = {
        name: data.name,
        description: data.description,
        template_id: data.template_id,
        is_active: data.is_active,
        definition: JSON.parse(JSON.stringify(data.definition)),
        version: 1,
        is_current: true,
      };
      const { error } = await supabase.from('procedures').insert([row]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procedures'] });
      toast({ title: 'Procedimento criado com sucesso' });
    },
  });

  const versionMutation = useMutation({
    mutationFn: async (data: {
      existingId: string;
      name: string;
      description: string | null;
      template_id: string;
      is_active: boolean;
      definition: ProcedureDefinition;
      currentVersion: number;
    }) => {
      // 1. Deactivate current version
      const { error: updateErr } = await supabase
        .from('procedures')
        .update({ is_current: false })
        .eq('id', data.existingId);
      if (updateErr) throw updateErr;

      // 2. Insert new version
      const row = {
        name: data.name,
        description: data.description,
        template_id: data.template_id,
        is_active: data.is_active,
        definition: JSON.parse(JSON.stringify(data.definition)),
        version: data.currentVersion + 1,
        is_current: true,
      };
      const { error: insertErr } = await supabase.from('procedures').insert([row]);
      if (insertErr) throw insertErr;

      return data.currentVersion + 1;
    },
    onSuccess: (newVersion) => {
      queryClient.invalidateQueries({ queryKey: ['procedures'] });
      toast({ title: `Procedimento atualizado — versão ${newVersion} ativa` });
    },
  });

  return {
    ...proceduresQuery,
    create: createMutation,
    saveNewVersion: versionMutation,
  };
}

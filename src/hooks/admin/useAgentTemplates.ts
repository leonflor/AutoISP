import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type AgentTemplate = Tables<'agent_templates'> & {
  procedures_count: number;
  tenants_count: number;
};

export function useAgentTemplates() {
  const queryClient = useQueryClient();

  const templatesQuery = useQuery({
    queryKey: ['agent-templates'],
    queryFn: async (): Promise<AgentTemplate[]> => {
      const { data: templates, error } = await supabase
        .from('agent_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!templates?.length) return [];

      // Fetch counts in parallel
      const [procedureCounts, tenantCounts] = await Promise.all([
        Promise.all(
          templates.map((t) =>
            supabase
              .from('procedures')
              .select('id', { count: 'exact', head: true })
              .eq('template_id', t.id)
              .then((r) => ({ id: t.id, count: r.count ?? 0 }))
          )
        ),
        Promise.all(
          templates.map((t) =>
            supabase
              .from('tenant_agents')
              .select('id', { count: 'exact', head: true })
              .eq('template_id', t.id)
              .then((r) => ({ id: t.id, count: r.count ?? 0 }))
          )
        ),
      ]);

      const procMap = Object.fromEntries(procedureCounts.map((p) => [p.id, p.count]));
      const tenantMap = Object.fromEntries(tenantCounts.map((t) => [t.id, t.count]));

      return templates.map((t) => ({
        ...t,
        procedures_count: procMap[t.id] ?? 0,
        tenants_count: tenantMap[t.id] ?? 0,
      }));
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (data: TablesInsert<'agent_templates'> & { id?: string }) => {
      const { id, ...rest } = data;
      if (id) {
        const { error } = await supabase.from('agent_templates').update(rest as TablesUpdate<'agent_templates'>).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('agent_templates').insert(rest as TablesInsert<'agent_templates'>);
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agent-templates'] }),
  });

  return { ...templatesQuery, upsert: upsertMutation };
}

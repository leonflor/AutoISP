import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

// Hook para verificar ISPs que usam um template
export interface TemplateUsageIsp {
  id: string;
  name: string;
  agentCount: number;
}

export interface TemplateUsage {
  count: number;
  isps: TemplateUsageIsp[];
}

export function useTemplateUsage(templateId: string | undefined) {
  return useQuery({
    queryKey: ['template-usage', templateId],
    queryFn: async (): Promise<TemplateUsage> => {
      if (!templateId) return { count: 0, isps: [] };

      const { data, error } = await supabase
        .from('isp_agents')
        .select(`
          id,
          isp_id,
          display_name,
          isps!inner (id, name)
        `)
        .eq('agent_id', templateId);

      if (error) throw error;

      // Agrupar por ISP
      const ispMap = new Map<string, { name: string; agents: string[] }>();
      data?.forEach((agent: any) => {
        const ispId = agent.isp_id;
        if (!ispMap.has(ispId)) {
          ispMap.set(ispId, {
            name: agent.isps.name,
            agents: [],
          });
        }
        ispMap.get(ispId)!.agents.push(agent.display_name || 'Sem nome');
      });

      return {
        count: ispMap.size,
        isps: Array.from(ispMap.entries()).map(([id, data]) => ({
          id,
          name: data.name,
          agentCount: data.agents.length,
        })),
      };
    },
    enabled: !!templateId,
  });
}

export type AiAgent = Tables<'ai_agents'>;
export type AiAgentInsert = TablesInsert<'ai_agents'>;
export type AiAgentUpdate = TablesUpdate<'ai_agents'>;

type AiAgentScope = 'tenant' | 'platform';

interface UseAiAgentTemplatesOptions {
  scope?: AiAgentScope;
  isActive?: boolean;
}

export function useAiAgentTemplates(options: UseAiAgentTemplatesOptions = {}) {
  const { scope, isActive } = options;

  return useQuery({
    queryKey: ['ai-agent-templates', scope, isActive],
    queryFn: async () => {
      let query = supabase
        .from('ai_agents')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (scope) {
        query = query.eq('scope', scope);
      }

      if (isActive !== undefined) {
        query = query.eq('is_active', isActive);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AiAgent[];
    },
  });
}

export function useAiAgentTemplate(id: string | undefined) {
  return useQuery({
    queryKey: ['ai-agent-template', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('ai_agents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as AiAgent;
    },
    enabled: !!id,
  });
}

export function useCreateAiAgent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (agent: AiAgentInsert) => {
      const { data, error } = await supabase
        .from('ai_agents')
        .insert(agent)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agent-templates'] });
      toast({
        title: 'Agente criado',
        description: 'O template de agente foi criado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar agente',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateAiAgent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...agent }: AiAgentUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('ai_agents')
        .update(agent)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agent-templates'] });
      queryClient.invalidateQueries({ queryKey: ['ai-agent-template'] });
      toast({
        title: 'Agente atualizado',
        description: 'O template de agente foi atualizado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar agente',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteAiAgent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ai_agents')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agent-templates'] });
      toast({
        title: 'Agente excluído',
        description: 'O template de agente foi excluído com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao excluir agente',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDuplicateAiAgent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (agent: AiAgent) => {
      const { id, created_at, updated_at, ...rest } = agent;
      const duplicated: AiAgentInsert = {
        ...rest,
        name: `${rest.name} (cópia)`,
        slug: `${rest.slug}-copy-${Date.now()}`,
        is_active: false,
      };

      const { data, error } = await supabase
        .from('ai_agents')
        .insert(duplicated)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agent-templates'] });
      toast({
        title: 'Agente duplicado',
        description: 'O template foi duplicado com sucesso. Edite-o para personalizar.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao duplicar agente',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

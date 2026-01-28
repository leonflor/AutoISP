import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type AiAgent = Tables<'ai_agents'>;
export type AiAgentInsert = TablesInsert<'ai_agents'>;
export type AiAgentUpdate = TablesUpdate<'ai_agents'>;

type AiAgentScope = 'tenant' | 'platform';

interface UseAiAgentTemplatesOptions {
  scope?: AiAgentScope;
  isActive?: boolean;
  isPremium?: boolean;
}

export function useAiAgentTemplates(options: UseAiAgentTemplatesOptions = {}) {
  const { scope, isActive, isPremium } = options;

  return useQuery({
    queryKey: ['ai-agent-templates', scope, isActive, isPremium],
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

      if (isPremium !== undefined) {
        query = query.eq('is_premium', isPremium);
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

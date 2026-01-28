import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type AiSecurityClause = Tables<'ai_security_clauses'>;
export type AiSecurityClauseInsert = TablesInsert<'ai_security_clauses'>;
export type AiSecurityClauseUpdate = TablesUpdate<'ai_security_clauses'>;

export function useAiSecurityClauses() {
  return useQuery({
    queryKey: ['ai-security-clauses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_security_clauses')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as AiSecurityClause[];
    },
  });
}

export function useAiSecurityClause(id: string | undefined) {
  return useQuery({
    queryKey: ['ai-security-clause', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('ai_security_clauses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as AiSecurityClause;
    },
    enabled: !!id,
  });
}

export function useCreateSecurityClause() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (clause: AiSecurityClauseInsert) => {
      const { data, error } = await supabase
        .from('ai_security_clauses')
        .insert(clause)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-security-clauses'] });
      toast({
        title: 'Cláusula criada',
        description: 'A cláusula de segurança foi criada com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar cláusula',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateSecurityClause() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...clause }: AiSecurityClauseUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('ai_security_clauses')
        .update(clause)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-security-clauses'] });
      queryClient.invalidateQueries({ queryKey: ['ai-security-clause'] });
      toast({
        title: 'Cláusula atualizada',
        description: 'A cláusula de segurança foi atualizada com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar cláusula',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteSecurityClause() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ai_security_clauses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-security-clauses'] });
      toast({
        title: 'Cláusula excluída',
        description: 'A cláusula de segurança foi excluída com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao excluir cláusula',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useReorderSecurityClauses() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (clauses: { id: string; sort_order: number }[]) => {
      const promises = clauses.map(({ id, sort_order }) =>
        supabase
          .from('ai_security_clauses')
          .update({ sort_order })
          .eq('id', id)
      );

      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error);
      
      if (errors.length > 0) {
        throw new Error('Falha ao reordenar algumas cláusulas');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-security-clauses'] });
      toast({
        title: 'Ordem atualizada',
        description: 'A ordem das cláusulas foi atualizada.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao reordenar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Plan } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

interface CreatePlanData {
  name: string;
  slug: string;
  description?: string;
  price_monthly: number;
  price_yearly?: number;
  is_active?: boolean;
  features?: Record<string, unknown>;
  limits?: Record<string, number>;
}

interface UpdatePlanData extends Partial<CreatePlanData> {
  id: string;
}

export const usePlans = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const plansQuery = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as Plan[];
    },
  });

  const createPlanMutation = useMutation({
    mutationFn: async (data: CreatePlanData) => {
      const insertData = {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        price_monthly: data.price_monthly,
        price_yearly: data.price_yearly || null,
        is_active: data.is_active ?? true,
        features: data.features || {},
        limits: data.limits || {},
      };

      const { data: plan, error } = await supabase
        .from('plans')
        .insert(insertData as any)
        .select()
        .single();

      if (error) throw error;
      return plan as Plan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast({
        title: 'Plano criado com sucesso',
        description: 'O plano foi cadastrado no sistema.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar plano',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: UpdatePlanData) => {
      const { data: plan, error } = await (supabase
        .from('plans') as any)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return plan as Plan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast({
        title: 'Plano atualizado',
        description: 'As informações foram salvas.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar plano',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast({
        title: 'Plano removido',
        description: 'O plano foi removido do sistema.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao remover plano',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    plans: plansQuery.data ?? [],
    activePlans: (plansQuery.data ?? []).filter(p => p.is_active),
    isLoading: plansQuery.isLoading,
    error: plansQuery.error,
    createPlan: createPlanMutation.mutateAsync,
    updatePlan: updatePlanMutation.mutateAsync,
    deletePlan: deletePlanMutation.mutateAsync,
    isCreating: createPlanMutation.isPending,
    isUpdating: updatePlanMutation.isPending,
    isDeleting: deletePlanMutation.isPending,
  };
};

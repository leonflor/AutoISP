import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Subscription, StatusAssinatura } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionWithDetails extends Subscription {
  isp?: { id: string; name: string; email: string };
  plan?: { id: string; name: string; price_monthly: number };
}

interface UpdateSubscriptionData {
  id: string;
  status?: StatusAssinatura;
  cancel_at_period_end?: boolean;
  canceled_at?: string;
}

export const useSubscriptions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const subscriptionsQuery = useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          isp:isps(id, name, email),
          plan:plans(id, name, price_monthly)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as SubscriptionWithDetails[];
    },
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateSubscriptionData) => {
      const { data: subscription, error } = await (supabase
        .from('subscriptions') as any)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return subscription as Subscription;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast({
        title: 'Assinatura atualizada',
        description: 'As informações foram salvas.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar assinatura',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: subscription, error } = await (supabase
        .from('subscriptions') as any)
        .update({ 
          status: 'cancelada',
          canceled_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return subscription as Subscription;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast({
        title: 'Assinatura cancelada',
        description: 'A assinatura foi cancelada.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao cancelar assinatura',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Calculate MRR (Monthly Recurring Revenue)
  const calculateMRR = () => {
    const activeSubscriptions = (subscriptionsQuery.data ?? []).filter(
      s => s.status === 'ativa' && s.plan
    );
    return activeSubscriptions.reduce((acc, sub) => {
      return acc + (sub.plan?.price_monthly ?? 0);
    }, 0);
  };

  return {
    subscriptions: subscriptionsQuery.data ?? [],
    activeSubscriptions: (subscriptionsQuery.data ?? []).filter(s => s.status === 'ativa'),
    trialSubscriptions: (subscriptionsQuery.data ?? []).filter(s => s.status === 'trial'),
    isLoading: subscriptionsQuery.isLoading,
    error: subscriptionsQuery.error,
    updateSubscription: updateSubscriptionMutation.mutateAsync,
    cancelSubscription: cancelSubscriptionMutation.mutateAsync,
    isUpdating: updateSubscriptionMutation.isPending,
    isCanceling: cancelSubscriptionMutation.isPending,
    mrr: calculateMRR(),
  };
};

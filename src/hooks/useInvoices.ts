import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Invoice, StatusFatura } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

interface InvoiceWithDetails extends Invoice {
  isp?: { id: string; name: string; email: string };
  subscription?: { id: string; plan_id: string };
}

interface UpdateInvoiceData {
  id: string;
  status?: StatusFatura;
  paid_at?: string;
}

export const useInvoices = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const invoicesQuery = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          isp:isps(id, name, email),
          subscription:subscriptions(id, plan_id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as InvoiceWithDetails[];
    },
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateInvoiceData) => {
      const { data: invoice, error } = await (supabase
        .from('invoices') as any)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return invoice as Invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: 'Fatura atualizada',
        description: 'As informações foram salvas.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar fatura',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const markAsPaidMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: invoice, error } = await (supabase
        .from('invoices') as any)
        .update({ 
          status: 'pago',
          paid_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return invoice as Invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: 'Fatura marcada como paga',
        description: 'O status foi atualizado.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao marcar fatura como paga',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const cancelInvoiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: invoice, error } = await (supabase
        .from('invoices') as any)
        .update({ status: 'cancelado' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return invoice as Invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: 'Fatura cancelada',
        description: 'O status foi atualizado.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao cancelar fatura',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Calculate totals
  const pendingTotal = (invoicesQuery.data ?? [])
    .filter(i => i.status === 'pendente')
    .reduce((acc, i) => acc + i.amount, 0);

  const overdueTotal = (invoicesQuery.data ?? [])
    .filter(i => i.status === 'vencido')
    .reduce((acc, i) => acc + i.amount, 0);

  const paidThisMonth = (invoicesQuery.data ?? [])
    .filter(i => {
      if (i.status !== 'pago' || !i.paid_at) return false;
      const paidDate = new Date(i.paid_at);
      const now = new Date();
      return paidDate.getMonth() === now.getMonth() && 
             paidDate.getFullYear() === now.getFullYear();
    })
    .reduce((acc, i) => acc + i.amount, 0);

  return {
    invoices: invoicesQuery.data ?? [],
    pendingInvoices: (invoicesQuery.data ?? []).filter(i => i.status === 'pendente'),
    overdueInvoices: (invoicesQuery.data ?? []).filter(i => i.status === 'vencido'),
    paidInvoices: (invoicesQuery.data ?? []).filter(i => i.status === 'pago'),
    isLoading: invoicesQuery.isLoading,
    error: invoicesQuery.error,
    updateInvoice: updateInvoiceMutation.mutateAsync,
    markAsPaid: markAsPaidMutation.mutateAsync,
    cancelInvoice: cancelInvoiceMutation.mutateAsync,
    isUpdating: updateInvoiceMutation.isPending,
    pendingTotal,
    overdueTotal,
    paidThisMonth,
  };
};

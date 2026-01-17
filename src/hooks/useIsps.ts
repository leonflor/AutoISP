import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Isp, StatusCliente } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

interface CreateIspData {
  name: string;
  slug: string;
  document: string;
  email: string;
  phone?: string;
  status?: StatusCliente;
  trial_ends_at?: string;
}

interface UpdateIspData extends Partial<CreateIspData> {
  id: string;
}

export const useIsps = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const ispsQuery = useQuery({
    queryKey: ['isps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('isps')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as Isp[];
    },
  });

  const createIspMutation = useMutation({
    mutationFn: async (data: CreateIspData) => {
      const insertData = {
        name: data.name,
        slug: data.slug,
        document: data.document,
        email: data.email,
        phone: data.phone || null,
        status: data.status || 'trial',
        trial_ends_at: data.trial_ends_at || null,
      };
      
      const { data: isp, error } = await supabase
        .from('isps')
        .insert(insertData as any)
        .select()
        .single();

      if (error) throw error;
      return isp as Isp;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isps'] });
      toast({
        title: 'ISP criado com sucesso',
        description: 'O provedor foi cadastrado no sistema.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar ISP',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateIspMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateIspData) => {
      const { data: isp, error } = await (supabase
        .from('isps') as any)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return isp as Isp;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isps'] });
      toast({
        title: 'ISP atualizado',
        description: 'As informações foram salvas.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar ISP',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteIspMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('isps')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isps'] });
      toast({
        title: 'ISP removido',
        description: 'O provedor foi removido do sistema.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao remover ISP',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    isps: ispsQuery.data ?? [],
    isLoading: ispsQuery.isLoading,
    error: ispsQuery.error,
    createIsp: createIspMutation.mutateAsync,
    updateIsp: updateIspMutation.mutateAsync,
    deleteIsp: deleteIspMutation.mutateAsync,
    isCreating: createIspMutation.isPending,
    isUpdating: updateIspMutation.isPending,
    isDeleting: deleteIspMutation.isPending,
  };
};

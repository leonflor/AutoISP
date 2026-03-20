import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Isp, StatusCliente } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { subDays } from 'date-fns';

interface CreateIspData {
  name: string;
  slug: string;
  document: string;
  email: string;
  phone?: string;
  status?: StatusCliente;
}

interface UpdateIspData extends Partial<CreateIspData> {
  id: string;
}

export interface IspWithExtras extends Isp {
  agentTemplateName: string | null;
  erpProvider: string | null;
  conversations30d: number;
  botRate30d: number;
}

export const useIsps = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const ispsQuery = useQuery({
    queryKey: ['isps'],
    queryFn: async () => {
      const { data: isps, error } = await supabase
        .from('isps')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const ispList = (isps ?? []) as Isp[];
      if (ispList.length === 0) return [] as IspWithExtras[];

      const ispIds = ispList.map((i) => i.id);
      const since30d = subDays(new Date(), 30).toISOString();

      const [agentsRes, erpRes, convsRes] = await Promise.all([
        supabase
          .from('tenant_agents')
          .select('isp_id, agent_templates(name)')
          .in('isp_id', ispIds)
          .eq('is_active', true),
        supabase
          .from('erp_configs')
          .select('isp_id, provider')
          .in('isp_id', ispIds),
        supabase
          .from('conversations')
          .select('isp_id, resolved_by')
          .in('isp_id', ispIds)
          .gte('created_at', since30d),
      ]);

      const agentMap = new Map<string, string>();
      (agentsRes.data ?? []).forEach((a: any) => {
        agentMap.set(a.isp_id, a.agent_templates?.name ?? 'Ativo');
      });

      const erpMap = new Map<string, string>();
      (erpRes.data ?? []).forEach((e: any) => {
        erpMap.set(e.isp_id, e.provider);
      });

      const convMap = new Map<string, { total: number; bot: number }>();
      (convsRes.data ?? []).forEach((c: any) => {
        const cur = convMap.get(c.isp_id) ?? { total: 0, bot: 0 };
        cur.total++;
        if (c.resolved_by === 'bot') cur.bot++;
        convMap.set(c.isp_id, cur);
      });

      return ispList.map((isp): IspWithExtras => {
        const conv = convMap.get(isp.id);
        return {
          ...isp,
          agentTemplateName: agentMap.get(isp.id) ?? null,
          erpProvider: erpMap.get(isp.id) ?? null,
          conversations30d: conv?.total ?? 0,
          botRate30d: conv && conv.total > 0 ? Math.round((conv.bot / conv.total) * 100) : 0,
        };
      });
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
        status: data.status || 'pendente',
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
      toast({ title: 'ISP criado com sucesso', description: 'O provedor foi cadastrado no sistema.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao criar ISP', description: error.message, variant: 'destructive' });
    },
  });

  const updateIspMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateIspData) => {
      const { data: isp, error } = await (supabase.from('isps') as any)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return isp as Isp;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isps'] });
      toast({ title: 'ISP atualizado', description: 'As informações foram salvas.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar ISP', description: error.message, variant: 'destructive' });
    },
  });

  const deleteIspMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('isps').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isps'] });
      toast({ title: 'ISP removido', description: 'O provedor foi removido do sistema.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao remover ISP', description: error.message, variant: 'destructive' });
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

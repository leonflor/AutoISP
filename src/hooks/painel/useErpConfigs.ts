import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useIspMembership } from '@/hooks/useIspMembership';
import { toast } from 'sonner';

export type ErpProvider = 'ixc' | 'mk_solutions' | 'sgp' | 'hubsoft';

export interface ErpConfig {
  id: string;
  isp_id: string;
  provider: ErpProvider;
  api_url: string | null;
  api_key_encrypted: string | null;
  username: string | null;
  password_encrypted: string | null;
  sync_enabled: boolean | null;
  last_sync_at: string | null;
  sync_config: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  is_active: boolean | null;
  is_connected: boolean | null;
  connected_at: string | null;
  masked_key: string | null;
  encryption_iv: string | null;
  display_name: string | null;
}

export interface SaveErpConfigData {
  provider: ErpProvider;
  api_url: string;
  credentials: {
    token?: string;
    username?: string;
    password?: string;
    api_key?: string;
  };
  options?: {
    self_signed_cert?: boolean;
    sync_interval?: number;
  };
}

export interface TestResult {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}

export function useErpConfigs() {
  const { membership } = useIspMembership();
  const ispId = membership?.ispId;
  const queryClient = useQueryClient();

  // Fetch all ERP configs for the ISP
  const { data: configs, isLoading, error } = useQuery({
    queryKey: ['erp-configs', ispId],
    queryFn: async () => {
      if (!ispId) return [];

      const { data, error } = await supabase
        .from('erp_configs')
        .select('*')
        .eq('isp_id', ispId);

      if (error) throw error;
      return data as ErpConfig[];
    },
    enabled: !!ispId,
  });

  // Save config mutation
  const saveConfig = useMutation({
    mutationFn: async (data: SaveErpConfigData) => {
      const { data: result, error } = await supabase.functions.invoke(
        'save-erp-config',
        { body: data }
      );

      if (error) {
        if (error instanceof FunctionsHttpError) {
          try {
            const errorBody = await error.context.json();
            throw new Error(errorBody.error || 'Erro ao salvar configuração');
          } catch (e) {
            if (e instanceof Error && e.message !== 'Erro ao salvar configuração') throw e;
            throw new Error('Erro ao salvar configuração');
          }
        }
        throw error;
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['erp-configs', ispId] });
      toast.success(result.message || 'Configuração salva com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao salvar configuração');
    },
  });

  // Test connection mutation
  const testConnection = useMutation({
    mutationFn: async (provider: ErpProvider): Promise<TestResult> => {
      const { data: result, error } = await supabase.functions.invoke(
        'test-erp',
        { body: { provider } }
      );

      if (error) throw error;
      return result as TestResult;
    },
    onSuccess: (result, provider) => {
      queryClient.invalidateQueries({ queryKey: ['erp-configs', ispId] });
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao testar conexão');
    },
  });

  // Remove config mutation
  const removeConfig = useMutation({
    mutationFn: async (provider: ErpProvider) => {
      if (!ispId) throw new Error('ISP não identificado');

      const { error } = await supabase
        .from('erp_configs')
        .delete()
        .eq('isp_id', ispId)
        .eq('provider', provider);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['erp-configs', ispId] });
      toast.success('Integração removida');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao remover integração');
    },
  });

  // Helper to get config by provider
  const getConfigByProvider = (provider: ErpProvider) => {
    return configs?.find((c) => c.provider === provider);
  };

  // Count active configs
  const activeConfigsCount = configs?.filter((c) => c.is_connected).length || 0;

  return {
    configs,
    isLoading,
    error,
    saveConfig,
    testConnection,
    removeConfig,
    getConfigByProvider,
    activeConfigsCount,
    ispId,
  };
}

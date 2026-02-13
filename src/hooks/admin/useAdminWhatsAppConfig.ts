import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminWhatsAppConfig {
  id: string;
  provider: string;
  api_url: string | null;
  api_key_encrypted: string | null;
  encryption_iv: string | null;
  phone_number: string | null;
  phone_number_id: string | null;
  verify_token: string | null;
  webhook_url: string | null;
  is_connected: boolean;
  connected_at: string | null;
  created_at: string;
  updated_at: string;
}

interface UpdateConfigData {
  phone_number_id: string;
  access_token: string;
  phone_number: string;
  verify_token: string;
}

const SUPABASE_URL = 'https://zvxcwwhsjtdliihlvvof.supabase.co';
const SUPABASE_PROJECT_ID = 'zvxcwwhsjtdliihlvvof';

export function useAdminWhatsAppConfig() {
  const queryClient = useQueryClient();

  const webhookUrl = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/whatsapp-webhook?admin=true`;

  const { data: config, isLoading, error } = useQuery({
    queryKey: ['admin-whatsapp-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_whatsapp_config')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as AdminWhatsAppConfig | null;
    },
  });

  const saveConfig = useMutation({
    mutationFn: async (data: UpdateConfigData) => {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) throw new Error('Não autenticado');

      const response = await fetch(`${SUPABASE_URL}/functions/v1/save-whatsapp-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          context: 'admin',
          phone_number_id: data.phone_number_id,
          access_token: data.access_token || undefined,
          phone_number: data.phone_number,
          verify_token: data.verify_token || undefined,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Erro ao salvar configurações');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-whatsapp-config'] });
      toast.success('Configurações salvas com sucesso!');
    },
    onError: (error: Error) => {
      console.error('Error saving config:', error);
      toast.error(error.message || 'Erro ao salvar configurações');
    },
  });

  const testConnection = useMutation({
    mutationFn: async () => {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) throw new Error('Não autenticado');

      const response = await fetch(`${SUPABASE_URL}/functions/v1/test-whatsapp-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ context: 'admin' }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Falha na conexão');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-whatsapp-config'] });
      toast.success('Conexão estabelecida com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Falha na conexão: ${error.message}`);
    },
  });

  return {
    config,
    isLoading,
    error,
    saveConfig,
    testConnection,
    webhookUrl,
  };
}

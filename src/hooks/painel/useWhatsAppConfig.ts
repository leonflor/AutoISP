import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useIspMembership } from '@/hooks/useIspMembership';
import { toast } from 'sonner';

interface WhatsAppConfig {
  id: string;
  isp_id: string;
  provider: string | null;
  api_url: string | null;
  api_key_encrypted: string | null;
  encryption_iv: string | null;
  phone_number: string | null;
  webhook_url: string | null;
  is_connected: boolean | null;
  connected_at: string | null;
  instance_name: string | null;
  qr_code: string | null;
  settings?: Record<string, any> | null;
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

export function useWhatsAppConfig() {
  const queryClient = useQueryClient();
  const { membership } = useIspMembership();
  const ispId = membership?.ispId;

  const generateWebhookUrl = (id: string) => {
    return `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/whatsapp-webhook?isp=${id}`;
  };

  const { data: config, isLoading, error } = useQuery({
    queryKey: ['whatsapp-config', ispId],
    queryFn: async () => {
      if (!ispId) return null;
      
      const { data, error } = await supabase
        .from('whatsapp_configs')
        .select('*')
        .eq('isp_id', ispId)
        .maybeSingle();

      if (error) throw error;
      return data as WhatsAppConfig | null;
    },
    enabled: !!ispId,
  });

  const saveConfig = useMutation({
    mutationFn: async (data: UpdateConfigData) => {
      if (!ispId) throw new Error('ISP não encontrado');

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
          context: 'isp',
          isp_id: ispId,
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
      queryClient.invalidateQueries({ queryKey: ['whatsapp-config', ispId] });
      toast.success('Configurações salvas com sucesso!');
    },
    onError: (error: Error) => {
      console.error('Error saving config:', error);
      toast.error(error.message || 'Erro ao salvar configurações');
    },
  });

  const testConnection = useMutation({
    mutationFn: async () => {
      if (!ispId) throw new Error('ISP não encontrado');

      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) throw new Error('Não autenticado');

      const response = await fetch(`${SUPABASE_URL}/functions/v1/test-whatsapp-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ context: 'isp', isp_id: ispId }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Falha na conexão');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-config', ispId] });
      toast.success('Conexão estabelecida com sucesso!');
    },
    onError: (error: Error) => {
      console.error('Connection test failed:', error);
      toast.error(`Falha na conexão: ${error.message}`);
    },
  });

  return {
    config,
    isLoading,
    error,
    saveConfig,
    testConnection,
    generateWebhookUrl: ispId ? () => generateWebhookUrl(ispId) : () => '',
    ispId,
  };
}

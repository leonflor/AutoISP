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

const SUPABASE_PROJECT_ID = 'zvxcwwhsjtdliihlvvof';

export function useWhatsAppConfig() {
  const queryClient = useQueryClient();
  const { membership } = useIspMembership();
  const ispId = membership?.ispId;

  const generateWebhookUrl = (ispId: string) => {
    return `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/whatsapp-webhook?isp=${ispId}`;
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

      const webhookUrl = generateWebhookUrl(ispId);
      
      const configData = {
        isp_id: ispId,
        provider: 'meta',
        api_url: 'https://graph.facebook.com/v18.0',
        api_key_encrypted: data.access_token,
        phone_number: data.phone_number,
        webhook_url: webhookUrl,
        settings: {
          phone_number_id: data.phone_number_id,
          verify_token: data.verify_token,
        },
        updated_at: new Date().toISOString(),
      };

      if (config?.id) {
        const { error } = await supabase
          .from('whatsapp_configs')
          .update(configData)
          .eq('id', config.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('whatsapp_configs')
          .insert(configData);
        
        if (error) throw error;
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-config', ispId] });
      toast.success('Configurações salvas com sucesso!');
    },
    onError: (error) => {
      console.error('Error saving config:', error);
      toast.error('Erro ao salvar configurações');
    },
  });

  const testConnection = useMutation({
    mutationFn: async () => {
      if (!config?.settings?.phone_number_id || !config?.api_key_encrypted) {
        throw new Error('Credenciais não configuradas');
      }

      const phoneNumberId = config.settings.phone_number_id;
      const accessToken = config.api_key_encrypted;

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${phoneNumberId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Falha na conexão');
      }

      // Update connection status
      await supabase
        .from('whatsapp_configs')
        .update({
          is_connected: true,
          connected_at: new Date().toISOString(),
        })
        .eq('id', config.id);

      return true;
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

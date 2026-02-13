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

const SUPABASE_PROJECT_ID = 'zvxcwwhsjtdliihlvvof';

export function useAdminWhatsAppConfig() {
  const queryClient = useQueryClient();

  const webhookUrl = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/whatsapp-webhook?admin=true`;

  const { data: config, isLoading, error } = useQuery({
    queryKey: ['admin-whatsapp-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_whatsapp_config' as any)
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as AdminWhatsAppConfig | null;
    },
  });

  const saveConfig = useMutation({
    mutationFn: async (data: UpdateConfigData) => {
      const configData = {
        provider: 'meta',
        api_url: 'https://graph.facebook.com/v18.0',
        api_key_encrypted: data.access_token,
        phone_number: data.phone_number,
        phone_number_id: data.phone_number_id,
        verify_token: data.verify_token,
        webhook_url: webhookUrl,
        updated_at: new Date().toISOString(),
      };

      if (config?.id) {
        const { error } = await supabase
          .from('admin_whatsapp_config' as any)
          .update(configData)
          .eq('id', config.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('admin_whatsapp_config' as any)
          .insert(configData);
        if (error) throw error;
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-whatsapp-config'] });
      toast.success('Configurações salvas com sucesso!');
    },
    onError: (error) => {
      console.error('Error saving config:', error);
      toast.error('Erro ao salvar configurações');
    },
  });

  const testConnection = useMutation({
    mutationFn: async () => {
      if (!config?.phone_number_id || !config?.api_key_encrypted) {
        throw new Error('Credenciais não configuradas');
      }

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${config.phone_number_id}`,
        {
          headers: {
            'Authorization': `Bearer ${config.api_key_encrypted}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Falha na conexão');
      }

      await supabase
        .from('admin_whatsapp_config' as any)
        .update({
          is_connected: true,
          connected_at: new Date().toISOString(),
        })
        .eq('id', config.id);

      return true;
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

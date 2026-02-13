import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useIspMembership } from '@/hooks/useIspMembership';
import { toast } from 'sonner';

export interface WhatsAppMessage {
  id: string;
  isp_id: string | null;
  wamid: string | null;
  direction: 'inbound' | 'outbound';
  message_type: string;
  recipient_phone: string | null;
  sender_phone: string | null;
  template_name: string | null;
  template_params: Record<string, any> | null;
  content: string | null;
  status: string;
  status_updated_at: string | null;
  error_code: string | null;
  error_message: string | null;
  conversation_id: string | null;
  subscriber_id: string | null;
  conversation_type: string | null;
  cost_usd: number | null;
  created_at: string;
  sent_at: string | null;
  delivered_at: string | null;
  read_at: string | null;
}

interface SendMessageData {
  to: string;
  message?: string;
  template_name?: string;
  template_language?: string;
  template_params?: Record<string, string>[];
}

export function useWhatsAppMessages() {
  const queryClient = useQueryClient();
  const { membership } = useIspMembership();
  const ispId = membership?.ispId;

  const { data: messages, isLoading, error } = useQuery({
    queryKey: ['whatsapp-messages', ispId],
    queryFn: async () => {
      if (!ispId) return [];

      const { data, error } = await supabase
        .from('whatsapp_messages' as any)
        .select('*')
        .eq('isp_id', ispId)
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      return (data || []) as unknown as WhatsAppMessage[];
    },
    enabled: !!ispId,
  });

  const sendMessage = useMutation({
    mutationFn: async (data: SendMessageData) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error('Não autenticado');

      const response = await fetch(
        `https://zvxcwwhsjtdliihlvvof.supabase.co/functions/v1/send-whatsapp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Erro ao enviar mensagem');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-messages', ispId] });
      toast.success('Mensagem enviada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  return {
    messages: messages || [],
    isLoading,
    error,
    sendMessage,
    ispId,
  };
}

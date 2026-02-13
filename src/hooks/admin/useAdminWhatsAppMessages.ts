import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { WhatsAppMessage } from '@/hooks/painel/useWhatsAppMessages';

interface SendMessageData {
  to: string;
  message?: string;
  template_name?: string;
  template_language?: string;
  template_params?: Record<string, string>[];
}

export function useAdminWhatsAppMessages() {
  const queryClient = useQueryClient();

  const { data: messages, isLoading, error } = useQuery({
    queryKey: ['admin-whatsapp-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whatsapp_messages' as any)
        .select('*')
        .is('isp_id', null)
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      return (data || []) as unknown as WhatsAppMessage[];
    },
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
      queryClient.invalidateQueries({ queryKey: ['admin-whatsapp-messages'] });
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
  };
}

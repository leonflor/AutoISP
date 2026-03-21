import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface ConversationHistoryDialogProps {
  conversationId: string;
  onClose: () => void;
}

export function ConversationHistoryDialog({ conversationId, onClose }: ConversationHistoryDialogProps) {
  const { data: messages, isLoading } = useQuery({
    queryKey: ['conv-messages', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('id, role, content, created_at, tool_name')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Histórico da Conversa</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <div className="space-y-3">
            {messages?.map(m => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  {m.tool_name && <Badge variant="outline" className="mb-1 text-[10px]">{m.tool_name}</Badge>}
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  <p className="text-[10px] opacity-60 mt-1">{format(new Date(m.created_at), 'HH:mm')}</p>
                </div>
              </div>
            ))}
            {messages?.length === 0 && <p className="text-center text-muted-foreground py-4">Sem mensagens</p>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

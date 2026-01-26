import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, StickyNote, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { TicketMessage, TicketNote } from '@/hooks/admin/useSupportTickets';

interface TicketChatProps {
  messages: TicketMessage[];
  notes: TicketNote[];
  onSendMessage: (message: string) => void;
  onSendNote: (content: string) => void;
  isSendingMessage: boolean;
  isSendingNote: boolean;
  ticketDescription?: string;
}

type MessageMode = 'reply' | 'note';

export function TicketChat({
  messages,
  notes,
  onSendMessage,
  onSendNote,
  isSendingMessage,
  isSendingNote,
  ticketDescription,
}: TicketChatProps) {
  const [mode, setMode] = useState<MessageMode>('reply');
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Combinar mensagens e notas em ordem cronológica
  const allItems = [
    ...messages.map(m => ({ ...m, type: 'message' as const })),
    ...notes.map(n => ({ ...n, type: 'note' as const })),
  ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  // Scroll para o final quando novas mensagens chegam
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [allItems.length]);

  const handleSend = () => {
    if (!text.trim()) return;
    
    if (mode === 'reply') {
      onSendMessage(text);
    } else {
      onSendNote(text);
    }
    
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Área de mensagens */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {/* Descrição inicial do ticket */}
          {ticketDescription && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                  ISP
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                  <p className="text-sm whitespace-pre-wrap">{ticketDescription}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Descrição inicial</p>
              </div>
            </div>
          )}

          {/* Lista de mensagens e notas */}
          {allItems.map((item) => {
            if (item.type === 'note') {
              // Nota interna
              return (
                <div key={`note-${item.id}`} className="flex gap-3 justify-end">
                  <div className="flex-1 flex flex-col items-end">
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3 max-w-[80%]">
                      <div className="flex items-center gap-2 mb-1">
                        <StickyNote className="h-3 w-3 text-yellow-600" />
                        <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400">
                          Nota Interna
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{item.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.user?.full_name || 'Staff'} · {format(new Date(item.created_at), "dd/MM HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-yellow-500 text-white text-xs">
                      {getInitials(item.user?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              );
            }

            // Mensagem normal
            const isStaff = item.is_staff;
            return (
              <div 
                key={`msg-${item.id}`} 
                className={cn("flex gap-3", isStaff && "justify-end")}
              >
                {!isStaff && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                      {getInitials(item.user?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={cn("flex-1 flex flex-col", isStaff && "items-end")}>
                  <div className={cn(
                    "rounded-lg p-3 max-w-[80%]",
                    isStaff 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted"
                  )}>
                    <p className="text-sm whitespace-pre-wrap">{item.message}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.user?.full_name || (isStaff ? 'Staff' : 'Cliente')} · {format(new Date(item.created_at), "dd/MM HH:mm", { locale: ptBR })}
                  </p>
                </div>
                {isStaff && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getInitials(item.user?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}

          {allItems.length === 0 && !ticketDescription && (
            <div className="text-center text-muted-foreground py-8">
              Nenhuma mensagem ainda
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Área de input */}
      <div className="border-t p-4 space-y-3">
        <Tabs value={mode} onValueChange={(v) => setMode(v as MessageMode)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reply">Resposta</TabsTrigger>
            <TabsTrigger value="note" className="gap-1">
              <StickyNote className="h-3 w-3" />
              Nota Interna
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <Textarea
            placeholder={mode === 'reply' ? 'Digite sua resposta...' : 'Nota interna (visível apenas para staff)...'}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              "min-h-[80px] resize-none",
              mode === 'note' && "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-300"
            )}
          />
          <Button 
            onClick={handleSend} 
            disabled={!text.trim() || (mode === 'reply' ? isSendingMessage : isSendingNote)}
            className="self-end"
          >
            {(mode === 'reply' ? isSendingMessage : isSendingNote) ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

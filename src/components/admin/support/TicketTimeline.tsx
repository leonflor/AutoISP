import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageSquare, StickyNote, CheckCircle, User, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TicketMessage, TicketNote } from '@/hooks/admin/useSupportTickets';

interface TimelineEvent {
  id: string;
  type: 'created' | 'message' | 'note' | 'status_change' | 'assigned';
  description: string;
  user?: string;
  timestamp: string;
}

interface TicketTimelineProps {
  createdAt: string;
  messages: TicketMessage[];
  notes: TicketNote[];
  firstResponseAt?: string | null;
  resolvedAt?: string | null;
}

export function TicketTimeline({
  createdAt,
  messages,
  notes,
  firstResponseAt,
  resolvedAt,
}: TicketTimelineProps) {
  // Construir eventos da timeline
  const events: TimelineEvent[] = [
    {
      id: 'created',
      type: 'created',
      description: 'Ticket criado',
      timestamp: createdAt,
    },
  ];

  // Adicionar mensagens
  messages.forEach((msg) => {
    events.push({
      id: `msg-${msg.id}`,
      type: 'message',
      description: msg.is_staff ? 'Resposta enviada' : 'Mensagem do cliente',
      user: msg.user?.full_name,
      timestamp: msg.created_at,
    });
  });

  // Adicionar notas
  notes.forEach((note) => {
    events.push({
      id: `note-${note.id}`,
      type: 'note',
      description: 'Nota interna adicionada',
      user: note.user?.full_name,
      timestamp: note.created_at,
    });
  });

  // Adicionar primeira resposta
  if (firstResponseAt) {
    events.push({
      id: 'first-response',
      type: 'status_change',
      description: 'Primeira resposta (SLA)',
      timestamp: firstResponseAt,
    });
  }

  // Adicionar resolução
  if (resolvedAt) {
    events.push({
      id: 'resolved',
      type: 'status_change',
      description: 'Ticket resolvido',
      timestamp: resolvedAt,
    });
  }

  // Ordenar por timestamp
  events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const getIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'created': return Clock;
      case 'message': return MessageSquare;
      case 'note': return StickyNote;
      case 'status_change': return CheckCircle;
      case 'assigned': return User;
      default: return Clock;
    }
  };

  const getIconColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'created': return 'text-blue-500';
      case 'message': return 'text-primary';
      case 'note': return 'text-yellow-500';
      case 'status_change': return 'text-green-500';
      case 'assigned': return 'text-purple-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">Timeline</h4>
      <div className="relative">
        {/* Linha vertical */}
        <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />
        
        <div className="space-y-3">
          {events.map((event, index) => {
            const Icon = getIcon(event.type);
            
            return (
              <div key={event.id} className="relative flex gap-3 pl-8">
                {/* Ícone */}
                <div className={cn(
                  "absolute left-0 p-1 rounded-full bg-background border",
                  getIconColor(event.type)
                )}>
                  <Icon className="h-3 w-3" />
                </div>
                
                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{event.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {event.user && <span>{event.user}</span>}
                    <span>
                      {format(new Date(event.timestamp), "dd/MM HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

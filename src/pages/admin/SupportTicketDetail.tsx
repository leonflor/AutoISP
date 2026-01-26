import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useTicketDetail,
  useTicketMessages,
  useTicketNotes,
  useSendTicketMessage,
  useAddTicketNote,
} from '@/hooks/admin/useSupportTickets';
import { TicketChat } from '@/components/admin/support/TicketChat';
import { TicketSidebar } from '@/components/admin/support/TicketSidebar';
import { TicketTimeline } from '@/components/admin/support/TicketTimeline';
import { getCategoryLabel, getPriorityLabel } from '@/components/admin/support/TicketFilters';

export default function SupportTicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: ticket, isLoading: ticketLoading } = useTicketDetail(id);
  const { data: messages = [], isLoading: messagesLoading } = useTicketMessages(id);
  const { data: notes = [], isLoading: notesLoading } = useTicketNotes(id);
  
  const sendMessage = useSendTicketMessage();
  const addNote = useAddTicketNote();

  const handleSendMessage = (message: string) => {
    if (id) {
      sendMessage.mutate({ ticketId: id, message });
    }
  };

  const handleSendNote = (content: string) => {
    if (id) {
      addNote.mutate({ ticketId: id, content });
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'normal': return 'bg-blue-500 text-white';
      case 'low': return 'bg-gray-400 text-white';
      default: return '';
    }
  };

  if (ticketLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Skeleton className="h-[600px]" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-[200px]" />
            <Skeleton className="h-[150px]" />
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/admin/tickets')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Ticket não encontrado
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/tickets')}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
            <span className="font-mono text-muted-foreground">
              #{ticket.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <h1 className="text-2xl font-bold">{ticket.subject}</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{getCategoryLabel(ticket.category)}</Badge>
            <Badge className={cn("text-xs", getPriorityBadgeClass(ticket.priority))}>
              {getPriorityLabel(ticket.priority)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-3">
          <Card className="h-[calc(100vh-280px)] min-h-[500px]">
            <TicketChat
              messages={messages}
              notes={notes}
              onSendMessage={handleSendMessage}
              onSendNote={handleSendNote}
              isSendingMessage={sendMessage.isPending}
              isSendingNote={addNote.isPending}
              ticketDescription={ticket.description}
            />
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <TicketSidebar ticket={ticket} />
          
          {/* Timeline */}
          <Card>
            <CardContent className="pt-4">
              <TicketTimeline
                createdAt={ticket.created_at}
                messages={messages}
                notes={notes}
                firstResponseAt={ticket.first_response_at}
                resolvedAt={ticket.resolved_at}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

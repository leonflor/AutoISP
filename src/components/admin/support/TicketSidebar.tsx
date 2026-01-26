import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Building2, Mail, Phone, Calendar, User, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SLABadge } from './SLABadge';
import { getStatusLabel, getPriorityLabel, getCategoryLabel } from './TicketFilters';
import { useAvailableAgents, useUpdateTicket } from '@/hooks/admin/useSupportTickets';

interface TicketSidebarProps {
  ticket: {
    id: string;
    status: string;
    priority: string;
    category: string;
    created_at: string;
    first_response_at: string | null;
    sla_response_hours: number;
    sla_resolution_hours: number;
    assigned_to: string | null;
    assigned_user: { full_name: string; email: string } | null;
    isp: { id: string; name: string; slug: string; status: string; email: string | null; phone: string | null } | null;
    subscription: { plan: { name: string } } | null;
    created_by_user: { full_name: string; email: string } | null;
  };
}

const statusOptions = [
  { value: 'open', label: 'Aberto' },
  { value: 'in_progress', label: 'Em Andamento' },
  { value: 'waiting', label: 'Aguardando' },
  { value: 'resolved', label: 'Resolvido' },
  { value: 'closed', label: 'Fechado' },
];

const priorityOptions = [
  { value: 'urgent', label: 'Urgente' },
  { value: 'high', label: 'Alta' },
  { value: 'normal', label: 'Normal' },
  { value: 'low', label: 'Baixa' },
];

export function TicketSidebar({ ticket }: TicketSidebarProps) {
  const { data: agents } = useAvailableAgents();
  const updateTicket = useUpdateTicket();

  const handleStatusChange = (status: string) => {
    updateTicket.mutate({ ticketId: ticket.id, updates: { status } });
  };

  const handlePriorityChange = (priority: string) => {
    updateTicket.mutate({ ticketId: ticket.id, updates: { priority } });
  };

  const handleAssignChange = (assignedTo: string) => {
    updateTicket.mutate({ 
      ticketId: ticket.id, 
      updates: { assigned_to: assignedTo === 'unassigned' ? null : assignedTo } 
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'open': return 'default';
      case 'in_progress': return 'secondary';
      case 'waiting': return 'outline';
      case 'resolved': return 'default';
      case 'closed': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-4">
      {/* Informações do ISP */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-medium">{ticket.isp?.name || 'ISP não encontrado'}</p>
            <Badge variant="outline" className="mt-1">
              {ticket.subscription?.plan?.name || 'Sem plano'}
            </Badge>
          </div>
          
          {ticket.isp?.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span className="truncate">{ticket.isp.email}</span>
            </div>
          )}
          
          {ticket.isp?.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{ticket.isp.phone}</span>
            </div>
          )}

          {ticket.created_by_user && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-3 w-3" />
              <span className="truncate">{ticket.created_by_user.full_name}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Controles do Ticket */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Gerenciar Ticket</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Status</label>
            <Select value={ticket.status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Prioridade</label>
            <Select value={ticket.priority} onValueChange={handlePriorityChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Atendente</label>
            <Select 
              value={ticket.assigned_to || 'unassigned'} 
              onValueChange={handleAssignChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Não atribuído</SelectItem>
                {agents?.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.full_name || agent.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* SLA */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            SLA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Resposta</span>
            <SLABadge
              createdAt={ticket.created_at}
              slaHours={ticket.sla_response_hours}
              firstResponseAt={ticket.first_response_at}
              status={ticket.status}
              type="response"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Resolução</span>
            <SLABadge
              createdAt={ticket.created_at}
              slaHours={ticket.sla_resolution_hours}
              firstResponseAt={null}
              status={ticket.status}
              type="resolution"
            />
          </div>
        </CardContent>
      </Card>

      {/* Detalhes */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Detalhes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Categoria</span>
            <Badge variant="outline">{getCategoryLabel(ticket.category)}</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Criado em</span>
            <span>{format(new Date(ticket.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
          </div>
          {ticket.first_response_at && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">1ª Resposta</span>
                <span>{format(new Date(ticket.first_response_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

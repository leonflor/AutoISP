import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAdminSupportTickets, TicketFilters as FilterType } from '@/hooks/admin/useSupportTickets';
import { TicketStatsCards } from '@/components/admin/support/TicketStatsCards';
import { TicketFilters, getStatusLabel, getCategoryLabel, getPriorityLabel } from '@/components/admin/support/TicketFilters';
import { SLABadge } from '@/components/admin/support/SLABadge';
import { SLAConfigDialog } from '@/components/admin/support/SLAConfigDialog';

export default function SupportTickets() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FilterType>({});
  const [showSLAConfig, setShowSLAConfig] = useState(false);
  const { data: tickets, isLoading } = useAdminSupportTickets(filters);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500 text-white';
      case 'in_progress': return 'bg-yellow-500 text-black';
      case 'waiting': return 'bg-orange-500 text-white';
      case 'resolved': return 'bg-green-500 text-white';
      case 'closed': return 'bg-gray-500 text-white';
      default: return '';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tickets de Suporte</h1>
          <p className="text-muted-foreground">Gerencie os chamados dos ISPs</p>
        </div>
        <Button variant="outline" onClick={() => setShowSLAConfig(true)}>
          <Settings2 className="h-4 w-4 mr-2" />
          Configurar SLA
        </Button>
      </div>

      {/* Stats */}
      <TicketStatsCards />

      {/* Filters */}
      <TicketFilters filters={filters} onChange={setFilters} />

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lista de Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : tickets?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum ticket encontrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Protocolo</TableHead>
                  <TableHead>ISP</TableHead>
                  <TableHead>Assunto</TableHead>
                  <TableHead className="w-[100px]">Categoria</TableHead>
                  <TableHead className="w-[100px]">Prioridade</TableHead>
                  <TableHead className="w-[110px]">Status</TableHead>
                  <TableHead className="w-[100px]">SLA</TableHead>
                  <TableHead className="w-[120px]">Atendente</TableHead>
                  <TableHead className="w-[100px]">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets?.map((ticket) => (
                  <TableRow 
                    key={ticket.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/admin/tickets/${ticket.id}`)}
                  >
                    <TableCell className="font-mono text-sm">
                      #{ticket.id.slice(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {ticket.isp?.name || '-'}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {ticket.subject}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getCategoryLabel(ticket.category)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-xs", getPriorityBadgeClass(ticket.priority))}>
                        {getPriorityLabel(ticket.priority)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-xs", getStatusBadgeClass(ticket.status))}>
                        {getStatusLabel(ticket.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <SLABadge
                        createdAt={ticket.created_at}
                        slaHours={ticket.sla_response_hours}
                        firstResponseAt={ticket.first_response_at}
                        status={ticket.status}
                      />
                    </TableCell>
                    <TableCell className="text-sm">
                      {ticket.assigned_user?.full_name || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(ticket.created_at), "dd/MM/yy", { locale: ptBR })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* SLA Config Dialog */}
      <SLAConfigDialog open={showSLAConfig} onOpenChange={setShowSLAConfig} />
    </div>
  );
}

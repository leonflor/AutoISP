import { useState } from 'react';
import { Loader2, ArrowDown, ArrowUp, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { WhatsAppMessage } from '@/hooks/painel/useWhatsAppMessages';

interface MessageHistoryProps {
  messages: WhatsAppMessage[];
  isLoading: boolean;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pendente', variant: 'outline' },
  sent: { label: 'Enviado', variant: 'secondary' },
  delivered: { label: 'Entregue', variant: 'default' },
  read: { label: 'Lido', variant: 'default' },
  failed: { label: 'Falhou', variant: 'destructive' },
};

export function MessageHistory({ messages, isLoading }: MessageHistoryProps) {
  const [search, setSearch] = useState('');
  const [directionFilter, setDirectionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = messages.filter((msg) => {
    if (directionFilter !== 'all' && msg.direction !== directionFilter) return false;
    if (statusFilter !== 'all' && msg.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (msg.recipient_phone?.includes(q)) ||
        (msg.sender_phone?.includes(q)) ||
        (msg.content?.toLowerCase().includes(q)) ||
        (msg.template_name?.toLowerCase().includes(q))
      );
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Histórico de Mensagens</CardTitle>
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número ou conteúdo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={directionFilter} onValueChange={setDirectionFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Direção" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="inbound">Recebidas</SelectItem>
              <SelectItem value="outbound">Enviadas</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="sent">Enviado</SelectItem>
              <SelectItem value="delivered">Entregue</SelectItem>
              <SelectItem value="read">Lido</SelectItem>
              <SelectItem value="failed">Falhou</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhuma mensagem encontrada
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Direção</TableHead>
                  <TableHead>Número</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="max-w-[300px]">Conteúdo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((msg) => (
                  <TableRow key={msg.id}>
                    <TableCell>
                      {msg.direction === 'inbound' ? (
                        <Badge variant="outline" className="gap-1">
                          <ArrowDown className="h-3 w-3" />
                          In
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <ArrowUp className="h-3 w-3" />
                          Out
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {msg.direction === 'inbound' ? msg.sender_phone : msg.recipient_phone}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{msg.message_type}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate text-sm">
                      {msg.content || msg.template_name || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[msg.status]?.variant || 'outline'}>
                        {statusConfig[msg.status]?.label || msg.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(msg.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

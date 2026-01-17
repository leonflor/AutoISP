import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTickets, TicketStatus } from '@/hooks/painel/useTickets';
import { Search, MessageSquare, Clock, CheckCircle, Bot, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusConfig: Record<TicketStatus, { label: string; color: string; icon: any }> = {
  aberto: { label: 'Aberto', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: AlertCircle },
  em_andamento: { label: 'Em Andamento', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', icon: Clock },
  aguardando: { label: 'Aguardando', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20', icon: Clock },
  encerrado: { label: 'Encerrado', color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: CheckCircle },
};

const channelLabels: Record<string, string> = {
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  email: 'E-mail',
  telefone: 'Telefone',
  chat: 'Chat',
};

export default function TicketsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<TicketStatus | ''>('');

  const { tickets, loading, stats } = useTickets({ search, status });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Atendimentos</h1>
        <p className="text-muted-foreground">Gerencie os tickets de suporte</p>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Abertos</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.abertos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.emAndamento}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Encerrados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.encerrados}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resolvidos por IA</CardTitle>
            <Bot className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.resolvidosPorIa}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por protocolo, assunto, cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={status} onValueChange={(v) => setStatus(v as TicketStatus | '')}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="aberto">Abertos</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="aguardando">Aguardando</SelectItem>
                <SelectItem value="encerrado">Encerrados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => {
                const statusInfo = statusConfig[ticket.status];
                return (
                  <div
                    key={ticket.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-mono text-muted-foreground">
                            {ticket.protocol}
                          </span>
                          <Badge variant="outline" className={statusInfo.color}>
                            {statusInfo.label}
                          </Badge>
                          {ticket.resolvedByAi && (
                            <Badge variant="secondary" className="gap-1">
                              <Bot className="h-3 w-3" /> IA
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-medium truncate">{ticket.subject}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{ticket.subscriberName}</span>
                          <span>•</span>
                          <span>{channelLabels[ticket.channel]}</span>
                          <span>•</span>
                          <span>
                            {formatDistanceToNow(new Date(ticket.createdAt), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline">{ticket.priority}</Badge>
                    </div>
                  </div>
                );
              })}
              {tickets.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">
                  Nenhum atendimento encontrado
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

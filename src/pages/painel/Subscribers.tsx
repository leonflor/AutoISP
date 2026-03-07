import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useErpClients } from '@/hooks/painel/useErpClients';
import { Search, Users, UserCheck, UserX, Wifi, WifiOff, RefreshCw, AlertTriangle, Database, SignalLow } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { SignalBadge } from '@/components/painel/subscribers/SignalBadge';

const statusColors: Record<string, string> = {
  ativo: 'bg-green-500/10 text-green-600 border-green-500/20',
  bloqueado: 'bg-red-500/10 text-red-600 border-red-500/20',
  financeiro_em_atraso: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  outros: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
};

const statusLabels: Record<string, string> = {
  ativo: 'Ativo',
  bloqueado: 'Bloqueado',
  financeiro_em_atraso: 'Financeiro em Atraso',
  outros: 'Outros',
};

const providerColors: Record<string, string> = {
  ixc: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  sgp: 'bg-green-500/10 text-green-600 border-green-500/20',
  mk_solutions: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
};

const providerLabels: Record<string, string> = {
  ixc: 'IXC Soft',
  sgp: 'SGP',
  mk_solutions: 'MK-Solutions',
};

export default function SubscribersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [provider, setProvider] = useState('all');
  const [page, setPage] = useState(1);
  const { toast } = useToast();
  const [diagClient, setDiagClient] = useState<{ id: string; name: string } | null>(null);

  const { clients, allClients, loading, error, errors, stats, total, totalPages, refetch } = useErpClients({
    search,
    status,
    provider,
    page,
    limit: 15,
  });

  const signalCriticalCount = (allClients || []).filter(
    (c) => c.signal_quality === 'critical' || c.signal_quality === 'weak'
  ).length;

  const handleRefresh = async () => {
    await refetch();
    toast({ title: 'Dados atualizados', description: 'Lista de clientes sincronizada com os ERPs.' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assinantes</h1>
          <p className="text-muted-foreground">Conexões de todas as integrações ERP</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {errors.length > 0 && (
        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
          <div className="flex items-center gap-2 text-sm text-yellow-600">
            <AlertTriangle className="h-4 w-4" />
            <span>Falha parcial: {errors.map(e => `${e.provider} (${e.message})`).join(', ')}</span>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.ativos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Não Ativos</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.nao_ativos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conectados</CardTitle>
            <Wifi className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.conectados}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Desconectados</CardTitle>
            <WifiOff className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.desconectados > 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
              {stats.desconectados}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sinal Crítico</CardTitle>
            <SignalLow className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${signalCriticalCount > 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
              {signalCriticalCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, CPF/CNPJ ou login..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
            <Select value={provider} onValueChange={(v) => { setProvider(v); setPage(1); }}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Todas integrações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="ixc">IXC Soft</SelectItem>
                <SelectItem value="sgp">SGP</SelectItem>
                <SelectItem value="mk_solutions">MK-Solutions</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ativo">Ativos</SelectItem>
                <SelectItem value="nao_ativo">Não Ativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
              <p className="text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
                Tentar novamente
              </Button>
            </div>
          ) : clients.length === 0 && !search && status === 'all' && provider === 'all' ? (
            <div className="text-center py-12">
              <Database className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium mb-1">Nenhum cliente encontrado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configure uma integração ERP em Integrações &gt; ERP para importar seus clientes.
              </p>
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/painel/integracoes/erp'}>
                Configurar ERP
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Integração</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>CPF/CNPJ</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Login</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Sinal</TableHead>
                      <TableHead className="text-center">Conexão</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client, idx) => (
                      <TableRow key={`${client.provider}-${client.erp_id}-${idx}`}>
                        <TableCell>
                          <Badge variant="outline" className={providerColors[client.provider] || ''}>
                            {providerLabels[client.provider] || client.provider_name}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{client.nome}</TableCell>
                        <TableCell className="text-muted-foreground">{client.cpf_cnpj || '—'}</TableCell>
                        <TableCell className="text-muted-foreground">{client.data_vencimento || '—'}</TableCell>
                        <TableCell className="text-muted-foreground">{client.plano || '—'}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{client.login || '—'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[client.status_internet] || statusColors.outros}>
                            {statusLabels[client.status_internet] || client.status_internet}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <SignalBadge
                            signalQuality={client.signal_quality}
                            signalDb={client.signal_db}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          {client.conectado ? (
                            <Wifi className="h-4 w-4 text-green-500 mx-auto" />
                          ) : (
                            <WifiOff className="h-4 w-4 text-muted-foreground mx-auto" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {clients.length === 0 && (search || status || provider) && (
                <p className="text-center py-8 text-muted-foreground">
                  Nenhum cliente encontrado com os filtros aplicados
                </p>
              )}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <span className="py-2 px-4 text-sm">
                    Página {page} de {totalPages} ({total} clientes)
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

import { useState } from 'react';
import { Activity, Filter, User, Building2, ChevronDown, ChevronRight, Search, RefreshCw } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const actionLabels: Record<string, string> = {
  create: 'Criação',
  update: 'Atualização',
  delete: 'Exclusão',
  login: 'Login',
  logout: 'Logout',
  invite: 'Convite',
  role_add: 'Permissão +',
  role_remove: 'Permissão -',
};

const actionColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  create: 'default',
  update: 'secondary',
  delete: 'destructive',
  login: 'outline',
  logout: 'outline',
  invite: 'default',
  role_add: 'default',
  role_remove: 'destructive',
};

const entityLabels: Record<string, string> = {
  user: 'Usuário',
  isp: 'ISP',
  plan: 'Plano',
  subscription: 'Assinatura',
  invoice: 'Fatura',
  ticket: 'Ticket',
  user_role: 'Permissão',
  settings: 'Configurações',
};

export function AuditLogsTable() {
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const { data: logs, isLoading, refetch, isFetching } = useAuditLogs({
    entityType: entityFilter !== 'all' ? entityFilter : undefined,
    action: actionFilter !== 'all' ? actionFilter : undefined,
    limit: 200,
  });

  const filteredLogs = logs?.filter(log => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      log.profile?.full_name?.toLowerCase().includes(search) ||
      log.profile?.email?.toLowerCase().includes(search) ||
      log.isp?.name?.toLowerCase().includes(search) ||
      log.entity_type.toLowerCase().includes(search) ||
      log.action.toLowerCase().includes(search)
    );
  });

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por usuário, ISP ou ação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Entidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas entidades</SelectItem>
            <SelectItem value="user">Usuário</SelectItem>
            <SelectItem value="user_role">Permissão</SelectItem>
            <SelectItem value="isp">ISP</SelectItem>
            <SelectItem value="plan">Plano</SelectItem>
            <SelectItem value="subscription">Assinatura</SelectItem>
            <SelectItem value="invoice">Fatura</SelectItem>
            <SelectItem value="ticket">Ticket</SelectItem>
          </SelectContent>
        </Select>

        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Ação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas ações</SelectItem>
            <SelectItem value="create">Criação</SelectItem>
            <SelectItem value="update">Atualização</SelectItem>
            <SelectItem value="delete">Exclusão</SelectItem>
            <SelectItem value="login">Login</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          variant="outline" 
          size="icon"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>{filteredLogs?.length || 0} registros encontrados</span>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Entidade</TableHead>
              <TableHead>ISP</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!filteredLogs?.length ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum log encontrado</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <Collapsible key={log.id} asChild>
                  <>
                    <TableRow 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleRow(log.id)}
                    >
                      <TableCell>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            {expandedRows.has(log.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">
                              {log.profile?.full_name || 'Sistema'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {log.profile?.email || '-'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={actionColors[log.action] || 'outline'}>
                          {actionLabels[log.action] || log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {entityLabels[log.entity_type] || log.entity_type}
                        </span>
                        {log.entity_id && (
                          <span className="text-xs text-muted-foreground block">
                            {log.entity_id.slice(0, 8)}...
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.isp?.name ? (
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{log.isp.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(log.created_at), "dd/MM/yyyy HH:mm")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(log.created_at), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedRows.has(log.id) && (
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={6} className="p-4">
                          <CollapsibleContent>
                            <div className="grid gap-4 md:grid-cols-2">
                              {log.old_data && Object.keys(log.old_data).length > 0 && (
                                <div>
                                  <h4 className="font-medium text-sm mb-2">Dados Anteriores</h4>
                                  <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                                    {JSON.stringify(log.old_data, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {log.new_data && Object.keys(log.new_data).length > 0 && (
                                <div>
                                  <h4 className="font-medium text-sm mb-2">Dados Novos</h4>
                                  <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                                    {JSON.stringify(log.new_data, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {log.metadata && Object.keys(log.metadata).length > 0 && (
                                <div>
                                  <h4 className="font-medium text-sm mb-2">Metadados</h4>
                                  <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                                    {JSON.stringify(log.metadata, null, 2)}
                                  </pre>
                                </div>
                              )}
                              <div className="space-y-2 text-sm">
                                {log.ip_address && (
                                  <p><strong>IP:</strong> {log.ip_address}</p>
                                )}
                                {log.user_agent && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    <strong>User Agent:</strong> {log.user_agent}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CollapsibleContent>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                </Collapsible>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

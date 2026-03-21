import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useConversationAnalytics } from '@/hooks/painel/useConversationAnalytics';
import { useIsps } from '@/hooks/useIsps';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Bot, Users, Clock, Hash, Loader2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, formatDistanceStrict } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

type Period = '7d' | '30d' | '90d';

const periods: { label: string; value: Period }[] = [
  { label: '7 dias', value: '7d' },
  { label: '30 dias', value: '30d' },
  { label: '90 dias', value: '90d' },
];

export default function AdminAnalytics() {
  const [searchParams, setSearchParams] = useSearchParams();
  const period = (searchParams.get('period') as Period) || '7d';
  const [selectedIspId, setSelectedIspId] = useState<string | undefined>();
  const { isps } = useIsps();

  const { kpis, dailyData, handoverReasons, procedures, hourlyData, recentConversations, isLoading } = useConversationAnalytics({ period, ispId: selectedIspId });

  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);

  const setPeriod = (p: Period) => setSearchParams({ period: p });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm">Métricas globais de conversas e agentes</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedIspId || 'all'} onValueChange={v => setSelectedIspId(v === 'all' ? undefined : v)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todos os ISPs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os ISPs</SelectItem>
              {isps?.map(isp => (
                <SelectItem key={isp.id} value={isp.id}>{isp.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-1">
            {periods.map(p => (
              <Button key={p.value} variant={period === p.value ? 'default' : 'outline'} size="sm" onClick={() => setPeriod(p.value)}>
                {p.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KpiCard icon={MessageSquare} label="Conversas" value={isLoading ? null : kpis.totalConversations.toString()} />
        <KpiCard icon={Bot} label="Resolução Bot" value={isLoading ? null : `${kpis.botResolutionRate.toFixed(1)}%`} />
        <KpiCard icon={Users} label="Handover" value={isLoading ? null : `${kpis.handoverRate.toFixed(1)}%`} />
        <KpiCard icon={Clock} label="Tempo Médio" value={isLoading ? null : `${kpis.avgMinutes.toFixed(0)} min`} />
        <KpiCard icon={Hash} label="Msgs/Conversa" value={isLoading ? null : kpis.avgMessages.toFixed(1)} />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Volume Diário</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => format(new Date(v), 'dd/MM')} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip labelFormatter={v => format(new Date(v as string), 'dd/MM/yyyy')} />
                <Line type="monotone" dataKey="total" name="Total" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="bot" name="Bot" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Motivos de Handover (Top 5)</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={handoverReasons} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="handover_reason" type="category" width={120} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Ocorrências" fill="hsl(var(--chart-4))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Procedimentos</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={procedures} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="procedure_name" type="category" width={130} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="total_triggered" name="Acionados" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Horários de Pico</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Conversas" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent conversations */}
      <Card>
        <CardHeader><CardTitle className="text-base">Últimas Conversas</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Modo</TableHead>
                <TableHead>Procedimento</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentConversations.map((c: any) => (
                <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedConvId(c.id)}>
                  <TableCell className="font-mono text-sm">{c.user_identifier || c.user_phone}</TableCell>
                  <TableCell className="text-sm">{format(new Date(c.created_at), 'dd/MM HH:mm')}</TableCell>
                  <TableCell className="text-sm">
                    {c.resolved_at ? formatDistanceStrict(new Date(c.created_at), new Date(c.resolved_at), { locale: ptBR }) : '—'}
                  </TableCell>
                  <TableCell><Badge variant={c.mode === 'bot' ? 'default' : 'secondary'}>{c.mode}</Badge></TableCell>
                  <TableCell className="text-sm">{c.procedures?.name || '—'}</TableCell>
                  <TableCell><Badge variant={c.resolved_at ? 'outline' : 'default'}>{c.resolved_at ? 'Resolvida' : 'Aberta'}</Badge></TableCell>
                </TableRow>
              ))}
              {recentConversations.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhuma conversa encontrada</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedConvId && <ConversationHistoryDialog conversationId={selectedConvId} onClose={() => setSelectedConvId(null)} />}
    </div>
  );
}

function KpiCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null }) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4 px-4">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        {value !== null ? <p className="text-2xl font-bold">{value}</p> : <Skeleton className="h-8 w-20" />}
      </CardContent>
    </Card>
  );
}

function ConversationHistoryDialog({ conversationId, onClose }: { conversationId: string; onClose: () => void }) {
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
        <DialogHeader><DialogTitle>Histórico da Conversa</DialogTitle></DialogHeader>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <div className="space-y-3">
            {messages?.map(m => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
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

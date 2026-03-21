import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MessageSquare, Bot, Users, Clock, Hash } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, formatDistanceStrict } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { KpiCard } from './KpiCard';
import { ConversationHistoryDialog } from './ConversationHistoryDialog';

interface AnalyticsDashboardProps {
  kpis: {
    totalConversations: number;
    botResolutionRate: number;
    handoverRate: number;
    avgMinutes: number;
    avgMessages: number;
  };
  dailyData: Array<{ date: string; total: number; bot: number }>;
  handoverReasons: Array<{ handover_reason: string; count: number }>;
  procedures: Array<{ procedure_name: string; total_triggered: number; completion_rate: number }>;
  hourlyData: Array<{ hour: string; count: number }>;
  recentConversations: any[];
  isLoading: boolean;
}

export function AnalyticsDashboard({
  kpis,
  dailyData,
  handoverReasons,
  procedures,
  hourlyData,
  recentConversations,
  isLoading,
}: AnalyticsDashboardProps) {
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);

  return (
    <>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KpiCard icon={MessageSquare} label="Conversas" value={isLoading ? null : kpis.totalConversations.toString()} />
        <KpiCard icon={Bot} label="Resolução Bot" value={isLoading ? null : `${kpis.botResolutionRate.toFixed(1)}%`} />
        <KpiCard icon={Users} label="Handover" value={isLoading ? null : `${kpis.handoverRate.toFixed(1)}%`} />
        <KpiCard icon={Clock} label="Tempo Médio" value={isLoading ? null : `${kpis.avgMinutes.toFixed(0)} min`} />
        <KpiCard icon={Hash} label="Msgs/Conversa" value={isLoading ? null : kpis.avgMessages.toFixed(1)} />
      </div>

      {/* Charts row 1 */}
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

      {/* Charts row 2 */}
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

      {/* Recent conversations table */}
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
                  <TableCell>
                    <Badge variant={c.mode === 'bot' ? 'default' : 'secondary'}>{c.mode}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{c.procedures?.name || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={c.resolved_at ? 'outline' : 'default'}>
                      {c.resolved_at ? 'Resolvida' : 'Aberta'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {recentConversations.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhuma conversa encontrada</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedConvId && (
        <ConversationHistoryDialog conversationId={selectedConvId} onClose={() => setSelectedConvId(null)} />
      )}
    </>
  );
}

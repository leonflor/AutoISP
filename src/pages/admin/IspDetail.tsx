import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useIspDetail } from '@/hooks/admin/useIspDetail';
import { useToast } from '@/hooks/use-toast';
import type { Isp } from '@/types/database';
import {
  ArrowLeft,
  MessageSquare,
  Bot,
  Clock,
  Users,
  Server,
  Database,
  Wifi,
  WifiOff,
  ExternalLink,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

function MetricCard({
  label,
  value7d,
  value30d,
  suffix,
  icon: Icon,
}: {
  label: string;
  value7d: number;
  value30d: number;
  suffix?: string;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-lg bg-primary/10 p-2.5">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
        </div>
        <div className="flex items-end gap-4">
          <div>
            <p className="text-3xl font-bold tabular-nums">
              {value7d}
              {suffix}
            </p>
            <p className="text-xs text-muted-foreground mt-1">últimos 7 dias</p>
          </div>
          <Separator orientation="vertical" className="h-10" />
          <div>
            <p className="text-xl font-semibold tabular-nums text-muted-foreground">
              {value30d}
              {suffix}
            </p>
            <p className="text-xs text-muted-foreground mt-1">últimos 30 dias</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function IspDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [testingErp, setTestingErp] = useState(false);
  const [erpTestResult, setErpTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const ispQuery = useQuery({
    queryKey: ['isp', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from('isps').select('*').eq('id', id!).single();
      if (error) throw error;
      return data as Isp;
    },
  });

  const { data: detail, isLoading: detailLoading } = useIspDetail(id);

  const handleTestErp = async () => {
    if (!id) return;
    setTestingErp(true);
    setErpTestResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('test-erp', {
        body: { isp_id: id, is_test: true },
      });
      if (error) throw error;
      setErpTestResult({ ok: true, message: data?.message || 'Conexão OK' });
    } catch (err: any) {
      setErpTestResult({ ok: false, message: err.message || 'Falha na conexão' });
    } finally {
      setTestingErp(false);
    }
  };

  const handleReindex = () => {
    toast({
      title: 'Reindexação solicitada',
      description: 'A reindexação da base de conhecimento foi enfileirada.',
    });
  };

  if (ispQuery.isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      </div>
    );
  }

  if (ispQuery.error || !ispQuery.data) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => navigate('/admin/isps')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <p className="mt-4 text-destructive">ISP não encontrado.</p>
      </div>
    );
  }

  const isp = ispQuery.data;
  const m7 = detail?.metrics7d;
  const m30 = detail?.metrics30d;

  function formatSize(chars: number): string {
    if (chars < 1000) return `${chars} chars`;
    if (chars < 1_000_000) return `${(chars / 1000).toFixed(1)} KB`;
    return `${(chars / 1_000_000).toFixed(1)} MB`;
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/isps')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{isp.name}</h1>
          <p className="text-muted-foreground">
            {isp.slug} · {isp.document}
          </p>
        </div>
        <Badge
          variant={
            isp.status === 'ativo'
              ? 'default'
              : isp.status === 'cancelado'
              ? 'destructive'
              : 'secondary'
          }
        >
          {isp.status ?? 'pendente'}
        </Badge>
      </div>

      {/* Metrics Cards */}
      {detailLoading || !m7 || !m30 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Conversas" value7d={m7.total} value30d={m30.total} icon={MessageSquare} />
          <MetricCard
            label="Resolução Bot"
            value7d={m7.botRate}
            value30d={m30.botRate}
            suffix="%"
            icon={Bot}
          />
          <MetricCard
            label="Tempo Médio"
            value7d={m7.avgHandlingMinutes}
            value30d={m30.avgHandlingMinutes}
            suffix="min"
            icon={Clock}
          />
          <MetricCard
            label="Handovers"
            value7d={m7.handovers}
            value30d={m30.handovers}
            icon={Users}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Agente Configurado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {detail?.agent ? (
              <>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={detail.agent.customAvatarUrl ?? undefined} />
                    <AvatarFallback>
                      {(detail.agent.customName ?? detail.agent.templateName)
                        .substring(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {detail.agent.customName ?? detail.agent.templateName}
                    </p>
                    <Link
                      to="/admin/templates"
                      className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Template: {detail.agent.templateName}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">WhatsApp configurado</span>
                  {detail.whatsappConfigured ? (
                    <Badge variant="default" className="gap-1">
                      <Wifi className="h-3 w-3" />
                      Sim
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <WifiOff className="h-3 w-3" />
                      Não
                    </Badge>
                  )}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">Nenhum agente configurado.</p>
            )}
          </CardContent>
        </Card>

        {/* ERP Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Server className="h-5 w-5" />
              ERP
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {detail?.erp ? (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Provedor</span>
                    <span className="font-medium">{detail.erp.provider}</span>
                  </div>
                  {detail.erp.maskedUrl && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">URL Base</span>
                      <span className="font-mono text-xs">{detail.erp.maskedUrl}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={detail.erp.isConnected ? 'default' : 'secondary'}>
                      {detail.erp.isConnected ? 'Conectado' : 'Desconectado'}
                    </Badge>
                  </div>
                </div>
                <Separator />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestErp}
                  disabled={testingErp}
                  className="w-full"
                >
                  {testingErp ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Testar Conexão
                </Button>
                {erpTestResult && (
                  <div
                    className={`flex items-center gap-2 text-sm p-2 rounded-md ${
                      erpTestResult.ok
                        ? 'bg-emerald-500/10 text-emerald-700'
                        : 'bg-destructive/10 text-destructive'
                    }`}
                  >
                    {erpTestResult.ok ? (
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 flex-shrink-0" />
                    )}
                    {erpTestResult.message}
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground text-sm">Nenhum ERP configurado.</p>
            )}
          </CardContent>
        </Card>

        {/* Knowledge Base Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5" />
              Base de Conhecimento
            </CardTitle>
            <CardDescription>
              Documentos indexados para o agente de IA deste ISP.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex gap-8">
                <div>
                  <p className="text-2xl font-bold tabular-nums">
                    {detail?.knowledgeBase.documentCount ?? 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Documentos</p>
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">
                    {formatSize(detail?.knowledgeBase.totalSizeChars ?? 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Tamanho total</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleReindex}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Forçar Reindexação
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

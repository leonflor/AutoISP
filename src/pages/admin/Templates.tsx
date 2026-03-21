import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgentTemplates, type AgentTemplate } from '@/hooks/admin/useAgentTemplates';
import { AgentSimulator } from '@/components/AgentSimulator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Pencil, Bot, Thermometer, Users, FileText, Play } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const TYPE_LABELS: Record<string, string> = {
  atendente_geral: 'Atendente Geral',
  suporte_n2: 'Suporte N2',
  financeiro: 'Financeiro',
  comercial: 'Comercial',
};

const TONE_LABELS: Record<string, string> = {
  professional: 'Profissional',
  friendly: 'Amigável',
  formal: 'Formal',
  casual: 'Descontraído',
};

export default function Templates() {
  const navigate = useNavigate();
  const { data: templates, isLoading, upsert } = useAgentTemplates();
  const [deactivating, setDeactivating] = useState<AgentTemplate | null>(null);
  const [simulatingTemplate, setSimulatingTemplate] = useState<AgentTemplate | null>(null);

  const handleToggleActive = (t: AgentTemplate) => {
    if (t.is_active && t.tenants_count > 0) {
      setDeactivating(t);
      return;
    }
    upsert.mutate({ id: t.id, name: t.name, type: t.type, system_prompt_base: t.system_prompt_base, default_name: t.default_name, is_active: !t.is_active } as any);
  };

  const confirmDeactivate = () => {
    if (!deactivating) return;
    upsert.mutate({ id: deactivating.id, name: deactivating.name, type: deactivating.type, system_prompt_base: deactivating.system_prompt_base, default_name: deactivating.default_name, is_active: false } as any, {
      onSuccess: () => {
        toast({ title: 'Template desativado' });
        setDeactivating(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Templates de Agentes</h1>
          <p className="text-muted-foreground">Gerencie os templates que definem o comportamento dos agentes IA.</p>
        </div>
        <Button onClick={() => navigate('/admin/templates/novo')}>
          <Plus className="mr-2 h-4 w-4" /> Novo Template
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      ) : !templates?.length ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <Bot className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">Nenhum template cadastrado.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/templates/novo')}>
            Criar primeiro template
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <Card key={t.id} className="relative group transition-shadow hover:shadow-md">
              <CardHeader className="pb-3 flex-row items-start justify-between space-y-0">
                <div className="space-y-1 min-w-0 flex-1">
                  <CardTitle className="text-base truncate">{t.name}</CardTitle>
                  <Badge variant="outline" className="text-xs">{TYPE_LABELS[t.type] ?? t.type}</Badge>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setSimulatingTemplate(t)}
                    title="Testar"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => navigate(`/admin/templates/${t.id}`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Switch
                    checked={t.is_active ?? false}
                    onCheckedChange={() => handleToggleActive(t)}
                    className="scale-90"
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Thermometer className="h-3.5 w-3.5" /> {Number(t.temperature).toFixed(2)}</span>
                  <span className="truncate">{TONE_LABELS[t.tone] ?? t.tone}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <FileText className="h-3.5 w-3.5" />
                    <span className="tabular-nums">{t.procedures_count}</span> procedimentos
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span className="tabular-nums">{t.tenants_count}</span> tenants usando
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deactivating} onOpenChange={(o) => !o && setDeactivating(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar template?</AlertDialogTitle>
            <AlertDialogDescription>
              Este template está sendo usado por <strong>{deactivating?.tenants_count}</strong> tenant(s).
              Ao desativá-lo, os agentes vinculados deixarão de funcionar até que um novo template seja atribuído.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeactivate}>Desativar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AgentSimulator
        open={!!simulatingTemplate}
        onOpenChange={(o) => !o && setSimulatingTemplate(null)}
        templateId={simulatingTemplate?.id}
        agentName={simulatingTemplate?.name ?? 'Agente'}
      />
    </div>
  );
}

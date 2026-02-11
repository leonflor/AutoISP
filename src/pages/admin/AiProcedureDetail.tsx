import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  useAiProcedure,
  useCreateProcedure,
  useUpdateProcedure,
  useProcedureTools,
  useToggleProcedureTool,
  useProcedureFlows,
  useToggleProcedureFlow,
} from '@/hooks/admin/useAiProcedures';
import { useGlobalTools } from '@/hooks/admin/useGlobalTools';
import { useGlobalFlows } from '@/hooks/admin/useGlobalFlows';

export default function AiProcedureDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'novo';
  const procedureId = isNew ? undefined : id;

  const { data: procedure } = useAiProcedure(procedureId);
  const createProcedure = useCreateProcedure();
  const updateProcedure = useUpdateProcedure();

  const [form, setForm] = useState({ name: '', slug: '', description: '', icon: '', is_active: true });

  useEffect(() => {
    if (procedure) {
      setForm({
        name: procedure.name,
        slug: procedure.slug,
        description: procedure.description || '',
        icon: procedure.icon || '',
        is_active: procedure.is_active,
      });
    }
  }, [procedure]);

  useEffect(() => {
    if (isNew && form.name) {
      const slug = form.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setForm(f => ({ ...f, slug }));
    }
  }, [form.name, isNew]);

  const handleSave = async () => {
    if (isNew) {
      const result = await createProcedure.mutateAsync(form);
      navigate(`/admin/ai-procedures/${result.id}`, { replace: true });
    } else if (procedureId) {
      await updateProcedure.mutateAsync({ id: procedureId, ...form });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/ai-procedures')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{isNew ? 'Novo Procedimento' : procedure?.name || 'Carregando...'}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isNew ? 'Configure as informações básicas do procedimento' : 'Gerencie configurações, ferramentas e fluxos'}
          </p>
        </div>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList>
          <TabsTrigger value="basic">Básico</TabsTrigger>
          <TabsTrigger value="tools" disabled={isNew}>Ferramentas</TabsTrigger>
          <TabsTrigger value="flows" disabled={isNew}>Fluxos</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informações do Procedimento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Cobrança" />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="cobranca" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Ícone (nome lucide)</Label>
                <Input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="receipt" />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
                <Label>Ativo</Label>
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={handleSave} disabled={createProcedure.isPending || updateProcedure.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {isNew ? 'Criar Procedimento' : 'Salvar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="mt-4">
          {procedureId && <ProcedureToolsSection procedureId={procedureId} />}
        </TabsContent>

        <TabsContent value="flows" className="mt-4">
          {procedureId && <ProcedureFlowsSection procedureId={procedureId} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProcedureToolsSection({ procedureId }: { procedureId: string }) {
  const { data: allTools, isLoading: loadingTools } = useGlobalTools();
  const { data: linkedTools } = useProcedureTools(procedureId);
  const toggleTool = useToggleProcedureTool();

  const linkedIds = new Set((linkedTools || []).map(l => l.tool_id));

  if (loadingTools) return <p className="text-muted-foreground">Carregando ferramentas...</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Selecionar Ferramentas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!allTools?.length ? (
          <p className="text-sm text-muted-foreground">Nenhuma ferramenta global cadastrada.</p>
        ) : (
          allTools.map(tool => (
            <div key={tool.id} className="flex items-start gap-3 p-3 rounded-lg border">
              <Checkbox
                checked={linkedIds.has(tool.id)}
                onCheckedChange={(checked) => {
                  toggleTool.mutate({ procedureId, toolId: tool.id, add: !!checked });
                }}
              />
              <div>
                <p className="font-medium text-sm">{tool.name}</p>
                <p className="text-xs text-muted-foreground">{tool.description}</p>
                <p className="text-xs text-muted-foreground mt-1">Handler: {tool.handler_type}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function ProcedureFlowsSection({ procedureId }: { procedureId: string }) {
  const { data: allFlows, isLoading: loadingFlows } = useGlobalFlows();
  const { data: linkedFlows } = useProcedureFlows(procedureId);
  const toggleFlow = useToggleProcedureFlow();

  const linkedIds = new Set((linkedFlows || []).map(l => l.flow_id));

  if (loadingFlows) return <p className="text-muted-foreground">Carregando fluxos...</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Selecionar Fluxos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!allFlows?.length ? (
          <p className="text-sm text-muted-foreground">Nenhum fluxo global cadastrado.</p>
        ) : (
          allFlows.map(flow => (
            <div key={flow.id} className="flex items-start gap-3 p-3 rounded-lg border">
              <Checkbox
                checked={linkedIds.has(flow.id)}
                onCheckedChange={(checked) => {
                  toggleFlow.mutate({ procedureId, flowId: flow.id, add: !!checked });
                }}
              />
              <div>
                <p className="font-medium text-sm">{flow.name}</p>
                <p className="text-xs text-muted-foreground">{flow.description || 'Sem descrição'}</p>
                <p className="text-xs text-muted-foreground mt-1">{flow.steps?.length || 0} etapas · {flow.is_fixed ? 'Fixo' : 'Flexível'}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

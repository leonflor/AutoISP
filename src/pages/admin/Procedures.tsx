import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Plus, GitBranch, MessageSquare, Layers } from 'lucide-react';
import { useProcedures, type ProcedureWithMeta, type ProcedureDefinition } from '@/hooks/admin/useProcedures';
import { useAgentTemplates } from '@/hooks/admin/useAgentTemplates';
import { ProcedureEditor } from '@/components/admin/procedures/ProcedureEditor';

export default function Procedures() {
  const [templateFilter, setTemplateFilter] = useState<string>('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<ProcedureWithMeta | null>(null);

  const { data: procedures, isLoading } = useProcedures(templateFilter || undefined);
  const { data: templates } = useAgentTemplates();

  const openNew = () => {
    setEditingProcedure(null);
    setEditorOpen(true);
  };

  const openEdit = (proc: ProcedureWithMeta) => {
    setEditingProcedure(proc);
    setEditorOpen(true);
  };

  const { create, saveNewVersion } = useProcedures();

  const handleSave = (data: {
    name: string;
    description: string | null;
    template_id: string;
    is_active: boolean;
    definition: ProcedureDefinition;
  }) => {
    if (editingProcedure) {
      saveNewVersion.mutate(
        {
          existingId: editingProcedure.id,
          currentVersion: editingProcedure.version,
          ...data,
        },
        { onSuccess: () => setEditorOpen(false) }
      );
    } else {
      create.mutate(data, { onSuccess: () => setEditorOpen(false) });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Procedimentos</h1>
          <p className="text-muted-foreground text-sm">Gerencie os fluxos conversacionais dos agentes IA</p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Procedimento
        </Button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={templateFilter} onValueChange={v => setTemplateFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filtrar por template" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os templates</SelectItem>
            {(templates ?? []).map(t => (
              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-28 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : !procedures?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <GitBranch className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg">Nenhum procedimento encontrado</h3>
            <p className="text-muted-foreground text-sm mt-1">Crie seu primeiro procedimento para começar</p>
            <Button className="mt-4" onClick={openNew}>
              <Plus className="h-4 w-4 mr-2" /> Criar Procedimento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {procedures.map(proc => (
            <Card
              key={proc.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => openEdit(proc)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-tight">{proc.name}</CardTitle>
                  <Switch
                    checked={proc.is_active ?? true}
                    onClick={e => e.stopPropagation()}
                    disabled
                    className="shrink-0"
                  />
                </div>
                {proc.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{proc.description}</p>
                )}
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <Badge variant="outline" className="text-xs">{proc.template_name}</Badge>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5" />
                    {(proc.definition?.steps?.length ?? 0)} steps
                  </span>
                  <span className="flex items-center gap-1">
                    <GitBranch className="h-3.5 w-3.5" />
                    v{proc.version}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {proc.active_conversations} ativas
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ProcedureEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        procedure={editingProcedure}
        templates={templates ?? []}
        onSave={handleSave}
        saving={create.isPending || saveNewVersion.isPending}
      />
    </div>
  );
}

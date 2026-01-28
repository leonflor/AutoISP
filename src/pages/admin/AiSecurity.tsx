import { useState } from 'react';
import { Plus, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SecurityClauseTable } from '@/components/admin/ai-security/SecurityClauseTable';
import { SecurityClauseForm } from '@/components/admin/ai-security/SecurityClauseForm';
import {
  useAiSecurityClauses,
  useCreateSecurityClause,
  useUpdateSecurityClause,
  useDeleteSecurityClause,
  useReorderSecurityClauses,
  type AiSecurityClause,
} from '@/hooks/admin/useAiSecurityClauses';

export default function AiSecurityPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingClause, setEditingClause] = useState<AiSecurityClause | null>(null);

  const { data: clauses, isLoading } = useAiSecurityClauses();

  const createMutation = useCreateSecurityClause();
  const updateMutation = useUpdateSecurityClause();
  const deleteMutation = useDeleteSecurityClause();
  const reorderMutation = useReorderSecurityClauses();

  const handleEdit = (clause: AiSecurityClause) => {
    setEditingClause(clause);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditingClause(null);
    setFormOpen(true);
  };

  const handleSubmit = async (data: any) => {
    if (editingClause) {
      await updateMutation.mutateAsync({ id: editingClause.id, ...data });
    } else {
      // Set sort_order to be at the end
      const maxOrder = clauses?.reduce((max, c) => Math.max(max, c.sort_order || 0), 0) || 0;
      await createMutation.mutateAsync({ ...data, sort_order: maxOrder + 1 });
    }
    setFormOpen(false);
    setEditingClause(null);
  };

  const handleDelete = async (clause: AiSecurityClause) => {
    await deleteMutation.mutateAsync(clause.id);
  };

  const handleReorder = async (newOrder: { id: string; sort_order: number }[]) => {
    await reorderMutation.mutateAsync(newOrder);
  };

  const inactiveCount = clauses?.filter(c => !c.is_active).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cláusulas de Segurança</h1>
          <p className="text-muted-foreground">
            Gerencie as cláusulas LGPD injetadas automaticamente em todos os prompts de IA.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Cláusula
        </Button>
      </div>

      {inactiveCount > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Atenção</AlertTitle>
          <AlertDescription>
            {inactiveCount} {inactiveCount === 1 ? 'cláusula está inativa' : 'cláusulas estão inativas'}. 
            Isso pode afetar a segurança e conformidade LGPD dos agentes de IA.
          </AlertDescription>
        </Alert>
      )}

      <div className="rounded-lg border bg-card">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="font-medium">Cláusulas de Segurança LGPD</h3>
              <p className="text-sm text-muted-foreground">
                Estas cláusulas são injetadas no início de cada prompt para garantir isolamento de dados entre tenants
              </p>
            </div>
          </div>
        </div>
        <div className="p-4">
          <SecurityClauseTable
            clauses={clauses}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReorder={handleReorder}
          />
        </div>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4">
        <h4 className="font-medium mb-2">Como funciona a injeção de cláusulas?</h4>
        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
          <li>As cláusulas são ordenadas pelo campo "Ordem de Injeção"</li>
          <li>Apenas cláusulas ativas são incluídas no prompt final</li>
          <li>Placeholders como {'{ISP_NAME}'} são substituídos dinamicamente</li>
          <li>As cláusulas aparecem ANTES do prompt do agente, garantindo prioridade</li>
          <li>Agentes não conseguem "ignorar" estas instruções por design</li>
        </ol>
      </div>

      <SecurityClauseForm
        open={formOpen}
        onOpenChange={setFormOpen}
        clause={editingClause}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}

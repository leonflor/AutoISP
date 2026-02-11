import { Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useAiProcedures, useAgentProcedures, useToggleAgentProcedure } from '@/hooks/admin/useAiProcedures';

interface AgentProceduresTabProps {
  agentId: string;
}

export function AgentProceduresTab({ agentId }: AgentProceduresTabProps) {
  const { data: procedures, isLoading } = useAiProcedures();
  const { data: agentProcedures } = useAgentProcedures(agentId);
  const toggleProcedure = useToggleAgentProcedure();

  const linkedIds = new Set((agentProcedures || []).map(ap => ap.procedure_id));

  if (isLoading) return <p className="text-muted-foreground py-8 text-center">Carregando...</p>;

  const activeProcedures = (procedures || []).filter(p => p.is_active);

  if (!activeProcedures.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhum procedimento disponível.</p>
        <p className="text-sm mt-1">Crie procedimentos em IA → Procedimentos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground mb-4">
        Selecione os procedimentos que este agente pode utilizar. Cada procedimento inclui ferramentas e fluxos conversacionais.
      </p>
      {activeProcedures.map(proc => (
        <Card key={proc.id}>
          <CardContent className="flex items-start gap-3 py-4">
            <Checkbox
              checked={linkedIds.has(proc.id)}
              onCheckedChange={(checked) => {
                toggleProcedure.mutate({ agentId, procedureId: proc.id, add: !!checked });
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary shrink-0" />
                <span className="font-medium text-sm">{proc.name}</span>
              </div>
              {proc.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{proc.description}</p>
              )}
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="outline" className="text-xs">{proc.tools_count || 0} tools</Badge>
                <Badge variant="outline" className="text-xs">{proc.flows_count || 0} fluxos</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

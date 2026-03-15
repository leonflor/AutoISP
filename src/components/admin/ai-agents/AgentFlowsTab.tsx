import { useState } from 'react';
import { Plus, Pencil, Trash2, GitBranch, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAgentFlows, useDeleteAgentFlow, useUpdateAgentFlow, type AgentFlow } from '@/hooks/admin/useAgentFlows';
import { AgentFlowForm } from './AgentFlowForm';
import { FlowStateEditor } from './FlowStateEditor';

interface AgentFlowsTabProps {
  agentId: string;
}

export function AgentFlowsTab({ agentId }: AgentFlowsTabProps) {
  const { data: flows = [], isLoading } = useAgentFlows(agentId);
  const deleteFlow = useDeleteAgentFlow();
  const updateFlow = useUpdateAgentFlow();
  const [editingFlow, setEditingFlow] = useState<AgentFlow | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedFlow, setExpandedFlow] = useState<string | null>(null);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Carregando fluxos...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Fluxos Conversacionais</h3>
          <p className="text-xs text-muted-foreground">
            Roteiros que o agente segue durante interações (State Machine)
          </p>
        </div>
        <Button size="sm" onClick={() => { setEditingFlow(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Novo Fluxo
        </Button>
      </div>

      {flows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <GitBranch className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum fluxo configurado</p>
            <p className="text-xs text-muted-foreground mt-1">
              Crie fluxos como Cobrança, Suporte Técnico ou Vendas
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {flows.map((flow) => (
            <Collapsible
              key={flow.id}
              open={expandedFlow === flow.id}
              onOpenChange={(open) => setExpandedFlow(open ? flow.id : null)}
            >
              <Card>
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <CollapsibleTrigger asChild>
                      <button className="flex items-center gap-2 text-left">
                        {expandedFlow === flow.id ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <CardTitle className="text-sm">{flow.name}</CardTitle>
                        <Badge variant={flow.is_fixed ? 'default' : 'secondary'} className="text-xs">
                          {flow.is_fixed ? 'Fixo' : 'Flexível'}
                        </Badge>
                        {flow.states && (
                          <span className="text-xs text-muted-foreground">
                            {flow.states.length} estado{flow.states.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </button>
                    </CollapsibleTrigger>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={flow.is_active}
                        onCheckedChange={(checked) =>
                          updateFlow.mutate({ id: flow.id, agent_id: agentId, is_active: checked })
                        }
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => { setEditingFlow(flow); setShowForm(true); }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive"
                        onClick={() => deleteFlow.mutate({ id: flow.id, agent_id: agentId })}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  {flow.description && (
                    <CardDescription className="text-xs mt-1 ml-6">{flow.description}</CardDescription>
                  )}
                  {flow.trigger_keywords && flow.trigger_keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 ml-6">
                      {flow.trigger_keywords.map((kw, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardHeader>

                <CollapsibleContent>
                  <CardContent className="pt-0 px-4 pb-4">
                    <FlowStateEditor flow={flow} agentId={agentId} />
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      )}

      <AgentFlowForm
        open={showForm}
        onOpenChange={setShowForm}
        agentId={agentId}
        flow={editingFlow}
      />
    </div>
  );
}

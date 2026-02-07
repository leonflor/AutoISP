import { useState } from 'react';
import { Plus, Pencil, Trash2, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAgentTools, useDeleteAgentTool, useUpdateAgentTool, type AgentTool } from '@/hooks/admin/useAgentTools';
import { AgentToolForm } from './AgentToolForm';

interface AgentToolsTabProps {
  agentId: string;
}

export function AgentToolsTab({ agentId }: AgentToolsTabProps) {
  const { data: tools = [], isLoading } = useAgentTools(agentId);
  const deleteTool = useDeleteAgentTool();
  const updateTool = useUpdateAgentTool();
  const [editingTool, setEditingTool] = useState<AgentTool | null>(null);
  const [showForm, setShowForm] = useState(false);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Carregando tools...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Ferramentas (Tools)</h3>
          <p className="text-xs text-muted-foreground">
            Funções que o agente pode invocar durante conversas
          </p>
        </div>
        <Button size="sm" onClick={() => { setEditingTool(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Nova Tool
        </Button>
      </div>

      {tools.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Wrench className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Nenhuma tool configurada</p>
            <p className="text-xs text-muted-foreground mt-1">
              Adicione ferramentas para o agente consultar ERPs e outros sistemas
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {tools.map((tool) => (
            <Card key={tool.id}>
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-mono">{tool.name}</CardTitle>
                    <Badge variant="outline" className="text-xs">{tool.handler_type}</Badge>
                    {tool.requires_erp && <Badge variant="secondary" className="text-xs">ERP</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={tool.is_active}
                      onCheckedChange={(checked) =>
                        updateTool.mutate({ id: tool.id, agent_id: agentId, is_active: checked })
                      }
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => { setEditingTool(tool); setShowForm(true); }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive"
                      onClick={() => deleteTool.mutate({ id: tool.id, agent_id: agentId })}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="text-xs mt-1">{tool.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <AgentToolForm
        open={showForm}
        onOpenChange={setShowForm}
        agentId={agentId}
        tool={editingTool}
      />
    </div>
  );
}

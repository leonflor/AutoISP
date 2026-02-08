import { Plus, Bot, Server, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgentTemplateTable } from '@/components/admin/ai-agents/AgentTemplateTable';
import {
  useAiAgentTemplates,
  useDeleteAiAgent,
  useDuplicateAiAgent,
  type AiAgent,
} from '@/hooks/admin/useAiAgentTemplates';
import { useState } from 'react';

export default function AiAgentsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'tenant' | 'platform'>('tenant');

  const { data: tenantAgents, isLoading: loadingTenant } = useAiAgentTemplates({ scope: 'tenant' });
  const { data: platformAgents, isLoading: loadingPlatform } = useAiAgentTemplates({ scope: 'platform' });

  const deleteMutation = useDeleteAiAgent();
  const duplicateMutation = useDuplicateAiAgent();

  const handleEdit = (agent: AiAgent) => {
    navigate(`/admin/ai-agents/${agent.id}`);
  };

  const handleCreate = () => {
    navigate('/admin/ai-agents/novo');
  };

  const handleDelete = async (agent: AiAgent) => {
    await deleteMutation.mutateAsync(agent.id);
  };

  const handleDuplicate = async (agent: AiAgent) => {
    const duplicated = await duplicateMutation.mutateAsync(agent);
    navigate(`/admin/ai-agents/${duplicated.id}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agentes de IA</h1>
          <p className="text-muted-foreground">
            Gerencie os templates de agentes disponíveis para ISPs e uso interno.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Agente
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'tenant' | 'platform')}>
        <TabsList>
          <TabsTrigger value="tenant" className="gap-2">
            <Building2 className="h-4 w-4" />
            Templates para ISPs
            {tenantAgents && (
              <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded">
                {tenantAgents.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="platform" className="gap-2">
            <Server className="h-4 w-4" />
            Agentes da Plataforma
            {platformAgents && (
              <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded">
                {platformAgents.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tenant" className="mt-6">
          <div className="rounded-lg border bg-card">
            <div className="p-4 border-b">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">Templates para ISPs</h3>
                  <p className="text-sm text-muted-foreground">
                    Agentes que ISPs podem ativar e personalizar em seus painéis
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <AgentTemplateTable
                agents={tenantAgents}
                isLoading={loadingTenant}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="platform" className="mt-6">
          <div className="rounded-lg border bg-card">
            <div className="p-4 border-b">
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">Agentes da Plataforma</h3>
                  <p className="text-sm text-muted-foreground">
                    Agentes para uso interno do SaaS (suporte, análises, onboarding)
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <AgentTemplateTable
                agents={platformAgents}
                isLoading={loadingPlatform}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState } from "react";
import { Bot, Zap, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIspAgents, CatalogTemplate, IspAgentWithTemplate, AgentActivationForm } from "@/hooks/painel/useIspAgents";
import { useIspAiUsage } from "@/hooks/painel/useIspAiUsage";
import { AgentCatalogCard } from "@/components/painel/ai/AgentCatalogCard";
import { ActiveAgentCard } from "@/components/painel/ai/ActiveAgentCard";
import { AgentActivationDialog } from "@/components/painel/ai/AgentActivationDialog";
import { AgentConfigDialog } from "@/components/painel/ai/AgentConfigDialog";

const AiAgentsPage = () => {
  const {
    activeAgents,
    catalog,
    isLoading,
    agentTypeLabels,
    activateAgent,
    updateAgent,
    deactivateAgent,
  } = useIspAgents();
  const { stats, loading: usageLoading } = useIspAiUsage();

  const [activatingAgent, setActivatingAgent] = useState<CatalogTemplate | null>(null);
  const [configuringAgent, setConfiguringAgent] = useState<IspAgentWithTemplate | null>(null);

  const totalTokens = stats?.totalTokens || 0;
  const currentActiveCount = catalog?.currentActiveCount || 0;
  const maxAgentsActive = catalog?.maxAgentsActive || 3;
  const canActivateMore = currentActiveCount < maxAgentsActive;

  const handleActivate = (form: AgentActivationForm) => {
    if (!activatingAgent) return;
    activateAgent.mutate(
      { agentId: activatingAgent.id, form },
      {
        onSuccess: () => setActivatingAgent(null),
      }
    );
  };

  const handleUpdateConfig = (form: AgentActivationForm & { is_enabled: boolean }) => {
    if (!configuringAgent) return;
    updateAgent.mutate(
      { id: configuringAgent.id, form },
      {
        onSuccess: () => setConfiguringAgent(null),
      }
    );
  };

  const handleRemoveAgent = () => {
    if (!configuringAgent) return;
    deactivateAgent.mutate(configuringAgent.id, {
      onSuccess: () => setConfiguringAgent(null),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Agentes de IA</h1>
          <p className="text-muted-foreground">Gerencie e utilize os agentes inteligentes</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Agentes de IA</h1>
          <p className="text-muted-foreground">
            Gerencie e utilize os agentes inteligentes
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm px-3 py-1">
            {currentActiveCount} de {maxAgentsActive} agentes ativos
          </Badge>
          <Card className="px-4 py-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                {totalTokens.toLocaleString()} tokens usados este mês
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">
            Meus Agentes ({activeAgents?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="catalog">
            Catálogo ({catalog?.templates?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Active Agents Tab */}
        <TabsContent value="active">
          {activeAgents?.length === 0 ? (
            <Card className="p-8 text-center">
              <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold">Nenhum agente ativado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Explore o catálogo e ative agentes para começar a usar.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeAgents?.map((agent) => (
                <ActiveAgentCard
                  key={agent.id}
                  agent={agent}
                  agentTypeLabels={agentTypeLabels}
                  onConfigure={setConfiguringAgent}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Catalog Tab */}
        <TabsContent value="catalog">
          {!canActivateMore && (
            <Card className="mb-4 p-4 border-yellow-500/50 bg-yellow-500/10">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-600" />
                <span className="text-sm">
                  Você atingiu o limite de {maxAgentsActive} agentes ativos do seu plano.
                  Remova um agente ou faça upgrade para ativar mais.
                </span>
              </div>
            </Card>
          )}

          {catalog?.templates?.length === 0 ? (
            <Card className="p-8 text-center">
              <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold">Catálogo vazio</h3>
              <p className="text-sm text-muted-foreground">
                Nenhum template de agente disponível no momento.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {catalog?.templates?.map((agent) => (
                <AgentCatalogCard
                  key={agent.id}
                  agent={agent}
                  agentTypeLabels={agentTypeLabels}
                  onActivate={setActivatingAgent}
                  canActivate={canActivateMore}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Activation Dialog */}
      <AgentActivationDialog
        agent={activatingAgent}
        open={!!activatingAgent}
        onOpenChange={(open) => !open && setActivatingAgent(null)}
        onActivate={handleActivate}
        isLoading={activateAgent.isPending}
      />

      {/* Config Dialog */}
      <AgentConfigDialog
        agent={configuringAgent}
        open={!!configuringAgent}
        onOpenChange={(open) => !open && setConfiguringAgent(null)}
        onSave={handleUpdateConfig}
        onRemove={handleRemoveAgent}
        isLoading={updateAgent.isPending || deactivateAgent.isPending}
      />
    </div>
  );
};

export default AiAgentsPage;

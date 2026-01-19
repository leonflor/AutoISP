import { Bot, Zap, MessageSquare, TrendingUp, Headphones, Lock, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAiAgents } from "@/hooks/painel/useAiAgents";
import { useIspAiUsage } from "@/hooks/painel/useIspAiUsage";
import { useNavigate } from "react-router-dom";

const agentIcons: Record<string, React.ElementType> = {
  atendente: MessageSquare,
  cobrador: Zap,
  vendedor: TrendingUp,
  analista: Bot,
  suporte: Headphones,
};

const AiAgentsPage = () => {
  const { agents, isLoading, agentTypeLabels, isAgentAvailable } = useAiAgents();
  const { stats, loading: usageLoading } = useIspAiUsage();
  const navigate = useNavigate();
  const totalTokens = stats?.totalTokens || 0;

  const handleStartChat = (agentSlug: string) => {
    navigate(`/painel/chat?agent=${agentSlug}`);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agentes de IA</h1>
          <p className="text-muted-foreground">Gerencie e utilize os agentes inteligentes</p>
        </div>
        <Card className="px-4 py-2">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {totalTokens.toLocaleString()} tokens usados este mês
            </span>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents?.map((agent) => {
          const IconComponent = agentIcons[agent.type] || Bot;
          const available = isAgentAvailable(agent);
          const features = (agent.features as string[]) || [];

          return (
            <Card
              key={agent.id}
              className={`relative overflow-hidden transition-all ${
                available
                  ? "hover:shadow-lg hover:border-primary/50"
                  : "opacity-60"
              }`}
            >
              {agent.is_premium && (
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="gap-1">
                    <Zap className="h-3 w-3" />
                    Premium
                  </Badge>
                </div>
              )}

              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${available ? "bg-primary/10" : "bg-muted"}`}>
                    <IconComponent className={`h-6 w-6 ${available ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {agentTypeLabels[agent.type] || agent.type}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <CardDescription className="line-clamp-2">
                  {agent.description}
                </CardDescription>

                <div className="space-y-1">
                  {features.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="h-3 w-3 text-primary" />
                      <span>{feature}</span>
                    </div>
                  ))}
                  {features.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{features.length - 3} mais recursos
                    </span>
                  )}
                </div>

                <Button
                  className="w-full"
                  variant={available ? "default" : "secondary"}
                  disabled={!available}
                  onClick={() => handleStartChat(agent.slug)}
                >
                  {available ? (
                    <>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Iniciar Chat
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Upgrade Necessário
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {agents?.length === 0 && (
        <Card className="p-8 text-center">
          <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold">Nenhum agente disponível</h3>
          <p className="text-sm text-muted-foreground">
            Os agentes de IA serão exibidos aqui quando estiverem configurados.
          </p>
        </Card>
      )}
    </div>
  );
};

export default AiAgentsPage;

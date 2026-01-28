import { Bot, Zap, MessageSquare, TrendingUp, Headphones, Lock, Check, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CatalogTemplate } from "@/hooks/painel/useIspAgents";

const agentIcons: Record<string, React.ElementType> = {
  atendente: MessageSquare,
  cobrador: Zap,
  vendedor: TrendingUp,
  analista: Bot,
  suporte: Headphones,
};

interface AgentCatalogCardProps {
  agent: CatalogTemplate;
  agentTypeLabels: Record<string, string>;
  onActivate: (agent: CatalogTemplate) => void;
  canActivate: boolean;
}

export function AgentCatalogCard({
  agent,
  agentTypeLabels,
  onActivate,
  canActivate,
}: AgentCatalogCardProps) {
  const IconComponent = agentIcons[agent.type] || Bot;
  const features = (agent.features as string[]) || [];
  const featureTags = (agent.feature_tags as string[]) || [];

  const isBlocked = !agent.isAvailable;
  const isAlreadyActivated = agent.isActivated;

  return (
    <Card
      className={`relative overflow-hidden transition-all ${
        isBlocked || isAlreadyActivated
          ? "opacity-60"
          : "hover:shadow-lg hover:border-primary/50"
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
          <div className={`p-2 rounded-lg ${!isBlocked ? "bg-primary/10" : "bg-muted"}`}>
            <IconComponent
              className={`h-6 w-6 ${!isBlocked ? "text-primary" : "text-muted-foreground"}`}
            />
          </div>
          <div>
            <CardTitle className="text-lg">{agent.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {agentTypeLabels[agent.type] || agent.type}
              </Badge>
              {agent.uses_knowledge_base && (
                <Badge variant="outline" className="text-xs gap-1">
                  <BookOpen className="h-3 w-3" />
                  KB
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <CardDescription className="line-clamp-2">{agent.description}</CardDescription>

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

        {featureTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {featureTags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {featureTags.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{featureTags.length - 4}
              </Badge>
            )}
          </div>
        )}

        <Button
          className="w-full"
          variant={isAlreadyActivated ? "secondary" : isBlocked || !canActivate ? "outline" : "default"}
          disabled={isBlocked || isAlreadyActivated || !canActivate}
          onClick={() => onActivate(agent)}
        >
          {isAlreadyActivated ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Já Ativado
            </>
          ) : isBlocked ? (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Upgrade Necessário
            </>
          ) : !canActivate ? (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Limite Atingido
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Ativar Agente
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

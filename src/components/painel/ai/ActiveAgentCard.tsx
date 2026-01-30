import { Bot, Zap, MessageSquare, TrendingUp, Headphones, Settings, BookOpen, Power, PowerOff, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { IspAgentWithTemplate } from "@/hooks/painel/useIspAgents";
import { useNavigate } from "react-router-dom";

const agentIcons: Record<string, React.ElementType> = {
  atendente: MessageSquare,
  cobrador: Zap,
  vendedor: TrendingUp,
  analista: Bot,
  suporte: Headphones,
};

interface ActiveAgentCardProps {
  agent: IspAgentWithTemplate;
  agentTypeLabels: Record<string, string>;
  onConfigure: (agent: IspAgentWithTemplate) => void;
}

export function ActiveAgentCard({
  agent,
  agentTypeLabels,
  onConfigure,
}: ActiveAgentCardProps) {
  const navigate = useNavigate();
  const template = agent.ai_agents;
  const IconComponent = agentIcons[template.type] || Bot;
  const displayName = agent.display_name || template.name;
  const avatarUrl = agent.avatar_url || template.avatar_url;
  
  // Verificar se o template foi desativado pelo admin
  const isTemplateInactive = template.is_active === false;

  return (
    <Card
      className={`flex flex-col h-full relative overflow-hidden transition-all hover:shadow-lg ${
        agent.is_enabled && !isTemplateInactive ? "hover:border-primary/50" : "opacity-60 border-muted"
      }`}
    >
      {/* Alerta de template desativado pelo admin */}
      {isTemplateInactive && (
        <div className="absolute top-0 left-0 right-0 bg-destructive/10 border-b border-destructive px-3 py-1.5 z-10">
          <div className="flex items-center gap-2 text-xs text-destructive font-medium">
            <AlertTriangle className="h-3 w-3" />
            Template desativado pelo administrador
          </div>
        </div>
      )}

      <div className={`absolute ${isTemplateInactive ? 'top-9' : 'top-2'} right-2 flex items-center gap-2`}>
        {template.is_premium && (
          <Badge variant="secondary" className="gap-1">
            <Zap className="h-3 w-3" />
            Premium
          </Badge>
        )}
        <Badge variant={agent.is_enabled ? "default" : "secondary"} className="gap-1">
          {agent.is_enabled ? (
            <>
              <Power className="h-3 w-3" />
              Ativo
            </>
          ) : (
            <>
              <PowerOff className="h-3 w-3" />
              Inativo
            </>
          )}
        </Badge>
      </div>

      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatarUrl || undefined} alt={displayName} />
            <AvatarFallback className="bg-primary/10">
              <IconComponent className="h-6 w-6 text-primary" />
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{displayName}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {agentTypeLabels[template.type] || template.type}
              </Badge>
              {template.uses_knowledge_base && (
                <Badge variant="outline" className="text-xs gap-1">
                  <BookOpen className="h-3 w-3" />
                  {agent.knowledge_count || 0} Q&A
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        <CardDescription className="line-clamp-2">
          {template.description}
        </CardDescription>

        {agent.additional_prompt && (
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded-md line-clamp-2">
            <span className="font-medium">Instruções extras:</span> {agent.additional_prompt}
          </div>
        )}

        <div className="flex gap-2 mt-auto pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onConfigure(agent)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
          
          {template.uses_knowledge_base && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => navigate(`/painel/agentes/${agent.id}/conhecimento`)}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Base Q&A
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

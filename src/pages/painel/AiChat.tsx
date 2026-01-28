import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Send, Bot, User, Loader2, ChevronDown, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIspAgents } from "@/hooks/painel/useIspAgents";
import { useIspMembership } from "@/hooks/useIspMembership";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const agentTypeLabels: Record<string, string> = {
  atendente: "Atendimento",
  cobrador: "Cobrança",
  vendedor: "Vendas",
  analista: "Análise",
  suporte: "Suporte Técnico",
};

const AiChatPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeAgents, isLoading: agentsLoading } = useIspAgents();
  const { membership } = useIspMembership();
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tokensUsed, setTokensUsed] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Filter only enabled agents
  const enabledAgents = activeAgents?.filter((a) => a.is_enabled) || [];

  // Initialize selected agent from URL or first available
  useEffect(() => {
    const agentSlugFromUrl = searchParams.get("agent");
    if (agentSlugFromUrl && enabledAgents.length) {
      const agent = enabledAgents.find((a) => a.ai_agents.slug === agentSlugFromUrl);
      if (agent) {
        setSelectedAgentId(agent.id);
        return;
      }
    }
    if (!selectedAgentId && enabledAgents.length) {
      setSelectedAgentId(enabledAgents[0].id);
    }
  }, [enabledAgents, searchParams]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const currentAgent = enabledAgents.find((a) => a.id === selectedAgentId);
  const template = currentAgent?.ai_agents;
  const displayName = currentAgent?.display_name || template?.name;
  const avatarUrl = currentAgent?.avatar_url || template?.avatar_url;

  const handleAgentChange = (ispAgentId: string) => {
    const agent = enabledAgents.find((a) => a.id === ispAgentId);
    if (agent) {
      setSelectedAgentId(ispAgentId);
      setSearchParams({ agent: agent.ai_agents.slug });
      setMessages([]); // Clear messages when changing agent
      setTokensUsed(0);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedAgentId || !currentAgent || !membership?.ispId || !user) return;

    const userMessage: Message = {
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Pass the template agent ID (ai_agents.id) to the edge function
      // along with isp_agent_id for context
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          message: userMessage.content,
          agentId: template?.id, // template id for AI config
          ispAgentId: currentAgent.id, // isp_agent for knowledge base & custom prompt
          ispId: membership.ispId,
          conversationHistory: messages.slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setTokensUsed((prev) => prev + (data.tokensUsed || 0));
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar mensagem",
        description: error.message || "Tente novamente em instantes.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (agentsLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (enabledAgents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
        <Bot className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Nenhum agente disponível</h2>
        <p className="text-muted-foreground max-w-md">
          Você precisa ativar pelo menos um agente para usar o chat.
          Acesse a página de Agentes de IA para ativar um agente do catálogo.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="bg-primary/10">
                    <Bot className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                {displayName || "Selecione um agente"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {enabledAgents.map((agent) => (
                <DropdownMenuItem
                  key={agent.id}
                  onClick={() => handleAgentChange(agent.id)}
                  className="gap-2"
                >
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={agent.avatar_url || agent.ai_agents.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10">
                      <Bot className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                  <span>{agent.display_name || agent.ai_agents.name}</span>
                  {agent.ai_agents.is_premium && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      Pro
                    </Badge>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {template && (
            <Badge variant="outline">
              {agentTypeLabels[template.type] || template.type}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Zap className="h-4 w-4" />
          <span>{tokensUsed.toLocaleString()} tokens nesta conversa</span>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea ref={scrollRef} className="flex-1 py-4">
        <div className="space-y-4 pr-4">
          {messages.length === 0 && currentAgent && (
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="pt-6 text-center">
                <Avatar className="h-16 w-16 mx-auto mb-4">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold mb-2">Olá! Sou o {displayName}</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {template?.description}
                </p>
              </CardContent>
            </Card>
          )}

          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}

              <Card
                className={`max-w-[80%] ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <CardContent className="p-3">
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <span
                    className={`text-xs mt-1 block ${
                      message.role === "user"
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </CardContent>
              </Card>

              {message.role === "user" && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-secondary">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <Card className="bg-muted">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      Digitando...
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="pt-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={
              currentAgent
                ? `Mensagem para ${displayName}...`
                : "Selecione um agente para começar"
            }
            disabled={!selectedAgentId || isLoading}
            className="min-h-[60px] max-h-[120px] resize-none"
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || !selectedAgentId || isLoading}
            size="icon"
            className="h-auto aspect-square"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Pressione Enter para enviar, Shift+Enter para nova linha
        </p>
      </div>
    </div>
  );
};

export default AiChatPage;

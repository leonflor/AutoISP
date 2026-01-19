import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Send, Bot, User, Loader2, ChevronDown, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAiAgents } from "@/hooks/painel/useAiAgents";
import { useIspMembership } from "@/hooks/useIspMembership";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const AiChatPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { agents, isLoading: agentsLoading, agentTypeLabels, isAgentAvailable } = useAiAgents();
  const { membership } = useIspMembership();
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tokensUsed, setTokensUsed] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize selected agent from URL or first available
  useEffect(() => {
    const agentFromUrl = searchParams.get("agent");
    if (agentFromUrl && agents) {
      const agent = agents.find((a) => a.slug === agentFromUrl);
      if (agent && isAgentAvailable(agent)) {
        setSelectedAgent(agent.id);
      }
    } else if (!selectedAgent && agents?.length) {
      const firstAvailable = agents.find((a) => isAgentAvailable(a));
      if (firstAvailable) {
        setSelectedAgent(firstAvailable.id);
      }
    }
  }, [agents, searchParams]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const currentAgent = agents?.find((a) => a.id === selectedAgent);

  const handleAgentChange = (agentId: string) => {
    const agent = agents?.find((a) => a.id === agentId);
    if (agent) {
      setSelectedAgent(agentId);
      setSearchParams({ agent: agent.slug });
      setMessages([]); // Clear messages when changing agent
      setTokensUsed(0);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedAgent || !membership?.ispId || !user) return;

    const userMessage: Message = {
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          message: userMessage.content,
          agentId: selectedAgent,
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

  const availableAgents = agents?.filter((a) => isAgentAvailable(a)) || [];

  if (agentsLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                <Bot className="h-4 w-4" />
                {currentAgent?.name || "Selecione um agente"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {availableAgents.map((agent) => (
                <DropdownMenuItem
                  key={agent.id}
                  onClick={() => handleAgentChange(agent.id)}
                  className="gap-2"
                >
                  <Bot className="h-4 w-4" />
                  <span>{agent.name}</span>
                  {agent.is_premium && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      Pro
                    </Badge>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {currentAgent && (
            <Badge variant="outline">
              {agentTypeLabels[currentAgent.type] || currentAgent.type}
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
                <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">
                  Olá! Sou o {currentAgent.name}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {currentAgent.description}
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
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={
              currentAgent
                ? `Mensagem para ${currentAgent.name}...`
                : "Selecione um agente para começar"
            }
            disabled={!selectedAgent || isLoading}
            className="min-h-[60px] max-h-[120px] resize-none"
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || !selectedAgent || isLoading}
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

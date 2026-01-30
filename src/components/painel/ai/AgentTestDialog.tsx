import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useIspMembership } from "@/hooks/useIspMembership";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { IspAgentWithTemplate } from "@/hooks/painel/useIspAgents";

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

interface AgentTestDialogProps {
  agents: IspAgentWithTemplate[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialAgentId?: string;
}

export function AgentTestDialog({
  agents,
  open,
  onOpenChange,
  initialAgentId,
}: AgentTestDialogProps) {
  const { membership } = useIspMembership();
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tokensUsed, setTokensUsed] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize selected agent when dialog opens
  useEffect(() => {
    if (open) {
      if (initialAgentId && agents.find((a) => a.id === initialAgentId)) {
        setSelectedAgentId(initialAgentId);
      } else if (agents.length > 0) {
        setSelectedAgentId(agents[0].id);
      }
    }
  }, [open, initialAgentId, agents]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const currentAgent = agents.find((a) => a.id === selectedAgentId);
  const template = currentAgent?.ai_agents;
  const displayName = currentAgent?.display_name || template?.name;
  const avatarUrl = currentAgent?.avatar_url || template?.avatar_url;

  const handleAgentChange = (newAgentId: string) => {
    setSelectedAgentId(newAgentId);
    setMessages([]);
    setTokensUsed(0);
    setInputMessage("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Clear everything when closing
      setMessages([]);
      setInputMessage("");
      setTokensUsed(0);
      setSelectedAgentId("");
    }
    onOpenChange(newOpen);
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
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          message: userMessage.content,
          agentId: template?.id,
          ispAgentId: currentAgent.id,
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Testar Agente</DialogTitle>
          <DialogDescription>
            Converse com seu agente para verificar as respostas. Esta conversa é temporária e será descartada ao fechar.
          </DialogDescription>
        </DialogHeader>

        {/* Agent Selector */}
        <div className="flex-shrink-0 flex items-center justify-between gap-4 pb-4 border-b">
          <Select value={selectedAgentId} onValueChange={handleAgentChange}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Selecione um agente" />
            </SelectTrigger>
            <SelectContent>
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={agent.avatar_url || agent.ai_agents.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10">
                        <Bot className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                    <span>{agent.display_name || agent.ai_agents.name}</span>
                    {agent.ai_agents.is_premium && (
                      <Badge variant="secondary" className="text-xs ml-1">Pro</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="h-4 w-4" />
            <span>{tokensUsed.toLocaleString()} tokens</span>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea ref={scrollRef} className="flex-1 py-4 min-h-0">
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
                  {template && (
                    <Badge variant="outline" className="mt-3">
                      {agentTypeLabels[template.type] || template.type}
                    </Badge>
                  )}
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
                  <Avatar className="h-8 w-8 flex-shrink-0">
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
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-secondary">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <Card className="bg-muted">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Digitando...</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex-shrink-0 pt-4 border-t">
          <div className="flex gap-2">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={currentAgent ? `Mensagem para ${displayName}...` : "Selecione um agente"}
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
      </DialogContent>
    </Dialog>
  );
}

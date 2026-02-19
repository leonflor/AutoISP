import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Loader2, Zap, FileText, ChevronDown, ChevronRight } from "lucide-react";
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

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useIspMembership } from "@/hooks/useIspMembership";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import type { IspAgentWithTemplate } from "@/hooks/painel/useIspAgents";

interface SourcesPayload {
  documents: { content: string; similarity: number; document_title?: string }[];
  knowledge: { question: string; category?: string }[];
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: SourcesPayload;
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

function SourcesBlock({ sources }: { sources: SourcesPayload }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasDocuments = sources.documents.length > 0;
  const hasKnowledge = sources.knowledge.length > 0;

  if (!hasDocuments && !hasKnowledge) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-1">
      <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
        {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        <FileText className="h-3 w-3" />
        <span>{sources.documents.length + sources.knowledge.length} fonte(s) consultada(s)</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
        {hasDocuments && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Documentos:</p>
            {sources.documents.map((doc, i) => (
              <div key={i} className="rounded border border-border bg-background/50 p-2 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium truncate">{doc.document_title || `Trecho ${i + 1}`}</span>
                  <Badge variant="outline" className="text-[10px] ml-2 shrink-0">
                    {(doc.similarity * 100).toFixed(0)}%
                  </Badge>
                </div>
                <p className="text-muted-foreground line-clamp-2">{doc.content}</p>
              </div>
            ))}
          </div>
        )}
        {hasKnowledge && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Q&A Base:</p>
            {sources.knowledge.map((item, i) => (
              <div key={i} className="rounded border border-border bg-background/50 p-2 text-xs">
                <span className="font-medium">{item.question}</span>
                {item.category && (
                  <Badge variant="secondary" className="text-[10px] ml-2">{item.category}</Badge>
                )}
              </div>
            ))}
          </div>
        )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
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
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasInitializedRef = useRef(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && !hasInitializedRef.current && agents.length > 0) {
      if (initialAgentId && agents.find((a) => a.id === initialAgentId)) {
        setSelectedAgentId(initialAgentId);
      } else {
        setSelectedAgentId(agents[0].id);
      }
      hasInitializedRef.current = true;
    }
  }, [open, initialAgentId, agents]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const currentAgent = agents.find((a) => a.id === selectedAgentId);
  const template = currentAgent?.ai_agents;
  const displayName = currentAgent?.display_name || template?.name;
  const avatarUrl = currentAgent?.avatar_url || template?.avatar_url;

  const handleAgentChange = (newAgentId: string) => {
    abortRef.current?.abort();
    setSelectedAgentId(newAgentId);
    setMessages([]);
    setTokensUsed(0);
    setInputMessage("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      abortRef.current?.abort();
      setMessages([]);
      setInputMessage("");
      setTokensUsed(0);
      setSelectedAgentId("");
      hasInitializedRef.current = false;
    }
    onOpenChange(newOpen);
  };

  const sendMessage = useCallback(async () => {
    if (!inputMessage.trim() || !selectedAgentId || !currentAgent || !membership?.ispId || !user) return;

    const userMessage: Message = {
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage("");
    setIsLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Sessão expirada. Faça login novamente.");

      const chatUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

      const payload = {
        isp_id: membership.ispId,
        isp_agent_id: currentAgent.id,
        messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
        stream: true,
      };

      const resp = await fetch(chatUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        const msg = errorData.message || errorData.error || `Erro ${resp.status}`;
        throw new Error(msg);
      }

      if (!resp.body) throw new Error("Sem corpo na resposta");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let messageSources: SourcesPayload | undefined;
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);

            // Check if this is the sources+usage event
            if (parsed.sources) {
              messageSources = parsed.sources;
              if (parsed.usage?.total_tokens) {
                setTokensUsed(prev => prev + parsed.usage.total_tokens);
              }
              continue;
            }

            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, { role: "assistant", content: assistantContent, timestamp: new Date() }];
              });
            }
          } catch {
            // Partial JSON, put back
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.sources) {
              messageSources = parsed.sources;
            }
          } catch { /* ignore */ }
        }
      }

      // Attach sources to the final assistant message
      if (messageSources) {
        setMessages(prev =>
          prev.map((m, i) =>
            i === prev.length - 1 && m.role === "assistant"
              ? { ...m, sources: messageSources }
              : m
          )
        );
      }
    } catch (error: any) {
      if (error.name === "AbortError") return;
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar mensagem",
        description: error.message || "Tente novamente em instantes.",
      });
      // Remove the empty assistant message if streaming failed before content
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && !last.content) {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
      abortRef.current = null;
      textareaRef.current?.focus();
    }
  }, [inputMessage, selectedAgentId, currentAgent, membership?.ispId, user, messages, toast]);

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
        <div className="flex-1 min-h-0 overflow-y-auto py-4">
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

                <div className="max-w-[80%]">
                  <Card
                    className={
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }
                  >
                    <CardContent className="p-3">
                      {message.role === "assistant" ? (
                        <div className="text-sm prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
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
                  {message.role === "assistant" && message.sources && (
                    <SourcesBlock sources={message.sources} />
                  )}
                </div>

                {message.role === "user" && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-secondary">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
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
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 pt-4 border-t">
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
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

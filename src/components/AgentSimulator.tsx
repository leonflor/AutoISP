import { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Bot, Send, RotateCcw, Loader2, Thermometer, GitBranch,
  Bug, Wrench, User, Zap, PhoneForwarded,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SimulatorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  debug?: {
    procedure?: string | null;
    procedure_name?: string | null;
    step_index?: number;
    step_instruction?: string | null;
    tool_calls?: Array<{ name: string; args?: unknown; success?: boolean }>;
    elapsed_ms?: number;
    tool_iterations?: number;
    mode?: string;
  };
}

interface AgentSimulatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantAgentId?: string;
  templateId?: string;
  agentName?: string;
  showDebug?: boolean;
}

export function AgentSimulator({
  open,
  onOpenChange,
  tenantAgentId,
  templateId,
  agentName = 'Agente',
  showDebug: initialShowDebug = true,
}: AgentSimulatorProps) {
  const [messages, setMessages] = useState<SimulatorMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(initialShowDebug);
  const [lastDebug, setLastDebug] = useState<SimulatorMessage['debug'] | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  const resetConversation = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setLastDebug(null);
    setInput('');
  }, []);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: SimulatorMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const body: Record<string, unknown> = { message: text };
      if (tenantAgentId) body.tenant_agent_id = tenantAgentId;
      if (templateId) body.template_id = templateId;
      if (conversationId) body.conversation_id = conversationId;

      const { data, error } = await supabase.functions.invoke('simulate-agent', { body });

      if (error) throw error;

      if (!conversationId && data?.conversation_id) {
        setConversationId(data.conversation_id);
      }

      const botMsg: SimulatorMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data?.reply ?? 'Sem resposta',
        debug: data?.debug,
      };

      setMessages((prev) => [...prev, botMsg]);
      setLastDebug(data?.debug ?? null);
    } catch (err) {
      const errorMsg: SimulatorMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Erro: ${err instanceof Error ? err.message : 'Falha ao processar'}`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Simulador — {agentName}
            </DialogTitle>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
              <Zap className="h-3 w-3 mr-1" /> Modo Teste
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Left panel — Debug */}
          <div className="w-72 border-r bg-muted/30 p-4 flex flex-col gap-4 overflow-y-auto shrink-0 hidden md:flex">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium uppercase text-muted-foreground">Debug</Label>
                <Switch checked={debugMode} onCheckedChange={setDebugMode} />
              </div>

              <Separator />

              {/* Procedure info */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <GitBranch className="h-3.5 w-3.5" /> Procedimento
                </div>
                <p className="text-sm">
                  {lastDebug?.procedure_name ?? lastDebug?.procedure ?? '—'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Bug className="h-3.5 w-3.5" /> Step atual
                </div>
                <p className="text-sm">
                  {lastDebug?.step_index !== undefined ? `#${lastDebug.step_index}` : '—'}
                </p>
                {lastDebug?.step_instruction && (
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {lastDebug.step_instruction}
                  </p>
                )}
              </div>

              {lastDebug?.mode && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Modo</p>
                  <Badge variant="outline" className="text-xs">
                    {lastDebug.mode}
                  </Badge>
                </div>
              )}

              {lastDebug?.elapsed_ms !== undefined && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Latência</p>
                  <p className="text-sm tabular-nums">{lastDebug.elapsed_ms}ms</p>
                </div>
              )}
            </div>

            <div className="mt-auto">
              <Button variant="outline" size="sm" className="w-full" onClick={resetConversation}>
                <RotateCcw className="h-3.5 w-3.5 mr-2" /> Reiniciar conversa
              </Button>
            </div>
          </div>

          {/* Right panel — Chat */}
          <div className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4 max-w-2xl mx-auto">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                    <Bot className="h-12 w-12 mb-4 opacity-30" />
                    <p className="text-sm">Envie uma mensagem para testar o agente</p>
                  </div>
                )}

                {messages.map((msg) => (
                  <div key={msg.id}>
                    {/* Debug card before bot message */}
                    {debugMode && msg.role === 'assistant' && msg.debug?.tool_calls?.length ? (
                      <div className="mb-2 rounded-lg bg-muted/50 border p-3 text-xs space-y-1.5">
                        <div className="flex items-center gap-1 font-medium text-muted-foreground">
                          <Wrench className="h-3 w-3" /> Tool calls
                        </div>
                        {msg.debug.tool_calls.map((tc, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Badge
                              variant={tc.success ? 'default' : 'destructive'}
                              className="text-[10px] px-1.5 py-0"
                            >
                              {tc.success ? '✓' : '✗'}
                            </Badge>
                            <code className="text-xs">{tc.name}</code>
                          </div>
                        ))}
                        {msg.debug.elapsed_ms && (
                          <p className="text-muted-foreground">{msg.debug.elapsed_ms}ms</p>
                        )}
                      </div>
                    ) : null}

                    {/* Transfer to human indicator */}
                    {msg.role === 'assistant' && msg.debug?.mode === 'human' && (
                      <div className="mb-2 rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 text-xs flex items-center gap-2">
                        <PhoneForwarded className="h-4 w-4 text-amber-600 shrink-0" />
                        <span className="text-amber-700 font-medium">
                          Conversa transferida para atendimento humano
                        </span>
                      </div>
                    )}

                    {/* Message bubble */}
                    <div
                      className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            <Bot className="h-3.5 w-3.5" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-2.5 max-w-[80%] text-sm whitespace-pre-wrap ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {msg.content}
                      </div>
                      {msg.role === 'user' && (
                        <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                          <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                            <User className="h-3.5 w-3.5" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                ))}

                {sending && (
                  <div className="flex gap-2 justify-start">
                    <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        <Bot className="h-3.5 w-3.5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-2xl px-4 py-2.5">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input area */}
            <div className="border-t p-4">
              <div className="flex gap-2 max-w-2xl mx-auto">
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite uma mensagem..."
                  className="min-h-[44px] max-h-32 resize-none"
                  rows={1}
                  disabled={sending}
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="shrink-0 h-11 w-11"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {/* Mobile debug toggle */}
              <div className="flex items-center gap-2 mt-2 md:hidden">
                <Switch checked={debugMode} onCheckedChange={setDebugMode} id="debug-mobile" />
                <Label htmlFor="debug-mobile" className="text-xs text-muted-foreground">Debug</Label>
                <Button variant="ghost" size="sm" className="ml-auto text-xs" onClick={resetConversation}>
                  <RotateCcw className="h-3 w-3 mr-1" /> Reset
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

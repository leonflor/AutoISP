import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useLiveSupport, ConversationItem, Message } from '@/hooks/painel/useLiveSupport';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  Headset,
  Send,
  Bot,
  ArrowLeftRight,
  CheckCircle2,
  Clock,
  User,
  MessageSquare,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function timeAgo(dateStr: string | null) {
  if (!dateStr) return '';
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: ptBR });
}

// ── Conversation Card ──
function ConversationCard({
  conv,
  active,
  onClick,
}: {
  conv: ConversationItem;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg transition-colors border ${
        active
          ? 'bg-accent border-primary/30'
          : 'bg-card hover:bg-accent/50 border-transparent'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-sm truncate">
          {conv.user_identifier || conv.user_phone}
        </span>
        {conv.unread && (
          <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
        )}
      </div>
      <p className="text-xs text-muted-foreground truncate">
        {conv.last_message || 'Sem mensagens'}
      </p>
      <div className="flex items-center gap-2 mt-1.5">
        <Clock className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          {timeAgo(conv.handover_at)}
        </span>
        {conv.handover_reason && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {conv.handover_reason}
          </Badge>
        )}
      </div>
    </button>
  );
}

// ── Message Bubble ──
function MessageBubble({
  msg,
  handoverAt,
  prevMsg,
}: {
  msg: Message;
  handoverAt: string | null;
  prevMsg: Message | null;
}) {
  // Show handover divider
  const showDivider =
    handoverAt &&
    prevMsg &&
    msg.created_at &&
    prevMsg.created_at &&
    new Date(prevMsg.created_at) <= new Date(handoverAt) &&
    new Date(msg.created_at) > new Date(handoverAt);

  // Skip tool messages
  if (msg.tool_name) return null;

  const isUser = msg.role === 'user';
  const isBot = msg.role === 'assistant';
  const isAgent = msg.role === 'agent';

  return (
    <>
      {showDivider && (
        <div className="flex items-center gap-2 my-4">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
            <ArrowLeftRight className="h-3 w-3" />
            Transferido para atendente • {timeAgo(handoverAt)}
          </span>
          <Separator className="flex-1" />
        </div>
      )}
      <div
        className={`flex ${isAgent ? 'justify-end' : 'justify-start'} mb-2`}
      >
        <div
          className={`max-w-[75%] rounded-xl px-3.5 py-2.5 text-sm ${
            isUser
              ? 'bg-muted text-foreground'
              : isBot
              ? 'bg-primary/10 text-foreground'
              : 'bg-primary text-primary-foreground'
          }`}
        >
          {isBot && (
            <div className="flex items-center gap-1 mb-1">
              <Bot className="h-3 w-3" />
              <span className="text-[10px] font-semibold opacity-70">
                Sofia (bot)
              </span>
            </div>
          )}
          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
          <p
            className={`text-[10px] mt-1 ${
              isAgent ? 'text-primary-foreground/60' : 'text-muted-foreground'
            }`}
          >
            {msg.created_at
              ? new Date(msg.created_at).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : ''}
          </p>
        </div>
      </div>
    </>
  );
}

// ── Main Page ──
export default function LiveSupport() {
  const {
    myAgent,
    waitingQueue,
    myConversations,
    activeConversationId,
    activeConversation,
    messages,
    quickReplies,
    onlineAgents,
    loading,
    sending,
    setActiveConversationId,
    toggleAvailability,
    claimConversation,
    sendMessage,
    returnToBot,
    resolveConversation,
    transferConversation,
  } = useLiveSupport();

  const [inputText, setInputText] = useState('');
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleConversationClick = (conv: ConversationItem) => {
    if (!conv.assigned_agent_id) {
      claimConversation(conv.id);
    } else {
      setActiveConversationId(conv.id);
    }
  };

  const collectedContext = activeConversation?.collected_context as Record<string, any> | null;
  const customerData = collectedContext?.customer;
  const invoicesData = collectedContext?.invoices;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!myAgent) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] gap-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Agente não encontrado</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Você não está registrado como atendente. Peça a um administrador para
          adicionar você como agente humano.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* ── Left Column: Queue ── */}
      <div className="w-[260px] border-r border-border flex flex-col shrink-0">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold">Status</span>
            <Switch
              checked={myAgent.is_available ?? false}
              onCheckedChange={toggleAvailability}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {myAgent.is_available ? 'Online — recebendo atendimentos' : 'Offline'}
          </p>
        </div>

        <Tabs defaultValue="waiting" className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-2 mx-3 mt-3">
            <TabsTrigger value="waiting" className="text-xs">
              Aguardando
              {waitingQueue.length > 0 && (
                <Badge variant="destructive" className="ml-1 text-[10px] h-4 px-1">
                  {waitingQueue.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="mine" className="text-xs">
              Meus ({myConversations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="waiting" className="flex-1 m-0">
            <ScrollArea className="h-full p-3">
              <div className="space-y-2">
                {waitingQueue.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    Nenhum atendimento na fila
                  </p>
                ) : (
                  waitingQueue.map((conv) => (
                    <ConversationCard
                      key={conv.id}
                      conv={conv}
                      active={activeConversationId === conv.id}
                      onClick={() => handleConversationClick(conv)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="mine" className="flex-1 m-0">
            <ScrollArea className="h-full p-3">
              <div className="space-y-2">
                {myConversations.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    Nenhum atendimento ativo
                  </p>
                ) : (
                  myConversations.map((conv) => (
                    <ConversationCard
                      key={conv.id}
                      conv={conv}
                      active={activeConversationId === conv.id}
                      onClick={() => handleConversationClick(conv)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Center Column: Chat ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {!activeConversation ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <Headset className="h-12 w-12" />
            <p className="text-sm">Selecione uma conversa para iniciar o atendimento</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="h-14 border-b border-border px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {activeConversation.user_identifier || activeConversation.user_phone}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activeConversation.user_phone}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReturnDialog(true)}
                  className="text-xs"
                >
                  <Bot className="h-3 w-3 mr-1" />
                  Devolver ao bot
                </Button>
                <Button
                  size="sm"
                  onClick={resolveConversation}
                  className="text-xs"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Resolver
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {messages.map((msg, idx) => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  handoverAt={activeConversation.handover_at}
                  prevMsg={idx > 0 ? messages[idx - 1] : null}
                />
              ))}
            </ScrollArea>

            {/* Quick Replies */}
            {quickReplies.length > 0 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {quickReplies.slice(0, 6).map((qr) => (
                  <button
                    key={qr.id}
                    onClick={() => setInputText(qr.text)}
                    className="text-xs bg-muted hover:bg-accent px-2.5 py-1 rounded-full transition-colors"
                  >
                    {qr.text.length > 30 ? qr.text.slice(0, 30) + '…' : qr.text}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="border-t border-border p-3 flex gap-2">
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem..."
                className="min-h-[40px] max-h-[120px] resize-none text-sm"
                rows={1}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!inputText.trim() || sending}
                className="shrink-0"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </>
        )}
      </div>

      {/* ── Right Column: Context ── */}
      {activeConversation && (
        <div className="w-[280px] border-l border-border overflow-y-auto shrink-0">
          <div className="p-4 space-y-4">
            {/* Briefing */}
            {activeConversation.handover_summary && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    Briefing do Bot
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                    {activeConversation.handover_summary}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Customer data */}
            {customerData && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Dados do Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-1.5 text-xs">
                    {Object.entries(customerData).map(([key, val]) => (
                      <div key={key}>
                        <dt className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</dt>
                        <dd className="font-medium">{String(val)}</dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            )}

            {/* Invoices */}
            {invoicesData && Array.isArray(invoicesData) && invoicesData.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold">
                    Boletos em aberto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {invoicesData.map((inv: any, i: number) => (
                      <div
                        key={i}
                        className="text-xs p-2 bg-muted rounded flex justify-between"
                      >
                        <span>{inv.due_date || 'N/A'}</span>
                        <span className="font-medium">
                          {inv.amount_cents
                            ? `R$ ${(inv.amount_cents / 100).toFixed(2)}`
                            : inv.amount || 'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Online agents */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold flex items-center gap-1">
                  <Headset className="h-3 w-3" />
                  Atendentes Online ({onlineAgents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  {onlineAgents.map((agent) => (
                    <div
                      key={agent.id}
                      className="flex items-center justify-between text-xs"
                    >
                      <span>{agent.display_name}</span>
                      <span className="text-muted-foreground">
                        {agent.current_chat_count}/{agent.max_concurrent_chats}
                      </span>
                    </div>
                  ))}
                  {onlineAgents.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Nenhum atendente online
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3 text-xs"
                  onClick={() => setShowTransferDialog(true)}
                >
                  <ArrowLeftRight className="h-3 w-3 mr-1" />
                  Transferir
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Return to bot dialog */}
      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Devolver ao bot</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            A conversa será devolvida ao atendimento automático. O bot continuará
            de onde parou.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReturnDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                returnToBot();
                setShowReturnDialog(false);
              }}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer dialog */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transferir conversa</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {onlineAgents
              .filter((a) => a.id !== myAgent?.id)
              .map((agent) => (
                <Button
                  key={agent.id}
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => {
                    transferConversation(agent.id);
                    setShowTransferDialog(false);
                  }}
                >
                  <span>{agent.display_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {agent.current_chat_count}/{agent.max_concurrent_chats} chats
                  </span>
                </Button>
              ))}
            {onlineAgents.filter((a) => a.id !== myAgent?.id).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum outro atendente disponível
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

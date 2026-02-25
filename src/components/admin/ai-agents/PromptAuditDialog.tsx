import { useState } from 'react';
import { Copy, Check, Bot, Shield, BookOpen, GitBranch, Wrench, Server, Mic, History, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import type { AuditPromptResult } from '@/hooks/admin/useAuditPrompt';

interface PromptAuditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: AuditPromptResult | null;
  isLoading: boolean;
}

function formatTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) +
    ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function PromptAuditDialog({ open, onOpenChange, data, isLoading }: PromptAuditDialogProps) {
  const [copied, setCopied] = useState(false);
  // -1 = current (simulated), 0..N = history index
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const activePrompt = selectedIndex === -1
    ? data?.prompt || ''
    : data?.history?.[selectedIndex]?.prompt || '';

  const handleCopy = async () => {
    if (!activePrompt) return;
    await navigator.clipboard.writeText(activePrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) setSelectedIndex(-1);
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Auditoria de Prompt
          </DialogTitle>
          <DialogDescription>
            {data ? `${data.agent_name} — ${data.isp_name}` : 'Carregando...'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : data ? (
          <div className="flex flex-col min-h-0 flex-1 gap-3">
            {/* History navigation bar */}
            {(data.history?.length > 0) && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <Button
                  variant={selectedIndex === -1 ? 'default' : 'outline'}
                  size="sm"
                  className="shrink-0 text-xs h-7"
                  onClick={() => setSelectedIndex(-1)}
                >
                  <Bot className="h-3 w-3 mr-1" />
                  Atual
                </Button>
                {data.history.map((h, i) => (
                  <Button
                    key={h.id}
                    variant={selectedIndex === i ? 'default' : 'outline'}
                    size="sm"
                    className="shrink-0 text-xs h-7"
                    onClick={() => setSelectedIndex(i)}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(h.created_at)}
                    <Badge variant="secondary" className="ml-1.5 text-[10px] px-1 py-0">
                      {formatTokens(h.tokens_total)} tok
                    </Badge>
                  </Button>
                ))}
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 min-h-0 flex-1">
              {/* Metadata sidebar - only show for current */}
              {selectedIndex === -1 && (
                <div className="md:w-64 shrink-0 space-y-3">
                  <div className="rounded-lg border p-3 space-y-3 text-sm">
                    <div className="flex items-center gap-2 font-medium">
                      <Bot className="h-4 w-4 text-muted-foreground" />
                      {data.metadata.template_name}
                    </div>
                    <Separator />

                    <div className="space-y-2">
                      <MetaItem icon={<Server className="h-3.5 w-3.5" />} label="Modelo" value={data.metadata.model} />
                      {data.metadata.voice_tone && (
                        <MetaItem icon={<Mic className="h-3.5 w-3.5" />} label="Tom de voz" value={data.metadata.voice_tone} />
                      )}
                      <MetaItem icon={<Shield className="h-3.5 w-3.5" />} label="Cláusulas de segurança" value={String(data.metadata.security_clauses_count)} />
                      <MetaItem icon={<BookOpen className="h-3.5 w-3.5" />} label="FAQs" value={String(data.metadata.knowledge_base_count)} />
                      <MetaItem icon={<BookOpen className="h-3.5 w-3.5" />} label="Documentos indexados" value={String(data.metadata.document_count)} />
                    </div>

                    {data.metadata.flows.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                            <GitBranch className="h-3.5 w-3.5" />
                            Fluxos ativos
                          </div>
                          <div className="space-y-1">
                            {data.metadata.flows.map((f) => (
                              <div key={f.slug} className="flex items-center justify-between">
                                <span className="text-xs">{f.name}</span>
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                  {f.steps_count} etapas
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {data.metadata.tools.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                            <Wrench className="h-3.5 w-3.5" />
                            Ferramentas
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {data.metadata.tools.map((t) => (
                              <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {data.metadata.has_erp && (
                      <>
                        <Separator />
                        <div className="flex items-center gap-1.5">
                          <Badge variant="default" className="text-[10px]">
                            ERP: {data.metadata.erp_provider || 'ativo'}
                          </Badge>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* History metadata for selected historical prompt */}
              {selectedIndex >= 0 && data.history[selectedIndex] && (
                <div className="md:w-64 shrink-0 space-y-3">
                  <div className="rounded-lg border p-3 space-y-3 text-sm">
                    <div className="flex items-center gap-2 font-medium">
                      <History className="h-4 w-4 text-muted-foreground" />
                      Prompt Histórico
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <MetaItem icon={<Clock className="h-3.5 w-3.5" />} label="Data" value={formatDate(data.history[selectedIndex].created_at)} />
                      <MetaItem icon={<Server className="h-3.5 w-3.5" />} label="Tokens total" value={formatTokens(data.history[selectedIndex].tokens_total)} />
                      <MetaItem icon={<Server className="h-3.5 w-3.5" />} label="Tokens input" value={formatTokens(data.history[selectedIndex].tokens_input)} />
                      <MetaItem icon={<Server className="h-3.5 w-3.5" />} label="Tokens output" value={formatTokens(data.history[selectedIndex].tokens_output)} />
                    </div>
                  </div>
                </div>
              )}

              {/* Prompt content */}
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    {selectedIndex === -1 ? 'System Prompt (atual)' : 'System Prompt (histórico)'}{' '}
                    ({activePrompt.length.toLocaleString()} chars)
                  </span>
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
                    {copied ? 'Copiado' : 'Copiar'}
                  </Button>
                </div>
                <ScrollArea className="flex-1 rounded-lg border bg-muted/30">
                  <pre className="p-4 text-xs leading-relaxed whitespace-pre-wrap font-mono">
                    {activePrompt}
                  </pre>
                </ScrollArea>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function MetaItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

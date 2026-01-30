import { AlertTriangle, Clock, FileText, Server, Code, Layers } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ProcessingLog } from "@/hooks/admin/useProcessingLogs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LogDetailsDialogProps {
  log: ProcessingLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const stepLabels: Record<string, string> = {
  init: "Inicialização",
  update_status: "Atualização de Status",
  fetch_document: "Busca do Documento",
  download: "Download do Arquivo",
  extract: "Extração de Texto",
  chunk: "Divisão em Chunks",
  embed: "Geração de Embeddings",
  insert: "Inserção no Banco",
  unknown: "Desconhecido",
};

export function LogDetailsDialog({ log, open, onOpenChange }: LogDetailsDialogProps) {
  if (!log) return null;

  const details = log.error_details || {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Detalhes do Erro
          </DialogTitle>
          <DialogDescription>
            Informações técnicas do erro de processamento
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Código do Erro</p>
                <Badge variant="destructive" className="font-mono">
                  {log.error_code}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Etapa</p>
                <Badge variant="outline">
                  {stepLabels[log.processing_step] || log.processing_step}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Data/Hora
                </p>
                <p className="text-sm font-medium">
                  {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Server className="h-3 w-3" />
                  ISP
                </p>
                <p className="text-sm font-medium">
                  {log.isps?.name || "Não identificado"}
                </p>
              </div>
            </div>

            <Separator />

            {/* Document Info */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documento
              </h4>
              <div className="bg-muted p-3 rounded-lg">
                <p className="font-medium">{log.knowledge_documents?.name || "—"}</p>
                <p className="text-xs text-muted-foreground">
                  {log.knowledge_documents?.original_filename || "Arquivo não encontrado"}
                </p>
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Mensagem para o Cliente</h4>
              <div className="bg-destructive/10 text-destructive p-3 rounded-lg">
                <p className="text-sm">{log.error_message}</p>
              </div>
            </div>

            <Separator />

            {/* Technical Details */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Code className="h-4 w-4" />
                Detalhes Técnicos
              </h4>
              
              {details.original_error && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Erro Original</p>
                  <pre className="bg-muted p-3 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                    {details.original_error}
                  </pre>
                </div>
              )}

              {details.stack && details.stack.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Stack Trace</p>
                  <pre className="bg-muted p-3 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                    {details.stack.join("\n")}
                  </pre>
                </div>
              )}

              {details.step_context && Object.keys(details.step_context).length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    Contexto da Etapa
                  </p>
                  <pre className="bg-muted p-3 rounded-lg text-xs font-mono overflow-x-auto">
                    {JSON.stringify(details.step_context, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* IDs */}
            <Separator />
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div>
                <span className="font-medium">Log ID:</span> {log.id}
              </div>
              <div>
                <span className="font-medium">Doc ID:</span> {log.document_id || "—"}
              </div>
              <div>
                <span className="font-medium">ISP ID:</span> {log.isp_id}
              </div>
              <div>
                <span className="font-medium">Agent ID:</span> {log.isp_agent_id || "—"}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

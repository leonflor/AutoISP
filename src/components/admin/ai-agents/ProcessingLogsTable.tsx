import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, FileText, Clock, Server } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LogDetailsDialog } from "./LogDetailsDialog";
import type { ProcessingLog } from "@/hooks/admin/useProcessingLogs";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProcessingLogsTableProps {
  logs: ProcessingLog[] | undefined;
  isLoading: boolean;
}

const stepLabels: Record<string, string> = {
  init: "Inicialização",
  update_status: "Atualização",
  fetch_document: "Busca",
  download: "Download",
  extract: "Extração",
  chunk: "Chunking",
  embed: "Embeddings",
  insert: "Inserção",
  unknown: "Desconhecido",
};

const stepColors: Record<string, string> = {
  download: "bg-blue-100 text-blue-700",
  extract: "bg-yellow-100 text-yellow-700",
  chunk: "bg-purple-100 text-purple-700",
  embed: "bg-orange-100 text-orange-700",
  insert: "bg-green-100 text-green-700",
  unknown: "bg-gray-100 text-gray-700",
};

export function ProcessingLogsTable({ logs, isLoading }: ProcessingLogsTableProps) {
  const [selectedLog, setSelectedLog] = useState<ProcessingLog | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!logs?.length) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/30">
        <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-semibold">Nenhum log de erro</h3>
        <p className="text-sm text-muted-foreground">
          Os erros de processamento de documentos aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-40">Data/Hora</TableHead>
              <TableHead>ISP</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead className="w-36">Código</TableHead>
              <TableHead className="w-28">Etapa</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {format(new Date(log.created_at), "dd/MM HH:mm", { locale: ptBR })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(log.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {log.isps?.name || "ISP não encontrado"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 max-w-[200px]">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate">
                      {log.knowledge_documents?.name || log.knowledge_documents?.original_filename || "—"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="destructive" className="font-mono text-xs">
                    {log.error_code}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-1 rounded ${stepColors[log.processing_step] || stepColors.unknown}`}>
                    {stepLabels[log.processing_step] || log.processing_step}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedLog(log)}
                  >
                    <ChevronDown className="h-4 w-4" />
                    Ver
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <LogDetailsDialog
        log={selectedLog}
        open={!!selectedLog}
        onOpenChange={(open) => !open && setSelectedLog(null)}
      />
    </>
  );
}

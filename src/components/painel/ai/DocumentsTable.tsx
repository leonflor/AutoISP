import { useState } from "react";
import { FileText, Trash2, RefreshCw, FileWarning, Database, AlertCircle, Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { DocumentStatusBadge } from "./DocumentStatusBadge";
import type { KnowledgeDocument } from "@/hooks/painel/useDocumentKnowledge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

// Helper to parse error code from error_message
function parseErrorCode(errorMessage: string | null): { code: string; message: string } | null {
  if (!errorMessage) return null;
  
  // Format: "ERR_XXXX_XXX - Message here"
  const match = errorMessage.match(/^(ERR_[A-Z0-9_]+)\s*-\s*(.+)$/);
  if (match) {
    return { code: match[1], message: match[2] };
  }
  
  // Legacy format (no code)
  return { code: "ERR_UNKNOWN", message: errorMessage };
}

interface DocumentsTableProps {
  documents: KnowledgeDocument[] | undefined;
  isLoading: boolean;
  onDelete: (id: string) => void;
  onReprocess: (id: string) => void;
  isDeleting?: boolean;
  isReprocessing?: boolean;
}

const mimeTypeLabels: Record<string, string> = {
  "application/pdf": "PDF",
  "text/plain": "TXT",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "application/vnd.oasis.opendocument.text": "ODT",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsTable({
  documents,
  isLoading,
  onDelete,
  onReprocess,
  isDeleting,
  isReprocessing,
}: DocumentsTableProps) {
  const { toast } = useToast();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (doc: KnowledgeDocument) => {
    if (!doc.storage_path) return;
    setDownloadingId(doc.id);
    try {
      const { data, error } = await supabase.storage
        .from("knowledge-docs")
        .download(doc.storage_path);
      if (error) throw error;
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.original_filename || doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      toast({
        title: "Erro ao baixar",
        description: err.message || "Não foi possível baixar o arquivo.",
        variant: "destructive",
      });
    } finally {
      setDownloadingId(null);
    }
  };
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!documents?.length) {
    return (
      <div className="text-center py-12">
        <FileWarning className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-semibold">Nenhum documento</h3>
        <p className="text-sm text-muted-foreground">
          Faça upload de documentos para enriquecer a base de conhecimento do agente.
        </p>
      </div>
    );
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir "${name}"? Todos os chunks serão removidos.`)) {
      onDelete(id);
    }
  };

  return (
    <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Documento</TableHead>
            <TableHead className="w-24">Tipo</TableHead>
            <TableHead className="w-24">Tamanho</TableHead>
            <TableHead className="w-28">Status</TableHead>
            <TableHead className="w-24 text-center">Chunks</TableHead>
            <TableHead className="w-36">Atualizado</TableHead>
            <TableHead className="w-24 text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate max-w-[200px]">{doc.name}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {doc.original_filename}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                  {mimeTypeLabels[doc.mime_type] || "???"}
                </span>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatBytes(doc.size_bytes)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <DocumentStatusBadge status={doc.status} />
                  {doc.status === "error" && doc.error_message && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1.5 cursor-help">
                          <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0 text-destructive border-destructive/50">
                            {parseErrorCode(doc.error_message)?.code || "ERR"}
                          </Badge>
                          <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-medium text-destructive mb-1">
                          {parseErrorCode(doc.error_message)?.code}
                        </p>
                        <p className="text-sm">
                          {parseErrorCode(doc.error_message)?.message}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1 text-sm">
                  <Database className="h-3 w-3 text-muted-foreground" />
                  {doc.chunk_count || 0}
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(doc.updated_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(doc)}
                        disabled={downloadingId === doc.id || !doc.storage_path}
                      >
                        {downloadingId === doc.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Baixar arquivo</TooltipContent>
                  </Tooltip>
                  {doc.status === "error" && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onReprocess(doc.id)}
                          disabled={isReprocessing}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Reprocessar</TooltipContent>
                    </Tooltip>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(doc.id, doc.name)}
                        disabled={isDeleting || doc.status === "processing"}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Excluir</TooltipContent>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TooltipProvider>
  );
}

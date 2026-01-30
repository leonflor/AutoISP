import { FileText, Trash2, RefreshCw, FileWarning, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
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
                <Tooltip>
                  <TooltipTrigger>
                    <DocumentStatusBadge status={doc.status} />
                  </TooltipTrigger>
                  {doc.error_message && (
                    <TooltipContent>
                      <p className="max-w-xs">{doc.error_message}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
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

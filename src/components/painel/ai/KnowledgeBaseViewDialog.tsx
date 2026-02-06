import ReactMarkdown from "react-markdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle, Pencil } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Database } from "@/integrations/supabase/types";

type KnowledgeBase = Database["public"]["Tables"]["agent_knowledge_base"]["Row"];

interface KnowledgeBaseViewDialogProps {
  item: KnowledgeBase | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (item: KnowledgeBase) => void;
}

export function KnowledgeBaseViewDialog({
  item,
  open,
  onOpenChange,
  onEdit,
}: KnowledgeBaseViewDialogProps) {
  if (!item) return null;

  const handleEdit = () => {
    onOpenChange(false);
    onEdit(item);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg">Visualizar Pergunta</DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto space-y-5 py-2">
          {/* Status & Category */}
          <div className="flex items-center gap-2 flex-wrap">
            {item.is_active ? (
              <Badge variant="default" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Ativo
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <XCircle className="h-3 w-3" />
                Inativo
              </Badge>
            )}
            {item.category && (
              <Badge variant="outline">{item.category}</Badge>
            )}
            {item.updated_at && (
              <span className="text-xs text-muted-foreground ml-auto">
                Atualizado em {format(new Date(item.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
            )}
          </div>

          {/* Question */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Pergunta</h4>
            <p className="text-base font-semibold text-foreground">{item.question}</p>
          </div>

          {/* Answer */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Resposta</h4>
            <div className="prose prose-sm dark:prose-invert max-w-none rounded-lg border border-border bg-muted/30 p-4">
              <ReactMarkdown>{item.answer}</ReactMarkdown>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={handleEdit}>
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

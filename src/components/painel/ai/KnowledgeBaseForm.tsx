import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { Database } from "@/integrations/supabase/types";
import type { KnowledgeBaseForm as KnowledgeFormType } from "@/hooks/painel/useAgentKnowledge";

type KnowledgeBase = Database["public"]["Tables"]["agent_knowledge_base"]["Row"];

const knowledgeSchema = z.object({
  question: z.string().min(10, "Pergunta deve ter pelo menos 10 caracteres"),
  answer: z.string().min(20, "Resposta deve ter pelo menos 20 caracteres"),
  category: z.string().optional(),
  sort_order: z.coerce.number().default(0),
  is_active: z.boolean().default(true),
});

interface KnowledgeBaseFormProps {
  item: KnowledgeBase | null;
  categories: string[] | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (form: KnowledgeFormType) => void;
  isLoading?: boolean;
}

export function KnowledgeBaseForm({
  item,
  categories,
  open,
  onOpenChange,
  onSave,
  isLoading,
}: KnowledgeBaseFormProps) {
  const isEditing = !!item;

  const form = useForm<KnowledgeFormType>({
    resolver: zodResolver(knowledgeSchema),
    defaultValues: {
      question: "",
      answer: "",
      category: "",
      sort_order: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        question: item.question,
        answer: item.answer,
        category: item.category || "",
        sort_order: item.sort_order || 0,
        is_active: item.is_active ?? true,
      });
    } else {
      form.reset({
        question: "",
        answer: "",
        category: "",
        sort_order: 0,
        is_active: true,
      });
    }
  }, [item, open]);

  const handleSubmit = form.handleSubmit((data) => {
    onSave(data);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Pergunta" : "Nova Pergunta"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize os dados desta pergunta da base de conhecimento."
              : "Adicione uma nova pergunta e resposta à base de conhecimento do agente."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question">Pergunta</Label>
            <Textarea
              id="question"
              placeholder="Ex: Como faço para pagar minha fatura?"
              className="min-h-[80px]"
              {...form.register("question")}
            />
            {form.formState.errors.question && (
              <p className="text-sm text-destructive">
                {form.formState.errors.question.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="answer">Resposta</Label>
            <Textarea
              id="answer"
              placeholder="Forneça uma resposta completa e clara..."
              className="min-h-[120px]"
              {...form.register("answer")}
            />
            {form.formState.errors.answer && (
              <p className="text-sm text-destructive">
                {form.formState.errors.answer.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Markdown é suportado (negrito, listas, links, etc.)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria (opcional)</Label>
              <Input
                id="category"
                placeholder="Ex: Pagamentos"
                list="category-suggestions"
                {...form.register("category")}
              />
              <datalist id="category-suggestions">
                {categories?.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort_order">Ordem</Label>
              <Input
                id="sort_order"
                type="number"
                min={0}
                {...form.register("sort_order")}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <Label htmlFor="is_active" className="font-medium">
                Ativo
              </Label>
              <p className="text-xs text-muted-foreground">
                Perguntas inativas não são usadas pelo agente
              </p>
            </div>
            <Switch
              id="is_active"
              checked={form.watch("is_active")}
              onCheckedChange={(checked) => form.setValue("is_active", checked)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

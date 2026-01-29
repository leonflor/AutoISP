import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bot, Save, Trash2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { IspAgentWithTemplate } from "@/hooks/painel/useIspAgents";

const configSchema = z.object({
  display_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  avatar_url: z.string().url("URL inválida").or(z.literal("")).optional(),
  is_enabled: z.boolean(),
});

type ConfigForm = z.infer<typeof configSchema>;

interface AgentConfigDialogProps {
  agent: IspAgentWithTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (form: ConfigForm) => void;
  onRemove: () => void;
  isLoading?: boolean;
}

export function AgentConfigDialog({
  agent,
  open,
  onOpenChange,
  onSave,
  onRemove,
  isLoading,
}: AgentConfigDialogProps) {
  const [showRemoveAlert, setShowRemoveAlert] = useState(false);

  const form = useForm<ConfigForm>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      display_name: "",
      avatar_url: "",
      is_enabled: true,
    },
  });

  useEffect(() => {
    if (agent) {
      form.reset({
        display_name: agent.display_name || agent.ai_agents.name,
        avatar_url: agent.avatar_url || "",
        is_enabled: agent.is_enabled ?? true,
      });
    }
  }, [agent]);

  const handleSubmit = form.handleSubmit((data) => {
    onSave(data);
  });

  const handleRemoveConfirm = () => {
    setShowRemoveAlert(false);
    onRemove();
  };

  if (!agent) return null;

  const template = agent.ai_agents;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Configurar: {agent.display_name || template.name}
            </DialogTitle>
            <DialogDescription>
              Edite as configurações personalizadas deste agente.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 py-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <Label htmlFor="is_enabled" className="font-medium">
                  Agente Ativo
                </Label>
                <p className="text-xs text-muted-foreground">
                  Desative para pausar temporariamente
                </p>
              </div>
              <Switch
                id="is_enabled"
                checked={form.watch("is_enabled")}
                onCheckedChange={(checked) => form.setValue("is_enabled", checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_name">Nome de Exibição</Label>
              <Input
                id="display_name"
                placeholder="Ex: Atendente Virtual"
                {...form.register("display_name")}
              />
              {form.formState.errors.display_name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.display_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar_url">URL do Avatar (opcional)</Label>
              <Input
                id="avatar_url"
                placeholder="https://exemplo.com/avatar.png"
                {...form.register("avatar_url")}
              />
            </div>
          </form>

          <div className="flex justify-between items-center pt-4 border-t flex-shrink-0">
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowRemoveAlert(true)}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remover
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showRemoveAlert} onOpenChange={setShowRemoveAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Remover Agente
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este agente? Toda a base de conhecimento
              associada também será removida. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

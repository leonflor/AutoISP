import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bot, Zap, Eye } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CatalogTemplate, AgentActivationForm } from "@/hooks/painel/useIspAgents";

const activationSchema = z.object({
  display_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  avatar_url: z.string().url("URL inválida").or(z.literal("")).optional(),
  additional_prompt: z.string().optional(),
});

interface AgentActivationDialogProps {
  agent: CatalogTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActivate: (form: AgentActivationForm) => void;
  isLoading?: boolean;
}

export function AgentActivationDialog({
  agent,
  open,
  onOpenChange,
  onActivate,
  isLoading,
}: AgentActivationDialogProps) {
  const [activeTab, setActiveTab] = useState("config");

  const form = useForm<AgentActivationForm>({
    resolver: zodResolver(activationSchema),
    defaultValues: {
      display_name: agent?.name || "",
      avatar_url: "",
      additional_prompt: "",
    },
  });

  // Reset form when agent changes
  if (agent && form.getValues("display_name") !== agent.name && !form.formState.isDirty) {
    form.reset({
      display_name: agent.name,
      avatar_url: "",
      additional_prompt: "",
    });
  }

  const handleSubmit = form.handleSubmit((data) => {
    onActivate(data);
  });

  const additionalPrompt = form.watch("additional_prompt");
  const previewPrompt = agent?.system_prompt
    ? `${agent.system_prompt}\n\n--- Instruções Adicionais ---\n${additionalPrompt || "(nenhuma)"}`
    : "";

  if (!agent) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Ativar Agente: {agent.name}
          </DialogTitle>
          <DialogDescription>
            Personalize o agente para seu provedor. As instruções adicionais serão
            combinadas com o prompt base do template.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="config">Configuração</TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="config" className="space-y-4 mt-4">
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
                {form.formState.errors.avatar_url && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.avatar_url.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="additional_prompt">Instruções Adicionais</Label>
                <Textarea
                  id="additional_prompt"
                  placeholder="Adicione instruções específicas do seu provedor, como nome da empresa, políticas, produtos, etc."
                  className="min-h-[150px]"
                  {...form.register("additional_prompt")}
                />
                <p className="text-xs text-muted-foreground">
                  Estas instruções serão adicionadas ao prompt base do agente.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="outline">{agent.model}</Badge>
                <Badge variant="outline">Temp: {agent.temperature}</Badge>
                <Badge variant="outline">Max: {agent.max_tokens} tokens</Badge>
                {agent.uses_knowledge_base && (
                  <Badge variant="secondary">Suporta Base de Conhecimento</Badge>
                )}
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-4">
              <div className="space-y-2">
                <Label>Prompt Final (Preview)</Label>
                <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                  <pre className="text-xs whitespace-pre-wrap font-mono">
                    {previewPrompt}
                  </pre>
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                "Ativando..."
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Ativar Agente
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

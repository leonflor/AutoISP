import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bot, Zap, Eye, Settings2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { AvatarUpload } from "./AvatarUpload";
import { BehaviorTab } from "./BehaviorTab";
import { useIspMembership } from "@/hooks/useIspMembership";
import { usePlatformConfig } from "@/hooks/usePlatformConfig";
import type { CatalogTemplate, AgentActivationForm } from "@/hooks/painel/useIspAgents";
import type { VoiceTone, EscalationOptions } from "@/components/admin/ai-agents/constants";

const activationSchema = z.object({
  display_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  avatar_url: z.string().url("URL inválida").or(z.literal("")).optional(),
  additional_prompt: z.string().optional(),
  voice_tone: z.string().optional(),
  escalation_config: z.object({
    triggers: z.array(z.string()),
    max_interactions: z.number().min(1).max(50),
  }).optional(),
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
  const { membership } = useIspMembership();
  const { configMap } = usePlatformConfig();

  // Default avatar from platform config
  const defaultAvatar = (configMap?.default_agent_avatar?.value as string) || '';

  // Parse voice tones and escalation options from agent template
  const voiceTones: VoiceTone[] = (agent?.voice_tones as unknown as VoiceTone[]) || [];
  const escalationOptions: EscalationOptions = (agent?.escalation_options as unknown as EscalationOptions) || {
    triggers: [],
    max_interactions: { min: 3, max: 10, default: 5 },
  };

  // Determine default triggers (those marked as default)
  const defaultTriggers = escalationOptions.triggers
    ?.filter(t => t.default)
    ?.map(t => t.id) || [];

  const form = useForm<AgentActivationForm>({
    resolver: zodResolver(activationSchema),
    defaultValues: {
      display_name: agent?.name || "",
      avatar_url: "",
      additional_prompt: "",
      voice_tone: voiceTones[0]?.id || "",
      escalation_config: {
        triggers: defaultTriggers,
        max_interactions: escalationOptions.max_interactions?.default || 5,
      },
    },
  });

  // Reset form when agent changes
  useEffect(() => {
    if (agent && open) {
      const triggers = escalationOptions.triggers
        ?.filter(t => t.default)
        ?.map(t => t.id) || [];
      
      form.reset({
        display_name: agent.name,
        avatar_url: "",
        additional_prompt: "",
        voice_tone: voiceTones[0]?.id || "",
        escalation_config: {
          triggers,
          max_interactions: escalationOptions.max_interactions?.default || 5,
        },
      });
      setActiveTab("config");
    }
  }, [agent, open]);

  const handleSubmit = form.handleSubmit((data) => {
    onActivate(data);
  });

  const additionalPrompt = form.watch("additional_prompt");
  const selectedTone = form.watch("voice_tone");
  const escConfig = form.watch("escalation_config");

  // Build preview prompt
  const buildPreviewPrompt = () => {
    let prompt = agent?.system_prompt || "";
    
    // Add voice tone
    if (selectedTone) {
      const tone = voiceTones.find(t => t.id === selectedTone);
      if (tone) {
        prompt += `\n\n## Tom de Comunicação\nAdote um tom ${tone.label}: ${tone.description || ''}`;
      }
    }
    
    // Add escalation rules
    if (escConfig?.triggers?.length) {
      const triggerLabels = escConfig.triggers
        .map(id => escalationOptions.triggers?.find(t => t.id === id)?.label)
        .filter(Boolean);
      
      if (triggerLabels.length > 0) {
        prompt += `\n\n## Escalonamento para Humano`;
        prompt += `\nTransfira para atendente humano quando: ${triggerLabels.join(', ')}.`;
        prompt += `\nApós ${escConfig.max_interactions} interações sem resolução, sugira transferência.`;
      }
    }
    
    // Add additional instructions
    if (additionalPrompt) {
      prompt += `\n\n--- Instruções Adicionais ---\n${additionalPrompt}`;
    }
    
    return prompt;
  };

  const hasBehaviorOptions = voiceTones.length > 0 || (escalationOptions.triggers?.length || 0) > 0;

  if (!agent) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Ativar Agente: {agent.name}
          </DialogTitle>
          <DialogDescription>
            Personalize o agente para seu provedor. Configure o nome, avatar, tom de voz e regras de escalonamento.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
            <TabsList className={`grid w-full ${hasBehaviorOptions ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <TabsTrigger value="config">Configuração</TabsTrigger>
              {hasBehaviorOptions && (
                <TabsTrigger value="behavior">
                  <Settings2 className="h-4 w-4 mr-2" />
                  Comportamento
                </TabsTrigger>
              )}
              <TabsTrigger value="preview">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 mt-4">
              <TabsContent value="config" className="space-y-4 mt-0 px-1">
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
                  <Label>Avatar do Agente</Label>
                  <AvatarUpload
                    value={form.watch("avatar_url") || ""}
                    onChange={(url) => form.setValue("avatar_url", url, { shouldDirty: true })}
                    ispId={membership?.ispId || ""}
                    defaultAvatar={defaultAvatar}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additional_prompt">Instruções Adicionais</Label>
                  <Textarea
                    id="additional_prompt"
                    placeholder="Adicione instruções específicas do seu provedor, como nome da empresa, políticas, produtos, etc."
                    className="min-h-[120px]"
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

              {hasBehaviorOptions && (
                <TabsContent value="behavior" className="mt-0 px-1">
                  <BehaviorTab
                    form={form}
                    voiceTones={voiceTones}
                    escalationOptions={escalationOptions}
                  />
                </TabsContent>
              )}

              <TabsContent value="preview" className="mt-0 px-1">
                <div className="space-y-2">
                  <Label>Prompt Final (Preview)</Label>
                  <div className="rounded-md border p-4 bg-muted/50 max-h-[400px] overflow-auto">
                    <pre className="text-xs whitespace-pre-wrap font-mono">
                      {buildPreviewPrompt()}
                    </pre>
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0 mt-4">
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
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

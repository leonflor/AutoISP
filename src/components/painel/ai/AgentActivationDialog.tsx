import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bot, Zap, Upload, FileText, X } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AvatarUpload } from "./AvatarUpload";
import { BehaviorTab } from "./BehaviorTab";
import { useIspMembership } from "@/hooks/useIspMembership";
import { usePlatformConfig } from "@/hooks/usePlatformConfig";
import type { CatalogTemplate, AgentActivationForm, KnowledgeItem } from "@/hooks/painel/useIspAgents";
import type { VoiceTone, EscalationOptions } from "@/components/admin/ai-agents/constants";

const activationSchema = z.object({
  display_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  avatar_url: z.string().url("URL inválida").or(z.literal("")).optional(),
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

function parseCSV(content: string): KnowledgeItem[] {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  // Parse header
  const header = lines[0].toLowerCase();
  const hasCategory = header.includes('categoria') || header.includes('category');
  
  const items: KnowledgeItem[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Simple CSV parsing (handles quoted values)
    const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
    const cleanValues = values.map(v => v.replace(/^"|"$/g, '').trim());
    
    if (cleanValues.length >= 2) {
      const question = cleanValues[0];
      const answer = cleanValues[1];
      const category = hasCategory && cleanValues[2] ? cleanValues[2] : undefined;
      
      // Validate minimum lengths
      if (question.length >= 10 && answer.length >= 20) {
        items.push({ question, answer, category });
      }
    }
  }
  
  return items;
}

export function AgentActivationDialog({
  agent,
  open,
  onOpenChange,
  onActivate,
  isLoading,
}: AgentActivationDialogProps) {
  const { membership } = useIspMembership();
  const { configMap } = usePlatformConfig();
  
  // Knowledge base states
  const [knowledgeFile, setKnowledgeFile] = useState<File | null>(null);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);
  const [parsedItems, setParsedItems] = useState<KnowledgeItem[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        voice_tone: voiceTones[0]?.id || "",
        escalation_config: {
          triggers,
          max_interactions: escalationOptions.max_interactions?.default || 5,
        },
      });
      setKnowledgeFile(null);
      setParsedItems([]);
      setParseError(null);
      setImportMode('append');
    }
  }, [agent, open]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setParseError(null);
    
    try {
      const content = await file.text();
      const items = parseCSV(content);
      
      if (items.length === 0) {
        setParseError("Arquivo inválido. Verifique se contém colunas Pergunta e Resposta, e se os textos têm o tamanho mínimo.");
        setKnowledgeFile(null);
        setParsedItems([]);
        return;
      }
      
      setKnowledgeFile(file);
      setParsedItems(items);
    } catch {
      setParseError("Erro ao ler o arquivo. Verifique se é um CSV válido.");
      setKnowledgeFile(null);
      setParsedItems([]);
    }
  };

  const handleRemoveFile = () => {
    setKnowledgeFile(null);
    setParsedItems([]);
    setParseError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = form.handleSubmit((data) => {
    // If replace mode is selected and there are items, show confirmation
    if (parsedItems.length > 0 && importMode === 'replace') {
      setShowReplaceConfirm(true);
      return;
    }
    
    submitActivation(data);
  });

  const submitActivation = (data: AgentActivationForm) => {
    onActivate({
      ...data,
      knowledge_items: parsedItems.length > 0 ? parsedItems : undefined,
      knowledge_import_mode: parsedItems.length > 0 ? importMode : undefined,
    });
  };

  const confirmReplaceAndActivate = () => {
    setShowReplaceConfirm(false);
    const data = form.getValues();
    submitActivation(data);
  };

  const hasBehaviorOptions = voiceTones.length > 0 || (escalationOptions.triggers?.length || 0) > 0;

  if (!agent) return null;

  return (
    <>
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
            <ScrollArea className="flex-1 mt-4">
              <div className="space-y-4 px-1">
                {/* Configuração */}
                <div className="space-y-4">
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
                      defaultAvatar={agent?.avatar_url || defaultAvatar}
                    />
                  </div>

                  {/* Knowledge Base Upload - only if agent supports it */}
                  {agent.uses_knowledge_base && (
                    <div className="space-y-3 pt-4 border-t">
                      <Label>Base de Conhecimento (opcional)</Label>
                      <p className="text-xs text-muted-foreground">
                        Envie um arquivo CSV com perguntas e respostas para o agente usar como referência.
                      </p>
                      
                      {!knowledgeFile ? (
                        <div 
                          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm font-medium">Selecionar arquivo CSV</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Colunas: Pergunta, Resposta, Categoria (opcional)
                          </p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">{knowledgeFile.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {parsedItems.length} perguntas encontradas
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={handleRemoveFile}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm">Ao importar:</Label>
                            <RadioGroup 
                              value={importMode} 
                              onValueChange={(v) => setImportMode(v as 'append' | 'replace')}
                            >
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="append" id="append" />
                                <Label htmlFor="append" className="font-normal cursor-pointer">
                                  Adicionar às perguntas existentes
                                </Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="replace" id="replace" />
                                <Label htmlFor="replace" className="font-normal cursor-pointer">
                                  Substituir toda a base (requer confirmação)
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>
                        </div>
                      )}

                      {parseError && (
                        <p className="text-sm text-destructive">{parseError}</p>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Badge variant="outline">{agent.model}</Badge>
                    <Badge variant="outline">Temp: {agent.temperature}</Badge>
                    <Badge variant="outline">Max: {agent.max_tokens} tokens</Badge>
                    {agent.uses_knowledge_base && (
                      <Badge variant="secondary">Suporta Base de Conhecimento</Badge>
                    )}
                  </div>
                </div>

                {/* Comportamento - apenas se houver opções */}
                {hasBehaviorOptions && (
                  <>
                    <Separator className="my-4" />
                    <BehaviorTab
                      form={form}
                      voiceTones={voiceTones}
                      escalationOptions={escalationOptions}
                    />
                  </>
                )}
              </div>
            </ScrollArea>

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

      {/* Confirmation dialog for replace mode */}
      <AlertDialog open={showReplaceConfirm} onOpenChange={setShowReplaceConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Substituir Base de Conhecimento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá apagar todas as perguntas existentes deste agente e importar 
              apenas as {parsedItems.length} perguntas do novo arquivo. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReplaceAndActivate}>
              Confirmar e Ativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

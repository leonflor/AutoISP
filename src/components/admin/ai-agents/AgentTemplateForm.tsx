import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FeatureTagsSelector } from './FeatureTagsSelector';
import { PersonalizationTab } from './PersonalizationTab';
import { AgentProceduresTab } from './AgentProceduresTab';
import { TemplateAvatarUpload } from './TemplateAvatarUpload';
import { AI_MODELS, AGENT_TYPES, AGENT_SCOPES, DATA_ACCESS_OPTIONS, DEFAULT_VOICE_TONES, DEFAULT_ESCALATION_OPTIONS } from './constants';
import type { AiAgent } from '@/hooks/admin/useAiAgentTemplates';
import { useTemplateUsage } from '@/hooks/admin/useAiAgentTemplates';

const agentSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Use apenas letras minúsculas, números e hífens'),
  description: z.string().optional(),
  type: z.enum(['atendente', 'cobrador', 'vendedor', 'analista', 'suporte']),
  scope: z.enum(['tenant', 'platform']).default('tenant'),
  model: z.string().default('gpt-4o-mini'),
  temperature: z.number().min(0).max(2).default(0.7),
  max_tokens: z.coerce.number().min(100).max(4000).default(1000),
  system_prompt: z.string().min(10, 'Prompt é obrigatório'),
  avatar_url: z.string().url().optional().or(z.literal('')),
  feature_tags: z.array(z.string()).default([]),
  uses_knowledge_base: z.boolean().default(false),
  is_active: z.boolean().default(true),
  allowed_data_access: z.array(z.string()).default([]),
  voice_tones: z.array(z.object({
    id: z.string(),
    label: z.string(),
    description: z.string().optional(),
  })).default([]),
  escalation_options: z.object({
    triggers: z.array(z.object({
      id: z.string(),
      label: z.string(),
      default: z.boolean().optional(),
    })).default([]),
    max_interactions: z.object({
      min: z.number().default(3),
      max: z.number().default(10),
      default: z.number().default(5),
    }).default({ min: 3, max: 10, default: 5 }),
  }).default({ triggers: [], max_interactions: { min: 3, max: 10, default: 5 } }),
});

export type AgentFormValues = z.infer<typeof agentSchema>;

interface AgentTemplateFormProps {
  agent?: AiAgent | null;
  onSubmit: (data: AgentFormValues) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export function AgentTemplateForm({
  agent,
  onSubmit,
  isSubmitting,
  onCancel,
}: AgentTemplateFormProps) {
  
  const [showDeactivateAlert, setShowDeactivateAlert] = useState(false);
  const [pendingData, setPendingData] = useState<AgentFormValues | null>(null);
  
  const { data: templateUsage } = useTemplateUsage(agent?.id);
  
  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      type: 'atendente',
      scope: 'tenant',
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 1000,
      system_prompt: '',
      avatar_url: '',
      feature_tags: [],
      uses_knowledge_base: false,
      is_active: true,
      allowed_data_access: [],
      voice_tones: DEFAULT_VOICE_TONES,
      escalation_options: DEFAULT_ESCALATION_OPTIONS,
    },
  });

  const scope = form.watch('scope');

  useEffect(() => {
    if (agent) {
      form.reset({
        name: agent.name,
        slug: agent.slug,
        description: agent.description || '',
        type: agent.type,
        scope: agent.scope || 'tenant',
        model: agent.model || 'gpt-4o-mini',
        temperature: agent.temperature ? Number(agent.temperature) : 0.7,
        max_tokens: agent.max_tokens || 1000,
        system_prompt: agent.system_prompt || '',
        avatar_url: agent.avatar_url || '',
        feature_tags: (agent.feature_tags as string[]) || [],
        uses_knowledge_base: agent.uses_knowledge_base || false,
        is_active: agent.is_active ?? true,
        allowed_data_access: (agent.allowed_data_access as string[]) || [],
        voice_tones: (agent.voice_tones as any[]) || DEFAULT_VOICE_TONES,
        escalation_options: (agent.escalation_options as any) || DEFAULT_ESCALATION_OPTIONS,
      });
    } else {
      form.reset();
    }
  }, [agent, form]);

  const name = form.watch('name');
  useEffect(() => {
    if (!agent && name) {
      const slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      form.setValue('slug', slug);
    }
  }, [name, agent, form]);

  const handleSubmit = (data: AgentFormValues) => {
    if (data.scope === 'platform') {
      data.uses_knowledge_base = false;
    }
    
    const isDeactivating = agent?.is_active && !data.is_active;
    
    if (isDeactivating && templateUsage && templateUsage.count > 0) {
      setPendingData(data);
      setShowDeactivateAlert(true);
      return;
    }
    
    onSubmit(data);
  };

  const handleConfirmDeactivate = () => {
    if (pendingData) {
      onSubmit(pendingData);
      setShowDeactivateAlert(false);
      setPendingData(null);
    }
  };

  const handleCancelDeactivate = () => {
    setShowDeactivateAlert(false);
    setPendingData(null);
  };

  const isNewAgent = !agent;

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="w-full flex gap-1">
              <TabsTrigger value="basic" className="flex-1">Básico</TabsTrigger>
              <TabsTrigger value="ai" className="flex-1">Config IA</TabsTrigger>
              <TabsTrigger value="features" className="flex-1">Features</TabsTrigger>
              <TabsTrigger value="personalization" className="flex-1" disabled={scope === 'platform'}>
                Personalização
              </TabsTrigger>
              <TabsTrigger value="procedures" className="flex-1" disabled={isNewAgent}>
                Procedimentos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Agente</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Assistente de Suporte" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="assistente-suporte" {...field} />
                      </FormControl>
                      <FormDescription>Identificador único (gerado automaticamente)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Breve descrição do que este agente faz..."
                        className="resize-none"
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AGENT_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="scope"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Escopo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o escopo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AGENT_SCOPES.map(scope => (
                            <SelectItem key={scope.value} value={scope.value}>
                              {scope.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {scope === 'tenant' 
                          ? 'ISPs poderão ativar este agente'
                          : 'Uso interno do SaaS apenas'
                        }
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {scope === 'platform' && (
                <FormField
                  control={form.control}
                  name="allowed_data_access"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Acesso a Dados</FormLabel>
                      <div className="space-y-2">
                        {DATA_ACCESS_OPTIONS.map(option => (
                          <div key={option.value} className="flex items-center gap-2">
                            <Checkbox
                              id={option.value}
                              checked={field.value.includes(option.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...field.value, option.value]);
                                } else {
                                  field.onChange(field.value.filter(v => v !== option.value));
                                }
                              }}
                            />
                            <label htmlFor={option.value} className="text-sm">
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                      <FormDescription>
                        Dados que este agente pode acessar (agregados, sem PII)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="avatar_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar do Agente</FormLabel>
                    <FormControl>
                      <TemplateAvatarUpload
                        value={field.value}
                        onChange={field.onChange}
                        slug={form.watch('slug')}
                      />
                    </FormControl>
                    <FormDescription>
                      Será usado como padrão se o ISP não enviar avatar próprio.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Ativo</FormLabel>
                      <FormDescription>
                        Agentes inativos não aparecem para ISPs
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </TabsContent>

            <TabsContent value="ai" className="space-y-4 mt-6">
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo de IA</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o modelo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {AI_MODELS.map(model => (
                          <SelectItem key={model.value} value={model.value}>
                            {model.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between">
                      <FormLabel>Temperatura</FormLabel>
                      <span className="text-sm text-muted-foreground">{field.value.toFixed(1)}</span>
                    </div>
                    <FormControl>
                      <Slider
                        min={0}
                        max={2}
                        step={0.1}
                        value={[field.value]}
                        onValueChange={([value]) => field.onChange(value)}
                      />
                    </FormControl>
                    <FormDescription>
                      0 = mais focado, 2 = mais criativo
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_tokens"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Máximo de Tokens</FormLabel>
                    <FormControl>
                      <Input type="number" min={100} max={4000} {...field} />
                    </FormControl>
                    <FormDescription>
                      Limite de tokens por resposta (100-4000)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="system_prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prompt do Sistema</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Você é um assistente especializado em..."
                        className="min-h-[250px] font-mono text-sm"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Instruções base que definem o comportamento do agente
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            <TabsContent value="features" className="space-y-4 mt-6">
              <FormField
                control={form.control}
                name="feature_tags"
                render={({ field }) => (
                  <FormItem>
                    <FeatureTagsSelector
                      value={field.value}
                      onChange={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {scope === 'tenant' && (
                <FormField
                  control={form.control}
                  name="uses_knowledge_base"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Base de Conhecimento</FormLabel>
                        <FormDescription>
                          Permitir que ISPs adicionem perguntas e respostas personalizadas
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </TabsContent>

            <TabsContent value="personalization" className="space-y-4 mt-6">
              <PersonalizationTab form={form} scope={scope as 'tenant' | 'platform'} />
            </TabsContent>

            <TabsContent value="procedures" className="mt-6">
              {agent ? (
                <AgentProceduresTab agentId={agent.id} />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Salve o agente primeiro para vincular procedimentos.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : agent ? 'Salvar Alterações' : 'Criar Agente'}
            </Button>
          </div>
        </form>
      </Form>

      <AlertDialog open={showDeactivateAlert} onOpenChange={setShowDeactivateAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirmar Desativação
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  Este template está sendo utilizado por <strong>{templateUsage?.count || 0} ISP(s)</strong>.
                </p>
                <p>
                  Ao desativar, os agentes desses ISPs deixarão de funcionar no chat até que o template seja reativado.
                </p>
                {templateUsage && templateUsage.isps.length > 0 && (
                  <div className="mt-3">
                    <p className="font-medium text-foreground mb-2">ISPs afetados:</p>
                    <ul className="space-y-1 text-sm">
                      {templateUsage.isps.slice(0, 5).map((isp) => (
                        <li key={isp.id} className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-destructive rounded-full" />
                          {isp.name} ({isp.agentCount} agente{isp.agentCount > 1 ? 's' : ''})
                        </li>
                      ))}
                      {templateUsage.isps.length > 5 && (
                        <li className="text-muted-foreground">
                          ... e mais {templateUsage.isps.length - 5} ISP(s)
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDeactivate}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeactivate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Desativar Mesmo Assim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

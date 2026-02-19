import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCreateGlobalFlow, useUpdateGlobalFlow } from '@/hooks/admin/useGlobalFlows';
import type { AgentFlow } from '@/hooks/admin/useAgentFlows';

const flowSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Use slug válido'),
  description: z.string().optional(),
  trigger_keywords: z.string().optional(),
  trigger_prompt: z.string().optional(),
  is_fixed: z.boolean().default(true),
  is_active: z.boolean().default(true),
});

type FlowFormValues = z.infer<typeof flowSchema>;

interface GlobalFlowFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flow?: AgentFlow | null;
}

export function GlobalFlowForm({ open, onOpenChange, flow }: GlobalFlowFormProps) {
  const createFlow = useCreateGlobalFlow();
  const updateFlow = useUpdateGlobalFlow();

  const form = useForm<FlowFormValues>({
    resolver: zodResolver(flowSchema),
    defaultValues: { name: '', slug: '', description: '', trigger_keywords: '', trigger_prompt: '', is_fixed: true, is_active: true },
  });

  useEffect(() => {
    if (flow) {
      form.reset({
        name: flow.name, slug: flow.slug, description: flow.description || '',
        trigger_keywords: (flow.trigger_keywords || []).join(', '),
        trigger_prompt: flow.trigger_prompt || '', is_fixed: flow.is_fixed, is_active: flow.is_active,
      });
    } else {
      form.reset({ name: '', slug: '', description: '', trigger_keywords: '', trigger_prompt: '', is_fixed: true, is_active: true });
    }
  }, [flow, open, form]);

  const name = form.watch('name');
  useEffect(() => {
    if (!flow && name) {
      const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      form.setValue('slug', slug);
    }
  }, [name, flow, form]);

  const onSubmit = (values: FlowFormValues) => {
    const keywords = (values.trigger_keywords || '').split(',').map(k => k.trim()).filter(Boolean);
    const payload = {
      name: values.name, slug: values.slug, description: values.description || undefined,
      trigger_keywords: keywords, trigger_prompt: values.trigger_prompt || undefined,
      is_fixed: values.is_fixed, is_active: values.is_active,
    };
    if (flow) {
      updateFlow.mutate({ id: flow.id, ...payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createFlow.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col top-[5vh] translate-y-0">
        <DialogHeader>
          <DialogTitle>{flow ? 'Editar Fluxo Global' : 'Novo Fluxo Global'}</DialogTitle>
          <DialogDescription>Define um roteiro conversacional reutilizável por múltiplos agentes</DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 overflow-y-auto pr-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nome do Fluxo</FormLabel><FormControl><Input placeholder="Cobrança" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="slug" render={({ field }) => (
                <FormItem><FormLabel>Slug</FormLabel><FormControl><Input placeholder="cobranca" {...field} disabled={!!flow} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea rows={2} className="resize-none" placeholder="Fluxo de cobrança de faturas em aberto" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="trigger_keywords" render={({ field }) => (
                <FormItem><FormLabel>Palavras-chave de Ativação</FormLabel><FormControl><Input placeholder="fatura, boleto, débito, pagamento" {...field} /></FormControl><FormDescription>Separadas por vírgula</FormDescription><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="trigger_prompt" render={({ field }) => (
                <FormItem><FormLabel>Instrução de Ativação</FormLabel><FormControl><Textarea rows={2} className="resize-none" placeholder="Ative quando o usuário mencionar problemas financeiros" {...field} /></FormControl><FormDescription>Instrução textual para o LLM sobre quando ativar</FormDescription><FormMessage /></FormItem>
              )} />
              <div className="flex gap-6">
                <FormField control={form.control} name="is_fixed" render={({ field }) => (
                  <FormItem className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <FormLabel className="!mt-0">Roteiro Fixo</FormLabel>
                    </div>
                    <FormDescription className="text-xs">Ativado: etapas seguidas na ordem exata. Desativado: agente adapta a ordem conforme o contexto.</FormDescription>
                  </FormItem>
                )} />
                <FormField control={form.control} name="is_active" render={({ field }) => (
                  <FormItem className="flex items-center gap-2"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="!mt-0">Ativo</FormLabel></FormItem>
                )} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit" disabled={createFlow.isPending || updateFlow.isPending}>{flow ? 'Salvar' : 'Criar Fluxo'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

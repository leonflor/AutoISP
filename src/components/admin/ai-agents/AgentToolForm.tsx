import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateAgentTool, useUpdateAgentTool, type AgentTool } from '@/hooks/admin/useAgentTools';

const HANDLER_TYPES = [
  { value: 'erp_search', label: 'Busca ERP', description: 'Busca clientes no ERP do ISP' },
];

const toolSchema = z.object({
  name: z.string().min(2).regex(/^[a-z0-9_]+$/, 'Use snake_case (letras, números, _)'),
  description: z.string().min(5, 'Descrição deve ter ao menos 5 caracteres'),
  parameters_schema: z.string().min(2, 'Schema JSON obrigatório'),
  handler_type: z.string().min(1),
  requires_erp: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

type ToolFormValues = z.infer<typeof toolSchema>;

interface AgentToolFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
  tool?: AgentTool | null;
}

const DEFAULT_SCHEMA = JSON.stringify(
  {
    type: 'object',
    properties: {
      busca: { type: 'string', description: 'Nome ou CPF do cliente' },
    },
    required: ['busca'],
  },
  null,
  2
);

export function AgentToolForm({ open, onOpenChange, agentId, tool }: AgentToolFormProps) {
  const createTool = useCreateAgentTool();
  const updateTool = useUpdateAgentTool();
  const [schemaError, setSchemaError] = useState<string | null>(null);

  const form = useForm<ToolFormValues>({
    resolver: zodResolver(toolSchema),
    defaultValues: {
      name: '',
      description: '',
      parameters_schema: DEFAULT_SCHEMA,
      handler_type: 'erp_search',
      requires_erp: false,
      is_active: true,
    },
  });

  useEffect(() => {
    if (tool) {
      form.reset({
        name: tool.name,
        description: tool.description,
        parameters_schema: JSON.stringify(tool.parameters_schema, null, 2),
        handler_type: tool.handler_type,
        requires_erp: tool.requires_erp,
        is_active: tool.is_active,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        parameters_schema: DEFAULT_SCHEMA,
        handler_type: 'erp_search',
        requires_erp: false,
        is_active: true,
      });
    }
    setSchemaError(null);
  }, [tool, open, form]);

  const onSubmit = (values: ToolFormValues) => {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(values.parameters_schema);
    } catch {
      setSchemaError('JSON inválido');
      return;
    }
    setSchemaError(null);

    const payload = {
      agent_id: agentId,
      name: values.name,
      description: values.description,
      parameters_schema: parsed,
      handler_type: values.handler_type,
      requires_erp: values.requires_erp,
      is_active: values.is_active,
    };

    if (tool) {
      updateTool.mutate({ id: tool.id, ...payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createTool.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{tool ? 'Editar Tool' : 'Nova Tool'}</DialogTitle>
          <DialogDescription>
            Define uma função que o agente pode invocar via Function Calling
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome (snake_case)</FormLabel>
                  <FormControl>
                    <Input placeholder="buscar_contrato_cliente" {...field} disabled={!!tool} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Busca contrato no ERP por nome ou CPF"
                      rows={2}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>O LLM usa esta descrição para decidir quando invocar</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="handler_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Handler</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {HANDLER_TYPES.map((h) => (
                        <SelectItem key={h.value} value={h.value}>
                          {h.label}
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
              name="parameters_schema"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Schema de Parâmetros (JSON)</FormLabel>
                  <FormControl>
                    <Textarea
                      className="font-mono text-xs min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  {schemaError && <p className="text-sm text-destructive">{schemaError}</p>}
                  <FormDescription>Formato OpenAI Function Calling</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="requires_erp"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">Requer ERP</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">Ativa</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createTool.isPending || updateTool.isPending}>
                {tool ? 'Salvar' : 'Criar Tool'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

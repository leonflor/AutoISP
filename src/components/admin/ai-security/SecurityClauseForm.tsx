import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Info } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SECURITY_PLACEHOLDERS, APPLIES_TO_OPTIONS } from '../ai-agents/constants';
import type { AiSecurityClause } from '@/hooks/admin/useAiSecurityClauses';

const clauseSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  content: z.string().min(50, 'Conteúdo deve ter pelo menos 50 caracteres'),
  applies_to: z.enum(['all', 'tenant', 'platform']).default('all'),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().default(0),
});

type ClauseFormValues = z.infer<typeof clauseSchema>;

interface SecurityClauseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clause?: AiSecurityClause | null;
  onSubmit: (data: ClauseFormValues) => void;
  isSubmitting?: boolean;
}

export function SecurityClauseForm({
  open,
  onOpenChange,
  clause,
  onSubmit,
  isSubmitting,
}: SecurityClauseFormProps) {
  const form = useForm<ClauseFormValues>({
    resolver: zodResolver(clauseSchema),
    defaultValues: {
      name: '',
      content: '',
      applies_to: 'all',
      is_active: true,
      sort_order: 0,
    },
  });

  useEffect(() => {
    if (clause) {
      form.reset({
        name: clause.name,
        content: clause.content,
        applies_to: (clause.applies_to as 'all' | 'tenant' | 'platform') || 'all',
        is_active: clause.is_active ?? true,
        sort_order: clause.sort_order || 0,
      });
    } else {
      form.reset({
        name: '',
        content: '',
        applies_to: 'all',
        is_active: true,
        sort_order: 0,
      });
    }
  }, [clause, form]);

  const insertPlaceholder = (placeholder: string) => {
    const currentContent = form.getValues('content');
    const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
    
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = currentContent.slice(0, start) + placeholder + currentContent.slice(end);
      form.setValue('content', newContent);
      
      // Set cursor position after placeholder
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
      }, 0);
    } else {
      form.setValue('content', currentContent + placeholder);
    }
  };

  // Preview with example values
  const content = form.watch('content');
  const previewContent = content
    .replace(/{ISP_NAME}/g, 'Internet Provider Ltda')
    .replace(/{ISP_ID}/g, 'abc-123-def')
    .replace(/{USER_NAME}/g, 'João Silva')
    .replace(/{AGENT_NAME}/g, 'Assistente Virtual')
    .replace(/{CURRENT_DATE}/g, new Date().toLocaleDateString('pt-BR'));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{clause ? 'Editar Cláusula' : 'Nova Cláusula'}</DialogTitle>
          <DialogDescription>
            Cláusulas de segurança são injetadas automaticamente em todos os prompts de IA.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
            <ScrollArea className="flex-1 px-6 max-h-[60vh]">
              <div className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Cláusula</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Isolamento de Dados LGPD" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="applies_to"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aplica-se a</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {APPLIES_TO_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              <span className={option.color.replace('bg-', 'text-').split(' ')[1]}>
                                {option.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Define em quais tipos de agentes esta cláusula será aplicada
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel>Placeholders Disponíveis</FormLabel>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Clique para inserir no cursor</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SECURITY_PLACEHOLDERS.map(({ placeholder, description }) => (
                      <Tooltip key={placeholder}>
                        <TooltipTrigger asChild>
                          <Badge
                            variant="outline"
                            className="cursor-pointer hover:bg-primary/10"
                            onClick={() => insertPlaceholder(placeholder)}
                          >
                            {placeholder}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{description}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conteúdo da Cláusula</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Insira as regras de segurança que serão injetadas no prompt..."
                          className="min-h-[150px] font-mono text-sm"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Use markdown para formatação. Placeholders serão substituídos dinamicamente.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {content.length > 50 && (
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <p className="text-sm font-medium mb-2">Preview (com valores de exemplo):</p>
                    <pre className="text-xs whitespace-pre-wrap text-muted-foreground font-mono">
                      {previewContent.slice(0, 500)}
                      {previewContent.length > 500 && '...'}
                    </pre>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sort_order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ordem de Injeção</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} {...field} />
                        </FormControl>
                        <FormDescription>
                          Menor = aparece primeiro no prompt
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-col justify-end">
                        <div className="flex items-center justify-between rounded-lg border p-3">
                          <FormLabel className="text-sm">Cláusula Ativa</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className="p-6 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : clause ? 'Salvar Alterações' : 'Criar Cláusula'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

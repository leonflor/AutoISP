import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  Eye,
  EyeOff,
  HelpCircle,
  KeyRound,
  Loader2,
  RefreshCw,
  ExternalLink,
  Server,
} from 'lucide-react';
import { ErpConfig, useErpConfigs } from '@/hooks/painel/useErpConfigs';

const formSchema = z.object({
  api_url: z.string().url('URL inválida').min(1, 'URL é obrigatória'),
  username: z.string().min(1, 'Usuário é obrigatório'),
  api_key: z.string().min(1, 'API Key é obrigatória'),
});

type FormData = z.infer<typeof formSchema>;

interface MkConfigDialogProps {
  open: boolean;
  config?: ErpConfig;
  onClose: () => void;
}

export function MkConfigDialog({ open, config, onClose }: MkConfigDialogProps) {
  const { saveConfig, testConnection } = useErpConfigs();
  const [showApiKey, setShowApiKey] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      api_url: '',
      username: '',
      api_key: '',
    },
  });

  // Reset form when config changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        api_url: config?.api_url || '',
        username: config?.username || '',
        api_key: '', // Never fill encrypted key
      });
      setFormError(null);
    }
  }, [config, open, form]);

  const onSubmit = (data: FormData) => {
    setFormError(null);
    saveConfig.mutate(
      {
        provider: 'mk_solutions',
        api_url: data.api_url,
        credentials: {
          username: data.username,
          api_key: data.api_key,
        },
      },
      {
        onSuccess: () => onClose(),
        onError: (error) => {
          setFormError(error instanceof Error ? error.message : 'Erro ao salvar configuração. Verifique os dados e tente novamente.');
        },
      }
    );
  };

  const handleTest = () => {
    testConnection.mutate('mk_solutions');
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-lg max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            Configurar MK-Solutions
          </DialogTitle>
          <DialogDescription>
            Configure a integração com seu sistema de gestão MK-Solutions
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Inline error */}
            {formError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            {/* Status Badge if already configured */}
            {config?.is_connected && (
              <Alert className="border-green-500/30 bg-green-500/5">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="flex items-center justify-between">
                  <span className="text-green-700">Integração ativa</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleTest}
                    disabled={testConnection.isPending}
                  >
                    {testConnection.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    <span className="ml-1">Testar</span>
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Masked Key if exists */}
            {config?.masked_key && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <KeyRound className="h-4 w-4" />
                <span className="font-mono text-sm">{config.masked_key}</span>
                <Badge variant="outline" className="ml-auto">
                  Configurado
                </Badge>
              </div>
            )}

            <FormField
              control={form.control}
              name="api_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Servidor *</FormLabel>
                  <FormControl>
                    <Input placeholder="https://mksolutions.seuprovedor.com.br" {...field} />
                  </FormControl>
                  <FormDescription>
                    URL base do seu servidor MK-Solutions
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuário *</FormLabel>
                  <FormControl>
                    <Input placeholder="usuario_integracao" {...field} />
                  </FormControl>
                  <FormDescription>
                    Usuário de integração do MK
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="api_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showApiKey ? 'text' : 'password'}
                        placeholder={config?.masked_key ? 'Digite nova API Key para atualizar' : 'Cole a API Key aqui'}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Token de API gerado no painel MK
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Instructions */}
            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <HelpCircle className="h-4 w-4" />
                Como obter as credenciais?
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3 space-y-2">
                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                  <li>Acesse o MK-Solutions {">"} Configurações {">"} Integrações</li>
                  <li>Crie um novo usuário de API</li>
                  <li>Defina as permissões necessárias</li>
                  <li>Copie o usuário e a API Key gerada</li>
                </ol>
                <Button variant="link" className="p-0 h-auto" asChild>
                  <a
                    href="https://wiki.mksolutions.com.br/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Ver documentação oficial
                  </a>
                </Button>
              </CollapsibleContent>
            </Collapsible>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saveConfig.isPending}>
                {saveConfig.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

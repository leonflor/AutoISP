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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import {
  Activity,
  CheckCircle,
  Eye,
  EyeOff,
  HelpCircle,
  KeyRound,
  Loader2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { ErpConfig, useErpConfigs } from '@/hooks/painel/useErpConfigs';

const formSchema = z.object({
  api_url: z.string().url('URL inválida').min(1, 'URL é obrigatória'),
  token: z.string().min(1, 'Token é obrigatório'),
  self_signed_cert: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

interface IxcConfigDialogProps {
  open: boolean;
  config?: ErpConfig;
  onClose: () => void;
}

export function IxcConfigDialog({ open, config, onClose }: IxcConfigDialogProps) {
  const { saveConfig, testConnection } = useErpConfigs();
  const [showToken, setShowToken] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      api_url: '',
      token: '',
      self_signed_cert: false,
    },
  });

  // Reset form when config changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        api_url: config?.api_url || '',
        token: '', // Never fill encrypted token
        self_signed_cert: (config?.sync_config as Record<string, unknown>)?.self_signed_cert as boolean || false,
      });
      setFormError(null);
    }
  }, [config, open, form]);

  const onSubmit = (data: FormData) => {
    setFormError(null);
    saveConfig.mutate(
      {
        provider: 'ixc',
        api_url: data.api_url,
        credentials: { token: data.token },
        options: { self_signed_cert: data.self_signed_cert },
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
    testConnection.mutate('ixc');
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
            <Activity className="h-5 w-5 text-primary" />
            Configurar IXC Soft
          </DialogTitle>
          <DialogDescription>
            Configure a integração com seu sistema de gestão IXC Soft
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
                    <Input placeholder="https://erp.seuprovedor.com.br" {...field} />
                  </FormControl>
                  <FormDescription>
                    URL base do seu servidor IXC
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token de Acesso *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showToken ? 'text' : 'password'}
                        placeholder={config?.masked_key ? 'Digite novo token para atualizar' : 'Cole o token aqui'}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowToken(!showToken)}
                      >
                        {showToken ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Token gerado no painel do IXC
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="self_signed_cert"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Certificado Self-Signed</FormLabel>
                    <FormDescription>
                      Marque se seu servidor usa certificado próprio
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <Separator />

            {/* Instructions */}
            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <HelpCircle className="h-4 w-4" />
                Como obter o token?
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3 space-y-2">
                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                  <li>Acesse o IXC {">"} Configurações {">"} Usuários</li>
                  <li>Crie ou edite um usuário para integração</li>
                  <li>Marque "Permite acesso ao webservice"</li>
                  <li>Após salvar, copie o Token gerado</li>
                </ol>
                <Button variant="link" className="p-0 h-auto" asChild>
                  <a
                    href="https://wikiapiprovedor.ixcsoft.com.br/"
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

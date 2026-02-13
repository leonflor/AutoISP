import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
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
  Activity,
  AlertTriangle,
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
  app: z.string().min(1, 'Nome do App é obrigatório'),
});

type FormData = z.infer<typeof formSchema>;

interface SgpConfigDialogProps {
  open: boolean;
  config?: ErpConfig;
  onClose: () => void;
}

export function SgpConfigDialog({ open, config, onClose }: SgpConfigDialogProps) {
  const { saveConfig, testConnection, removeConfig } = useErpConfigs();
  const [showToken, setShowToken] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      api_url: '',
      token: '',
      app: '',
    },
  });

  // Reset form when config changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        api_url: config?.api_url || '',
        token: '', // Never fill encrypted token
        app: config?.username || '',
      });
      setFormError(null);
    }
  }, [config, open, form]);

  const onSubmit = (data: FormData) => {
    setFormError(null);
    saveConfig.mutate(
      {
        provider: 'sgp',
        api_url: data.api_url,
        credentials: { token: data.token, username: data.app },
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
    testConnection.mutate('sgp');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent
        className="max-w-lg max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Configurar SGP
          </DialogTitle>
          <DialogDescription>
            Configure a integração com o Sistema Gerencial de Provedores
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
                    <Input placeholder="https://api.seuprovedor.sgp.net.br" {...field} />
                  </FormControl>
                  <FormDescription>
                    URL base do seu servidor SGP
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="app"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do App *</FormLabel>
                  <FormControl>
                    <Input placeholder="autoisp" {...field} />
                  </FormControl>
                  <FormDescription>
                    Identificador da aplicação cadastrado no SGP
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
                    Token gerado no painel do SGP
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
                Como obter o token?
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3 space-y-2">
                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                  <li>Acesse o SGP {">"} Configurações {">"} API/Integrações</li>
                  <li>Cadastre um App (ex: "autoisp")</li>
                  <li>Gere um novo token de acesso para o App</li>
                  <li>Copie o nome do App e o token gerado</li>
                  <li>Cole nos campos acima</li>
                </ol>
                <Button variant="link" className="p-0 h-auto" asChild>
                  <a
                    href="https://bookstack.sgp.net.br/books"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Ver documentação oficial
                  </a>
                </Button>
              </CollapsibleContent>
            </Collapsible>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              {config?.is_connected && (
                <Button
                  type="button"
                  variant="destructive"
                  className="sm:mr-auto"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Integração
                </Button>
              )}
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

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Integração SGP?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é irreversível. Todos os procedimentos de IA que dependem de integração com ERP deixarão de funcionar.
              Consultas de clientes, faturas e dados financeiros via agentes de IA serão interrompidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => removeConfig.mutate('sgp', { onSuccess: () => onClose() })}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  MessageCircle,
  Copy,
  Check,
  Loader2,
  ExternalLink,
  Wifi,
  WifiOff,
  Eye,
  EyeOff,
  RefreshCw,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAdminWhatsAppConfig } from '@/hooks/admin/useAdminWhatsAppConfig';
import { useAdminWhatsAppMessages } from '@/hooks/admin/useAdminWhatsAppMessages';
import { SendMessageForm } from '@/components/painel/whatsapp/SendMessageForm';
import { MessageHistory } from '@/components/painel/whatsapp/MessageHistory';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const formSchema = z.object({
  phone_number_id: z.string().min(1, 'Phone Number ID é obrigatório'),
  access_token: z.string().optional().default(''),
  phone_number: z.string().min(1, 'Número do WhatsApp é obrigatório'),
  verify_token: z.string().optional().default(''),
});

type FormData = z.infer<typeof formSchema>;

export default function AdminWhatsApp() {
  const { config, isLoading, saveConfig, testConnection, webhookUrl } = useAdminWhatsAppConfig();
  const { messages, isLoading: messagesLoading, sendMessage } = useAdminWhatsAppMessages();
  const [showToken, setShowToken] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone_number_id: '',
      access_token: '',
      phone_number: '',
      verify_token: '',
    },
  });

  useEffect(() => {
    if (config) {
      form.reset({
        phone_number_id: config.phone_number_id || '',
        access_token: '',
        phone_number: config.phone_number || '',
        verify_token: '',
      });
    }
  }, [config, form]);

  const hasExistingToken = !!config?.api_key_encrypted;
  const hasExistingVerifyToken = !!config?.verify_token;

  const onSubmit = (data: FormData) => {
    saveConfig.mutate({
      phone_number_id: data.phone_number_id,
      access_token: data.access_token,
      phone_number: data.phone_number,
      verify_token: data.verify_token,
    });
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const verifyToken = form.watch('verify_token') || config?.verify_token || '';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-primary" />
          WhatsApp SaaS
        </h1>
        <p className="text-muted-foreground">
          Integração WhatsApp própria do SaaS Admin — independente dos ISPs
        </p>
      </div>

      <Tabs defaultValue="config" className="space-y-4">
        <TabsList>
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="send">Enviar Mensagem</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                Status da Conexão
              {config?.is_connected ? (
                <Badge variant="default">
                  <Wifi className="h-3 w-3 mr-1" /> Conectado
                </Badge>
              ) : (
                  <Badge variant="secondary">
                    <WifiOff className="h-3 w-3 mr-1" /> Desconectado
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {config?.connected_at
                    ? `Última conexão: ${format(new Date(config.connected_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`
                    : 'Nunca conectado'}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testConnection.mutate()}
                  disabled={testConnection.isPending || !config?.api_key_encrypted}
                >
                  {testConnection.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Testar Conexão
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Credentials */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Credenciais</CardTitle>
                <CardDescription>Credenciais da WhatsApp Cloud API do SaaS</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="phone_number_id" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number ID</FormLabel>
                        <FormControl><Input placeholder="123456789012345" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="access_token" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Access Token</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type={showToken ? 'text' : 'password'} placeholder={hasExistingToken ? '••••••••  (deixe vazio para manter)' : 'Token de acesso'} {...field} />
                            <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowToken(!showToken)}>
                              {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="phone_number" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número do WhatsApp</FormLabel>
                        <FormControl><Input placeholder="+55 11 99999-9999" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="verify_token" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verify Token</FormLabel>
                        <FormControl><Input placeholder={hasExistingVerifyToken ? '••••••••  (deixe vazio para manter)' : 'Token secreto para webhook'} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full" disabled={saveConfig.isPending}>
                      {saveConfig.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Salvar Credenciais
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Webhook */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Webhook</CardTitle>
                <CardDescription>Configure no Meta Business Manager</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Webhook URL</label>
                  <div className="flex gap-2">
                    <Input value={webhookUrl} readOnly className="font-mono text-xs" />
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(webhookUrl, 'url')}>
                      {copiedField === 'url' ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Verify Token</label>
                  <div className="flex gap-2">
                    <Input value={verifyToken} readOnly className="font-mono text-xs" placeholder="Configure um token acima" />
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(verifyToken, 'token')} disabled={!verifyToken}>
                      {copiedField === 'token' ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Separator />
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Configure a URL e o Verify Token no Meta Business Manager: <strong>WhatsApp → Configuração → Webhook</strong>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="send">
          <SendMessageForm
            onSend={(data) => sendMessage.mutate(data)}
            isPending={sendMessage.isPending}
          />
        </TabsContent>

        <TabsContent value="history">
          <MessageHistory messages={messages} isLoading={messagesLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  ArrowLeft, MessageCircle, Copy, Check, Loader2, ExternalLink,
  Wifi, WifiOff, Eye, EyeOff, RefreshCw, Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { useWhatsAppConfig } from '@/hooks/painel/useWhatsAppConfig';
import { useWhatsAppMessages } from '@/hooks/painel/useWhatsAppMessages';
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

export default function WhatsAppConfig() {
  const navigate = useNavigate();
  const { config, isLoading, saveConfig, testConnection, generateWebhookUrl } = useWhatsAppConfig();
  const { messages, isLoading: messagesLoading, sendMessage } = useWhatsAppMessages();
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
      const settings = (config as any).settings as Record<string, any> | undefined;
      form.reset({
        phone_number_id: settings?.phone_number_id || '',
        access_token: '',
        phone_number: config.phone_number || '',
        verify_token: '',
      });
    }
  }, [config, form]);

  const hasExistingToken = !!config?.api_key_encrypted;
  const hasExistingVerifyToken = !!(config as any)?.settings?.verify_token_encrypted || !!(config as any)?.settings?.verify_token;

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

  const webhookUrl = generateWebhookUrl();
  const verifyToken = form.watch('verify_token') || ((config as any)?.settings?.verify_token) || '';

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
        <Button variant="ghost" size="icon" onClick={() => navigate('/painel/configuracoes')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-primary" />
          Configuração WhatsApp
        </h1>
        <p className="text-muted-foreground">
          Configure a integração com WhatsApp Cloud API para atendimento automatizado
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
                  variant="outline" size="sm"
                  onClick={() => testConnection.mutate()}
                  disabled={testConnection.isPending || !config?.api_key_encrypted}
                >
                  {testConnection.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                  Testar Conexão
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Credentials Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Credenciais</CardTitle>
                <CardDescription>Configure as credenciais da WhatsApp Cloud API</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="phone_number_id" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number ID</FormLabel>
                        <FormControl><Input placeholder="Ex: 123456789012345" {...field} /></FormControl>
                        <FormDescription>ID do número no Meta Business</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="access_token" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Access Token</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type={showToken ? 'text' : 'password'} placeholder={hasExistingToken ? '••••••••  (deixe vazio para manter)' : 'Token de acesso permanente'} {...field} />
                            <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowToken(!showToken)}>
                              {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormDescription>Token permanente do System User</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="phone_number" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número do WhatsApp</FormLabel>
                        <FormControl><Input placeholder="+55 11 99999-9999" {...field} /></FormControl>
                        <FormDescription>Número conectado ao WhatsApp Business</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="verify_token" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verify Token</FormLabel>
                        <FormControl><Input placeholder={hasExistingVerifyToken ? '••••••••  (deixe vazio para manter)' : 'Token secreto para webhook'} {...field} /></FormControl>
                        <FormDescription>Token para verificação do webhook</FormDescription>
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

            {/* Webhook Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configuração do Webhook</CardTitle>
                <CardDescription>Configure estes valores no Meta Business Manager</CardDescription>
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
                <Separator className="my-4" />
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Configure a URL do webhook e o Verify Token no Meta Business Manager: <strong>WhatsApp → Configuração → Webhook</strong>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📖 Como Configurar</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Acesse <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">developers.facebook.com <ExternalLink className="h-3 w-3" /></a></li>
                <li>Crie um App do tipo "Business" ou use um existente</li>
                <li>Adicione o produto "WhatsApp" ao seu App</li>
                <li>Em "API Setup", copie o <strong>Phone Number ID</strong></li>
                <li>Crie um <strong>System User</strong> com acesso ao WhatsApp</li>
                <li>Gere um <strong>Access Token permanente</strong></li>
                <li>Em "Configuration" → "Webhook", configure a URL e Token acima</li>
                <li>Inscreva-se nos eventos: <code>messages</code></li>
              </ol>
              <div className="mt-4">
                <Button variant="outline" asChild>
                  <a href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" /> Ver Documentação Oficial
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
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

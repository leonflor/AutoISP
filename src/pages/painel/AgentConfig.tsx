import { useState, useCallback } from 'react';
import { useAgentConfig } from '@/hooks/painel/useAgentConfig';
import { useWhatsAppConfig } from '@/hooks/painel/useWhatsAppConfig';
import { AgentSimulator } from '@/components/AgentSimulator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Bot, Upload, Save, Loader2, Copy, Check, ChevronDown,
  Wifi, WifiOff, MessageSquare, Clock, Info, ExternalLink, Play,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useDropzone } from 'react-dropzone';

const SUPABASE_PROJECT_ID = 'zvxcwwhsjtdliihlvvof';

export default function AgentConfig() {
  const { agent, agentLoading, status, updateAgent, uploadAvatar } = useAgentConfig();
  const { config, saveConfig, testConnection, generateWebhookUrl } = useWhatsAppConfig();

  const [agentName, setAgentName] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verifyToken] = useState(() => crypto.randomUUID());
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Sync state when agent loads
  const [initialized, setInitialized] = useState(false);
  if (agent && !initialized) {
    setAgentName(agent.custom_name || '');
    setInitialized(true);
  }

  const webhookUrl = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/whatsapp-webhook`;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    maxSize: 2 * 1024 * 1024,
  });

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copiado!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveAgent = async () => {
    setSaving(true);
    try {
      let avatarUrl = agent?.custom_avatar_url;
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile);
        setAvatarFile(null);
      }
      await updateAgent.mutateAsync({
        custom_name: agentName || undefined,
        custom_avatar_url: avatarUrl || undefined,
      });
    } catch {
      // error handled in hook
    } finally {
      setSaving(false);
    }
  };

  const handleSaveWhatsApp = () => {
    saveConfig.mutate({
      phone_number_id: phoneNumberId,
      access_token: accessToken,
      phone_number: phoneNumber,
      verify_token: verifyToken,
    });
  };

  if (agentLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const displayAvatarUrl = avatarPreview || agent?.custom_avatar_url || agent?.template?.default_avatar_url;
  const displayName = agentName || agent?.template?.default_name || 'Agente';

  return (
    <div className="space-y-6 p-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuração do Agente IA</h1>
        <p className="text-muted-foreground">Personalize a identidade do agente e conecte o WhatsApp</p>
      </div>

      {/* SEÇÃO 1 — Identidade do Agente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Identidade do Agente
          </CardTitle>
          <CardDescription>Personalize o nome e avatar que seus clientes verão</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar upload */}
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-24 w-24 border-2 border-border">
                {displayAvatarUrl && <AvatarImage src={displayAvatarUrl} alt={displayName} />}
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div
                {...getRootProps()}
                className={`cursor-pointer border-2 border-dashed rounded-lg p-3 text-center text-sm transition-colors ${
                  isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <span className="text-muted-foreground">Alterar avatar</span>
              </div>
            </div>

            {/* Name input */}
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agent-name">Nome do agente</Label>
                <Input
                  id="agent-name"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder={agent?.template?.default_name || 'Nome do agente'}
                />
              </div>

              <Button onClick={handleSaveAgent} disabled={saving} size="sm">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Salvar identidade
              </Button>
            </div>
          </div>

          <Separator />

          {/* Template info (read-only) */}
          {agent?.template && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Info className="h-4 w-4 text-muted-foreground" />
                Template base em uso
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-muted/50 rounded-lg p-4">
                <div>
                  <p className="text-xs text-muted-foreground">Nome</p>
                  <p className="text-sm font-medium">{agent.template.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tipo</p>
                  <p className="text-sm font-medium capitalize">{agent.template.type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tom</p>
                  <p className="text-sm font-medium capitalize">{agent.template.tone}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Temperatura</p>
                  <p className="text-sm font-medium">{agent.template.temperature}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3" />
                Tom de voz e comportamento são definidos pelo template da plataforma
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SEÇÃO 2 — Conexão WhatsApp */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Conexão WhatsApp
          </CardTitle>
          <CardDescription>Configure a integração com a API do WhatsApp Business (Meta)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone-number-id">Phone Number ID</Label>
              <Input
                id="phone-number-id"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                placeholder="Ex: 123456789012345"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone-number">Número do telefone</Label>
              <Input
                id="phone-number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Ex: +5511999999999"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="access-token">Access Token</Label>
            <Input
              id="access-token"
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder={config?.api_key_encrypted ? '••••••••••••••••' : 'Cole seu token aqui'}
            />
          </div>

          <div className="space-y-2">
            <Label>Verify Token (somente leitura)</Label>
            <div className="flex gap-2">
              <Input readOnly value={verifyToken} className="font-mono text-xs" />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(verifyToken, 'verify')}>
                {copiedField === 'verify' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>URL do Webhook</Label>
            <div className="flex gap-2">
              <Input readOnly value={webhookUrl} className="font-mono text-xs" />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(webhookUrl, 'webhook')}>
                {copiedField === 'webhook' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Instruções colapsáveis */}
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                <ChevronDown className="h-4 w-4" />
                Instruções de configuração na Meta
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-sm">
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Acesse o <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="text-primary underline inline-flex items-center gap-1">Meta for Developers <ExternalLink className="h-3 w-3" /></a></li>
                  <li>Crie ou selecione seu aplicativo do tipo "Business"</li>
                  <li>Adicione o produto "WhatsApp" ao app</li>
                  <li>Em <strong>API Setup</strong>, copie o <strong>Phone Number ID</strong> e o <strong>Access Token</strong></li>
                  <li>Em <strong>Configuration → Webhook</strong>, cole a URL do webhook acima</li>
                  <li>Cole o <strong>Verify Token</strong> gerado acima</li>
                  <li>Inscreva-se nos campos: <code className="bg-background px-1 rounded">messages</code></li>
                  <li>Salve as configurações e clique em "Testar conexão" abaixo</li>
                </ol>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="flex gap-3">
            <Button onClick={handleSaveWhatsApp} disabled={saveConfig.isPending || !phoneNumberId}>
              {saveConfig.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Salvar credenciais
            </Button>
            <Button
              variant="outline"
              onClick={() => testConnection.mutate()}
              disabled={testConnection.isPending}
            >
              {testConnection.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wifi className="h-4 w-4 mr-2" />}
              Testar conexão
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SEÇÃO 3 — Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              {status.isConnected ? (
                <Wifi className="h-5 w-5 text-emerald-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-destructive" />
              )}
              <div>
                <p className="text-sm font-medium">Conexão</p>
                <Badge variant={status.isConnected ? 'default' : 'destructive'} className="mt-1">
                  {status.isConnected ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <MessageSquare className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Conversas hoje</p>
                <p className="text-2xl font-bold">{status.conversationsToday}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Última mensagem</p>
                <p className="text-sm text-muted-foreground">
                  {status.lastMessageAt
                    ? formatDistanceToNow(new Date(status.lastMessageAt), { addSuffix: true, locale: ptBR })
                    : 'Nenhuma'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

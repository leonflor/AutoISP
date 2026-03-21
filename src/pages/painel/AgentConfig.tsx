import { useState, useCallback } from 'react';
import { useAgentConfig, type AgentWithTemplate } from '@/hooks/painel/useAgentConfig';
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
  Wifi, WifiOff, MessageSquare, Clock, Info, ExternalLink, Play, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useDropzone } from 'react-dropzone';

const SUPABASE_PROJECT_ID = 'zvxcwwhsjtdliihlvvof';

function AgentCard({ agent, isSelected, onClick }: { agent: AgentWithTemplate; isSelected: boolean; onClick: () => void }) {
  const name = agent.custom_name || agent.template.default_name;
  const avatarUrl = agent.custom_avatar_url || agent.template.default_avatar_url;

  return (
    <button
      onClick={onClick}
      className={`relative text-left w-full rounded-xl border-2 p-4 transition-all hover:shadow-md ${
        isSelected
          ? 'border-primary bg-primary/5 shadow-md'
          : 'border-border bg-card hover:border-primary/30'
      }`}
    >
      <div className="flex flex-col items-center gap-3">
        <Avatar className="h-16 w-16 border-2 border-border">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
          <AvatarFallback className="bg-primary/10 text-primary text-xl">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="text-center space-y-1">
          <p className="font-semibold text-sm truncate max-w-[140px]">{name}</p>
          <p className="text-xs text-muted-foreground capitalize">{agent.template.type}</p>
        </div>
        <Badge variant={agent.is_active ? 'default' : 'secondary'} className="text-xs">
          {agent.is_active ? 'Ativo' : 'Inativo'}
        </Badge>
      </div>
    </button>
  );
}

function AgentEditPanel({
  agent,
  onClose,
  updateAgent,
  uploadAvatar,
}: {
  agent: AgentWithTemplate;
  onClose: () => void;
  updateAgent: ReturnType<typeof useAgentConfig>['updateAgent'];
  uploadAvatar: ReturnType<typeof useAgentConfig>['uploadAvatar'];
}) {
  const [agentName, setAgentName] = useState(agent.custom_name || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected: (rejections) => {
      const err = rejections[0]?.errors[0];
      if (err?.code === 'file-too-large') toast.error('Arquivo muito grande. Máximo 10 MB.');
      else if (err?.code === 'file-invalid-type') toast.error('Formato inválido. Use JPG, PNG ou GIF.');
      else toast.error('Arquivo rejeitado.');
    },
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/gif': ['.gif'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      let avatarUrl = agent.custom_avatar_url;
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile, agent.id);
        setAvatarFile(null);
      }
      await updateAgent.mutateAsync({
        agentId: agent.id,
        updates: {
          custom_name: agentName || undefined,
          custom_avatar_url: avatarUrl || undefined,
        },
      });
    } catch {
      // handled in hook
    } finally {
      setSaving(false);
    }
  };

  const displayAvatarUrl = avatarPreview || agent.custom_avatar_url || agent.template.default_avatar_url;
  const displayName = agentName || agent.template.default_name;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Editando: {displayName}
            </CardTitle>
            <CardDescription>Personalize a identidade deste agente</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setSimulatorOpen(true)}>
              <Play className="h-4 w-4 mr-1" /> Testar
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-6">
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

            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agent-name">Nome do agente</Label>
                <Input
                  id="agent-name"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder={agent.template.default_name}
                />
              </div>
              <Button onClick={handleSave} disabled={saving} size="sm">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Salvar identidade
              </Button>
            </div>
          </div>

          <Separator />

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
        </CardContent>
      </Card>

      <AgentSimulator
        open={simulatorOpen}
        onOpenChange={setSimulatorOpen}
        tenantAgentId={agent.id}
        agentName={agent.custom_name || agent.template.default_name}
      />
    </>
  );
}

export default function AgentConfig() {
  const { agents, agentsLoading, status, updateAgent, uploadAvatar } = useAgentConfig();
  const { config, saveConfig, testConnection } = useWhatsAppConfig();

  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verifyToken] = useState(() => crypto.randomUUID());
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const webhookUrl = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/whatsapp-webhook`;

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) ?? null;

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copiado!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveWhatsApp = () => {
    saveConfig.mutate({
      phone_number_id: phoneNumberId,
      access_token: accessToken,
      phone_number: phoneNumber,
      verify_token: verifyToken,
    });
  };

  if (agentsLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Agentes de IA</h1>
        <p className="text-muted-foreground">
          {agents.length > 0
            ? `${agents.length} agente${agents.length > 1 ? 's' : ''} disponíve${agents.length > 1 ? 'is' : 'l'} — selecione para editar`
            : 'Nenhum agente disponível ainda. Solicite a ativação ao administrador.'}
        </p>
      </div>

      {/* Grid de agentes */}
      {agents.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              isSelected={selectedAgentId === agent.id}
              onClick={() => setSelectedAgentId(selectedAgentId === agent.id ? null : agent.id)}
            />
          ))}
        </div>
      )}

      {/* Painel de edição do agente selecionado */}
      {selectedAgent && (
        <AgentEditPanel
          key={selectedAgent.id}
          agent={selectedAgent}
          onClose={() => setSelectedAgentId(null)}
          updateAgent={updateAgent}
          uploadAvatar={uploadAvatar}
        />
      )}

      {/* Status global */}
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

      {/* Conexão WhatsApp (global) */}
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
    </div>
  );
}

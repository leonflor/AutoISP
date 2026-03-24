import { useState, useCallback } from 'react';
import { useAgentConfig, type AgentWithTemplate } from '@/hooks/painel/useAgentConfig';
import { AgentSimulator } from '@/components/AgentSimulator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Bot, Upload, Save, Loader2, Info, Play, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import { ImageCropDialog } from '@/components/ui/image-crop-dialog';

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
  const { agents, agentsLoading, updateAgent, uploadAvatar } = useAgentConfig();

  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) ?? null;

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

    </div>
  );
}

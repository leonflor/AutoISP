import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, Bot, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AgentTemplateForm } from '@/components/admin/ai-agents/AgentTemplateForm';
import { PromptAuditDialog } from '@/components/admin/ai-agents/PromptAuditDialog';
import {
  useAiAgentTemplate,
  useCreateAiAgent,
  useUpdateAiAgent,
} from '@/hooks/admin/useAiAgentTemplates';
import { useTemplateIspAgents } from '@/hooks/admin/useTemplateIspAgents';
import { useAuditPrompt } from '@/hooks/admin/useAuditPrompt';
import type { AgentFormValues } from '@/components/admin/ai-agents/AgentTemplateForm';
import { useToast } from '@/hooks/use-toast';

export default function AiAgentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNew = !id || id === 'novo';

  const { data: agent, isLoading } = useAiAgentTemplate(isNew ? undefined : id);
  const createMutation = useCreateAiAgent();
  const updateMutation = useUpdateAiAgent();
  const { data: ispAgents } = useTemplateIspAgents(isNew ? undefined : id);
  const auditMutation = useAuditPrompt();
  const [auditOpen, setAuditOpen] = useState(false);

  const handleSubmit = async (data: AgentFormValues) => {
    if (isNew) {
      const created = await createMutation.mutateAsync(data as any);
      toast({
        title: 'Agente criado!',
        description: 'Agora configure Tools e Fluxos.',
      });
      navigate(`/admin/ai-agents/${created.id}`, { replace: true });
    } else if (agent) {
      await updateMutation.mutateAsync({ id: agent.id, ...data } as any);
    }
  };

  const handleCancel = () => {
    navigate('/admin/ai-agents');
  };

  const handleAudit = async (ispAgentId: string) => {
    setAuditOpen(true);
    auditMutation.mutate(ispAgentId);
  };

  if (!isNew && isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!isNew && !agent && !isLoading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Bot className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h2 className="text-lg font-medium">Agente não encontrado</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            O agente solicitado não existe ou foi removido.
          </p>
          <Button variant="outline" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Agentes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isNew ? 'Novo Agente' : agent?.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isNew
                ? 'Configure um novo template de agente de IA.'
                : 'Edite as configurações do template de agente.'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <AgentTemplateForm
        agent={isNew ? null : agent}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onCancel={handleCancel}
      />

      {/* ISPs using this template - with audit button */}
      {!isNew && ispAgents && ispAgents.length > 0 && (
        <div className="rounded-lg border bg-card">
          <div className="p-4 border-b">
            <h3 className="font-medium">ISPs usando este template</h3>
            <p className="text-sm text-muted-foreground">
              Audite o prompt final montado para cada ISP
            </p>
          </div>
          <div className="divide-y">
            {ispAgents.map((ia) => (
              <div key={ia.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="font-medium text-sm">{ia.isp_name}</span>
                    {ia.display_name && (
                      <span className="text-xs text-muted-foreground ml-2">
                        ({ia.display_name})
                      </span>
                    )}
                  </div>
                  <Badge variant={ia.is_enabled ? 'default' : 'secondary'} className="text-[10px]">
                    {ia.is_enabled ? 'Ativo' : 'Inativo'}
                  </Badge>
                  {ia.voice_tone && (
                    <Badge variant="outline" className="text-[10px]">
                      {ia.voice_tone}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAudit(ia.id)}
                  disabled={auditMutation.isPending}
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  Auditar Prompt
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit dialog */}
      <PromptAuditDialog
        open={auditOpen}
        onOpenChange={setAuditOpen}
        data={auditMutation.data || null}
        isLoading={auditMutation.isPending}
      />
    </div>
  );
}

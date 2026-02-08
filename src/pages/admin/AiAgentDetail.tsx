import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AgentTemplateForm } from '@/components/admin/ai-agents/AgentTemplateForm';
import {
  useAiAgentTemplate,
  useCreateAiAgent,
  useUpdateAiAgent,
} from '@/hooks/admin/useAiAgentTemplates';
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
    </div>
  );
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { GitBranch } from 'lucide-react';

interface AgentFlowLinksTabProps {
  agentId: string;
}

export function AgentFlowLinksTab({ agentId }: AgentFlowLinksTabProps) {
  const { toast } = useToast();
  const qc = useQueryClient();

  // Fetch all global flows
  const { data: flows = [], isLoading: flowsLoading } = useQuery({
    queryKey: ['global-flows-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_agent_flows' as any)
        .select('id, name, slug, description, is_active, trigger_keywords')
        .order('sort_order');
      if (error) throw error;
      return data as any[];
    },
  });

  // Fetch current links for this agent
  const { data: links = [], isLoading: linksLoading } = useQuery({
    queryKey: ['agent-flow-links', agentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_agent_flow_links' as any)
        .select('*')
        .eq('agent_id', agentId);
      if (error) throw error;
      return data as any[];
    },
    enabled: !!agentId,
  });

  const toggleLink = useMutation({
    mutationFn: async ({ flowId, linked }: { flowId: string; linked: boolean }) => {
      if (linked) {
        // Remove link
        const { error } = await supabase
          .from('ai_agent_flow_links' as any)
          .delete()
          .eq('agent_id', agentId)
          .eq('flow_id', flowId);
        if (error) throw error;
      } else {
        // Add link
        const { error } = await supabase
          .from('ai_agent_flow_links' as any)
          .insert({ agent_id: agentId, flow_id: flowId } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agent-flow-links', agentId] });
      toast({ title: 'Vínculo atualizado' });
    },
    onError: (e: Error) => {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    },
  });

  const isLoading = flowsLoading || linksLoading;
  const linkedFlowIds = new Set(links.map((l: any) => l.flow_id));

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }

  if (flows.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Nenhum fluxo disponível. Crie fluxos em IA → Fluxos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground mb-4">
        Selecione quais fluxos conversacionais este agente deve utilizar.
      </p>
      {flows.map((flow: any) => {
        const isLinked = linkedFlowIds.has(flow.id);
        return (
          <div
            key={flow.id}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{flow.name}</span>
                {!flow.is_active && (
                  <Badge variant="secondary" className="text-[10px]">inativo</Badge>
                )}
              </div>
              {flow.description && (
                <p className="text-xs text-muted-foreground truncate">{flow.description}</p>
              )}
              {flow.trigger_keywords?.length > 0 && (
                <div className="flex gap-1 mt-1 flex-wrap">
                  {flow.trigger_keywords.slice(0, 5).map((kw: string) => (
                    <Badge key={kw} variant="outline" className="text-[10px]">{kw}</Badge>
                  ))}
                </div>
              )}
            </div>
            <Switch
              checked={isLinked}
              onCheckedChange={() => toggleLink.mutate({ flowId: flow.id, linked: isLinked })}
              disabled={toggleLink.isPending}
            />
          </div>
        );
      })}
    </div>
  );
}

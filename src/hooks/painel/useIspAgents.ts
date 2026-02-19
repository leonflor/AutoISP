import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIspMembership } from "@/hooks/useIspMembership";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type AiAgent = Database["public"]["Tables"]["ai_agents"]["Row"];
type IspAgent = Database["public"]["Tables"]["isp_agents"]["Row"];

export interface IspAgentWithTemplate extends IspAgent {
  ai_agents: AiAgent;
  knowledge_count?: number;
}

export interface KnowledgeItem {
  question: string;
  answer: string;
  category?: string;
}

export interface AgentActivationForm {
  display_name: string;
  avatar_url?: string;
  voice_tone?: string;
  escalation_config?: {
    triggers: string[];
    max_interactions: number;
  };
  knowledge_items?: KnowledgeItem[];
  knowledge_import_mode?: 'append' | 'replace';
}

export interface CatalogTemplate extends AiAgent {
  isAvailable: boolean;
  isActivated: boolean;
}

export function useIspAgents() {
  const { membership } = useIspMembership();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Agentes ativados pelo ISP
  const activeAgentsQuery = useQuery({
    queryKey: ["isp-agents", membership?.ispId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("isp_agents")
        .select(`
          *,
          ai_agents!inner (
            id, name, slug, type, description, avatar_url,
            uses_knowledge_base, system_prompt,
            model, temperature, max_tokens,
            voice_tones, escalation_options, scope,
            is_active
          )
        `)
        .eq("isp_id", membership!.ispId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Adicionar contagem de knowledge base para cada agente
      const withCounts = await Promise.all(
        (data || []).map(async (agent) => {
          const { count } = await supabase
            .from("agent_knowledge_base")
            .select("*", { count: "exact", head: true })
            .eq("isp_agent_id", agent.id);
          return { ...agent, knowledge_count: count || 0 } as IspAgentWithTemplate;
        })
      );

      return withCounts;
    },
    enabled: !!membership?.ispId,
  });

  // Catálogo de templates disponíveis
  const catalogQuery = useQuery({
    queryKey: ["agent-catalog", membership?.ispId],
    queryFn: async () => {
      // Buscar templates scope='tenant' ativos
      const { data: templates, error: templatesError } = await supabase
        .from("ai_agents")
        .select("*")
        .eq("scope", "tenant")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (templatesError) throw templatesError;

      // Buscar limites do plano (via subscription)
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("plan_id")
        .eq("isp_id", membership!.ispId)
        .single();

      let limits: Database["public"]["Tables"]["ai_limits"]["Row"][] = [];
      let maxAgentsActive = 3; // default

      if (subscription?.plan_id) {
        const { data: limitsData } = await supabase
          .from("ai_limits")
          .select("*")
          .eq("plan_id", subscription.plan_id);
        limits = limitsData || [];
        maxAgentsActive = limits[0]?.max_agents_active || 3;
      }

      // Buscar agentes já ativados pelo ISP
      const { data: activeAgents } = await supabase
        .from("isp_agents")
        .select("agent_id")
        .eq("isp_id", membership!.ispId);

      const activatedIds = new Set((activeAgents || []).map((a) => a.agent_id));

      // Marcar disponibilidade
      const catalogTemplates: CatalogTemplate[] = (templates || []).map((t) => ({
        ...t,
        isAvailable: limits.length === 0 || limits.some((l) => l.agent_id === t.id && l.is_enabled),
        isActivated: activatedIds.has(t.id),
      }));

      return {
        templates: catalogTemplates,
        maxAgentsActive,
        currentActiveCount: activatedIds.size,
      };
    },
    enabled: !!membership?.ispId,
  });

  // Mutation para ativar agente
  const activateAgent = useMutation({
    mutationFn: async (data: { agentId: string; form: AgentActivationForm }) => {
      const { data: ispAgent, error } = await supabase
        .from("isp_agents")
        .insert({
          isp_id: membership!.ispId,
          agent_id: data.agentId,
          display_name: data.form.display_name?.trim() || null,
          avatar_url: data.form.avatar_url || null,
          voice_tone: data.form.voice_tone || null,
          escalation_config: data.form.escalation_config || null,
          is_enabled: true,
        })
        .select()
        .single();

      if (error) throw error;

      // Import knowledge base if provided
      if (data.form.knowledge_items?.length && ispAgent) {
        const records = data.form.knowledge_items.map((item, idx) => ({
          isp_agent_id: ispAgent.id,
          question: item.question,
          answer: item.answer,
          category: item.category || null,
          sort_order: idx,
          is_active: true,
        }));

        const { error: kbError } = await supabase
          .from("agent_knowledge_base")
          .insert(records);

        if (kbError) {
          console.error("Error importing knowledge base:", kbError);
        }
      }

      return ispAgent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isp-agents"] });
      queryClient.invalidateQueries({ queryKey: ["agent-catalog"] });
      toast({ title: "Agente ativado com sucesso!" });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erro ao ativar agente",
        description: error.message,
      });
    },
  });

  // Mutation para atualizar agente
  const updateAgent = useMutation({
    mutationFn: async (data: { id: string; form: Partial<AgentActivationForm> & { is_enabled?: boolean } }) => {
      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      
      if (data.form.display_name !== undefined) updateData.display_name = data.form.display_name?.trim() || null;
      if (data.form.avatar_url !== undefined) updateData.avatar_url = data.form.avatar_url || null;
      if (data.form.voice_tone !== undefined) updateData.voice_tone = data.form.voice_tone || null;
      if (data.form.escalation_config !== undefined) updateData.escalation_config = data.form.escalation_config || null;
      if (data.form.is_enabled !== undefined) updateData.is_enabled = data.form.is_enabled;

      const { data: result, error } = await supabase
        .from("isp_agents")
        .update(updateData)
        .eq("id", data.id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isp-agents"] });
      toast({ title: "Agente atualizado com sucesso!" });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar agente",
        description: error.message,
      });
    },
  });

  // Mutation para desativar/remover agente
  const deactivateAgent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("isp_agents")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isp-agents"] });
      queryClient.invalidateQueries({ queryKey: ["agent-catalog"] });
      toast({ title: "Agente removido com sucesso!" });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erro ao remover agente",
        description: error.message,
      });
    },
  });

  // Agent type labels
  const agentTypeLabels: Record<string, string> = {
    atendente: "Atendimento",
    cobrador: "Cobrança",
    vendedor: "Vendas",
    analista: "Análise",
    suporte: "Suporte Técnico",
  };

  return {
    activeAgents: activeAgentsQuery.data,
    catalog: catalogQuery.data,
    isLoading: activeAgentsQuery.isLoading || catalogQuery.isLoading,
    agentTypeLabels,
    activateAgent,
    updateAgent,
    deactivateAgent,
    refetch: () => {
      activeAgentsQuery.refetch();
      catalogQuery.refetch();
    },
  };
}

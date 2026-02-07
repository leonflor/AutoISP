import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIspMembership } from "@/hooks/useIspMembership";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type AiAgent = Database["public"]["Tables"]["ai_agents"]["Row"];

export interface IspAgentConfig {
  agentId: string;
  isEnabled: boolean;
  customPrompt?: string | null;
}

export function useAiAgents() {
  const { membership } = useIspMembership();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all available agents
  const { data: agents, isLoading: agentsLoading } = useQuery({
    queryKey: ["ai-agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_agents")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data as AiAgent[];
    },
  });

  // Fetch ISP's agent limits/configurations
  const { data: agentLimits, isLoading: limitsLoading } = useQuery({
    queryKey: ["ai-limits", membership?.ispId],
    queryFn: async () => {
      if (!membership?.ispId) return [];

      // Get ISP's subscription to find plan
      const { data: subscription, error: subError } = await supabase
        .from("subscriptions")
        .select("plan_id")
        .eq("isp_id", membership.ispId)
        .single();

      if (subError || !subscription) return [];

      const { data, error } = await supabase
        .from("ai_limits")
        .select("*")
        .eq("plan_id", subscription.plan_id);

      if (error) throw error;
      return data;
    },
    enabled: !!membership?.ispId,
  });

  // Get agent type labels
  const agentTypeLabels: Record<string, string> = {
    atendente: "Atendimento",
    cobrador: "Cobrança",
    vendedor: "Vendas",
    analista: "Análise",
    suporte: "Suporte Técnico",
  };

  // Check if agent is available for ISP's plan
  const isAgentAvailable = (agent: AiAgent): boolean => {
    if (!agentLimits || agentLimits.length === 0) return true;
    const limit = agentLimits.find((l) => l.agent_id === agent.id);
    return limit?.is_enabled ?? true;
  };

  // Get agent limit for ISP
  const getAgentLimit = (agentId: string) => {
    if (!agentLimits) return null;
    return agentLimits.find((l) => l.agent_id === agentId);
  };

  return {
    agents,
    agentLimits,
    isLoading: agentsLoading || limitsLoading,
    agentTypeLabels,
    isAgentAvailable,
    getAgentLimit,
  };
}

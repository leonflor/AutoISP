import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AuditPromptMetadata {
  template_id: string;
  template_name: string;
  model: string;
  temperature: number;
  max_tokens: number;
  voice_tone: string | null;
  security_clauses_count: number;
  security_clauses: string[];
  knowledge_base_count: number;
  document_count: number;
  flows: { name: string; slug: string; steps_count: number; is_fixed: boolean }[];
  tools: string[];
  has_erp: boolean;
  erp_provider: string | null;
}

export interface AuditPromptHistoryItem {
  id: string;
  created_at: string;
  prompt: string;
  tokens_total: number;
  tokens_input: number;
  tokens_output: number;
}

export interface AuditPromptResult {
  prompt: string;
  isp_name: string;
  agent_name: string;
  template_name: string;
  history: AuditPromptHistoryItem[];
  metadata: AuditPromptMetadata;
}

export function useAuditPrompt() {
  return useMutation({
    mutationFn: async (ispAgentId: string): Promise<AuditPromptResult> => {
      const { data, error } = await supabase.functions.invoke('audit-prompt', {
        body: { isp_agent_id: ispAgentId },
      });

      if (error) throw new Error(error.message || 'Erro ao auditar prompt');
      if (data?.error) throw new Error(data.message || data.error);
      return data as AuditPromptResult;
    },
  });
}

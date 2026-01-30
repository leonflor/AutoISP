import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProcessingLog {
  id: string;
  document_id: string | null;
  isp_id: string;
  isp_agent_id: string | null;
  error_code: string;
  error_message: string;
  error_details: {
    original_error?: string;
    stack?: string[];
    step_context?: Record<string, unknown>;
  } | null;
  processing_step: string;
  created_at: string;
  // Joined data
  isps?: { name: string } | null;
  knowledge_documents?: { name: string; original_filename: string } | null;
}

interface UseProcessingLogsParams {
  ispId?: string;
  errorCode?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useProcessingLogs(params: UseProcessingLogsParams = {}) {
  return useQuery({
    queryKey: ["processing-logs", params],
    queryFn: async () => {
      let query = supabase
        .from("document_processing_logs")
        .select(`
          *,
          isps:isp_id(name),
          knowledge_documents:document_id(name, original_filename)
        `)
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (params.ispId) {
        query = query.eq("isp_id", params.ispId);
      }
      
      if (params.errorCode) {
        query = query.eq("error_code", params.errorCode);
      }
      
      if (params.dateFrom) {
        query = query.gte("created_at", params.dateFrom);
      }
      
      if (params.dateTo) {
        query = query.lte("created_at", params.dateTo);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data as unknown as ProcessingLog[];
    },
  });
}

export function useProcessingLogStats() {
  return useQuery({
    queryKey: ["processing-log-stats"],
    queryFn: async () => {
      // Get counts by error code
      const { data, error } = await supabase
        .from("document_processing_logs")
        .select("error_code, processing_step");
      
      if (error) throw error;
      
      const byCode: Record<string, number> = {};
      const byStep: Record<string, number> = {};
      
      (data || []).forEach((log) => {
        byCode[log.error_code] = (byCode[log.error_code] || 0) + 1;
        byStep[log.processing_step] = (byStep[log.processing_step] || 0) + 1;
      });
      
      return {
        total: data?.length || 0,
        byCode,
        byStep,
      };
    },
  });
}

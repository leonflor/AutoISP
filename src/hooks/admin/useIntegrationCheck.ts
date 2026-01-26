import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type IntegrationType = "openai" | "resend" | "asaas";

export interface CheckResult {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}

export function useIntegrationCheck() {
  const [isChecking, setIsChecking] = useState(false);
  const [checkingIntegration, setCheckingIntegration] = useState<IntegrationType | null>(null);

  const checkIntegration = useCallback(async (integration: IntegrationType): Promise<CheckResult> => {
    setIsChecking(true);
    setCheckingIntegration(integration);
    
    try {
      const { data, error } = await supabase.functions.invoke("check-integration", {
        body: { integration }
      });

      if (error) {
        return { 
          success: false, 
          message: error.message || "Erro ao verificar integração" 
        };
      }

      return data as CheckResult;
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : "Erro desconhecido" 
      };
    } finally {
      setIsChecking(false);
      setCheckingIntegration(null);
    }
  }, []);

  return { checkIntegration, isChecking, checkingIntegration };
}

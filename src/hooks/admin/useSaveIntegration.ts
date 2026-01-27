import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export type IntegrationType = "openai" | "resend" | "asaas";

export interface SaveCredentials {
  api_key: string;
  environment?: "sandbox" | "production";
  default_model?: string;
  from_email?: string;
  webhook_token?: string;
}

export interface SaveResult {
  success: boolean;
  message: string;
  masked_key?: string;
}

export function useSaveIntegration() {
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const saveIntegration = useCallback(async (
    integration: IntegrationType,
    credentials: SaveCredentials
  ): Promise<SaveResult> => {
    setIsSaving(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("save-integration", {
        body: { integration, credentials }
      });

      if (error) {
        console.error("[useSaveIntegration] Erro:", error);
        return { success: false, message: error.message };
      }

      // Invalidate platform config cache to refresh UI
      if (data?.success) {
        queryClient.invalidateQueries({ queryKey: ["platform-config"] });
      }

      return data as SaveResult;
    } catch (error) {
      console.error("[useSaveIntegration] Exceção:", error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : "Erro ao salvar" 
      };
    } finally {
      setIsSaving(false);
    }
  }, [queryClient]);

  return { saveIntegration, isSaving };
}

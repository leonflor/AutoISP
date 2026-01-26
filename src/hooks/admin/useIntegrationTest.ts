import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type IntegrationType = "openai" | "resend" | "asaas";

export interface IntegrationCredentials {
  api_key: string;
  environment?: "sandbox" | "production";
  default_model?: string;
  from_email?: string;
  webhook_token?: string;
}

export interface TestResult {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}

export function useIntegrationTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const testIntegration = useCallback(async (
    integration: IntegrationType,
    credentials: IntegrationCredentials
  ): Promise<TestResult> => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke("test-integration", {
        body: { integration, credentials }
      });

      if (error) {
        const errorResult: TestResult = { 
          success: false, 
          message: error.message || "Erro ao testar integração" 
        };
        setResult(errorResult);
        return errorResult;
      }

      const testResult = data as TestResult;
      setResult(testResult);
      return testResult;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      const errorResult: TestResult = { success: false, message };
      setResult(errorResult);
      return errorResult;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetResult = useCallback(() => {
    setResult(null);
  }, []);

  return { 
    testIntegration, 
    isLoading, 
    result, 
    resetResult 
  };
}

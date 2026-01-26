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
  details?: {
    http_status?: number;
    error_code?: string;
    raw_response?: string;
    suggestion?: string;
    error_type?: string;
    account_name?: string;
    account_type?: string;
    environment?: string;
    detected_key_type?: string;
    selected_environment?: string;
    available_models?: number;
    models?: string[];
    domains_count?: number;
    domains?: string[];
    supported_integrations?: string[];
    missing?: string;
    [key: string]: unknown;
  };
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
        console.error("[useIntegrationTest] Erro Supabase:", error);
        
        // Tentar extrair mais detalhes do erro
        let errorMessage = error.message || "Erro ao testar integração";
        let errorDetails: TestResult["details"] = {
          error_type: "supabase_function_error"
        };
        
        // Se o erro contiver contexto adicional
        if (error.context) {
          errorDetails.raw_response = JSON.stringify(error.context).substring(0, 200);
        }
        
        const errorResult: TestResult = { 
          success: false, 
          message: errorMessage,
          details: errorDetails
        };
        setResult(errorResult);
        return errorResult;
      }

      const testResult = data as TestResult;
      setResult(testResult);
      return testResult;
    } catch (error) {
      console.error("[useIntegrationTest] Erro inesperado:", error);
      
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      const errorResult: TestResult = { 
        success: false, 
        message,
        details: {
          error_type: "unexpected_error",
          suggestion: "Verifique sua conexão de internet e tente novamente"
        }
      };
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

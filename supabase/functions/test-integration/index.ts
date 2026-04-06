import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestRequest {
  integration: "openai" | "resend" | "asaas";
  credentials: {
    api_key: string;
    environment?: "sandbox" | "production";
    default_model?: string;
    from_email?: string;
    webhook_token?: string;
  };
}

interface TestResult {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}

function getHttpErrorMessage(status: number): string {
  switch (status) {
    case 401: return "Chave API não autorizada";
    case 403: return "Acesso negado - verifique permissões";
    case 404: return "Endpoint não encontrado - verifique ambiente";
    case 429: return "Limite de requisições excedido";
    case 500: return "Erro interno do servidor";
    case 502: return "Bad Gateway - serviço indisponível";
    case 503: return "Serviço temporariamente indisponível";
    default: return `Erro HTTP ${status}`;
  }
}

async function testOpenAI(apiKey: string): Promise<TestResult> {
  console.log("[OpenAI] Testando integração...");
  
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: { 
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });
    
    console.log(`[OpenAI] Resposta HTTP: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const status = response.status;
      const errorBody = await response.text();
      
      console.log(`[OpenAI] Erro: ${errorBody}`);
      
      let errorData: { error?: { message?: string; code?: string; type?: string } } = {};
      try {
        errorData = JSON.parse(errorBody);
      } catch {}
      
      const errorCode = errorData.error?.code || errorData.error?.type || "UNKNOWN";
      const errorMessage = errorData.error?.message || getHttpErrorMessage(status);
      
      return { 
        success: false, 
        message: `${errorMessage}`,
        details: {
          http_status: status,
          error_code: errorCode
        }
      };
    }
    
    const data = await response.json();
    const gptModels = data.data?.filter((m: { id: string }) => 
      m.id.includes("gpt-4") || m.id.includes("gpt-3.5")
    ) || [];
    
    console.log(`[OpenAI] Sucesso - ${gptModels.length} modelos GPT disponíveis`);
    
    return { 
      success: true, 
      message: "Conexão estabelecida com OpenAI",
      details: { 
        available_models: gptModels.length,
        models: gptModels.slice(0, 5).map((m: { id: string }) => m.id)
      }
    };
  } catch (error) {
    console.error("[OpenAI] Erro de conexão:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Erro ao conectar com OpenAI",
      details: {
        error_type: "connection_error"
      }
    };
  }
}

async function testResend(apiKey: string): Promise<TestResult> {
  console.log("[Resend] Testando integração...");
  
  try {
    const response = await fetch("https://api.resend.com/domains", {
      headers: { 
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });
    
    console.log(`[Resend] Resposta HTTP: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const status = response.status;
      const errorBody = await response.text();
      
      console.log(`[Resend] Erro: ${errorBody}`);
      
      let errorData: { message?: string; name?: string; statusCode?: number } = {};
      try {
        errorData = JSON.parse(errorBody);
      } catch {}
      
      const errorCode = errorData.name || "UNKNOWN";
      const errorMessage = errorData.message || getHttpErrorMessage(status);
      
      return { 
        success: false, 
        message: errorMessage,
        details: {
          http_status: status,
          error_code: errorCode,
          raw_response: errorBody.substring(0, 200)
        }
      };
    }
    
    const domains = await response.json();
    
    console.log(`[Resend] Sucesso - ${domains.data?.length || 0} domínios configurados`);
    
    return { 
      success: true, 
      message: "Conexão estabelecida com Resend",
      details: { 
        domains_count: domains.data?.length || 0,
        domains: domains.data?.map((d: { name: string }) => d.name) || []
      }
    };
  } catch (error) {
    console.error("[Resend] Erro de conexão:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Erro ao conectar com Resend",
      details: {
        error_type: "connection_error"
      }
    };
  }
}

async function testAsaas(apiKey: string, environment: string = "production"): Promise<TestResult> {
  console.log(`[Asaas] Testando integração - Ambiente: ${environment}`);
  console.log(`[Asaas] Prefixo da chave: ${apiKey.substring(0, 15)}...`);
  
  // Validar prefixo da chave vs ambiente selecionado
  const isProductionKey = apiKey.includes("_prod_");
  const isSandboxKey = apiKey.includes("_hmlg_") || apiKey.includes("_sandbox_");
  
  if (environment === "production" && isSandboxKey) {
    console.log("[Asaas] AVISO: Chave de Sandbox detectada para ambiente Production");
    return {
      success: false,
      message: "Chave de Sandbox detectada, mas ambiente Produção selecionado",
      details: {
        suggestion: "Selecione 'Sandbox (testes)' ou use uma chave de produção ($aact_prod_...)",
        detected_key_type: "sandbox",
        selected_environment: environment
      }
    };
  }
  
  if (environment === "sandbox" && isProductionKey) {
    console.log("[Asaas] AVISO: Chave de Produção detectada para ambiente Sandbox");
    return {
      success: false,
      message: "Chave de Produção detectada, mas ambiente Sandbox selecionado",
      details: {
        suggestion: "Selecione 'Produção' ou use uma chave sandbox ($aact_hmlg_...)",
        detected_key_type: "production",
        selected_environment: environment
      }
    };
  }
  
  try {
    const baseUrl = environment === "production" 
      ? "https://api.asaas.com/v3"
      : "https://sandbox.asaas.com/api/v3";
    
    console.log(`[Asaas] URL base: ${baseUrl}`);
      
    const response = await fetch(`${baseUrl}/myAccount`, {
      headers: { 
        "access_token": apiKey,
        "Content-Type": "application/json"
      }
    });
    
    console.log(`[Asaas] Resposta HTTP: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const status = response.status;
      const errorBody = await response.text();
      
      console.log(`[Asaas] Erro HTTP ${status}: ${errorBody}`);
      
      let errorData: { errors?: Array<{ code: string; description: string }> } = {};
      try {
        errorData = JSON.parse(errorBody);
      } catch {
        console.log("[Asaas] Não foi possível parsear resposta de erro como JSON");
      }
      
      const firstError = errorData.errors?.[0];
      const errorCode = firstError?.code || "UNKNOWN";
      const errorDesc = firstError?.description || getHttpErrorMessage(status);
      
      // Sugestões baseadas no código de erro
      let suggestion = "";
      if (errorCode === "invalid_accessToken" || status === 401) {
        suggestion = "Verifique se a chave API está correta e não expirou";
      } else if (status === 403) {
        suggestion = "A chave pode não ter permissões suficientes";
      } else if (status === 404) {
        suggestion = "Verifique se o ambiente selecionado está correto";
      }
      
      return { 
        success: false, 
        message: errorCode !== "UNKNOWN" ? `${errorDesc} (${errorCode})` : errorDesc,
        details: {
          http_status: status,
          error_code: errorCode,
          raw_response: errorBody.substring(0, 200),
          suggestion: suggestion || undefined,
          environment: environment
        }
      };
    }
    
    const account = await response.json();
    
    console.log(`[Asaas] Conta encontrada: ${account.name} (${account.personType})`);
    
    return { 
      success: true, 
      message: "Conexão estabelecida com Asaas",
      details: { 
        account_name: account.name,
        account_type: account.personType,
        environment: environment
      }
    };
  } catch (error) {
    console.error("[Asaas] Erro de conexão:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Erro ao conectar com Asaas",
      details: {
        error_type: "connection_error",
        suggestion: "Verifique sua conexão de internet e tente novamente"
      }
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate JWT authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, message: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error("[test-integration] JWT inválido:", claimsError);
      return new Response(
        JSON.stringify({ success: false, message: "Token inválido ou expirado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[test-integration] Usuário autenticado: ${claimsData.claims.sub}`);

    const { integration, credentials }: TestRequest = await req.json();

    console.log(`[test-integration] Requisição recebida: ${integration}`);

    if (!integration || !credentials?.api_key) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Parâmetros inválidos: integration e api_key são obrigatórios",
          details: {
            missing: !integration ? "integration" : "api_key"
          }
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result: TestResult;

    switch (integration) {
      case "openai":
        result = await testOpenAI(credentials.api_key);
        break;
      case "resend":
        result = await testResend(credentials.api_key);
        break;
      case "asaas":
        result = await testAsaas(credentials.api_key, credentials.environment);
        break;
      default:
        result = { 
          success: false, 
          message: `Integração "${integration}" não suportada`,
          details: {
            supported_integrations: ["openai", "resend", "asaas"]
          }
        };
    }

    console.log(`[test-integration] Resultado: ${result.success ? "SUCESSO" : "FALHA"} - ${result.message}`);

    return new Response(
      JSON.stringify(result),
      { 
        status: result.success ? 200 : 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("[test-integration] Erro interno:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : "Erro interno do servidor",
        details: {
          error_type: "internal_error"
        }
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

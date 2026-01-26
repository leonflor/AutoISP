import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckRequest {
  integration: "openai" | "resend" | "asaas";
}

interface CheckResult {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}

async function testOpenAI(apiKey: string): Promise<CheckResult> {
  console.log("[OpenAI] Testando conectividade...");
  
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
    });

    console.log(`[OpenAI] Status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      const modelCount = data.data?.length || 0;
      console.log(`[OpenAI] Sucesso - ${modelCount} modelos disponíveis`);
      return {
        success: true,
        message: `Conexão estabelecida com OpenAI (${modelCount} modelos disponíveis)`,
        details: { models_count: modelCount }
      };
    }

    const errorText = await response.text();
    console.log(`[OpenAI] Erro: ${errorText}`);
    
    if (response.status === 401) {
      return {
        success: false,
        message: "Chave API inválida ou expirada",
        details: { http_status: 401, suggestion: "Verifique se a chave está correta no Supabase Secrets" }
      };
    }

    return {
      success: false,
      message: `Erro HTTP ${response.status}`,
      details: { http_status: response.status, error: errorText }
    };
  } catch (error) {
    console.error("[OpenAI] Exceção:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro de conexão",
      details: { error_type: "network" }
    };
  }
}

async function testResend(apiKey: string): Promise<CheckResult> {
  console.log("[Resend] Testando conectividade...");
  
  try {
    const response = await fetch("https://api.resend.com/domains", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    console.log(`[Resend] Status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      const domainCount = data.data?.length || 0;
      console.log(`[Resend] Sucesso - ${domainCount} domínios configurados`);
      return {
        success: true,
        message: `Conexão estabelecida com Resend (${domainCount} domínios)`,
        details: { domains_count: domainCount }
      };
    }

    const errorText = await response.text();
    console.log(`[Resend] Erro: ${errorText}`);

    if (response.status === 401) {
      return {
        success: false,
        message: "Chave API inválida",
        details: { http_status: 401, suggestion: "Verifique a RESEND_API_KEY no Supabase Secrets" }
      };
    }

    return {
      success: false,
      message: `Erro HTTP ${response.status}`,
      details: { http_status: response.status, error: errorText }
    };
  } catch (error) {
    console.error("[Resend] Exceção:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro de conexão",
      details: { error_type: "network" }
    };
  }
}

async function testAsaas(apiKey: string, environment: string): Promise<CheckResult> {
  console.log(`[Asaas] Testando conectividade (ambiente: ${environment})...`);
  
  const baseUrl = environment === "sandbox" 
    ? "https://sandbox.asaas.com/api/v3"
    : "https://api.asaas.com/v3";

  // Validar prefixo da chave vs ambiente
  const isProductionKey = apiKey.includes("_prod_");
  const isSandboxKey = apiKey.includes("_hmlg_") || apiKey.includes("_sandbox_");

  if (environment === "production" && isSandboxKey) {
    console.log("[Asaas] Mismatch: chave sandbox com ambiente produção");
    return {
      success: false,
      message: "Chave de Sandbox detectada, mas ASAAS_ENVIRONMENT está como 'production'",
      details: { 
        suggestion: "Altere ASAAS_ENVIRONMENT para 'sandbox' no Supabase Secrets",
        environment,
        key_type: "sandbox"
      }
    };
  }

  if (environment === "sandbox" && isProductionKey) {
    console.log("[Asaas] Mismatch: chave produção com ambiente sandbox");
    return {
      success: false,
      message: "Chave de Produção detectada, mas ASAAS_ENVIRONMENT está como 'sandbox'",
      details: { 
        suggestion: "Altere ASAAS_ENVIRONMENT para 'production' no Supabase Secrets",
        environment,
        key_type: "production"
      }
    };
  }

  try {
    const response = await fetch(`${baseUrl}/finance/balance`, {
      method: "GET",
      headers: {
        "access_token": apiKey,
        "Content-Type": "application/json",
      },
    });

    console.log(`[Asaas] Status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`[Asaas] Sucesso - Saldo disponível: R$ ${data.balance || 0}`);
      return {
        success: true,
        message: `Conexão estabelecida com Asaas (${environment})`,
        details: { 
          environment,
          balance: data.balance 
        }
      };
    }

    const errorText = await response.text();
    console.log(`[Asaas] Erro: ${errorText}`);

    if (response.status === 401) {
      return {
        success: false,
        message: "Chave API não autorizada",
        details: { 
          http_status: 401, 
          environment,
          suggestion: "Verifique se a ASAAS_API_KEY está correta no Supabase Secrets"
        }
      };
    }

    return {
      success: false,
      message: `Erro HTTP ${response.status}`,
      details: { http_status: response.status, error: errorText, environment }
    };
  } catch (error) {
    console.error("[Asaas] Exceção:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro de conexão",
      details: { error_type: "network", environment }
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("[check-integration] Requisição recebida");

  // Validar autenticação
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    console.log("[check-integration] Token ausente");
    return new Response(
      JSON.stringify({ success: false, message: "Token de autenticação ausente" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  // Validar JWT
  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);

  if (claimsError || !claimsData?.claims) {
    console.log("[check-integration] Token inválido:", claimsError?.message);
    return new Response(
      JSON.stringify({ success: false, message: "Token inválido ou expirado" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  console.log(`[check-integration] Usuário autenticado: ${claimsData.claims.sub}`);

  try {
    const { integration }: CheckRequest = await req.json();
    console.log(`[check-integration] Testando integração: ${integration}`);

    let result: CheckResult;

    switch (integration) {
      case "openai": {
        const openaiKey = Deno.env.get("OPENAI_API_KEY");
        if (!openaiKey) {
          result = { 
            success: false, 
            message: "OPENAI_API_KEY não configurada no Supabase Secrets",
            details: { suggestion: "Adicione a secret OPENAI_API_KEY nas configurações do Supabase" }
          };
        } else {
          result = await testOpenAI(openaiKey);
        }
        break;
      }

      case "resend": {
        const resendKey = Deno.env.get("RESEND_API_KEY");
        if (!resendKey) {
          result = { 
            success: false, 
            message: "RESEND_API_KEY não configurada no Supabase Secrets",
            details: { suggestion: "Adicione a secret RESEND_API_KEY nas configurações do Supabase" }
          };
        } else {
          result = await testResend(resendKey);
        }
        break;
      }

      case "asaas": {
        const asaasKey = Deno.env.get("ASAAS_API_KEY");
        const asaasEnv = Deno.env.get("ASAAS_ENVIRONMENT") || "production";
        if (!asaasKey) {
          result = { 
            success: false, 
            message: "ASAAS_API_KEY não configurada no Supabase Secrets",
            details: { suggestion: "Adicione a secret ASAAS_API_KEY nas configurações do Supabase" }
          };
        } else {
          result = await testAsaas(asaasKey, asaasEnv);
        }
        break;
      }

      default:
        result = { 
          success: false, 
          message: `Integração desconhecida: ${integration}` 
        };
    }

    console.log(`[check-integration] Resultado:`, result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("[check-integration] Erro:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : "Erro interno" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

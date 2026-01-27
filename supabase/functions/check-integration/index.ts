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

// ============= Decryption Function =============

async function deriveKey(masterKey: string): Promise<CryptoKey> {
  const keyMaterial = new TextEncoder().encode(masterKey);
  const keyData = keyMaterial.slice(0, 32);
  return await crypto.subtle.importKey(
    "raw",
    keyData,
    "AES-GCM",
    false,
    ["encrypt", "decrypt"]
  );
}

async function decrypt(ciphertext: string, iv: string, masterKey: string): Promise<string> {
  const key = await deriveKey(masterKey);
  const ivBytes = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
  const ciphertextBytes = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
  
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes },
    key,
    ciphertextBytes
  );
  
  return new TextDecoder().decode(decrypted);
}

// ============= Integration Test Functions =============

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
        details: { http_status: 401 }
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
        details: { http_status: 401 }
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
          environment
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

// ============= Main Handler =============

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("[check-integration] Requisição recebida");

  // Validate authentication
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
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  // Validate JWT
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

    // Get encryption key
    const masterKey = Deno.env.get("ENCRYPTION_KEY");
    if (!masterKey || masterKey.length < 32) {
      console.error("[check-integration] ENCRYPTION_KEY não configurada");
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Erro de configuração: ENCRYPTION_KEY não definida" 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Read config from database using service role to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const configKey = `integration_${integration}`;

    const { data: config, error: configError } = await supabaseAdmin
      .from("platform_config")
      .select("value")
      .eq("key", configKey)
      .single();

    if (configError) {
      console.error(`[check-integration] Erro ao ler config: ${configError.message}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Erro ao ler configuração: ${configError.message}` 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const configValue = config?.value as Record<string, unknown> | null;

    // Check if encrypted key exists
    if (!configValue?.api_key_encrypted || !configValue?.encryption_iv) {
      console.log(`[check-integration] ${integration} não configurado no banco`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Integração ${integration.toUpperCase()} não configurada. Configure via painel de administração.`,
          details: { suggestion: "Acesse Configurações > Integrações para configurar" }
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Decrypt API key
    let apiKey: string;
    try {
      apiKey = await decrypt(
        configValue.api_key_encrypted as string,
        configValue.encryption_iv as string,
        masterKey
      );
      console.log(`[check-integration] Chave descriptografada com sucesso`);
    } catch (decryptError) {
      console.error(`[check-integration] Erro ao descriptografar:`, decryptError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Erro ao descriptografar chave. A chave pode estar corrompida." 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Test integration
    let result: CheckResult;

    switch (integration) {
      case "openai":
        result = await testOpenAI(apiKey);
        break;

      case "resend":
        result = await testResend(apiKey);
        break;

      case "asaas": {
        const environment = (configValue.environment as string) || "production";
        result = await testAsaas(apiKey, environment);
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

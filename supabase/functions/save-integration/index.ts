import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SaveRequest {
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

// ============= Encryption Functions =============

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

async function encrypt(text: string, masterKey: string): Promise<{ ciphertext: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(masterKey);
  const encoded = new TextEncoder().encode(text);
  
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );
  
  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv))
  };
}

function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 12) return "****";
  return apiKey.substring(0, 8) + "..." + apiKey.slice(-4);
}

// ============= Integration Test Functions =============

async function testOpenAI(apiKey: string): Promise<TestResult> {
  console.log("[OpenAI] Validando credenciais...");
  
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: { 
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      const errorBody = await response.text();
      let errorData: { error?: { message?: string } } = {};
      try { errorData = JSON.parse(errorBody); } catch {}
      
      return { 
        success: false, 
        message: errorData.error?.message || `Erro HTTP ${response.status}`,
      };
    }
    
    const data = await response.json();
    const gptModels = data.data?.filter((m: { id: string }) => 
      m.id.includes("gpt-4") || m.id.includes("gpt-3.5")
    ) || [];
    
    return { 
      success: true, 
      message: "Conexão estabelecida com OpenAI",
      details: { available_models: gptModels.length }
    };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Erro ao conectar com OpenAI"
    };
  }
}

async function testResend(apiKey: string): Promise<TestResult> {
  console.log("[Resend] Validando credenciais...");
  
  try {
    const response = await fetch("https://api.resend.com/domains", {
      headers: { 
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      const errorBody = await response.text();
      let errorData: { message?: string } = {};
      try { errorData = JSON.parse(errorBody); } catch {}
      
      return { 
        success: false, 
        message: errorData.message || `Erro HTTP ${response.status}`,
      };
    }
    
    const domains = await response.json();
    
    return { 
      success: true, 
      message: "Conexão estabelecida com Resend",
      details: { domains_count: domains.data?.length || 0 }
    };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Erro ao conectar com Resend"
    };
  }
}

async function testAsaas(apiKey: string, environment: string = "production"): Promise<TestResult> {
  console.log(`[Asaas] Validando credenciais - Ambiente: ${environment}`);
  
  // Validate key prefix vs environment
  const isProductionKey = apiKey.includes("_prod_");
  const isSandboxKey = apiKey.includes("_hmlg_") || apiKey.includes("_sandbox_");
  
  if (environment === "production" && isSandboxKey) {
    return {
      success: false,
      message: "Chave de Sandbox detectada, mas ambiente Produção selecionado",
    };
  }
  
  if (environment === "sandbox" && isProductionKey) {
    return {
      success: false,
      message: "Chave de Produção detectada, mas ambiente Sandbox selecionado",
    };
  }
  
  try {
    const baseUrl = environment === "production" 
      ? "https://api.asaas.com/v3"
      : "https://sandbox.asaas.com/api/v3";
      
    const response = await fetch(`${baseUrl}/myAccount`, {
      headers: { 
        "access_token": apiKey,
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      const errorBody = await response.text();
      let errorData: { errors?: Array<{ description: string }> } = {};
      try { errorData = JSON.parse(errorBody); } catch {}
      
      return { 
        success: false, 
        message: errorData.errors?.[0]?.description || `Erro HTTP ${response.status}`,
      };
    }
    
    const account = await response.json();
    
    return { 
      success: true, 
      message: "Conexão estabelecida com Asaas",
      details: { 
        account_name: account.name,
        environment 
      }
    };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Erro ao conectar com Asaas"
    };
  }
}

// ============= Main Handler =============

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("[save-integration] Requisição recebida");

  try {
    // Validate authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
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
      console.log("[save-integration] Token inválido:", claimsError?.message);
      return new Response(
        JSON.stringify({ success: false, message: "Token inválido ou expirado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub as string;
    console.log(`[save-integration] Usuário: ${userId}`);

    // Check super_admin role
    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (rolesError || !roles?.some(r => r.role === "super_admin")) {
      console.log("[save-integration] Acesso negado - não é super_admin");
      return new Response(
        JSON.stringify({ success: false, message: "Acesso negado - requer permissão de super_admin" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { integration, credentials }: SaveRequest = await req.json();
    console.log(`[save-integration] Integração: ${integration}`);

    if (!integration || !credentials?.api_key) {
      return new Response(
        JSON.stringify({ success: false, message: "Parâmetros inválidos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Test credentials first
    let testResult: TestResult;
    switch (integration) {
      case "openai":
        testResult = await testOpenAI(credentials.api_key);
        break;
      case "resend":
        testResult = await testResend(credentials.api_key);
        break;
      case "asaas":
        testResult = await testAsaas(credentials.api_key, credentials.environment);
        break;
      default:
        return new Response(
          JSON.stringify({ success: false, message: `Integração "${integration}" não suportada` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    if (!testResult.success) {
      console.log(`[save-integration] Teste falhou: ${testResult.message}`);
      return new Response(
        JSON.stringify(testResult),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Get encryption key
    const masterKey = Deno.env.get("ENCRYPTION_KEY");
    if (!masterKey || masterKey.length < 32) {
      console.error("[save-integration] ENCRYPTION_KEY não configurada ou muito curta");
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Erro de configuração do servidor: ENCRYPTION_KEY não definida" 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Encrypt API key
    const { ciphertext, iv } = await encrypt(credentials.api_key, masterKey);
    const maskedKey = maskApiKey(credentials.api_key);

    console.log(`[save-integration] Chave criptografada. Masked: ${maskedKey}`);

    // 4. Build config value
    const configValue: Record<string, unknown> = {
      configured: true,
      api_key_encrypted: ciphertext,
      encryption_iv: iv,
      masked_key: maskedKey,
      tested_at: new Date().toISOString(),
    };

    // Add integration-specific fields
    if (credentials.environment) {
      configValue.environment = credentials.environment;
    }
    if (credentials.default_model) {
      configValue.default_model = credentials.default_model;
    }
    if (credentials.from_email) {
      configValue.from_email = credentials.from_email;
    }
    if (credentials.webhook_token) {
      const webhookEncrypted = await encrypt(credentials.webhook_token, masterKey);
      configValue.webhook_token_encrypted = webhookEncrypted.ciphertext;
      configValue.webhook_token_iv = webhookEncrypted.iv;
    }

    // 5. Save to database using service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const configKey = `integration_${integration}`;

    const { error: updateError } = await supabaseAdmin
      .from("platform_config")
      .update({ 
        value: configValue, 
        updated_at: new Date().toISOString() 
      })
      .eq("key", configKey);

    if (updateError) {
      console.error(`[save-integration] Erro ao salvar: ${updateError.message}`);
      return new Response(
        JSON.stringify({ success: false, message: `Erro ao salvar: ${updateError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[save-integration] ${integration} salvo com sucesso`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Integração ${integration.toUpperCase()} configurada com sucesso`,
        masked_key: maskedKey
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[save-integration] Erro:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : "Erro interno" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

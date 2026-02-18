import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { testConnection } from "../_shared/erp-driver.ts";
import type { ErpProvider, ErpCredentials, TestResult } from "../_shared/erp-types.ts";
import { PROVIDER_DISPLAY_NAMES } from "../_shared/erp-types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SaveRequest {
  provider: ErpProvider;
  api_url: string;
  credentials: {
    token?: string;
    username?: string;
    password?: string;
    api_key?: string;
  };
  options?: {
    self_signed_cert?: boolean;
    sync_interval?: number;
  };
}

// Encryption helper
async function encrypt(
  text: string,
  keyBase64: string
): Promise<{ ciphertext: string; iv: string }> {
  const encoder = new TextEncoder();
  const keyBytes = Uint8Array.from(atob(keyBase64), (c) => c.charCodeAt(0));
  if (keyBytes.length !== 32) {
    throw new Error(`ENCRYPTION_KEY inválida: esperado 32 bytes, recebido ${keyBytes.length}. Gere com: openssl rand -base64 32`);
  }
  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(text));
  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

function maskApiKey(key: string): string {
  if (key.length <= 8) return "****";
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const encryptionKey = Deno.env.get("ENCRYPTION_KEY");

    if (!encryptionKey) {
      return new Response(JSON.stringify({ error: "Chave de criptografia não configurada" }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate encryption key
    try {
      const keyBytes = Uint8Array.from(atob(encryptionKey), (c) => c.charCodeAt(0));
      if (keyBytes.length !== 32) {
        return new Response(JSON.stringify({ error: "Chave de criptografia com tamanho inválido. Gere com: openssl rand -base64 32" }), {
          status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } catch {
      return new Response(JSON.stringify({ error: "Chave de criptografia mal formatada. Gere com: openssl rand -base64 32" }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUser = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Usuário não autenticado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: membership } = await supabaseAdmin
      .from("isp_users")
      .select("isp_id, role")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (!membership) {
      return new Response(JSON.stringify({ error: "Usuário não pertence a nenhum provedor" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!["admin", "owner"].includes(membership.role)) {
      return new Response(JSON.stringify({ error: "Sem permissão para configurar integrações" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ispId = membership.isp_id;
    const body: SaveRequest = await req.json();

    if (!body.provider || !body.api_url) {
      return new Response(JSON.stringify({ error: "Provider e URL são obrigatórios" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build credentials for test
    const creds: ErpCredentials = {
      apiUrl: body.api_url,
      username: body.credentials.username,
      password: body.credentials.password,
      apiKey: body.credentials.api_key,
      token: body.credentials.token,
      app: body.credentials.username,
    };

    // Test connection using driver
    const testResult: TestResult = await testConnection(body.provider, creds);

    if (!testResult.success) {
      return new Response(JSON.stringify({ error: testResult.message, code: "CONNECTION_FAILED" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Encrypt credentials
    let apiKeyEncrypted: string | null = null;
    let passwordEncrypted: string | null = null;
    let encryptionIv: string | null = null;
    let maskedKey: string | null = null;

    const keyToEncrypt = body.provider === "sgp" ? body.credentials.token
      : body.provider === "ixc" ? null
      : body.credentials.api_key;

    if (keyToEncrypt) {
      const encrypted = await encrypt(keyToEncrypt, encryptionKey);
      apiKeyEncrypted = encrypted.ciphertext;
      encryptionIv = encrypted.iv;
      maskedKey = maskApiKey(keyToEncrypt);
    }

    if (body.credentials.password) {
      const encrypted = await encrypt(body.credentials.password, encryptionKey);
      passwordEncrypted = encrypted.ciphertext;
      if (!encryptionIv) encryptionIv = encrypted.iv;
    }

    if (body.provider === "ixc" && body.credentials.username) {
      maskedKey = maskApiKey(body.credentials.username);
    }

    // Upsert config
    const { error: upsertError } = await supabaseAdmin
      .from("erp_configs")
      .upsert({
        isp_id: ispId,
        provider: body.provider,
        api_url: body.api_url,
        api_key_encrypted: apiKeyEncrypted,
        username: body.credentials.username || null,
        password_encrypted: passwordEncrypted,
        encryption_iv: encryptionIv,
        masked_key: maskedKey,
        is_active: true,
        is_connected: true,
        connected_at: new Date().toISOString(),
        sync_config: body.options || {},
        updated_at: new Date().toISOString(),
      }, { onConflict: "isp_id,provider" });

    if (upsertError) {
      console.error("Upsert error:", upsertError);
      return new Response(JSON.stringify({ error: "Erro ao salvar configuração" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Audit log
    await supabaseAdmin.from("audit_logs").insert({
      isp_id: ispId,
      user_id: user.id,
      action: "erp_config_saved",
      entity_type: "erp_configs",
      new_data: { provider: body.provider, api_url: body.api_url },
    });

    const providerName = PROVIDER_DISPLAY_NAMES[body.provider] || body.provider;

    return new Response(JSON.stringify({
      success: true,
      message: `Integração ${providerName} configurada com sucesso`,
    }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro interno" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SaveRequest {
  provider: "ixc" | "mk_solutions" | "sgp" | "hubsoft";
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

interface TestResult {
  success: boolean;
  message: string;
}

// Encryption helpers
async function encrypt(
  text: string,
  keyBase64: string
): Promise<{ ciphertext: string; iv: string }> {
  const encoder = new TextEncoder();
  const keyBytes = Uint8Array.from(atob(keyBase64), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(text)
  );

  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

function maskApiKey(key: string): string {
  if (key.length <= 8) return "****";
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

// Test IXC connection
async function testIxcConnection(
  apiUrl: string,
  token: string
): Promise<TestResult> {
  try {
    console.log(`[IXC] Testing connection to: ${apiUrl}`);

    const authHeader = token.startsWith("Basic ") ? token : `Basic ${token}`;

    const response = await fetch(`${apiUrl}/webservice/v1/cliente`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
        ixcsoft: "listar",
      },
      body: JSON.stringify({
        qtype: "id",
        query: "1",
        oper: ">",
        page: "1",
        rp: "1",
      }),
    });

    console.log(`[IXC] Response status: ${response.status}`);

    if (response.status === 401) {
      return {
        success: false,
        message: "Token inválido ou expirado. Gere um novo no IXC.",
      };
    }

    if (response.status === 404) {
      return {
        success: false,
        message: "Endpoint não encontrado. Verifique a URL do servidor.",
      };
    }

    if (!response.ok) {
      return {
        success: false,
        message: `Erro HTTP ${response.status}`,
      };
    }

    return { success: true, message: "Conexão IXC estabelecida com sucesso" };
  } catch (error) {
    console.error("[IXC] Error:", error);

    if (error instanceof Error && error.message?.includes("certificate")) {
      return {
        success: false,
        message:
          'Erro de certificado SSL. Marque "Certificado Self-Signed" se aplicável.',
      };
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro de conexão",
    };
  }
}

// Test MK-Solutions connection
async function testMkConnection(
  apiUrl: string,
  username: string,
  apiKey: string
): Promise<TestResult> {
  try {
    console.log(`[MK] Testing connection to: ${apiUrl}`);

    const response = await fetch(`${apiUrl}/mk/WSMKIntegracaoGeral.rule`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        usuario: username,
        token: apiKey,
        funcao: "listarClientes",
        limit: "1",
      }),
    });

    console.log(`[MK] Response status: ${response.status}`);

    if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        message: "Usuário ou API Key inválidos.",
      };
    }

    if (!response.ok) {
      return {
        success: false,
        message: `Erro HTTP ${response.status}`,
      };
    }

    const text = await response.text();
    
    // MK can return error in response body
    if (text.toLowerCase().includes("erro") || text.toLowerCase().includes("invalido")) {
      return {
        success: false,
        message: "Credenciais inválidas ou acesso negado.",
      };
    }

    return { success: true, message: "Conexão MK-Solutions estabelecida com sucesso" };
  } catch (error) {
    console.error("[MK] Error:", error);

    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro de conexão",
    };
  }
}

// Test SGP connection
async function testSgpConnection(
  apiUrl: string,
  token: string
): Promise<TestResult> {
  try {
    console.log(`[SGP] Testing connection to: ${apiUrl}`);

    const response = await fetch(`${apiUrl}/api/clientes`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    console.log(`[SGP] Response status: ${response.status}`);

    if (response.status === 401) {
      return {
        success: false,
        message: "Token inválido ou expirado. Gere um novo no SGP.",
      };
    }

    if (response.status === 403) {
      return {
        success: false,
        message: "Acesso negado. Verifique as permissões do token.",
      };
    }

    if (response.status === 404) {
      return {
        success: false,
        message: "Endpoint não encontrado. Verifique a URL do servidor.",
      };
    }

    if (!response.ok) {
      return {
        success: false,
        message: `Erro HTTP ${response.status}`,
      };
    }

    return { success: true, message: "Conexão SGP estabelecida com sucesso" };
  } catch (error) {
    console.error("[SGP] Error:", error);

    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro de conexão",
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const encryptionKey = Deno.env.get("ENCRYPTION_KEY");

    if (!encryptionKey) {
      console.error("ENCRYPTION_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Chave de criptografia não configurada" }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create client with user token to validate
    const supabaseUser = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabaseUser.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Usuário não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get user membership
    const { data: membership, error: memberError } = await supabaseAdmin
      .from("isp_users")
      .select("isp_id, role")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (memberError || !membership) {
      return new Response(
        JSON.stringify({ error: "Usuário não pertence a nenhum provedor" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!["admin", "owner"].includes(membership.role)) {
      return new Response(
        JSON.stringify({
          error: "Sem permissão para configurar integrações",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const ispId = membership.isp_id;
    const body: SaveRequest = await req.json();

    // Validate required fields
    if (!body.provider || !body.api_url) {
      return new Response(
        JSON.stringify({ error: "Provider e URL são obrigatórios" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Test connection before saving
    let testResult: TestResult;
    let keyToEncrypt: string | null = null;

    switch (body.provider) {
      case "ixc":
        if (!body.credentials.token) {
          return new Response(
            JSON.stringify({ error: "Token é obrigatório para IXC" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        testResult = await testIxcConnection(
          body.api_url,
          body.credentials.token
        );
        keyToEncrypt = body.credentials.token;
        break;

      case "mk_solutions":
        if (!body.credentials.username || !body.credentials.api_key) {
          return new Response(
            JSON.stringify({
              error: "Usuário e API Key são obrigatórios para MK-Solutions",
            }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        testResult = await testMkConnection(
          body.api_url,
          body.credentials.username,
          body.credentials.api_key
        );
        keyToEncrypt = body.credentials.api_key;
        break;

      case "sgp":
        if (!body.credentials.token) {
          return new Response(
            JSON.stringify({ error: "Token é obrigatório para SGP" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        testResult = await testSgpConnection(body.api_url, body.credentials.token);
        keyToEncrypt = body.credentials.token;
        break;

      default:
        return new Response(
          JSON.stringify({ error: "Provider não suportado" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }

    if (!testResult.success) {
      return new Response(
        JSON.stringify({
          error: testResult.message,
          code: "CONNECTION_FAILED",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Encrypt credentials
    let apiKeyEncrypted: string | null = null;
    let passwordEncrypted: string | null = null;
    let encryptionIv: string | null = null;
    let maskedKey: string | null = null;

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

    // Upsert config
    const { error: upsertError } = await supabaseAdmin
      .from("erp_configs")
      .upsert(
        {
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
        },
        {
          onConflict: "isp_id,provider",
        }
      );

    if (upsertError) {
      console.error("Upsert error:", upsertError);
      return new Response(
        JSON.stringify({ error: "Erro ao salvar configuração" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Register audit log
    await supabaseAdmin.from("audit_logs").insert({
      isp_id: ispId,
      user_id: user.id,
      action: "erp_config_saved",
      entity_type: "erp_configs",
      new_data: { provider: body.provider, api_url: body.api_url },
    });

    const providerName = {
      ixc: "IXC Soft",
      mk_solutions: "MK-Solutions",
      sgp: "SGP",
      hubsoft: "Hubsoft",
    }[body.provider];

    return new Response(
      JSON.stringify({
        success: true,
        message: `Integração ${providerName} configurada com sucesso`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Erro interno",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

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
  if (keyBytes.length !== 32) {
    throw new Error(`ENCRYPTION_KEY inválida: esperado 32 bytes, recebido ${keyBytes.length}. Gere com: openssl rand -base64 32`);
  }
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
  username: string,
  password: string
): Promise<TestResult> {
  try {
    // Normalizar URL - remover /webservice/v1 se já presente
    let baseUrl = apiUrl.replace(/\/+$/, '');
    if (baseUrl.endsWith('/webservice/v1')) {
      baseUrl = baseUrl.slice(0, -'/webservice/v1'.length);
    }

    console.log(`[IXC] Testing connection to: ${baseUrl}`);

    const token = btoa(`${username}:${password}`);
    const authHeader = `Basic ${token}`;

    const response = await fetch(`${baseUrl}/webservice/v1/cliente`, {
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
        message: "Login ou senha inválidos. Verifique as credenciais no IXC.",
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
  token: string,
  app: string
): Promise<TestResult> {
  try {
    // Normalize URL - remove trailing slash and /api if present
    let baseUrl = apiUrl.replace(/\/+$/, '');
    if (baseUrl.endsWith('/api')) {
      baseUrl = baseUrl.slice(0, -4);
    }
    
    const testUrl = `${baseUrl}/api/ura/clientes`;
    console.log(`[SGP] Testing connection to: ${testUrl}`);

    const body = new URLSearchParams();
    body.append('token', token);
    body.append('app', app);
    body.append('cpfcnpj', '00000000000');

    const response = await fetch(testUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    console.log(`[SGP] Response status: ${response.status}`);

    if (response.status === 401) {
      return {
        success: false,
        message: "Token ou App inválido. Verifique as credenciais no SGP.",
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

    // Validate encryption key length
    try {
      const keyBytes = Uint8Array.from(atob(encryptionKey), (c) => c.charCodeAt(0));
      if (keyBytes.length !== 32) {
        console.error(`ENCRYPTION_KEY has ${keyBytes.length} bytes, expected 32`);
        return new Response(
          JSON.stringify({ error: "Chave de criptografia com tamanho inválido. Gere com: openssl rand -base64 32" }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch {
      console.error("ENCRYPTION_KEY is not valid base64");
      return new Response(
        JSON.stringify({ error: "Chave de criptografia mal formatada. Gere com: openssl rand -base64 32" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
        if (!body.credentials.username || !body.credentials.password) {
          return new Response(
            JSON.stringify({ error: "Login e senha são obrigatórios para IXC" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        testResult = await testIxcConnection(
          body.api_url,
          body.credentials.username,
          body.credentials.password
        );
        keyToEncrypt = null; // IXC no longer uses api_key_encrypted
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
        if (!body.credentials.username) {
          return new Response(
            JSON.stringify({ error: "Nome do App é obrigatório para SGP" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        testResult = await testSgpConnection(body.api_url, body.credentials.token, body.credentials.username);
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

    // For IXC, use username for masked_key display
    if (body.provider === 'ixc' && body.credentials.username) {
      maskedKey = maskApiKey(body.credentials.username);
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

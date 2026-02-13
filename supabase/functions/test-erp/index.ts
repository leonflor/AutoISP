import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TestRequest {
  provider: "ixc" | "mk_solutions" | "sgp" | "hubsoft";
  // Optional: test with provided credentials before saving
  api_url?: string;
  credentials?: {
    token?: string;
    username?: string;
    password?: string;
    api_key?: string;
  };
}

interface TestResult {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}

// Decryption helper
async function decrypt(
  ciphertext: string,
  iv: string,
  keyBase64: string
): Promise<string> {
  const keyBytes = Uint8Array.from(atob(keyBase64), (c) => c.charCodeAt(0));
  if (keyBytes.length !== 32) {
    throw new Error(`ENCRYPTION_KEY inválida: esperado 32 bytes, recebido ${keyBytes.length}. Gere com: openssl rand -base64 32`);
  }
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  const ivBytes = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));
  const encrypted = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes },
    key,
    encrypted
  );

  return new TextDecoder().decode(decrypted);
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

    const data = await response.json();
    const totalClientes = data.total || data.registros?.length || 0;

    return {
      success: true,
      message: "Conexão IXC estabelecida com sucesso",
      details: { clientes_count: totalClientes },
    };
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

    if (
      text.toLowerCase().includes("erro") ||
      text.toLowerCase().includes("invalido")
    ) {
      return {
        success: false,
        message: "Credenciais inválidas ou acesso negado.",
      };
    }

    return {
      success: true,
      message: "Conexão MK-Solutions estabelecida com sucesso",
    };
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

    // Create client with user token
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

    const ispId = membership.isp_id;
    const body: TestRequest = await req.json();

    if (!body.provider) {
      return new Response(
        JSON.stringify({ error: "Provider é obrigatório" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let apiUrl: string;
    let credentials: { token?: string; username?: string; password?: string; api_key?: string };

    // If credentials are provided, use them (testing before save)
    if (body.api_url && body.credentials) {
      apiUrl = body.api_url;
      credentials = body.credentials;
    } else {
      // Fetch from database and decrypt
      const { data: config, error: configError } = await supabaseAdmin
        .from("erp_configs")
        .select("*")
        .eq("isp_id", ispId)
        .eq("provider", body.provider)
        .single();

      if (configError || !config) {
        return new Response(
          JSON.stringify({
            error: `Configuração ${body.provider.toUpperCase()} não encontrada`,
          }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (!encryptionKey) {
        return new Response(
          JSON.stringify({ error: "Chave de criptografia não configurada" }),
          {
            status: 503,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      apiUrl = config.api_url;
      credentials = { username: config.username };

      // Decrypt stored credentials
      if (config.api_key_encrypted && config.encryption_iv) {
        const decrypted = await decrypt(
          config.api_key_encrypted,
          config.encryption_iv,
          encryptionKey
        );

        if (body.provider === "sgp") {
          credentials.token = decrypted;
        } else if (body.provider !== "ixc") {
          credentials.api_key = decrypted;
        }
      }

      // Decrypt password for IXC
      if (body.provider === "ixc" && config.password_encrypted && config.encryption_iv) {
        credentials.password = await decrypt(
          config.password_encrypted,
          config.encryption_iv,
          encryptionKey
        );
      }
    }

    // Test connection based on provider
    let result: TestResult;

    switch (body.provider) {
      case "ixc":
        if (!credentials.username || !credentials.password) {
          return new Response(
            JSON.stringify({ error: "Credenciais não configuradas" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        result = await testIxcConnection(apiUrl, credentials.username, credentials.password);
        break;

      case "mk_solutions":
        if (!credentials.username || !credentials.api_key) {
          return new Response(
            JSON.stringify({ error: "Credenciais não configuradas" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        result = await testMkConnection(
          apiUrl,
          credentials.username,
          credentials.api_key
        );
        break;

      case "sgp":
        if (!credentials.token) {
          return new Response(
            JSON.stringify({ error: "Token não configurado" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        if (!credentials.username) {
          return new Response(
            JSON.stringify({ error: "Nome do App não configurado" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        result = await testSgpConnection(apiUrl, credentials.token, credentials.username);
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

    // Update connection status if testing stored config
    if (!body.api_url) {
      await supabaseAdmin
        .from("erp_configs")
        .update({
          is_connected: result.success,
          connected_at: result.success ? new Date().toISOString() : undefined,
          updated_at: new Date().toISOString(),
        })
        .eq("isp_id", ispId)
        .eq("provider", body.provider);
    }

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
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

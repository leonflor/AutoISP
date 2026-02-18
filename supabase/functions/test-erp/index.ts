import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { resolveCredentials, testConnection } from "../_shared/erp-driver.ts";
import type { ErpProvider, ErpCredentials, TestResult } from "../_shared/erp-types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TestRequest {
  provider: ErpProvider;
  api_url?: string;
  credentials?: {
    token?: string;
    username?: string;
    password?: string;
    api_key?: string;
  };
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

    const ispId = membership.isp_id;
    const body: TestRequest = await req.json();

    if (!body.provider) {
      return new Response(JSON.stringify({ error: "Provider é obrigatório" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let creds: ErpCredentials;

    if (body.api_url && body.credentials) {
      // Testing with provided credentials before saving
      creds = {
        apiUrl: body.api_url,
        username: body.credentials.username,
        password: body.credentials.password,
        apiKey: body.credentials.api_key,
        token: body.credentials.token,
        app: body.credentials.username,
      };
    } else {
      // Fetch from database and decrypt
      if (!encryptionKey) {
        return new Response(JSON.stringify({ error: "Chave de criptografia não configurada" }), {
          status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: config } = await supabaseAdmin
        .from("erp_configs")
        .select("*")
        .eq("isp_id", ispId)
        .eq("provider", body.provider)
        .single();

      if (!config) {
        return new Response(JSON.stringify({ error: `Configuração ${body.provider.toUpperCase()} não encontrada` }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      creds = await resolveCredentials(config, encryptionKey);
    }

    const result: TestResult = await testConnection(body.provider, creds);

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
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

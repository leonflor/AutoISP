import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decrypt, fetchIxcClients, fetchSgpClients, fetchMkClients, type ErpClient } from "../_shared/erp-fetcher.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FetchResult {
  clients: ErpClient[];
  errors: { provider: string; message: string }[];
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

    const supabaseUser = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Usuário não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: membership } = await supabaseAdmin
      .from("isp_users")
      .select("isp_id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (!membership) {
      return new Response(JSON.stringify({ error: "Sem provedor associado" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch all active ERP configs for this ISP
    const { data: configs } = await supabaseAdmin
      .from("erp_configs")
      .select("*")
      .eq("isp_id", membership.isp_id)
      .eq("is_active", true)
      .eq("is_connected", true);

    if (!configs || configs.length === 0) {
      return new Response(
        JSON.stringify({ clients: [], errors: [], message: "Nenhuma integração ERP configurada" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!encryptionKey) {
      return new Response(
        JSON.stringify({ error: "Chave de criptografia não configurada" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result: FetchResult = { clients: [], errors: [] };

    // Process each ERP in parallel
    const promises = configs.map(async (config) => {
      try {
        let decryptedKey = "";
        if (config.api_key_encrypted && config.encryption_iv) {
          decryptedKey = await decrypt(config.api_key_encrypted, config.encryption_iv, encryptionKey);
        }

        // Decrypt password for IXC
        let decryptedPassword = "";
        if (config.provider === "ixc" && config.password_encrypted && config.encryption_iv) {
          decryptedPassword = await decrypt(config.password_encrypted, config.encryption_iv, encryptionKey);
        }

        let clients: ErpClient[] = [];

        switch (config.provider) {
          case "ixc":
            clients = await fetchIxcClients(config.api_url, config.username || "", decryptedPassword);
            break;
          case "sgp":
            clients = await fetchSgpClients(config.api_url, decryptedKey, config.username || "");
            break;
          case "mk_solutions":
            clients = await fetchMkClients(config.api_url, config.username || "", decryptedKey);
            break;
        }

        return { clients, error: null, provider: config.provider };
      } catch (err) {
        console.error(`[${config.provider}] Fetch error:`, err);
        return {
          clients: [] as ErpClient[],
          error: { provider: config.display_name || config.provider, message: err instanceof Error ? err.message : "Erro desconhecido" },
          provider: config.provider,
        };
      }
    });

    const results = await Promise.all(promises);

    for (const r of results) {
      result.clients.push(...r.clients);
      if (r.error) result.errors.push(r.error);
    }

    return new Response(JSON.stringify(result), {
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

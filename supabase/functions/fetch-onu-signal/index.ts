import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decrypt } from "../_shared/erp-fetcher.ts";
import { analyzeOnuSignal, formatSignalReport, type OnuSignalResult } from "../_shared/onu-signal-analyzer.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

    const { client_id } = await req.json();
    if (!client_id) {
      return new Response(JSON.stringify({ error: "client_id é obrigatório" }), {
        status: 400,
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

    if (!encryptionKey) {
      return new Response(
        JSON.stringify({ error: "Chave de criptografia não configurada" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Only IXC supports per-client signal diagnostics via /botao_rel_22991
    const { data: config } = await supabaseAdmin
      .from("erp_configs")
      .select("*")
      .eq("isp_id", membership.isp_id)
      .eq("provider", "ixc")
      .eq("is_active", true)
      .eq("is_connected", true)
      .single();

    if (!config) {
      return new Response(
        JSON.stringify({ error: "Nenhuma integração IXC ativa encontrada" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Decrypt IXC password
    let decryptedPassword = "";
    if (config.password_encrypted && config.encryption_iv) {
      decryptedPassword = await decrypt(config.password_encrypted, config.encryption_iv, encryptionKey);
    }

    let baseUrl = (config.api_url || "").replace(/\/+$/, "");
    if (baseUrl.endsWith("/webservice/v1")) {
      baseUrl = baseUrl.slice(0, -"/webservice/v1".length);
    }

    const token = btoa(`${config.username || ""}:${decryptedPassword}`);

    // Call /botao_rel_22991 for detailed TX/RX signal
    const signalResp = await fetch(`${baseUrl}/webservice/v1/botao_rel_22991`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${token}`,
        ixcsoft: "listar",
      },
      body: JSON.stringify({
        qtype: "botao_rel_22991.id_cliente",
        query: String(client_id),
        oper: "=",
        page: "1",
        rp: "1",
      }),
    });

    if (!signalResp.ok) {
      return new Response(
        JSON.stringify({ error: `IXC HTTP ${signalResp.status}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const signalData = await signalResp.json();
    const record = signalData.registros?.[0] || signalData.data || null;

    if (!record) {
      const result = analyzeOnuSignal({ tx: null, rx: null });
      return new Response(JSON.stringify({ signal: result, report: formatSignalReport(result) }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rxValue = record.rx ? parseFloat(record.rx) : null;
    const txValue = record.tx ? parseFloat(record.tx) : null;

    const result: OnuSignalResult = analyzeOnuSignal({
      tx: txValue !== null && !isNaN(txValue) ? txValue : null,
      rx: rxValue !== null && !isNaN(rxValue) ? rxValue : null,
    });

    return new Response(
      JSON.stringify({ signal: result, report: formatSignalReport(result) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

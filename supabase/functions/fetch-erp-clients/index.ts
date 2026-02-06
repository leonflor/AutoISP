import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ErpClient {
  erp_id: string;
  provider: "ixc" | "mk_solutions" | "sgp";
  provider_name: string;
  nome: string;
  cpf_cnpj: string;
  data_vencimento: string | null;
  plano: string | null;
  login: string | null;
  status_contrato: string;
  conectado: boolean;
}

interface FetchResult {
  clients: ErpClient[];
  errors: { provider: string; message: string }[];
}

// Decryption helper (same as test-erp)
async function decrypt(
  ciphertext: string,
  iv: string,
  keyBase64: string
): Promise<string> {
  const keyBytes = Uint8Array.from(atob(keyBase64), (c) => c.charCodeAt(0));
  if (keyBytes.length !== 32) {
    throw new Error(`ENCRYPTION_KEY inválida: esperado 32 bytes, recebido ${keyBytes.length}`);
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

// ── IXC ──
async function fetchIxcClients(apiUrl: string, token: string): Promise<ErpClient[]> {
  const authHeader = token.startsWith("Basic ") ? token : `Basic ${token}`;

  // Fetch clients
  const clientesResp = await fetch(`${apiUrl}/webservice/v1/cliente`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
      ixcsoft: "listar",
    },
    body: JSON.stringify({
      qtype: "cliente.ativo",
      query: "S",
      oper: "=",
      page: "1",
      rp: "500",
    }),
  });

  if (!clientesResp.ok) throw new Error(`IXC HTTP ${clientesResp.status}`);
  const clientesData = await clientesResp.json();
  const registros = clientesData.registros || [];

  // Fetch contracts for connection status
  let contratos: Record<string, any> = {};
  try {
    const contratosResp = await fetch(`${apiUrl}/webservice/v1/cliente_contrato`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
        ixcsoft: "listar",
      },
      body: JSON.stringify({
        qtype: "cliente_contrato.id",
        query: "1",
        oper: ">",
        page: "1",
        rp: "1000",
      }),
    });
    if (contratosResp.ok) {
      const cd = await contratosResp.json();
      for (const c of cd.registros || []) {
        contratos[String(c.id_cliente)] = c;
      }
    }
  } catch { /* non-blocking */ }

  return registros.map((r: any) => {
    const contrato = contratos[String(r.id)];
    const statusMap: Record<string, string> = {
      S: "ativo",
      N: "cancelado",
    };
    return {
      erp_id: String(r.id),
      provider: "ixc" as const,
      provider_name: "IXC Soft",
      nome: r.razao || r.fantasia || "",
      cpf_cnpj: r.cnpj_cpf || "",
      data_vencimento: r.dia_vencimento ? `Dia ${r.dia_vencimento}` : null,
      plano: contrato?.contrato || contrato?.id_vd_contrato || null,
      login: contrato?.login || r.login || null,
      status_contrato: contrato?.status
        ? contrato.status === "A" ? "ativo"
          : contrato.status === "S" ? "suspenso"
          : contrato.status === "C" ? "cancelado"
          : contrato.status
        : statusMap[r.ativo] || "desconhecido",
      conectado: contrato?.status === "A" || r.ativo === "S",
    };
  });
}

// ── SGP ──
async function fetchSgpClients(apiUrl: string, token: string, app: string): Promise<ErpClient[]> {
  let baseUrl = apiUrl.replace(/\/+$/, "");
  if (baseUrl.endsWith("/api")) baseUrl = baseUrl.slice(0, -4);

  // SGP doesn't have a "list all" endpoint easily, try fetching via URA
  // We'll use the clientes endpoint with a broad search
  const body = new URLSearchParams();
  body.append("token", token);
  body.append("app", app);

  const resp = await fetch(`${baseUrl}/api/ura/clientes`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!resp.ok) throw new Error(`SGP HTTP ${resp.status}`);

  const data = await resp.json();
  const clientes = Array.isArray(data) ? data : data.clientes || data.data || [];

  return clientes.map((r: any) => ({
    erp_id: String(r.id || r.codigo || r.cd_cliente || ""),
    provider: "sgp" as const,
    provider_name: "SGP",
    nome: r.nome || r.razao_social || r.nm_cliente || "",
    cpf_cnpj: r.cpf_cnpj || r.cpf || r.cnpj || "",
    data_vencimento: r.dia_vencimento ? `Dia ${r.dia_vencimento}` : r.vencimento || null,
    plano: r.plano || r.nm_plano || r.ds_plano || null,
    login: r.login || r.usuario || null,
    status_contrato: r.status || r.situacao || "ativo",
    conectado: r.online === true || r.online === "S" || r.conectado === true,
  }));
}

// ── MK-Solutions ──
async function fetchMkClients(apiUrl: string, username: string, apiKey: string): Promise<ErpClient[]> {
  const resp = await fetch(`${apiUrl}/mk/WSMKIntegracaoGeral.rule`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      usuario: username,
      token: apiKey,
      funcao: "listarClientes",
      limit: "500",
    }),
  });

  if (!resp.ok) throw new Error(`MK HTTP ${resp.status}`);

  const text = await resp.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Resposta MK não é JSON válido");
  }

  const clientes = Array.isArray(data) ? data : data.clientes || data.lista || [];

  return clientes.map((r: any) => ({
    erp_id: String(r.CodigoCliente || r.id || ""),
    provider: "mk_solutions" as const,
    provider_name: "MK-Solutions",
    nome: r.NomeRazaoSocial || r.nome || "",
    cpf_cnpj: r.CpfCnpj || r.cpf_cnpj || "",
    data_vencimento: r.DiaVencimento ? `Dia ${r.DiaVencimento}` : null,
    plano: r.NomePlano || r.plano || null,
    login: r.LoginConexao || r.login || null,
    status_contrato: (r.Situacao || r.status || "ativo").toLowerCase(),
    conectado: r.Conectado === "S" || r.online === true,
  }));
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

        let clients: ErpClient[] = [];

        switch (config.provider) {
          case "ixc":
            clients = await fetchIxcClients(config.api_url, decryptedKey);
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
          clients: [],
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

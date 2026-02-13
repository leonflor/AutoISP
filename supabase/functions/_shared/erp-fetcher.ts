import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface ErpClient {
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

// Decryption helper
export async function decrypt(
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
export async function fetchIxcClients(apiUrl: string, username: string, password: string): Promise<ErpClient[]> {
  // Normalizar URL - remover /webservice/v1 se já presente
  let baseUrl = apiUrl.replace(/\/+$/, '');
  if (baseUrl.endsWith('/webservice/v1')) {
    baseUrl = baseUrl.slice(0, -'/webservice/v1'.length);
  }

  const token = btoa(`${username}:${password}`);
  const authHeader = `Basic ${token}`;

  const clientesResp = await fetch(`${baseUrl}/webservice/v1/cliente`, {
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

  let contratos: Record<string, any> = {};
  try {
    const contratosResp = await fetch(`${baseUrl}/webservice/v1/cliente_contrato`, {
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
    const statusMap: Record<string, string> = { S: "ativo", N: "cancelado" };
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
export async function fetchSgpClients(apiUrl: string, token: string, app: string): Promise<ErpClient[]> {
  let baseUrl = apiUrl.replace(/\/+$/, "");
  if (baseUrl.endsWith("/api")) baseUrl = baseUrl.slice(0, -4);

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
export async function fetchMkClients(apiUrl: string, username: string, apiKey: string): Promise<ErpClient[]> {
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

/**
 * Search ERP clients by name or CPF/CNPJ for tool call usage.
 * Returns matching clients from all active ERP configs of the ISP.
 */
export async function searchErpClient(
  supabaseAdmin: SupabaseClient,
  ispId: string,
  encryptionKey: string,
  query: string
): Promise<{ clients: ErpClient[]; errors: string[] }> {
  const { data: configs } = await supabaseAdmin
    .from("erp_configs")
    .select("*")
    .eq("isp_id", ispId)
    .eq("is_active", true)
    .eq("is_connected", true);

  if (!configs || configs.length === 0) {
    return { clients: [], errors: ["Nenhuma integração ERP ativa"] };
  }

  const allClients: ErpClient[] = [];
  const errors: string[] = [];
  const searchLower = query.toLowerCase().trim();
  const searchClean = searchLower.replace(/[.\-\/]/g, "");

  for (const config of configs) {
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

      // Filter by query (name or CPF/CNPJ)
      const filtered = clients.filter((c) => {
        const nameLower = c.nome.toLowerCase();
        const docClean = c.cpf_cnpj.replace(/[.\-\/]/g, "").toLowerCase();
        return nameLower.includes(searchLower) || docClean.includes(searchClean);
      });

      allClients.push(...filtered);
    } catch (err) {
      errors.push(`${config.display_name || config.provider}: ${err instanceof Error ? err.message : "Erro"}`);
    }
  }

  return { clients: allClients, errors };
}

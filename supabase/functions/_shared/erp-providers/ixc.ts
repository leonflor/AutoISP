// ═══ CAMADA 3 — Provider IXC Soft ═══
// HTTP puro: uma função por endpoint do ERP.
// Retorna dados CRUS (any[]). Filtros HTTP aplicados aqui.
// Nenhum mapeamento de campos — responsabilidade do Driver (Camada 2).

import type {
  ErpProviderDriver,
  ErpCredentials,
  TestResult,
} from "../erp-types.ts";

// ── Helpers ──

function normalizeUrl(apiUrl: string): string {
  let base = apiUrl.replace(/\/+$/, "");
  if (base.endsWith("/webservice/v1")) {
    base = base.slice(0, -"/webservice/v1".length);
  }
  return base;
}

function buildAuth(username: string, password: string) {
  const token = btoa(`${username}:${password}`);
  return {
    "Content-Type": "application/json",
    Authorization: `Basic ${token}`,
    ixcsoft: "listar",
  };
}

async function ixcFetch(
  baseUrl: string,
  headers: Record<string, string>,
  endpoint: string,
  filter?: { qtype: string; query: string; oper: string },
  gridParam?: Array<{ TB: string; OP: string; P: string }>,
  options?: { rp?: string; sortname?: string; sortorder?: string }
): Promise<any[]> {
  try {
    const body: Record<string, string> = {
      page: "1",
      rp: options?.rp ?? "5000",
    };

    if (filter) {
      body.qtype = filter.qtype;
      body.query = filter.query;
      body.oper = filter.oper;
    } else {
      body.qtype = `${endpoint}.id`;
      body.query = "1";
      body.oper = ">";
    }

    if (options?.sortname) body.sortname = options.sortname;
    if (options?.sortorder) body.sortorder = options.sortorder;

    if (gridParam && gridParam.length > 0) {
      body.grid_param = JSON.stringify(gridParam);
    }

    const resp = await fetch(`${baseUrl}/webservice/v1/${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      console.warn(`[IXC] ${endpoint} HTTP ${resp.status}`);
      return [];
    }
    const data = await resp.json();
    return data.registros || [];
  } catch (err) {
    console.warn(`[IXC] ${endpoint} fetch error:`, err);
    return [];
  }
}

function formatCpf(digits: string): string {
  return `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6,9)}-${digits.slice(9)}`;
}

function formatCnpj(digits: string): string {
  return `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5,8)}/${digits.slice(8,12)}-${digits.slice(12)}`;
}

function buildDocVariants(input: string): string[] {
  const digits = input.replace(/\D/g, "");
  const variants = new Set<string>();
  variants.add(input);
  if (digits.length >= 11) variants.add(digits);
  if (digits.length === 11) variants.add(formatCpf(digits));
  if (digits.length === 14) variants.add(formatCnpj(digits));
  return [...variants];
}

// ── Funções HTTP puras (retornam any[]) ──

async function ixc_client_lookup(
  creds: ErpCredentials,
  filtro?: Record<string, string>
): Promise<any[]> {
  const baseUrl = normalizeUrl(creds.apiUrl);
  const headers = buildAuth(creds.username || "", creds.password || "");

  if (!filtro?.cpf_cnpj) {
    // Busca em massa: apenas clientes ativos
    return ixcFetch(baseUrl, headers, "cliente", {
      qtype: "cliente.ativo", query: "S", oper: "=",
    });
  }

  // Try multiple format variants with early return, filtering by ativo=S via grid_param
  const variants = buildDocVariants(filtro.cpf_cnpj);
  console.log(`[IXC] ixc_client_lookup tentando ${variants.length} variante(s) de documento`);

  for (const variant of variants) {
    const recs = await ixcFetch(
      baseUrl, headers, "cliente",
      { qtype: "cliente.ativo", query: "S", oper: "=" },
      [{ TB: "cliente.cnpj_cpf", OP: "=", P: variant }],
    );
    if (recs.length > 0) {
      console.log(`[IXC] ixc_client_lookup: encontrado com variante "${variant}"`);
      return recs;
    }
  }

  console.log(`[IXC] ixc_client_lookup: nenhum resultado para nenhuma variante`);
  return [];
}

async function ixc_contract_lookup(
  creds: ErpCredentials,
  filtro?: Record<string, string>
): Promise<any[]> {
  const baseUrl = normalizeUrl(creds.apiUrl);
  const headers = buildAuth(creds.username || "", creds.password || "");

  if (filtro?.id_cliente) {
    // Busca por id_cliente + status ativo via grid_param (sem filtro JS)
    return ixcFetch(
      baseUrl, headers, "cliente_contrato",
      { qtype: "cliente_contrato.id_cliente", query: filtro.id_cliente, oper: "=" },
      [{ TB: "cliente_contrato.status", OP: "=", P: "A" }],
    );
  }

  // Sem filtro de cliente: apenas contratos ativos
  return ixcFetch(baseUrl, headers, "cliente_contrato", {
    qtype: "cliente_contrato.status", query: "A", oper: "=",
  });
}


async function ixc_radusuarios(creds: ErpCredentials): Promise<any[]> {
  const baseUrl = normalizeUrl(creds.apiUrl);
  const headers = buildAuth(creds.username || "", creds.password || "");
  return ixcFetch(baseUrl, headers, "radusuarios");
}

async function ixc_fibra(creds: ErpCredentials): Promise<any[]> {
  const baseUrl = normalizeUrl(creds.apiUrl);
  const headers = buildAuth(creds.username || "", creds.password || "");
  return ixcFetch(baseUrl, headers, "radpop_radio_cliente_fibra");
}

async function ixc_invoice_search(
  creds: ErpCredentials,
  filtro: Record<string, string>
): Promise<any[]> {
  const baseUrl = normalizeUrl(creds.apiUrl);
  const headers = buildAuth(creds.username || "", creds.password || "");

  // Combina id_contrato + status=A via grid_param (sem filtro JS)
  return ixcFetch(
    baseUrl, headers, "fn_areceber",
    { qtype: "fn_areceber.id_contrato", query: filtro.id_contrato, oper: "=" },
    [{ TB: "fn_areceber.status", OP: "=", P: "A" }],
  );
}

// ── PIX e Boleto (POST direto, sem ixcFetch) ──

async function ixc_pix_lookup(
  creds: ErpCredentials,
  idAreceber: string
): Promise<any> {
  const baseUrl = normalizeUrl(creds.apiUrl);
  const token = btoa(`${creds.username || ""}:${creds.password || ""}`);
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Basic ${token}`,
  };

  const resp = await fetch(`${baseUrl}/webservice/v1/get_pix`, {
    method: "POST",
    headers,
    body: JSON.stringify({ id_areceber: idAreceber }),
  });

  if (!resp.ok) {
    throw new Error(`IXC get_pix HTTP ${resp.status}`);
  }
  return resp.json();
}

async function ixc_boleto_lookup(
  creds: ErpCredentials,
  idAreceber: string
): Promise<any> {
  const baseUrl = normalizeUrl(creds.apiUrl);
  const token = btoa(`${creds.username || ""}:${creds.password || ""}`);
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Basic ${token}`,
  };

  const resp = await fetch(`${baseUrl}/webservice/v1/get_boleto`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      boletos: idAreceber,
      juro: "S",
      multa: "S",
      atualiza_boleto: "S",
      tipo_boleto: "arquivo",
      base64: "S",
    }),
  });

  if (!resp.ok) {
    throw new Error(`IXC get_boleto HTTP ${resp.status}`);
  }
  return resp.json();
}

async function ixc_boleto_sms(
  creds: ErpCredentials,
  idAreceber: string
): Promise<any> {
  const baseUrl = normalizeUrl(creds.apiUrl);
  const token = btoa(`${creds.username || ""}:${creds.password || ""}`);
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Basic ${token}`,
  };

  const resp = await fetch(`${baseUrl}/webservice/v1/get_boleto`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      boletos: idAreceber,
      juro: "S",
      multa: "S",
      atualiza_boleto: "S",
      tipo_boleto: "sms",
    }),
  });

  if (!resp.ok) {
    throw new Error(`IXC get_boleto (sms) HTTP ${resp.status}`);
  }
  return resp.json();
}

// ── Linha Digitável (busca pontual em fn_areceber por ID) ──

async function ixc_linha_digitavel(
  creds: ErpCredentials,
  idAreceber: string
): Promise<any> {
  const baseUrl = normalizeUrl(creds.apiUrl);
  const headers = buildAuth(creds.username || "", creds.password || "");

  const recs = await ixcFetch(baseUrl, headers, "fn_areceber", {
    qtype: "fn_areceber.id", query: idAreceber, oper: "=",
  });

  if (recs.length === 0) return { linha_digitavel: null };
  return { linha_digitavel: recs[0].linha_digitavel || null };
}

// ── Granular queries for AI tools ──

async function ixc_radusuarios_by_contract(
  creds: ErpCredentials,
  contratoId: string
): Promise<any[]> {
  const baseUrl = normalizeUrl(creds.apiUrl);
  const headers = buildAuth(creds.username || "", creds.password || "");
  return ixcFetch(
    baseUrl, headers, "radusuarios",
    { qtype: "radusuarios.id_contrato", query: contratoId, oper: "=" },
  );
}

async function ixc_fibra_by_login(
  creds: ErpCredentials,
  loginId: string
): Promise<any[]> {
  const baseUrl = normalizeUrl(creds.apiUrl);
  const headers = buildAuth(creds.username || "", creds.password || "");
  return ixcFetch(
    baseUrl, headers, "radpop_radio_cliente_fibra",
    { qtype: "radpop_radio_cliente_fibra.id_login", query: loginId, oper: "=" },
  );
}

// ── Provider Export ──

export const ixcProvider: ErpProviderDriver = {
  supportedFields() {
    return ["signal_db", "login", "plano", "contrato"];
  },

  async testConnection(creds: ErpCredentials): Promise<TestResult> {
    try {
      const baseUrl = normalizeUrl(creds.apiUrl);
      const headers = buildAuth(creds.username || "", creds.password || "");

      console.log(`[IXC] Testing connection to: ${baseUrl}`);

      const response = await fetch(`${baseUrl}/webservice/v1/cliente`, {
        method: "POST",
        headers,
        body: JSON.stringify({ qtype: "id", query: "1", oper: ">", page: "1", rp: "1" }),
      });

      console.log(`[IXC] Response status: ${response.status}`);

      if (response.status === 401) return { success: false, message: "Login ou senha inválidos. Verifique as credenciais no IXC." };
      if (response.status === 403) return { success: false, message: "Acesso proibido. Verifique se o token foi recriado após migração de servidor ou se o IP está liberado." };
      if (response.status === 404) return { success: false, message: "Endpoint não encontrado. Verifique a URL do servidor e se o header 'ixcsoft:listar' está presente." };
      if (response.status === 500) return { success: false, message: "Erro interno no servidor IXC. Verifique se o endpoint e os campos estão corretos." };
      if (response.status === 504) return { success: false, message: "Timeout do servidor IXC. Verifique o estado do servidor (RAM/disco) ou tente novamente." };
      if (!response.ok) return { success: false, message: `Erro HTTP ${response.status}` };

      const data = await response.json();
      return { success: true, message: "Conexão IXC estabelecida com sucesso", details: { clientes_count: data.total || data.registros?.length || 0 } };
    } catch (error) {
      console.error("[IXC] Error:", error);
      if (error instanceof Error && error.message?.includes("certificate")) {
        return { success: false, message: 'Erro de certificado SSL. Marque "Certificado Self-Signed" se aplicável.' };
      }
      if (error instanceof Error && error.message?.includes("ENOTFOUND")) {
        return { success: false, message: "URL não encontrada. Verifique se o domínio está correto e acessível." };
      }
      if (error instanceof Error && error.message?.includes("ECONNREFUSED")) {
        return { success: false, message: "Conexão recusada. O servidor pode estar indisponível — verifique RAM, disco e status do banco." };
      }
      return { success: false, message: error instanceof Error ? error.message : "Erro de conexão" };
    }
  },

  fetchClientes: ixc_client_lookup,
  fetchContratos: ixc_contract_lookup,
  fetchRadusuarios: ixc_radusuarios,
  fetchFibra: ixc_fibra,
  fetchFaturas: ixc_invoice_search,
  fetchPix: ixc_pix_lookup,
  fetchBoleto: ixc_boleto_lookup,
  fetchBoletoSms: ixc_boleto_sms,
  fetchLinhaDigitavel: ixc_linha_digitavel,
  fetchRadusuariosByContract: ixc_radusuarios_by_contract,
  fetchFibraByLogin: ixc_fibra_by_login,
};

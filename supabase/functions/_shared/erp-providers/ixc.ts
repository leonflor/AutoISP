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
  filter?: { qtype: string; query: string; oper: string }
): Promise<any[]> {
  try {
    const body = filter
      ? { qtype: filter.qtype, query: filter.query, oper: filter.oper, page: "1", rp: "5000" }
      : { qtype: `${endpoint}.id`, query: "1", oper: ">", page: "1", rp: "5000" };
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
    return ixcFetch(baseUrl, headers, "cliente");
  }

  // Try multiple format variants with early return
  const variants = buildDocVariants(filtro.cpf_cnpj);
  console.log(`[IXC] ixc_client_lookup tentando ${variants.length} variante(s) de documento`);

  for (const variant of variants) {
    const recs = await ixcFetch(baseUrl, headers, "cliente", {
      qtype: "cliente.cnpj_cpf", query: variant, oper: "=",
    });
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

  const filter = filtro?.id_cliente
    ? { qtype: "cliente_contrato.id_cliente", query: filtro.id_cliente, oper: "=" }
    : { qtype: "cliente_contrato.status", query: "A", oper: "=" };

  const recs = await ixcFetch(baseUrl, headers, "cliente_contrato", filter);

  // Filtra ativos quando veio por id_cliente (pode ter inativos)
  return filtro?.id_cliente
    ? recs.filter((ct: any) => ct.status === "A")
    : recs;
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

  const recs = await ixcFetch(baseUrl, headers, "fn_areceber", {
    qtype: "fn_areceber.id_contrato",
    query: filtro.id_contrato,
    oper: "=",
  });

  // Filtra apenas faturas com status 'A' (a receber / em aberto)
  return recs.filter((f: any) => f.status === "A");
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
      if (response.status === 404) return { success: false, message: "Endpoint não encontrado. Verifique a URL do servidor." };
      if (!response.ok) return { success: false, message: `Erro HTTP ${response.status}` };

      const data = await response.json();
      return { success: true, message: "Conexão IXC estabelecida com sucesso", details: { clientes_count: data.total || data.registros?.length || 0 } };
    } catch (error) {
      console.error("[IXC] Error:", error);
      if (error instanceof Error && error.message?.includes("certificate")) {
        return { success: false, message: 'Erro de certificado SSL. Marque "Certificado Self-Signed" se aplicável.' };
      }
      return { success: false, message: error instanceof Error ? error.message : "Erro de conexão" };
    }
  },

  fetchClientes: ixc_client_lookup,
  fetchContratos: ixc_contract_lookup,
  fetchRadusuarios: ixc_radusuarios,
  fetchFibra: ixc_fibra,
  fetchFaturas: ixc_invoice_search,
};

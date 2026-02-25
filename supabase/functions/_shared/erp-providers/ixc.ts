// ═══ CAMADA 3 — Provider IXC Soft ═══
// Funções granulares: uma por endpoint do ERP.
// Retorna dados brutos. Filtros ERP-específicos aplicados aqui.

import type {
  ErpProviderDriver,
  ErpCredentials,
  RawCliente,
  RawContrato,
  RawContratoDetalhado,
  RawRadusuario,
  RawFibraRecord,
  RawFatura,
  RawSignalData,
  TestResult,
  FaturaFilter,
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

// ── Funções Granulares ──

async function fetchRadusuarios(creds: ErpCredentials): Promise<RawRadusuario[]> {
  const baseUrl = normalizeUrl(creds.apiUrl);
  const headers = buildAuth(creds.username || "", creds.password || "");
  const recs = await ixcFetch(baseUrl, headers, "radusuarios");

  return recs.map((r: any) => ({
    id: String(r.id),
    id_cliente: String(r.id_cliente || ""),
    id_contrato: String(r.id_contrato || ""),
    login: r.login || "",
    online: r.online === "S" ? "S" : "N",
  }));
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

async function fetchClientes(
  creds: ErpCredentials,
  filtro?: { cpf_cnpj: string }
): Promise<RawCliente[]> {
  const baseUrl = normalizeUrl(creds.apiUrl);
  const headers = buildAuth(creds.username || "", creds.password || "");

  if (!filtro) {
    const recs = await ixcFetch(baseUrl, headers, "cliente");
    return recs.map((c: any) => ({
      id: String(c.id),
      nome: c.razao || c.fantasia || "",
      cpf_cnpj: c.cnpj_cpf || "",
    }));
  }

  // Try multiple format variants with early return
  const variants = buildDocVariants(filtro.cpf_cnpj);
  console.log(`[IXC] fetchClientes tentando ${variants.length} variante(s) de documento`);

  for (const variant of variants) {
    const recs = await ixcFetch(baseUrl, headers, "cliente", {
      qtype: "cliente.cnpj_cpf", query: variant, oper: "=",
    });
    if (recs.length > 0) {
      console.log(`[IXC] fetchClientes: encontrado com variante "${variant}"`);
      return recs.map((c: any) => ({
        id: String(c.id),
        nome: c.razao || c.fantasia || "",
        cpf_cnpj: c.cnpj_cpf || "",
      }));
    }
  }

  console.log(`[IXC] fetchClientes: nenhum resultado para nenhuma variante`);
  return [];
}

async function fetchContratos(
  creds: ErpCredentials,
  filtro?: { id_cliente: string }
): Promise<RawContrato[]> {
  const baseUrl = normalizeUrl(creds.apiUrl);
  const headers = buildAuth(creds.username || "", creds.password || "");

  // Sempre filtra apenas contratos ativos (status='A')
  const filter = filtro
    ? { qtype: "cliente_contrato.id_cliente", query: filtro.id_cliente, oper: "=" }
    : { qtype: "cliente_contrato.status", query: "A", oper: "=" };

  const recs = await ixcFetch(baseUrl, headers, "cliente_contrato", filter);

  // Filtra ativos quando veio por id_cliente (pode ter inativos)
  const ativos = filtro
    ? recs.filter((ct: any) => ct.status === "A")
    : recs;

  return ativos.map((ct: any) => ({
    id: String(ct.id),
    id_cliente: String(ct.id_cliente || ""),
    plano: ct.contrato || ct.id_vd_contrato || null,
    dia_vencimento: ct.dia_vencimento || null,
    status_internet: ct.status_internet || "normal",
  }));
}

async function fetchFibra(creds: ErpCredentials): Promise<RawFibraRecord[]> {
  const baseUrl = normalizeUrl(creds.apiUrl);
  const headers = buildAuth(creds.username || "", creds.password || "");
  const recs = await ixcFetch(baseUrl, headers, "radpop_radio_cliente_fibra");

  return recs.map((f: any) => {
    const rx = f.sinal_rx ? parseFloat(f.sinal_rx) : NaN;
    const tx = f.sinal_tx ? parseFloat(f.sinal_tx) : NaN;
    return {
      id: String(f.id),
      id_login: String(f.id_login || ""),
      sinal_rx: !isNaN(rx) ? rx : null,
      sinal_tx: !isNaN(tx) ? tx : null,
    };
  });
}

async function fetchFaturas(
  creds: ErpCredentials,
  filtro: FaturaFilter
): Promise<RawFatura[]> {
  const baseUrl = normalizeUrl(creds.apiUrl);
  const headers = buildAuth(creds.username || "", creds.password || "");

  // Passo 1: buscar id_cliente pelo CPF/CNPJ
  const clientes = await fetchClientes(creds, { cpf_cnpj: filtro.cpf_cnpj });
  if (clientes.length === 0) {
    console.log(`[IXC] fetchFaturas: nenhum cliente encontrado para CPF/CNPJ ${filtro.cpf_cnpj}`);
    return [];
  }

  const idCliente = clientes[0].id;

  // Passo 2: buscar contratos ativos do cliente
  const contratos = await fetchContratos(creds, { id_cliente: idCliente });
  if (contratos.length === 0) {
    console.log(`[IXC] fetchFaturas: nenhum contrato ativo para cliente ${idCliente}`);
    return [];
  }

  // Passo 3: buscar faturas por id_contrato (cadeia correta)
  const allFaturas: RawFatura[] = [];

  for (const contrato of contratos) {
    const recs = await ixcFetch(baseUrl, headers, "fn_areceber", {
      qtype: "fn_areceber.id_contrato",
      query: contrato.id,
      oper: "=",
    });

    // Filtra apenas faturas com status 'A' (a receber / em aberto)
    const abertas = recs.filter((f: any) => f.status === "A");

    for (const f of abertas) {
      allFaturas.push({
        id: String(f.id),
        id_cliente: String(f.id_cliente || idCliente),
        id_contrato: contrato.id,
        data_vencimento: f.data_vencimento || "",
        valor: parseFloat(f.valor || "0"),
        valor_pago: f.valor_pago ? parseFloat(f.valor_pago) : null,
        linha_digitavel: f.linha_digitavel || null,
        gateway_link: f.gateway_link || f.url_gateway || null,
      });
    }
  }

  return allFaturas;
}

async function fetchRawSignal(
  creds: ErpCredentials,
  clientId: string
): Promise<RawSignalData> {
  const baseUrl = normalizeUrl(creds.apiUrl);
  const headers = buildAuth(creds.username || "", creds.password || "");

  const signalResp = await fetch(`${baseUrl}/webservice/v1/botao_rel_22991`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      qtype: "botao_rel_22991.id_cliente",
      query: clientId,
      oper: "=",
      page: "1",
      rp: "1",
    }),
  });

  if (!signalResp.ok) throw new Error(`IXC HTTP ${signalResp.status}`);

  const signalData = await signalResp.json();
  const record = signalData.registros?.[0] || signalData.data || null;

  if (!record) return { tx: null, rx: null };

  const rx = record.rx ? parseFloat(record.rx) : null;
  const tx = record.tx ? parseFloat(record.tx) : null;

  return {
    tx: tx !== null && !isNaN(tx) ? tx : null,
    rx: rx !== null && !isNaN(rx) ? rx : null,
    raw_record: record,
  };
}

async function fetchContratosDetalhados(
  creds: ErpCredentials,
  filtro: { id_cliente: string }
): Promise<RawContratoDetalhado[]> {
  const baseUrl = normalizeUrl(creds.apiUrl);
  const headers = buildAuth(creds.username || "", creds.password || "");

  const recs = await ixcFetch(baseUrl, headers, "cliente_contrato", {
    qtype: "cliente_contrato.id_cliente",
    query: filtro.id_cliente,
    oper: "=",
  });

  const ativos = recs.filter((ct: any) => ct.status === "A");
  console.log(`[IXC] fetchContratosDetalhados raw (${ativos.length} ativos):`, JSON.stringify(ativos.map((ct: any) => ({
    id: ct.id, endereco: ct.endereco, numero: ct.numero, complemento: ct.complemento, bairro: ct.bairro, cidade: ct.cidade, estado: ct.estado
  }))));

  return ativos.map((ct: any) => ({
    id: String(ct.id),
    id_cliente: String(ct.id_cliente || ""),
    plano: ct.contrato || ct.id_vd_contrato || null,
    dia_vencimento: ct.dia_vencimento || null,
    status_internet: ct.status_internet || "normal",
    endereco: ct.endereco || null,
    numero: ct.numero || null,
    bairro: ct.bairro || null,
    cidade: ct.cidade || null,
    estado: ct.estado || null,
    cep: ct.cep || null,
    complemento: ct.complemento || null,
  }));
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

  fetchClientes: fetchClientes,
  fetchContratos: fetchContratos,
  fetchRadusuarios: fetchRadusuarios,
  fetchFibra: fetchFibra,
  fetchFaturas: fetchFaturas,
  fetchRawSignal: fetchRawSignal,
  fetchContratosDetalhados: fetchContratosDetalhados,
};

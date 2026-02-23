// ═══ CAMADA 3 — Provider IXC Soft ═══
// Eixo principal: /radusuarios (usuários RADIUS autenticados)
// Inclui clientes próprios e parceiros que compartilham a infraestrutura.
// Join: radusuarios → cliente → cliente_contrato → left join radpop_radio_cliente_fibra (sinal)

import type { ErpProviderDriver, ErpCredentials, RawErpClient, RawSignalData, TestResult } from "../erp-types.ts";

interface IxcRadusuario {
  id: string;
  id_cliente: string;
  id_contrato: string;
  login: string;
  online: string;
  ativo: string;
}

interface IxcFibraRecord {
  id: string;
  id_login: string;
  sinal_rx: string;
  sinal_tx: string;
}

interface IxcContrato {
  id: string;
  id_cliente: string;
  status: string;
  contrato: string;
  id_vd_contrato: string;
  dia_vencimento: string;
}

interface IxcCliente {
  id: string;
  razao: string;
  fantasia: string;
  cnpj_cpf: string;
}

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

async function ixcFetch(baseUrl: string, headers: Record<string, string>, endpoint: string, filter?: { qtype: string; query: string; oper: string }): Promise<any[]> {
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

export const ixcProvider: ErpProviderDriver = {
  supportedFields() {
    return ["signal_db", "login", "plano", "contrato"];
  },

  async fetchRawClients(creds: ErpCredentials): Promise<RawErpClient[]> {
    const baseUrl = normalizeUrl(creds.apiUrl);
    const headers = buildAuth(creds.username || "", creds.password || "");

    // Fetch all 4 endpoints in parallel
    const [radRecs, clienteRecs, contratoRecs, fibraRecs] = await Promise.all([
      ixcFetch(baseUrl, headers, "radusuarios"),
      ixcFetch(baseUrl, headers, "cliente"),
      ixcFetch(baseUrl, headers, "cliente_contrato"),
      ixcFetch(baseUrl, headers, "radpop_radio_cliente_fibra"),
    ]);

    console.log(`[IXC] radusuarios: ${radRecs.length}, clientes: ${clienteRecs.length}, contratos: ${contratoRecs.length}, fibra: ${fibraRecs.length}`);

    // Build lookup maps
    const clientesById = new Map<string, IxcCliente>();
    for (const c of clienteRecs) {
      clientesById.set(String(c.id), {
        id: String(c.id),
        razao: c.razao || "",
        fantasia: c.fantasia || "",
        cnpj_cpf: c.cnpj_cpf || "",
      });
    }

    const contratosById = new Map<string, IxcContrato>();
    for (const ct of contratoRecs) {
      contratosById.set(String(ct.id), {
        id: String(ct.id),
        id_cliente: String(ct.id_cliente),
        status: ct.status || "",
        contrato: ct.contrato || "",
        id_vd_contrato: ct.id_vd_contrato || "",
        dia_vencimento: ct.dia_vencimento || "",
      });
    }

    // fibra indexed by id_login (= radusuarios.id)
    const fibraByIdLogin = new Map<string, IxcFibraRecord>();
    for (const f of fibraRecs) {
      const idLogin = String(f.id_login || "");
      if (idLogin) {
        fibraByIdLogin.set(idLogin, {
          id: String(f.id),
          id_login: idLogin,
          sinal_rx: f.sinal_rx || "",
          sinal_tx: f.sinal_tx || "",
        });
      }
    }

    // Iterate over radusuarios (primary axis)
    const results: RawErpClient[] = [];

    for (const r of radRecs) {
      const radId = String(r.id);
      const clienteId = String(r.id_cliente || "");
      const login = r.login || null;
      const rawOnline = r.online === "S" ? "S" : "N";

      // Resolve cliente
      const cliente = clientesById.get(clienteId);
      const nome = cliente ? (cliente.razao || cliente.fantasia || "") : "";
      const cpfCnpj = cliente?.cnpj_cpf || "";

      // Resolve signal from fibra (left join)
      const fibra = fibraByIdLogin.get(radId);
      const sinalRx = fibra ? parseFloat(fibra.sinal_rx) : NaN;
      const signalDb = !isNaN(sinalRx) ? sinalRx : null;

      // Resolve contrato via id_contrato (1:1 com radusuarios)
      const contratoId = String(r.id_contrato || "");
      const contrato = contratoId ? contratosById.get(contratoId) : null;

      // Status comes from radusuarios.ativo (S/N), not from contract
      const rawAtivo = r.ativo === "S" ? "ativo:S" : "ativo:N";

      results.push({
        erp_id: radId,
        contrato_id: contrato?.id || null,
        cliente_erp_id: clienteId,
        nome,
        cpf_cnpj: cpfCnpj,
        data_vencimento: contrato?.dia_vencimento ? `Dia ${contrato.dia_vencimento}` : null,
        plano: contrato ? (contrato.contrato || contrato.id_vd_contrato || null) : null,
        login,
        raw_status: rawAtivo,
        raw_online: rawOnline,
        signal_db: signalDb,
      });
    }

    console.log(`[IXC] Total records (radius-centric): ${results.length}`);
    return results;
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

  async fetchRawSignal(creds: ErpCredentials, clientId: string): Promise<RawSignalData> {
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
  },
};

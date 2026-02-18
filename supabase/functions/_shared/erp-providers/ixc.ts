// ═══ CAMADA 3 — Provider IXC Soft ═══
// Conexão efetiva com o IXC. Retorna dados BRUTOS.

import type { ErpProviderDriver, ErpCredentials, RawErpClient, RawSignalData, TestResult } from "../erp-types.ts";

// Tipos internos IXC
interface IxcRadusuario {
  id: string;
  id_cliente: string;
  login: string;
  online: string;
}

interface IxcFibraRecord {
  id_login: string;
  sinal_rx: string;
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

export const ixcProvider: ErpProviderDriver = {
  supportedFields() {
    return ["signal_db", "login", "plano", "contrato"];
  },

  async fetchRawClients(creds: ErpCredentials): Promise<RawErpClient[]> {
    const baseUrl = normalizeUrl(creds.apiUrl);
    const headers = buildAuth(creds.username || "", creds.password || "");

    // Fetch clientes + radusuarios + fibra signal em paralelo
    const [clientesResp, radusuariosResp, fibraResp] = await Promise.all([
      fetch(`${baseUrl}/webservice/v1/cliente`, {
        method: "POST",
        headers,
        body: JSON.stringify({ qtype: "cliente.ativo", query: "S", oper: "=", page: "1", rp: "5000" }),
      }),
      fetch(`${baseUrl}/webservice/v1/radusuarios`, {
        method: "POST",
        headers,
        body: JSON.stringify({ qtype: "radusuarios.id", query: "1", oper: ">", page: "1", rp: "5000" }),
      }).catch(() => null),
      fetch(`${baseUrl}/webservice/v1/radpop_radio_cliente_fibra`, {
        method: "POST",
        headers,
        body: JSON.stringify({ qtype: "radpop_radio_cliente_fibra.id", query: "1", oper: ">", page: "1", rp: "5000" }),
      }).catch(() => null),
    ]);

    if (!clientesResp.ok) throw new Error(`IXC HTTP ${clientesResp.status}`);
    const clientesData = await clientesResp.json();
    const registros = clientesData.registros || [];

    // Build radusuarios lookup
    const radusuariosMap: Record<string, IxcRadusuario> = {};
    if (radusuariosResp?.ok) {
      try {
        const radData = await radusuariosResp.json();
        for (const r of radData.registros || []) {
          radusuariosMap[String(r.id_cliente)] = {
            id: String(r.id),
            id_cliente: String(r.id_cliente),
            login: r.login || "",
            online: r.online || "N",
          };
        }
      } catch { /* non-blocking */ }
    }

    // Contratos
    let contratos: Record<string, any> = {};
    try {
      const contratosResp = await fetch(`${baseUrl}/webservice/v1/cliente_contrato`, {
        method: "POST",
        headers,
        body: JSON.stringify({ qtype: "cliente_contrato.id", query: "1", oper: ">", page: "1", rp: "1000" }),
      });
      if (contratosResp.ok) {
        const cd = await contratosResp.json();
        for (const c of cd.registros || []) {
          contratos[String(c.id_cliente)] = c;
        }
      }
    } catch { /* non-blocking */ }

    // Signal map from fibra
    const signalMap: Record<string, number | null> = {};
    if (fibraResp?.ok) {
      try {
        const fibraData = await fibraResp.json();
        const fibraRegistros = fibraData.registros || [];
        const loginSignalMap: Record<string, number> = {};
        for (const f of fibraRegistros) {
          const rx = parseFloat(f.sinal_rx);
          if (!isNaN(rx) && f.id_login) loginSignalMap[String(f.id_login)] = rx;
        }
        for (const [clientId, rad] of Object.entries(radusuariosMap)) {
          const signal = loginSignalMap[rad.id];
          if (signal !== undefined) signalMap[clientId] = signal;
        }
        console.log(`[IXC] radpop_radio_cliente_fibra: ${fibraRegistros.length} records, ${Object.keys(signalMap).length} matched`);
      } catch { /* non-blocking */ }
    }

    return registros.map((r: any) => {
      const contrato = contratos[String(r.id)];
      const rad = radusuariosMap[String(r.id)];
      const rawSignal = signalMap[String(r.id)] ?? null;

      // Build raw status string for normalization by driver
      let rawStatus: string;
      if (contrato?.status) {
        rawStatus = `contrato:${contrato.status}`;
      } else {
        rawStatus = `ativo:${r.ativo || "?"}`;
      }

      // Raw online: combine radius + contract info
      const rawOnline = rad?.online === "S" ? "S" : (contrato?.status === "A" && r.ativo === "S" ? "contract_active" : "N");

      return {
        erp_id: String(r.id),
        nome: r.razao || r.fantasia || "",
        cpf_cnpj: r.cnpj_cpf || "",
        data_vencimento: null,
        plano: contrato?.contrato || contrato?.id_vd_contrato || null,
        login: rad?.login || contrato?.login || r.login || null,
        raw_status: rawStatus,
        raw_online: rawOnline,
        signal_db: rawSignal !== null && !isNaN(rawSignal) ? rawSignal : null,
      };
    });
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

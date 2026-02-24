// ═══ CAMADA 3 — Provider SGP ═══
// Conexão efetiva com o SGP. Retorna dados BRUTOS.

import type {
  ErpProviderDriver,
  ErpCredentials,
  RawCliente,
  RawContrato,
  RawFatura,
  TestResult,
  FaturaFilter,
} from "../erp-types.ts";

function normalizeUrl(apiUrl: string): string {
  let base = apiUrl.replace(/\/+$/, "");
  if (base.endsWith("/api")) base = base.slice(0, -4);
  return base;
}

export const sgpProvider: ErpProviderDriver = {
  supportedFields() {
    return ["login", "plano"];
  },

  async fetchClientes(creds: ErpCredentials): Promise<RawCliente[]> {
    const baseUrl = normalizeUrl(creds.apiUrl);

    const body = new URLSearchParams();
    body.append("token", creds.token || creds.apiKey || "");
    body.append("app", creds.app || creds.username || "");

    const resp = await fetch(`${baseUrl}/api/ura/clientes`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!resp.ok) throw new Error(`SGP HTTP ${resp.status}`);

    const data = await resp.json();
    const clientes = Array.isArray(data) ? data : data.clientes || data.data || [];

    return clientes.map((r: any) => ({
      id: String(r.id || r.codigo || r.cd_cliente || ""),
      nome: r.nome || r.razao_social || r.nm_cliente || "",
      cpf_cnpj: r.cpf_cnpj || r.cpf || r.cnpj || "",
    }));
  },

  async fetchContratos(): Promise<RawContrato[]> {
    // SGP não suporta busca granular de contratos por ora
    console.log("[SGP] fetchContratos: stub — sem integração real");
    return [];
  },

  async fetchFaturas(_creds: ErpCredentials, _filtro: FaturaFilter): Promise<RawFatura[]> {
    // SGP não suporta busca de faturas por ora
    console.log("[SGP] fetchFaturas: stub — sem integração real");
    return [];
  },

  async testConnection(creds: ErpCredentials): Promise<TestResult> {
    try {
      const baseUrl = normalizeUrl(creds.apiUrl);
      const testUrl = `${baseUrl}/api/ura/clientes`;
      console.log(`[SGP] Testing connection to: ${testUrl}`);

      const body = new URLSearchParams();
      body.append("token", creds.token || creds.apiKey || "");
      body.append("app", creds.app || creds.username || "");
      body.append("cpfcnpj", "00000000000");

      const response = await fetch(testUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      console.log(`[SGP] Response status: ${response.status}`);

      if (response.status === 401) return { success: false, message: "Token ou App inválido. Verifique as credenciais no SGP." };
      if (response.status === 403) return { success: false, message: "Acesso negado. Verifique as permissões do token." };
      if (response.status === 404) return { success: false, message: "Endpoint não encontrado. Verifique a URL do servidor." };
      if (!response.ok) return { success: false, message: `Erro HTTP ${response.status}` };

      return { success: true, message: "Conexão SGP estabelecida com sucesso" };
    } catch (error) {
      console.error("[SGP] Error:", error);
      return { success: false, message: error instanceof Error ? error.message : "Erro de conexão" };
    }
  },
};

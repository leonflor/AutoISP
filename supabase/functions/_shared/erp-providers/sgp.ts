// ═══ CAMADA 3 — Provider SGP ═══
// Conexão efetiva com o SGP. Retorna dados BRUTOS.

import type { ErpProviderDriver, ErpCredentials, RawErpClient, TestResult } from "../erp-types.ts";

function normalizeUrl(apiUrl: string): string {
  let base = apiUrl.replace(/\/+$/, "");
  if (base.endsWith("/api")) base = base.slice(0, -4);
  return base;
}

export const sgpProvider: ErpProviderDriver = {
  supportedFields() {
    return ["login", "plano"];
  },

  async fetchRawClients(creds: ErpCredentials): Promise<RawErpClient[]> {
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

    const erpId = (r: any) => String(r.id || r.codigo || r.cd_cliente || "");
    return clientes.map((r: any) => ({
      erp_id: erpId(r),
      contrato_id: erpId(r),
      cliente_erp_id: erpId(r),
      nome: r.nome || r.razao_social || r.nm_cliente || "",
      cpf_cnpj: r.cpf_cnpj || r.cpf || r.cnpj || "",
      data_vencimento: r.dia_vencimento ? `Dia ${r.dia_vencimento}` : r.vencimento || null,
      plano: r.plano || r.nm_plano || r.ds_plano || null,
      login: r.login || r.usuario || null,
      raw_status: r.status || r.situacao || "ativo",
      raw_online: r.online === true || r.online === "S" || r.conectado === true ? "S" : "N",
      signal_db: null,
    }));
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

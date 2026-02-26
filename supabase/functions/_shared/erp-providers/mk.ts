// ═══ CAMADA 3 — Provider MK-Solutions ═══
// HTTP puro. Retorna dados CRUS (any[]).
// Nenhum mapeamento de campos — responsabilidade do Driver (Camada 2).

import type {
  ErpProviderDriver,
  ErpCredentials,
  TestResult,
} from "../erp-types.ts";

export const mkProvider: ErpProviderDriver = {
  supportedFields() {
    return ["login", "plano"];
  },

  async fetchClientes(creds: ErpCredentials, _filtro?: Record<string, string>): Promise<any[]> {
    const resp = await fetch(`${creds.apiUrl}/mk/WSMKIntegracaoGeral.rule`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        usuario: creds.username || "",
        token: creds.apiKey || "",
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

    return Array.isArray(data) ? data : data.clientes || data.lista || [];
  },

  async fetchContratos(): Promise<any[]> {
    console.log("[MK] fetchContratos: stub — sem integração real");
    return [];
  },

  async fetchFaturas(_creds: ErpCredentials, _filtro: Record<string, string>): Promise<any[]> {
    console.log("[MK] fetchFaturas: stub — sem integração real");
    return [];
  },

  async testConnection(creds: ErpCredentials): Promise<TestResult> {
    try {
      console.log(`[MK] Testing connection to: ${creds.apiUrl}`);

      const response = await fetch(`${creds.apiUrl}/mk/WSMKIntegracaoGeral.rule`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          usuario: creds.username || "",
          token: creds.apiKey || "",
          funcao: "listarClientes",
          limit: "1",
        }),
      });

      console.log(`[MK] Response status: ${response.status}`);

      if (response.status === 401 || response.status === 403) {
        return { success: false, message: "Usuário ou API Key inválidos." };
      }
      if (!response.ok) return { success: false, message: `Erro HTTP ${response.status}` };

      const text = await response.text();
      if (text.toLowerCase().includes("erro") || text.toLowerCase().includes("invalido")) {
        return { success: false, message: "Credenciais inválidas ou acesso negado." };
      }

      return { success: true, message: "Conexão MK-Solutions estabelecida com sucesso" };
    } catch (error) {
      console.error("[MK] Error:", error);
      return { success: false, message: error instanceof Error ? error.message : "Erro de conexão" };
    }
  },
};

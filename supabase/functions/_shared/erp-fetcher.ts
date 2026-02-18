// ═══ Fachada Retrocompatível ═══
// Re-exporta tipos e delega para o driver.
// Mantém imports existentes funcionando.

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { type SignalQuality } from "./onu-signal-analyzer.ts";

// Re-exportar tipos da Camada 1
export type { ErpClient } from "./erp-types.ts";

// Re-exportar decrypt do Driver
export { decrypt } from "./erp-driver.ts";

// Re-exportar searchErpClient delegando ao driver
import { searchClients } from "./erp-driver.ts";

export async function searchErpClient(
  supabaseAdmin: SupabaseClient,
  ispId: string,
  encryptionKey: string,
  query: string
): Promise<{ clients: import("./erp-types.ts").ErpClient[]; errors: string[] }> {
  return searchClients(supabaseAdmin, ispId, encryptionKey, query);
}

// Funções legadas — delegam para os providers via driver
// Mantidas para retrocompatibilidade com código que ainda importa diretamente

import { getProvider } from "./erp-providers/index.ts";
import type { ErpClient } from "./erp-types.ts";

export async function fetchIxcClients(apiUrl: string, username: string, password: string): Promise<ErpClient[]> {
  const driver = getProvider("ixc");
  const { classifySignalDb } = await import("./onu-signal-analyzer.ts");
  const { PROVIDER_DISPLAY_NAMES } = await import("./erp-types.ts");
  const raws = await driver.fetchRawClients({ apiUrl, username, password });
  const supported = driver.supportedFields();
  return raws.map((r) => ({
    erp_id: r.erp_id,
    provider: "ixc" as const,
    provider_name: PROVIDER_DISPLAY_NAMES.ixc,
    nome: r.nome,
    cpf_cnpj: r.cpf_cnpj,
    data_vencimento: r.data_vencimento,
    plano: r.plano,
    login: r.login,
    status_contrato: r.raw_status as any,
    conectado: r.raw_online === "S" || r.raw_online === true,
    signal_db: r.signal_db,
    signal_quality: classifySignalDb(r.signal_db),
    field_availability: { signal_db: supported.includes("signal_db"), login: true, plano: true, contrato: true },
  }));
}

export async function fetchSgpClients(apiUrl: string, token: string, app: string): Promise<ErpClient[]> {
  const driver = getProvider("sgp");
  const { PROVIDER_DISPLAY_NAMES } = await import("./erp-types.ts");
  const raws = await driver.fetchRawClients({ apiUrl, token, app });
  return raws.map((r) => ({
    erp_id: r.erp_id,
    provider: "sgp" as const,
    provider_name: PROVIDER_DISPLAY_NAMES.sgp,
    nome: r.nome,
    cpf_cnpj: r.cpf_cnpj,
    data_vencimento: r.data_vencimento,
    plano: r.plano,
    login: r.login,
    status_contrato: r.raw_status as any,
    conectado: r.raw_online === "S" || r.raw_online === true,
    signal_db: null,
    signal_quality: "unknown" as SignalQuality,
    field_availability: { signal_db: false, login: true, plano: true },
  }));
}

export async function fetchMkClients(apiUrl: string, username: string, apiKey: string): Promise<ErpClient[]> {
  const driver = getProvider("mk_solutions");
  const { PROVIDER_DISPLAY_NAMES } = await import("./erp-types.ts");
  const raws = await driver.fetchRawClients({ apiUrl, username, apiKey });
  return raws.map((r) => ({
    erp_id: r.erp_id,
    provider: "mk_solutions" as const,
    provider_name: PROVIDER_DISPLAY_NAMES.mk_solutions,
    nome: r.nome,
    cpf_cnpj: r.cpf_cnpj,
    data_vencimento: r.data_vencimento,
    plano: r.plano,
    login: r.login,
    status_contrato: r.raw_status as any,
    conectado: r.raw_online === "S" || r.raw_online === true,
    signal_db: null,
    signal_quality: "unknown" as SignalQuality,
    field_availability: { signal_db: false, login: true, plano: true },
  }));
}

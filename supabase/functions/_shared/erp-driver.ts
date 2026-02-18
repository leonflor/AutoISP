// ═══ CAMADA 2 — Driver / Orquestrador ERP ═══
// Decide DE ONDE buscar, normaliza status/conexão, injeta origem obrigatória.

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { classifySignalDb } from "./onu-signal-analyzer.ts";
import { analyzeOnuSignal, formatSignalReport } from "./onu-signal-analyzer.ts";
import { getProvider } from "./erp-providers/index.ts";
import type {
  ErpProvider,
  ErpClient,
  ErpCredentials,
  TestResult,
  RawErpClient,
  ContractStatus,
} from "./erp-types.ts";
import { PROVIDER_DISPLAY_NAMES } from "./erp-types.ts";

// ── Decrypt Helper ──

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
    "raw", keyBytes, { name: "AES-GCM" }, false, ["decrypt"]
  );
  const ivBytes = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));
  const encrypted = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes }, key, encrypted
  );
  return new TextDecoder().decode(decrypted);
}

// ── Resolução de Credenciais ──

export async function resolveCredentials(
  config: any,
  encryptionKey: string
): Promise<ErpCredentials> {
  const creds: ErpCredentials = {
    apiUrl: config.api_url || "",
    username: config.username || undefined,
  };

  if (config.api_key_encrypted && config.encryption_iv) {
    const decrypted = await decrypt(config.api_key_encrypted, config.encryption_iv, encryptionKey);
    if (config.provider === "sgp") {
      creds.token = decrypted;
      creds.app = config.username || "";
    } else if (config.provider !== "ixc") {
      creds.apiKey = decrypted;
    }
  }

  if (config.provider === "ixc" && config.password_encrypted && config.encryption_iv) {
    creds.password = await decrypt(config.password_encrypted, config.encryption_iv, encryptionKey);
  }

  return creds;
}

// ── Normalização de Status ──

const IXC_STATUS_MAP: Record<string, ContractStatus> = {
  "contrato:A": "ativo",
  "contrato:S": "suspenso",
  "contrato:C": "cancelado",
  "ativo:S": "ativo",
  "ativo:N": "cancelado",
};

const SGP_STATUS_MAP: Record<string, ContractStatus> = {
  ativo: "ativo",
  off: "cancelado",
  suspenso: "suspenso",
  bloqueado: "bloqueado",
  inativo: "cancelado",
  desconectado: "cancelado",
};

const MK_STATUS_MAP: Record<string, ContractStatus> = {
  ativo: "ativo",
  bloqueado: "bloqueado",
  suspenso: "suspenso",
  cancelado: "cancelado",
  inativo: "cancelado",
};

function normalizeStatus(rawStatus: string, provider: ErpProvider): ContractStatus {
  switch (provider) {
    case "ixc":
      return IXC_STATUS_MAP[rawStatus] || "desconhecido";
    case "sgp":
      return SGP_STATUS_MAP[rawStatus.toLowerCase()] || "desconhecido";
    case "mk_solutions":
      return MK_STATUS_MAP[rawStatus.toLowerCase()] || "desconhecido";
    default:
      return "desconhecido";
  }
}

function normalizeOnline(rawOnline: string | boolean | null): boolean {
  if (rawOnline === true || rawOnline === "S" || rawOnline === "contract_active") return true;
  return false;
}

// ── Normalizar Cliente ──

function normalizeClient(
  raw: RawErpClient,
  provider: ErpProvider,
  providerName: string,
  supported: string[]
): ErpClient {
  const fieldAvailability: Record<string, boolean> = {
    signal_db: supported.includes("signal_db"),
    login: supported.includes("login"),
    plano: supported.includes("plano"),
    contrato: supported.includes("contrato"),
  };

  return {
    erp_id: raw.erp_id,
    provider,
    provider_name: providerName,
    nome: raw.nome,
    cpf_cnpj: raw.cpf_cnpj,
    data_vencimento: raw.data_vencimento,
    plano: raw.plano,
    login: raw.login,
    status_contrato: normalizeStatus(raw.raw_status, provider),
    conectado: normalizeOnline(raw.raw_online),
    signal_db: raw.signal_db,
    signal_quality: classifySignalDb(raw.signal_db),
    field_availability: fieldAvailability,
  };
}

// ── Métodos Públicos ──

interface FetchResult {
  clients: ErpClient[];
  errors: { provider: string; message: string }[];
}

/**
 * Busca clientes de TODOS os ERPs ativos do ISP.
 * Injeta provider obrigatório em cada registro.
 */
export async function fetchAllClients(
  supabaseAdmin: SupabaseClient,
  ispId: string,
  encryptionKey: string
): Promise<FetchResult> {
  const { data: configs } = await supabaseAdmin
    .from("erp_configs")
    .select("*")
    .eq("isp_id", ispId)
    .eq("is_active", true)
    .eq("is_connected", true);

  if (!configs || configs.length === 0) {
    return { clients: [], errors: [] };
  }

  const result: FetchResult = { clients: [], errors: [] };

  const promises = configs.map(async (config) => {
    try {
      const providerKey = config.provider as ErpProvider;
      const providerName = PROVIDER_DISPLAY_NAMES[providerKey] || config.display_name || config.provider;
      const driver = getProvider(providerKey);
      const creds = await resolveCredentials(config, encryptionKey);
      const rawClients = await driver.fetchRawClients(creds);
      const supported = driver.supportedFields();

      return {
        clients: rawClients.map((r) => normalizeClient(r, providerKey, providerName, supported)),
        error: null,
        provider: providerName,
      };
    } catch (err) {
      console.error(`[${config.provider}] Fetch error:`, err);
      return {
        clients: [] as ErpClient[],
        error: {
          provider: config.display_name || config.provider,
          message: err instanceof Error ? err.message : "Erro desconhecido",
        },
        provider: config.provider,
      };
    }
  });

  const results = await Promise.all(promises);
  for (const r of results) {
    result.clients.push(...r.clients);
    if (r.error) result.errors.push(r.error);
  }

  return result;
}

/**
 * Busca clientes filtrados por query (nome ou CPF/CNPJ).
 */
export async function searchClients(
  supabaseAdmin: SupabaseClient,
  ispId: string,
  encryptionKey: string,
  query: string
): Promise<{ clients: ErpClient[]; errors: string[] }> {
  const { clients, errors } = await fetchAllClients(supabaseAdmin, ispId, encryptionKey);

  const searchLower = query.toLowerCase().trim();
  const searchClean = searchLower.replace(/[.\-\/]/g, "");

  const filtered = clients.filter((c) => {
    const nameLower = c.nome.toLowerCase();
    const docClean = c.cpf_cnpj.replace(/[.\-\/]/g, "").toLowerCase();
    return nameLower.includes(searchLower) || docClean.includes(searchClean);
  });

  return {
    clients: filtered,
    errors: errors.map((e) => `${e.provider}: ${e.message}`),
  };
}

/**
 * Testa conexão com um provider específico.
 */
export async function testConnection(
  provider: ErpProvider,
  credentials: ErpCredentials
): Promise<TestResult> {
  const driver = getProvider(provider);
  return driver.testConnection(credentials);
}

/**
 * Busca sinal detalhado de um cliente (diagnóstico ONU).
 */
export async function fetchClientSignal(
  supabaseAdmin: SupabaseClient,
  ispId: string,
  encryptionKey: string,
  clientId: string
): Promise<{ signal: any; report: string }> {
  // Atualmente apenas IXC suporta diagnóstico de sinal
  const { data: config } = await supabaseAdmin
    .from("erp_configs")
    .select("*")
    .eq("isp_id", ispId)
    .eq("provider", "ixc")
    .eq("is_active", true)
    .eq("is_connected", true)
    .single();

  if (!config) {
    throw new Error("Nenhuma integração IXC ativa encontrada");
  }

  const creds = await resolveCredentials(config, encryptionKey);
  const driver = getProvider("ixc");

  if (!driver.fetchRawSignal) {
    throw new Error("Provider não suporta diagnóstico de sinal");
  }

  const rawSignal = await driver.fetchRawSignal(creds, clientId);
  const result = analyzeOnuSignal({ tx: rawSignal.tx, rx: rawSignal.rx });

  return { signal: result, report: formatSignalReport(result) };
}

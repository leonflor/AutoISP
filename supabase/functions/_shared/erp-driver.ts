// ═══ CAMADA 2 — Driver / Orquestrador ERP ═══
// Resolve credenciais, compõe chamadas granulares, normaliza status_internet.

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { classifySignalDb } from "./onu-signal-analyzer.ts";
import { analyzeOnuSignal, formatSignalReport } from "./onu-signal-analyzer.ts";
import { getProvider } from "./erp-providers/index.ts";
import type {
  ErpProvider,
  ErpClient,
  ErpCredentials,
  ErpInvoice,
  InternetStatus,
  FaturaFilter,
  RawContratoDetalhado,
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

// ── Normalização de status_internet (Camada 2) ──

const IXC_INTERNET_STATUS_MAP: Record<string, InternetStatus> = {
  normal: "ativo",
  bloqueado: "bloqueado",
  bloqueio_manual: "bloqueado",
  bloqueio_automatico: "bloqueado",
  reduzido: "financeiro_em_atraso",
  pendente_reativa: "bloqueado",
  desativado: "bloqueado",
};

function normalizeInternetStatus(rawStatus: string, _provider: ErpProvider): InternetStatus {
  const key = rawStatus.toLowerCase().trim();
  return IXC_INTERNET_STATUS_MAP[key] || "outros";
}

// ── Resolver configs ativos do ISP ──

async function resolveActiveConfigs(supabaseAdmin: SupabaseClient, ispId: string) {
  const { data: configs } = await supabaseAdmin
    .from("erp_configs")
    .select("*")
    .eq("isp_id", ispId)
    .eq("is_active", true)
    .eq("is_connected", true);

  return configs || [];
}

// ── Composição: IXC (radusuarios + clientes + contratos + fibra) ──

interface FetchResult {
  clients: ErpClient[];
  errors: { provider: string; message: string }[];
}

async function composeIxcClients(
  creds: ErpCredentials,
  providerName: string,
  driver: import("./erp-types.ts").ErpProviderDriver
): Promise<ErpClient[]> {
  const [rads, clientes, contratos, fibra] = await Promise.all([
    driver.fetchRadusuarios!(creds),
    driver.fetchClientes!(creds),
    driver.fetchContratos!(creds),
    driver.fetchFibra!(creds),
  ]);

  console.log(`[IXC] radusuarios: ${rads.length}, clientes: ${clientes.length}, contratos: ${contratos.length}, fibra: ${fibra.length}`);

  // Maps
  const clientesById = new Map(clientes.map((c) => [c.id, c]));
  const contratosById = new Map(contratos.map((ct) => [ct.id, ct]));
  const fibraByIdLogin = new Map(fibra.map((f) => [f.id_login, f]));

  const results: ErpClient[] = [];

  for (const rad of rads) {
    const cliente = clientesById.get(rad.id_cliente);
    const contrato = rad.id_contrato ? contratosById.get(rad.id_contrato) : null;
    const fibraRec = fibraByIdLogin.get(rad.id);

    // Apenas radusuarios com contrato ativo (contratos já vem filtrados status='A')
    if (!contrato) continue;

    results.push({
      erp_id: rad.id,
      contrato_id: contrato.id,
      cliente_erp_id: rad.id_cliente,
      provider: "ixc",
      provider_name: providerName,
      nome: cliente?.nome || "",
      cpf_cnpj: cliente?.cpf_cnpj || "",
      data_vencimento: contrato.dia_vencimento ? `Dia ${contrato.dia_vencimento}` : null,
      plano: contrato.plano,
      login: rad.login || null,
      status_internet: normalizeInternetStatus(contrato.status_internet, "ixc"),
      conectado: rad.online === "S",
      signal_db: fibraRec?.sinal_rx ?? null,
      signal_quality: classifySignalDb(fibraRec?.sinal_rx ?? null),
      field_availability: {
        signal_db: true,
        login: true,
        plano: true,
        contrato: true,
      },
    });
  }

  console.log(`[IXC] Total records (radius-centric, contrato ativo): ${results.length}`);
  return results;
}

// ── Composição: SGP / MK (simples) ──

async function composeSimpleClients(
  creds: ErpCredentials,
  provider: ErpProvider,
  providerName: string,
  driver: import("./erp-types.ts").ErpProviderDriver
): Promise<ErpClient[]> {
  if (!driver.fetchClientes) return [];
  const clientes = await driver.fetchClientes(creds);
  const supported = driver.supportedFields();

  return clientes.map((c) => ({
    erp_id: c.id,
    contrato_id: c.id,
    cliente_erp_id: c.id,
    provider,
    provider_name: providerName,
    nome: c.nome,
    cpf_cnpj: c.cpf_cnpj,
    data_vencimento: null,
    plano: null,
    login: null,
    status_internet: "ativo" as InternetStatus,
    conectado: false,
    signal_db: null,
    signal_quality: classifySignalDb(null),
    field_availability: {
      signal_db: supported.includes("signal_db"),
      login: supported.includes("login"),
      plano: supported.includes("plano"),
      contrato: false,
    },
  }));
}

// ── Métodos Públicos ──

/**
 * Busca clientes de TODOS os ERPs ativos do ISP.
 */
export async function fetchAllClients(
  supabaseAdmin: SupabaseClient,
  ispId: string,
  encryptionKey: string
): Promise<FetchResult> {
  const configs = await resolveActiveConfigs(supabaseAdmin, ispId);
  if (configs.length === 0) return { clients: [], errors: [] };

  const result: FetchResult = { clients: [], errors: [] };

  const promises = configs.map(async (config) => {
    try {
      const providerKey = config.provider as ErpProvider;
      const providerName = PROVIDER_DISPLAY_NAMES[providerKey] || config.display_name || config.provider;
      const driver = getProvider(providerKey);
      const creds = await resolveCredentials(config, encryptionKey);

      const clients = providerKey === "ixc"
        ? await composeIxcClients(creds, providerName, driver)
        : await composeSimpleClients(creds, providerKey, providerName, driver);

      return { clients, error: null, provider: providerName };
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
 * Busca faturas em aberto de um cliente por CPF/CNPJ.
 */
export async function fetchInvoices(
  supabaseAdmin: SupabaseClient,
  ispId: string,
  encryptionKey: string,
  cpfCnpj: string
): Promise<{ invoices: ErpInvoice[]; errors: string[] }> {
  const configs = await resolveActiveConfigs(supabaseAdmin, ispId);
  if (configs.length === 0) return { invoices: [], errors: [] };

  const allInvoices: ErpInvoice[] = [];
  const allErrors: string[] = [];
  const today = new Date();

  const promises = configs.map(async (config) => {
    try {
      const providerKey = config.provider as ErpProvider;
      const providerName = PROVIDER_DISPLAY_NAMES[providerKey] || config.display_name || config.provider;
      const driver = getProvider(providerKey);
      const creds = await resolveCredentials(config, encryptionKey);

      if (!driver.fetchFaturas) {
        console.log(`[${providerKey}] fetchFaturas não implementado`);
        return { invoices: [] as ErpInvoice[], error: null };
      }

      const rawFaturas = await driver.fetchFaturas(creds, { cpf_cnpj: cpfCnpj });

      const invoices: ErpInvoice[] = rawFaturas.map((f) => {
        const vencimento = new Date(f.data_vencimento);
        const diffMs = today.getTime() - vencimento.getTime();
        const diasAtraso = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

        return {
          provider: providerKey,
          provider_name: providerName,
          id: f.id,
          id_cliente: f.id_cliente,
          data_vencimento: f.data_vencimento,
          valor: f.valor,
          valor_pago: f.valor_pago,
          dias_atraso: diasAtraso,
          linha_digitavel: f.linha_digitavel,
          gateway_link: f.gateway_link,
        };
      });

      return { invoices, error: null };
    } catch (err) {
      console.error(`[${config.provider}] fetchInvoices error:`, err);
      return {
        invoices: [] as ErpInvoice[],
        error: `${config.display_name || config.provider}: ${err instanceof Error ? err.message : "Erro desconhecido"}`,
      };
    }
  });

  const results = await Promise.all(promises);
  for (const r of results) {
    allInvoices.push(...r.invoices);
    if (r.error) allErrors.push(r.error);
  }

  return { invoices: allInvoices, errors: allErrors };
}

/**
 * Busca contratos detalhados de um cliente por ID (com endereço).
 */
export interface ContractResult {
  contrato_id: string;
  endereco_completo: string | null;
  plano: string | null;
  status_internet: string;
  dia_vencimento: string | null;
  provider_name: string;
}

export async function fetchClientContracts(
  supabaseAdmin: SupabaseClient,
  ispId: string,
  encryptionKey: string,
  clientId: string
): Promise<{ contracts: ContractResult[]; errors: string[] }> {
  const configs = await resolveActiveConfigs(supabaseAdmin, ispId);
  if (configs.length === 0) return { contracts: [], errors: [] };

  const allContracts: ContractResult[] = [];
  const allErrors: string[] = [];

  const promises = configs.map(async (config) => {
    try {
      const providerKey = config.provider as ErpProvider;
      const providerName = PROVIDER_DISPLAY_NAMES[providerKey] || config.display_name || config.provider;
      const driver = getProvider(providerKey);
      const creds = await resolveCredentials(config, encryptionKey);

      let detalhados: RawContratoDetalhado[] = [];

      if (driver.fetchContratosDetalhados) {
        detalhados = await driver.fetchContratosDetalhados(creds, { id_cliente: clientId });
      } else if (driver.fetchContratos) {
        const simples = await driver.fetchContratos(creds, { id_cliente: clientId });
        detalhados = simples.map((c) => ({
          ...c,
          endereco: null,
          numero: null,
          bairro: null,
          cidade: null,
          estado: null,
          cep: null,
          complemento: null,
        }));
      }

      const contracts: ContractResult[] = detalhados.map((ct) => {
        const parts = [ct.endereco, ct.numero, ct.complemento, ct.bairro, ct.cidade, ct.estado, ct.cep].filter(Boolean);
        const endereco = parts.length > 0 ? parts.join(", ") : null;

        return {
          contrato_id: ct.id,
          endereco_completo: endereco,
          plano: ct.plano,
          status_internet: normalizeInternetStatus(ct.status_internet, providerKey),
          dia_vencimento: ct.dia_vencimento,
          provider_name: providerName,
        };
      });

      return { contracts, error: null };
    } catch (err) {
      console.error(`[${config.provider}] fetchClientContracts error:`, err);
      return {
        contracts: [] as ContractResult[],
        error: `${config.display_name || config.provider}: ${err instanceof Error ? err.message : "Erro desconhecido"}`,
      };
    }
  });

  const results = await Promise.all(promises);
  for (const r of results) {
    allContracts.push(...r.contracts);
    if (r.error) allErrors.push(r.error);
  }

  return { contracts: allContracts, errors: allErrors };
}

/**
 * Testa conexão com um provider específico.
 */
export async function testConnection(
  provider: ErpProvider,
  credentials: ErpCredentials
) {
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

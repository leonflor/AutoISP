// ═══ CAMADA 2 — Driver / Orquestrador ERP ═══
// Resolve credenciais, chama providers (Camada 3), aplica field-maps,
// retorna Response Models prontos para a IA.

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { classifySignalDb } from "./onu-signal-analyzer.ts";
import { getProvider } from "./erp-providers/index.ts";
import type {
  ErpProvider,
  ErpClient,
  ErpCredentials,
  InternetStatus,
} from "./erp-types.ts";
import { PROVIDER_DISPLAY_NAMES } from "./erp-types.ts";
import { mapCliente, mapContrato, mapFatura, mapRadusuario, mapFibra } from "./field-maps.ts";
import type { ClienteResponse, ContratoResponse, FaturaResponse, PixResponse, BoletoResponse, BoletoSmsResponse, ToolEnvelope } from "./response-models.ts";

// ══════════════════════════════════════════════════════════════
// ── Decrypt Helper ──
// ══════════════════════════════════════════════════════════════

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

// ══════════════════════════════════════════════════════════════
// ── Resolução de Credenciais ──
// ══════════════════════════════════════════════════════════════

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

// ══════════════════════════════════════════════════════════════
// ── Normalização de status_internet (Camada 2) ──
// ══════════════════════════════════════════════════════════════

const IXC_INTERNET_STATUS_MAP: Record<string, InternetStatus> = {
  normal: "ativo",
  ativo: "ativo",
  ativado: "ativo",
  a: "ativo",
  bloqueado: "bloqueado",
  bloqueio_manual: "bloqueado",
  bloqueio_automatico: "bloqueado",
  reduzido: "financeiro_em_atraso",
  pendente_reativa: "bloqueado",
  desativado: "bloqueado",
  cancelado: "bloqueado",
  ca: "bloqueado",
  suspenso: "bloqueado",
};

function normalizeInternetStatus(rawStatus: string, _provider: ErpProvider): InternetStatus {
  const key = rawStatus.toLowerCase().trim();
  const mapped = IXC_INTERNET_STATUS_MAP[key];
  if (!mapped) {
    console.warn(`[normalizeInternetStatus] Status não mapeado: "${rawStatus}" (key: "${key}")`);
  }
  return mapped || "outros";
}

// ══════════════════════════════════════════════════════════════
// ── Resolver configs ativos do ISP ──
// ══════════════════════════════════════════════════════════════

async function resolveActiveConfigs(supabaseAdmin: SupabaseClient, ispId: string) {
  const { data: configs } = await supabaseAdmin
    .from("erp_configs")
    .select("*")
    .eq("isp_id", ispId)
    .eq("is_active", true)
    .eq("is_connected", true);

  return configs || [];
}

// ══════════════════════════════════════════════════════════════
// ── Sanitização de endereço ──
// ══════════════════════════════════════════════════════════════

function buildEnderecoCompleto(raw: { endereco: string | null; numero: string | null; complemento: string | null; bairro: string | null }): string | null {
  const end = raw.endereco ? String(raw.endereco).trim().replace(/,\s*$/, "") : null;
  const num = raw.numero ? String(raw.numero).trim() : null;
  const cleanNum = (num && num !== "" && num !== "0" && num !== "SN") ? num : null;
  const comp = raw.complemento ? String(raw.complemento).trim() : null;
  const bairro = raw.bairro ? String(raw.bairro).trim() : null;

  const partes = [
    end,
    cleanNum,
    comp,
    bairro,
  ].filter(p => p && p !== "" && p !== "0");

  return partes.length > 0 ? partes.join(", ") : null;
}

// ══════════════════════════════════════════════════════════════
// ── TOOL: buscarCliente (erp_client_lookup) ──
// ══════════════════════════════════════════════════════════════

export async function buscarCliente(
  supabaseAdmin: SupabaseClient,
  ispId: string,
  encryptionKey: string,
  cpfCnpj: string
): Promise<ToolEnvelope<ClienteResponse>> {
  const configs = await resolveActiveConfigs(supabaseAdmin, ispId);
  const erros: string[] = [];
  const itens: ClienteResponse[] = [];
  const cleanCpf = cpfCnpj.replace(/[\.\-\/]/g, "");

  for (const config of configs) {
    try {
      const providerKey = config.provider as ErpProvider;
      const providerName = PROVIDER_DISPLAY_NAMES[providerKey] || config.display_name || config.provider;
      const driver = getProvider(providerKey);
      const creds = await resolveCredentials(config, encryptionKey);

      if (!driver.fetchClientes) continue;

      const rawClientes = await driver.fetchClientes(creds, { cpf_cnpj: cpfCnpj });

      for (const raw of rawClientes) {
        const mapped = mapCliente[providerKey](raw);
        const docClean = String(mapped.cpf_cnpj || "").replace(/[\.\-\/]/g, "");
        if (docClean === cleanCpf) {
          itens.push({
            id: mapped.id,
            nome: mapped.nome,
            cpf_cnpj: mapped.cpf_cnpj,
            provider: providerKey,
            erp: providerName,
          });
        }
      }
    } catch (err) {
      erros.push(`${config.display_name || config.provider}: ${err instanceof Error ? err.message : "Erro desconhecido"}`);
    }
  }

  return {
    encontrados: itens.length,
    itens,
    mensagem: itens.length === 0 ? "Nenhum cliente encontrado com este CPF/CNPJ." : undefined,
    erros,
  };
}

// ══════════════════════════════════════════════════════════════
// ── TOOL: buscarContratos (erp_contract_lookup) ──
// ══════════════════════════════════════════════════════════════

export async function buscarContratos(
  supabaseAdmin: SupabaseClient,
  ispId: string,
  encryptionKey: string,
  cpfCnpj: string
): Promise<ToolEnvelope<ContratoResponse>> {
  const erros: string[] = [];
  const itens: ContratoResponse[] = [];

  // Passo 1: resolver clientes via buscarCliente
  const clienteResult = await buscarCliente(supabaseAdmin, ispId, encryptionKey, cpfCnpj);
  erros.push(...clienteResult.erros);

  if (clienteResult.itens.length === 0) {
    return {
      encontrados: 0,
      itens,
      mensagem: "Nenhum cliente encontrado com este CPF/CNPJ.",
      erros,
    };
  }

  // Passo 2: para cada cliente, buscar contratos usando id + provider
  for (const cli of clienteResult.itens) {
    try {
      const providerKey = cli.provider as ErpProvider;
      const driver = getProvider(providerKey);
      if (!driver.fetchContratos) continue;

      // Resolver credenciais para este provider
      const configs = await resolveActiveConfigs(supabaseAdmin, ispId);
      const config = configs.find(c => c.provider === providerKey);
      if (!config) continue;

      const creds = await resolveCredentials(config, encryptionKey);
      const rawContratos = await driver.fetchContratos(creds, { id_cliente: cli.id });

      for (const raw of rawContratos) {
        const mapped = mapContrato[providerKey](raw);
        const endCompleto = buildEnderecoCompleto(mapped);
        const cleanNumero = mapped.numero && mapped.numero !== "0" && mapped.numero !== "SN"
          ? mapped.numero : null;

        itens.push({
          opcao: 0,
          ordem: 0,
          contrato_id: mapped.id,
          endereco: mapped.endereco ? String(mapped.endereco).trim().replace(/,\s*$/, "") : null,
          numero: cleanNumero,
          complemento: mapped.complemento ? String(mapped.complemento).trim() : null,
          bairro: mapped.bairro ? String(mapped.bairro).trim() : null,
          endereco_completo: endCompleto,
          plano: mapped.plano,
          status: normalizeInternetStatus(mapped.status_internet, providerKey),
          dia_vencimento: mapped.dia_vencimento,
          erp: cli.erp,
        });
      }
    } catch (err) {
      erros.push(`${cli.erp}: ${err instanceof Error ? err.message : "Erro desconhecido"}`);
    }
  }

  // Numerar sequencialmente
  itens.forEach((c, i) => {
    c.opcao = i + 1;
    c.ordem = i + 1;
  });

  return {
    encontrados: itens.length,
    itens,
    mensagem: itens.length === 0 ? "Nenhum contrato encontrado para este cliente." : undefined,
    erros,
  };
}

// ══════════════════════════════════════════════════════════════
// ── TOOL: buscarFaturas (erp_invoice_search) ──
// ══════════════════════════════════════════════════════════════

export async function buscarFaturas(
  supabaseAdmin: SupabaseClient,
  ispId: string,
  encryptionKey: string,
  cpfCnpj: string,
  endereco?: string,
  contratoId?: string
): Promise<ToolEnvelope<FaturaResponse>> {
  const configs = await resolveActiveConfigs(supabaseAdmin, ispId);
  if (configs.length === 0) return { encontrados: 0, itens: [], erros: [] };

  const itens: FaturaResponse[] = [];
  const erros: string[] = [];
  const today = new Date();
  const cleanCpf = cpfCnpj.replace(/[\.\-\/]/g, "");

  // Filtro por contrato: contrato_id tem prioridade sobre endereco
  let allowedContratoIds: Set<string> | null = null;
  let contratoEnderecoMap: Map<string, string> = new Map();

  if (contratoId) {
    // Filtro direto por ID do contrato — sem necessidade de resolver por endereço
    allowedContratoIds = new Set([contratoId]);
  } else if (endereco) {
    const contratosResult = await buscarContratos(supabaseAdmin, ispId, encryptionKey, cpfCnpj);
    const enderecoLower = endereco.toLowerCase();
    allowedContratoIds = new Set();

    for (const ct of contratosResult.itens) {
      if (ct.endereco_completo && ct.endereco_completo.toLowerCase().includes(enderecoLower)) {
        allowedContratoIds.add(ct.contrato_id);
        contratoEnderecoMap.set(ct.contrato_id, ct.endereco_completo);
      }
    }

    if (allowedContratoIds.size === 0) {
      return { encontrados: 0, itens: [], erros: [`Nenhum contrato encontrado com endereço "${endereco}"`] };
    }
  }

  const promises = configs.map(async (config) => {
    try {
      const providerKey = config.provider as ErpProvider;
      const providerName = PROVIDER_DISPLAY_NAMES[providerKey] || config.display_name || config.provider;
      const driver = getProvider(providerKey);
      const creds = await resolveCredentials(config, encryptionKey);

      if (!driver.fetchFaturas || !driver.fetchClientes) return { faturas: [] as FaturaResponse[], error: null };

      // Passo 1: resolver cliente
      const rawClientes = await driver.fetchClientes(creds, { cpf_cnpj: cpfCnpj });
      let clienteId: string | null = null;

      for (const raw of rawClientes) {
        const mapped = mapCliente[providerKey](raw);
        const docClean = String(mapped.cpf_cnpj || "").replace(/[\.\-\/]/g, "");
        if (docClean === cleanCpf) {
          clienteId = mapped.id;
          break;
        }
      }

      if (!clienteId) return { faturas: [] as FaturaResponse[], error: null };

      // Passo 2: buscar contratos
      let contratoIds: string[] = [];
      if (driver.fetchContratos) {
        const rawContratos = await driver.fetchContratos(creds, { id_cliente: clienteId });
        contratoIds = rawContratos.map((r: any) => mapContrato[providerKey](r).id);
      }

      if (contratoIds.length === 0) return { faturas: [] as FaturaResponse[], error: null };

      // Passo 3: buscar faturas por contrato
      const faturas: FaturaResponse[] = [];

      for (const contratoId of contratoIds) {
        if (allowedContratoIds && !allowedContratoIds.has(contratoId)) continue;

        const rawFaturas = await driver.fetchFaturas(creds, { id_contrato: contratoId });

        for (const raw of rawFaturas) {
          const mapped = mapFatura(providerKey, raw, { id_cliente: clienteId, id_contrato: contratoId });
          const vencimento = new Date(mapped.data_vencimento);
          const diffMs = today.getTime() - vencimento.getTime();
          const diasAtraso = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

          faturas.push({
            id: mapped.id,
            contrato_id: contratoId,
            endereco: contratoEnderecoMap.get(contratoId) || null,
            valor: mapped.valor,
            vencimento: mapped.data_vencimento,
            dias_atraso: diasAtraso,
            linha_digitavel: mapped.linha_digitavel,
            erp: providerName,
          });
        }
      }

      return { faturas, error: null };
    } catch (err) {
      return {
        faturas: [] as FaturaResponse[],
        error: `${config.display_name || config.provider}: ${err instanceof Error ? err.message : "Erro desconhecido"}`,
      };
    }
  });

  const results = await Promise.all(promises);
  for (const r of results) {
    itens.push(...r.faturas);
    if (r.error) erros.push(r.error);
  }

  const totalAberto = itens.reduce((sum, f) => sum + f.valor, 0);

  return {
    encontrados: itens.length,
    itens,
    mensagem: itens.length === 0
      ? (endereco ? `Nenhuma fatura em aberto para o endereço "${endereco}".` : "Nenhuma fatura em aberto encontrada.")
      : `${itens.length} fatura(s) em aberto, total R$ ${totalAberto.toFixed(2)}`,
    erros,
  };
}

// ══════════════════════════════════════════════════════════════
// ── TOOL: buscarPix (erp_pix_lookup) ──
// ══════════════════════════════════════════════════════════════

export async function buscarPix(
  supabaseAdmin: SupabaseClient,
  ispId: string,
  encryptionKey: string,
  faturaId: string
): Promise<ToolEnvelope<PixResponse>> {
  const configs = await resolveActiveConfigs(supabaseAdmin, ispId);
  const erros: string[] = [];
  const itens: PixResponse[] = [];

  for (const config of configs) {
    try {
      const providerKey = config.provider as ErpProvider;
      const providerName = PROVIDER_DISPLAY_NAMES[providerKey] || config.display_name || config.provider;
      const driver = getProvider(providerKey);
      if (!driver.fetchPix) continue;

      const creds = await resolveCredentials(config, encryptionKey);
      const raw = await driver.fetchPix(creds, faturaId);

      if (raw?.type === "success" || raw?.pix) {
        const pixData = raw.pix || {};
        const qrCode = pixData.qrCode || {};
        const dadosPix = pixData.dadosPix || {};

        // Detectar expiração
        let expirado = false;
        if (dadosPix.expiracaoPix) {
          const expStr = String(dadosPix.expiracaoPix);
          // Formato IXC: DD/MM/YYYY HH:mm:ss
          const parts = expStr.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/);
          if (parts) {
            const expDate = new Date(
              parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]),
              parseInt(parts[4]), parseInt(parts[5]), parseInt(parts[6])
            );
            expirado = expDate.getTime() < Date.now();
          }
        }

        const qrcodeText = qrCode.qrcode && String(qrCode.qrcode).trim() !== "" ? String(qrCode.qrcode) : null;

        itens.push({
          fatura_id: faturaId,
          qrcode: qrcodeText,
          qrcode_imagem: qrCode.imagemSrc || null,
          gateway: raw.gateway?.gatewayNome || null,
          expirado: expirado || !qrcodeText,
          erp: providerName,
        });
      } else {
        erros.push(`${providerName}: PIX não disponível para esta fatura`);
      }
    } catch (err) {
      erros.push(`${config.display_name || config.provider}: ${err instanceof Error ? err.message : "Erro desconhecido"}`);
    }
  }

  return {
    encontrados: itens.length,
    itens,
    mensagem: itens.length === 0
      ? "PIX não disponível para esta fatura."
      : (itens[0].expirado ? "PIX expirado — utilize linha digitável ou boleto." : undefined),
    erros,
  };
}

// ══════════════════════════════════════════════════════════════
// ── TOOL: buscarBoleto (erp_boleto_lookup) ──
// ══════════════════════════════════════════════════════════════

export async function buscarBoleto(
  supabaseAdmin: SupabaseClient,
  ispId: string,
  encryptionKey: string,
  faturaId: string
): Promise<ToolEnvelope<BoletoResponse>> {
  const configs = await resolveActiveConfigs(supabaseAdmin, ispId);
  const erros: string[] = [];
  const itens: BoletoResponse[] = [];

  for (const config of configs) {
    try {
      const providerKey = config.provider as ErpProvider;
      const providerName = PROVIDER_DISPLAY_NAMES[providerKey] || config.display_name || config.provider;
      const driver = getProvider(providerKey);
      if (!driver.fetchBoleto) continue;

      const creds = await resolveCredentials(config, encryptionKey);
      const raw = await driver.fetchBoleto(creds, faturaId);

      // raw é base64 do PDF ou objeto com conteúdo
      let base64Content: string | null = null;

      if (typeof raw === "string") {
        base64Content = raw;
      } else if (raw?.ContentType?.includes("pdf") || raw?.content) {
        base64Content = raw.content || raw.base64 || null;
      } else if (typeof raw === "object") {
        // IXC pode retornar o base64 diretamente na resposta
        const str = JSON.stringify(raw);
        // Se a resposta contiver dados binários codificados
        if (raw.type === "success" && raw.base64) {
          base64Content = raw.base64;
        } else {
          // Tentar extrair base64 bruto (IXC retorna PDF direto)
          base64Content = str.length > 1000 ? null : null;
        }
      }

      if (base64Content) {
        // Decode e upload para Storage
        try {
          const binaryStr = atob(base64Content);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }

          const storagePath = `${ispId}/${faturaId}.pdf`;
          await supabaseAdmin.storage
            .from("invoices")
            .upload(storagePath, bytes, {
              contentType: "application/pdf",
              upsert: true,
            });

          const { data: signedData } = await supabaseAdmin.storage
            .from("invoices")
            .createSignedUrl(storagePath, 3600); // 1h

          itens.push({
            fatura_id: faturaId,
            boleto_url: signedData?.signedUrl || null,
            erp: providerName,
          });
        } catch (uploadErr) {
          erros.push(`${providerName}: Erro ao processar PDF — ${uploadErr instanceof Error ? uploadErr.message : "desconhecido"}`);
        }
      } else {
        erros.push(`${providerName}: Boleto PDF não disponível para esta fatura`);
      }
    } catch (err) {
      erros.push(`${config.display_name || config.provider}: ${err instanceof Error ? err.message : "Erro desconhecido"}`);
    }
  }

  return {
    encontrados: itens.length,
    itens,
    mensagem: itens.length === 0 ? "Boleto PDF não disponível para esta fatura." : undefined,
    erros,
  };
}

// ══════════════════════════════════════════════════════════════
// ── Funções de monitoramento em massa (usadas pelo frontend, NÃO pela IA)
// ══════════════════════════════════════════════════════════════

interface FetchResult {
  clients: ErpClient[];
  errors: { provider: string; message: string }[];
}

async function composeIxcClients(
  creds: ErpCredentials,
  providerName: string,
  driver: import("./erp-types.ts").ErpProviderDriver
): Promise<ErpClient[]> {
  const [rawRads, rawClientes, rawContratos, rawFibra] = await Promise.all([
    driver.fetchRadusuarios!(creds),
    driver.fetchClientes!(creds),
    driver.fetchContratos!(creds),
    driver.fetchFibra!(creds),
  ]);

  const rads = rawRads.map((r: any) => mapRadusuario.ixc(r));
  const clientes = rawClientes.map((r: any) => mapCliente.ixc(r));
  const contratos = rawContratos.map((r: any) => mapContrato.ixc(r));
  const fibra = rawFibra.map((r: any) => mapFibra.ixc(r));

  console.log(`[IXC] radusuarios: ${rads.length}, clientes: ${clientes.length}, contratos: ${contratos.length}, fibra: ${fibra.length}`);

  const clientesById = new Map(clientes.map((c) => [c.id, c]));
  const contratosById = new Map(contratos.map((ct) => [ct.id, ct]));
  const fibraByIdLogin = new Map(fibra.map((f) => [f.id_login, f]));

  // Deduplicar radusuarios por contrato_id: priorizar online='S'
  const bestRadByContrato = new Map<string, typeof rads[0]>();

  for (const rad of rads) {
    const contratoId = rad.id_contrato;
    if (!contratoId || !contratosById.has(contratoId)) continue;

    const existing = bestRadByContrato.get(contratoId);
    if (!existing) {
      bestRadByContrato.set(contratoId, rad);
    } else {
      // Prioridade: online='S' > online='N' > outros
      const priority = (r: typeof rad) => r.online === "S" ? 2 : r.online === "N" ? 1 : 0;
      if (priority(rad) > priority(existing)) {
        bestRadByContrato.set(contratoId, rad);
      }
    }
  }

  const results: ErpClient[] = [];

  for (const [contratoId, rad] of bestRadByContrato) {
    const cliente = clientesById.get(rad.id_cliente);
    const contrato = contratosById.get(contratoId)!;
    const fibraRec = fibraByIdLogin.get(rad.id);

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
      online_raw: rad.online || null,
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

  console.log(`[IXC] Total records (dedup by contrato, ${rads.length} rads → ${results.length} unique): ${results.length}`);
  return results;
}

async function composeSimpleClients(
  creds: ErpCredentials,
  provider: ErpProvider,
  providerName: string,
  driver: import("./erp-types.ts").ErpProviderDriver
): Promise<ErpClient[]> {
  if (!driver.fetchClientes) return [];
  const rawClientes = await driver.fetchClientes(creds);
  const supported = driver.supportedFields();

  return rawClientes.map((r: any) => {
    const mapped = mapCliente[provider](r);
    return {
      erp_id: mapped.id,
      contrato_id: mapped.id,
      cliente_erp_id: mapped.id,
      provider,
      provider_name: providerName,
      nome: mapped.nome,
      cpf_cnpj: mapped.cpf_cnpj,
      data_vencimento: null,
      plano: null,
      login: null,
      status_internet: "ativo" as InternetStatus,
      conectado: false,
      online_raw: null,
      signal_db: null,
      signal_quality: classifySignalDb(null),
      field_availability: {
        signal_db: supported.includes("signal_db"),
        login: supported.includes("login"),
        plano: supported.includes("plano"),
        contrato: false,
      },
    };
  });
}

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
) {
  const driver = getProvider(provider);
  return driver.testConnection(credentials);
}

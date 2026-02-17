import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { searchErpClient, decrypt } from "./erp-fetcher.ts";
import { analyzeOnuSignal, formatSignalReport } from "./onu-signal-analyzer.ts";

export interface ToolExecutionContext {
  supabaseAdmin: SupabaseClient;
  ispId: string;
  encryptionKey: string;
}

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

type ToolHandler = (
  ctx: ToolExecutionContext,
  args: Record<string, unknown>,
  config?: Record<string, unknown>
) => Promise<ToolResult>;

// ── Handler: erp_search ──
const erpSearchHandler: ToolHandler = async (ctx, args) => {
  const query = String(args.busca || args.query || args.cpf || args.nome || "");
  if (!query || query.length < 2) {
    return { success: false, error: "Informe ao menos 2 caracteres para busca" };
  }

  try {
    const result = await searchErpClient(
      ctx.supabaseAdmin,
      ctx.ispId,
      ctx.encryptionKey,
      query
    );

    if (result.clients.length === 0) {
      return {
        success: true,
        data: {
          encontrados: 0,
          mensagem: "Nenhum cliente encontrado com esse dado.",
          erros: result.errors,
        },
      };
    }

    return {
      success: true,
      data: {
        encontrados: result.clients.length,
        clientes: result.clients.slice(0, 10).map((c) => ({
          nome: c.nome,
          cpf_cnpj: c.cpf_cnpj,
          plano: c.plano,
          status: c.status_contrato,
          conectado: c.conectado,
          vencimento: c.data_vencimento,
          erp: c.provider_name,
          signal_db: c.signal_db,
          signal_quality: c.signal_quality,
        })),
        erros: result.errors,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: `Erro ao buscar no ERP: ${err instanceof Error ? err.message : "desconhecido"}`,
    };
  }
};

// ── Handler: erp_invoice_search ──
const erpInvoiceSearchHandler: ToolHandler = async (_ctx, args) => {
  const clienteId = String(args.cliente_id || "");
  if (!clienteId) {
    return { success: false, error: "Informe o CPF/CNPJ ou ID do cliente" };
  }

  // Mock — pronto para integração futura com ERPs reais
  return {
    success: true,
    data: {
      cliente_id: clienteId,
      faturas: [
        { numero: "FAT-2026-001", valor: 129.90, vencimento: "2026-01-15", status: "vencida", dias_atraso: 23 },
        { numero: "FAT-2026-002", valor: 129.90, vencimento: "2026-02-15", status: "aberta", dias_atraso: 0 },
      ],
      total_aberto: 259.80,
      mensagem: "Dados simulados para teste. Integrar com API do ERP para dados reais.",
    },
  };
};

// ── Handler: onu_diagnostics ──
const onuDiagnosticsHandler: ToolHandler = async (ctx, args) => {
  const clientId = String(args.client_id || args.cliente_id || args.id || "");
  if (!clientId) {
    return { success: false, error: "Informe o ID do cliente no ERP (client_id)" };
  }

  try {
    // Get IXC config for this ISP
    const { data: config } = await ctx.supabaseAdmin
      .from("erp_configs")
      .select("*")
      .eq("isp_id", ctx.ispId)
      .eq("provider", "ixc")
      .eq("is_active", true)
      .eq("is_connected", true)
      .single();

    if (!config) {
      return { success: false, error: "Nenhuma integração IXC ativa encontrada" };
    }

    let decryptedPassword = "";
    if (config.password_encrypted && config.encryption_iv) {
      decryptedPassword = await decrypt(config.password_encrypted, config.encryption_iv, ctx.encryptionKey);
    }

    let baseUrl = (config.api_url || "").replace(/\/+$/, "");
    if (baseUrl.endsWith("/webservice/v1")) {
      baseUrl = baseUrl.slice(0, -"/webservice/v1".length);
    }

    const token = btoa(`${config.username || ""}:${decryptedPassword}`);

    const signalResp = await fetch(`${baseUrl}/webservice/v1/botao_rel_22991`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${token}`,
        ixcsoft: "listar",
      },
      body: JSON.stringify({
        qtype: "botao_rel_22991.id_cliente",
        query: clientId,
        oper: "=",
        page: "1",
        rp: "1",
      }),
    });

    if (!signalResp.ok) {
      return { success: false, error: `IXC retornou HTTP ${signalResp.status}` };
    }

    const signalData = await signalResp.json();
    const record = signalData.registros?.[0] || signalData.data || null;

    const rxValue = record?.rx ? parseFloat(record.rx) : null;
    const txValue = record?.tx ? parseFloat(record.tx) : null;

    const result = analyzeOnuSignal({
      tx: txValue !== null && !isNaN(txValue) ? txValue : null,
      rx: rxValue !== null && !isNaN(rxValue) ? rxValue : null,
    });

    return {
      success: true,
      data: {
        cliente_id: clientId,
        diagnostico: result,
        relatorio: formatSignalReport(result),
      },
    };
  } catch (err) {
    return {
      success: false,
      error: `Erro ao diagnosticar sinal: ${err instanceof Error ? err.message : "desconhecido"}`,
    };
  }
};

// ── Registry ──
const handlers: Record<string, ToolHandler> = {
  erp_search: erpSearchHandler,
  erp_invoice_search: erpInvoiceSearchHandler,
  onu_diagnostics: onuDiagnosticsHandler,
};

/**
 * Execute a tool by handler_type. Returns the result as JSON-serializable object.
 */
export async function executeToolHandler(
  handlerType: string,
  ctx: ToolExecutionContext,
  args: Record<string, unknown>,
  config?: Record<string, unknown>
): Promise<ToolResult> {
  const handler = handlers[handlerType];
  if (!handler) {
    return { success: false, error: `Handler "${handlerType}" não registrado` };
  }
  return handler(ctx, args, config);
}

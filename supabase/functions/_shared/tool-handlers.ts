import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { fetchClientSignal, fetchInvoices } from "./erp-driver.ts";

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

// ── Handler: erp_invoice_search ──
const erpInvoiceSearchHandler: ToolHandler = async (ctx, args) => {
  const cpfCnpj = String(args.cliente_id || "");
  if (!cpfCnpj) {
    return { success: false, error: "Informe o CPF/CNPJ do cliente" };
  }

  try {
    const result = await fetchInvoices(ctx.supabaseAdmin, ctx.ispId, ctx.encryptionKey, cpfCnpj);

    if (result.invoices.length === 0) {
      return {
        success: true,
        data: {
          encontrados: 0,
          mensagem: "Nenhuma fatura em aberto encontrada para este cliente.",
          erros: result.errors,
        },
      };
    }

    const totalAberto = result.invoices.reduce((sum, f) => sum + f.valor, 0);

    return {
      success: true,
      data: {
        encontrados: result.invoices.length,
        total_aberto: totalAberto,
        faturas: result.invoices.map((f) => ({
          id: f.id,
          valor: f.valor,
          vencimento: f.data_vencimento,
          dias_atraso: f.dias_atraso,
          linha_digitavel: f.linha_digitavel,
          gateway_link: f.gateway_link,
          erp: f.provider_name,
        })),
        erros: result.errors,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: `Erro ao buscar faturas: ${err instanceof Error ? err.message : "desconhecido"}`,
    };
  }
};

// ── Handler: onu_diagnostics ──
const onuDiagnosticsHandler: ToolHandler = async (ctx, args) => {
  const clientId = String(args.client_id || args.cliente_id || args.id || "");
  if (!clientId) {
    return { success: false, error: "Informe o ID do cliente no ERP (client_id)" };
  }

  try {
    const result = await fetchClientSignal(ctx.supabaseAdmin, ctx.ispId, ctx.encryptionKey, clientId);

    return {
      success: true,
      data: {
        cliente_id: clientId,
        diagnostico: result.signal,
        relatorio: result.report,
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
  erp_invoice_search: erpInvoiceSearchHandler,
  onu_diagnostics: onuDiagnosticsHandler,
};

/**
 * Execute a tool by handler_type.
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

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { fetchClientSignal, fetchInvoices, searchClients, fetchClientContracts } from "./erp-driver.ts";

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

// ── Handler: erp_onu_diagnostics ──
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

// ── Handler: erp_client_lookup ──
const erpClientLookupHandler: ToolHandler = async (ctx, args) => {
  const cpfCnpj = String(args.cpf_cnpj || "").replace(/[\.\-\/]/g, "");
  if (!cpfCnpj || cpfCnpj.length < 11) {
    return { success: false, error: "Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido" };
  }

  try {
    const result = await searchClients(ctx.supabaseAdmin, ctx.ispId, ctx.encryptionKey, cpfCnpj);

    // Filter exact match by cleaned CPF/CNPJ
    const matched = result.clients.filter((c) => {
      const cleanDoc = String(c.cpf_cnpj || "").replace(/[\.\-\/]/g, "");
      return cleanDoc === cpfCnpj;
    });

    if (matched.length === 0) {
      return {
        success: true,
        data: {
          encontrados: 0,
          mensagem: "Nenhum cliente encontrado com este CPF/CNPJ.",
          erros: result.errors,
        },
      };
    }

    return {
      success: true,
      data: {
        encontrados: matched.length,
        clientes: matched.map((c) => ({
          cliente_erp_id: c.id,
          nome: c.nome,
          cpf_cnpj: c.cpf_cnpj,
          status_internet: c.status_internet,
          plano: c.plano,
          conectado: c.conectado,
          provider_name: c.provider_name,
        })),
        erros: result.errors,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: `Erro ao buscar cliente: ${err instanceof Error ? err.message : "desconhecido"}`,
    };
  }
};

// ── Handler: erp_contract_lookup ──
const erpContractLookupHandler: ToolHandler = async (ctx, args) => {
  const clientId = String(args.client_id || "");
  if (!clientId) {
    return { success: false, error: "Informe o ID do cliente no ERP (client_id)" };
  }

  try {
    const result = await fetchClientContracts(ctx.supabaseAdmin, ctx.ispId, ctx.encryptionKey, clientId);

    if (result.contracts.length === 0) {
      return {
        success: true,
        data: {
          encontrados: 0,
          mensagem: "Nenhum contrato ativo encontrado para este cliente.",
          erros: result.errors,
        },
      };
    }

    return {
      success: true,
      data: {
        encontrados: result.contracts.length,
        contratos: result.contracts.map((c) => ({
          contrato_id: c.contrato_id,
          endereco_completo: c.endereco_completo,
          plano: c.plano,
          status_internet: c.status_internet,
          dia_vencimento: c.dia_vencimento,
          provider_name: c.provider_name,
        })),
        erros: result.errors,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: `Erro ao buscar contratos: ${err instanceof Error ? err.message : "desconhecido"}`,
    };
  }
};

// ── Registry ──
const handlers: Record<string, ToolHandler> = {
  erp_invoice_search: erpInvoiceSearchHandler,
  erp_onu_diagnostics: onuDiagnosticsHandler,
  erp_client_lookup: erpClientLookupHandler,
  erp_contract_lookup: erpContractLookupHandler,
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

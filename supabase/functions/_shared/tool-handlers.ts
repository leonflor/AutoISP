// ═══ CAMADA 1 — Tool Handlers ═══
// Valida input, chama Driver (Camada 2), retorna ToolResult com envelope padronizado.

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buscarCliente, buscarContratos, buscarFaturas } from "./erp-driver.ts";

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

// ── Validação comum ──

function validateCpfCnpj(raw: unknown): string | null {
  const digits = String(raw || "").replace(/\D/g, "");
  return digits.length >= 11 ? String(raw) : null;
}

// ── Handler: erp_client_lookup ──

const erpClientLookupHandler: ToolHandler = async (ctx, args) => {
  const cpf = validateCpfCnpj(args.cpf_cnpj);
  if (!cpf) return { success: false, error: "Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido" };

  const result = await buscarCliente(ctx.supabaseAdmin, ctx.ispId, ctx.encryptionKey, cpf);

  return { success: true, data: result };
};

// ── Handler: erp_contract_lookup ──

const erpContractLookupHandler: ToolHandler = async (ctx, args) => {
  const cpf = validateCpfCnpj(args.cpf_cnpj);
  if (!cpf) return { success: false, error: "Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido" };

  const result = await buscarContratos(ctx.supabaseAdmin, ctx.ispId, ctx.encryptionKey, cpf);

  return { success: true, data: result };
};

// ── Handler: erp_invoice_search ──

const erpInvoiceSearchHandler: ToolHandler = async (ctx, args) => {
  const cpf = validateCpfCnpj(args.cpf_cnpj);
  if (!cpf) return { success: false, error: "Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido" };

  const endereco = args.endereco ? String(args.endereco) : undefined;
  const result = await buscarFaturas(ctx.supabaseAdmin, ctx.ispId, ctx.encryptionKey, cpf, endereco);

  return { success: true, data: result };
};

// ── Registry ──

const handlers: Record<string, ToolHandler> = {
  erp_client_lookup: erpClientLookupHandler,
  erp_contract_lookup: erpContractLookupHandler,
  erp_invoice_search: erpInvoiceSearchHandler,
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

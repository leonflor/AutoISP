import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { searchErpClient } from "./erp-fetcher.ts";

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

// ── Registry ──
const handlers: Record<string, ToolHandler> = {
  erp_search: erpSearchHandler,
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

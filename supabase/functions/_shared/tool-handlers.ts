// ═══ CAMADA 1 — Tool Handlers ═══
// Valida input, chama Driver (Camada 2), retorna ToolResult com envelope padronizado.

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buscarCliente, buscarContratos, buscarFaturas, buscarPix, buscarBoleto, buscarBoletoSms, buscarLinhaDigitavel, buscarStatusConexao, buscarDiagnosticoSinal } from "./erp-driver.ts";

export interface ToolExecutionContext {
  supabaseAdmin: SupabaseClient;
  ispId: string;
  encryptionKey: string;
  conversationId?: string;
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

  const contratoId = args.contrato_id ? String(args.contrato_id) : undefined;
  const endereco = args.endereco ? String(args.endereco) : undefined;
  const result = await buscarFaturas(ctx.supabaseAdmin, ctx.ispId, ctx.encryptionKey, cpf, endereco, contratoId);

  return { success: true, data: result };
};

// ── Handler: transfer_to_human ──

const transferToHumanHandler: ToolHandler = async (ctx, args) => {
  const reason = String(args.reason || "Solicitado pelo agente");

  if (!ctx.conversationId) {
    return { success: false, error: "conversation_id não disponível no contexto" };
  }

  await ctx.supabaseAdmin
    .from("conversations")
    .update({
      mode: "human",
      handover_reason: reason,
      handover_at: new Date().toISOString(),
    })
    .eq("id", ctx.conversationId);

  return { success: true, data: { transferred: true, reason } };
};

// ── Handler: erp_pix_lookup ──

const erpPixLookupHandler: ToolHandler = async (ctx, args) => {
  const faturaId = String(args.fatura_id || "").trim();
  if (!faturaId) return { success: false, error: "Informe o ID da fatura (fatura_id)" };

  const result = await buscarPix(ctx.supabaseAdmin, ctx.ispId, ctx.encryptionKey, faturaId);
  return { success: true, data: result };
};

// ── Handler: erp_boleto_lookup ──

const erpBoletoLookupHandler: ToolHandler = async (ctx, args) => {
  const faturaId = String(args.fatura_id || "").trim();
  if (!faturaId) return { success: false, error: "Informe o ID da fatura (fatura_id)" };

  const result = await buscarBoleto(ctx.supabaseAdmin, ctx.ispId, ctx.encryptionKey, faturaId);
  return { success: true, data: result };
};

// ── Handler: erp_boleto_sms ──

const erpBoletoSmsHandler: ToolHandler = async (ctx, args) => {
  const faturaId = String(args.fatura_id || "").trim();
  if (!faturaId) return { success: false, error: "Informe o ID da fatura (fatura_id)" };

  const result = await buscarBoletoSms(ctx.supabaseAdmin, ctx.ispId, ctx.encryptionKey, faturaId);
  return { success: true, data: result };
};

// ── Handler: erp_linha_digitavel ──

const erpLinhaDigitavelHandler: ToolHandler = async (ctx, args) => {
  const faturaId = String(args.fatura_id || "").trim();
  if (!faturaId) return { success: false, error: "Informe o ID da fatura (fatura_id)" };

  const result = await buscarLinhaDigitavel(ctx.supabaseAdmin, ctx.ispId, ctx.encryptionKey, faturaId);
  return { success: true, data: result };
};

// ── Handler: erp_connection_status ──

const erpConnectionStatusHandler: ToolHandler = async (ctx, args) => {
  const contratoId = String(args.contrato_id || "").trim();
  if (!contratoId) return { success: false, error: "Informe o ID do contrato (contrato_id)" };

  const result = await buscarStatusConexao(ctx.supabaseAdmin, ctx.ispId, ctx.encryptionKey, contratoId);
  return { success: true, data: result };
};

// ── Handler: erp_signal_diagnosis ──

const erpSignalDiagnosisHandler: ToolHandler = async (ctx, args) => {
  const contratoId = String(args.contrato_id || "").trim();
  if (!contratoId) return { success: false, error: "Informe o ID do contrato (contrato_id)" };

  const result = await buscarDiagnosticoSinal(ctx.supabaseAdmin, ctx.ispId, ctx.encryptionKey, contratoId);
  return { success: true, data: result };
};

// ── Handler: transfer_to_agent ──

const transferToAgentHandler: ToolHandler = async (ctx, args) => {
  const targetName = String(args.target_agent_name || "").trim();
  const reason = String(args.reason || "Transferência entre agentes");

  if (!targetName) return { success: false, error: "Informe o nome do agente de destino (target_agent_name)" };
  if (!ctx.conversationId) return { success: false, error: "conversation_id não disponível no contexto" };

  // Get current conversation to find isp_id
  const { data: conv } = await ctx.supabaseAdmin
    .from("conversations")
    .select("isp_id, tenant_agent_id")
    .eq("id", ctx.conversationId)
    .single();

  if (!conv) return { success: false, error: "Conversa não encontrada" };

  // Find target agent by custom_name or template default_name within the same ISP
  const { data: agents } = await ctx.supabaseAdmin
    .from("tenant_agents")
    .select("id, custom_name, template_id, is_active")
    .eq("isp_id", conv.isp_id)
    .eq("is_active", true);

  if (!agents?.length) return { success: false, error: `Nenhum agente ativo encontrado no provedor` };

  // Try matching by custom_name first, then by template default_name
  let targetAgent = agents.find(a =>
    a.custom_name && a.custom_name.toLowerCase().includes(targetName.toLowerCase())
  );

  if (!targetAgent) {
    // Try by template default_name
    const { data: templates } = await ctx.supabaseAdmin
      .from("agent_templates")
      .select("id, default_name")
      .eq("is_active", true);

    if (templates) {
      const matchingTemplate = templates.find(t =>
        t.default_name.toLowerCase().includes(targetName.toLowerCase())
      );
      if (matchingTemplate) {
        targetAgent = agents.find(a => a.template_id === matchingTemplate.id);
      }
    }
  }

  if (!targetAgent) return { success: false, error: `Agente "${targetName}" não encontrado` };
  if (targetAgent.id === conv.tenant_agent_id) return { success: false, error: "Já está conectado a este agente" };

  // Transfer: update tenant_agent_id, clear procedure, preserve context
  await ctx.supabaseAdmin
    .from("conversations")
    .update({
      tenant_agent_id: targetAgent.id,
      active_procedure_id: null,
      step_index: 0,
      turns_on_current_step: 0,
      intent_attempts: 0,
    })
    .eq("id", ctx.conversationId);

  console.log(`[transfer_to_agent] ${conv.tenant_agent_id} → ${targetAgent.id} reason="${reason}"`);

  return { success: true, data: { transferred: true, target_agent_id: targetAgent.id, reason } };
};

// ── Registry ──

const handlers: Record<string, ToolHandler> = {
  erp_client_lookup: erpClientLookupHandler,
  erp_contract_lookup: erpContractLookupHandler,
  erp_invoice_search: erpInvoiceSearchHandler,
  transfer_to_human: transferToHumanHandler,
  erp_pix_lookup: erpPixLookupHandler,
  erp_boleto_lookup: erpBoletoLookupHandler,
  erp_boleto_sms: erpBoletoSmsHandler,
  erp_linha_digitavel: erpLinhaDigitavelHandler,
  erp_connection_status: erpConnectionStatusHandler,
  erp_signal_diagnosis: erpSignalDiagnosisHandler,
  transfer_to_agent: transferToAgentHandler,
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

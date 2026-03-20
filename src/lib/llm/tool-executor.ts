// ═══ Tool Executor ═══
// Recebe uma tool call do LLM, instancia o adapter ERP
// e retorna o resultado como JSON string.

import { getAdapter } from '../erp/factory';
import type { ERPAdapterConfig } from '../erp/types';

export interface TenantToolConfig extends ERPAdapterConfig {
  erp_type: string;
}

export async function executeToolCall(
  toolName: string,
  toolArgs: Record<string, string>,
  tenantConfig: TenantToolConfig,
): Promise<string> {
  const start = performance.now();

  try {
    const adapter = getAdapter(tenantConfig.erp_type, {
      supabaseClient: tenantConfig.supabaseClient,
      ispId: tenantConfig.ispId,
    });

    let result: unknown;

    switch (toolName) {
      case 'get_customer_by_document':
        result = await adapter.getCustomerByDocument(toolArgs.document);
        break;

      case 'get_customer_by_email':
        result = await adapter.getCustomerByEmail(toolArgs.email);
        break;

      case 'get_open_invoices':
        result = await adapter.getOpenInvoices(toolArgs.customer_id);
        break;

      case 'get_service_status':
        result = await adapter.getServiceStatus(toolArgs.customer_id);
        break;

      case 'get_contract':
        result = await adapter.getContract(toolArgs.customer_id);
        break;

      case 'generate_payment_link':
        result = { error: 'Funcionalidade ainda não implementada' };
        break;

      case 'send_invoice_by_email':
        result = { error: 'Funcionalidade ainda não implementada' };
        break;

      default:
        result = { error: `Tool "${toolName}" não reconhecida` };
    }

    const elapsed = Math.round(performance.now() - start);
    console.log(
      `[tool-executor] tool=${toolName} isp=${tenantConfig.ispId} latency=${elapsed}ms`,
    );

    return JSON.stringify(result);
  } catch (err) {
    const elapsed = Math.round(performance.now() - start);
    console.error(
      `[tool-executor] ERRO tool=${toolName} isp=${tenantConfig.ispId} latency=${elapsed}ms`,
      err,
    );

    return JSON.stringify({
      error: 'Não foi possível consultar o sistema agora',
    });
  }
}

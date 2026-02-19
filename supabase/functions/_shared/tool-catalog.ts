/**
 * Hardcoded Tool Catalog — single source of truth for AI agent tools.
 * Tools are defined here with full JSON Schema for OpenAI function calling.
 */

export interface ToolDefinition {
  handler: string;
  display_name: string;
  description: string;
  parameters_schema: Record<string, unknown>;
  response_description: string;
  requires_erp: boolean;
}

export const TOOL_CATALOG: Record<string, ToolDefinition> = {
  erp_search: {
    handler: "erp_search",
    display_name: "Busca Clientes no ERP",
    description:
      "Busca clientes no sistema ERP do provedor por CPF ou CNPJ. Pode retornar um ou mais clientes com dados de contrato, status de conexão e sinal.",
    parameters_schema: {
      type: "object",
      properties: {
        busca: {
          type: "string",
          description: "CPF ou CNPJ do cliente",
          minLength: 11,
        },
      },
      required: ["busca"],
      additionalProperties: false,
    },
    response_description:
      "Lista de clientes encontrados com nome, CPF, plano, status, sinal e provedor ERP.",
    requires_erp: true,
  },

  erp_invoice_search: {
    handler: "erp_invoice_search",
    display_name: "Consulta de Faturas",
    description:
      "Consulta faturas e débitos de um cliente no ERP. Retorna faturas abertas, vencidas e total devedor.",
    parameters_schema: {
      type: "object",
      properties: {
        cliente_id: {
          type: "string",
          description: "CPF/CNPJ ou ID do cliente no ERP",
        },
      },
      required: ["cliente_id"],
      additionalProperties: false,
    },
    response_description:
      "Faturas do cliente com número, valor, vencimento, status e total em aberto.",
    requires_erp: true,
  },

  onu_diagnostics: {
    handler: "onu_diagnostics",
    display_name: "Diagnóstico de Sinal ONU",
    description:
      "Executa diagnóstico de sinal óptico (ONU/ONT) do cliente. Retorna níveis de potência RX/TX e análise de qualidade.",
    parameters_schema: {
      type: "object",
      properties: {
        client_id: {
          type: "string",
          description: "ID do cliente no ERP para diagnóstico de sinal",
        },
      },
      required: ["client_id"],
      additionalProperties: false,
    },
    response_description:
      "Diagnóstico com potência RX/TX em dBm, qualidade do sinal e recomendações.",
    requires_erp: true,
  },
};

/**
 * Get tools available for the current context.
 * Filters out ERP-dependent tools when ISP has no active ERP.
 */
export function getAvailableTools(hasErp: boolean): ToolDefinition[] {
  return Object.values(TOOL_CATALOG).filter((t) => !t.requires_erp || hasErp);
}

/**
 * Build OpenAI-compatible tools array for the chat completions API.
 */
export function buildOpenAITools(hasErp: boolean) {
  const tools = getAvailableTools(hasErp);
  if (tools.length === 0) return undefined;

  return tools.map((t) => ({
    type: "function" as const,
    function: {
      name: t.handler,
      description: t.description,
      parameters: t.parameters_schema,
    },
  }));
}

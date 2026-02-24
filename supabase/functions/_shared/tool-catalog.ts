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
  erp_invoice_search: {
    handler: "erp_invoice_search",
    display_name: "Consulta de Faturas",
    description:
      "Consulta faturas em aberto de um cliente no ERP por CPF/CNPJ. Retorna faturas pendentes com valores, vencimentos e total devedor.",
    parameters_schema: {
      type: "object",
      properties: {
        cliente_id: {
          type: "string",
          description: "CPF/CNPJ do cliente",
        },
      },
      required: ["cliente_id"],
      additionalProperties: false,
    },
    response_description:
      "Faturas em aberto com valor, vencimento, dias de atraso, linha digitável e total em aberto.",
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

  erp_client_lookup: {
    handler: "erp_client_lookup",
    display_name: "Busca Cliente por CPF/CNPJ",
    description:
      "Busca dados cadastrais de um cliente no ERP por CPF ou CNPJ. Retorna o ID do cliente no ERP (necessário para outras ferramentas como diagnóstico de sinal), nome, status do contrato e plano.",
    parameters_schema: {
      type: "object",
      properties: {
        cpf_cnpj: {
          type: "string",
          description: "CPF ou CNPJ do cliente (somente números ou formatado)",
          minLength: 11,
        },
      },
      required: ["cpf_cnpj"],
      additionalProperties: false,
    },
    response_description:
      "Dados do cliente incluindo cliente_erp_id (usar em onu_diagnostics), nome, CPF/CNPJ, status e plano.",
    requires_erp: true,
  },

  erp_contract_lookup: {
    handler: "erp_contract_lookup",
    display_name: "Consulta de Contrato",
    description:
      "Consulta contratos ativos de um cliente por ID. Retorna ID do contrato, endereço de instalação, plano contratado e status.",
    parameters_schema: {
      type: "object",
      properties: {
        client_id: {
          type: "string",
          description: "ID do cliente no ERP (obtido via erp_client_lookup)",
        },
      },
      required: ["client_id"],
      additionalProperties: false,
    },
    response_description:
      "Contratos ativos com contrato_id, endereço completo, plano, status e dia de vencimento.",
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

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
      "Consulta faturas em aberto de um cliente no ERP por CPF/CNPJ. Quando o cliente tem múltiplos contratos, use o parâmetro endereco para filtrar o contrato desejado (obtido via erp_contract_lookup).",
    parameters_schema: {
      type: "object",
      properties: {
        cpf_cnpj: {
          type: "string",
          description: "CPF ou CNPJ do cliente (somente números ou formatado)",
          minLength: 11,
        },
        endereco: {
          type: "string",
          description: "Endereço parcial para filtrar o contrato desejado (opcional, obtido via erp_contract_lookup)",
        },
      },
      required: ["cpf_cnpj"],
      additionalProperties: false,
    },
    response_description:
      "Faturas em aberto com valor, vencimento, dias de atraso, contrato_id, endereço e total em aberto.",
    requires_erp: true,
  },

  erp_onu_diagnostics: {
    handler: "erp_onu_diagnostics",
    display_name: "Diagnóstico de Sinal ONU",
    description:
      "Executa diagnóstico de sinal óptico (ONU/ONT) do cliente por CPF/CNPJ. Retorna níveis de potência RX/TX e análise de qualidade.",
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
      "Diagnóstico com potência RX/TX em dBm, qualidade do sinal e recomendações.",
    requires_erp: true,
  },

  erp_client_lookup: {
    handler: "erp_client_lookup",
    display_name: "Busca Cliente por CPF/CNPJ",
    description:
      "Busca dados cadastrais de um cliente no ERP por CPF ou CNPJ. Retorna nome e CPF/CNPJ confirmado.",
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
      "Dados do cliente com nome e CPF/CNPJ. Use erp_contract_lookup para contratos e erp_onu_diagnostics para sinal.",
    requires_erp: true,
  },

  erp_contract_lookup: {
    handler: "erp_contract_lookup",
    display_name: "Consulta de Contrato",
    description:
      "Consulta contratos ativos de um cliente por CPF/CNPJ. Retorna endereços de instalação dos contratos. Ao listar para o cliente, exiba APENAS uma lista numerada com os endereços, sem plano, sem status, sem vencimento. Exemplo: '1. Rua X, 123, Bairro, Cidade'. Pergunte sobre qual contrato quer falar.",
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
      "Contratos ativos com contrato_id e endereço completo. Ao apresentar ao cliente, liste SOMENTE os endereços numerados. Os demais campos (plano, status, vencimento) são internos para uso posterior quando o cliente escolher um contrato.",
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

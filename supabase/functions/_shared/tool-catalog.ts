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
      "Consulta faturas em aberto de um cliente no ERP por CPF/CNPJ. Aceita parâmetro opcional de endereço para filtrar por contrato.",
    parameters_schema: {
      type: "object",
      properties: {
        cpf_cnpj: {
          type: "string",
          description: "CPF ou CNPJ do cliente (somente números ou formatado)",
          minLength: 11,
        },
        contrato_id: {
          type: "string",
          description: "ID do contrato para filtrar faturas. Use quando disponível no contexto (selected_contract_id). Tem prioridade sobre endereco.",
        },
        endereco: {
          type: "string",
          description: "Endereço parcial para filtrar o contrato desejado. OPCIONAL — se contrato_id estiver disponível no contexto, use-o em vez deste parâmetro.",
        },
      },
      required: ["cpf_cnpj"],
      additionalProperties: false,
    },
    response_description:
      "Faturas em aberto com id, valor, vencimento, contrato_id e total em aberto.",
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
      "Dados do cliente com nome e CPF/CNPJ.",
    requires_erp: true,
  },

  erp_contract_lookup: {
    handler: "erp_contract_lookup",
    display_name: "Consulta de Contrato",
    description:
      "Consulta contratos ativos de um cliente no ERP por CPF/CNPJ. Retorna endereços de instalação dos contratos.",
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
      "Retorna array 'contratos' com objetos contendo: ordem, contrato_id, endereco, numero, complemento, bairro, endereco_completo e provider_name. Use os campos estruturados para formatar a lista para o cliente.",
    requires_erp: true,
  },

  transfer_to_human: {
    handler: "transfer_to_human",
    display_name: "Transferir para Atendente Humano",
    description:
      "Transfere a conversa para um atendente humano. Use quando o assunto exigir acesso a sistemas que você não possui, ou quando o cliente solicitar falar com uma pessoa.",
    parameters_schema: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          description: "Motivo resumido da transferência (ex: 'Cliente quer consultar fatura e ERP não disponível')",
        },
      },
      required: ["reason"],
      additionalProperties: false,
    },
    response_description:
      "Confirma que a conversa foi transferida para modo humano.",
    requires_erp: false,
  },

  erp_pix_lookup: {
    handler: "erp_pix_lookup",
    display_name: "Consulta PIX",
    description:
      "Recupera o código PIX copia-e-cola de uma fatura em aberto pelo ID da fatura no ERP.",
    parameters_schema: {
      type: "object",
      properties: {
        fatura_id: {
          type: "string",
          description: "ID da fatura (id_areceber) no ERP",
        },
      },
      required: ["fatura_id"],
      additionalProperties: false,
    },
    response_description:
      "Código PIX copia-e-cola (qrcode), URL da imagem QR, gateway e status de expiração.",
    requires_erp: true,
  },

  erp_boleto_lookup: {
    handler: "erp_boleto_lookup",
    display_name: "Segunda Via Boleto",
    description:
      "Gera segunda via do boleto em PDF de uma fatura e retorna link para download.",
    parameters_schema: {
      type: "object",
      properties: {
        fatura_id: {
          type: "string",
          description: "ID da fatura (id_areceber) no ERP",
        },
      },
      required: ["fatura_id"],
      additionalProperties: false,
    },
    response_description:
      "Link temporário (1h) para download do boleto PDF atualizado.",
    requires_erp: true,
  },

  erp_boleto_send_pdf: {
    handler: "erp_boleto_send_pdf",
    display_name: "Enviar Boleto PDF no Chat",
    description:
      "Envia o boleto em PDF como anexo (mensagem do tipo document) diretamente no chat do WhatsApp do cliente. Use quando o cliente preferir receber o PDF inline em vez de um link de download.",
    parameters_schema: {
      type: "object",
      properties: {
        fatura_id: {
          type: "string",
          description: "ID da fatura (id_areceber) no ERP",
        },
      },
      required: ["fatura_id"],
      additionalProperties: false,
    },
    response_description:
      "Confirma o envio do PDF inline no WhatsApp ({ sent, fatura_id, wamid }). No simulador ou se não houver WhatsApp configurado, retorna o link como fallback.",
    requires_erp: true,
  },

    handler: "erp_boleto_sms",
    display_name: "Enviar Boleto por SMS",
    description:
      "Envia o boleto de uma fatura por SMS para o celular cadastrado do cliente no ERP.",
    parameters_schema: {
      type: "object",
      properties: {
        fatura_id: {
          type: "string",
          description: "ID da fatura (id_areceber) no ERP",
        },
      },
      required: ["fatura_id"],
      additionalProperties: false,
    },
    response_description:
      "Confirma se o boleto foi enviado por SMS com sucesso.",
    requires_erp: true,
  },

  erp_linha_digitavel: {
    handler: "erp_linha_digitavel",
    display_name: "Consulta Linha Digitável",
    description:
      "Recupera a linha digitável (código de barras) de uma fatura em aberto pelo ID da fatura no ERP.",
    parameters_schema: {
      type: "object",
      properties: {
        fatura_id: {
          type: "string",
          description: "ID da fatura (id_areceber) no ERP",
        },
      },
      required: ["fatura_id"],
      additionalProperties: false,
    },
    response_description:
      "Linha digitável do boleto para pagamento via código de barras.",
    requires_erp: true,
  },

  erp_connection_status: {
    handler: "erp_connection_status",
    display_name: "Status de Conexão RADIUS",
    description:
      "Consulta o status de conexão RADIUS (online/offline) de um contrato no ERP pelo ID do contrato.",
    parameters_schema: {
      type: "object",
      properties: {
        contrato_id: {
          type: "string",
          description: "ID do contrato no ERP",
        },
      },
      required: ["contrato_id"],
      additionalProperties: false,
    },
    response_description:
      "Status da conexão (online/offline) e login do contrato.",
    requires_erp: true,
  },

  erp_signal_diagnosis: {
    handler: "erp_signal_diagnosis",
    display_name: "Diagnóstico de Sinal Óptico",
    description:
      "Realiza diagnóstico do sinal óptico (RX/TX) de um contrato no ERP. Retorna valores, classificação e ação recomendada.",
    parameters_schema: {
      type: "object",
      properties: {
        contrato_id: {
          type: "string",
          description: "ID do contrato no ERP",
        },
      },
      required: ["contrato_id"],
      additionalProperties: false,
    },
    response_description:
      "Valores RX/TX em dBm, classificação de qualidade, diagnóstico textual, ação recomendada e severidade (0=ok, 1=atenção, 2=problema, 3=crítico).",
    requires_erp: true,
  },

  transfer_to_agent: {
    handler: "transfer_to_agent",
    display_name: "Transferir para Agente IA",
    description:
      "Transfere a conversa para outro agente de IA especializado do mesmo provedor. Use para escalonar para um agente com capacidades específicas.",
    parameters_schema: {
      type: "object",
      properties: {
        target_agent_name: {
          type: "string",
          description: "Nome do agente de destino (ex: 'Suporte Técnico Avançado')",
        },
        reason: {
          type: "string",
          description: "Motivo resumido da transferência",
        },
      },
      required: ["target_agent_name", "reason"],
      additionalProperties: false,
    },
    response_description:
      "Confirma que a conversa foi transferida para o agente especializado.",
    requires_erp: false,
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

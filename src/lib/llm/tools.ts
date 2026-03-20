// ═══ OpenAI Function Calling — Tool Schemas ═══
// Schemas passados ao GPT-4o via `tools[]`.
// Cada tool mapeia 1:1 para um método do ERPAdapter canônico.

export const llmTools = [
  {
    type: 'function' as const,
    function: {
      name: 'get_customer_by_document',
      description: 'Busca cliente pelo CPF ou CNPJ no sistema do ISP',
      parameters: {
        type: 'object',
        properties: {
          document: {
            type: 'string',
            description: 'CPF ou CNPJ somente números',
          },
        },
        required: ['document'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_customer_by_email',
      description: 'Busca cliente pelo e-mail cadastrado',
      parameters: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            description: 'E-mail do cliente',
          },
        },
        required: ['email'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_open_invoices',
      description: 'Retorna boletos em aberto ou em atraso do cliente',
      parameters: {
        type: 'object',
        properties: {
          customer_id: {
            type: 'string',
            description: 'ID do cliente no ERP',
          },
        },
        required: ['customer_id'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_service_status',
      description: 'Verifica o status atual da conexão do cliente',
      parameters: {
        type: 'object',
        properties: {
          customer_id: {
            type: 'string',
            description: 'ID do cliente no ERP',
          },
        },
        required: ['customer_id'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_contract',
      description: 'Retorna dados do contrato e plano atual do cliente',
      parameters: {
        type: 'object',
        properties: {
          customer_id: {
            type: 'string',
            description: 'ID do cliente no ERP',
          },
        },
        required: ['customer_id'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'generate_payment_link',
      description: 'Gera link de pagamento para um boleto específico',
      parameters: {
        type: 'object',
        properties: {
          invoice_id: {
            type: 'string',
            description: 'ID do boleto',
          },
          customer_id: {
            type: 'string',
            description: 'ID do cliente no ERP',
          },
        },
        required: ['invoice_id', 'customer_id'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'send_invoice_by_email',
      description: 'Envia boleto por e-mail para o cliente',
      parameters: {
        type: 'object',
        properties: {
          invoice_id: {
            type: 'string',
            description: 'ID do boleto',
          },
          email: {
            type: 'string',
            description: 'E-mail de destino',
          },
        },
        required: ['invoice_id', 'email'],
        additionalProperties: false,
      },
    },
  },
] as const;

export type LLMToolName = (typeof llmTools)[number]['function']['name'];

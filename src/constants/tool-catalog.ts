/**
 * Frontend mirror of the tool catalog — read-only display metadata.
 * No handler logic here; only used for the admin UI.
 *
 * ⚠️  SYNC WARNING: Keep in sync with the runtime catalog at
 *     supabase/functions/_shared/tool-catalog.ts
 *     The runtime uses `parameters_schema` (JSON Schema), while this
 *     mirror uses a simplified `parameters` array for UI display.
 */

export interface ToolCatalogEntry {
  handler: string;
  display_name: string;
  description: string;
  parameters: { name: string; type: string; description: string; required: boolean }[];
  response_description: string;
  requires_erp: boolean;
}

export const TOOL_CATALOG: ToolCatalogEntry[] = [
  {
    handler: "erp_invoice_search",
    display_name: "Consulta de Faturas",
    description:
      "Consulta faturas em aberto de um cliente no ERP por CPF/CNPJ. Aceita filtro por contrato_id ou endereço.",
    parameters: [
      { name: "cpf_cnpj", type: "string", description: "CPF ou CNPJ do cliente", required: true },
      { name: "contrato_id", type: "string", description: "ID do contrato para filtrar faturas (prioridade sobre endereço)", required: false },
      { name: "endereco", type: "string", description: "Endereço parcial para filtrar o contrato desejado (opcional)", required: false },
    ],
    response_description:
      "Faturas em aberto com id, valor, vencimento, contrato_id e total em aberto.",
    requires_erp: true,
  },
  {
    handler: "erp_client_lookup",
    display_name: "Busca Cliente por CPF/CNPJ",
    description:
      "Busca dados cadastrais de um cliente no ERP por CPF ou CNPJ. Retorna nome e CPF/CNPJ confirmado.",
    parameters: [
      { name: "cpf_cnpj", type: "string", description: "CPF ou CNPJ do cliente", required: true },
    ],
    response_description: "Dados do cliente com nome e CPF/CNPJ.",
    requires_erp: true,
  },
  {
    handler: "erp_contract_lookup",
    display_name: "Consulta de Contrato",
    description:
      "Consulta contratos ativos de um cliente no ERP por CPF/CNPJ. Retorna endereços de instalação dos contratos.",
    parameters: [
      { name: "cpf_cnpj", type: "string", description: "CPF ou CNPJ do cliente", required: true },
    ],
    response_description: "Retorna array 'contratos' com objetos contendo: ordem, contrato_id, endereco, numero, complemento, bairro, endereco_completo e provider_name.",
    requires_erp: true,
  },
  {
    handler: "erp_pix_lookup",
    display_name: "Consulta PIX",
    description:
      "Recupera o código PIX copia-e-cola de uma fatura em aberto pelo ID da fatura no ERP.",
    parameters: [
      { name: "fatura_id", type: "string", description: "ID da fatura (id_areceber) no ERP", required: true },
    ],
    response_description:
      "Código PIX copia-e-cola (qrcode), URL da imagem QR, gateway e status de expiração.",
    requires_erp: true,
  },
  {
    handler: "erp_boleto_lookup",
    display_name: "Segunda Via Boleto",
    description:
      "Gera segunda via do boleto em PDF de uma fatura e retorna link para download.",
    parameters: [
      { name: "fatura_id", type: "string", description: "ID da fatura (id_areceber) no ERP", required: true },
    ],
    response_description:
      "Link temporário (1h) para download do boleto PDF atualizado.",
    requires_erp: true,
  },
  {
    handler: "erp_boleto_send_pdf",
    display_name: "Enviar Boleto PDF no Chat",
    description:
      "Envia o boleto em PDF como anexo (mensagem document) diretamente no WhatsApp do cliente. Reaproveita o link assinado de 24h gerado por erp_boleto_lookup.",
    parameters: [
      { name: "fatura_id", type: "string", description: "ID da fatura (id_areceber) no ERP", required: true },
    ],
    response_description:
      "Confirma o envio do PDF inline no WhatsApp. No simulador ou sem WhatsApp configurado, retorna o link como fallback.",
    requires_erp: true,
  },
    handler: "erp_boleto_sms",
    display_name: "Enviar Boleto por SMS",
    description:
      "Envia o boleto de uma fatura por SMS para o celular cadastrado do cliente no ERP.",
    parameters: [
      { name: "fatura_id", type: "string", description: "ID da fatura (id_areceber) no ERP", required: true },
    ],
    response_description: "Confirma se o boleto foi enviado por SMS com sucesso.",
    requires_erp: true,
  },
  {
    handler: "erp_linha_digitavel",
    display_name: "Consulta Linha Digitável",
    description:
      "Recupera a linha digitável (código de barras) de uma fatura em aberto pelo ID da fatura no ERP.",
    parameters: [
      { name: "fatura_id", type: "string", description: "ID da fatura (id_areceber) no ERP", required: true },
    ],
    response_description: "Linha digitável do boleto para pagamento via código de barras.",
    requires_erp: true,
  },
  {
    handler: "erp_connection_status",
    display_name: "Status de Conexão RADIUS",
    description:
      "Consulta o status de conexão RADIUS (online/offline) de um contrato no ERP pelo ID do contrato.",
    parameters: [
      { name: "contrato_id", type: "string", description: "ID do contrato no ERP", required: true },
    ],
    response_description: "Status da conexão (online/offline) e login do contrato.",
    requires_erp: true,
  },
  {
    handler: "erp_signal_diagnosis",
    display_name: "Diagnóstico de Sinal Óptico",
    description:
      "Realiza diagnóstico do sinal óptico (RX/TX) de um contrato no ERP. Retorna valores, classificação e ação recomendada.",
    parameters: [
      { name: "contrato_id", type: "string", description: "ID do contrato no ERP", required: true },
    ],
    response_description: "Valores RX/TX em dBm, classificação de qualidade, diagnóstico textual, ação recomendada e severidade (0-3).",
    requires_erp: true,
  },
  {
    handler: "transfer_to_human",
    display_name: "Transferir para Atendente Humano",
    description:
      "Transfere a conversa para um atendente humano quando o assunto exigir acesso a sistemas ou o cliente solicitar.",
    parameters: [
      { name: "reason", type: "string", description: "Motivo resumido da transferência", required: true },
    ],
    response_description: "Confirma que a conversa foi transferida para modo humano.",
    requires_erp: false,
  },
  {
    handler: "transfer_to_agent",
    display_name: "Transferir para Agente IA",
    description:
      "Transfere a conversa para outro agente de IA especializado do mesmo provedor, preservando todo o contexto coletado.",
    parameters: [
      { name: "target_agent_name", type: "string", description: "Nome do agente de destino", required: true },
      { name: "reason", type: "string", description: "Motivo resumido da transferência", required: true },
    ],
    response_description: "Confirma que a conversa foi transferida para o agente especializado.",
    requires_erp: false,
  },
];

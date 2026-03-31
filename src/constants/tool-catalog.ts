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
      "Faturas em aberto com valor, vencimento, dias de atraso, contrato_id, endereço e total em aberto.",
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
];

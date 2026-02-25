/**
 * Frontend mirror of the tool catalog — read-only display metadata.
 * No handler logic here; only used for the admin UI.
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
      "Consulta faturas em aberto de um cliente no ERP por CPF/CNPJ. Aceita parâmetro opcional de endereço para filtrar por contrato.",
    parameters: [
      { name: "cpf_cnpj", type: "string", description: "CPF ou CNPJ do cliente", required: true },
      { name: "endereco", type: "string", description: "Endereço parcial para filtrar o contrato desejado (opcional)", required: false },
    ],
    response_description:
      "Faturas em aberto com valor, vencimento, dias de atraso, contrato_id, endereço e total em aberto.",
    requires_erp: true,
  },
  {
    handler: "erp_onu_diagnostics",
    display_name: "Diagnóstico de Sinal ONU",
    description:
      "Executa diagnóstico de sinal óptico (ONU/ONT) do cliente por CPF/CNPJ. Retorna níveis de potência RX/TX e análise de qualidade.",
    parameters: [
      { name: "cpf_cnpj", type: "string", description: "CPF ou CNPJ do cliente", required: true },
    ],
    response_description:
      "Diagnóstico com potência RX/TX em dBm, qualidade do sinal e recomendações.",
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
];

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
      "Consulta faturas em aberto de um cliente no ERP por CPF/CNPJ. Retorna faturas pendentes com valores, vencimentos e total devedor.",
    parameters: [
      { name: "cliente_id", type: "string", description: "CPF/CNPJ do cliente", required: true },
    ],
    response_description:
      "Faturas em aberto com valor, vencimento, dias de atraso e total em aberto.",
    requires_erp: true,
  },
  {
    handler: "onu_diagnostics",
    display_name: "Diagnóstico de Sinal ONU",
    description:
      "Executa diagnóstico de sinal óptico (ONU/ONT) do cliente. Retorna níveis de potência RX/TX e análise de qualidade.",
    parameters: [
      { name: "client_id", type: "string", description: "ID do cliente no ERP", required: true },
    ],
    response_description:
      "Diagnóstico com potência RX/TX em dBm, qualidade do sinal e recomendações.",
    requires_erp: true,
  },
  {
    handler: "erp_client_lookup",
    display_name: "Busca Cliente por CPF/CNPJ",
    description:
      "Busca dados cadastrais de um cliente no ERP por CPF ou CNPJ. Retorna o ID do cliente (necessário para diagnóstico de sinal), nome, status e plano.",
    parameters: [
      { name: "cpf_cnpj", type: "string", description: "CPF ou CNPJ do cliente", required: true },
    ],
    response_description: "Dados do cliente com cliente_erp_id, nome, status e plano.",
    requires_erp: true,
  },
  {
    handler: "erp_contract_lookup",
    display_name: "Consulta de Contrato",
    description:
      "Consulta contratos ativos de um cliente por ID. Retorna ID do contrato, endereço de instalação, plano contratado e status.",
    parameters: [
      { name: "client_id", type: "string", description: "ID do cliente no ERP (obtido via erp_client_lookup)", required: true },
    ],
    response_description: "Contratos ativos com contrato_id, endereço completo, plano, status e dia de vencimento.",
    requires_erp: true,
  },
];

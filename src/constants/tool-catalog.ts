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
    handler: "erp_search",
    display_name: "Busca Clientes no ERP",
    description:
      "Busca clientes com contrato ativo no sistema ERP do provedor por CPF ou CNPJ. Retorna dados de contrato, status da internet e sinal.",
    parameters: [
      { name: "busca", type: "string", description: "CPF ou CNPJ do cliente (mín. 11 caracteres)", required: true },
    ],
    response_description:
      "Lista de clientes com nome, CPF, plano, status_internet, sinal e provedor ERP.",
    requires_erp: true,
  },
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
];

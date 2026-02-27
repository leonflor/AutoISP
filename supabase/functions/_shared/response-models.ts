// ═══ Response Models — Contratos de resposta para a IA ═══
// Define EXATAMENTE o JSON que a IA recebe de cada ferramenta.
// Nenhum campo extra deve vazar para o modelo.

/** Modelo: erp_client_lookup */
export interface ClienteResponse {
  id: string;
  nome: string;
  cpf_cnpj: string;
  provider: string;
  erp: string;
}

/** Modelo: erp_contract_lookup */
export interface ContratoResponse {
  opcao: number;
  ordem: number;
  contrato_id: string;
  endereco: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  endereco_completo: string | null;
  plano: string | null;
  status: string;
  dia_vencimento: string | null;
  erp: string;
}

/** Modelo: erp_invoice_search */
export interface FaturaResponse {
  id: string;
  contrato_id: string | null;
  endereco: string | null;
  valor: number;
  vencimento: string;
  dias_atraso: number;
  linha_digitavel: string | null;
  erp: string;
}

/** Envelope padrão que toda ferramenta retorna */
export interface ToolEnvelope<T> {
  encontrados: number;
  itens: T[];
  mensagem?: string;
  erros: string[];
}

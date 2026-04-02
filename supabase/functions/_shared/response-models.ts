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

/** Modelo: erp_invoice_search — SEM dias_atraso e SEM linha_digitavel */
export interface FaturaResponse {
  id: string;
  contrato_id: string | null;
  endereco: string | null;
  valor: number;
  vencimento: string;
  erp: string;
}

/** Modelo: erp_pix_lookup */
export interface PixResponse {
  fatura_id: string;
  qrcode: string | null;
  qrcode_imagem: string | null;
  gateway: string | null;
  expirado: boolean;
  erp: string;
}

/** Modelo: erp_boleto_lookup */
export interface BoletoResponse {
  fatura_id: string;
  boleto_url: string | null;
  erp: string;
}

/** Modelo: erp_boleto_sms */
export interface BoletoSmsResponse {
  fatura_id: string;
  enviado: boolean;
  erp: string;
}

/** Modelo: erp_linha_digitavel */
export interface LinhaDigitavelResponse {
  fatura_id: string;
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

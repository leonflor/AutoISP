// ═══ CAMADA 1 — Tipos Padrão ERP ═══
// Define O QUE será exibido/consultado.
// Todas as interfaces exigem provider (origem) obrigatório.

import { type SignalQuality } from "./onu-signal-analyzer.ts";

// ── Provider Types ──

export type ErpProvider = "ixc" | "mk_solutions" | "sgp" | "hubsoft";

export const PROVIDER_DISPLAY_NAMES: Record<ErpProvider, string> = {
  ixc: "IXC Soft",
  mk_solutions: "MK-Solutions",
  sgp: "SGP",
  hubsoft: "Hubsoft",
};

// ── Status da Internet (normalizado na Camada 2) ──

export type InternetStatus = "ativo" | "bloqueado" | "financeiro_em_atraso" | "outros";

// ── ErpClient (saída padronizada para o frontend) ──

export interface ErpClient {
  /** ID do registro no ERP de origem (conexão fibra no IXC) */
  erp_id: string;
  /** ID do contrato no ERP (cliente_contrato no IXC) */
  contrato_id: string | null;
  /** ID da pessoa no ERP (cliente no IXC) — usado para diagnóstico ONU */
  cliente_erp_id: string | null;
  /** Chave técnica do ERP — OBRIGATÓRIO, nunca null */
  provider: ErpProvider;
  /** Nome legível do ERP — OBRIGATÓRIO, nunca vazio */
  provider_name: string;
  nome: string;
  cpf_cnpj: string;
  data_vencimento: string | null;
  plano: string | null;
  login: string | null;
  /** Status da internet normalizado (ativo, bloqueado, financeiro_em_atraso, outros) */
  status_internet: InternetStatus;
  conectado: boolean;
  signal_db: number | null;
  signal_quality: SignalQuality;
  /** Indica quais campos o ERP de origem suporta */
  field_availability: Record<string, boolean>;
}

// ── Credenciais (resolvidas pelo Driver após decrypt) ──

export interface ErpCredentials {
  apiUrl: string;
  username?: string;
  password?: string;
  apiKey?: string;
  token?: string;
  app?: string;
}

// ── Resultado de Teste de Conexão ──

export interface TestResult {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}

// ── Tipos Brutos — Camada 3 (retornados pelos Providers, sem normalização) ──

export interface RawRadusuario {
  id: string;
  id_cliente: string;
  id_contrato: string;
  login: string;
  online: string;
}

export interface RawCliente {
  id: string;
  nome: string;
  cpf_cnpj: string;
}

export interface RawContrato {
  id: string;
  id_cliente: string;
  plano: string | null;
  dia_vencimento: string | null;
  /** Status bruto da internet — valor proprietário do ERP */
  status_internet: string;
}

export interface RawContratoDetalhado extends RawContrato {
  endereco: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  complemento: string | null;
}

export interface RawFibraRecord {
  id: string;
  id_login: string;
  sinal_rx: number | null;
  sinal_tx: number | null;
}

export interface RawFatura {
  id: string;
  id_cliente: string;
  id_contrato?: string;
  data_vencimento: string;
  valor: number;
  valor_pago: number | null;
  linha_digitavel: string | null;
  gateway_link: string | null;
}


// ── Fatura Normalizada (Camada 2 → Camada 1) ──

export interface ErpInvoice {
  provider: ErpProvider;
  provider_name: string;
  id: string;
  id_cliente: string;
  id_contrato?: string;
  endereco_contrato?: string;
  data_vencimento: string;
  valor: number;
  valor_pago: number | null;
  dias_atraso: number;
  linha_digitavel: string | null;
  gateway_link: string | null;
}

// ── Filtro de Faturas ──

export interface FaturaFilter {
  cpf_cnpj: string;
}

// ── Contrato do Provider (Camada 3) ──

export interface ErpProviderDriver {
  /** Campos que este provider suporta */
  supportedFields(): string[];

  /** Testa conectividade com o ERP */
  testConnection(creds: ErpCredentials): Promise<TestResult>;

  // ── Métodos granulares (opcionais por provider) ──
  // Todos retornam dados CRUS da API (any[]/any).
  // O mapeamento para tipos Raw é feito exclusivamente no Driver (Camada 2).

  /** Busca clientes — retorna dados crus da API */
  fetchClientes?(creds: ErpCredentials, filtro?: Record<string, string>): Promise<any[]>;

  /** Busca contratos — retorna dados crus da API */
  fetchContratos?(creds: ErpCredentials, filtro?: Record<string, string>): Promise<any[]>;

  /** Busca usuários RADIUS — retorna dados crus da API */
  fetchRadusuarios?(creds: ErpCredentials): Promise<any[]>;

  /** Busca registros de fibra (sinal em massa) — retorna dados crus da API */
  fetchFibra?(creds: ErpCredentials): Promise<any[]>;

  /** Busca faturas — retorna dados crus da API */
  fetchFaturas?(creds: ErpCredentials, filtro: Record<string, string>): Promise<any[]>;


  /** Busca contratos detalhados com endereço — retorna dados crus da API */
  fetchContratosDetalhados?(creds: ErpCredentials, filtro: Record<string, string>): Promise<any[]>;
}

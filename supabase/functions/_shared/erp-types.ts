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

export interface RawFibraRecord {
  id: string;
  id_login: string;
  sinal_rx: number | null;
  sinal_tx: number | null;
}

export interface RawFatura {
  id: string;
  id_cliente: string;
  data_vencimento: string;
  valor: number;
  valor_pago: number | null;
  linha_digitavel: string | null;
  gateway_link: string | null;
}

export interface RawSignalData {
  tx: number | null;
  rx: number | null;
  raw_record?: Record<string, unknown>;
}

// ── Fatura Normalizada (Camada 2 → Camada 1) ──

export interface ErpInvoice {
  provider: ErpProvider;
  provider_name: string;
  id: string;
  id_cliente: string;
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

  /** Busca clientes brutos */
  fetchClientes?(creds: ErpCredentials, filtro?: { cpf_cnpj: string }): Promise<RawCliente[]>;

  /** Busca contratos ativos */
  fetchContratos?(creds: ErpCredentials, filtro?: { id_cliente: string }): Promise<RawContrato[]>;

  /** Busca usuários RADIUS */
  fetchRadusuarios?(creds: ErpCredentials): Promise<RawRadusuario[]>;

  /** Busca registros de fibra (sinal em massa) */
  fetchFibra?(creds: ErpCredentials): Promise<RawFibraRecord[]>;

  /** Busca faturas em aberto */
  fetchFaturas?(creds: ErpCredentials, filtro: FaturaFilter): Promise<RawFatura[]>;

  /** Busca sinal bruto de um cliente (diagnóstico ONU sob demanda) */
  fetchRawSignal?(creds: ErpCredentials, clientId: string): Promise<RawSignalData>;
}

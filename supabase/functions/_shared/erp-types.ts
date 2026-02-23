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

// ── Contract Status (normalizado) ──

export type ContractStatus =
  | "ativo"
  | "nao_ativo"
  | "suspenso"
  | "cancelado"
  | "bloqueado"
  | "inadimplente"
  | "desconhecido";

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
  status_contrato: ContractStatus;
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

// ── Tipos Brutos (retornados pelos Providers, sem normalização) ──

export interface RawErpClient {
  erp_id: string;
  /** ID do contrato no ERP (null para providers que não separam) */
  contrato_id: string | null;
  /** ID da pessoa no ERP (null para providers que não separam) */
  cliente_erp_id: string | null;
  nome: string;
  cpf_cnpj: string;
  data_vencimento: string | null;
  plano: string | null;
  login: string | null;
  /** Status bruto do ERP — valor proprietário, sem normalizar */
  raw_status: string;
  /** Conexão bruta — valor proprietário */
  raw_online: string | boolean | null;
  /** Sinal bruto (apenas IXC) */
  signal_db: number | null;
}

export interface RawSignalData {
  tx: number | null;
  rx: number | null;
  raw_record?: Record<string, unknown>;
}

// ── Contrato do Provider (Camada 3) ──

export interface ErpProviderDriver {
  /** Campos que este provider suporta */
  supportedFields(): string[];

  /** Busca clientes brutos do ERP */
  fetchRawClients(creds: ErpCredentials): Promise<RawErpClient[]>;

  /** Testa conectividade com o ERP */
  testConnection(creds: ErpCredentials): Promise<TestResult>;

  /** Busca sinal bruto de um cliente (opcional — nem todo ERP suporta) */
  fetchRawSignal?(creds: ErpCredentials, clientId: string): Promise<RawSignalData>;
}

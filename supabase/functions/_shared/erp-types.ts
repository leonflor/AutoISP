// ═══ CAMADA 1 — Tipos Padrão ERP ═══
// Define tipos compartilhados entre camadas.
// Raw types e mapeamentos foram movidos para field-maps.ts

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

// ── ErpClient (usado pelo frontend/monitoramento em massa, NÃO pela IA) ──

export interface ErpClient {
  erp_id: string;
  contrato_id: string | null;
  cliente_erp_id: string | null;
  provider: ErpProvider;
  provider_name: string;
  nome: string;
  cpf_cnpj: string;
  data_vencimento: string | null;
  plano: string | null;
  login: string | null;
  status_internet: InternetStatus;
  conectado: boolean;
  online_raw: string | null;
  signal_db: number | null;
  signal_quality: SignalQuality;
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

// ── Contrato do Provider (Camada 3) ──

export interface ErpProviderDriver {
  supportedFields(): string[];
  testConnection(creds: ErpCredentials): Promise<TestResult>;
  fetchClientes?(creds: ErpCredentials, filtro?: Record<string, string>): Promise<any[]>;
  fetchContratos?(creds: ErpCredentials, filtro?: Record<string, string>): Promise<any[]>;
  fetchRadusuarios?(creds: ErpCredentials): Promise<any[]>;
  fetchFibra?(creds: ErpCredentials): Promise<any[]>;
  fetchFaturas?(creds: ErpCredentials, filtro: Record<string, string>): Promise<any[]>;
  fetchPix?(creds: ErpCredentials, idAreceber: string): Promise<any>;
  fetchBoleto?(creds: ErpCredentials, idAreceber: string): Promise<any>;
  fetchBoletoSms?(creds: ErpCredentials, idAreceber: string): Promise<any>;
  fetchLinhaDigitavel?(creds: ErpCredentials, idAreceber: string): Promise<any>;
}

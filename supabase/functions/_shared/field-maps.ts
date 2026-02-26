// ═══ Field Maps — Mapeamento declarativo ERP → Modelo ═══
// Cada provider tem uma função que transforma o `any` cru da API
// nos campos intermediários necessários para montar os Response Models.
// Equivalências documentadas em .lovable/plan.md

import type { ErpProvider } from "./erp-types.ts";

// ── Tipo auxiliar ──

type FieldMapper<T> = Record<ErpProvider, (raw: any) => T>;

// ══════════════════════════════════════════════════════════════
// ── Cliente (identificação básica) ──
// ══════════════════════════════════════════════════════════════

export interface MappedCliente {
  id: string;
  nome: string;
  cpf_cnpj: string;
}

export const mapCliente: FieldMapper<MappedCliente> = {
  ixc: (raw) => ({
    id: String(raw.id),
    nome: raw.razao || raw.fantasia || "",
    cpf_cnpj: raw.cnpj_cpf || "",
  }),
  sgp: (raw) => ({
    id: String(raw.id || raw.codigo || raw.cd_cliente || ""),
    nome: raw.nome || raw.razao_social || raw.nm_cliente || "",
    cpf_cnpj: raw.cpf_cnpj || raw.cpf || raw.cnpj || "",
  }),
  mk_solutions: (raw) => ({
    id: String(raw.CodigoCliente || raw.id || ""),
    nome: raw.NomeRazaoSocial || raw.nome || "",
    cpf_cnpj: raw.CpfCnpj || raw.cpf_cnpj || "",
  }),
  hubsoft: (raw) => ({
    id: String(raw.id || ""),
    nome: raw.nome || "",
    cpf_cnpj: raw.cpf_cnpj || "",
  }),
};

// ══════════════════════════════════════════════════════════════
// ── Contrato (com endereço) ──
// ══════════════════════════════════════════════════════════════

export interface MappedContrato {
  id: string;
  id_cliente: string;
  plano: string | null;
  dia_vencimento: string | null;
  status_internet: string;
  endereco: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
}

export const mapContrato: FieldMapper<MappedContrato> = {
  ixc: (raw) => ({
    id: String(raw.id),
    id_cliente: String(raw.id_cliente || ""),
    plano: raw.contrato || raw.id_vd_contrato || null,
    dia_vencimento: raw.dia_vencimento || null,
    status_internet: raw.status_internet || "normal",
    endereco: raw.endereco || null,
    numero: raw.numero || null,
    complemento: raw.complemento || null,
    bairro: raw.bairro || null,
    cidade: raw.cidade || null,
    estado: raw.estado || null,
    cep: raw.cep || null,
  }),
  sgp: (raw) => ({
    id: String(raw.id || ""),
    id_cliente: String(raw.id_cliente || ""),
    plano: raw.plano || null,
    dia_vencimento: raw.dia_vencimento || null,
    status_internet: raw.status_internet || "normal",
    endereco: raw.endereco || null,
    numero: raw.numero || null,
    complemento: raw.complemento || null,
    bairro: raw.bairro || null,
    cidade: raw.cidade || null,
    estado: raw.estado || null,
    cep: raw.cep || null,
  }),
  mk_solutions: (raw) => ({
    id: String(raw.id || ""),
    id_cliente: String(raw.id_cliente || ""),
    plano: raw.plano || null,
    dia_vencimento: raw.dia_vencimento || null,
    status_internet: raw.status_internet || "normal",
    endereco: raw.endereco || null,
    numero: raw.numero || null,
    complemento: raw.complemento || null,
    bairro: raw.bairro || null,
    cidade: raw.cidade || null,
    estado: raw.estado || null,
    cep: raw.cep || null,
  }),
  hubsoft: (raw) => ({
    id: String(raw.id || ""),
    id_cliente: String(raw.id_cliente || ""),
    plano: raw.plano || null,
    dia_vencimento: raw.dia_vencimento || null,
    status_internet: raw.status_internet || "normal",
    endereco: raw.endereco || null,
    numero: raw.numero || null,
    complemento: raw.complemento || null,
    bairro: raw.bairro || null,
    cidade: raw.cidade || null,
    estado: raw.estado || null,
    cep: raw.cep || null,
  }),
};

// ══════════════════════════════════════════════════════════════
// ── Fatura ──
// ══════════════════════════════════════════════════════════════

export interface MappedFatura {
  id: string;
  id_cliente: string;
  id_contrato: string;
  data_vencimento: string;
  valor: number;
  valor_pago: number | null;
  linha_digitavel: string | null;
  gateway_link: string | null;
}

export const mapFatura = (provider: ErpProvider, raw: any, defaults: { id_cliente: string; id_contrato: string }): MappedFatura => {
  if (provider === "ixc") {
    return {
      id: String(raw.id),
      id_cliente: String(raw.id_cliente || defaults.id_cliente),
      id_contrato: defaults.id_contrato,
      data_vencimento: raw.data_vencimento || "",
      valor: parseFloat(raw.valor || "0"),
      valor_pago: raw.valor_pago ? parseFloat(raw.valor_pago) : null,
      linha_digitavel: raw.linha_digitavel || null,
      gateway_link: raw.gateway_link || raw.url_gateway || null,
    };
  }
  return {
    id: String(raw.id || ""),
    id_cliente: defaults.id_cliente,
    id_contrato: defaults.id_contrato,
    data_vencimento: raw.data_vencimento || "",
    valor: parseFloat(raw.valor || "0"),
    valor_pago: raw.valor_pago ? parseFloat(raw.valor_pago) : null,
    linha_digitavel: raw.linha_digitavel || null,
    gateway_link: raw.gateway_link || null,
  };
};

// ══════════════════════════════════════════════════════════════
// ── Radusuario (usado no monitoramento em massa, não pela IA) ──
// ══════════════════════════════════════════════════════════════

export interface MappedRadusuario {
  id: string;
  id_cliente: string;
  id_contrato: string;
  login: string;
  online: string;
}

export const mapRadusuario: FieldMapper<MappedRadusuario> = {
  ixc: (raw) => ({
    id: String(raw.id),
    id_cliente: String(raw.id_cliente || ""),
    id_contrato: String(raw.id_contrato || ""),
    login: raw.login || "",
    online: raw.online === "S" ? "S" : "N",
  }),
  sgp: (raw) => ({ id: String(raw.id || ""), id_cliente: "", id_contrato: "", login: "", online: "N" }),
  mk_solutions: (raw) => ({ id: String(raw.id || ""), id_cliente: "", id_contrato: "", login: "", online: "N" }),
  hubsoft: (raw) => ({ id: String(raw.id || ""), id_cliente: "", id_contrato: "", login: "", online: "N" }),
};

// ══════════════════════════════════════════════════════════════
// ── Fibra (sinal óptico, monitoramento em massa) ──
// ══════════════════════════════════════════════════════════════

export interface MappedFibra {
  id: string;
  id_login: string;
  sinal_rx: number | null;
  sinal_tx: number | null;
}

export const mapFibra: FieldMapper<MappedFibra> = {
  ixc: (raw) => {
    const rx = raw.sinal_rx ? parseFloat(raw.sinal_rx) : NaN;
    const tx = raw.sinal_tx ? parseFloat(raw.sinal_tx) : NaN;
    return {
      id: String(raw.id),
      id_login: String(raw.id_login || ""),
      sinal_rx: !isNaN(rx) ? rx : null,
      sinal_tx: !isNaN(tx) ? tx : null,
    };
  },
  sgp: (raw) => ({ id: String(raw.id || ""), id_login: "", sinal_rx: null, sinal_tx: null }),
  mk_solutions: (raw) => ({ id: String(raw.id || ""), id_login: "", sinal_rx: null, sinal_tx: null }),
  hubsoft: (raw) => ({ id: String(raw.id || ""), id_login: "", sinal_rx: null, sinal_tx: null }),
};

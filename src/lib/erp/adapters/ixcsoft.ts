// ═══ IXCSoft Adapter — Normalização Canônica ═══
// Encapsula chamadas às Edge Functions existentes e normaliza
// respostas IXC para os tipos canônicos do motor de IA.
// NÃO acessa a API IXC diretamente — credenciais ficam server-side.

import type {
  ERPAdapter,
  ERPAdapterConfig,
  CustomerProfile,
  Invoice,
  ServiceStatus,
  Contract,
} from '../types';

const SOURCE = 'ixcsoft';

// ── Helpers de normalização ──

function stripDocument(doc: string): string {
  return (doc || '').replace(/\D/g, '');
}

function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 10) return null;
  if (digits.startsWith('55')) return `+${digits}`;
  return `+55${digits}`;
}

/** dd/mm/aaaa ou dd-mm-aaaa → YYYY-MM-DD */
function normalizeDate(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const parts = raw.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
  if (parts) return `${parts[3]}-${parts[2]}-${parts[1]}`;
  // já está em ISO ou YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  return raw;
}

function toCents(value: string | number | null | undefined): number {
  if (value == null) return 0;
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(n) ? 0 : Math.round(n * 100);
}

type CanonicalStatus = 'active' | 'suspended' | 'cancelled' | 'pending';

function normalizeClientStatus(raw: string | null | undefined): CanonicalStatus {
  if (!raw) return 'pending';
  const lower = raw.toLowerCase().trim();
  if (lower === 'ativo' || lower === 'a') return 'active';
  if (lower === 'bloqueado' || lower === 'inadimplente' || lower === 'suspenso') return 'suspended';
  if (lower === 'cancelado' || lower === 'desativado' || lower === 'inativo') return 'cancelled';
  return 'pending';
}

type InvoiceStatus = 'open' | 'paid' | 'overdue' | 'cancelled';

function normalizeInvoiceStatus(raw: string | null | undefined, dueDate: string | null): InvoiceStatus {
  if (!raw) return 'open';
  const lower = raw.toLowerCase().trim();
  if (lower === 'l' || lower === 'liquidado' || lower === 'pago') return 'paid';
  if (lower === 'c' || lower === 'cancelado') return 'cancelled';
  // Check if overdue: status aberto + vencido
  if (dueDate) {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (due < today) return 'overdue';
  }
  return 'open';
}

function normalizeSignal(rxDb: number | null): 'good' | 'fair' | 'poor' | null {
  if (rxDb == null) return null;
  if (rxDb >= -25) return 'good';
  if (rxDb >= -28) return 'fair';
  return 'poor';
}

function now(): string {
  return new Date().toISOString();
}

// ── Edge Function caller ──

async function callEdgeFunction(
  supabase: any,
  fnName: string,
  payload: Record<string, unknown>
): Promise<any> {
  const { data, error } = await supabase.functions.invoke(fnName, {
    body: payload,
  });
  if (error) throw new Error(`Edge Function "${fnName}" falhou: ${error.message}`);
  return data;
}

// ── Adapter ──

export class IXCSoftAdapter implements ERPAdapter {
  private supabase: any;
  private ispId: string;

  constructor(config: ERPAdapterConfig) {
    this.supabase = config.supabaseClient;
    this.ispId = config.ispId;
  }

  async getCustomerByDocument(document: string): Promise<CustomerProfile> {
    const cleanDoc = stripDocument(document);
    const result = await callEdgeFunction(this.supabase, 'fetch-erp-clients', {
      isp_id: this.ispId,
      filtro: { cpf_cnpj: cleanDoc },
    });

    const clients = result?.clients || result?.data || [];
    if (!clients.length) {
      throw new Error(`Cliente não encontrado com documento: ${cleanDoc}`);
    }

    return this.mapCustomer(clients[0]);
  }

  async getCustomerByEmail(email: string): Promise<CustomerProfile> {
    const result = await callEdgeFunction(this.supabase, 'fetch-erp-clients', {
      isp_id: this.ispId,
      filtro: { email },
    });

    const clients = result?.clients || result?.data || [];
    if (!clients.length) {
      throw new Error(`Cliente não encontrado com email: ${email}`);
    }

    return this.mapCustomer(clients[0]);
  }

  async getOpenInvoices(customerId: string): Promise<Invoice[]> {
    const result = await callEdgeFunction(this.supabase, 'fetch-erp-clients', {
      isp_id: this.ispId,
      filtro: { id_cliente: customerId, include_invoices: 'true' },
    });

    const invoices = result?.invoices || result?.faturas || [];
    const fetchedAt = now();

    return invoices.map((raw: any) => this.mapInvoice(raw, customerId, fetchedAt));
  }

  async getServiceStatus(customerId: string): Promise<ServiceStatus> {
    const result = await callEdgeFunction(this.supabase, 'fetch-erp-clients', {
      isp_id: this.ispId,
      filtro: { id_cliente: customerId, include_status: 'true' },
    });

    const clients = result?.clients || result?.data || [];
    const client = clients[0] || {};
    const fetchedAt = now();

    const online = client.online === 'S' || client.conectado === true;
    const signalDb = client.signal_db != null ? parseFloat(client.signal_db) : null;

    return {
      customer_id: customerId,
      connection_status: online ? 'online' : 'offline',
      last_seen_at: null,
      signal_level: normalizeSignal(isNaN(signalDb as number) ? null : signalDb),
      equipment_id: client.login || null,
      has_open_ticket: false,
      _source_erp: SOURCE,
      _fetched_at: fetchedAt,
    };
  }

  async getContract(customerId: string): Promise<Contract> {
    const result = await callEdgeFunction(this.supabase, 'fetch-erp-clients', {
      isp_id: this.ispId,
      filtro: { id_cliente: customerId, include_contract: 'true' },
    });

    const contracts = result?.contracts || result?.contratos || [];
    if (!contracts.length) {
      throw new Error(`Contrato não encontrado para cliente: ${customerId}`);
    }

    const raw = contracts[0];
    const fetchedAt = now();

    return {
      id: String(raw.id || ''),
      customer_id: customerId,
      status: normalizeClientStatus(raw.status_internet || raw.status),
      plan_name: raw.plano || raw.contrato || 'Sem plano',
      plan_speed_mbps: raw.velocidade ? parseFloat(raw.velocidade) : 0,
      monthly_amount_cents: toCents(raw.valor || raw.valor_mensal),
      start_date: normalizeDate(raw.data_inicio || raw.created_at) || '',
      end_date: normalizeDate(raw.data_fim) || null,
      _source_erp: SOURCE,
      _fetched_at: fetchedAt,
    };
  }

  // ── Mapeadores privados ──

  private mapCustomer(raw: any): CustomerProfile {
    const fetchedAt = now();
    const hasAddress = raw.endereco || raw.cidade;

    return {
      id: String(raw.erp_id || raw.id || ''),
      full_name: raw.nome || raw.razao || raw.fantasia || '',
      document: stripDocument(raw.cpf_cnpj || raw.cnpj_cpf || ''),
      email: raw.email || null,
      phone: normalizePhone(raw.telefone_celular || raw.telefone || raw.phone),
      status: normalizeClientStatus(raw.status_internet || raw.status),
      plan_name: raw.plano || raw.plan_name || null,
      plan_speed_mbps: raw.velocidade ? parseFloat(raw.velocidade) : null,
      address: hasAddress
        ? {
            street: raw.endereco || '',
            city: raw.cidade || '',
            state: raw.estado || '',
            zip: (raw.cep || '').replace(/\D/g, ''),
          }
        : null,
      _source_erp: SOURCE,
      _fetched_at: fetchedAt,
    };
  }

  private mapInvoice(raw: any, customerId: string, fetchedAt: string): Invoice {
    const dueDateNorm = normalizeDate(raw.data_vencimento) || '';

    return {
      id: String(raw.id || ''),
      customer_id: customerId,
      amount_cents: toCents(raw.valor),
      due_date: dueDateNorm,
      status: normalizeInvoiceStatus(raw.status, dueDateNorm),
      payment_link: raw.gateway_link || raw.url_gateway || null,
      barcode: raw.linha_digitavel || null,
      description: raw.observacao || raw.descricao || null,
      _source_erp: SOURCE,
      _fetched_at: fetchedAt,
    };
  }
}

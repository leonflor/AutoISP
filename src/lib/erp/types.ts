// ═══ ERP Canonical Types ═══
// Tipos canônicos que o motor de IA SEMPRE recebe,
// independente do ERP do tenant.

export interface CustomerProfile {
  id: string;
  full_name: string;
  document: string;           // CPF/CNPJ sem pontuação
  email: string | null;
  phone: string | null;       // sempre E.164: +5511999999999
  status: 'active' | 'suspended' | 'cancelled' | 'pending';
  plan_name: string | null;
  plan_speed_mbps: number | null;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  } | null;
  _source_erp: string;
  _fetched_at: string;        // ISO 8601
}

export interface Invoice {
  id: string;
  customer_id: string;
  amount_cents: number;        // SEMPRE centavos — nunca float
  due_date: string;            // YYYY-MM-DD
  status: 'open' | 'paid' | 'overdue' | 'cancelled';
  payment_link: string | null;
  barcode: string | null;      // linha digitável
  description: string | null;
  _source_erp: string;
  _fetched_at: string;
}

export interface ServiceStatus {
  customer_id: string;
  connection_status: 'online' | 'offline' | 'partial' | 'maintenance' | 'unknown';
  last_seen_at: string | null;
  signal_level: 'good' | 'fair' | 'poor' | null;
  equipment_id: string | null;
  has_open_ticket: boolean;
  _source_erp: string;
  _fetched_at: string;
}

export interface Contract {
  id: string;
  customer_id: string;
  status: 'active' | 'suspended' | 'cancelled' | 'pending';
  plan_name: string;
  plan_speed_mbps: number;
  monthly_amount_cents: number;
  start_date: string;
  end_date: string | null;
  _source_erp: string;
  _fetched_at: string;
}

export interface ERPAdapterConfig {
  supabaseClient: any;
  ispId: string;
}

export interface ERPAdapter {
  getCustomerByDocument(document: string): Promise<CustomerProfile>;
  getCustomerByEmail(email: string): Promise<CustomerProfile>;
  getOpenInvoices(customerId: string): Promise<Invoice[]>;
  getServiceStatus(customerId: string): Promise<ServiceStatus>;
  getContract(customerId: string): Promise<Contract>;
}

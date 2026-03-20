// ═══ Tool Result Formatter ═══
// Converte resultado canônico JSON em texto legível
// que será injetado de volta no prompt para a IA.

import type { CustomerProfile, Invoice, ServiceStatus, Contract } from '../erp/types';

// ── Helpers ──

function formatCurrency(cents: number): string {
  const value = (cents / 100).toFixed(2).replace('.', ',');
  return `R$ ${value}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const parts = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!parts) return iso;
  return `${parts[3]}/${parts[2]}/${parts[1]}`;
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Ativo',
  suspended: 'Suspenso',
  cancelled: 'Cancelado',
  pending: 'Pendente',
  open: 'Em aberto',
  paid: 'Pago',
  overdue: 'Vencido',
  online: 'Online',
  offline: 'Offline',
  partial: 'Parcial',
  maintenance: 'Em manutenção',
  unknown: 'Desconhecido',
};

function statusLabel(s: string | null | undefined): string {
  return (s && STATUS_LABELS[s]) || s || 'Desconhecido';
}

const SIGNAL_LABELS: Record<string, string> = {
  good: 'Bom',
  fair: 'Regular',
  poor: 'Ruim',
};

// ── Formatadores por tool ──

function formatCustomer(data: CustomerProfile): string {
  const lines = [
    `👤 ${data.full_name}`,
    `Documento: ${data.document}`,
    `Status: ${statusLabel(data.status)}`,
  ];
  if (data.plan_name) lines.push(`Plano: ${data.plan_name}`);
  if (data.plan_speed_mbps) lines.push(`Velocidade: ${data.plan_speed_mbps} Mbps`);
  if (data.email) lines.push(`E-mail: ${data.email}`);
  if (data.phone) lines.push(`Telefone: ${data.phone}`);
  if (data.address) {
    lines.push(`Endereço: ${data.address.street}, ${data.address.city}/${data.address.state} — CEP ${data.address.zip}`);
  }
  return lines.join('\n');
}

function formatInvoices(data: Invoice[]): string {
  if (!data.length) return 'Nenhum boleto em aberto encontrado.';

  const total = data.reduce((sum, inv) => sum + inv.amount_cents, 0);
  const header =
    data.length === 1
      ? 'Você tem 1 boleto em aberto:'
      : `Você tem ${data.length} boletos em aberto:`;

  const items = data.map((inv) => {
    const status = statusLabel(inv.status);
    return `• ${formatCurrency(inv.amount_cents)} — vence em ${formatDate(inv.due_date)} (${status})`;
  });

  const footer = data.length > 1 ? `\nTotal: ${formatCurrency(total)}` : '';
  return [header, ...items, footer].filter(Boolean).join('\n');
}

function formatServiceStatus(data: ServiceStatus): string {
  const lines = [
    `Conexão: ${statusLabel(data.connection_status)}`,
  ];
  if (data.signal_level) lines.push(`Sinal: ${SIGNAL_LABELS[data.signal_level] || data.signal_level}`);
  if (data.equipment_id) lines.push(`Equipamento: ${data.equipment_id}`);
  if (data.last_seen_at) lines.push(`Último acesso: ${formatDate(data.last_seen_at)}`);
  if (data.has_open_ticket) lines.push('⚠️ Existe um chamado aberto para este cliente.');
  return lines.join('\n');
}

function formatContract(data: Contract): string {
  const lines = [
    `Contrato: ${data.plan_name}`,
    `Velocidade: ${data.plan_speed_mbps} Mbps`,
    `Valor mensal: ${formatCurrency(data.monthly_amount_cents)}`,
    `Status: ${statusLabel(data.status)}`,
    `Início: ${formatDate(data.start_date)}`,
  ];
  if (data.end_date) lines.push(`Término: ${formatDate(data.end_date)}`);
  return lines.join('\n');
}

// ── Roteador principal ──

export function formatToolResultForPrompt(toolName: string, rawJson: string): string {
  try {
    const data = JSON.parse(rawJson);

    // Propaga erros do executor diretamente
    if (data?.error) return data.error;

    switch (toolName) {
      case 'get_customer_by_document':
      case 'get_customer_by_email':
        return formatCustomer(data as CustomerProfile);

      case 'get_open_invoices':
        return formatInvoices(data as Invoice[]);

      case 'get_service_status':
        return formatServiceStatus(data as ServiceStatus);

      case 'get_contract':
        return formatContract(data as Contract);

      case 'generate_payment_link':
      case 'send_invoice_by_email':
        return data?.error || JSON.stringify(data);

      default:
        return JSON.stringify(data);
    }
  } catch {
    return rawJson;
  }
}

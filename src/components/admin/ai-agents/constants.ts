import { 
  MessageCircle, 
  FileText, 
  Ticket, 
  Wifi, 
  DollarSign, 
  Calendar, 
  Package, 
  TrendingUp, 
  Wrench, 
  UserPlus,
  type LucideIcon
} from 'lucide-react';

export interface FeatureTag {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const AGENT_FEATURE_TAGS: FeatureTag[] = [
  { id: 'responde_duvidas', label: 'Responde dúvidas', icon: MessageCircle },
  { id: 'consulta_faturas', label: 'Consulta faturas', icon: FileText },
  { id: 'abre_chamados', label: 'Abre chamados', icon: Ticket },
  { id: 'verifica_conexao', label: 'Verifica status conexão', icon: Wifi },
  { id: 'negocia_debitos', label: 'Negocia débitos', icon: DollarSign },
  { id: 'registra_promessas', label: 'Registra promessas', icon: Calendar },
  { id: 'apresenta_planos', label: 'Apresenta planos', icon: Package },
  { id: 'realiza_upgrades', label: 'Realiza upgrades', icon: TrendingUp },
  { id: 'diagnostico_tecnico', label: 'Diagnóstico técnico', icon: Wrench },
  { id: 'escala_humano', label: 'Escala para humano', icon: UserPlus },
];

export const AI_MODELS = [
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini (rápido e econômico)' },
  { value: 'gpt-4o', label: 'GPT-4o (mais capaz)' },
  { value: 'google/gemini-2.0-flash-001', label: 'Gemini Flash (muito rápido)' },
  { value: 'google/gemini-2.5-pro-preview', label: 'Gemini Pro (avançado)' },
  { value: 'anthropic/claude-sonnet-4', label: 'Claude Sonnet (análise)' },
] as const;

export const AGENT_TYPES = [
  { value: 'atendente', label: 'Atendente' },
  { value: 'cobrador', label: 'Cobrador' },
  { value: 'vendedor', label: 'Vendedor' },
  { value: 'analista', label: 'Analista' },
  { value: 'suporte', label: 'Suporte' },
] as const;

export const AGENT_SCOPES = [
  { value: 'tenant', label: 'ISPs (Tenant)', description: 'Disponível para ISPs ativarem' },
  { value: 'platform', label: 'Plataforma', description: 'Uso interno do SaaS' },
] as const;

export const DATA_ACCESS_OPTIONS = [
  { value: 'isps_count', label: 'Contagem de ISPs' },
  { value: 'isps_aggregate', label: 'Dados agregados de ISPs' },
  { value: 'subscribers_aggregate', label: 'Dados agregados de assinantes' },
  { value: 'tickets_aggregate', label: 'Dados agregados de tickets' },
  { value: 'invoices_aggregate', label: 'Dados agregados de faturas' },
] as const;

export const SECURITY_PLACEHOLDERS = [
  { placeholder: '{ISP_NAME}', description: 'Nome do provedor (ISP)' },
  { placeholder: '{ISP_ID}', description: 'ID único do provedor' },
  { placeholder: '{USER_NAME}', description: 'Nome do usuário logado' },
  { placeholder: '{AGENT_NAME}', description: 'Nome do agente' },
  { placeholder: '{CURRENT_DATE}', description: 'Data atual' },
] as const;

export const APPLIES_TO_OPTIONS = [
  { value: 'all', label: 'Todos os agentes', color: 'bg-primary/10 text-primary' },
  { value: 'tenant', label: 'Apenas ISPs', color: 'bg-blue-500/10 text-blue-600' },
  { value: 'platform', label: 'Apenas Plataforma', color: 'bg-purple-500/10 text-purple-600' },
] as const;

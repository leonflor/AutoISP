import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Phone, 
  MessageSquare, 
  Shield, 
  Database, 
  Code, 
  AlertTriangle,
  DollarSign,
  Zap,
  Lock,
  RefreshCw,
  Bell,
  Key,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Server,
  Users,
  FileText,
  Settings,
  HelpCircle
} from "lucide-react";

const SMSIntegration = () => {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
              <Phone className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">
                INT-07 — SMS Gateway (Twilio/Zenvia)
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Gateway multi-provider para envio de SMS transacionais, OTP/2FA, fallback do WhatsApp 
                e notificações de emergência com alta disponibilidade e entregabilidade.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
              Comunicação
            </Badge>
            <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20">
              Criticidade Média-Alta
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Accordion type="multiple" className="w-full">
          {/* Visão Geral */}
          <AccordionItem value="overview">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Visão Geral
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <div>
                  <h4 className="text-sm font-medium mb-2">Funcionalidade</h4>
                  <p className="text-sm text-muted-foreground">
                    Gateway de SMS multi-provider que permite envio de mensagens transacionais através 
                    de Twilio (cobertura global) ou Zenvia (foco Brasil). Suporta fallback automático 
                    quando WhatsApp não está disponível, OTP para autenticação dois fatores, 
                    e notificações críticas de emergência com alta prioridade.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Casos de Uso</h4>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
                      <Zap className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium">SMS Transacionais</span>
                        <p className="text-xs text-muted-foreground">Confirmações, recibos, alertas de sistema</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
                      <RefreshCw className="h-4 w-4 text-blue-500 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium">Fallback WhatsApp</span>
                        <p className="text-xs text-muted-foreground">Quando WhatsApp falha ou não está disponível</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
                      <Bell className="h-4 w-4 text-red-500 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium">Emergência</span>
                        <p className="text-xs text-muted-foreground">Manutenções críticas, falhas de serviço</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
                      <Key className="h-4 w-4 text-green-500 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium">OTP/2FA</span>
                        <p className="text-xs text-muted-foreground">Códigos de verificação para login seguro</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
                      <DollarSign className="h-4 w-4 text-emerald-500 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium">Lembretes de Pagamento</span>
                        <p className="text-xs text-muted-foreground">Notificações de vencimento e cobrança</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
                      <CheckCircle2 className="h-4 w-4 text-purple-500 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium">Confirmações</span>
                        <p className="text-xs text-muted-foreground">Agendamentos, visitas técnicas, entregas</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Arquitetura Multi-tenant</h4>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
{`┌─────────────────────────────────────────────────────────────────┐
│                      TENANT (ISP Cliente)                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │   Config    │    │   Config    │    │   Config    │          │
│  │   Twilio    │    │   Zenvia    │    │   Fallback  │          │
│  │  (Global)   │    │  (Brasil)   │    │   Rules     │          │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘          │
│         │                  │                  │                 │
│         └──────────────────┼──────────────────┘                 │
│                            ▼                                    │
│              ┌─────────────────────────┐                        │
│              │     SMS Router Edge     │                        │
│              │       Function          │                        │
│              └────────────┬────────────┘                        │
│                           │                                     │
│         ┌─────────────────┼─────────────────┐                   │
│         ▼                 ▼                 ▼                   │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐           │
│  │   Twilio    │   │   Zenvia    │   │  Fallback   │           │
│  │    API      │   │    API      │   │  (outro     │           │
│  │             │   │             │   │  provider)  │           │
│  └─────────────┘   └─────────────┘   └─────────────┘           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Webhook Handler                          ││
│  │    (Status Updates: delivered, failed, undelivered)         ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘`}
                  </pre>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Fluxos Detalhados */}
          <AccordionItem value="flows">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Fluxos Detalhados
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6 pt-2">
                {/* Fluxo de Envio com Fallback */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Fluxo 1: Envio de SMS com Fallback</h4>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
{`┌──────────┐     ┌──────────────┐     ┌────────────────┐
│ Frontend │────▶│ send-sms     │────▶│ Check WhatsApp │
│ Request  │     │ Edge Func    │     │ Status         │
└──────────┘     └──────────────┘     └───────┬────────┘
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
              WhatsApp OK?                                    WhatsApp Failed
                      │                                               │
                      ▼                                               ▼
              ┌─────────────┐                                ┌─────────────┐
              │ Send via    │                                │ Get SMS     │
              │ WhatsApp    │                                │ Provider    │
              └─────────────┘                                │ Config      │
                                                             └──────┬──────┘
                                                                    │
                                              ┌─────────────────────┴─────────────────────┐
                                              ▼                                           ▼
                                       Provider = Twilio                           Provider = Zenvia
                                              │                                           │
                                              ▼                                           ▼
                                       ┌─────────────┐                             ┌─────────────┐
                                       │ Twilio API  │                             │ Zenvia API  │
                                       │ POST /SMS   │                             │ POST /sms   │
                                       └──────┬──────┘                             └──────┬──────┘
                                              │                                           │
                                              └─────────────────────┬─────────────────────┘
                                                                    ▼
                                                             ┌─────────────┐
                                                             │ Save to     │
                                                             │ sms_messages│
                                                             └─────────────┘`}
                  </pre>
                </div>

                {/* Fluxo OTP/2FA */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Fluxo 2: OTP/2FA (Autenticação Dois Fatores)</h4>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
{`┌──────────┐     ┌──────────────┐     ┌────────────────┐     ┌─────────────┐
│ User     │────▶│ Request OTP  │────▶│ Generate Code  │────▶│ Hash & Save │
│ Login    │     │ Edge Func    │     │ (6 digits)     │     │ sms_otp     │
└──────────┘     └──────────────┘     └────────────────┘     └──────┬──────┘
                                                                    │
                                                                    ▼
                                                             ┌─────────────┐
                                                             │ Send SMS    │
                                                             │ with Code   │
                                                             └──────┬──────┘
                                                                    │
                                                                    ▼
                                                             ┌─────────────┐
                                                             │ User Enters │
                                                             │ Code        │
                                                             └──────┬──────┘
                                                                    │
                                                                    ▼
┌──────────┐     ┌──────────────┐     ┌────────────────┐     ┌─────────────┐
│ Access   │◀────│ Return Token │◀────│ Verify Hash    │◀────│ Verify OTP  │
│ Granted  │     │ + Session    │     │ + Expiry       │     │ Edge Func   │
└──────────┘     └──────────────┘     └────────────────┘     └─────────────┘

⏱️ OTP Expiry: 5 minutos
🔄 Max Attempts: 3 tentativas
🔒 Hash: SHA-256 com salt`}
                  </pre>
                </div>

                {/* Fluxo Webhook */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Fluxo 3: Webhook de Status</h4>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
{`┌─────────────┐     ┌──────────────┐     ┌────────────────┐
│ Twilio/     │────▶│ sms-webhook  │────▶│ Validate       │
│ Zenvia POST │     │ Edge Func    │     │ Signature      │
└─────────────┘     └──────────────┘     └───────┬────────┘
                                                 │
                                    Valid?  ─────┴───── Invalid?
                                      │                    │
                                      ▼                    ▼
                               ┌─────────────┐      ┌─────────────┐
                               │ Update      │      │ Log Attack  │
                               │ sms_messages│      │ Return 401  │
                               │ status      │      └─────────────┘
                               └──────┬──────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
             Status: sent     Status: delivered  Status: failed
                    │                 │                 │
                    ▼                 ▼                 ▼
             Mark as sent     Mark delivered      Log error
                              Update metrics      Trigger retry?`}
                  </pre>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Configuração e Secrets */}
          <AccordionItem value="config">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configuração e Secrets
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <div>
                  <h4 className="text-sm font-medium mb-2">Secrets Twilio (Edge Function)</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3 font-medium">Secret</th>
                          <th className="text-left py-2 px-3 font-medium">Descrição</th>
                          <th className="text-left py-2 px-3 font-medium">Escopo</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3 font-mono text-blue-600">TWILIO_ACCOUNT_SID</td>
                          <td className="py-2 px-3 text-muted-foreground">Account SID da conta Twilio</td>
                          <td className="py-2 px-3"><Badge variant="outline" className="text-xs">Plataforma</Badge></td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3 font-mono text-blue-600">TWILIO_AUTH_TOKEN</td>
                          <td className="py-2 px-3 text-muted-foreground">Auth Token para autenticação</td>
                          <td className="py-2 px-3"><Badge variant="outline" className="text-xs">Plataforma</Badge></td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3 font-mono text-blue-600">TWILIO_PHONE_NUMBER</td>
                          <td className="py-2 px-3 text-muted-foreground">Número remetente (formato E.164)</td>
                          <td className="py-2 px-3"><Badge variant="outline" className="text-xs">Plataforma</Badge></td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3 font-mono text-blue-600">TWILIO_WEBHOOK_SECRET</td>
                          <td className="py-2 px-3 text-muted-foreground">Secret para validar webhooks</td>
                          <td className="py-2 px-3"><Badge variant="outline" className="text-xs">Plataforma</Badge></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Secrets Zenvia (Edge Function)</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3 font-medium">Secret</th>
                          <th className="text-left py-2 px-3 font-medium">Descrição</th>
                          <th className="text-left py-2 px-3 font-medium">Escopo</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3 font-mono text-purple-600">ZENVIA_API_TOKEN</td>
                          <td className="py-2 px-3 text-muted-foreground">Token de API Zenvia</td>
                          <td className="py-2 px-3"><Badge variant="outline" className="text-xs">Plataforma</Badge></td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3 font-mono text-purple-600">ZENVIA_SENDER_ID</td>
                          <td className="py-2 px-3 text-muted-foreground">ID do remetente configurado</td>
                          <td className="py-2 px-3"><Badge variant="outline" className="text-xs">Plataforma</Badge></td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3 font-mono text-purple-600">ZENVIA_WEBHOOK_TOKEN</td>
                          <td className="py-2 px-3 text-muted-foreground">Token para validar callbacks</td>
                          <td className="py-2 px-3"><Badge variant="outline" className="text-xs">Plataforma</Badge></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Configuração por Tenant (Banco)</h4>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
{`-- Cada tenant pode ter configuração própria
-- Credenciais são criptografadas com tenant_encryption_key

tenant_sms_config:
  - provider: 'twilio' | 'zenvia'
  - account_sid_encrypted: string (Twilio)
  - auth_token_encrypted: string (Twilio)
  - api_token_encrypted: string (Zenvia)
  - sender_id: string
  - fallback_enabled: boolean
  - fallback_provider: 'twilio' | 'zenvia' | null`}
                  </pre>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Schema de Dados */}
          <AccordionItem value="schema">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Estrutura de Dados (Schema)
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
{`-- =============================================
-- Tabela: sms_configs
-- Configuração de SMS por tenant
-- =============================================
CREATE TABLE sms_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Provider Configuration
  provider TEXT NOT NULL CHECK (provider IN ('twilio', 'zenvia')),
  is_active BOOLEAN DEFAULT true,
  
  -- Twilio Credentials (encrypted)
  twilio_account_sid_encrypted TEXT,
  twilio_auth_token_encrypted TEXT,
  twilio_phone_number TEXT,
  
  -- Zenvia Credentials (encrypted)
  zenvia_api_token_encrypted TEXT,
  zenvia_sender_id TEXT,
  
  -- Fallback Configuration
  fallback_enabled BOOLEAN DEFAULT false,
  fallback_provider TEXT CHECK (fallback_provider IN ('twilio', 'zenvia')),
  fallback_after_attempts INTEGER DEFAULT 2,
  
  -- Rate Limiting
  daily_limit INTEGER DEFAULT 1000,
  per_minute_limit INTEGER DEFAULT 60,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(tenant_id, provider)
);

-- =============================================
-- Tabela: sms_messages
-- Log de todas as mensagens SMS enviadas
-- =============================================
CREATE TABLE sms_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  config_id UUID REFERENCES sms_configs(id),
  
  -- Recipient
  to_phone TEXT NOT NULL,
  to_user_id UUID REFERENCES auth.users(id),
  
  -- Message Content
  message_body TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN (
    'transactional', 'otp', 'emergency', 'reminder', 'confirmation', 'fallback'
  )),
  
  -- Provider Info
  provider TEXT NOT NULL CHECK (provider IN ('twilio', 'zenvia')),
  provider_message_id TEXT,
  provider_response JSONB,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'queued', 'sent', 'delivered', 'failed', 'undelivered'
  )),
  status_updated_at TIMESTAMPTZ,
  error_code TEXT,
  error_message TEXT,
  
  -- Fallback Tracking
  is_fallback BOOLEAN DEFAULT false,
  original_channel TEXT, -- 'whatsapp' se veio de fallback
  fallback_attempts INTEGER DEFAULT 0,
  
  -- Cost Tracking
  segments INTEGER DEFAULT 1,
  cost_amount DECIMAL(10,4),
  cost_currency TEXT DEFAULT 'USD',
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Índices
  CONSTRAINT valid_phone CHECK (to_phone ~ '^\\+[1-9]\\d{1,14}$')
);

CREATE INDEX idx_sms_messages_tenant ON sms_messages(tenant_id);
CREATE INDEX idx_sms_messages_status ON sms_messages(status);
CREATE INDEX idx_sms_messages_type ON sms_messages(message_type);
CREATE INDEX idx_sms_messages_created ON sms_messages(created_at DESC);
CREATE INDEX idx_sms_messages_provider_id ON sms_messages(provider_message_id);

-- =============================================
-- Tabela: sms_otp_codes
-- Códigos OTP para autenticação 2FA
-- =============================================
CREATE TABLE sms_otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- User & Phone
  user_id UUID REFERENCES auth.users(id),
  phone TEXT NOT NULL,
  
  -- OTP Data
  code_hash TEXT NOT NULL, -- SHA-256 hash do código
  purpose TEXT NOT NULL CHECK (purpose IN (
    'login', 'password_reset', 'phone_verify', 'transaction'
  )),
  
  -- Expiry & Attempts
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  
  -- Status
  verified_at TIMESTAMPTZ,
  is_used BOOLEAN DEFAULT false,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sms_otp_phone ON sms_otp_codes(phone, purpose) 
  WHERE is_used = false AND expires_at > now();

-- =============================================
-- Tabela: sms_webhooks
-- Log de webhooks recebidos dos providers
-- =============================================
CREATE TABLE sms_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Provider Info
  provider TEXT NOT NULL CHECK (provider IN ('twilio', 'zenvia')),
  
  -- Webhook Data
  message_id UUID REFERENCES sms_messages(id),
  provider_message_id TEXT,
  event_type TEXT NOT NULL, -- 'sent', 'delivered', 'failed', etc.
  
  -- Raw Data
  raw_payload JSONB NOT NULL,
  headers JSONB,
  
  -- Validation
  signature_valid BOOLEAN,
  
  -- Processing
  processed_at TIMESTAMPTZ,
  processing_error TEXT,
  
  -- Metadata
  received_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sms_webhooks_provider_msg ON sms_webhooks(provider_message_id);

-- =============================================
-- RLS Policies
-- =============================================
ALTER TABLE sms_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_webhooks ENABLE ROW LEVEL SECURITY;

-- Configs: apenas admins do tenant
CREATE POLICY "sms_configs_tenant_admin" ON sms_configs
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Messages: usuários do tenant podem ver
CREATE POLICY "sms_messages_tenant_access" ON sms_messages
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    )
  );

-- OTP: apenas o próprio usuário
CREATE POLICY "sms_otp_own_user" ON sms_otp_codes
  FOR ALL USING (user_id = auth.uid());`}
                </pre>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Implementação Frontend */}
          <AccordionItem value="frontend">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Implementação Frontend
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <div>
                  <h4 className="text-sm font-medium mb-2">Hook: useSmsConfig</h4>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
{`// hooks/useSmsConfig.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SmsConfig {
  id: string;
  tenant_id: string;
  provider: 'twilio' | 'zenvia';
  is_active: boolean;
  twilio_phone_number?: string;
  zenvia_sender_id?: string;
  fallback_enabled: boolean;
  fallback_provider?: 'twilio' | 'zenvia';
  daily_limit: number;
  per_minute_limit: number;
}

export function useSmsConfig(tenantId: string) {
  const queryClient = useQueryClient();
  
  // Buscar configurações
  const { data: configs, isLoading } = useQuery({
    queryKey: ['sms-configs', tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sms_configs')
        .select('*')
        .eq('tenant_id', tenantId);
      
      if (error) throw error;
      return data as SmsConfig[];
    },
    enabled: !!tenantId,
  });

  // Atualizar configuração
  const updateConfig = useMutation({
    mutationFn: async (updates: Partial<SmsConfig> & { id: string }) => {
      const { data, error } = await supabase
        .from('sms_configs')
        .update(updates)
        .eq('id', updates.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-configs', tenantId] });
    },
  });

  // Testar configuração
  const testConfig = useMutation({
    mutationFn: async ({ configId, testPhone }: { configId: string; testPhone: string }) => {
      const { data, error } = await supabase.functions.invoke('test-sms', {
        body: { configId, testPhone },
      });
      
      if (error) throw error;
      return data;
    },
  });

  return {
    configs,
    isLoading,
    updateConfig: updateConfig.mutateAsync,
    testConfig: testConfig.mutateAsync,
    isUpdating: updateConfig.isPending,
    isTesting: testConfig.isPending,
  };
}`}
                  </pre>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Hook: useSendSms</h4>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
{`// hooks/useSendSms.ts
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SendSmsParams {
  to: string;
  message: string;
  type: 'transactional' | 'otp' | 'emergency' | 'reminder' | 'confirmation';
  metadata?: Record<string, any>;
}

export function useSendSms() {
  return useMutation({
    mutationFn: async (params: SendSmsParams) => {
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: params,
      });
      
      if (error) throw error;
      return data;
    },
  });
}`}
                  </pre>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Hook: useOtp</h4>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
{`// hooks/useOtp.ts
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface RequestOtpParams {
  phone: string;
  purpose: 'login' | 'password_reset' | 'phone_verify' | 'transaction';
}

interface VerifyOtpParams {
  phone: string;
  code: string;
  purpose: 'login' | 'password_reset' | 'phone_verify' | 'transaction';
}

export function useOtp() {
  const requestOtp = useMutation({
    mutationFn: async (params: RequestOtpParams) => {
      const { data, error } = await supabase.functions.invoke('request-otp', {
        body: params,
      });
      
      if (error) throw error;
      return data; // { success: true, expires_in: 300 }
    },
  });

  const verifyOtp = useMutation({
    mutationFn: async (params: VerifyOtpParams) => {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: params,
      });
      
      if (error) throw error;
      return data; // { success: true, token: '...' }
    },
  });

  return {
    requestOtp: requestOtp.mutateAsync,
    verifyOtp: verifyOtp.mutateAsync,
    isRequesting: requestOtp.isPending,
    isVerifying: verifyOtp.isPending,
  };
}

// Componente de exemplo
function OtpVerification({ phone }: { phone: string }) {
  const [code, setCode] = useState('');
  const { requestOtp, verifyOtp, isRequesting, isVerifying } = useOtp();
  
  const handleRequest = async () => {
    await requestOtp({ phone, purpose: 'login' });
    toast.success('Código enviado!');
  };
  
  const handleVerify = async () => {
    try {
      const result = await verifyOtp({ phone, code, purpose: 'login' });
      if (result.success) {
        // Login successful
      }
    } catch (error) {
      toast.error('Código inválido ou expirado');
    }
  };
  
  return (
    <div>
      <Button onClick={handleRequest} disabled={isRequesting}>
        {isRequesting ? 'Enviando...' : 'Enviar código'}
      </Button>
      
      <InputOTP value={code} onChange={setCode} maxLength={6} />
      
      <Button onClick={handleVerify} disabled={isVerifying || code.length !== 6}>
        {isVerifying ? 'Verificando...' : 'Verificar'}
      </Button>
    </div>
  );
}`}
                  </pre>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Edge Functions */}
          <AccordionItem value="edge-functions">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                Edge Functions
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <div>
                  <h4 className="text-sm font-medium mb-2">send-sms (Multi-Provider)</h4>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
{`// supabase/functions/send-sms/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendSmsRequest {
  to: string;
  message: string;
  type: 'transactional' | 'otp' | 'emergency' | 'reminder' | 'confirmation' | 'fallback';
  metadata?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Autenticação
    const authHeader = req.headers.get('Authorization');
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader?.replace('Bearer ', '')
    );
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Obter tenant do usuário
    const { data: tenantUser } = await supabase
      .from('tenant_users')
      .select('tenant_id')
      .eq('user_id', user.id)
      .single();

    if (!tenantUser) {
      throw new Error('User not associated with a tenant');
    }

    const { to, message, type, metadata }: SendSmsRequest = await req.json();

    // Validar telefone (E.164)
    if (!/^\\+[1-9]\\d{1,14}$/.test(to)) {
      throw new Error('Invalid phone number format. Use E.164 format.');
    }

    // Buscar configuração de SMS do tenant
    const { data: config } = await supabase
      .from('sms_configs')
      .select('*')
      .eq('tenant_id', tenantUser.tenant_id)
      .eq('is_active', true)
      .single();

    if (!config) {
      throw new Error('SMS not configured for this tenant');
    }

    let result;
    let provider = config.provider;

    // Enviar via provider configurado
    if (provider === 'twilio') {
      result = await sendViaTwilio(config, to, message);
    } else if (provider === 'zenvia') {
      result = await sendViaZenvia(config, to, message);
    }

    // Fallback se falhou e está habilitado
    if (!result.success && config.fallback_enabled && config.fallback_provider) {
      console.log('Primary provider failed, trying fallback...');
      provider = config.fallback_provider;
      
      if (provider === 'twilio') {
        result = await sendViaTwilio(config, to, message);
      } else {
        result = await sendViaZenvia(config, to, message);
      }
    }

    // Salvar no banco
    await supabase.from('sms_messages').insert({
      tenant_id: tenantUser.tenant_id,
      config_id: config.id,
      to_phone: to,
      to_user_id: metadata?.user_id,
      message_body: message,
      message_type: type,
      provider,
      provider_message_id: result.messageId,
      provider_response: result.raw,
      status: result.success ? 'sent' : 'failed',
      error_code: result.errorCode,
      error_message: result.errorMessage,
      is_fallback: provider !== config.provider,
      metadata,
    });

    return new Response(
      JSON.stringify({ 
        success: result.success, 
        messageId: result.messageId,
        provider 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Send SMS error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Twilio Send
async function sendViaTwilio(config: any, to: string, message: string) {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

  const response = await fetch(
    \`https://api.twilio.com/2010-04-01/Accounts/\${accountSid}/Messages.json\`,
    {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(\`\${accountSid}:\${authToken}\`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: to,
        From: fromNumber!,
        Body: message,
      }),
    }
  );

  const data = await response.json();
  
  return {
    success: response.ok,
    messageId: data.sid,
    raw: data,
    errorCode: data.code,
    errorMessage: data.message,
  };
}

// Zenvia Send
async function sendViaZenvia(config: any, to: string, message: string) {
  const apiToken = Deno.env.get('ZENVIA_API_TOKEN');
  const senderId = Deno.env.get('ZENVIA_SENDER_ID');

  const response = await fetch('https://api.zenvia.com/v2/channels/sms/messages', {
    method: 'POST',
    headers: {
      'X-API-TOKEN': apiToken!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: senderId,
      to: to.replace('+', ''),
      contents: [{ type: 'text', text: message }],
    }),
  });

  const data = await response.json();
  
  return {
    success: response.ok,
    messageId: data.id,
    raw: data,
    errorCode: data.code,
    errorMessage: data.message,
  };
}`}
                  </pre>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">request-otp</h4>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
{`// supabase/functions/request-otp/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { phone, purpose } = await req.json();

    // Gerar código de 6 dígitos
    const code = String(Math.floor(100000 + Math.random() * 900000));
    
    // Hash do código com SHA-256
    const encoder = new TextEncoder();
    const data = encoder.encode(code + Deno.env.get('OTP_SALT'));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const codeHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Expirar códigos anteriores
    await supabase
      .from('sms_otp_codes')
      .update({ is_used: true })
      .eq('phone', phone)
      .eq('purpose', purpose)
      .eq('is_used', false);

    // Salvar novo código
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos
    
    await supabase.from('sms_otp_codes').insert({
      phone,
      purpose,
      code_hash: codeHash,
      expires_at: expiresAt.toISOString(),
      ip_address: req.headers.get('x-forwarded-for'),
      user_agent: req.headers.get('user-agent'),
    });

    // Enviar SMS com o código
    await supabase.functions.invoke('send-sms', {
      body: {
        to: phone,
        message: \`Seu código de verificação é: \${code}. Válido por 5 minutos.\`,
        type: 'otp',
      },
    });

    return new Response(
      JSON.stringify({ success: true, expires_in: 300 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Request OTP error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});`}
                  </pre>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Comparativo Providers */}
          <AccordionItem value="providers">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Comparativo: Twilio vs Zenvia
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 font-medium">Aspecto</th>
                        <th className="text-left py-2 px-3 font-medium">Twilio</th>
                        <th className="text-left py-2 px-3 font-medium">Zenvia</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 font-medium">Cobertura</td>
                        <td className="py-2 px-3 text-muted-foreground">Global (180+ países)</td>
                        <td className="py-2 px-3 text-muted-foreground">América Latina (foco Brasil)</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 font-medium">Preço Brasil</td>
                        <td className="py-2 px-3 text-muted-foreground">~$0.0075 USD/SMS</td>
                        <td className="py-2 px-3 text-muted-foreground">~R$ 0.035/SMS</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 font-medium">Entregabilidade BR</td>
                        <td className="py-2 px-3 text-muted-foreground">Boa (~95%)</td>
                        <td className="py-2 px-3 text-muted-foreground">Excelente (~98%)</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 font-medium">Suporte Local</td>
                        <td className="py-2 px-3 text-muted-foreground">Inglês (24/7)</td>
                        <td className="py-2 px-3 text-muted-foreground">Português (horário comercial)</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 font-medium">API Quality</td>
                        <td className="py-2 px-3 text-muted-foreground">Excelente, muito documentada</td>
                        <td className="py-2 px-3 text-muted-foreground">Boa, documentação PT-BR</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 font-medium">Webhooks</td>
                        <td className="py-2 px-3 text-muted-foreground">Status callbacks detalhados</td>
                        <td className="py-2 px-3 text-muted-foreground">Status callbacks básicos</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 font-medium">Sender ID</td>
                        <td className="py-2 px-3 text-muted-foreground">Número dedicado necessário</td>
                        <td className="py-2 px-3 text-muted-foreground">Short code ou alfanumérico</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 font-medium">Recomendação</td>
                        <td className="py-2 px-3 text-green-600">ISPs internacionais</td>
                        <td className="py-2 px-3 text-green-600">ISPs Brasil (melhor custo-benefício)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Features Relacionadas */}
          <AccordionItem value="features">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Features Relacionadas
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Painel Cliente
                    </h4>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        <span>CLI-COM-01: Configuração de canais</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        <span>CLI-COM-02: Templates de mensagens</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        <span>CLI-COM-03: Histórico de envios</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        <span>CLI-COM-04: Envio em massa</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        <span>CLI-CFG-05: Preferências de notificação</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Painel Admin
                    </h4>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        <span>ADM-CFG-03: Configuração global de SMS</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        <span>ADM-REL-04: Relatórios de uso por tenant</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        <span>ADM-FIN-02: Custos de comunicação</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Segurança */}
          <AccordionItem value="security">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Segurança
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 font-medium">Aspecto</th>
                        <th className="text-left py-2 px-3 font-medium">Implementação</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 font-medium">Credenciais</td>
                        <td className="py-2 px-3 text-muted-foreground">
                          Tokens criptografados com AES-256 por tenant
                        </td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 font-medium">Rate Limiting</td>
                        <td className="py-2 px-3 text-muted-foreground">
                          Limite por minuto e diário por tenant para prevenir abuso
                        </td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 font-medium">OTP Hash</td>
                        <td className="py-2 px-3 text-muted-foreground">
                          SHA-256 com salt único, nunca armazenado em texto plano
                        </td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 font-medium">OTP Expiry</td>
                        <td className="py-2 px-3 text-muted-foreground">
                          5 minutos de validade, máximo 3 tentativas
                        </td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 font-medium">Webhook Validation</td>
                        <td className="py-2 px-3 text-muted-foreground">
                          Twilio Signature / Zenvia Token validation
                        </td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 font-medium">Isolamento</td>
                        <td className="py-2 px-3 text-muted-foreground">
                          RLS policies garantem acesso apenas ao próprio tenant
                        </td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 font-medium">Logs</td>
                        <td className="py-2 px-3 text-muted-foreground">
                          Auditoria completa de envios, sem armazenar conteúdo sensível
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Troubleshooting */}
          <AccordionItem value="troubleshooting">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Troubleshooting
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 font-medium">Erro</th>
                        <th className="text-left py-2 px-3 font-medium">Causa</th>
                        <th className="text-left py-2 px-3 font-medium">Solução</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 font-mono text-red-500">21211</td>
                        <td className="py-2 px-3 text-muted-foreground">Número inválido (Twilio)</td>
                        <td className="py-2 px-3 text-muted-foreground">Validar formato E.164</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 font-mono text-red-500">21408</td>
                        <td className="py-2 px-3 text-muted-foreground">Região não suportada</td>
                        <td className="py-2 px-3 text-muted-foreground">Verificar cobertura do país</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 font-mono text-red-500">30003</td>
                        <td className="py-2 px-3 text-muted-foreground">Telefone desligado</td>
                        <td className="py-2 px-3 text-muted-foreground">Retry automático em 1h</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 font-mono text-red-500">30005</td>
                        <td className="py-2 px-3 text-muted-foreground">Número bloqueado</td>
                        <td className="py-2 px-3 text-muted-foreground">Usar canal alternativo</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 font-mono text-red-500">RATE_LIMIT</td>
                        <td className="py-2 px-3 text-muted-foreground">Limite excedido</td>
                        <td className="py-2 px-3 text-muted-foreground">Aguardar reset ou aumentar limite</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 font-mono text-red-500">OTP_EXPIRED</td>
                        <td className="py-2 px-3 text-muted-foreground">Código expirado</td>
                        <td className="py-2 px-3 text-muted-foreground">Solicitar novo código</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 font-mono text-red-500">OTP_MAX_ATTEMPTS</td>
                        <td className="py-2 px-3 text-muted-foreground">Muitas tentativas</td>
                        <td className="py-2 px-3 text-muted-foreground">Aguardar cooldown (15 min)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Custos */}
          <AccordionItem value="costs">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Estimativa de Custos
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 font-medium">Item</th>
                        <th className="text-left py-2 px-3 font-medium">Twilio</th>
                        <th className="text-left py-2 px-3 font-medium">Zenvia</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 font-medium">SMS Brasil</td>
                        <td className="py-2 px-3 text-muted-foreground">$0.0075 USD</td>
                        <td className="py-2 px-3 text-muted-foreground">R$ 0.035</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 font-medium">Número dedicado</td>
                        <td className="py-2 px-3 text-muted-foreground">$2.00/mês</td>
                        <td className="py-2 px-3 text-muted-foreground">Incluído</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 font-medium">Short code</td>
                        <td className="py-2 px-3 text-muted-foreground">$1,000+/mês</td>
                        <td className="py-2 px-3 text-muted-foreground">R$ 500+/mês</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-muted/50 rounded-md">
                  <h4 className="text-sm font-medium mb-2">Estimativa Mensal (ISP 5.000 assinantes)</h4>
                  <div className="grid gap-2 md:grid-cols-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">OTP/2FA (20% users):</span>
                      <span className="ml-2 font-medium">~1.000 SMS</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Transacionais:</span>
                      <span className="ml-2 font-medium">~2.000 SMS</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fallback WhatsApp:</span>
                      <span className="ml-2 font-medium">~500 SMS</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Emergências:</span>
                      <span className="ml-2 font-medium">~100 SMS</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-border">
                    <div className="flex justify-between">
                      <span className="font-medium">Total Estimado:</span>
                      <span className="text-muted-foreground">
                        <span className="font-mono">Twilio: ~$27 USD</span>
                        <span className="mx-2">|</span>
                        <span className="font-mono">Zenvia: ~R$ 126</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default SMSIntegration;

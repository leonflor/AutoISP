import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle,
  Webhook,
  Shield,
  DollarSign,
  FileCode,
  Server,
  Smartphone,
  MessageCircle,
  Bell,
  Bot,
  Users
} from "lucide-react";

const WhatsAppIntegration = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <MessageSquare className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                INT-06 — WhatsApp Cloud API
              </h3>
              <p className="text-sm text-muted-foreground">
                Comunicação multi-canal com clientes via WhatsApp Business
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
            Comunicação
          </Badge>
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
            Criticidade Alta
          </Badge>
        </div>
      </div>

      <Accordion type="multiple" defaultValue={["overview"]} className="space-y-4">
        {/* Visão Geral */}
        <AccordionItem value="overview" className="rounded-lg border border-border bg-card px-4">
          <AccordionTrigger className="text-base font-medium hover:no-underline">
            Visão Geral
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              A WhatsApp Cloud API (Meta Business Platform) permite envio de mensagens em escala,
              templates aprovados, webhooks de recebimento e integração bidirecional com o módulo
              de atendimentos para comunicação em tempo real.
            </p>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Bell, title: "Notificações de Fatura", desc: "Alertas de vencimento, confirmação de pagamento" },
                { icon: CheckCircle2, title: "Confirmações de Suporte", desc: "Abertura/fechamento de chamados" },
                { icon: Shield, title: "OTP & Segurança", desc: "Códigos de verificação 2FA" },
                { icon: Users, title: "Comunicação em Massa", desc: "Campanhas, avisos de manutenção" },
                { icon: MessageCircle, title: "Suporte Bidirecional", desc: "Chat integrado ao módulo de atendimentos" },
                { icon: Bot, title: "Integração com Agentes IA", desc: "Respostas automáticas via IA" },
              ].map((item, i) => (
                <Card key={i} className="border-border/50">
                  <CardContent className="flex items-start gap-3 p-4">
                    <item.icon className="mt-0.5 h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Arquitetura */}
            <div className="rounded-lg bg-muted/50 p-4">
              <h4 className="mb-3 text-sm font-medium text-foreground">Arquitetura Multi-tenant</h4>
              <pre className="overflow-x-auto text-xs text-muted-foreground">
{`┌─────────────────────────────────────────────────────────────────────────┐
│                         META BUSINESS PLATFORM                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │  Business Acc 1 │  │  Business Acc 2 │  │  Business Acc N │         │
│  │  (Cliente ISP)  │  │  (Cliente ISP)  │  │  (Cliente ISP)  │         │
│  │  Phone: +55...  │  │  Phone: +55...  │  │  Phone: +55...  │         │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘         │
│           │                    │                    │                   │
│           └────────────────────┼────────────────────┘                   │
│                                ▼                                        │
│                    ┌───────────────────────┐                            │
│                    │   WhatsApp Cloud API  │                            │
│                    │   (Graph API v18.0)   │                            │
│                    └───────────┬───────────┘                            │
└────────────────────────────────┼────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
         ┌──────────────────┐      ┌──────────────────┐
         │  send-whatsapp   │      │ whatsapp-webhook │
         │  Edge Function   │◄────►│  Edge Function   │
         │  (Envio)         │      │  (Recebimento)   │
         └────────┬─────────┘      └────────┬─────────┘
                  │                         │
                  └────────────┬────────────┘
                               ▼
                  ┌────────────────────────┐
                  │      SUPABASE DB       │
                  ├────────────────────────┤
                  │ • whatsapp_configs     │
                  │ • whatsapp_messages    │
                  │ • whatsapp_webhooks    │
                  │ • tickets (integração) │
                  └────────────────────────┘

  ── Fluxo de Configuração (Seguro) ──

  ┌──────────┐     ┌────────────────────────┐     ┌──────────────┐
  │  Admin/  │────►│ save-whatsapp-config   │────►│  Supabase DB │
  │  ISP UI  │     │ Edge Function          │     │  (AES-256)   │
  └──────────┘     └────────┬───────────────┘     └──────────────┘
                            │
                            ▼
                  ┌──────────────────────┐
                  │ 1. Validar JWT       │
                  │ 2. AES-256-GCM      │
                  │    encrypt token     │
                  │ 3. Gerar IV único    │
                  │ 4. Mascarar token    │
                  │ 5. Salvar no DB      │
                  └──────────────────────┘

  ┌──────────┐     ┌────────────────────────┐     ┌──────────────┐
  │  Admin/  │────►│ test-whatsapp-         │────►│  Meta Graph  │
  │  ISP UI  │     │ connection             │     │  API (v18.0) │
  └──────────┘     │ Edge Function          │     └──────────────┘
                   └────────┬───────────────┘
                            │
                            ▼
                  ┌──────────────────────┐
                  │ 1. Buscar config DB  │
                  │ 2. Decrypt token     │
                  │    server-side       │
                  │ 3. GET /me na Meta   │
                  │ 4. Retornar status   │
                  │ 5. Atualizar         │
                  │    is_connected      │
                  └──────────────────────┘`}
              </pre>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Fluxos Detalhados */}
        <AccordionItem value="flows" className="rounded-lg border border-border bg-card px-4">
          <AccordionTrigger className="text-base font-medium hover:no-underline">
            <div className="flex items-center gap-2">
              <Webhook className="h-4 w-4 text-green-500" />
              Fluxos Detalhados
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-2">
            {/* Fluxo de Envio */}
            <div>
              <h4 className="mb-3 text-sm font-medium text-foreground">Fluxo 1: Envio de Template Message</h4>
              <div className="rounded-lg bg-muted/50 p-4">
                <pre className="overflow-x-auto text-xs text-muted-foreground">
{`┌──────────┐     ┌────────────────┐     ┌─────────────────┐     ┌─────────────┐
│  Client  │────►│ send-whatsapp  │────►│ WhatsApp Cloud  │────►│  Recipient  │
│  App     │     │ Edge Function  │     │      API        │     │   Phone     │
└──────────┘     └───────┬────────┘     └────────┬────────┘     └─────────────┘
                         │                       │
                         ▼                       │
               ┌──────────────────┐              │
               │  1. Validar JWT  │              │
               │  2. Buscar config│              │
               │  3. Decrypt token│              │
               │  4. Montar body  │              │
               │  5. POST /messages│─────────────┘
               │  6. Log response │
               └──────────────────┘

Request Body:
{
  "messaging_product": "whatsapp",
  "to": "5511999999999",
  "type": "template",
  "template": {
    "name": "payment_reminder",
    "language": { "code": "pt_BR" },
    "components": [
      {
        "type": "body",
        "parameters": [
          { "type": "text", "text": "João Silva" },
          { "type": "text", "text": "R$ 150,00" },
          { "type": "text", "text": "15/01/2024" }
        ]
      }
    ]
  }
}`}
                </pre>
              </div>
            </div>

            {/* Fluxo de Webhook */}
            <div>
              <h4 className="mb-3 text-sm font-medium text-foreground">Fluxo 2: Webhook Handler (Recebimento)</h4>
              <div className="rounded-lg bg-muted/50 p-4">
                <pre className="overflow-x-auto text-xs text-muted-foreground">
{`┌─────────────┐     ┌───────────────────┐     ┌──────────────────┐
│  WhatsApp   │────►│ whatsapp-webhook  │────►│   Supabase DB    │
│  Cloud API  │     │  Edge Function    │     │                  │
└─────────────┘     └─────────┬─────────┘     └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ 1. Verify HMAC   │
                    │    SHA256        │
                    │ 2. Parse payload │
                    │ 3. Route by type:│
                    │    - message     │
                    │    - status      │
                    │    - errors      │
                    │ 4. Store webhook │
                    │ 5. Trigger action│
                    └──────────────────┘

HMAC Validation:
const signature = req.headers['x-hub-signature-256'];
const expectedSig = 'sha256=' + crypto
  .createHmac('sha256', APP_SECRET)
  .update(rawBody)
  .digest('hex');

if (signature !== expectedSig) {
  throw new Error('Invalid signature');
}`}
                </pre>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Configuração & Secrets */}
        <AccordionItem value="config" className="rounded-lg border border-border bg-card px-4">
          <AccordionTrigger className="text-base font-medium hover:no-underline">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              Configuração & Secrets
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 text-left font-medium text-foreground">Secret</th>
                    <th className="py-2 text-left font-medium text-foreground">Descrição</th>
                    <th className="py-2 text-left font-medium text-foreground">Escopo</th>
                    <th className="py-2 text-left font-medium text-foreground">Rotação</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <td className="py-2"><code className="text-xs bg-muted px-1 rounded">WHATSAPP_ACCESS_TOKEN</code></td>
                    <td className="py-2">Token de acesso permanente</td>
                    <td className="py-2">Por tenant (DB)</td>
                    <td className="py-2">60 dias (System User)</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2"><code className="text-xs bg-muted px-1 rounded">WHATSAPP_PHONE_NUMBER_ID</code></td>
                    <td className="py-2">ID do número de telefone</td>
                    <td className="py-2">Por tenant (DB)</td>
                    <td className="py-2">Fixo</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2"><code className="text-xs bg-muted px-1 rounded">WHATSAPP_BUSINESS_ACCOUNT_ID</code></td>
                    <td className="py-2">ID da conta business</td>
                    <td className="py-2">Por tenant (DB)</td>
                    <td className="py-2">Fixo</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2"><code className="text-xs bg-muted px-1 rounded">WHATSAPP_WEBHOOK_TOKEN</code></td>
                    <td className="py-2">Token de verificação webhook</td>
                    <td className="py-2">Global (Edge)</td>
                    <td className="py-2">Manual</td>
                  </tr>
                  <tr>
                    <td className="py-2"><code className="text-xs bg-muted px-1 rounded">WHATSAPP_APP_SECRET</code></td>
                    <td className="py-2">App Secret para HMAC</td>
                    <td className="py-2">Global (Edge)</td>
                    <td className="py-2">Manual</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Templates */}
            <div className="mt-6">
              <h4 className="mb-3 text-sm font-medium text-foreground">Templates por Categoria de Conversa</h4>
              <div className="grid gap-3 md:grid-cols-3">
                <Card className="border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-green-600">Authentication</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    <ul className="space-y-1">
                      <li>• otp_verification</li>
                      <li>• login_code</li>
                      <li>• password_reset</li>
                    </ul>
                    <p className="mt-2 text-xs italic">Grátis (primeiras 1000/mês)</p>
                  </CardContent>
                </Card>
                <Card className="border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-blue-600">Utility</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    <ul className="space-y-1">
                      <li>• payment_confirmation</li>
                      <li>• invoice_reminder</li>
                      <li>• ticket_update</li>
                      <li>• maintenance_alert</li>
                    </ul>
                    <p className="mt-2 text-xs italic">~$0.0088 USD/msg</p>
                  </CardContent>
                </Card>
                <Card className="border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-purple-600">Marketing</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    <ul className="space-y-1">
                      <li>• new_plan_promo</li>
                      <li>• upgrade_offer</li>
                      <li>• survey_nps</li>
                    </ul>
                    <p className="mt-2 text-xs italic">~$0.0551 USD/msg</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Estrutura de Dados */}
        <AccordionItem value="schema" className="rounded-lg border border-border bg-card px-4">
          <AccordionTrigger className="text-base font-medium hover:no-underline">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-green-500" />
              Estrutura de Dados (SQL)
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="rounded-lg bg-muted/50 p-4">
              <pre className="overflow-x-auto text-xs text-muted-foreground">
{`-- Configuração WhatsApp por tenant
CREATE TABLE whatsapp_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Credenciais (criptografadas)
  access_token_encrypted TEXT NOT NULL,
  phone_number_id TEXT NOT NULL,
  business_account_id TEXT NOT NULL,
  display_phone_number TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  verified_at TIMESTAMPTZ,
  last_health_check TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(tenant_id)
);

-- Mensagens enviadas/recebidas
CREATE TABLE whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Identificação Meta
  wamid TEXT UNIQUE, -- WhatsApp Message ID
  
  -- Direção e tipo
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_type TEXT NOT NULL, -- template, text, image, document, etc.
  
  -- Conteúdo
  recipient_phone TEXT NOT NULL,
  template_name TEXT,
  template_params JSONB,
  content TEXT, -- Para mensagens de texto
  media_url TEXT, -- Para mensagens de mídia
  
  -- Status (outbound)
  status TEXT DEFAULT 'pending', -- pending, sent, delivered, read, failed
  status_updated_at TIMESTAMPTZ,
  error_code TEXT,
  error_message TEXT,
  
  -- Relacionamentos
  ticket_id UUID REFERENCES tickets(id),
  subscriber_id UUID REFERENCES subscribers(id),
  
  -- Custos
  conversation_type TEXT, -- authentication, utility, marketing, service
  cost_usd DECIMAL(10, 6),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ
);

-- Webhooks recebidos (raw log)
CREATE TABLE whatsapp_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  
  -- Payload
  webhook_type TEXT NOT NULL, -- messages, statuses, errors
  payload JSONB NOT NULL,
  
  -- Processamento
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  error TEXT,
  
  -- Metadata
  received_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_whatsapp_messages_tenant ON whatsapp_messages(tenant_id);
CREATE INDEX idx_whatsapp_messages_phone ON whatsapp_messages(recipient_phone);
CREATE INDEX idx_whatsapp_messages_status ON whatsapp_messages(status);
CREATE INDEX idx_whatsapp_messages_ticket ON whatsapp_messages(ticket_id);
CREATE INDEX idx_whatsapp_webhooks_tenant ON whatsapp_webhooks(tenant_id);
CREATE INDEX idx_whatsapp_webhooks_processed ON whatsapp_webhooks(processed);

-- RLS
ALTER TABLE whatsapp_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_webhooks ENABLE ROW LEVEL SECURITY;

-- Policies (exemplo)
CREATE POLICY "Tenant isolation" ON whatsapp_configs
  FOR ALL USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Tenant isolation" ON whatsapp_messages
  FOR ALL USING (tenant_id = get_user_tenant_id());`}
              </pre>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Implementação */}
        <AccordionItem value="implementation" className="rounded-lg border border-border bg-card px-4">
          <AccordionTrigger className="text-base font-medium hover:no-underline">
            <div className="flex items-center gap-2">
              <FileCode className="h-4 w-4 text-green-500" />
              Implementação (Edge Functions)
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            {/* Edge Function: send-whatsapp */}
            <div>
              <h4 className="mb-2 text-sm font-medium text-foreground">Edge Function: send-whatsapp</h4>
              <div className="rounded-lg bg-muted/50 p-4">
                <pre className="overflow-x-auto text-xs text-muted-foreground">
{`// supabase/functions/send-whatsapp/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendTemplateRequest {
  recipientPhone: string;
  templateName: string;
  templateParams?: Record<string, string>[];
  ticketId?: string;
  subscriberId?: string;
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

    // Validar JWT e extrair tenant_id
    const authHeader = req.headers.get('Authorization');
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader?.replace('Bearer ', '')
    );
    if (authError || !user) throw new Error('Unauthorized');

    const tenantId = user.user_metadata.tenant_id;
    const body: SendTemplateRequest = await req.json();

    // Buscar config do tenant
    const { data: config } = await supabase
      .from('whatsapp_configs')
      .select('*')
      .eq('tenant_id', tenantId)
      .single();

    if (!config?.is_active) {
      throw new Error('WhatsApp not configured');
    }

    // Decrypt token (usar função auxiliar)
    const accessToken = await decryptToken(config.access_token_encrypted);

    // Enviar via Graph API
    const response = await fetch(
      \`https://graph.facebook.com/v18.0/\${config.phone_number_id}/messages\`,
      {
        method: 'POST',
        headers: {
          'Authorization': \`Bearer \${accessToken}\`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: body.recipientPhone,
          type: 'template',
          template: {
            name: body.templateName,
            language: { code: 'pt_BR' },
            components: body.templateParams ? [{
              type: 'body',
              parameters: body.templateParams.map(p => ({
                type: 'text',
                text: Object.values(p)[0]
              }))
            }] : undefined
          }
        })
      }
    );

    const result = await response.json();

    // Log mensagem
    await supabase.from('whatsapp_messages').insert({
      tenant_id: tenantId,
      wamid: result.messages?.[0]?.id,
      direction: 'outbound',
      message_type: 'template',
      recipient_phone: body.recipientPhone,
      template_name: body.templateName,
      template_params: body.templateParams,
      status: result.messages ? 'sent' : 'failed',
      error_code: result.error?.code,
      error_message: result.error?.message,
      ticket_id: body.ticketId,
      subscriber_id: body.subscriberId,
      sent_at: result.messages ? new Date().toISOString() : null
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});`}
                </pre>
              </div>
            </div>

            {/* Edge Function: whatsapp-webhook */}
            <div>
              <h4 className="mb-2 text-sm font-medium text-foreground">Edge Function: whatsapp-webhook</h4>
              <div className="rounded-lg bg-muted/50 p-4">
                <pre className="overflow-x-auto text-xs text-muted-foreground">
{`// supabase/functions/whatsapp-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.168.0/crypto/mod.ts";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Verificação do webhook (GET)
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === Deno.env.get('WHATSAPP_WEBHOOK_TOKEN')) {
      return new Response(challenge, { status: 200 });
    }
    return new Response('Forbidden', { status: 403 });
  }

  // Handler de eventos (POST)
  if (req.method === 'POST') {
    const rawBody = await req.text();
    
    // Validar HMAC SHA256
    const signature = req.headers.get('x-hub-signature-256');
    const appSecret = Deno.env.get('WHATSAPP_APP_SECRET')!;
    const expectedSig = 'sha256=' + createHmac('sha256', appSecret)
      .update(rawBody)
      .toString('hex');

    if (signature !== expectedSig) {
      console.error('Invalid HMAC signature');
      return new Response('Invalid signature', { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    
    // Processar cada entry
    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value;
        
        // Identificar tenant pelo phone_number_id
        const { data: config } = await supabase
          .from('whatsapp_configs')
          .select('tenant_id')
          .eq('phone_number_id', value.metadata?.phone_number_id)
          .single();

        if (!config) continue;

        // Salvar webhook raw
        await supabase.from('whatsapp_webhooks').insert({
          tenant_id: config.tenant_id,
          webhook_type: value.messages ? 'messages' : 'statuses',
          payload: value
        });

        // Processar mensagens recebidas
        if (value.messages) {
          for (const msg of value.messages) {
            await supabase.from('whatsapp_messages').insert({
              tenant_id: config.tenant_id,
              wamid: msg.id,
              direction: 'inbound',
              message_type: msg.type,
              recipient_phone: msg.from,
              content: msg.text?.body || msg.caption,
              created_at: new Date(parseInt(msg.timestamp) * 1000).toISOString()
            });
            
            // TODO: Integrar com módulo de atendimentos
          }
        }

        // Processar status updates
        if (value.statuses) {
          for (const status of value.statuses) {
            await supabase
              .from('whatsapp_messages')
              .update({
                status: status.status,
                status_updated_at: new Date().toISOString(),
                delivered_at: status.status === 'delivered' ? new Date().toISOString() : null,
                read_at: status.status === 'read' ? new Date().toISOString() : null,
                error_code: status.errors?.[0]?.code,
                error_message: status.errors?.[0]?.message
              })
              .eq('wamid', status.id);
          }
        }
      }
    }

    return new Response('OK', { status: 200 });
  }

  return new Response('Method not allowed', { status: 405 });
});`}
                </pre>
              </div>
            </div>

            {/* Edge Function: save-whatsapp-config */}
            <div>
              <h4 className="mb-2 text-sm font-medium text-foreground">Edge Function: save-whatsapp-config</h4>
              <p className="mb-2 text-xs text-muted-foreground">
                Criptografa credenciais WhatsApp (access_token e verify_token) com AES-256-GCM antes de armazenar no banco.
                Funciona para ambos os contextos: Admin (<code className="bg-muted px-1 rounded">admin_whatsapp_config</code>) e ISP (<code className="bg-muted px-1 rounded">whatsapp_configs</code>).
              </p>
              <div className="rounded-lg bg-muted/50 p-4">
                <pre className="overflow-x-auto text-xs text-muted-foreground">
{`// supabase/functions/save-whatsapp-config/index.ts
// Fluxo:
// 1. Valida JWT (manual, verify_jwt=false)
// 2. Detecta contexto: admin (super_admin) ou ISP (isp_id no body)
// 3. Se access_token preenchido:
//    a. Gera IV aleatório (12 bytes)
//    b. Criptografa com AES-256-GCM + ENCRYPTION_KEY (32 bytes)
//    c. Armazena ciphertext em api_key_encrypted, IV em encryption_iv
//    d. Gera masked_key (ex: "EAAG...xYz4") para exibição na UI
// 4. Se access_token vazio: mantém credencial existente
// 5. Salva demais campos (phone_number_id, webhook_url, etc.)
// 6. Retorna { success: true, masked_key }
//
// Segurança:
// - Token nunca retorna ao frontend após salvamento
// - ENCRYPTION_KEY validada (32 bytes) antes de criptografar
// - IV único por operação impede ataques de repetição`}
                </pre>
              </div>
            </div>

            {/* Edge Function: test-whatsapp-connection */}
            <div>
              <h4 className="mb-2 text-sm font-medium text-foreground">Edge Function: test-whatsapp-connection</h4>
              <p className="mb-2 text-xs text-muted-foreground">
                Testa a conexão com a Meta Graph API de forma segura, descriptografando o token apenas no servidor.
                Credenciais nunca são expostas no browser (Network Tab).
              </p>
              <div className="rounded-lg bg-muted/50 p-4">
                <pre className="overflow-x-auto text-xs text-muted-foreground">
{`// supabase/functions/test-whatsapp-connection/index.ts
// Fluxo:
// 1. Valida JWT (manual)
// 2. Detecta contexto (admin ou ISP)
// 3. Busca configuração no DB
// 4. Descriptografa access_token com AES-256-GCM + IV armazenado
// 5. GET https://graph.facebook.com/v18.0/{phone_number_id}
//    Headers: Authorization: Bearer {decrypted_token}
// 6. Se sucesso (HTTP 200):
//    - Atualiza is_connected = true, connected_at = now()
//    - Retorna { connected: true, phone_display }
// 7. Se erro:
//    - Atualiza is_connected = false
//    - Retorna { connected: false, error: "mensagem segura" }
//
// Segurança:
// - Token descriptografado apenas em memória do Edge Runtime
// - Resposta ao frontend contém APENAS status (sem credenciais)
// - Erros da Meta API são sanitizados antes de retornar`}
                </pre>
              </div>
            </div>

            {/* Frontend Hook */}
            <div>
              <h4 className="mb-2 text-sm font-medium text-foreground">Frontend: Hook useWhatsApp</h4>
              <div className="rounded-lg bg-muted/50 p-4">
                <pre className="overflow-x-auto text-xs text-muted-foreground">
{`// hooks/useWhatsApp.ts
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useWhatsApp = () => {
  // Enviar template
  const sendTemplate = useMutation({
    mutationFn: async ({
      recipientPhone,
      templateName,
      templateParams,
      ticketId,
      subscriberId
    }: {
      recipientPhone: string;
      templateName: string;
      templateParams?: Record<string, string>[];
      ticketId?: string;
      subscriberId?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: { recipientPhone, templateName, templateParams, ticketId, subscriberId }
      });
      if (error) throw error;
      return data;
    }
  });

  // Buscar mensagens de um ticket
  const useTicketMessages = (ticketId: string) => useQuery({
    queryKey: ['whatsapp-messages', ticketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  return { sendTemplate, useTicketMessages };
};

// Uso no componente
const { sendTemplate } = useWhatsApp();

await sendTemplate.mutateAsync({
  recipientPhone: '5511999999999',
  templateName: 'payment_reminder',
  templateParams: [
    { name: 'João Silva' },
    { value: 'R$ 150,00' },
    { date: '15/01/2024' }
  ],
  subscriberId: 'uuid-do-assinante'
});`}
                </pre>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Features Relacionadas */}
        <AccordionItem value="features" className="rounded-lg border border-border bg-card px-4">
          <AccordionTrigger className="text-base font-medium hover:no-underline">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-green-500" />
              Features Relacionadas
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Painel Cliente</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  <ul className="space-y-1">
                    <li>• CLI-COM-01: Config WhatsApp</li>
                    <li>• CLI-COM-02: Templates</li>
                    <li>• CLI-COM-03: Histórico</li>
                    <li>• CLI-COM-04: Campanhas</li>
                    <li>• CLI-ATD-01: Chat integrado</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Painel Admin</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  <ul className="space-y-1">
                    <li>• ADM-SUP-04: Suporte WhatsApp</li>
                    <li>• ADM-REL-02: Relatório comunicação</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Módulo Atendimentos</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  <ul className="space-y-1">
                    <li>• CLI-ATD-02: Criar ticket via WhatsApp</li>
                    <li>• CLI-ATD-03: Respostas via WhatsApp</li>
                    <li>• CLI-IA-02: Agente IA no WhatsApp</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Segurança */}
        <AccordionItem value="security" className="rounded-lg border border-border bg-card px-4">
          <AccordionTrigger className="text-base font-medium hover:no-underline">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              Segurança
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 text-left font-medium text-foreground">Aspecto</th>
                    <th className="py-2 text-left font-medium text-foreground">Implementação</th>
                    <th className="py-2 text-left font-medium text-foreground">Prioridade</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <td className="py-2">Token Encryption</td>
                    <td className="py-2">AES-256-GCM via Edge Function <code className="bg-muted px-1 rounded text-xs">save-whatsapp-config</code>. IV único por operação. Token mascarado na UI.</td>
                    <td className="py-2"><Badge variant="destructive" className="text-xs">Crítico</Badge></td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">Teste Conexão Server-side</td>
                    <td className="py-2">Via Edge Function <code className="bg-muted px-1 rounded text-xs">test-whatsapp-connection</code>. Credenciais nunca expostas no browser.</td>
                    <td className="py-2"><Badge variant="destructive" className="text-xs">Crítico</Badge></td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">Webhook Validation</td>
                    <td className="py-2">HMAC SHA256 com App Secret em todas as requisições</td>
                    <td className="py-2"><Badge variant="destructive" className="text-xs">Crítico</Badge></td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">Tenant Isolation</td>
                    <td className="py-2">RLS em todas as tabelas, validação em Edge Functions</td>
                    <td className="py-2"><Badge variant="destructive" className="text-xs">Crítico</Badge></td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">Rate Limiting</td>
                    <td className="py-2">Limite por tenant + respeito aos limites da Meta API</td>
                    <td className="py-2"><Badge className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Alto</Badge></td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">Phone Validation</td>
                    <td className="py-2">Validação de formato E.164 antes de envio</td>
                    <td className="py-2"><Badge className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Alto</Badge></td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">Token Masking na UI</td>
                    <td className="py-2">Frontend nunca pré-preenche campo com token real. Exibe apenas máscara (ex: EAAG...xYz4).</td>
                    <td className="py-2"><Badge className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Alto</Badge></td>
                  </tr>
                  <tr>
                    <td className="py-2">Audit Log</td>
                    <td className="py-2">Todas as mensagens logadas com status e custos</td>
                    <td className="py-2"><Badge variant="secondary" className="text-xs">Médio</Badge></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Troubleshooting */}
        <AccordionItem value="troubleshooting" className="rounded-lg border border-border bg-card px-4">
          <AccordionTrigger className="text-base font-medium hover:no-underline">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Troubleshooting
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 text-left font-medium text-foreground">Erro</th>
                    <th className="py-2 text-left font-medium text-foreground">Código</th>
                    <th className="py-2 text-left font-medium text-foreground">Solução</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <td className="py-2">Token expirado</td>
                    <td className="py-2"><code className="text-xs bg-muted px-1 rounded">190</code></td>
                    <td className="py-2">Regenerar token via System User no Business Manager</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">Template não aprovado</td>
                    <td className="py-2"><code className="text-xs bg-muted px-1 rounded">132000</code></td>
                    <td className="py-2">Verificar status do template no Business Manager</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">Número não registrado</td>
                    <td className="py-2"><code className="text-xs bg-muted px-1 rounded">131030</code></td>
                    <td className="py-2">Destinatário não tem WhatsApp ou número inválido</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">Rate limit exceeded</td>
                    <td className="py-2"><code className="text-xs bg-muted px-1 rounded">130429</code></td>
                    <td className="py-2">Implementar backoff exponencial, aumentar tier</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">Parâmetros inválidos</td>
                    <td className="py-2"><code className="text-xs bg-muted px-1 rounded">132001</code></td>
                    <td className="py-2">Verificar quantidade e formato dos parâmetros do template</td>
                  </tr>
                  <tr>
                    <td className="py-2">24h window expired</td>
                    <td className="py-2"><code className="text-xs bg-muted px-1 rounded">131026</code></td>
                    <td className="py-2">Usar template message em vez de session message</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Custos */}
        <AccordionItem value="costs" className="rounded-lg border border-border bg-card px-4">
          <AccordionTrigger className="text-base font-medium hover:no-underline">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              Custos Estimados
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 text-left font-medium text-foreground">Tipo de Conversa</th>
                    <th className="py-2 text-left font-medium text-foreground">Custo (Brasil)</th>
                    <th className="py-2 text-left font-medium text-foreground">Descrição</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <td className="py-2">Authentication</td>
                    <td className="py-2">$0.0315 USD</td>
                    <td className="py-2">OTP, códigos de verificação (primeiras 1000 grátis/mês)</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">Utility</td>
                    <td className="py-2">$0.0088 USD</td>
                    <td className="py-2">Transacionais: faturas, confirmações, alertas</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">Marketing</td>
                    <td className="py-2">$0.0551 USD</td>
                    <td className="py-2">Promoções, ofertas, campanhas</td>
                  </tr>
                  <tr>
                    <td className="py-2">Service</td>
                    <td className="py-2">$0.0265 USD</td>
                    <td className="py-2">Conversas iniciadas pelo usuário (24h window)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <Card className="border-border/50 bg-muted/30">
              <CardContent className="p-4">
                <h4 className="text-sm font-medium text-foreground mb-2">Estimativa Mensal (por tenant)</h4>
                <div className="grid gap-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>1.000 utility (faturas/confirmações)</span>
                    <span className="font-mono">~$8.80 USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span>500 authentication (OTP)</span>
                    <span className="font-mono">~$0.00 USD (grátis)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>200 marketing (promoções)</span>
                    <span className="font-mono">~$11.02 USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span>300 service (suporte)</span>
                    <span className="font-mono">~$7.95 USD</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 font-medium text-foreground">
                    <span>Total estimado</span>
                    <span className="font-mono">~$27.77 USD/mês</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Requisitos Meta */}
        <AccordionItem value="requirements" className="rounded-lg border border-border bg-card px-4">
          <AccordionTrigger className="text-base font-medium hover:no-underline">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Requisitos Meta Business
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Meta Business Account verificado</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>WhatsApp Business Account criado</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Número de telefone registrado e verificado</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>System User criado com permissões whatsapp_business_messaging</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Templates de mensagem submetidos e aprovados</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Webhook endpoint configurado e verificado</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>App Secret obtido para validação HMAC</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default WhatsAppIntegration;

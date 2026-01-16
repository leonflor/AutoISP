import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Bell, CheckCircle2, AlertCircle, Server, Smartphone, Code, Shield, DollarSign, Wrench, ExternalLink, Zap, Users, Clock, Megaphone } from "lucide-react";

const PushNotificationsIntegration = () => {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
              <Bell className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                INT-08 — Push Notifications (Firebase/OneSignal)
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Sistema de notificações push multi-tenant para alertas em tempo real, lembretes e campanhas de marketing
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
              Comunicação
            </Badge>
            <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20">
              Criticidade Média-Alta
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Accordion type="multiple" className="w-full" defaultValue={["overview"]}>
          {/* Visão Geral */}
          <AccordionItem value="overview">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Visão Geral
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="rounded-lg bg-muted/50 p-4">
                <h4 className="mb-2 text-sm font-medium">O que faz:</h4>
                <p className="text-sm text-muted-foreground">
                  Envia notificações push para navegadores web e apps mobile. Cada cliente SaaS configura 
                  suas próprias credenciais (Firebase ou OneSignal), permitindo personalização de remetente 
                  e controle total sobre campanhas. Suporta notificações transacionais, alertas em tempo real, 
                  lembretes automáticos e campanhas de marketing segmentadas.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">Alertas de Conexão</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Notifica cliente quando conexão cai ou retorna
                  </p>
                </div>

                <div className="rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Status de Chamados</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Atualização em tempo real do andamento do suporte
                  </p>
                </div>

                <div className="rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Lembretes de Fatura</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Avisos automáticos antes do vencimento
                  </p>
                </div>

                <div className="rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Confirmação Pagamento</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Notifica imediatamente quando pagamento é confirmado
                  </p>
                </div>

                <div className="rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Avisos de Manutenção</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Comunicação prévia de manutenções programadas
                  </p>
                </div>

                <div className="rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Campanhas Marketing</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Promoções, upgrades de plano e novidades
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Arquitetura */}
          <AccordionItem value="architecture">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-blue-500" />
                Arquitetura Multi-tenant
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="rounded-lg bg-muted/50 p-4">
                <pre className="overflow-x-auto text-xs text-muted-foreground">
{`┌─────────────────────────────────────────────────────────────────────────┐
│                         ARQUITETURA PUSH NOTIFICATIONS                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    CLIENTS (BROWSERS/APPS)                        │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │   │
│  │  │ Service      │  │ React App    │  │ Mobile App   │            │   │
│  │  │ Worker       │  │ (PWA)        │  │ (FCM SDK)    │            │   │
│  │  │ sw.js        │  │              │  │              │            │   │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │   │
│  └─────────┼─────────────────┼─────────────────┼────────────────────┘   │
│            │ subscribe       │ token           │ token                  │
│            ▼                 ▼                 ▼                        │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     SUPABASE EDGE FUNCTIONS                       │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │   │
│  │  │ register-push   │  │ send-push       │  │ push-webhook    │   │   │
│  │  │ ─────────────── │  │ ─────────────── │  │ ─────────────── │   │   │
│  │  │ • Salva token   │  │ • Individual    │  │ • Delivery      │   │   │
│  │  │ • Por device    │  │ • Broadcast     │  │ • Analytics     │   │   │
│  │  │ • Valida        │  │ • Segmentado    │  │ • Cleanup       │   │   │
│  │  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘   │   │
│  └───────────┼────────────────────┼────────────────────┼────────────┘   │
│              │                    │                    │                │
│              ▼                    ▼                    ▼                │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                        PROVIDER ROUTER                            │   │
│  │         ┌─────────────────┬─────────────────┐                    │   │
│  │         │   FCM Config?   │ OneSignal Config│                    │   │
│  │         │       ▼         │        ▼        │                    │   │
│  │         │   FCM SDK       │ OneSignal API   │                    │   │
│  │         └────────┬────────┴────────┬────────┘                    │   │
│  └──────────────────┼─────────────────┼─────────────────────────────┘   │
│                     │                 │                                 │
│                     ▼                 ▼                                 │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     PUSH PROVIDERS                                │   │
│  │  ┌─────────────────────────┐  ┌─────────────────────────────┐    │   │
│  │  │ FIREBASE CLOUD MSG      │  │ ONESIGNAL                   │    │   │
│  │  │ ───────────────────     │  │ ─────────────────────────   │    │   │
│  │  │ • FCM v1 API            │  │ • REST API                  │    │   │
│  │  │ • VAPID Keys            │  │ • App ID + API Key          │    │   │
│  │  │ • Service Account       │  │ • Segmentação avançada      │    │   │
│  │  │ • Gratuito (limite)     │  │ • Dashboard analytics       │    │   │
│  │  └─────────────────────────┘  └─────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                         SUPABASE DATABASE                         │   │
│  │  push_configs │ push_subscriptions │ push_notifications │ logs   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘`}
                </pre>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Fluxos */}
          <AccordionItem value="flows">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-green-500" />
                Fluxos Detalhados
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-2">
              {/* Fluxo de Registro */}
              <div className="rounded-lg border border-border p-4">
                <h4 className="mb-3 text-sm font-medium">Fluxo 1: Registro de Token (Subscribe)</h4>
                <div className="rounded-lg bg-muted/50 p-4">
                  <pre className="overflow-x-auto text-xs text-muted-foreground">
{`┌──────────────────────────────────────────────────────────────────────────┐
│                    FLUXO DE REGISTRO DE TOKEN                             │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  USUÁRIO           FRONTEND           SERVICE WORKER      EDGE FUNCTION  │
│     │                 │                     │                   │        │
│     │ Acessa App      │                     │                   │        │
│     ├────────────────►│                     │                   │        │
│     │                 │                     │                   │        │
│     │                 │ Verifica permissão  │                   │        │
│     │                 ├────────────────────►│                   │        │
│     │                 │                     │                   │        │
│     │◄────────────────┤ Solicita permissão  │                   │        │
│     │                 │                     │                   │        │
│     │ "Permitir"      │                     │                   │        │
│     ├────────────────►│                     │                   │        │
│     │                 │                     │                   │        │
│     │                 │ Register SW + Token │                   │        │
│     │                 ├────────────────────►│                   │        │
│     │                 │                     │                   │        │
│     │                 │ FCM/VAPID Token     │                   │        │
│     │                 │◄────────────────────┤                   │        │
│     │                 │                     │                   │        │
│     │                 │ POST /register-push │                   │        │
│     │                 ├─────────────────────┼──────────────────►│        │
│     │                 │                     │                   │        │
│     │                 │                     │         Salva     │        │
│     │                 │                     │     • token       │        │
│     │                 │                     │     • device_id   │        │
│     │                 │                     │     • user_id     │        │
│     │                 │                     │     • platform    │        │
│     │                 │                     │                   │        │
│     │                 │ 200 OK { success }  │                   │        │
│     │                 │◄────────────────────┼───────────────────┤        │
│     │                 │                     │                   │        │
│     │ "Notificações   │                     │                   │        │
│     │  ativadas!"     │                     │                   │        │
│     │◄────────────────┤                     │                   │        │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘`}
                  </pre>
                </div>
              </div>

              {/* Fluxo de Envio */}
              <div className="rounded-lg border border-border p-4">
                <h4 className="mb-3 text-sm font-medium">Fluxo 2: Envio de Notificação</h4>
                <div className="rounded-lg bg-muted/50 p-4">
                  <pre className="overflow-x-auto text-xs text-muted-foreground">
{`┌──────────────────────────────────────────────────────────────────────────┐
│                    FLUXO DE ENVIO DE NOTIFICAÇÃO                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  TRIGGER            EDGE FUNCTION         PROVIDER           DEVICE      │
│     │                    │                   │                   │       │
│     │ Evento dispara     │                   │                   │       │
│     │ (conexão caiu,     │                   │                   │       │
│     │  pagamento, etc)   │                   │                   │       │
│     │                    │                   │                   │       │
│     │ POST /send-push    │                   │                   │       │
│     ├───────────────────►│                   │                   │       │
│     │ {                  │                   │                   │       │
│     │   user_id,         │                   │                   │       │
│     │   title,           │                   │                   │       │
│     │   body,            │                   │                   │       │
│     │   data,            │                   │                   │       │
│     │   type             │                   │                   │       │
│     │ }                  │                   │                   │       │
│     │                    │                   │                   │       │
│     │                    │ Busca tokens      │                   │       │
│     │                    │ do user_id        │                   │       │
│     │                    │                   │                   │       │
│     │                    │ Verifica provider │                   │       │
│     │                    │ (FCM/OneSignal)   │                   │       │
│     │                    │                   │                   │       │
│     │                    │ POST FCM/OneSignal│                   │       │
│     │                    ├──────────────────►│                   │       │
│     │                    │                   │                   │       │
│     │                    │ 200 OK            │                   │       │
│     │                    │◄──────────────────┤                   │       │
│     │                    │                   │                   │       │
│     │                    │                   │ Push Notification │       │
│     │                    │                   ├──────────────────►│       │
│     │                    │                   │                   │       │
│     │                    │ Salva log         │                   │       │
│     │                    │ delivery          │                   │       │
│     │                    │                   │                   │       │
│     │ 200 { sent: true } │                   │                   │       │
│     │◄───────────────────┤                   │                   │       │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘`}
                  </pre>
                </div>
              </div>

              {/* Payload Examples */}
              <div className="rounded-lg border border-border p-4">
                <h4 className="mb-3 text-sm font-medium">Exemplos de Payload</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Firebase FCM:</p>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <pre className="overflow-x-auto text-xs text-muted-foreground">
{`{
  "message": {
    "token": "device_token_here",
    "notification": {
      "title": "Pagamento Confirmado",
      "body": "Seu pagamento de R$ 99,90 foi confirmado"
    },
    "data": {
      "type": "payment_confirmed",
      "invoice_id": "inv_123",
      "click_action": "/faturas/inv_123"
    },
    "webpush": {
      "notification": {
        "icon": "/icon-192x192.png",
        "badge": "/badge.png"
      }
    }
  }
}`}
                      </pre>
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">OneSignal:</p>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <pre className="overflow-x-auto text-xs text-muted-foreground">
{`{
  "app_id": "onesignal_app_id",
  "include_player_ids": ["player_id_1"],
  "headings": { "en": "Pagamento Confirmado" },
  "contents": { 
    "en": "Seu pagamento foi confirmado" 
  },
  "data": {
    "type": "payment_confirmed",
    "invoice_id": "inv_123"
  },
  "chrome_web_icon": "/icon-192.png",
  "url": "/faturas/inv_123"
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Configuração */}
          <AccordionItem value="config">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-orange-500" />
                Configuração & Secrets
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 text-left font-medium">Secret</th>
                      <th className="pb-2 text-left font-medium">Provider</th>
                      <th className="pb-2 text-left font-medium">Escopo</th>
                      <th className="pb-2 text-left font-medium">Descrição</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-mono text-xs">FCM_SERVER_KEY</td>
                      <td className="py-2">Firebase</td>
                      <td className="py-2">Global</td>
                      <td className="py-2">Server Key do Firebase Cloud Messaging</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-mono text-xs">FCM_PROJECT_ID</td>
                      <td className="py-2">Firebase</td>
                      <td className="py-2">Global</td>
                      <td className="py-2">ID do projeto Firebase</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-mono text-xs">FCM_SERVICE_ACCOUNT</td>
                      <td className="py-2">Firebase</td>
                      <td className="py-2">Global</td>
                      <td className="py-2">JSON da Service Account (para FCM v1)</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-mono text-xs">VAPID_PUBLIC_KEY</td>
                      <td className="py-2">Firebase</td>
                      <td className="py-2">Por tenant</td>
                      <td className="py-2">Chave pública VAPID para web push</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-mono text-xs">VAPID_PRIVATE_KEY</td>
                      <td className="py-2">Firebase</td>
                      <td className="py-2">Por tenant</td>
                      <td className="py-2">Chave privada VAPID (armazenada criptografada)</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-mono text-xs">ONESIGNAL_APP_ID</td>
                      <td className="py-2">OneSignal</td>
                      <td className="py-2">Por tenant</td>
                      <td className="py-2">App ID da aplicação OneSignal</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-mono text-xs">ONESIGNAL_API_KEY</td>
                      <td className="py-2">OneSignal</td>
                      <td className="py-2">Por tenant</td>
                      <td className="py-2">REST API Key (armazenada criptografada)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Schema */}
          <AccordionItem value="schema">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-purple-500" />
                Estrutura de Dados (SQL)
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="rounded-lg bg-muted/50 p-4">
                <pre className="overflow-x-auto text-xs text-muted-foreground">
{`-- =====================================================
-- PUSH NOTIFICATIONS SCHEMA
-- =====================================================

-- Configuração de push por tenant
CREATE TABLE push_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Provider: 'fcm' | 'onesignal'
  provider TEXT NOT NULL DEFAULT 'fcm',
  
  -- FCM Config
  fcm_project_id TEXT,
  fcm_server_key_encrypted TEXT,
  vapid_public_key TEXT,
  vapid_private_key_encrypted TEXT,
  
  -- OneSignal Config
  onesignal_app_id TEXT,
  onesignal_api_key_encrypted TEXT,
  
  -- Configurações
  is_enabled BOOLEAN DEFAULT true,
  default_icon_url TEXT,
  default_badge_url TEXT,
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(tenant_id)
);

-- Subscrições de push (tokens por device)
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Token Info
  token_hash TEXT NOT NULL, -- Hash do token para privacidade
  token_encrypted TEXT NOT NULL, -- Token criptografado
  
  -- Device Info
  device_id TEXT, -- Identificador único do device
  platform TEXT NOT NULL, -- 'web' | 'android' | 'ios'
  browser TEXT, -- 'chrome' | 'firefox' | 'safari' | 'edge'
  user_agent TEXT,
  
  -- OneSignal específico
  onesignal_player_id TEXT,
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  permission_granted_at TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  
  -- Preferências do usuário
  preferences JSONB DEFAULT '{
    "marketing": true,
    "transactional": true,
    "alerts": true,
    "reminders": true
  }',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(tenant_id, token_hash)
);

-- Notificações enviadas
CREATE TABLE push_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Tipo de envio: 'individual' | 'broadcast' | 'segment'
  send_type TEXT NOT NULL DEFAULT 'individual',
  
  -- Destinatário(s)
  user_id UUID REFERENCES auth.users(id), -- Para individual
  segment JSONB, -- Para segment: { "plan": "premium", "city": "SP" }
  
  -- Conteúdo
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  icon_url TEXT,
  badge_url TEXT,
  image_url TEXT, -- Imagem grande (big picture)
  
  -- Ação ao clicar
  click_action TEXT, -- URL ou deep link
  
  -- Dados extras
  data JSONB DEFAULT '{}',
  
  -- Tipo de notificação
  notification_type TEXT NOT NULL, -- 'alert' | 'reminder' | 'marketing' | 'transactional'
  
  -- Agendamento
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  
  -- Status: 'pending' | 'sending' | 'sent' | 'failed' | 'cancelled'
  status TEXT DEFAULT 'pending',
  
  -- Métricas
  total_recipients INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  
  -- Referência
  reference_type TEXT, -- 'invoice' | 'ticket' | 'connection' | 'campaign'
  reference_id UUID,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Logs de delivery
CREATE TABLE push_delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  notification_id UUID NOT NULL REFERENCES push_notifications(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES push_subscriptions(id) ON DELETE CASCADE,
  
  -- Status: 'sent' | 'delivered' | 'clicked' | 'dismissed' | 'failed'
  status TEXT NOT NULL,
  
  -- Provider response
  provider_message_id TEXT,
  provider_response JSONB,
  
  -- Erro
  error_code TEXT,
  error_message TEXT,
  
  -- Timestamps
  sent_at TIMESTAMPTZ DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE push_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_delivery_logs ENABLE ROW LEVEL SECURITY;

-- Push configs: apenas admins do tenant
CREATE POLICY "push_configs_tenant_admin" ON push_configs
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users 
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- Subscriptions: usuário vê apenas suas próprias
CREATE POLICY "push_subscriptions_own" ON push_subscriptions
  FOR ALL USING (user_id = auth.uid());

-- Notifications: admins do tenant
CREATE POLICY "push_notifications_tenant" ON push_notifications
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users 
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- Índices
CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(tenant_id, user_id);
CREATE INDEX idx_push_subscriptions_active ON push_subscriptions(tenant_id, is_active);
CREATE INDEX idx_push_notifications_status ON push_notifications(tenant_id, status);
CREATE INDEX idx_push_notifications_scheduled ON push_notifications(scheduled_at) 
  WHERE status = 'pending' AND scheduled_at IS NOT NULL;
CREATE INDEX idx_push_delivery_logs_notification ON push_delivery_logs(notification_id);`}
                </pre>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Implementação */}
          <AccordionItem value="implementation">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-blue-500" />
                Implementação
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-2">
              {/* Service Worker */}
              <div className="rounded-lg border border-border p-4">
                <h4 className="mb-3 text-sm font-medium">Service Worker (public/firebase-messaging-sw.js)</h4>
                <div className="rounded-lg bg-muted/50 p-4">
                  <pre className="overflow-x-auto text-xs text-muted-foreground">
{`// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Firebase config injetado em runtime
const firebaseConfig = {
  apiKey: self.FIREBASE_API_KEY,
  authDomain: self.FIREBASE_AUTH_DOMAIN,
  projectId: self.FIREBASE_PROJECT_ID,
  storageBucket: self.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: self.FIREBASE_MESSAGING_SENDER_ID,
  appId: self.FIREBASE_APP_ID
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message:', payload);
  
  const { title, body, icon, badge, image, data } = payload.notification || payload.data;
  
  const notificationOptions = {
    body,
    icon: icon || '/icon-192x192.png',
    badge: badge || '/badge.png',
    image,
    data: payload.data,
    vibrate: [200, 100, 200],
    tag: data?.type || 'default',
    renotify: true,
    actions: getActionsForType(data?.type)
  };
  
  self.registration.showNotification(title, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const clickAction = event.notification.data?.click_action || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window or open new
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(clickAction);
            return client.focus();
          }
        }
        return clients.openWindow(clickAction);
      })
  );
  
  // Track click
  if (event.notification.data?.notification_id) {
    fetch('/api/push-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'clicked',
        notification_id: event.notification.data.notification_id
      })
    });
  }
});

function getActionsForType(type) {
  switch (type) {
    case 'invoice_reminder':
      return [
        { action: 'pay', title: '💳 Pagar Agora' },
        { action: 'later', title: '⏰ Lembrar Depois' }
      ];
    case 'ticket_update':
      return [
        { action: 'view', title: '👀 Ver Chamado' }
      ];
    case 'connection_down':
      return [
        { action: 'details', title: '📊 Ver Detalhes' },
        { action: 'support', title: '🆘 Suporte' }
      ];
    default:
      return [];
  }
}`}
                  </pre>
                </div>
              </div>

              {/* Frontend Hook */}
              <div className="rounded-lg border border-border p-4">
                <h4 className="mb-3 text-sm font-medium">Hook usePushNotifications</h4>
                <div className="rounded-lg bg-muted/50 p-4">
                  <pre className="overflow-x-auto text-xs text-muted-foreground">
{`// hooks/usePushNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PushConfig {
  vapidKey: string;
  iconUrl?: string;
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check support
  useEffect(() => {
    const checkSupport = async () => {
      const supported = 'Notification' in window && 
                       'serviceWorker' in navigator &&
                       await isSupported();
      setIsSupported(supported);
      if (supported) {
        setPermission(Notification.permission);
      }
      setLoading(false);
    };
    checkSupport();
  }, []);

  // Subscribe to push
  const subscribe = useCallback(async (config: PushConfig) => {
    if (!isSupported) {
      toast({ title: 'Push não suportado', variant: 'destructive' });
      return false;
    }

    try {
      // Request permission
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission !== 'granted') {
        toast({ title: 'Permissão negada', variant: 'destructive' });
        return false;
      }

      // Get FCM token
      const messaging = getMessaging();
      const token = await getToken(messaging, {
        vapidKey: config.vapidKey,
        serviceWorkerRegistration: await navigator.serviceWorker.ready
      });

      // Register token in backend
      const { error } = await supabase.functions.invoke('register-push', {
        body: {
          token,
          platform: 'web',
          browser: detectBrowser(),
          userAgent: navigator.userAgent
        }
      });

      if (error) throw error;

      setIsSubscribed(true);
      toast({ title: 'Notificações ativadas! 🔔' });
      return true;

    } catch (error) {
      console.error('Push subscribe error:', error);
      toast({ 
        title: 'Erro ao ativar notificações',
        description: error.message,
        variant: 'destructive'
      });
      return false;
    }
  }, [isSupported, toast]);

  // Unsubscribe
  const unsubscribe = useCallback(async () => {
    try {
      const { error } = await supabase.functions.invoke('unregister-push', {
        body: { platform: 'web' }
      });

      if (error) throw error;

      setIsSubscribed(false);
      toast({ title: 'Notificações desativadas' });
      return true;

    } catch (error) {
      console.error('Push unsubscribe error:', error);
      return false;
    }
  }, [toast]);

  // Listen for foreground messages
  useEffect(() => {
    if (!isSupported || !isSubscribed) return;

    const messaging = getMessaging();
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message:', payload);
      
      // Show toast for foreground notifications
      toast({
        title: payload.notification?.title,
        description: payload.notification?.body,
      });
    });

    return () => unsubscribe();
  }, [isSupported, isSubscribed, toast]);

  return {
    isSupported,
    isSubscribed,
    permission,
    loading,
    subscribe,
    unsubscribe
  };
}

function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'chrome';
  if (ua.includes('Firefox')) return 'firefox';
  if (ua.includes('Safari')) return 'safari';
  if (ua.includes('Edge')) return 'edge';
  return 'unknown';
}`}
                  </pre>
                </div>
              </div>

              {/* Edge Function */}
              <div className="rounded-lg border border-border p-4">
                <h4 className="mb-3 text-sm font-medium">Edge Function: send-push</h4>
                <div className="rounded-lg bg-muted/50 p-4">
                  <pre className="overflow-x-auto text-xs text-muted-foreground">
{`// supabase/functions/send-push/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushPayload {
  user_id?: string;
  segment?: Record<string, any>;
  title: string;
  body: string;
  icon_url?: string;
  image_url?: string;
  click_action?: string;
  data?: Record<string, any>;
  notification_type: 'alert' | 'reminder' | 'marketing' | 'transactional';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get tenant from auth
    const authHeader = req.headers.get('Authorization')!;
    const { data: { user } } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (!user) throw new Error('Unauthorized');

    // Get tenant_id
    const { data: tenantUser } = await supabase
      .from('tenant_users')
      .select('tenant_id')
      .eq('user_id', user.id)
      .single();
    
    if (!tenantUser) throw new Error('Tenant not found');

    const payload: PushPayload = await req.json();
    const tenantId = tenantUser.tenant_id;

    // Get push config
    const { data: config } = await supabase
      .from('push_configs')
      .select('*')
      .eq('tenant_id', tenantId)
      .single();

    if (!config?.is_enabled) {
      throw new Error('Push notifications not configured');
    }

    // Get target subscriptions
    let subscriptionsQuery = supabase
      .from('push_subscriptions')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true);

    if (payload.user_id) {
      subscriptionsQuery = subscriptionsQuery.eq('user_id', payload.user_id);
    }

    const { data: subscriptions } = await subscriptionsQuery;

    if (!subscriptions?.length) {
      return new Response(
        JSON.stringify({ sent: false, reason: 'No active subscriptions' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create notification record
    const { data: notification } = await supabase
      .from('push_notifications')
      .insert({
        tenant_id: tenantId,
        send_type: payload.user_id ? 'individual' : 'broadcast',
        user_id: payload.user_id,
        segment: payload.segment,
        title: payload.title,
        body: payload.body,
        icon_url: payload.icon_url || config.default_icon_url,
        image_url: payload.image_url,
        click_action: payload.click_action,
        data: payload.data,
        notification_type: payload.notification_type,
        status: 'sending',
        total_recipients: subscriptions.length,
        sent_at: new Date().toISOString()
      })
      .select()
      .single();

    // Send based on provider
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          if (config.provider === 'fcm') {
            return await sendFCM(config, sub, payload, notification.id);
          } else {
            return await sendOneSignal(config, sub, payload, notification.id);
          }
        } catch (error) {
          // Log failure
          await supabase.from('push_delivery_logs').insert({
            tenant_id: tenantId,
            notification_id: notification.id,
            subscription_id: sub.id,
            status: 'failed',
            error_message: error.message
          });
          throw error;
        }
      })
    );

    // Update notification status
    const delivered = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    await supabase
      .from('push_notifications')
      .update({
        status: failed === results.length ? 'failed' : 'sent',
        delivered_count: delivered,
        failed_count: failed
      })
      .eq('id', notification.id);

    return new Response(
      JSON.stringify({ 
        sent: true, 
        notification_id: notification.id,
        delivered,
        failed 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Send push error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function sendFCM(config, subscription, payload, notificationId) {
  // Decrypt service account
  const serviceAccount = JSON.parse(
    await decrypt(config.fcm_service_account_encrypted)
  );

  // Get access token
  const token = await getGoogleAccessToken(serviceAccount);

  const response = await fetch(
    \`https://fcm.googleapis.com/v1/projects/\${config.fcm_project_id}/messages:send\`,
    {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${token}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: {
          token: await decrypt(subscription.token_encrypted),
          notification: {
            title: payload.title,
            body: payload.body
          },
          webpush: {
            notification: {
              icon: payload.icon_url,
              badge: config.default_badge_url,
              image: payload.image_url
            },
            fcm_options: {
              link: payload.click_action
            }
          },
          data: {
            ...payload.data,
            notification_id: notificationId
          }
        }
      })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'FCM send failed');
  }

  return await response.json();
}

async function sendOneSignal(config, subscription, payload, notificationId) {
  const apiKey = await decrypt(config.onesignal_api_key_encrypted);

  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Authorization': \`Basic \${apiKey}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      app_id: config.onesignal_app_id,
      include_player_ids: [subscription.onesignal_player_id],
      headings: { en: payload.title },
      contents: { en: payload.body },
      chrome_web_icon: payload.icon_url,
      big_picture: payload.image_url,
      url: payload.click_action,
      data: {
        ...payload.data,
        notification_id: notificationId
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors?.[0] || 'OneSignal send failed');
  }

  return await response.json();
}`}
                  </pre>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Comparativo Providers */}
          <AccordionItem value="comparison">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-500" />
                Comparativo: FCM vs OneSignal
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 text-left font-medium">Critério</th>
                      <th className="pb-2 text-left font-medium">Firebase FCM</th>
                      <th className="pb-2 text-left font-medium">OneSignal</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-medium">Preço</td>
                      <td className="py-2">
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                          Gratuito
                        </Badge>
                        <span className="ml-2 text-xs">(até limites generosos)</span>
                      </td>
                      <td className="py-2">
                        Grátis até 10k subs, depois $9-99/mês
                      </td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-medium">Setup</td>
                      <td className="py-2">Médio (Service Account, VAPID)</td>
                      <td className="py-2">
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                          Fácil
                        </Badge>
                        <span className="ml-2 text-xs">(App ID + API Key)</span>
                      </td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-medium">Segmentação</td>
                      <td className="py-2">Manual (via código)</td>
                      <td className="py-2">
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                          Avançada
                        </Badge>
                        <span className="ml-2 text-xs">(tags, segments, A/B)</span>
                      </td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-medium">Dashboard</td>
                      <td className="py-2">Firebase Console (básico)</td>
                      <td className="py-2">
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                          Completo
                        </Badge>
                        <span className="ml-2 text-xs">(analytics, campaigns)</span>
                      </td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-medium">Plataformas</td>
                      <td className="py-2">Web, Android, iOS, Flutter</td>
                      <td className="py-2">Web, Android, iOS, React Native</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-medium">Automações</td>
                      <td className="py-2">Via Cloud Functions</td>
                      <td className="py-2">Built-in (Journeys, triggers)</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-medium">Recomendação</td>
                      <td className="py-2">
                        <span className="text-xs">Projetos com budget limitado, já usa Firebase</span>
                      </td>
                      <td className="py-2">
                        <span className="text-xs">Foco em marketing, precisa de analytics</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="rounded-lg bg-blue-500/10 p-3">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>💡 Recomendação:</strong> Usar FCM como padrão (gratuito), com OneSignal como opção 
                  para clientes que precisam de recursos avançados de marketing e segmentação.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Features Relacionadas */}
          <AccordionItem value="features">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-cyan-500" />
                Features Relacionadas
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-border p-4">
                  <h4 className="mb-3 text-sm font-medium">Painel Cliente</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      <span>CLI-COM-01 — Preferências de Notificação</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      <span>CLI-MON-01 — Alertas de Conexão</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      <span>CLI-ATE-03 — Notificações de Chamados</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <h4 className="mb-3 text-sm font-medium">Painel Admin</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      <span>ADM-CFG-05 — Configuração Push Providers</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      <span>ADM-COM-02 — Envio em Massa (Broadcast)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      <span>ADM-REL-04 — Relatório de Entregas Push</span>
                    </li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Segurança */}
          <AccordionItem value="security">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-red-500" />
                Segurança
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-border p-3">
                  <h5 className="text-sm font-medium">Token Security</h5>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <li>• Tokens armazenados com hash (não reversível)</li>
                    <li>• Token real criptografado com AES-256</li>
                    <li>• Tokens expirados removidos automaticamente</li>
                  </ul>
                </div>

                <div className="rounded-lg border border-border p-3">
                  <h5 className="text-sm font-medium">VAPID Authentication</h5>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <li>• Chaves VAPID por tenant</li>
                    <li>• Previne push não autorizado</li>
                    <li>• Rotação de chaves suportada</li>
                  </ul>
                </div>

                <div className="rounded-lg border border-border p-3">
                  <h5 className="text-sm font-medium">RLS & Isolation</h5>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <li>• Subscriptions isoladas por tenant</li>
                    <li>• Usuário só vê próprias subscriptions</li>
                    <li>• Admins gerenciam broadcasts</li>
                  </ul>
                </div>

                <div className="rounded-lg border border-border p-3">
                  <h5 className="text-sm font-medium">Rate Limiting</h5>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <li>• Limite de broadcasts por hora</li>
                    <li>• Throttling para não spam</li>
                    <li>• Quotas por tier de plano</li>
                  </ul>
                </div>

                <div className="rounded-lg border border-border p-3">
                  <h5 className="text-sm font-medium">User Control</h5>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <li>• Opt-out granular por tipo</li>
                    <li>• Unsubscribe a qualquer momento</li>
                    <li>• Preferências persistentes</li>
                  </ul>
                </div>

                <div className="rounded-lg border border-border p-3">
                  <h5 className="text-sm font-medium">GDPR Compliance</h5>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <li>• Consentimento explícito</li>
                    <li>• Data export disponível</li>
                    <li>• Delete on request</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Troubleshooting */}
          <AccordionItem value="troubleshooting">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                Troubleshooting
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 text-left font-medium">Erro</th>
                      <th className="pb-2 text-left font-medium">Causa</th>
                      <th className="pb-2 text-left font-medium">Solução</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-mono text-xs">messaging/token-unregistered</td>
                      <td className="py-2">Token expirado ou revogado</td>
                      <td className="py-2">Remover subscription, solicitar novo token</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-mono text-xs">messaging/invalid-registration-token</td>
                      <td className="py-2">Token malformado</td>
                      <td className="py-2">Verificar processo de registro</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-mono text-xs">messaging/mismatched-credential</td>
                      <td className="py-2">VAPID key não corresponde</td>
                      <td className="py-2">Verificar par de chaves VAPID</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-mono text-xs">Notification not shown</td>
                      <td className="py-2">Service Worker não registrado</td>
                      <td className="py-2">Verificar SW registration, HTTPS</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-mono text-xs">Permission denied</td>
                      <td className="py-2">Usuário negou/bloqueou</td>
                      <td className="py-2">Instruir usuário a permitir nas configs</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-mono text-xs">OneSignal 401</td>
                      <td className="py-2">API Key inválida</td>
                      <td className="py-2">Verificar REST API Key no dashboard</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-mono text-xs">Player ID not found</td>
                      <td className="py-2">Usuário não registrado no OneSignal</td>
                      <td className="py-2">Verificar SDK initialization</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Custos */}
          <AccordionItem value="costs">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                Estimativa de Custos
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
                  <h4 className="mb-3 text-sm font-medium text-green-600">Firebase FCM</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex justify-between">
                      <span>Notificações Push</span>
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                        Gratuito
                      </Badge>
                    </li>
                    <li className="flex justify-between">
                      <span>Limite mensal</span>
                      <span className="font-medium">~1M mensagens</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Cloud Functions (se usar)</span>
                      <span className="font-medium">$0.40/milhão invocações</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                  <h4 className="mb-3 text-sm font-medium text-blue-600">OneSignal</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex justify-between">
                      <span>Free Tier</span>
                      <span className="font-medium">Até 10.000 subs</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Growth ($9/mês)</span>
                      <span className="font-medium">Até 50.000 subs</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Professional ($99/mês)</span>
                      <span className="font-medium">Ilimitado + analytics</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <h4 className="mb-2 text-sm font-medium">Exemplo: ISP com 5.000 clientes ativos</h4>
                <div className="grid gap-4 md:grid-cols-2 text-sm text-muted-foreground">
                  <div>
                    <p className="font-medium">Usando FCM:</p>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>• ~50.000 notificações/mês</li>
                      <li>• Custo: <strong className="text-green-600">R$ 0</strong></li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium">Usando OneSignal:</p>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>• Growth plan necessário</li>
                      <li>• Custo: <strong className="text-blue-600">~R$ 50/mês</strong></li>
                    </ul>
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

export default PushNotificationsIntegration;

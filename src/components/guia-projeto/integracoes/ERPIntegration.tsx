import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Activity, 
  Database, 
  RefreshCw, 
  Shield, 
  AlertTriangle, 
  DollarSign,
  Code,
  Webhook,
  Users,
  FileText,
  Settings,
  Layers,
  ExternalLink
} from "lucide-react";

const ERPIntegration = () => {
  return (
    <div className="space-y-6">
      {/* Identificação */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">INT-09 — Integração ERP para ISPs</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Sincronização com sistemas de gestão de ISPs
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-600">
                Criticidade Alta
              </Badge>
              <Badge variant="outline" className="border-primary/30 bg-primary/10">
                ERP
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Accordion type="multiple" defaultValue={["visao-geral"]} className="space-y-4">
        {/* Visão Geral */}
        <AccordionItem value="visao-geral" className="rounded-lg border bg-card px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <span className="font-semibold">Visão Geral</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Integração unificada com os principais sistemas de gestão (ERP) utilizados por provedores de internet 
              no Brasil. Utiliza o padrão Adapter para abstrair as diferenças entre APIs, permitindo que o AutoISP 
              se conecte a múltiplos ERPs com uma interface consistente.
            </p>

            <div>
              <h4 className="mb-3 font-medium text-foreground">ERPs Suportados</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ERP</TableHead>
                    <TableHead>Mercado</TableHead>
                    <TableHead>Tipo API</TableHead>
                    <TableHead>Documentação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">SGP (Sistema Gerencial de Provedores)</TableCell>
                    <TableCell>Brasil (Nordeste/Norte)</TableCell>
                    <TableCell><Badge variant="outline">REST</Badge></TableCell>
                    <TableCell>
                      <a href="https://bookstack.sgp.net.br/books" target="_blank" rel="noopener noreferrer">
                        <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 cursor-pointer gap-1">
                          Docs API <ExternalLink className="h-3 w-3" />
                        </Badge>
                      </a>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">IXC Soft</TableCell>
                    <TableCell>Brasil (Nacional)</TableCell>
                    <TableCell><Badge variant="outline">REST</Badge></TableCell>
                    <TableCell><Badge className="bg-green-500/10 text-green-600">Disponível</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">MK Solutions</TableCell>
                    <TableCell>Brasil (Sul/Sudeste)</TableCell>
                    <TableCell><Badge variant="outline">SOAP/REST</Badge></TableCell>
                    <TableCell><Badge className="bg-yellow-500/10 text-yellow-600">Parcial</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Hubsoft</TableCell>
                    <TableCell>Brasil (Nacional)</TableCell>
                    <TableCell><Badge variant="outline">REST</Badge></TableCell>
                    <TableCell><Badge className="bg-green-500/10 text-green-600">Disponível</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Casos de Uso */}
        <AccordionItem value="casos-uso" className="rounded-lg border bg-card px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-semibold">Casos de Uso</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-muted">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-500/10">
                      <Users className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Sincronização de Clientes</h4>
                      <p className="text-sm text-muted-foreground">
                        Importação e atualização bidirecional de cadastros de clientes entre sistemas
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-muted">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-green-500/10">
                      <FileText className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Sincronização de Faturas</h4>
                      <p className="text-sm text-muted-foreground">
                        Importação de boletos, status de pagamento e baixas automáticas
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-muted">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-purple-500/10">
                      <Database className="h-4 w-4 text-purple-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Sincronização de Contratos</h4>
                      <p className="text-sm text-muted-foreground">
                        Importação de planos, serviços contratados e status de conexão
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-muted">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-orange-500/10">
                      <Webhook className="h-4 w-4 text-orange-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Webhooks Bidirecionais</h4>
                      <p className="text-sm text-muted-foreground">
                        Receber eventos do ERP e enviar atualizações em tempo real
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-muted">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-red-500/10">
                      <Activity className="h-4 w-4 text-red-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Gestão de Conexões</h4>
                      <p className="text-sm text-muted-foreground">
                        Bloqueio, desbloqueio e alteração de velocidade via API do ERP
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-muted">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-cyan-500/10">
                      <Settings className="h-4 w-4 text-cyan-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Automações</h4>
                      <p className="text-sm text-muted-foreground">
                        Regras automáticas baseadas em eventos do ERP (ex: bloquear após 5 dias de atraso)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Arquitetura */}
        <AccordionItem value="arquitetura" className="rounded-lg border bg-card px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <span className="font-semibold">Arquitetura Multi-tenant</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <pre className="overflow-x-auto text-xs">
{`┌─────────────────────────────────────────────────────────────────────────┐
│                           AutoISP Platform                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐                │
│  │   Tenant A   │   │   Tenant B   │   │   Tenant C   │                │
│  │   (IXC Soft) │   │   (SGP)      │   │   (Hubsoft)  │                │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘                │
│         │                   │                   │                        │
│         └───────────────────┼───────────────────┘                        │
│                             │                                            │
│                    ┌────────▼────────┐                                   │
│                    │  ERP Service    │                                   │
│                    │  (Edge Function)│                                   │
│                    └────────┬────────┘                                   │
│                             │                                            │
│                    ┌────────▼────────┐                                   │
│                    │  Adapter Layer  │                                   │
│                    │  (Factory)      │                                   │
│                    └────────┬────────┘                                   │
│                             │                                            │
│         ┌───────────────────┼───────────────────┐                        │
│         │                   │                   │                        │
│  ┌──────▼───────┐   ┌──────▼───────┐   ┌──────▼───────┐                │
│  │ IxcAdapter   │   │ SgpAdapter   │   │HubsoftAdapter│                │
│  │              │   │              │   │              │                │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘                │
│         │                   │                   │                        │
└─────────┼───────────────────┼───────────────────┼────────────────────────┘
          │                   │                   │
          ▼                   ▼                   ▼
   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │  IXC Soft   │    │    SGP      │    │   Hubsoft   │
   │    API      │    │    API      │    │     API     │
   └─────────────┘    └─────────────┘    └─────────────┘`}
              </pre>
            </div>

            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
              <h4 className="mb-2 font-medium text-blue-600">Adapter Pattern</h4>
              <p className="text-sm text-muted-foreground">
                Cada ERP possui um adapter específico que implementa a interface <code>ErpAdapter</code>.
                O Factory seleciona automaticamente o adapter correto baseado na configuração do tenant.
                Isso permite adicionar novos ERPs sem modificar o código existente.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Fluxos */}
        <AccordionItem value="fluxos" className="rounded-lg border bg-card px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-primary" />
              <span className="font-semibold">Fluxos de Sincronização</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-4">
            <div>
              <h4 className="mb-3 font-medium">Fluxo de Sincronização Programada</h4>
              <div className="rounded-lg bg-muted/50 p-4">
                <pre className="overflow-x-auto text-xs">
{`┌─────────┐      ┌──────────────┐      ┌─────────────┐      ┌──────────┐
│  CRON   │      │ sync-erp     │      │  Adapter    │      │   ERP    │
│  Job    │      │ (Edge Func)  │      │  Layer      │      │   API    │
└────┬────┘      └──────┬───────┘      └──────┬──────┘      └────┬─────┘
     │                   │                     │                  │
     │ trigger           │                     │                  │
     │──────────────────>│                     │                  │
     │                   │                     │                  │
     │                   │ getAdapter(config)  │                  │
     │                   │────────────────────>│                  │
     │                   │                     │                  │
     │                   │     adapter         │                  │
     │                   │<────────────────────│                  │
     │                   │                     │                  │
     │                   │ fetchClientes()                        │
     │                   │───────────────────────────────────────>│
     │                   │                                        │
     │                   │              clientes[]                │
     │                   │<───────────────────────────────────────│
     │                   │                     │                  │
     │                   │ upsertClientes()    │                  │
     │                   │──────┐              │                  │
     │                   │      │ DB           │                  │
     │                   │<─────┘              │                  │
     │                   │                     │                  │
     │   sync complete   │                     │                  │
     │<──────────────────│                     │                  │
     │                   │                     │                  │`}
                </pre>
              </div>
            </div>

            <div>
              <h4 className="mb-3 font-medium">Fluxo de Webhook (ERP → AutoISP)</h4>
              <div className="rounded-lg bg-muted/50 p-4">
                <pre className="overflow-x-auto text-xs">
{`┌──────────┐      ┌───────────────┐      ┌─────────────┐      ┌──────────────┐
│   ERP    │      │ webhook-erp   │      │  Validator  │      │   AutoISP    │
│  Server  │      │ (Edge Func)   │      │  Layer      │      │   Database   │
└────┬─────┘      └───────┬───────┘      └──────┬──────┘      └──────┬───────┘
     │                     │                     │                    │
     │ POST /webhook       │                     │                    │
     │ (cliente_atualizado)│                     │                    │
     │────────────────────>│                     │                    │
     │                     │                     │                    │
     │                     │ validateSignature() │                    │
     │                     │────────────────────>│                    │
     │                     │                     │                    │
     │                     │      valid          │                    │
     │                     │<────────────────────│                    │
     │                     │                     │                    │
     │                     │ parsePayload()      │                    │
     │                     │────────────────────>│                    │
     │                     │                     │                    │
     │                     │   normalizedData    │                    │
     │                     │<────────────────────│                    │
     │                     │                     │                    │
     │                     │ upsert(erp_clientes)                     │
     │                     │─────────────────────────────────────────>│
     │                     │                                          │
     │                     │              success                     │
     │                     │<─────────────────────────────────────────│
     │                     │                     │                    │
     │    200 OK           │                     │                    │
     │<────────────────────│                     │                    │
     │                     │                     │                    │`}
                </pre>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Configuração */}
        <AccordionItem value="configuracao" className="rounded-lg border bg-card px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              <span className="font-semibold">Configuração de Secrets</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Secret</TableHead>
                  <TableHead>ERP</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Formato</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell><code className="text-xs bg-muted px-1 rounded">IXC_API_URL</code></TableCell>
                  <TableCell>IXC Soft</TableCell>
                  <TableCell>URL base da API</TableCell>
                  <TableCell><code className="text-xs">https://api.ixcsoft.com.br</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="text-xs bg-muted px-1 rounded">IXC_API_TOKEN</code></TableCell>
                  <TableCell>IXC Soft</TableCell>
                  <TableCell>Token de autenticação</TableCell>
                  <TableCell><code className="text-xs">Bearer token</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="text-xs bg-muted px-1 rounded">SGP_API_URL</code></TableCell>
                  <TableCell>SGP</TableCell>
                  <TableCell>URL base da API</TableCell>
                  <TableCell><code className="text-xs">https://sgp.exemplo.com/api</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="text-xs bg-muted px-1 rounded">SGP_API_KEY</code></TableCell>
                  <TableCell>SGP</TableCell>
                  <TableCell>Chave de API</TableCell>
                  <TableCell><code className="text-xs">API Key</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="text-xs bg-muted px-1 rounded">MK_WSDL_URL</code></TableCell>
                  <TableCell>MK Solutions</TableCell>
                  <TableCell>URL do WSDL (SOAP)</TableCell>
                  <TableCell><code className="text-xs">https://mk.exemplo.com/wsdl</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="text-xs bg-muted px-1 rounded">MK_USERNAME</code></TableCell>
                  <TableCell>MK Solutions</TableCell>
                  <TableCell>Usuário de integração</TableCell>
                  <TableCell><code className="text-xs">string</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="text-xs bg-muted px-1 rounded">MK_PASSWORD</code></TableCell>
                  <TableCell>MK Solutions</TableCell>
                  <TableCell>Senha de integração</TableCell>
                  <TableCell><code className="text-xs">string (encrypted)</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="text-xs bg-muted px-1 rounded">HUBSOFT_API_URL</code></TableCell>
                  <TableCell>Hubsoft</TableCell>
                  <TableCell>URL base da API</TableCell>
                  <TableCell><code className="text-xs">https://api.hubsoft.com.br</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="text-xs bg-muted px-1 rounded">HUBSOFT_CLIENT_ID</code></TableCell>
                  <TableCell>Hubsoft</TableCell>
                  <TableCell>Client ID OAuth</TableCell>
                  <TableCell><code className="text-xs">OAuth2 client_id</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="text-xs bg-muted px-1 rounded">HUBSOFT_CLIENT_SECRET</code></TableCell>
                  <TableCell>Hubsoft</TableCell>
                  <TableCell>Client Secret OAuth</TableCell>
                  <TableCell><code className="text-xs">OAuth2 client_secret</code></TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="mt-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-600">Armazenamento Seguro</h4>
                  <p className="text-sm text-muted-foreground">
                    Credenciais são armazenadas criptografadas na tabela <code>erp_configs</code> usando 
                    AES-256-GCM. A chave de criptografia é derivada do <code>ENCRYPTION_KEY</code> do ambiente 
                    combinado com o <code>tenant_id</code>.
                  </p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Estrutura de Dados */}
        <AccordionItem value="dados" className="rounded-lg border bg-card px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <span className="font-semibold">Estrutura de Dados</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <pre className="overflow-x-auto text-xs">
{`-- =====================================================
-- Configurações de ERP por Tenant
-- =====================================================
CREATE TABLE erp_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Identificação
  provider TEXT NOT NULL CHECK (provider IN ('ixc_soft', 'sgp', 'mk_solutions', 'hubsoft')),
  name TEXT NOT NULL,
  
  -- Credenciais (criptografadas)
  credentials_encrypted BYTEA NOT NULL,
  encryption_iv BYTEA NOT NULL,
  
  -- Configurações
  api_url TEXT NOT NULL,
  webhook_secret TEXT,
  sync_interval_minutes INTEGER DEFAULT 60,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  last_sync_status TEXT CHECK (last_sync_status IN ('success', 'partial', 'failed')),
  last_error TEXT,
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(tenant_id, provider)
);

-- =====================================================
-- Logs de Sincronização
-- =====================================================
CREATE TABLE erp_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  config_id UUID NOT NULL REFERENCES erp_configs(id) ON DELETE CASCADE,
  
  -- Tipo
  sync_type TEXT NOT NULL CHECK (sync_type IN (
    'clientes', 'faturas', 'contratos', 'conexoes', 'full'
  )),
  direction TEXT NOT NULL CHECK (direction IN ('import', 'export', 'bidirectional')),
  
  -- Resultado
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'partial', 'failed')),
  records_processed INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  
  -- Erro (se houver)
  error_message TEXT,
  error_details JSONB,
  
  -- Timing
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- Mapeamento de Campos Customizado
-- =====================================================
CREATE TABLE erp_field_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  config_id UUID NOT NULL REFERENCES erp_configs(id) ON DELETE CASCADE,
  
  -- Mapeamento
  entity_type TEXT NOT NULL CHECK (entity_type IN ('cliente', 'fatura', 'contrato', 'conexao')),
  erp_field TEXT NOT NULL,
  autoisp_field TEXT NOT NULL,
  transform_function TEXT, -- ex: 'uppercase', 'parse_date', 'format_cpf'
  
  -- Metadados
  is_required BOOLEAN DEFAULT false,
  default_value TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(config_id, entity_type, erp_field)
);

-- =====================================================
-- Webhooks Recebidos do ERP
-- =====================================================
CREATE TABLE erp_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  config_id UUID NOT NULL REFERENCES erp_configs(id) ON DELETE CASCADE,
  
  -- Evento
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  signature TEXT,
  
  -- Processamento
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'processed', 'failed')),
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Metadados
  received_at TIMESTAMPTZ DEFAULT now(),
  ip_address INET
);

-- =====================================================
-- Clientes Sincronizados do ERP
-- =====================================================
CREATE TABLE erp_clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  config_id UUID NOT NULL REFERENCES erp_configs(id) ON DELETE CASCADE,
  
  -- Identificador no ERP
  erp_id TEXT NOT NULL,
  
  -- Dados Básicos
  nome TEXT NOT NULL,
  cpf_cnpj TEXT,
  email TEXT,
  telefone TEXT,
  celular TEXT,
  
  -- Endereço
  endereco JSONB,
  
  -- Status no ERP
  status_erp TEXT,
  data_cadastro_erp TIMESTAMPTZ,
  
  -- Vínculo com AutoISP (opcional)
  assinante_id UUID REFERENCES assinantes(id),
  
  -- Sincronização
  last_sync_at TIMESTAMPTZ DEFAULT now(),
  sync_hash TEXT, -- Para detectar mudanças
  raw_data JSONB, -- Dados originais do ERP
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(config_id, erp_id)
);

-- =====================================================
-- Faturas Sincronizadas do ERP
-- =====================================================
CREATE TABLE erp_faturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  config_id UUID NOT NULL REFERENCES erp_configs(id) ON DELETE CASCADE,
  erp_cliente_id UUID REFERENCES erp_clientes(id) ON DELETE CASCADE,
  
  -- Identificador no ERP
  erp_id TEXT NOT NULL,
  
  -- Dados da Fatura
  valor DECIMAL(10,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status TEXT NOT NULL CHECK (status IN ('aberta', 'paga', 'vencida', 'cancelada')),
  
  -- Boleto
  linha_digitavel TEXT,
  codigo_barras TEXT,
  url_boleto TEXT,
  
  -- PIX
  pix_qrcode TEXT,
  pix_copia_cola TEXT,
  
  -- Sincronização
  last_sync_at TIMESTAMPTZ DEFAULT now(),
  raw_data JSONB,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(config_id, erp_id)
);

-- =====================================================
-- Contratos Sincronizados do ERP
-- =====================================================
CREATE TABLE erp_contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  config_id UUID NOT NULL REFERENCES erp_configs(id) ON DELETE CASCADE,
  erp_cliente_id UUID REFERENCES erp_clientes(id) ON DELETE CASCADE,
  
  -- Identificador no ERP
  erp_id TEXT NOT NULL,
  
  -- Dados do Contrato
  plano_nome TEXT NOT NULL,
  velocidade_download INTEGER, -- Mbps
  velocidade_upload INTEGER,   -- Mbps
  valor_mensal DECIMAL(10,2),
  
  -- Datas
  data_inicio DATE,
  data_fim DATE,
  
  -- Status
  status TEXT NOT NULL CHECK (status IN ('ativo', 'suspenso', 'cancelado', 'bloqueado')),
  
  -- Conexão
  ip_address INET,
  mac_address TEXT,
  
  -- Sincronização
  last_sync_at TIMESTAMPTZ DEFAULT now(),
  raw_data JSONB,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(config_id, erp_id)
);

-- =====================================================
-- Índices para Performance
-- =====================================================
CREATE INDEX idx_erp_configs_tenant ON erp_configs(tenant_id);
CREATE INDEX idx_erp_configs_active ON erp_configs(tenant_id, is_active);

CREATE INDEX idx_erp_sync_logs_tenant ON erp_sync_logs(tenant_id);
CREATE INDEX idx_erp_sync_logs_config ON erp_sync_logs(config_id);
CREATE INDEX idx_erp_sync_logs_status ON erp_sync_logs(status, started_at);

CREATE INDEX idx_erp_webhooks_tenant ON erp_webhooks(tenant_id);
CREATE INDEX idx_erp_webhooks_pending ON erp_webhooks(status) WHERE status = 'pending';

CREATE INDEX idx_erp_clientes_tenant ON erp_clientes(tenant_id);
CREATE INDEX idx_erp_clientes_erp_id ON erp_clientes(config_id, erp_id);
CREATE INDEX idx_erp_clientes_cpf ON erp_clientes(tenant_id, cpf_cnpj);

CREATE INDEX idx_erp_faturas_tenant ON erp_faturas(tenant_id);
CREATE INDEX idx_erp_faturas_status ON erp_faturas(tenant_id, status, data_vencimento);

CREATE INDEX idx_erp_contratos_tenant ON erp_contratos(tenant_id);
CREATE INDEX idx_erp_contratos_status ON erp_contratos(tenant_id, status);

-- =====================================================
-- RLS Policies
-- =====================================================
ALTER TABLE erp_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_field_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_faturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_contratos ENABLE ROW LEVEL SECURITY;

-- Policies para erp_configs
CREATE POLICY "Tenant isolation" ON erp_configs
  FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Admin full access" ON erp_configs
  FOR ALL USING (
    tenant_id = get_current_tenant_id() 
    AND has_role('admin')
  );

-- Policies para tabelas de dados
CREATE POLICY "Tenant isolation" ON erp_clientes
  FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Tenant isolation" ON erp_faturas
  FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Tenant isolation" ON erp_contratos
  FOR ALL USING (tenant_id = get_current_tenant_id());

-- Policies para logs e webhooks
CREATE POLICY "Tenant isolation" ON erp_sync_logs
  FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Tenant isolation" ON erp_webhooks
  FOR ALL USING (tenant_id = get_current_tenant_id());`}
              </pre>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Adapter Pattern */}
        <AccordionItem value="adapter" className="rounded-lg border bg-card px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-primary" />
              <span className="font-semibold">Adapter Pattern Implementation</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div>
              <h4 className="mb-3 font-medium">Interface Base do Adapter</h4>
              <div className="rounded-lg bg-muted/50 p-4">
                <pre className="overflow-x-auto text-xs">
{`// types/erp-adapter.ts

export interface ErpCredentials {
  apiUrl: string;
  [key: string]: string; // Credenciais específicas do ERP
}

export interface ErpCliente {
  erpId: string;
  nome: string;
  cpfCnpj?: string;
  email?: string;
  telefone?: string;
  celular?: string;
  endereco?: {
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
  statusErp: string;
  dataCadastro?: Date;
  rawData: Record<string, unknown>;
}

export interface ErpFatura {
  erpId: string;
  clienteErpId: string;
  valor: number;
  dataVencimento: Date;
  dataPagamento?: Date;
  status: 'aberta' | 'paga' | 'vencida' | 'cancelada';
  linhaDigitavel?: string;
  codigoBarras?: string;
  urlBoleto?: string;
  pixQrcode?: string;
  pixCopiaCola?: string;
  rawData: Record<string, unknown>;
}

export interface ErpContrato {
  erpId: string;
  clienteErpId: string;
  planoNome: string;
  velocidadeDownload?: number;
  velocidadeUpload?: number;
  valorMensal?: number;
  dataInicio?: Date;
  dataFim?: Date;
  status: 'ativo' | 'suspenso' | 'cancelado' | 'bloqueado';
  ipAddress?: string;
  macAddress?: string;
  rawData: Record<string, unknown>;
}

export interface SyncResult<T> {
  success: boolean;
  data: T[];
  errors: Array<{ id: string; error: string }>;
  totalProcessed: number;
  totalCreated: number;
  totalUpdated: number;
  totalFailed: number;
}

export interface ErpAdapter {
  // Identificação
  readonly provider: 'ixc_soft' | 'sgp' | 'mk_solutions' | 'hubsoft';
  
  // Autenticação
  authenticate(): Promise<boolean>;
  
  // Clientes
  fetchClientes(lastSync?: Date): Promise<ErpCliente[]>;
  getCliente(erpId: string): Promise<ErpCliente | null>;
  
  // Faturas
  fetchFaturas(lastSync?: Date): Promise<ErpFatura[]>;
  getFatura(erpId: string): Promise<ErpFatura | null>;
  
  // Contratos
  fetchContratos(lastSync?: Date): Promise<ErpContrato[]>;
  getContrato(erpId: string): Promise<ErpContrato | null>;
  
  // Ações
  bloquearConexao(contratoErpId: string, motivo: string): Promise<boolean>;
  desbloquearConexao(contratoErpId: string): Promise<boolean>;
  
  // Webhooks
  validateWebhookSignature(payload: string, signature: string): boolean;
  parseWebhookPayload(payload: unknown): { event: string; data: unknown };
}`}
                </pre>
              </div>
            </div>

            <div>
              <h4 className="mb-3 font-medium">Factory de Adapters</h4>
              <div className="rounded-lg bg-muted/50 p-4">
                <pre className="overflow-x-auto text-xs">
{`// adapters/erp-factory.ts

import { ErpAdapter, ErpCredentials } from './types';
import { IxcSoftAdapter } from './ixc-soft-adapter';
import { SgpAdapter } from './sgp-adapter';
import { MkSolutionsAdapter } from './mk-solutions-adapter';
import { HubsoftAdapter } from './hubsoft-adapter';

export type ErpProvider = 'ixc_soft' | 'sgp' | 'mk_solutions' | 'hubsoft';

export function createErpAdapter(
  provider: ErpProvider,
  credentials: ErpCredentials
): ErpAdapter {
  switch (provider) {
    case 'ixc_soft':
      return new IxcSoftAdapter(credentials);
    case 'sgp':
      return new SgpAdapter(credentials);
    case 'mk_solutions':
      return new MkSolutionsAdapter(credentials);
    case 'hubsoft':
      return new HubsoftAdapter(credentials);
    default:
      throw new Error(\`ERP provider não suportado: \${provider}\`);
  }
}`}
                </pre>
              </div>
            </div>

            <div>
              <h4 className="mb-3 font-medium">Exemplo: IXC Soft Adapter</h4>
              <div className="rounded-lg bg-muted/50 p-4">
                <pre className="overflow-x-auto text-xs">
{`// adapters/ixc-soft-adapter.ts

import { ErpAdapter, ErpCliente, ErpFatura, ErpContrato, ErpCredentials } from './types';

export class IxcSoftAdapter implements ErpAdapter {
  readonly provider = 'ixc_soft' as const;
  private apiUrl: string;
  private token: string;
  private authenticated = false;

  constructor(credentials: ErpCredentials) {
    this.apiUrl = credentials.apiUrl;
    this.token = credentials.token;
  }

  async authenticate(): Promise<boolean> {
    try {
      const response = await fetch(\`\${this.apiUrl}/webservice/v1/cliente\`, {
        method: 'GET',
        headers: {
          'Authorization': \`Bearer \${this.token}\`,
          'Content-Type': 'application/json',
          'ixcsoft': 'listar'
        }
      });
      
      this.authenticated = response.ok;
      return this.authenticated;
    } catch (error) {
      console.error('Erro ao autenticar no IXC:', error);
      return false;
    }
  }

  async fetchClientes(lastSync?: Date): Promise<ErpCliente[]> {
    if (!this.authenticated) await this.authenticate();
    
    const params = new URLSearchParams({
      qtype: 'cliente.id',
      query: '',
      ession: 'listar',
      sortname: 'cliente.id',
      sortorder: 'asc'
    });

    if (lastSync) {
      params.append('grid_param', JSON.stringify([{
        TB: 'cliente.data_cadastro',
        OP: '>=',
        P: lastSync.toISOString().split('T')[0]
      }]));
    }

    const response = await fetch(\`\${this.apiUrl}/webservice/v1/cliente?\${params}\`, {
      headers: {
        'Authorization': \`Bearer \${this.token}\`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    return data.registros.map((reg: any) => this.mapCliente(reg));
  }

  private mapCliente(raw: any): ErpCliente {
    return {
      erpId: String(raw.id),
      nome: raw.razao,
      cpfCnpj: raw.cnpj_cpf,
      email: raw.email,
      telefone: raw.telefone_comercial,
      celular: raw.telefone_celular,
      endereco: {
        logradouro: raw.endereco,
        numero: raw.numero,
        bairro: raw.bairro,
        cidade: raw.cidade,
        uf: raw.estado,
        cep: raw.cep
      },
      statusErp: raw.ativo === 'S' ? 'ativo' : 'inativo',
      dataCadastro: raw.data_cadastro ? new Date(raw.data_cadastro) : undefined,
      rawData: raw
    };
  }

  async getCliente(erpId: string): Promise<ErpCliente | null> {
    if (!this.authenticated) await this.authenticate();
    
    const response = await fetch(\`\${this.apiUrl}/webservice/v1/cliente/\${erpId}\`, {
      headers: {
        'Authorization': \`Bearer \${this.token}\`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) return null;
    
    const data = await response.json();
    return this.mapCliente(data);
  }

  // ... implementação dos demais métodos

  async fetchFaturas(lastSync?: Date): Promise<ErpFatura[]> {
    // Implementação similar a fetchClientes
    return [];
  }

  async getFatura(erpId: string): Promise<ErpFatura | null> {
    return null;
  }

  async fetchContratos(lastSync?: Date): Promise<ErpContrato[]> {
    return [];
  }

  async getContrato(erpId: string): Promise<ErpContrato | null> {
    return null;
  }

  async bloquearConexao(contratoErpId: string, motivo: string): Promise<boolean> {
    if (!this.authenticated) await this.authenticate();
    
    const response = await fetch(
      \`\${this.apiUrl}/webservice/v1/radusuarios/\${contratoErpId}\`,
      {
        method: 'PUT',
        headers: {
          'Authorization': \`Bearer \${this.token}\`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bloqueado: 'S',
          obs_bloqueio: motivo
        })
      }
    );
    
    return response.ok;
  }

  async desbloquearConexao(contratoErpId: string): Promise<boolean> {
    if (!this.authenticated) await this.authenticate();
    
    const response = await fetch(
      \`\${this.apiUrl}/webservice/v1/radusuarios/\${contratoErpId}\`,
      {
        method: 'PUT',
        headers: {
          'Authorization': \`Bearer \${this.token}\`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bloqueado: 'N',
          obs_bloqueio: null
        })
      }
    );
    
    return response.ok;
  }

  validateWebhookSignature(payload: string, signature: string): boolean {
    // IXC usa HMAC-SHA256
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', this.token);
    const expectedSignature = hmac.update(payload).digest('hex');
    return signature === expectedSignature;
  }

  parseWebhookPayload(payload: unknown): { event: string; data: unknown } {
    const p = payload as any;
    return {
      event: p.tipo || 'unknown',
      data: p.dados || p
    };
  }
}`}
                </pre>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Edge Function */}
        <AccordionItem value="edge-function" className="rounded-lg border bg-card px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-primary" />
              <span className="font-semibold">Edge Function: sync-erp</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <pre className="overflow-x-auto text-xs">
{`// supabase/functions/sync-erp/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyncRequest {
  configId: string;
  syncType: 'clientes' | 'faturas' | 'contratos' | 'full';
  force?: boolean;
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

    // Validar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Token de autorização não fornecido');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Usuário não autenticado');
    }

    const { configId, syncType, force = false }: SyncRequest = await req.json();

    // Buscar configuração do ERP
    const { data: config, error: configError } = await supabase
      .from('erp_configs')
      .select('*')
      .eq('id', configId)
      .single();

    if (configError || !config) {
      throw new Error('Configuração de ERP não encontrada');
    }

    // Verificar intervalo mínimo de sync (evitar sobrecarga)
    if (!force && config.last_sync_at) {
      const lastSync = new Date(config.last_sync_at);
      const minInterval = config.sync_interval_minutes * 60 * 1000;
      if (Date.now() - lastSync.getTime() < minInterval) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Sincronização recente. Aguarde o intervalo mínimo.',
            nextSyncAt: new Date(lastSync.getTime() + minInterval)
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Criar log de sync
    const { data: syncLog, error: logError } = await supabase
      .from('erp_sync_logs')
      .insert({
        tenant_id: config.tenant_id,
        config_id: configId,
        sync_type: syncType,
        direction: 'import',
        status: 'running'
      })
      .select()
      .single();

    if (logError) {
      throw new Error('Erro ao criar log de sincronização');
    }

    // Descriptografar credenciais
    const credentials = await decryptCredentials(
      config.credentials_encrypted,
      config.encryption_iv,
      config.tenant_id
    );

    // Criar adapter
    const adapter = createErpAdapter(config.provider, {
      apiUrl: config.api_url,
      ...credentials
    });

    // Autenticar no ERP
    const authenticated = await adapter.authenticate();
    if (!authenticated) {
      await updateSyncLog(supabase, syncLog.id, {
        status: 'failed',
        error_message: 'Falha na autenticação com o ERP'
      });
      throw new Error('Falha na autenticação com o ERP');
    }

    let result = {
      totalProcessed: 0,
      totalCreated: 0,
      totalUpdated: 0,
      totalFailed: 0,
      errors: [] as Array<{ id: string; error: string }>
    };

    // Executar sincronização baseada no tipo
    if (syncType === 'clientes' || syncType === 'full') {
      const clientesResult = await syncClientes(supabase, adapter, config);
      result = mergeResults(result, clientesResult);
    }

    if (syncType === 'faturas' || syncType === 'full') {
      const faturasResult = await syncFaturas(supabase, adapter, config);
      result = mergeResults(result, faturasResult);
    }

    if (syncType === 'contratos' || syncType === 'full') {
      const contratosResult = await syncContratos(supabase, adapter, config);
      result = mergeResults(result, contratosResult);
    }

    // Atualizar log de sync
    const finalStatus = result.totalFailed === 0 ? 'success' : 
                        result.totalFailed < result.totalProcessed ? 'partial' : 'failed';

    await updateSyncLog(supabase, syncLog.id, {
      status: finalStatus,
      records_processed: result.totalProcessed,
      records_created: result.totalCreated,
      records_updated: result.totalUpdated,
      records_failed: result.totalFailed,
      error_details: result.errors.length > 0 ? { errors: result.errors } : null,
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - new Date(syncLog.started_at).getTime()
    });

    // Atualizar config com status da última sync
    await supabase
      .from('erp_configs')
      .update({
        last_sync_at: new Date().toISOString(),
        last_sync_status: finalStatus,
        last_error: result.errors[0]?.error || null
      })
      .eq('id', configId);

    return new Response(
      JSON.stringify({
        success: true,
        syncLogId: syncLog.id,
        ...result
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na sincronização:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Funções auxiliares
async function syncClientes(supabase: any, adapter: any, config: any) {
  const clientes = await adapter.fetchClientes(
    config.last_sync_at ? new Date(config.last_sync_at) : undefined
  );

  let created = 0, updated = 0, failed = 0;
  const errors: Array<{ id: string; error: string }> = [];

  for (const cliente of clientes) {
    try {
      const { data: existing } = await supabase
        .from('erp_clientes')
        .select('id')
        .eq('config_id', config.id)
        .eq('erp_id', cliente.erpId)
        .single();

      if (existing) {
        await supabase
          .from('erp_clientes')
          .update({
            nome: cliente.nome,
            cpf_cnpj: cliente.cpfCnpj,
            email: cliente.email,
            telefone: cliente.telefone,
            celular: cliente.celular,
            endereco: cliente.endereco,
            status_erp: cliente.statusErp,
            last_sync_at: new Date().toISOString(),
            raw_data: cliente.rawData
          })
          .eq('id', existing.id);
        updated++;
      } else {
        await supabase
          .from('erp_clientes')
          .insert({
            tenant_id: config.tenant_id,
            config_id: config.id,
            erp_id: cliente.erpId,
            nome: cliente.nome,
            cpf_cnpj: cliente.cpfCnpj,
            email: cliente.email,
            telefone: cliente.telefone,
            celular: cliente.celular,
            endereco: cliente.endereco,
            status_erp: cliente.statusErp,
            data_cadastro_erp: cliente.dataCadastro,
            raw_data: cliente.rawData
          });
        created++;
      }
    } catch (error) {
      failed++;
      errors.push({ id: cliente.erpId, error: error.message });
    }
  }

  return {
    totalProcessed: clientes.length,
    totalCreated: created,
    totalUpdated: updated,
    totalFailed: failed,
    errors
  };
}

// Implementações similares para syncFaturas e syncContratos...`}
              </pre>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Features Relacionadas */}
        <AccordionItem value="features" className="rounded-lg border bg-card px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="font-semibold">Features Relacionadas</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="mb-3 font-medium text-foreground">Painel Cliente</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">PC-DASH-03</Badge>
                    Status da conexão (via ERP)
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">PC-FAT-01</Badge>
                    Histórico de faturas sincronizado
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">PC-FAT-02</Badge>
                    Segunda via de boleto do ERP
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">PC-SERV-01</Badge>
                    Dados do contrato/plano
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="mb-3 font-medium text-foreground">Painel Admin</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">PA-INT-01</Badge>
                    Configuração de integrações ERP
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">PA-INT-02</Badge>
                    Logs de sincronização
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">PA-INT-03</Badge>
                    Mapeamento de campos customizado
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">PA-CLI-01</Badge>
                    Lista de clientes com dados do ERP
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">PA-FIN-01</Badge>
                    Dashboard financeiro com dados ERP
                  </li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Segurança */}
        <AccordionItem value="seguranca" className="rounded-lg border bg-card px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="font-semibold">Segurança</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-green-500/20 bg-green-500/5">
                <CardContent className="pt-4">
                  <h4 className="mb-2 font-medium text-green-600">Criptografia de Credenciais</h4>
                  <p className="text-sm text-muted-foreground">
                    Credenciais são criptografadas com AES-256-GCM antes de armazenar. A chave é 
                    derivada do <code>ENCRYPTION_KEY</code> + <code>tenant_id</code> usando PBKDF2.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-500/20 bg-green-500/5">
                <CardContent className="pt-4">
                  <h4 className="mb-2 font-medium text-green-600">Isolamento por Tenant</h4>
                  <p className="text-sm text-muted-foreground">
                    RLS garante que cada tenant só acessa seus próprios dados de ERP. 
                    Logs de sync e webhooks são isolados por tenant_id.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-500/20 bg-green-500/5">
                <CardContent className="pt-4">
                  <h4 className="mb-2 font-medium text-green-600">Rate Limiting</h4>
                  <p className="text-sm text-muted-foreground">
                    Intervalo mínimo configurável entre sincronizações para evitar sobrecarga 
                    na API do ERP. Default: 60 minutos.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-500/20 bg-green-500/5">
                <CardContent className="pt-4">
                  <h4 className="mb-2 font-medium text-green-600">Validação de Webhooks</h4>
                  <p className="text-sm text-muted-foreground">
                    Webhooks recebidos são validados via HMAC-SHA256 usando o webhook_secret 
                    configurado. Payloads inválidos são rejeitados.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-500/20 bg-green-500/5">
                <CardContent className="pt-4">
                  <h4 className="mb-2 font-medium text-green-600">Logs de Auditoria</h4>
                  <p className="text-sm text-muted-foreground">
                    Todas as sincronizações e webhooks são registrados com timestamps, 
                    status e detalhes para auditoria completa.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-500/20 bg-green-500/5">
                <CardContent className="pt-4">
                  <h4 className="mb-2 font-medium text-green-600">Retry com Backoff</h4>
                  <p className="text-sm text-muted-foreground">
                    Falhas em webhooks são reenviadas com exponential backoff 
                    (1min, 5min, 15min, 1h). Máximo de 5 tentativas.
                  </p>
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Troubleshooting */}
        <AccordionItem value="troubleshooting" className="rounded-lg border bg-card px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-primary" />
              <span className="font-semibold">Troubleshooting</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Erro</TableHead>
                  <TableHead>Causa Provável</TableHead>
                  <TableHead>Solução</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">401 Unauthorized</TableCell>
                  <TableCell>Token expirado ou inválido</TableCell>
                  <TableCell>Renovar credenciais no ERP e atualizar em erp_configs</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">403 Forbidden</TableCell>
                  <TableCell>Usuário sem permissão na API do ERP</TableCell>
                  <TableCell>Verificar permissões do usuário de integração no ERP</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">429 Too Many Requests</TableCell>
                  <TableCell>Rate limit da API do ERP excedido</TableCell>
                  <TableCell>Aumentar sync_interval_minutes ou reduzir volume por sync</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Timeout na sync</TableCell>
                  <TableCell>Volume muito grande de dados</TableCell>
                  <TableCell>Usar paginação no adapter, sincronizar em lotes menores</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Dados duplicados</TableCell>
                  <TableCell>Falha no upsert ou mapeamento incorreto</TableCell>
                  <TableCell>Verificar constraint UNIQUE(config_id, erp_id)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Webhook não processado</TableCell>
                  <TableCell>Assinatura inválida ou erro no parser</TableCell>
                  <TableCell>Verificar webhook_secret e logs de erp_webhooks</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Campo não mapeado</TableCell>
                  <TableCell>ERP retorna campo não previsto</TableCell>
                  <TableCell>Adicionar mapeamento em erp_field_mappings</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">SOAP timeout (MK)</TableCell>
                  <TableCell>WSDL lento ou servidor MK sobrecarregado</TableCell>
                  <TableCell>Configurar timeout maior no adapter MK Solutions</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>

        {/* Custos */}
        <AccordionItem value="custos" className="rounded-lg border bg-card px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="font-semibold">Custos e Licenciamento</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ERP</TableHead>
                  <TableHead>Custo da Integração</TableHead>
                  <TableHead>Observações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">IXC Soft</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500/10 text-green-600">Incluído no plano</Badge>
                  </TableCell>
                  <TableCell>API inclusa em todos os planos do IXC</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">SGP</TableCell>
                  <TableCell>
                    <Badge className="bg-yellow-500/10 text-yellow-600">Módulo adicional</Badge>
                  </TableCell>
                  <TableCell>Módulo "API" precisa ser contratado separadamente</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">MK Solutions</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500/10 text-green-600">Incluído no plano</Badge>
                  </TableCell>
                  <TableCell>Webservice incluso, mas requer ativação pelo suporte</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Hubsoft</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500/10 text-green-600">Incluído no plano</Badge>
                  </TableCell>
                  <TableCell>API REST disponível em planos Business+</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="mt-4 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
              <h4 className="mb-2 font-medium text-blue-600">Considerações</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Verificar com cada ERP os limites de requisições/minuto da API</li>
                <li>• Alguns ERPs cobram por volume de chamadas acima de certo threshold</li>
                <li>• Manter contato com suporte do ERP para troubleshooting avançado</li>
                <li>• Documentar endpoints customizados/versões específicas de cada cliente</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default ERPIntegration;

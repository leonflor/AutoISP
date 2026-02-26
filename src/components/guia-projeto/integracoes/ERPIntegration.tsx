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
  Shield, 
  AlertTriangle, 
  DollarSign,
  Code,
  Users,
  FileText,
  Settings,
  Layers,
  ExternalLink,
  Tag,
  Eye
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
                  Arquitetura de 3 camadas para integração com sistemas de gestão de ISPs
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
              no Brasil. Utiliza uma arquitetura de <strong>3 camadas</strong> (Tipos → Driver → Providers) para abstrair 
              as diferenças entre APIs, garantindo <strong>origem obrigatória</strong> em cada registro e normalização 
              padronizada de status entre ERPs.
            </p>

            <div>
              <h4 className="mb-3 font-medium text-foreground">ERPs Suportados</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ERP</TableHead>
                    <TableHead>Provider Key</TableHead>
                    <TableHead>Tipo API</TableHead>
                    <TableHead>Sinal ONU</TableHead>
                    <TableHead>Documentação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">IXC Soft</TableCell>
                    <TableCell><code className="text-xs bg-muted px-1 rounded">ixc</code></TableCell>
                    <TableCell><Badge variant="outline">REST (Basic Auth)</Badge></TableCell>
                    <TableCell><Badge className="bg-green-500/10 text-green-600">Suportado</Badge></TableCell>
                    <TableCell><Badge className="bg-green-500/10 text-green-600">Disponível</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">SGP</TableCell>
                    <TableCell><code className="text-xs bg-muted px-1 rounded">sgp</code></TableCell>
                    <TableCell><Badge variant="outline">REST (Token+App)</Badge></TableCell>
                    <TableCell><Badge className="bg-muted text-muted-foreground">N/D</Badge></TableCell>
                    <TableCell>
                      <a href="https://bookstack.sgp.net.br/books" target="_blank" rel="noopener noreferrer">
                        <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 cursor-pointer gap-1">
                          Docs API <ExternalLink className="h-3 w-3" />
                        </Badge>
                      </a>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">MK-Solutions</TableCell>
                    <TableCell><code className="text-xs bg-muted px-1 rounded">mk_solutions</code></TableCell>
                    <TableCell><Badge variant="outline">REST (Token)</Badge></TableCell>
                    <TableCell><Badge className="bg-muted text-muted-foreground">N/D</Badge></TableCell>
                    <TableCell><Badge className="bg-yellow-500/10 text-yellow-600">Parcial</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Hubsoft</TableCell>
                    <TableCell><code className="text-xs bg-muted px-1 rounded">hubsoft</code></TableCell>
                    <TableCell><Badge variant="outline">REST</Badge></TableCell>
                    <TableCell><Badge className="bg-muted text-muted-foreground">Pendente</Badge></TableCell>
                    <TableCell><Badge className="bg-green-500/10 text-green-600">Disponível</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Arquitetura 3 Camadas */}
        <AccordionItem value="arquitetura" className="rounded-lg border bg-card px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <span className="font-semibold">Arquitetura de 3 Camadas</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <pre className="overflow-x-auto text-xs">
{`┌─────────────────────────────────────────────────────────────────────────┐
│  CAMADA 1 — Tipos Padrão (erp-types.ts)                                │
│  Define O QUE será exibido/consultado                                   │
│  • ErpClient, ErpInvoice, ErpCredentials, TestResult                   │
│  • InternetStatus: "ativo" | "bloqueado" | "financeiro_em_atraso"      │
│    | "outros"                                                           │
│  • ErpProvider: "ixc" | "mk_solutions" | "sgp" | "hubsoft"            │
│  • Tipos brutos: RawCliente, RawContrato, RawFatura, RawFibraRecord,  │
│    RawRadusuario, RawSignalData                                         │
│  • ErpProviderDriver: contrato granular (fetchClientes, fetchContratos,│
│    fetchFaturas, fetchRadusuarios, fetchFibra, fetchRawSignal)          │
├─────────────────────────────────────────────────────────────────────────┤
│  CAMADA 2 — Driver / Orquestrador (erp-driver.ts)                      │
│  Decide DE ONDE buscar e NORMALIZA os dados                             │
│  • resolveCredentials(): decrypt AES-256-GCM                            │
│  • composeIxcClients(): 4 chamadas paralelas → ErpClient[]             │
│  • composeSimpleClients(): SGP/MK → ErpClient[]                        │
│  • normalizeInternetStatus(): IXC_INTERNET_STATUS_MAP → InternetStatus │
│  • fetchInvoices(): CPF → id_cliente → faturas reais → ErpInvoice[]    │
│  • fetchAllClients(), searchClients(), fetchClientSignal()              │
│  • INJETA provider + provider_name em cada registro                     │
├─────────────────────────────────────────────────────────────────────────┤
│  CAMADA 3 — Providers / Conectores (erp-providers/*.ts)                │
│  Conexão EFETIVA com cada ERP — dados BRUTOS, sem normalização         │
│  • IXC: 6 funções granulares (fetchClientes, fetchContratos,           │
│    fetchRadusuarios, fetchFibra, fetchFaturas, fetchRawSignal)          │
│  • SGP: fetchClientes + stubs (contratos/faturas retornam [])          │
│  • MK: fetchClientes + stubs (contratos/faturas retornam [])           │
│  • Registry: getProvider("ixc") → ErpProviderDriver                    │
│  • Filtros ERP-específicos aplicados aqui (ex: status='A' no IXC)      │
└─────────────────────────────────────────────────────────────────────────┘`}
              </pre>
            </div>

            <div>
              <h4 className="mb-3 font-medium">Fluxo de uma Requisição</h4>
              <div className="rounded-lg bg-muted/50 p-4">
                <pre className="overflow-x-auto text-xs">
{`═══ FLUXO 1: Listagem de Assinantes ═══

Frontend (useErpClients)
    │
    ▼
Edge Function (fetch-erp-clients)
    │
    ▼
CAMADA 2: fetchAllClients(supabaseAdmin, ispId, encryptionKey)
    ├── Consulta erp_configs (quais ERPs ativos)
    ├── Para cada config:
    │
    │   ┌─ IXC (composição granular) ──────────────────────────┐
    │   │  CAMADA 3: Promise.all([                             │
    │   │    fetchRadusuarios(creds),                          │
    │   │    fetchClientes(creds),                             │
    │   │    fetchContratos(creds),  // filtra status='A'      │
    │   │    fetchFibra(creds),                                │
    │   │  ])                                                   │
    │   │  CAMADA 2: composeIxcClients()                       │
    │   │    ├── Join radusuario → cliente → contrato → fibra  │
    │   │    ├── normalizeInternetStatus(status_internet)      │
    │   │    └── INJETA provider + provider_name               │
    │   └──────────────────────────────────────────────────────┘
    │
    │   ┌─ SGP / MK (composição simples) ─────────────────────┐
    │   │  CAMADA 3: fetchClientes(creds)                     │
    │   │  CAMADA 2: composeSimpleClients()                   │
    │   │    ├── status_internet = "ativo" (padrão)           │
    │   │    └── INJETA provider + provider_name               │
    │   └──────────────────────────────────────────────────────┘
    │
    ▼
CAMADA 1: ErpClient[] (cada registro com provider + status_internet)


═══ FLUXO 2: Consulta de Faturas (IA) ═══

Tool Handler (erp_invoice_search) recebe { cpf_cnpj }
    │
    ▼
CAMADA 2: fetchInvoices(supabase, ispId, encryptionKey, cpfCnpj)
    ├── Consulta erp_configs (quais ERPs ativos)
    ├── Para cada config:
    │       │
    │   CAMADA 3 (IXC):
    │       ├── fetchClientes(creds, { cpf_cnpj })  → id_cliente
    │       └── fetchFaturas(creds, { cpf_cnpj })
    │              ├── POST /fn_areceber (status='A')
    │              └── Retorna RawFatura[]
    │
    │   CAMADA 2: normaliza cada fatura
    │       ├── Calcula dias_atraso = hoje - data_vencimento
    │       └── INJETA provider + provider_name
    │
    ▼
CAMADA 1: ErpInvoice[] (faturas reais com dias_atraso)`}
                </pre>
              </div>
            </div>

            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
              <h4 className="mb-2 font-medium text-blue-600">Arquivos da Arquitetura</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Camada</TableHead>
                    <TableHead>Arquivo</TableHead>
                    <TableHead>Responsabilidade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell><Badge variant="outline">1</Badge></TableCell>
                    <TableCell><code className="text-xs">_shared/erp-types.ts</code></TableCell>
                    <TableCell>Interfaces (ErpClient, ErpInvoice), InternetStatus, tipos brutos (RawFatura, RawContrato, etc.), ErpProviderDriver</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Badge variant="outline">2</Badge></TableCell>
                    <TableCell><code className="text-xs">_shared/erp-driver.ts</code></TableCell>
                    <TableCell>Orquestração, composição granular (composeIxcClients/composeSimpleClients), normalização status_internet, fetchInvoices, decrypt AES-256-GCM</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Badge variant="outline">3</Badge></TableCell>
                    <TableCell><code className="text-xs">_shared/erp-providers/ixc.ts</code></TableCell>
                    <TableCell>6 funções granulares: fetchClientes, fetchContratos, fetchRadusuarios, fetchFibra, fetchFaturas, fetchRawSignal</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Badge variant="outline">3</Badge></TableCell>
                    <TableCell><code className="text-xs">_shared/erp-providers/sgp.ts</code></TableCell>
                    <TableCell>fetchClientes + stubs para contratos/faturas (retornam [])</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Badge variant="outline">3</Badge></TableCell>
                    <TableCell><code className="text-xs">_shared/erp-providers/mk.ts</code></TableCell>
                    <TableCell>fetchClientes + stubs para contratos/faturas (retornam [])</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Badge variant="outline">3</Badge></TableCell>
                    <TableCell><code className="text-xs">_shared/erp-providers/index.ts</code></TableCell>
                    <TableCell>Registry: getProvider(name)</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Origem Obrigatória */}
        <AccordionItem value="origem" className="rounded-lg border bg-card px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" />
              <span className="font-semibold">Origem Obrigatória</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-4">
              <h4 className="mb-2 font-medium text-orange-600">Regra Fundamental</h4>
              <p className="text-sm text-muted-foreground">
                Todo registro retornado ao frontend <strong>deve</strong> conter dois campos obrigatórios que identificam 
                o ERP de origem. Esses campos nunca podem ser null ou vazios.
              </p>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Exemplo</TableHead>
                  <TableHead>Uso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell><code className="text-xs bg-muted px-1 rounded">provider</code></TableCell>
                  <TableCell><code className="text-xs">ErpProvider</code> (literal)</TableCell>
                  <TableCell><code className="text-xs">"ixc"</code>, <code className="text-xs">"sgp"</code></TableCell>
                  <TableCell>Filtros, roteamento, lógica condicional</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="text-xs bg-muted px-1 rounded">provider_name</code></TableCell>
                  <TableCell><code className="text-xs">string</code></TableCell>
                  <TableCell><code className="text-xs">"IXC Soft"</code>, <code className="text-xs">"SGP"</code></TableCell>
                  <TableCell>Badges de UI, exibição ao usuário</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <p className="text-sm text-muted-foreground">
              A <strong>Camada 2 (Driver)</strong> é responsável por injetar esses campos automaticamente após receber os dados 
              brutos da Camada 3. Os providers não precisam informar a origem — o driver sabe de qual provider veio cada 
              lote e carimba automaticamente via <code>PROVIDER_DISPLAY_NAMES</code>.
            </p>
          </AccordionContent>
        </AccordionItem>

        {/* Disponibilidade de Campos */}
        <AccordionItem value="field-availability" className="rounded-lg border bg-card px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              <span className="font-semibold">Disponibilidade de Campos</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Nem todos os ERPs fornecem os mesmos dados. O campo <code>field_availability</code> em cada <code>ErpClient</code> indica 
              quais informações estão disponíveis no ERP de origem, permitindo ao frontend exibir "N/D" em vez de dados vazios.
            </p>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campo</TableHead>
                  <TableHead>IXC Soft</TableHead>
                  <TableHead>SGP</TableHead>
                  <TableHead>MK-Solutions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell><code className="text-xs">signal_db</code></TableCell>
                  <TableCell><Badge className="bg-green-500/10 text-green-600">✓</Badge></TableCell>
                  <TableCell><Badge className="bg-muted text-muted-foreground">✗</Badge></TableCell>
                  <TableCell><Badge className="bg-muted text-muted-foreground">✗</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="text-xs">login</code></TableCell>
                  <TableCell><Badge className="bg-green-500/10 text-green-600">✓</Badge></TableCell>
                  <TableCell><Badge className="bg-green-500/10 text-green-600">✓</Badge></TableCell>
                  <TableCell><Badge className="bg-green-500/10 text-green-600">✓</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="text-xs">plano</code></TableCell>
                  <TableCell><Badge className="bg-green-500/10 text-green-600">✓</Badge></TableCell>
                  <TableCell><Badge className="bg-green-500/10 text-green-600">✓</Badge></TableCell>
                  <TableCell><Badge className="bg-green-500/10 text-green-600">✓</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="text-xs">contrato</code></TableCell>
                  <TableCell><Badge className="bg-green-500/10 text-green-600">✓</Badge></TableCell>
                  <TableCell><Badge className="bg-muted text-muted-foreground">✗</Badge></TableCell>
                  <TableCell><Badge className="bg-muted text-muted-foreground">✗</Badge></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>

        {/* Normalização de Status */}
        <AccordionItem value="normalizacao" className="rounded-lg border bg-card px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-primary" />
              <span className="font-semibold">Normalização de status_internet</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              O campo <code>status_internet</code> vem do <code>cliente_contrato.status_internet</code> bruto do IXC. 
              A <strong>Camada 2 (Driver)</strong> normaliza esse campo para o tipo <code>InternetStatus</code>:{" "}
              <code>"ativo" | "bloqueado" | "financeiro_em_atraso" | "outros"</code>.
            </p>

            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 mb-4">
              <h4 className="mb-2 font-medium text-blue-600">Importante</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• O filtro de <strong>contratos ativos</strong> (<code>status='A'</code>) ocorre na <strong>Camada 3</strong> — apenas contratos com status ativo são retornados</li>
                <li>• <code>status_internet</code> indica o <strong>estado da conexão</strong> dentro de um contrato ativo (bloqueio, redução, etc.)</li>
                <li>• SGP e MK retornam <code>"ativo"</code> como padrão (não possuem contratos granulares)</li>
              </ul>
            </div>

            <h4 className="font-medium text-foreground">Mapeamento IXC (IXC_INTERNET_STATUS_MAP)</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Valor Bruto (IXC)</TableHead>
                  <TableHead>→ InternetStatus</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell><code className="text-xs">normal</code></TableCell>
                  <TableCell><Badge className="bg-green-500/10 text-green-600">ativo</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="text-xs">bloqueado</code></TableCell>
                  <TableCell><Badge className="bg-red-500/10 text-red-600">bloqueado</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="text-xs">bloqueio_manual</code></TableCell>
                  <TableCell><Badge className="bg-red-500/10 text-red-600">bloqueado</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="text-xs">bloqueio_automatico</code></TableCell>
                  <TableCell><Badge className="bg-red-500/10 text-red-600">bloqueado</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="text-xs">reduzido</code></TableCell>
                  <TableCell><Badge className="bg-yellow-500/10 text-yellow-600">financeiro_em_atraso</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="text-xs">pendente_reativa</code></TableCell>
                  <TableCell><Badge className="bg-red-500/10 text-red-600">bloqueado</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="text-xs">desativado</code></TableCell>
                  <TableCell><Badge className="bg-red-500/10 text-red-600">bloqueado</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="text-xs">(qualquer outro valor)</code></TableCell>
                  <TableCell><Badge className="bg-muted text-muted-foreground">outros</Badge></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>

        {/* Estrutura de Dados Real */}
        <AccordionItem value="dados" className="rounded-lg border bg-card px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <span className="font-semibold">Estrutura de Dados (erp_configs)</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Configurações de ERP são armazenadas na tabela <code>erp_configs</code>, isoladas por <code>isp_id</code>. 
              Credenciais são criptografadas com AES-256-GCM usando a secret <code>ENCRYPTION_KEY</code> (32 bytes, base64).
            </p>
            <div className="rounded-lg bg-muted/50 p-4">
              <pre className="overflow-x-auto text-xs">
{`-- Tabela REAL implementada
CREATE TABLE erp_configs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  isp_id         UUID NOT NULL REFERENCES isps(id),
  provider       TEXT NOT NULL,         -- "ixc" | "sgp" | "mk_solutions" | "hubsoft"
  display_name   TEXT,                  -- Nome customizado pelo ISP
  api_url        TEXT,                  -- URL base da API do ERP
  username       TEXT,                  -- Login/app (texto claro)
  api_key_encrypted   TEXT,             -- Token/API Key criptografado (AES-256-GCM)
  password_encrypted  TEXT,             -- Senha criptografada (IXC)
  encryption_iv       TEXT,             -- IV da criptografia
  masked_key     TEXT,                  -- Chave mascarada para exibição
  is_active      BOOLEAN DEFAULT true,
  is_connected   BOOLEAN DEFAULT false,
  connected_at   TIMESTAMPTZ,
  sync_enabled   BOOLEAN DEFAULT false,
  sync_config    JSONB DEFAULT '{}',
  last_sync_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE(isp_id, provider)
);

-- RLS: isolamento por ISP (admin/owner)
ALTER TABLE erp_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ISP admins" ON erp_configs FOR ALL
  USING (is_isp_admin(auth.uid(), isp_id));`}
              </pre>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Configuração de Secrets */}
        <AccordionItem value="configuracao" className="rounded-lg border bg-card px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              <span className="font-semibold">Configuração de Secrets</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 mb-4">
              <h4 className="mb-2 font-medium text-blue-600">Modelo de Credenciais</h4>
              <p className="text-sm text-muted-foreground">
                As credenciais de cada ERP são armazenadas <strong>na própria tabela <code>erp_configs</code></strong>, 
                criptografadas com AES-256-GCM. Não existem secrets individuais por ERP no Supabase — apenas a chave 
                mestra <code>ENCRYPTION_KEY</code> é armazenada como secret.
              </p>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Secret</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell><code className="text-xs bg-muted px-1 rounded">ENCRYPTION_KEY</code></TableCell>
                  <TableCell>Supabase Secret</TableCell>
                  <TableCell>Chave mestra AES-256-GCM (32 bytes, base64). Gerar com: <code className="text-xs">openssl rand -base64 32</code></TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="mt-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-600">Atenção</h4>
                  <p className="text-sm text-muted-foreground">
                    Se a <code>ENCRYPTION_KEY</code> for alterada, todas as credenciais criptografadas anteriormente 
                    tornam-se inacessíveis. Os ISPs precisarão reconfigurar suas integrações ERP.
                  </p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Edge Functions Reais */}
        <AccordionItem value="edge-functions" className="rounded-lg border bg-card px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-primary" />
              <span className="font-semibold">Edge Functions</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Edge Function</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Usa Driver</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell><code className="text-xs bg-muted px-1 rounded">fetch-erp-clients</code></TableCell>
                  <TableCell>GET</TableCell>
                  <TableCell>Lista todos os clientes de todos os ERPs ativos do ISP</TableCell>
                  <TableCell><code className="text-xs">fetchAllClients()</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="text-xs bg-muted px-1 rounded">test-erp</code></TableCell>
                  <TableCell>POST</TableCell>
                  <TableCell>Testa conexão com um ERP (credenciais fornecidas ou salvas)</TableCell>
                  <TableCell><code className="text-xs">testConnection()</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="text-xs bg-muted px-1 rounded">save-erp-config</code></TableCell>
                  <TableCell>POST</TableCell>
                  <TableCell>Testa, criptografa e salva configuração ERP</TableCell>
                  <TableCell><code className="text-xs">testConnection()</code></TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="mt-4 rounded-lg border border-green-500/20 bg-green-500/5 p-4">
              <h4 className="mb-2 font-medium text-green-600">Tool Handlers (IA)</h4>
              <p className="text-sm text-muted-foreground">
                Os agentes de IA utilizam <code>_shared/tool-handlers.ts</code> que delega para o driver. 
                Cada tool é um <strong>passo atômico</strong> no fluxo conversacional do agente:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• <code>erp_invoice_search</code> → <code>fetchInvoices()</code> — faturas reais via IXC <code>/fn_areceber</code> (SGP/MK retornam <code>[]</code>)</li>
                
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">
                <strong>Nota:</strong> <code>searchClients()</code> é usada internamente pela edge function <code>fetch-erp-clients</code> (página Assinantes), não é uma tool de IA.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Casos de Uso */}
        <AccordionItem value="casos-uso" className="rounded-lg border bg-card px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-semibold">Casos de Uso Implementados</span>
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
                      <h4 className="font-medium">Listagem de Clientes</h4>
                      <p className="text-sm text-muted-foreground">
                        Busca em tempo real de clientes de todos os ERPs ativos, com status e sinal normalizados
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
                      <h4 className="font-medium">Busca por IA</h4>
                      <p className="text-sm text-muted-foreground">
                        Agentes de IA buscam clientes e diagnosticam sinal via tool handlers integrados ao driver
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-muted">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-orange-500/10">
                      <Settings className="h-4 w-4 text-orange-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Multi-ERP por ISP</h4>
                      <p className="text-sm text-muted-foreground">
                        Um ISP pode ter múltiplos ERPs ativos simultaneamente, com dados agregados automaticamente
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                  <h4 className="mb-2 font-medium text-green-600">Criptografia AES-256-GCM</h4>
                  <p className="text-sm text-muted-foreground">
                    Credenciais criptografadas na tabela <code>erp_configs</code> usando <code>ENCRYPTION_KEY</code> (32 bytes). 
                    Decrypt ocorre apenas server-side nas Edge Functions.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-500/20 bg-green-500/5">
                <CardContent className="pt-4">
                  <h4 className="mb-2 font-medium text-green-600">Isolamento por ISP</h4>
                  <p className="text-sm text-muted-foreground">
                    RLS na tabela <code>erp_configs</code> via <code>is_isp_admin(auth.uid(), isp_id)</code>. 
                    Edge Functions validam membership via <code>isp_users</code>.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-500/20 bg-green-500/5">
                <CardContent className="pt-4">
                  <h4 className="mb-2 font-medium text-green-600">Proxy Server-Side</h4>
                  <p className="text-sm text-muted-foreground">
                    Todas as chamadas aos ERPs são feitas via Edge Functions (server-side), nunca diretamente do browser. 
                    Tokens e senhas nunca aparecem nos logs de rede do usuário.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-500/20 bg-green-500/5">
                <CardContent className="pt-4">
                  <h4 className="mb-2 font-medium text-green-600">Logs de Auditoria</h4>
                  <p className="text-sm text-muted-foreground">
                    Configurações de ERP geram registros em <code>audit_logs</code> com campos sensíveis removidos 
                    automaticamente pelo trigger <code>log_audit_event()</code>.
                  </p>
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Como Adicionar Novo ERP */}
        <AccordionItem value="novo-erp" className="rounded-lg border bg-card px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="font-semibold">Como Adicionar um Novo ERP</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <pre className="overflow-x-auto text-xs">
{`// 1. Criar erp-providers/hubsoft.ts implementando ErpProviderDriver
//    Implementar funções granulares por endpoint:
export const hubsoftProvider: ErpProviderDriver = {
  supportedFields() { return ["login", "plano"]; },
  async testConnection(creds) { /* ... */ },

  // Funções granulares (opcionais por provider):
  async fetchClientes(creds, filtro?) { /* GET /clientes */ },
  async fetchContratos(creds, filtro?) { /* GET /contratos?status=A */ },
  async fetchFaturas(creds, filtro) { /* GET /faturas?status=aberto */ },
  // fetchRadusuarios, fetchFibra, fetchRawSignal — opcionais
};

// 2. Registrar no erp-providers/index.ts
import { hubsoftProvider } from "./hubsoft.ts";
const providers = {
  // ...existentes...
  hubsoft: hubsoftProvider,
};

// 3. Adicionar mapeamento de status_internet no erp-driver.ts
//    (a normalização ocorre na Camada 2, com mapa por provider)
const HUBSOFT_INTERNET_STATUS_MAP: Record<string, InternetStatus> = {
  "normal": "ativo",
  "bloqueado": "bloqueado",
  // ...demais valores do Hubsoft
};

// 4. Se o provider usa composição granular (como IXC),
//    adicionar função composeHubsoftClients() no driver.
//    Se usa composição simples (como SGP/MK),
//    composeSimpleClients() já funciona automaticamente.

// 5. Já existe em PROVIDER_DISPLAY_NAMES:
// hubsoft: "Hubsoft"

// PRONTO! Zero alterações nas edge functions ou frontend.`}
              </pre>
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
                  <TableCell>Token/senha expirado ou inválido</TableCell>
                  <TableCell>Reconfigurar credenciais via painel ERP</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">ENCRYPTION_KEY inválida</TableCell>
                  <TableCell>Chave com tamanho ≠ 32 bytes</TableCell>
                  <TableCell>Gerar nova com <code>openssl rand -base64 32</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Provider desconhecido</TableCell>
                  <TableCell>Provider não registrado no registry</TableCell>
                  <TableCell>Criar provider e registrar em <code>erp-providers/index.ts</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">signal_db null</TableCell>
                  <TableCell>ERP não suporta leitura de sinal</TableCell>
                  <TableCell>Verificar <code>field_availability.signal_db</code> — exibir "N/D"</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Status "outros"</TableCell>
                  <TableCell>Valor do campo <code className="text-xs">status_internet</code> não mapeado no <code className="text-xs">IXC_INTERNET_STATUS_MAP</code></TableCell>
                  <TableCell>Adicionar o valor bruto ao mapa do provider correspondente em <code className="text-xs">erp-driver.ts</code></TableCell>
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
                  <TableHead>Custo da API</TableHead>
                  <TableHead>Observações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">IXC Soft</TableCell>
                  <TableCell><Badge className="bg-green-500/10 text-green-600">Incluído no plano</Badge></TableCell>
                  <TableCell>API inclusa, autenticação Basic Auth</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">SGP</TableCell>
                  <TableCell><Badge className="bg-yellow-500/10 text-yellow-600">Módulo adicional</Badge></TableCell>
                  <TableCell>Módulo "API" precisa ser contratado</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">MK-Solutions</TableCell>
                  <TableCell><Badge className="bg-green-500/10 text-green-600">Incluído no plano</Badge></TableCell>
                  <TableCell>Webservice incluso, requer ativação</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Hubsoft</TableCell>
                  <TableCell><Badge className="bg-green-500/10 text-green-600">Incluído no plano</Badge></TableCell>
                  <TableCell>API REST disponível em planos Business+</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default ERPIntegration;

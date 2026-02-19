import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Database, 
  Link, 
  Shield, 
  Monitor, 
  Users, 
  Globe, 
  Rocket,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileCode,
  Key,
  Layers,
  Server,
  ExternalLink
} from "lucide-react";

const ImplementacaoTab = () => {
  const backendConfig = {
    projectUrl: "Lovable Cloud (gerenciado automaticamente)",
    projectId: "Lovable Cloud",
    clientFile: "src/integrations/supabase/client.ts",
    typesFile: "src/integrations/supabase/types.ts",
    deployMode: "Migrations via Lovable Cloud (automático)",
  };

  const consolidacao = [
    { aspecto: "Backend", decisao: "Lovable Cloud (Supabase gerenciado)" },
    { aspecto: "Rodadas por Fase", decisao: "Máximo 15" },
    { aspecto: "Seeds", decisao: "Mínimos (usuário master + dados essenciais)" },
    { aspecto: "Integrações", decisao: "Core primeiro (Asaas → OpenAI → WhatsApp)" },
    { aspecto: "Ambiente Dev", decisao: "Lovable Cloud (automático)" },
    { aspecto: "Ordem Plataformas", decisao: "Admin primeiro → Cliente → Landing" },
    { aspecto: "Complexidade IA", decisao: "Sistema multi-agente (Atendente, Cobrador, Vendedor, Analista, Suporte)" },
    { aspecto: "Teste Pagamentos", decisao: "Sandbox Asaas" },
  ];

  const fases = [
    { id: "F1", nome: "Database e Schema", dependencia: "—", rodadas: "12-15", estimativa: "8-12h", icon: Database, status: "done" as const },
    { id: "F2", nome: "Integrações Core", dependencia: "F1", rodadas: "10-12", estimativa: "6-10h", icon: Link, status: "done" as const },
    { id: "F3", nome: "Autenticação e Segurança", dependencia: "F1, F2", rodadas: "8-10", estimativa: "4-6h", icon: Shield, status: "done" as const },
    { id: "F4", nome: "Plataforma Admin", dependencia: "F1-F3", rodadas: "12-15", estimativa: "12-16h", icon: Monitor, status: "done" as const },
    { id: "F5", nome: "Plataforma Cliente ISP", dependencia: "F1-F4", rodadas: "12-15", estimativa: "10-14h", icon: Users, status: "done" as const },
    { id: "F6", nome: "Landing Page", dependencia: "F1-F5", rodadas: "6-8", estimativa: "4-6h", icon: Globe, status: "done" as const },
    { id: "F7", nome: "Deploy e Ajustes", dependencia: "F1-F6", rodadas: "4-6", estimativa: "2-4h", icon: Rocket, status: "in_progress" as const },
  ];

  const secrets = [
    { nome: "OPENAI_API_KEY", fase: "F2", descricao: "Criptografada em platform_config, configurada via painel Admin → Integrações" },
    { nome: "ENCRYPTION_KEY", fase: "F1", descricao: "Chave para criptografia de dados sensíveis do ERP" },
    { nome: "WHATSAPP_APP_SECRET", fase: "F2", descricao: "Segredo para validação de webhooks do Meta" },
    { nome: "ASAAS_API_KEY", fase: "F2", descricao: "Chave da API Asaas (a configurar)" },
    { nome: "ASAAS_WEBHOOK_TOKEN", fase: "F2", descricao: "Token para validar webhooks Asaas (a configurar)" },
    { nome: "RESEND_API_KEY", fase: "F2", descricao: "Chave da API Resend para emails (a configurar)" },
  ];

  const riscos = [
    { risco: "RLS recursiva", impacto: "Alto", mitigacao: "Usar security definer functions" },
    { risco: "Webhook Asaas falha", impacto: "Alto", mitigacao: "Log completo + retry manual" },
    { risco: "Rate limit OpenAI", impacto: "Médio", mitigacao: "Tratamento 429 + cache de respostas" },
    { risco: "Custo OpenAI", impacto: "Médio", mitigacao: "Usar gpt-4o-mini, limitar tokens" },
    { risco: "Perda de contexto", impacto: "Médio", mitigacao: "Nomes canônicos + IDs estáveis" },
  ];

  const edgeFunctions = [
    "ai-chat",
    "ai-usage",
    "asaas-customer",
    "asaas-subscription",
    "asaas-webhook",
    "audit-prompt",
    "check-integration",
    "fetch-erp-clients",
    "fetch-onu-signal",
    "invite-admin",
    "process-document",
    "save-erp-config",
    "save-integration",
    "save-whatsapp-config",
    "send-email",
    "send-whatsapp",
    "test-erp",
    "test-integration",
    "test-whatsapp-connection",
    "whatsapp-webhook",
  ];

  return (
    <div className="space-y-8">
      {/* Consolidação Final */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Consolidação Final — Discovery Aba 8</CardTitle>
              <CardDescription>Decisões aprovadas para implementação</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {consolidacao.map((item, index) => (
              <div key={index} className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs font-medium uppercase text-muted-foreground">{item.aspecto}</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{item.decisao}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuração Backend */}
      <Card className="border-primary/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Server className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Configuração Backend — Lovable Cloud</CardTitle>
              <CardDescription>Backend gerenciado automaticamente pelo Lovable Cloud</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Conexão</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                  <span className="text-sm text-muted-foreground">Plataforma</span>
                  <code className="text-xs font-mono text-primary">{backendConfig.projectId}</code>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                  <span className="text-sm text-muted-foreground">Gerenciamento</span>
                  <span className="text-xs font-mono text-primary">Automático (Lovable Cloud)</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Arquivos de Configuração</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                  <span className="text-sm text-muted-foreground">Cliente Supabase</span>
                  <code className="text-xs font-mono text-muted-foreground">{backendConfig.clientFile}</code>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                  <span className="text-sm text-muted-foreground">Types Database</span>
                  <code className="text-xs font-mono text-muted-foreground">{backendConfig.typesFile}</code>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-foreground">Processo de Migrations</h4>
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                <li>Migrations são executadas via <strong>Lovable Cloud</strong> (automático)</li>
                <li>Gerenciar dados via <strong>Cloud View → Database</strong></li>
                <li>Executar SQL customizado via <strong>Cloud View → Run SQL</strong></li>
                <li>Types são atualizados automaticamente em <code className="font-mono text-xs">{backendConfig.typesFile}</code></li>
              </ol>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              <strong>Lovable Cloud:</strong> Migrations e deploy de Edge Functions são gerenciados automaticamente.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Visão Geral das Fases */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Visão Geral das Fases</CardTitle>
              <CardDescription>Total Estimado: 46-68 horas | 64-81 rodadas</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Fase</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Dependência</TableHead>
                <TableHead>Rodadas</TableHead>
                <TableHead>Estimativa</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fases.map((fase) => {
                const Icon = fase.icon;
                return (
                  <TableRow key={fase.id}>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">{fase.id}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        {fase.nome}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{fase.dependencia}</TableCell>
                    <TableCell>{fase.rodadas}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {fase.estimativa}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={fase.status === "done" ? "default" : "secondary"}
                        className={fase.status === "done" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-500 hover:bg-amber-600 text-white"}
                      >
                        {fase.status === "done" ? "Concluída" : "Em progresso"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detalhamento por Fase */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Fase</CardTitle>
          <CardDescription>Passos, rodadas e checklists de validação</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {/* FASE 1 */}
            <AccordionItem value="f1">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Badge className="bg-primary">F1</Badge>
                  <Database className="h-4 w-4" />
                  <span>Database e Schema</span>
                  <Badge variant="outline" className="ml-2">12-15 rodadas</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                <div>
                  <h4 className="mb-3 font-semibold text-foreground">Objetivo</h4>
                  <p className="text-sm text-muted-foreground">
                    Criar toda a estrutura de banco de dados, RLS policies, triggers, functions e storage buckets.
                  </p>
                </div>

                <div>
                  <h4 className="mb-3 font-semibold text-foreground">Passos Numerados</h4>
                  <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                    <li>Conectar projeto Supabase externo</li>
                    <li>Criar enum types (app_role, status_cliente, status_fatura, etc.)</li>
                    <li>Criar tabelas core (profiles, tenants, user_roles)</li>
                    <li>Criar tabelas de negócio (cliente_isp, plano, assinatura, fatura)</li>
                    <li>Criar tabelas de IA (agente_ia, uso_ia, limite_ia)</li>
                    <li>Criar tabelas de suporte (log_atividade, webhook_log, comunicado)</li>
                    <li>Criar helper functions (has_role, get_tenant_id, is_admin)</li>
                    <li>Criar RLS policies para todas as tabelas</li>
                    <li>Criar triggers (updated_at, log automático)</li>
                    <li>Configurar storage buckets (logos, comprovantes, notas_fiscais)</li>
                    <li>Inserir seeds mínimos (usuário master, planos padrão, agentes IA)</li>
                    <li>Testar RLS com diferentes roles</li>
                  </ol>
                </div>

                <div>
                  <h4 className="mb-3 font-semibold text-foreground">Plano por Rodada</h4>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      { r: 1, desc: "Setup inicial + enums + profiles" },
                      { r: 2, desc: "user_roles + has_role()" },
                      { r: 3, desc: "Tabela cliente_isp (tenants)" },
                      { r: 4, desc: "plano + plano_limite + agente_ia" },
                      { r: 5, desc: "assinatura + historico_plano" },
                      { r: 6, desc: "fatura, pagamento, credito, estorno" },
                      { r: 7, desc: "uso_ia, limite_ia" },
                      { r: 8, desc: "log_atividade, webhook_log" },
                      { r: 9, desc: "get_tenant_id(), is_tenant_member()" },
                      { r: 10, desc: "RLS policies — tabelas core" },
                      { r: 11, desc: "RLS policies — tabelas negócio" },
                      { r: 12, desc: "Storage buckets + seeds" },
                    ].map((item) => (
                      <div key={item.r} className="rounded border border-border bg-muted/20 p-2 text-xs">
                        <span className="font-mono font-bold text-primary">R{item.r}:</span>{" "}
                        <span className="text-muted-foreground">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 font-semibold text-foreground">Checklist de Validação</h4>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Banco</p>
                      {["Tabelas com constraints", "Foreign keys validadas", "Índices criados", "Enums para status"].map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <Checkbox id={item} />
                          <label htmlFor={item} className="text-xs text-muted-foreground">{item}</label>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">RLS</p>
                      {["Testar não autenticado", "Testar autenticado", "Testar super_admin", "Testar INSERT tenant"].map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <Checkbox id={item} />
                          <label htmlFor={item} className="text-xs text-muted-foreground">{item}</label>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Seeds</p>
                      {["Usuário master", "3 planos inseridos", "5 agentes IA inseridos"].map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <Checkbox id={item} />
                          <label htmlFor={item} className="text-xs text-muted-foreground">{item}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* FASE 2 */}
            <AccordionItem value="f2">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Badge className="bg-primary">F2</Badge>
                  <Link className="h-4 w-4" />
                  <span>Integrações Core</span>
                  <Badge variant="outline" className="ml-2">10-12 rodadas</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                <div>
                  <h4 className="mb-3 font-semibold text-foreground">Objetivo</h4>
                  <p className="text-sm text-muted-foreground">
                    Implementar edge functions para Asaas, OpenAI e estrutura WhatsApp.
                  </p>
                </div>

                <div>
                  <h4 className="mb-3 font-semibold text-foreground">Passos Numerados</h4>
                  <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                    <li>Configurar secrets (ASAAS_API_KEY, ASAAS_WEBHOOK_TOKEN)</li>
                    <li>Criar edge function asaas-create-customer</li>
                    <li>Criar edge function asaas-create-subscription</li>
                    <li>Criar edge function asaas-webhook (recebe eventos)</li>
                    <li>Configurar OPENAI_API_KEY via painel Admin → Integrações</li>
                    <li>Criar edge function ai-chat usando OpenAI API</li>
                    <li>Criar edge function ai-usage (registro de consumo)</li>
                    <li>Criar estrutura WhatsApp (webhook + validação)</li>
                    <li>Testar integração Asaas sandbox</li>
                    <li>Testar OpenAI API com prompts básicos</li>
                  </ol>
                </div>

                <div>
                  <h4 className="mb-3 font-semibold text-foreground">Plano por Rodada</h4>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      { r: 1, desc: "Setup secrets Asaas" },
                      { r: 2, desc: "asaas-create-customer" },
                      { r: 3, desc: "asaas-create-subscription" },
                      { r: 4, desc: "asaas-webhook" },
                      { r: 5, desc: "Lógica webhook → banco" },
                      { r: 6, desc: "OpenAI API + ai-chat" },
                      { r: 7, desc: "ai-usage" },
                      { r: 8, desc: "whatsapp-webhook + validação" },
                      { r: 9, desc: "Testar Asaas sandbox" },
                      { r: 10, desc: "Testar OpenAI API" },
                    ].map((item) => (
                      <div key={item.r} className="rounded border border-border bg-muted/20 p-2 text-xs">
                        <span className="font-mono font-bold text-primary">R{item.r}:</span>{" "}
                        <span className="text-muted-foreground">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 font-semibold text-foreground">Checklist de Validação</h4>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Asaas</p>
                      {["Criar cliente retorna ID", "Criar assinatura OK", "Webhook logado", "Fatura atualizada"].map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <Checkbox id={`f2-${item}`} />
                          <label htmlFor={`f2-${item}`} className="text-xs text-muted-foreground">{item}</label>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">OpenAI</p>
                      {["Streaming funciona", "Tokens registrados", "429 tratado", "401 tratado"].map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <Checkbox id={`f2-${item}`} />
                          <label htmlFor={`f2-${item}`} className="text-xs text-muted-foreground">{item}</label>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">WhatsApp</p>
                      {["Estrutura criada", "Endpoint 200"].map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <Checkbox id={`f2-${item}`} />
                          <label htmlFor={`f2-${item}`} className="text-xs text-muted-foreground">{item}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* FASE 3 */}
            <AccordionItem value="f3">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Badge className="bg-primary">F3</Badge>
                  <Shield className="h-4 w-4" />
                  <span>Autenticação e Segurança</span>
                  <Badge variant="outline" className="ml-2">8-10 rodadas</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                <div>
                  <h4 className="mb-3 font-semibold text-foreground">Objetivo</h4>
                  <p className="text-sm text-muted-foreground">
                    Implementar login/logout, recuperação de senha, middleware de auth e testar RLS completas.
                  </p>
                </div>

                <div>
                  <h4 className="mb-3 font-semibold text-foreground">Passos Numerados</h4>
                  <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                    <li>Criar página /auth (login + signup)</li>
                    <li>Implementar AuthContext com supabase.auth</li>
                    <li>Criar ProtectedRoute component</li>
                    <li>Implementar recuperação de senha</li>
                    <li>Criar middleware para verificar roles</li>
                    <li>Testar fluxo completo de login</li>
                    <li>Testar RLS com usuário autenticado</li>
                    <li>Configurar redirect URLs no Supabase</li>
                  </ol>
                </div>

                <div>
                  <h4 className="mb-3 font-semibold text-foreground">Checklist de Validação</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Auth</p>
                      {["Login email/senha", "Signup cria profile", "Logout limpa sessão", "Redirect não auth", "Redirect já auth"].map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <Checkbox id={`f3-${item}`} />
                          <label htmlFor={`f3-${item}`} className="text-xs text-muted-foreground">{item}</label>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Roles</p>
                      {["Super Admin vê tudo", "Usuário vê seus dados", "Permissões por rota"].map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <Checkbox id={`f3-${item}`} />
                          <label htmlFor={`f3-${item}`} className="text-xs text-muted-foreground">{item}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* FASE 4 */}
            <AccordionItem value="f4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Badge className="bg-primary">F4</Badge>
                  <Monitor className="h-4 w-4" />
                  <span>Plataforma Admin</span>
                  <Badge variant="outline" className="ml-2">12-15 rodadas</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                <div>
                  <h4 className="mb-3 font-semibold text-foreground">Objetivo</h4>
                  <p className="text-sm text-muted-foreground">
                    Implementar o painel administrativo com dashboard, CRUD de clientes, planos, financeiro, equipe e configurações.
                  </p>
                </div>

                <div>
                  <h4 className="mb-3 font-semibold text-foreground">Módulos</h4>
                  <div className="flex flex-wrap gap-2">
                    {["Dashboard", "Clientes ISP", "Planos", "Financeiro", "Equipe", "Configurações", "Suporte", "Relatórios"].map((mod) => (
                      <Badge key={mod} variant="secondary">{mod}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 font-semibold text-foreground">Checklist de Validação</h4>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Dashboard</p>
                      {["KPIs corretos", "Gráficos renderizam", "Alertas exibidos", "Drill-down funciona"].map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <Checkbox id={`f4-${item}`} />
                          <label htmlFor={`f4-${item}`} className="text-xs text-muted-foreground">{item}</label>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">CRUDs</p>
                      {["CRUD funcionando", "Validações form", "Estados loading/empty"].map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <Checkbox id={`f4-${item}`} />
                          <label htmlFor={`f4-${item}`} className="text-xs text-muted-foreground">{item}</label>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Permissões</p>
                      {["Ações por role", "Log registrado"].map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <Checkbox id={`f4-${item}`} />
                          <label htmlFor={`f4-${item}`} className="text-xs text-muted-foreground">{item}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* FASE 5 */}
            <AccordionItem value="f5">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Badge className="bg-primary">F5</Badge>
                  <Users className="h-4 w-4" />
                  <span>Plataforma Cliente ISP</span>
                  <Badge variant="outline" className="ml-2">12-15 rodadas</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                <div>
                  <h4 className="mb-3 font-semibold text-foreground">Objetivo</h4>
                  <p className="text-sm text-muted-foreground">
                    Implementar o painel do cliente ISP com dashboard, assinantes, agentes IA, faturas e configurações.
                  </p>
                </div>

                <div>
                  <h4 className="mb-3 font-semibold text-foreground">Módulos</h4>
                  <div className="flex flex-wrap gap-2">
                    {["Dashboard", "Assinantes", "Agentes IA", "Base de Conhecimento", "Faturas", "Usuários", "Relatórios", "Configurações", "Comunicação", "WhatsApp", "Integrações ERP", "Atendimentos"].map((mod) => (
                      <Badge key={mod} variant="secondary">{mod}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 font-semibold text-foreground">Checklist de Validação</h4>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Dashboard</p>
                      {["Métricas corretas", "Alertas limite"].map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <Checkbox id={`f5-${item}`} />
                          <label htmlFor={`f5-${item}`} className="text-xs text-muted-foreground">{item}</label>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Agentes IA</p>
                      {["Chat streaming", "Consumo registrado", "Limite respeitado", "Upload documentos KB", "RAG híbrido operacional", "Status processamento OK"].map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <Checkbox id={`f5-${item}`} />
                          <label htmlFor={`f5-${item}`} className="text-xs text-muted-foreground">{item}</label>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Faturas</p>
                      {["Listagem correta", "Download PDF", "Métodos pagamento"].map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <Checkbox id={`f5-${item}`} />
                          <label htmlFor={`f5-${item}`} className="text-xs text-muted-foreground">{item}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* FASE 6 */}
            <AccordionItem value="f6">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Badge className="bg-primary">F6</Badge>
                  <Globe className="h-4 w-4" />
                  <span>Landing Page</span>
                  <Badge variant="outline" className="ml-2">6-8 rodadas</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                <div>
                  <h4 className="mb-3 font-semibold text-foreground">Objetivo</h4>
                  <p className="text-sm text-muted-foreground">
                    Criar landing page pública com apresentação, planos, FAQ e fluxo de trial/checkout.
                  </p>
                </div>

                <div>
                  <h4 className="mb-3 font-semibold text-foreground">Plano por Rodada</h4>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      { r: 1, desc: "Hero + Header" },
                      { r: 2, desc: "Features + Benefits" },
                      { r: 3, desc: "Pricing Cards" },
                      { r: 4, desc: "FAQ + Footer" },
                      { r: 5, desc: "Formulário Trial" },
                      { r: 6, desc: "Checkout Asaas" },
                      { r: 7, desc: "SEO + Meta tags" },
                      { r: 8, desc: "Testes e ajustes" },
                    ].map((item) => (
                      <div key={item.r} className="rounded border border-border bg-muted/20 p-2 text-xs">
                        <span className="font-mono font-bold text-primary">R{item.r}:</span>{" "}
                        <span className="text-muted-foreground">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* FASE 7 */}
            <AccordionItem value="f7">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Badge className="bg-primary">F7</Badge>
                  <Rocket className="h-4 w-4" />
                  <span>Deploy e Ajustes</span>
                  <Badge variant="outline" className="ml-2">4-6 rodadas</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                <div>
                  <h4 className="mb-3 font-semibold text-foreground">Objetivo</h4>
                  <p className="text-sm text-muted-foreground">
                    Configurar domínio, performance, observabilidade e documentação final.
                  </p>
                </div>

                <div>
                  <h4 className="mb-3 font-semibold text-foreground">Plano por Rodada</h4>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      { r: 1, desc: "Domínio customizado" },
                      { r: 2, desc: "Lazy loading + cache" },
                      { r: 3, desc: "Monitoramento" },
                      { r: 4, desc: "Documentação final" },
                      { r: 5, desc: "Testes finais" },
                      { r: 6, desc: "Go-live" },
                    ].map((item) => (
                      <div key={item.r} className="rounded border border-border bg-muted/20 p-2 text-xs">
                        <span className="font-mono font-bold text-primary">R{item.r}:</span>{" "}
                        <span className="text-muted-foreground">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Secrets Necessários */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <Key className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <CardTitle>Secrets Necessários (Supabase)</CardTitle>
              <CardDescription>Chaves de API e tokens para integrações</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Secret</TableHead>
                <TableHead>Fase</TableHead>
                <TableHead>Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {secrets.map((secret) => (
                <TableRow key={secret.nome}>
                  <TableCell className="font-mono text-sm font-medium">{secret.nome}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{secret.fase}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{secret.descricao}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edge Functions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileCode className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Edge Functions (Supabase)</CardTitle>
              <CardDescription>Funções serverless implementadas ({edgeFunctions.length} funções)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {edgeFunctions.map((fn) => (
              <Badge key={fn} variant="secondary" className="font-mono text-xs">
                {fn}
              </Badge>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3">
            <h4 className="text-sm font-medium text-foreground mb-2">Módulos Compartilhados (_shared/) — 9 módulos</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li><code className="rounded bg-muted px-1">_shared/tool-handlers.ts</code> — Registry de handlers para function calling (mapeia handler_type → função executável)</li>
              <li><code className="rounded bg-muted px-1">_shared/tool-catalog.ts</code> — Catálogo de tools para function calling (definições OpenAI)</li>
              <li><code className="rounded bg-muted px-1">_shared/erp-fetcher.ts</code> — Lógica centralizada de busca em ERPs com descriptografia de credenciais</li>
              <li><code className="rounded bg-muted px-1">_shared/erp-types.ts</code> — Tipos padrão de ERP (ErpClient, ErpProvider, ContractStatus)</li>
              <li><code className="rounded bg-muted px-1">_shared/erp-driver.ts</code> — Interface base do driver de ERP</li>
              <li><code className="rounded bg-muted px-1">_shared/erp-providers/index.ts</code> — Registry de providers ERP (IXC, SGP, MK)</li>
              <li><code className="rounded bg-muted px-1">_shared/erp-providers/ixc.ts</code> — Conector IXC Soft</li>
              <li><code className="rounded bg-muted px-1">_shared/erp-providers/sgp.ts</code> — Conector SGP</li>
              <li><code className="rounded bg-muted px-1">_shared/erp-providers/mk.ts</code> — Conector MK-Solutions</li>
              <li><code className="rounded bg-muted px-1">_shared/onu-signal-analyzer.ts</code> — Análise de qualidade de sinal ONU (rx/tx)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Riscos e Mitigações */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <CardTitle>Riscos e Mitigações</CardTitle>
              <CardDescription>Possíveis problemas e como evitá-los</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Risco</TableHead>
                <TableHead>Impacto</TableHead>
                <TableHead>Mitigação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {riscos.map((risco) => (
                <TableRow key={risco.risco}>
                  <TableCell className="font-medium">{risco.risco}</TableCell>
                  <TableCell>
                    <Badge variant={risco.impacto === "Alto" ? "destructive" : "secondary"}>
                      {risco.impacto}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{risco.mitigacao}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Critérios de Pronto */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle>Critérios de Pronto (DoD) por Fase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { fase: "F1", dod: "Tabelas criadas, RLS testada, seeds inseridos" },
              { fase: "F2", dod: "Edge functions respondendo, webhooks logados" },
              { fase: "F3", dod: "Login/logout funcional, roles verificados" },
              { fase: "F4", dod: "Módulos admin funcionais, CRUD operacional" },
              { fase: "F5", dod: "Painel cliente funcional, IA integrada" },
              { fase: "F6", dod: "Landing publicada, trial funcional" },
              { fase: "F7", dod: "Domínio configurado, app em produção" },
            ].map((item) => (
              <div key={item.fase} className="rounded-lg border border-primary/30 bg-background p-3">
                <Badge className="mb-2">{item.fase}</Badge>
                <p className="text-sm text-muted-foreground">{item.dod}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImplementacaoTab;

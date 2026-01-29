import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, Target, Zap, Shield, Users, CreditCard, Mail, Database, Lock, Bot } from "lucide-react";

const ResumoProjetoTab = () => {
  const problemasResolvidos = [
    {
      titulo: "Comunicação com clientes",
      descricao: "Atendimento 24h por IA via WhatsApp para novos clientes e assinantes. Suporte técnico para LAN, comunicação proativa de falhas WAN, abertura de OS, ofertas personalizadas e pós-marketing."
    },
    {
      titulo: "Automação de tarefas repetitivas",
      descricao: "Lembrete de vencimento, desbloqueio de confiança, 2ª via de boleto/PIX, cobrança de inadimplentes."
    },
    {
      titulo: "Monitoramento proativo",
      descricao: "Envio de mensagens à equipe técnica e prestadores a partir do monitoramento de ativos de rede, concentradores e distribuidores ópticos."
    }
  ];

  const diferenciais = [
    "Integrações via APIs avançadas com ERPs",
    "Agentes de IA especializados para atendimento institucional e comercial",
    "Integração com sistemas de monitoramento para análise de eventos operacionais",
    "Plataforma moderna orientada à automação e eficiência operacional"
  ];

  const plataformas = [
    { nome: "Painel Admin", formato: "Web + Mobile", acesso: "/admin/login", rota: "/admin", permissoes: "super_admin" },
    { nome: "Painel Cliente", formato: "Web + Mobile", acesso: "/auth", rota: "/painel", permissoes: "isp_users (owner/admin/member)" },
    { nome: "Landing Page", formato: "Web + Mobile", acesso: "Público", rota: "/", permissoes: "—" }
  ];

  const tecnologias = [
    { nome: "OpenAI", icon: Bot, categoria: "IA" },
    { nome: "Asaas", icon: CreditCard, categoria: "Pagamentos" },
    { nome: "Resend", icon: Mail, categoria: "Email" },
    { nome: "Supabase Storage", icon: Database, categoria: "Arquivos" },
    { nome: "Supabase Auth", icon: Users, categoria: "Autenticação" },
    { nome: "Supabase (Externo)", icon: Database, categoria: "Backend" },
    { nome: "LGPD", icon: Shield, categoria: "Conformidade" }
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Sobre o AutoISP */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Sobre o AutoISP</CardTitle>
                <CardDescription>Plataforma de automação inteligente para provedores de internet</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="mb-3 font-semibold text-foreground">Problemas que Resolve</h4>
              <div className="grid gap-4 md:grid-cols-3">
                {problemasResolvidos.map((problema, index) => (
                  <div key={index} className="rounded-lg border border-border bg-muted/30 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">{problema.titulo}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{problema.descricao}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-3 font-semibold text-foreground">Diferencial Competitivo</h4>
              <div className="flex flex-wrap gap-2">
                {diferenciais.map((diferencial, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    <Zap className="mr-1 h-3 w-3" />
                    {diferencial}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tipo de Aplicação */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tipo de Aplicação</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Modelo</dt>
                <dd className="font-medium text-foreground">SaaS Multiusuário</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Idioma</dt>
                <dd className="font-medium text-foreground">pt-BR</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Público-alvo</dt>
                <dd className="font-medium text-foreground">ISPs Brasileiros</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Conformidade</dt>
                <dd>
                  <Badge variant="outline" className="border-primary text-primary">
                    <Lock className="mr-1 h-3 w-3" />
                    LGPD
                  </Badge>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Período de Trial */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Período de Trial</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Duração</dt>
                <dd className="font-medium text-foreground">Configurável por plano (padrão: 14 dias)</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Recursos</dt>
                <dd className="text-right text-sm text-foreground">Respostas IA, boletos, comunicações institucionais</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Pós-trial</dt>
                <dd className="font-medium text-foreground">Bloqueio total</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Cartão obrigatório</dt>
                <dd className="font-medium text-foreground">Não</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Plataformas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Plataformas</CardTitle>
          <CardDescription>Interfaces do sistema e seus níveis de acesso</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plataforma</TableHead>
                <TableHead>Formato</TableHead>
                <TableHead>Login</TableHead>
                <TableHead>Rota Principal</TableHead>
                <TableHead>Permissões</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plataformas.map((plataforma, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{plataforma.nome}</TableCell>
                  <TableCell>{plataforma.formato}</TableCell>
                  <TableCell>
                    <Badge variant={plataforma.acesso === "Público" ? "secondary" : "default"}>
                      <code className="text-xs">{plataforma.acesso}</code>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs text-muted-foreground">{plataforma.rota}</code>
                  </TableCell>
                  <TableCell>{plataforma.permissoes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Avatares */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Avatares (Perfis de Usuário)</CardTitle>
          <CardDescription>Sistema de permissões baseado em RBAC granular</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="rounded-lg border border-primary bg-primary/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">Super Admin</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Acesso total ao sistema</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold text-foreground">Roles Dinâmicos</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Configurados via RBAC granular</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tecnologias */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tecnologias Core</CardTitle>
          <CardDescription>Stack tecnológico principal do projeto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {tecnologias.map((tech, index) => {
              const Icon = tech.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">{tech.nome}</span>
                  <Badge variant="outline" className="text-xs">
                    {tech.categoria}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Modelo de Negócio */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Modelo de Negócio e Monetização</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-3 font-semibold text-foreground">Estrutura de Dados</h4>
              <div className="rounded-lg border border-border bg-muted/30 p-4 font-mono text-sm">
                Cliente → Assinatura → Plano → Recursos
              </div>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-foreground">Cobrança</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Ciclo</dt>
                  <dd className="text-foreground">Mensal</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Fidelidade</dt>
                  <dd className="text-foreground">12 meses</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Métodos</dt>
                  <dd className="text-foreground">PIX, Cartão, Boleto</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Cobranças avulsas</dt>
                  <dd className="text-foreground">Diferença em caso de upgrade</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-3 font-semibold text-foreground">Upgrade de Plano</h4>
              <p className="text-sm text-muted-foreground">
                Imediato após pagamento da diferença proporcional (pró-rata die).
              </p>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-foreground">Downgrade de Plano</h4>
              <p className="text-sm text-muted-foreground">
                Aplicado apenas no próximo ciclo de faturamento.
              </p>
            </div>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-foreground">Inadimplência</h4>
            <div className="flex gap-2">
              <Badge variant="destructive">Bloqueio imediato</Badge>
              <Badge variant="secondary">Notificações automáticas</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diagrama ERD */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Diagrama do Modelo de Negócio</CardTitle>
          <CardDescription>Estrutura de entidades e relacionamentos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border bg-muted/30 p-6">
            <pre className="text-sm text-foreground">
{`┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   CLIENTE   │──────▶│  ASSINATURA  │──────▶│    PLANO    │
└─────────────┘ 1   n └──────────────┘ n   1 └─────────────┘
       │                                            │
       │ 1                                          │ 1
       ▼ n                                          ▼ n
┌─────────────┐       ┌──────────────┐       ┌──────────────┐       ┌─────────────┐
│   USUARIO   │──────▶│     ROLE     │       │PLANO_RECURSO │◀──────│   RECURSO   │
└─────────────┘ n   1 └──────────────┘       │──────────────│ n   1 └─────────────┘
       │                                     │ valor        │
       │ n                                   │ habilitado   │
       ▼ 1                                   └──────────────┘
┌─────────────┐
│  PERMISSAO  │
└─────────────┘`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Executivo */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Resumo Executivo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            O <strong className="text-foreground">AutoISP</strong> é uma plataforma SaaS de automação inteligente para provedores de internet brasileiros, 
            combinando agentes de IA especializados, integração com ERPs e sistemas de monitoramento para oferecer atendimento 24h, 
            automação de cobranças e suporte técnico proativo. Com conformidade LGPD, sistema RBAC granular e modelo de cobrança 
            recorrente via Asaas, a solução atende ISPs de todos os portes com trial de 7 dias sem necessidade de cartão.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumoProjetoTab;

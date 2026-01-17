import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Users, 
  CreditCard, 
  Bot, 
  Settings, 
  FileText, 
  Bell, 
  Database,
  LayoutDashboard,
  Package,
  Receipt,
  UserCog,
  ScrollText,
  Trash2,
  Lock
} from "lucide-react";

const PainelAdminSection = () => {
  const modulos = [
    { nome: "Dashboard", icone: LayoutDashboard, descricao: "KPIs de receita, churn, MRR, conversões, assinantes ativos" },
    { nome: "Clientes (ISPs)", icone: Users, descricao: "Listagem, detalhes, assinatura, usuários, uso de IA" },
    { nome: "Planos", icone: Package, descricao: "Gestão de planos SaaS com recursos, preços e periodicidade" },
    { nome: "Assinaturas", icone: Receipt, descricao: "Controle de assinaturas, status, renovações, cancelamentos" },
    { nome: "Financeiro", icone: CreditCard, descricao: "Faturas, cobranças, integração Asaas, relatórios" },
    { nome: "Usuários Internos", icone: UserCog, descricao: "Gestão de administradores e roles dinâmicos" },
    { nome: "Agentes IA Template", icone: Bot, descricao: "Templates de agentes padrão para ISPs herdarem" },
    { nome: "Configurações", icone: Settings, descricao: "Parâmetros globais, integrações, chaves de API" },
    { nome: "Relatórios", icone: FileText, descricao: "Relatórios gerenciais exportáveis (CSV, PDF, JSON)" },
    { nome: "Logs de Auditoria", icone: ScrollText, descricao: "Rastreamento de ações com retenção de 6 meses" },
  ];

  const integracoes = [
    { nome: "Asaas", tipo: "Pagamentos", descricao: "Gateway de cobranças, faturas, webhooks de pagamento" },
    { nome: "OpenAI", tipo: "IA", descricao: "GPT-4 para agentes de atendimento inteligente" },
    { nome: "Resend", tipo: "Email", descricao: "Envio de emails transacionais e notificações" },
  ];

  const eventosAuditoria = [
    { categoria: "Autenticação", eventos: "login, logout, tentativas falhas, reset de senha" },
    { categoria: "Gestão de Clientes", eventos: "criação, edição, exclusão, alteração de status" },
    { categoria: "Financeiro", eventos: "geração de fatura, pagamento recebido, estorno" },
    { categoria: "Configurações", eventos: "alteração de parâmetros, integração modificada" },
    { categoria: "Usuários", eventos: "criação, edição, alteração de role, desativação" },
  ];

  const tiposExclusao = [
    { modulo: "Clientes", tipo: "Lógica", descricao: "deleted_at para preservar histórico" },
    { modulo: "Usuários", tipo: "Lógica", descricao: "Desativação com deleted_at" },
    { modulo: "Assinaturas", tipo: "Lógica", descricao: "Status cancelado, nunca removido" },
    { modulo: "Faturas", tipo: "Física", descricao: "Remoção após 5 anos (compliance)" },
    { modulo: "Logs", tipo: "Física", descricao: "Remoção após 6 meses (retenção)" },
    { modulo: "Planos", tipo: "Mista", descricao: "Lógica se tem assinaturas, física se não" },
  ];

  return (
    <div className="space-y-8">
      {/* Identificação */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Painel Admin (AutoISP)</CardTitle>
              <CardDescription>Plataforma interna de gestão do SaaS</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Formato</p>
              <p className="font-medium">Web Responsivo</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Rota de Login</p>
              <p className="font-medium"><code className="bg-muted px-2 py-0.5 rounded">/admin/login</code></p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Rota Principal</p>
              <p className="font-medium"><code className="bg-muted px-2 py-0.5 rounded">/admin</code></p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Permissão Requerida</p>
              <p className="font-medium"><code className="bg-primary/10 text-primary px-2 py-0.5 rounded">super_admin</code></p>
            </div>
            <div className="space-y-1 md:col-span-2">
              <p className="text-sm text-muted-foreground">Dinâmica</p>
              <p className="font-medium">Gestão completa do negócio SaaS: clientes ISP, planos, assinaturas, financeiro, usuários internos, configurações e relatórios</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sistema de Autenticação */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Sistema de Autenticação e Permissões</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3">Roles do Sistema</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Super Admin</TableCell>
                  <TableCell><Badge>Fixo</Badge></TableCell>
                  <TableCell>Acesso irrestrito a todas as funcionalidades</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Roles Dinâmicos</TableCell>
                  <TableCell><Badge variant="secondary">Configurável</Badge></TableCell>
                  <TableCell>Criados pelo Super Admin com permissões granulares por módulo</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Usuário Master</h4>
            <p className="text-sm text-muted-foreground">
              Criado via <code className="bg-muted px-1 rounded">seed</code> no deploy inicial. 
              Credenciais definidas em variáveis de ambiente para segurança.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Gestão de Permissões</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>RBAC (Role-Based Access Control) granular</li>
              <li>Permissões por módulo: visualizar, criar, editar, deletar</li>
              <li>Herança de permissões configurável</li>
              <li>Auditoria de alterações em roles</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Módulos */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Módulos do Sistema</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modulos.map((modulo) => (
              <div key={modulo.nome} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <modulo.icone className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">{modulo.nome}</p>
                  <p className="text-sm text-muted-foreground">{modulo.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integrações */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Integrações</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serviço</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Funcionalidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {integracoes.map((integracao) => (
                <TableRow key={integracao.nome}>
                  <TableCell className="font-medium">{integracao.nome}</TableCell>
                  <TableCell><Badge variant="outline">{integracao.tipo}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{integracao.descricao}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Notificações */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Sistema de Notificações</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-3">Canais de Notificação</h4>
            <div className="flex flex-wrap gap-2">
              <Badge>In-app (toast/bell)</Badge>
              <Badge>Email</Badge>
              <Badge>Push (futuro)</Badge>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Eventos Gatilho</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Novo cliente cadastrado</Badge>
              <Badge variant="outline">Pagamento recebido</Badge>
              <Badge variant="outline">Assinatura cancelada</Badge>
              <Badge variant="outline">Fatura vencida</Badge>
              <Badge variant="outline">Alerta de uso IA</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auditoria */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <ScrollText className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Logs de Auditoria</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoria</TableHead>
                <TableHead>Eventos Registrados</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eventosAuditoria.map((evento) => (
                <TableRow key={evento.categoria}>
                  <TableCell className="font-medium">{evento.categoria}</TableCell>
                  <TableCell className="text-muted-foreground">{evento.eventos}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Dados por Log</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <code className="bg-muted px-2 py-1 rounded">user_id</code>
              <code className="bg-muted px-2 py-1 rounded">timestamp</code>
              <code className="bg-muted px-2 py-1 rounded">action</code>
              <code className="bg-muted px-2 py-1 rounded">ip_address</code>
              <code className="bg-muted px-2 py-1 rounded">entity_type</code>
              <code className="bg-muted px-2 py-1 rounded">entity_id</code>
              <code className="bg-muted px-2 py-1 rounded">old_value</code>
              <code className="bg-muted px-2 py-1 rounded">new_value</code>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              <strong>Retenção:</strong> 6 meses (cleanup automático)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Multi-tenant */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Isolamento de Dados (Multi-tenant)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Estratégia: Tenant por Coluna</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Todas as tabelas possuem coluna <code className="bg-muted px-1 rounded">tenant_id</code></li>
                <li>RLS (Row Level Security) policies garantem isolamento</li>
                <li>Queries filtradas automaticamente por tenant</li>
                <li>Índices otimizados para performance multi-tenant</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Política de Exclusão */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Trash2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Política de Exclusão de Dados</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Módulo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tiposExclusao.map((item) => (
                <TableRow key={item.modulo}>
                  <TableCell className="font-medium">{item.modulo}</TableCell>
                  <TableCell>
                    <Badge variant={item.tipo === "Física" ? "destructive" : item.tipo === "Lógica" ? "secondary" : "outline"}>
                      {item.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.descricao}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PainelAdminSection;

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Bot, 
  Settings, 
  FileText, 
  Database,
  LayoutDashboard,
  MessageSquare,
  Activity,
  Wifi,
  UserCog,
  ScrollText,
  Lock,
  Mail,
  Send,
  Smartphone,
  Bell,
  HelpCircle,
  Link,
  Server,
  Plug,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  CircleDashed
} from "lucide-react";

const PainelClienteSection = () => {
  const modulos = [
    { nome: "Dashboard", icone: LayoutDashboard, descricao: "KPIs de atendimento, uso de IA, status monitoramento, feed de atividades" },
    { nome: "Atendimentos", icone: MessageSquare, descricao: "Histórico de conversas, transferência humana, OS vinculadas, CSAT" },
    { nome: "Assinantes", icone: Users, descricao: "Base de clientes sincronizada do ERP com status e histórico" },
    { nome: "Comunicação Ativa", icone: Send, descricao: "Disparos em massa, gatilhos automáticos, templates, métricas" },
    { nome: "Agentes de IA", icone: Bot, descricao: "Configuração de chatbots: prompts, regras, ferramentas" },
    { nome: "Monitoramento", icone: Activity, descricao: "Visualizar ativos, reiniciar remotamente, testes de rede, alertas" },
    { nome: "Usuários e Perfis", icone: UserCog, descricao: "Gestão de operadores e permissões customizáveis" },
    { nome: "Configurações", icone: Settings, descricao: "Personalização visual, informações da empresa" },
    { nome: "Integrações", icone: Link, descricao: "ERP, WhatsApp Business API, monitoramento, webhooks" },
    { nome: "Relatórios", icone: FileText, descricao: "Atendimentos, uso IA, monitoramento, comunicação" },
    { nome: "Logs de Auditoria", icone: ScrollText, descricao: "Rastreamento de ações por operador" },
    { nome: "Help Center", icone: HelpCircle, descricao: "Tutoriais, FAQ, contato com suporte AutoISP" },
  ];

  const erps = [
    { nome: "SGP", descricao: "Sistema de Gestão de Provedores" },
    { nome: "IXC Soft", descricao: "ERP popular para ISPs" },
    { nome: "MK Solutions", descricao: "Sistema de gestão e automação" },
    { nome: "Hubsoft", descricao: "Plataforma de gestão para provedores" },
  ];

  const dadosErp = [
    { categoria: "Cadastro", dados: "Nome, CPF/CNPJ, email, telefone, endereço" },
    { categoria: "Contratos", dados: "Plano contratado, status, data ativação" },
    { categoria: "Financeiro", dados: "Faturas, pagamentos, débitos pendentes" },
    { categoria: "Ordens de Serviço", dados: "OS abertas e finalizadas, técnico responsável" },
  ];

  const agentesIA = [
    { tipo: "Comercial", funcao: "Atendimento de novos interessados, vendas, captação" },
    { tipo: "Financeiro", funcao: "Dúvidas sobre faturas, 2ª via de boleto, negociação" },
    { tipo: "Suporte Técnico", funcao: "Problemas de conexão, troubleshooting, diagnóstico" },
    { tipo: "Institucional", funcao: "Informações da empresa, planos disponíveis, horários" },
  ];

  const canaisComunicacao = [
    { canal: "WhatsApp", icone: Smartphone, status: "Ativo" },
    { canal: "SMS", icone: MessageSquare, status: "Ativo" },
    { canal: "Email", icone: Mail, status: "Ativo" },
    { canal: "Push", icone: Bell, status: "Ativo" },
  ];

  const eventosAuditoria = [
    { categoria: "Autenticação", eventos: "login, logout, tentativas falhas" },
    { categoria: "Configurações", eventos: "alteração de agentes, templates, integrações" },
    { categoria: "Comunicação", eventos: "disparos realizados, templates criados" },
    { categoria: "Monitoramento", eventos: "reinício de equipamento, testes executados" },
    { categoria: "Integrações", eventos: "teste de conexão ERP executado, resultado do teste" },
  ];

  const estadosConexao = [
    { estado: "Conectado", badge: "default", icone: CheckCircle2, cor: "text-green-600", descricao: "API respondeu com sucesso (HTTP 200)" },
    { estado: "Falha", badge: "destructive", icone: XCircle, cor: "text-destructive", descricao: "Erro de conexão ou resposta inválida" },
    { estado: "Timeout", badge: "secondary", icone: AlertTriangle, cor: "text-yellow-600", descricao: "API não respondeu no tempo limite" },
    { estado: "Não Configurado", badge: "outline", icone: CircleDashed, cor: "text-muted-foreground", descricao: "Nenhum ERP configurado ainda" },
  ];

  const infoTesteConexao = [
    { campo: "ERP Configurado", descricao: "Nome do ERP conectado (ex: IXC Soft)" },
    { campo: "URL da API", descricao: "Endpoint configurado (parcialmente mascarado)" },
    { campo: "Status", descricao: "Conectado / Falha / Timeout / Não Configurado" },
    { campo: "Latência", descricao: "Tempo de resposta em milissegundos" },
    { campo: "Última Verificação", descricao: "Data e hora do último teste realizado" },
    { campo: "Detalhes do Erro", descricao: "Mensagem de erro (exibida apenas em caso de falha)" },
  ];

  return (
    <div className="space-y-8">
      {/* Identificação */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Painel Cliente (ISP)</CardTitle>
              <CardDescription>Plataforma de gestão para provedores de internet</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Formato</p>
              <p className="font-medium">Web + Mobile (Responsivo)</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Acesso</p>
              <p className="font-medium">Login obrigatório</p>
            </div>
            <div className="space-y-1 md:col-span-2">
              <p className="text-sm text-muted-foreground">Dinâmica</p>
              <p className="font-medium">Gestão operacional do ISP: agentes IA, atendimentos, comunicação ativa, monitoramento de ativos, gestão de perfis/roles, dashboards e relatórios</p>
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
                  <TableCell className="font-medium">Admin do ISP</TableCell>
                  <TableCell><Badge>Master</Badge></TableCell>
                  <TableCell>Usuário master com acesso total ao painel do ISP</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Perfis Híbridos</TableCell>
                  <TableCell><Badge variant="secondary">Customizável</Badge></TableCell>
                  <TableCell>Templates do plano customizáveis pelo Admin</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Usuário Master</h4>
            <p className="text-sm text-muted-foreground">
              Criado via <strong>cadastro na Landing Page</strong>. 
              Após signup, torna-se automaticamente Admin do ISP com acesso total.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Gestão de Permissões</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Perfis template disponibilizados pelo plano contratado</li>
              <li>Admin pode customizar conforme disponibilidade do plano</li>
              <li>RBAC granular por módulo e ações</li>
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

      {/* Integrações ERP */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Server className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Integrações com ERPs</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ERP</TableHead>
                <TableHead>Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {erps.map((erp) => (
                <TableRow key={erp.nome}>
                  <TableCell className="font-medium">{erp.nome}</TableCell>
                  <TableCell className="text-muted-foreground">{erp.descricao}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div>
            <h4 className="font-semibold mb-3">Dados Sincronizados do ERP</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Dados</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dadosErp.map((item) => (
                  <TableRow key={item.categoria}>
                    <TableCell className="font-medium">{item.categoria}</TableCell>
                    <TableCell className="text-muted-foreground">{item.dados}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Teste de Conexão ERP */}
          <div className="border-t pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Plug className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Teste de Conexão ERP</h4>
                <p className="text-sm text-muted-foreground">Verificação manual da conectividade com a API do ERP</p>
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Ação Manual</p>
              </div>
              <p className="text-sm text-muted-foreground">
                O operador pode clicar no botão "Testar Conexão" para verificar se a API do ERP está acessível 
                e respondendo corretamente. Não é um monitoramento contínuo — é um teste sob demanda.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-semibold mb-2">Informações Exibidas</h5>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campo</TableHead>
                      <TableHead>Descrição</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {infoTesteConexao.map((info) => (
                      <TableRow key={info.campo}>
                        <TableCell className="font-medium">{info.campo}</TableCell>
                        <TableCell className="text-muted-foreground">{info.descricao}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div>
                <h5 className="text-sm font-semibold mb-2">Estados Possíveis</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {estadosConexao.map((item) => (
                    <div key={item.estado} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <item.icone className={`h-5 w-5 mt-0.5 ${item.cor}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{item.estado}</p>
                          <Badge variant={item.badge as "default" | "secondary" | "destructive" | "outline"}>
                            {item.estado}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.descricao}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agentes de IA */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Agentes de IA</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Função</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agentesIA.map((agente) => (
                <TableRow key={agente.tipo}>
                  <TableCell className="font-medium">
                    <Badge variant="outline">{agente.tipo}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{agente.funcao}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-semibold mb-3">Configurações por Agente</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium">Prompts Customizados</p>
                <p className="text-xs text-muted-foreground">Instruções de sistema personalizáveis</p>
              </div>
              <div>
                <p className="text-sm font-medium">Regras de Atendimento</p>
                <p className="text-xs text-muted-foreground">Horários, escalation, prioridades</p>
              </div>
              <div>
                <p className="text-sm font-medium">Ferramentas/APIs</p>
                <p className="text-xs text-muted-foreground">Ações que o agente pode executar</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comunicação Ativa */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Send className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Comunicação Ativa</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3">Canais de Disparo</h4>
            <div className="flex flex-wrap gap-3">
              {canaisComunicacao.map((canal) => (
                <div key={canal.canal} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30">
                  <canal.icone className="h-4 w-4 text-primary" />
                  <span className="font-medium">{canal.canal}</span>
                  <Badge variant="secondary" className="text-xs">{canal.status}</Badge>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Funcionalidades</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="font-medium">Mensagens em Massa</p>
                <p className="text-xs text-muted-foreground">Disparos manuais ou agendados para segmentos</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="font-medium">Gatilhos Automáticos</p>
                <p className="text-xs text-muted-foreground">Baseados em eventos (vencimento, OS, etc)</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="font-medium">Templates de Mensagens</p>
                <p className="text-xs text-muted-foreground">Modelos pré-definidos e personalizáveis</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="font-medium">Histórico e Resultados</p>
                <p className="text-xs text-muted-foreground">Métricas de abertura, resposta, conversão</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monitoramento */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Monitoramento de Ativos</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/30 space-y-2">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-primary" />
                <p className="font-medium">Visualizar Ativos</p>
              </div>
              <p className="text-sm text-muted-foreground">OLTs, switches, roteadores, status em tempo real</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 space-y-2">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" />
                <p className="font-medium">Reiniciar Remotamente</p>
              </div>
              <p className="text-sm text-muted-foreground">Botão de reset para equipamentos do cliente</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <p className="font-medium">Testes de Rede</p>
              </div>
              <p className="text-sm text-muted-foreground">Ping, traceroute, diagnóstico automatizado</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 space-y-2">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <p className="font-medium">Alertas e Notificações</p>
              </div>
              <p className="text-sm text-muted-foreground">Mensagens automáticas em eventos críticos</p>
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
            </div>
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
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Estratégia: Tenant por Coluna</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Todas as tabelas possuem coluna <code className="bg-muted px-1 rounded">tenant_id</code></li>
              <li>RLS (Row Level Security) policies garantem isolamento entre ISPs</li>
              <li>Cada ISP só visualiza seus próprios dados</li>
              <li>Índices otimizados para queries por tenant</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PainelClienteSection;

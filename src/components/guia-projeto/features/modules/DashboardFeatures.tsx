import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RegraNegocio {
  codigo: string;
  descricao: string;
  tipo: string;
}

interface Permissao {
  role: string;
  acoes: string;
}

interface Entidade {
  tabela: string;
  campos: string;
  operacoes: string;
}

interface Feature {
  codigo: string;
  nome: string;
  modulo: string;
  plataforma: string;
  descricao: string;
  criticidade: "alta" | "media" | "baixa";
  regrasNegocio: RegraNegocio[];
  permissoes: Permissao[];
  entidades: Entidade[];
}

const dashboardFeatures: Feature[] = [
  {
    codigo: "F-ADMIN-001",
    nome: "Visualizar Cards de KPIs",
    modulo: "Dashboard",
    plataforma: "Painel Admin",
    descricao: "Exibe cards com os principais indicadores de desempenho do SaaS: MRR, Churn Rate, Total de Clientes ISP e Conversões de Trial. Cada card possui tooltip com detalhes e permite drill-down para listagem detalhada.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F001-01", descricao: "MRR é calculado somando todas as assinaturas ativas", tipo: "Cálculo" },
      { codigo: "RN-F001-02", descricao: "Churn Rate = (cancelamentos no período / base no início do período) × 100", tipo: "Cálculo" },
      { codigo: "RN-F001-03", descricao: "Total de Clientes conta apenas ISPs com assinatura ativa", tipo: "Cálculo" },
      { codigo: "RN-F001-04", descricao: "Conversões = (trials convertidos / total de trials expirados) × 100", tipo: "Cálculo" },
      { codigo: "RN-F001-05", descricao: "KPIs sensíveis (MRR, Custos) requerem permissão específica", tipo: "Permissão" },
      { codigo: "RN-F001-06", descricao: "Período padrão é Mês Corrente (MTD), configurável nas Configurações", tipo: "Comportamento" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Visualizar todos os KPIs" },
      { role: "Roles configurados", acoes: "Visualizar KPIs não-sensíveis" },
      { role: "Roles com permissão financeira", acoes: "Visualizar KPIs sensíveis (MRR, Custos)" },
    ],
    entidades: [
      { tabela: "assinatura", campos: "status, valor, created_at, canceled_at", operacoes: "SELECT" },
      { tabela: "cliente_isp", campos: "id, status, created_at", operacoes: "SELECT" },
      { tabela: "fatura", campos: "valor, status, paid_at", operacoes: "SELECT" },
      { tabela: "configuracao_sistema", campos: "periodo_dashboard_padrao", operacoes: "SELECT" },
    ],
  },
  {
    codigo: "F-ADMIN-002",
    nome: "Aplicar Filtros de Período",
    modulo: "Dashboard",
    plataforma: "Painel Admin",
    descricao: "Permite filtrar todos os dados do Dashboard por período: últimos 7 dias, 30 dias, 12 meses ou período customizado. O período padrão é configurável nas Configurações do sistema.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F002-01", descricao: "Data inicial não pode ser maior que data final", tipo: "Validação" },
      { codigo: "RN-F002-02", descricao: "Período máximo permitido: 365 dias", tipo: "Limite" },
      { codigo: "RN-F002-03", descricao: "Filtro aplica a todos os KPIs e gráficos simultaneamente", tipo: "Comportamento" },
      { codigo: "RN-F002-04", descricao: "Período padrão é persistido nas configurações do usuário", tipo: "Comportamento" },
    ],
    permissoes: [
      { role: "Todos os roles com acesso ao Dashboard", acoes: "Alterar filtro de período" },
    ],
    entidades: [
      { tabela: "configuracao_usuario", campos: "periodo_dashboard_padrao", operacoes: "SELECT, UPDATE" },
    ],
  },
  {
    codigo: "F-ADMIN-003",
    nome: "Drill-down MRR para Listagem",
    modulo: "Dashboard",
    plataforma: "Painel Admin",
    descricao: "Ao clicar no card de MRR, o usuário é direcionado para uma listagem detalhada que pode mostrar: assinaturas ativas, assinaturas por plano, faturas do período ou detalhe de um ISP específico.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-F003-01", descricao: "Manter contexto do filtro de período ao navegar", tipo: "Comportamento" },
      { codigo: "RN-F003-02", descricao: "Soma da listagem deve bater com valor do card", tipo: "Validação" },
      { codigo: "RN-F003-03", descricao: "Requer permissão de visualização financeira", tipo: "Permissão" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Acesso total ao drill-down" },
      { role: "Roles com permissão financeira", acoes: "Visualizar listagens de MRR" },
    ],
    entidades: [
      { tabela: "assinatura", campos: "id, cliente_id, plano_id, valor, status", operacoes: "SELECT" },
      { tabela: "cliente_isp", campos: "id, nome, email", operacoes: "SELECT" },
      { tabela: "plano", campos: "id, nome, valor", operacoes: "SELECT" },
      { tabela: "fatura", campos: "id, valor, status, vencimento", operacoes: "SELECT" },
    ],
  },
  {
    codigo: "F-ADMIN-004",
    nome: "Drill-down Churn para Análise",
    modulo: "Dashboard",
    plataforma: "Painel Admin",
    descricao: "Ao clicar no card de Churn, exibe: lista de ISPs cancelados, ISPs em risco de churn, motivos de cancelamento e histórico de churn ao longo do tempo.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-F004-01", descricao: "ISP em risco: baixa atividade nos últimos 30 dias OU inadimplência", tipo: "Definição" },
      { codigo: "RN-F004-02", descricao: "Motivos de cancelamento vêm do fluxo de cancelamento self-service", tipo: "Dependência" },
      { codigo: "RN-F004-03", descricao: "Histórico de churn mostra últimos 12 meses", tipo: "Limite" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Acesso total" },
      { role: "Roles com permissão de clientes", acoes: "Visualizar análise de churn" },
    ],
    entidades: [
      { tabela: "cliente_isp", campos: "id, status, ultimo_acesso, canceled_at", operacoes: "SELECT" },
      { tabela: "assinatura", campos: "status, canceled_at, motivo_cancelamento", operacoes: "SELECT" },
      { tabela: "fatura", campos: "status, vencimento", operacoes: "SELECT" },
    ],
  },
  {
    codigo: "F-ADMIN-005",
    nome: "Drill-down Conversões de Trial",
    modulo: "Dashboard",
    plataforma: "Painel Admin",
    descricao: "Ao clicar no card de Conversões de Trial, exibe: trials convertidos, trials não convertidos, trials prestes a expirar (últimos 2 dias) e lista de todos os trials ativos.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-F005-01", descricao: "Trial convertido: pagou primeira fatura dentro de 7 dias após expirar", tipo: "Definição" },
      { codigo: "RN-F005-02", descricao: "Trial prestes a expirar: 2 dias ou menos para término", tipo: "Definição" },
      { codigo: "RN-F005-03", descricao: "Trial ativo: status = 'trial' E data_expiracao > hoje", tipo: "Definição" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Acesso total" },
      { role: "Roles com permissão de clientes", acoes: "Visualizar análise de trials" },
    ],
    entidades: [
      { tabela: "cliente_isp", campos: "id, nome, status, trial_expira_em, created_at", operacoes: "SELECT" },
      { tabela: "assinatura", campos: "cliente_id, status, created_at", operacoes: "SELECT" },
      { tabela: "fatura", campos: "cliente_id, status, paid_at", operacoes: "SELECT" },
    ],
  },
  {
    codigo: "F-ADMIN-006",
    nome: "Visualizar Gráficos do Dashboard",
    modulo: "Dashboard",
    plataforma: "Painel Admin",
    descricao: "Exibe gráficos visuais: evolução do MRR (linha), funil de conversões (barras), top ISPs por receita (barras) e distribuição por plano (pizza). Gráficos possuem tooltip no hover.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-F006-01", descricao: "Gráfico de MRR mostra linha temporal por dia/mês conforme período", tipo: "Comportamento" },
      { codigo: "RN-F006-02", descricao: "Top ISPs mostra os 10 maiores por receita no período", tipo: "Limite" },
      { codigo: "RN-F006-03", descricao: "Distribuição por plano agrupa assinaturas ativas por tier", tipo: "Cálculo" },
      { codigo: "RN-F006-04", descricao: "Gráficos simplificados no mobile (ocultos ou reduzidos)", tipo: "UX" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Visualizar todos os gráficos" },
      { role: "Roles configurados", acoes: "Visualizar gráficos não-sensíveis" },
      { role: "Roles com permissão financeira", acoes: "Visualizar gráficos de receita" },
    ],
    entidades: [
      { tabela: "assinatura", campos: "valor, status, plano_id, created_at", operacoes: "SELECT (agregado)" },
      { tabela: "cliente_isp", campos: "id, nome", operacoes: "SELECT" },
      { tabela: "plano", campos: "id, nome", operacoes: "SELECT" },
    ],
  },
  {
    codigo: "F-ADMIN-007",
    nome: "Visualizar Alertas do Dashboard",
    modulo: "Dashboard",
    plataforma: "Painel Admin",
    descricao: "Exibe alertas importantes: ISPs em risco de churn, trials prestes a expirar e picos de uso de IA. Cada alerta possui link para acessar o detalhe do ISP/recurso relacionado.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F007-01", descricao: "Alerta de churn: ISP com baixa atividade + inadimplência", tipo: "Critério" },
      { codigo: "RN-F007-02", descricao: "Alerta de trial: expira em até 2 dias", tipo: "Critério" },
      { codigo: "RN-F007-03", descricao: "Alerta de IA: ISP excedeu 80% do limite de uso", tipo: "Critério" },
      { codigo: "RN-F007-04", descricao: "Alertas são ordenados por criticidade (churn > trial > IA)", tipo: "Comportamento" },
      { codigo: "RN-F007-05", descricao: "Clique no alerta navega para detalhe do ISP", tipo: "Navegação" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Visualizar todos os alertas" },
      { role: "Roles com permissão de clientes", acoes: "Visualizar alertas de churn e trial" },
      { role: "Roles com permissão de IA", acoes: "Visualizar alertas de uso de IA" },
    ],
    entidades: [
      { tabela: "cliente_isp", campos: "id, nome, status, ultimo_acesso, trial_expira_em", operacoes: "SELECT" },
      { tabela: "uso_ia", campos: "cliente_id, tokens_consumidos, limite", operacoes: "SELECT" },
      { tabela: "fatura", campos: "cliente_id, status, vencimento", operacoes: "SELECT" },
    ],
  },
  {
    codigo: "F-ADMIN-008",
    nome: "Visualizar Timeline de Atividades",
    modulo: "Dashboard",
    plataforma: "Painel Admin",
    descricao: "Exibe feed/timeline com eventos recentes do sistema: novos cadastros, pagamentos recebidos, mudanças de plano e cancelamentos. Permite acompanhar a atividade do SaaS em tempo real.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-F008-01", descricao: "Timeline exibe últimos 20 eventos por padrão", tipo: "Limite" },
      { codigo: "RN-F008-02", descricao: "Eventos ordenados do mais recente para o mais antigo", tipo: "Comportamento" },
      { codigo: "RN-F008-03", descricao: "Cada evento mostra: tipo, ISP envolvido, timestamp", tipo: "Dados" },
      { codigo: "RN-F008-04", descricao: "Clique no evento navega para detalhe do ISP/recurso", tipo: "Navegação" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Visualizar todos os eventos" },
      { role: "Roles configurados", acoes: "Visualizar eventos não-sensíveis" },
    ],
    entidades: [
      { tabela: "log_atividade", campos: "id, tipo, cliente_id, descricao, created_at", operacoes: "SELECT" },
      { tabela: "cliente_isp", campos: "id, nome", operacoes: "SELECT (join)" },
    ],
  },
  {
    codigo: "F-ADMIN-009",
    nome: "Visualizar Quick Stats (ISPs Online e Tickets)",
    modulo: "Dashboard",
    plataforma: "Painel Admin",
    descricao: "Exibe cards secundários com estatísticas rápidas: ISPs online agora na plataforma e tickets de suporte abertos para o AutoISP.",
    criticidade: "baixa",
    regrasNegocio: [
      { codigo: "RN-F009-01", descricao: "ISPs online: sessão ativa nos últimos 15 minutos", tipo: "Definição" },
      { codigo: "RN-F009-02", descricao: "Tickets considera apenas status = 'aberto'", tipo: "Definição" },
      { codigo: "RN-F009-03", descricao: "Atualização manual (ao carregar página ou clicar atualizar)", tipo: "Comportamento" },
    ],
    permissoes: [
      { role: "Todos os roles com acesso ao Dashboard", acoes: "Visualizar quick stats" },
    ],
    entidades: [
      { tabela: "sessao_usuario", campos: "cliente_id, ultimo_acesso", operacoes: "SELECT (count)" },
      { tabela: "ticket_suporte", campos: "id, status, created_at", operacoes: "SELECT (count)" },
    ],
  },
];

const getCriticidadeBadge = (criticidade: Feature["criticidade"]) => {
  const variants = {
    alta: "bg-red-500/10 text-red-600 border-red-500/20",
    media: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    baixa: "bg-green-500/10 text-green-600 border-green-500/20",
  };
  const labels = {
    alta: "Alta",
    media: "Média",
    baixa: "Baixa",
  };
  return (
    <Badge variant="outline" className={variants[criticidade]}>
      {labels[criticidade]}
    </Badge>
  );
};

const DashboardFeatures = () => {
  return (
    <div className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          9 features documentadas para o módulo Dashboard
        </p>
      </div>

      <Accordion type="single" collapsible className="space-y-3">
        {dashboardFeatures.map((feature) => (
          <AccordionItem
            key={feature.codigo}
            value={feature.codigo}
            className="rounded-lg border border-border bg-background px-4"
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex flex-1 items-center gap-3 text-left">
                <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
                  {feature.codigo}
                </code>
                <span className="font-medium text-foreground">{feature.nome}</span>
                {getCriticidadeBadge(feature.criticidade)}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6 pt-2">
                {/* Descrição */}
                <div>
                  <h4 className="mb-2 text-sm font-medium text-foreground">Descrição</h4>
                  <p className="text-sm text-muted-foreground">{feature.descricao}</p>
                </div>

                {/* Regras de Negócio */}
                <div>
                  <h4 className="mb-2 text-sm font-medium text-foreground">Regras de Negócio</h4>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-[120px]">Código</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead className="w-[120px]">Tipo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {feature.regrasNegocio.map((rn) => (
                          <TableRow key={rn.codigo}>
                            <TableCell className="font-mono text-xs">{rn.codigo}</TableCell>
                            <TableCell className="text-sm">{rn.descricao}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">
                                {rn.tipo}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Permissões */}
                <div>
                  <h4 className="mb-2 text-sm font-medium text-foreground">Permissões</h4>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-[250px]">Role</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {feature.permissoes.map((perm, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{perm.role}</TableCell>
                            <TableCell className="text-sm">{perm.acoes}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Entidades */}
                <div>
                  <h4 className="mb-2 text-sm font-medium text-foreground">Dados/Entidades</h4>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-[180px]">Tabela</TableHead>
                          <TableHead>Campos</TableHead>
                          <TableHead className="w-[120px]">Operações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {feature.entidades.map((ent, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-mono text-xs">{ent.tabela}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{ent.campos}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {ent.operacoes}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default DashboardFeatures;

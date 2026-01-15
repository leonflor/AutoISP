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
}

interface Permissao {
  perfil: string;
  visualizar: boolean;
  criar: boolean;
  editar: boolean;
  excluir: boolean;
}

interface Entidade {
  nome: string;
  campos: string[];
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

const dashboardClienteFeatures: Feature[] = [
  {
    codigo: "F-CLI-001",
    nome: "Visualizar KPIs de Atendimento",
    modulo: "Dashboard",
    plataforma: "Painel Cliente",
    descricao: "Exibe indicadores-chave de performance dos atendimentos realizados pelo ISP cliente, incluindo volume, tempo médio e taxa de resolução.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-001", descricao: "KPIs devem ser calculados em tempo real ou com cache máximo de 5 minutos" },
      { codigo: "RN-CLI-002", descricao: "Dados são filtrados automaticamente pelo tenant do ISP logado" },
      { codigo: "RN-CLI-003", descricao: "Período padrão é últimos 30 dias, podendo ser alterado" },
      { codigo: "RN-CLI-004", descricao: "Exibir comparativo com período anterior quando disponível" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Atendimento", campos: ["id", "status", "created_at", "resolved_at", "duration"] },
      { nome: "Dashboard Cache", campos: ["metric_type", "value", "calculated_at"] },
    ],
  },
  {
    codigo: "F-CLI-002",
    nome: "Visualizar Gráfico de Atendimentos por Período",
    modulo: "Dashboard",
    plataforma: "Painel Cliente",
    descricao: "Apresenta gráfico de linha ou barras com evolução dos atendimentos ao longo do tempo.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-005", descricao: "Gráfico deve permitir zoom e navegação temporal" },
      { codigo: "RN-CLI-006", descricao: "Granularidade ajustável: hora, dia, semana, mês" },
      { codigo: "RN-CLI-007", descricao: "Permitir comparação entre canais de atendimento" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Atendimento", campos: ["id", "canal", "created_at", "status"] },
    ],
  },
  {
    codigo: "F-CLI-003",
    nome: "Visualizar Métricas de Uso da IA",
    modulo: "Dashboard",
    plataforma: "Painel Cliente",
    descricao: "Exibe estatísticas de utilização dos agentes de IA, incluindo volume de interações, taxa de resolução automática e escalações.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-008", descricao: "Métricas devem separar resolução autônoma vs escalada" },
      { codigo: "RN-CLI-009", descricao: "Exibir consumo de tokens/créditos quando aplicável" },
      { codigo: "RN-CLI-010", descricao: "Indicar tendência de melhoria da IA ao longo do tempo" },
      { codigo: "RN-CLI-011", descricao: "Alertar quando taxa de escalação estiver acima do limite" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Agente IA", campos: ["id", "nome", "status"] },
      { nome: "Interação IA", campos: ["id", "agente_id", "resolved", "escalated", "tokens_used"] },
    ],
  },
  {
    codigo: "F-CLI-004",
    nome: "Visualizar Status do Monitoramento",
    modulo: "Dashboard",
    plataforma: "Painel Cliente",
    descricao: "Widget que mostra resumo do status dos ativos monitorados, incluindo quantidade online, offline e em alerta.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-012", descricao: "Status deve ser atualizado em tempo real via WebSocket" },
      { codigo: "RN-CLI-013", descricao: "Clique no widget direciona para módulo de monitoramento" },
      { codigo: "RN-CLI-014", descricao: "Exibir porcentagem de disponibilidade geral" },
      { codigo: "RN-CLI-015", descricao: "Destacar ativos críticos com problemas" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Ativo", campos: ["id", "tipo", "status", "last_check"] },
    ],
  },
  {
    codigo: "F-CLI-005",
    nome: "Visualizar Feed de Atividades Recentes",
    modulo: "Dashboard",
    plataforma: "Painel Cliente",
    descricao: "Timeline com últimas atividades relevantes do sistema, como novos atendimentos, alertas e ações de operadores.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-016", descricao: "Feed deve atualizar em tempo real" },
      { codigo: "RN-CLI-017", descricao: "Exibir últimas 20 atividades por padrão" },
      { codigo: "RN-CLI-018", descricao: "Cada item deve ter link para o recurso relacionado" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Atividade", campos: ["id", "tipo", "descricao", "recurso_id", "created_at"] },
    ],
  },
  {
    codigo: "F-CLI-006",
    nome: "Filtrar Dashboard por Período",
    modulo: "Dashboard",
    plataforma: "Painel Cliente",
    descricao: "Permite alterar o período de análise de todos os widgets do dashboard simultaneamente.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-019", descricao: "Períodos predefinidos: hoje, 7 dias, 30 dias, 90 dias" },
      { codigo: "RN-CLI-020", descricao: "Permitir seleção de intervalo customizado" },
      { codigo: "RN-CLI-021", descricao: "Filtro deve persistir durante a sessão" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-007",
    nome: "Exportar Dados do Dashboard",
    modulo: "Dashboard",
    plataforma: "Painel Cliente",
    descricao: "Permite exportar os dados visualizados no dashboard em formato PDF ou Excel.",
    criticidade: "baixa",
    regrasNegocio: [
      { codigo: "RN-CLI-022", descricao: "Exportação deve respeitar filtros aplicados" },
      { codigo: "RN-CLI-023", descricao: "Incluir período e data de geração no arquivo" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: false, excluir: false },
      { perfil: "Operador", visualizar: false, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-008",
    nome: "Visualizar Alertas Críticos",
    modulo: "Dashboard",
    plataforma: "Painel Cliente",
    descricao: "Painel destacado que exibe alertas críticos que requerem atenção imediata.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-024", descricao: "Alertas críticos devem ter destaque visual (cor vermelha)" },
      { codigo: "RN-CLI-025", descricao: "Exibir contagem de alertas não reconhecidos" },
      { codigo: "RN-CLI-026", descricao: "Notificação sonora opcional para novos alertas" },
      { codigo: "RN-CLI-027", descricao: "Link direto para ação de resolução" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: true, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: true, excluir: false },
    ],
    entidades: [
      { nome: "Alerta", campos: ["id", "tipo", "severidade", "mensagem", "acknowledged", "created_at"] },
    ],
  },
];

const getCriticidadeBadge = (criticidade: Feature["criticidade"]) => {
  const styles = {
    alta: "bg-red-500/10 text-red-500 border-red-500/20",
    media: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    baixa: "bg-green-500/10 text-green-500 border-green-500/20",
  };
  const labels = { alta: "Alta", media: "Média", baixa: "Baixa" };
  return <Badge className={styles[criticidade]}>{labels[criticidade]}</Badge>;
};

const DashboardClienteFeatures = () => {
  return (
    <div className="space-y-4">
      <Accordion type="multiple" className="space-y-2">
        {dashboardClienteFeatures.map((feature) => (
          <AccordionItem
            key={feature.codigo}
            value={feature.codigo}
            className="rounded-lg border border-border bg-card/50 px-4"
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono">
                  {feature.codigo}
                </code>
                <span className="font-medium">{feature.nome}</span>
                {getCriticidadeBadge(feature.criticidade)}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">{feature.descricao}</p>

              {feature.regrasNegocio.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Regras de Negócio</h4>
                  <ul className="space-y-1">
                    {feature.regrasNegocio.map((rn) => (
                      <li key={rn.codigo} className="flex gap-2 text-sm">
                        <code className="shrink-0 text-xs text-primary">{rn.codigo}</code>
                        <span className="text-muted-foreground">{rn.descricao}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {feature.permissoes.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Permissões</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Perfil</TableHead>
                        <TableHead className="text-center">Visualizar</TableHead>
                        <TableHead className="text-center">Criar</TableHead>
                        <TableHead className="text-center">Editar</TableHead>
                        <TableHead className="text-center">Excluir</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {feature.permissoes.map((perm) => (
                        <TableRow key={perm.perfil}>
                          <TableCell>{perm.perfil}</TableCell>
                          <TableCell className="text-center">{perm.visualizar ? "✓" : "—"}</TableCell>
                          <TableCell className="text-center">{perm.criar ? "✓" : "—"}</TableCell>
                          <TableCell className="text-center">{perm.editar ? "✓" : "—"}</TableCell>
                          <TableCell className="text-center">{perm.excluir ? "✓" : "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {feature.entidades.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Entidades de Dados</h4>
                  <div className="flex flex-wrap gap-2">
                    {feature.entidades.map((ent) => (
                      <Badge key={ent.nome} variant="outline" className="font-mono text-xs">
                        {ent.nome}: {ent.campos.join(", ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default DashboardClienteFeatures;

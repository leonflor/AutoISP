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
  id: string;
  descricao: string;
}

interface Permissao {
  perfil: string;
  acoes: string[];
}

interface Entidade {
  nome: string;
  campos: string[];
}

interface Feature {
  codigo: string;
  nome: string;
  descricao: string;
  criticidade: "alta" | "media" | "baixa";
  regrasNegocio: RegraNegocio[];
  permissoes: Permissao[];
  entidades: Entidade[];
}

const relatoriosFeatures: Feature[] = [
  // === FINANCEIRO ===
  {
    codigo: "F-ADMIN-070",
    nome: "Relatório de Faturamento Mensal",
    descricao: "Gera relatório consolidado de faturamento por período, cliente e plano.",
    criticidade: "alta",
    regrasNegocio: [
      { id: "RN01", descricao: "Consolidar receitas por mês, trimestre ou ano" },
      { id: "RN02", descricao: "Permitir filtros por cliente ISP, plano e status" },
      { id: "RN03", descricao: "Incluir comparativo com período anterior" },
      { id: "RN04", descricao: "Exibir breakdown de receita recorrente vs avulsa" },
    ],
    permissoes: [
      { perfil: "Admin", acoes: ["visualizar", "exportar", "agendar"] },
      { perfil: "Financeiro", acoes: ["visualizar", "exportar"] },
    ],
    entidades: [
      { nome: "Fatura", campos: ["id", "valor_total", "data_emissao", "status"] },
      { nome: "Cliente", campos: ["id", "razao_social", "plano_id"] },
    ],
  },
  {
    codigo: "F-ADMIN-071",
    nome: "Relatório de Inadimplência",
    descricao: "Apresenta análise detalhada de clientes inadimplentes e aging de recebíveis.",
    criticidade: "alta",
    regrasNegocio: [
      { id: "RN01", descricao: "Classificar por faixa de atraso (30, 60, 90+ dias)" },
      { id: "RN02", descricao: "Calcular taxa de inadimplência sobre faturamento" },
      { id: "RN03", descricao: "Identificar clientes com reincidência de atraso" },
      { id: "RN04", descricao: "Projetar impacto financeiro da inadimplência" },
    ],
    permissoes: [
      { perfil: "Admin", acoes: ["visualizar", "exportar", "configurar alertas"] },
      { perfil: "Financeiro", acoes: ["visualizar", "exportar"] },
    ],
    entidades: [
      { nome: "Fatura", campos: ["id", "valor_total", "data_vencimento", "status"] },
      { nome: "Cliente", campos: ["id", "razao_social", "status_financeiro"] },
    ],
  },
  {
    codigo: "F-ADMIN-072",
    nome: "Relatório MRR e Churn",
    descricao: "Monitora receita recorrente mensal e taxa de cancelamento de clientes.",
    criticidade: "alta",
    regrasNegocio: [
      { id: "RN01", descricao: "Calcular MRR total, novo, expansão e contração" },
      { id: "RN02", descricao: "Medir churn rate mensal e anualizado" },
      { id: "RN03", descricao: "Identificar motivos de cancelamento" },
      { id: "RN04", descricao: "Projetar LTV médio por segmento de cliente" },
    ],
    permissoes: [
      { perfil: "Admin", acoes: ["visualizar", "exportar", "definir metas"] },
      { perfil: "Financeiro", acoes: ["visualizar", "exportar"] },
    ],
    entidades: [
      { nome: "Assinatura", campos: ["id", "valor_mensal", "status", "data_cancelamento"] },
      { nome: "Cliente", campos: ["id", "razao_social", "segmento"] },
    ],
  },
  {
    codigo: "F-ADMIN-073",
    nome: "Relatório de Projeções Financeiras",
    descricao: "Projeta receitas e despesas futuras com base em tendências e contratos.",
    criticidade: "media",
    regrasNegocio: [
      { id: "RN01", descricao: "Projetar receita baseado em contratos ativos e pipeline" },
      { id: "RN02", descricao: "Considerar sazonalidade histórica nas projeções" },
      { id: "RN03", descricao: "Permitir cenários otimista, realista e pessimista" },
      { id: "RN04", descricao: "Incluir projeção de churn baseada em indicadores" },
    ],
    permissoes: [
      { perfil: "Admin", acoes: ["visualizar", "exportar", "ajustar parâmetros"] },
      { perfil: "Financeiro", acoes: ["visualizar"] },
    ],
    entidades: [
      { nome: "Projecao", campos: ["periodo", "receita_projetada", "cenario"] },
      { nome: "Contrato", campos: ["id", "valor", "vigencia", "probabilidade"] },
    ],
  },

  // === OPERACIONAL ===
  {
    codigo: "F-ADMIN-074",
    nome: "Relatório de Tickets por Período",
    descricao: "Analisa volume, distribuição e resolução de tickets de suporte.",
    criticidade: "alta",
    regrasNegocio: [
      { id: "RN01", descricao: "Consolidar tickets por dia, semana ou mês" },
      { id: "RN02", descricao: "Segmentar por categoria, prioridade e status" },
      { id: "RN03", descricao: "Calcular tempo médio de primeira resposta e resolução" },
      { id: "RN04", descricao: "Identificar picos de demanda e tendências" },
    ],
    permissoes: [
      { perfil: "Admin", acoes: ["visualizar", "exportar"] },
      { perfil: "Suporte", acoes: ["visualizar", "exportar"] },
    ],
    entidades: [
      { nome: "Ticket", campos: ["id", "categoria", "prioridade", "created_at", "resolved_at"] },
      { nome: "Cliente", campos: ["id", "razao_social"] },
    ],
  },
  {
    codigo: "F-ADMIN-075",
    nome: "Relatório de Performance de Atendentes",
    descricao: "Avalia desempenho individual e coletivo da equipe de suporte.",
    criticidade: "media",
    regrasNegocio: [
      { id: "RN01", descricao: "Medir tickets resolvidos por atendente" },
      { id: "RN02", descricao: "Calcular tempo médio de atendimento por pessoa" },
      { id: "RN03", descricao: "Incluir avaliações de satisfação (CSAT) por atendente" },
      { id: "RN04", descricao: "Comparar performance com metas definidas" },
    ],
    permissoes: [
      { perfil: "Admin", acoes: ["visualizar", "exportar", "definir metas"] },
      { perfil: "Suporte", acoes: ["visualizar próprio desempenho"] },
    ],
    entidades: [
      { nome: "Usuario", campos: ["id", "nome", "perfil"] },
      { nome: "Ticket", campos: ["id", "atendente_id", "tempo_resolucao", "avaliacao"] },
    ],
  },
  {
    codigo: "F-ADMIN-076",
    nome: "Relatório de Uso da Plataforma",
    descricao: "Monitora engajamento e utilização dos recursos da plataforma pelos clientes.",
    criticidade: "media",
    regrasNegocio: [
      { id: "RN01", descricao: "Rastrear logins e sessões por cliente" },
      { id: "RN02", descricao: "Identificar funcionalidades mais e menos utilizadas" },
      { id: "RN03", descricao: "Medir frequência de acesso por período" },
      { id: "RN04", descricao: "Detectar clientes inativos ou com baixo engajamento" },
    ],
    permissoes: [
      { perfil: "Admin", acoes: ["visualizar", "exportar"] },
      { perfil: "CS", acoes: ["visualizar"] },
    ],
    entidades: [
      { nome: "Sessao", campos: ["id", "usuario_id", "inicio", "fim", "paginas_visitadas"] },
      { nome: "EventoUso", campos: ["id", "tipo", "recurso", "timestamp"] },
    ],
  },
  {
    codigo: "F-ADMIN-077",
    nome: "Relatório de Auditoria",
    descricao: "Registra e apresenta todas as ações críticas realizadas no sistema.",
    criticidade: "alta",
    regrasNegocio: [
      { id: "RN01", descricao: "Logar todas as alterações em dados sensíveis" },
      { id: "RN02", descricao: "Registrar quem, quando e o que foi alterado" },
      { id: "RN03", descricao: "Permitir filtros por usuário, ação e período" },
      { id: "RN04", descricao: "Manter logs por período mínimo de 2 anos" },
    ],
    permissoes: [
      { perfil: "Admin", acoes: ["visualizar", "exportar"] },
    ],
    entidades: [
      { nome: "LogAuditoria", campos: ["id", "usuario_id", "acao", "entidade", "dados_anteriores", "dados_novos", "timestamp"] },
    ],
  },

  // === CLIENTES ===
  {
    codigo: "F-ADMIN-078",
    nome: "Relatório de Base de Clientes",
    descricao: "Visão geral da base de clientes ISP com métricas consolidadas.",
    criticidade: "alta",
    regrasNegocio: [
      { id: "RN01", descricao: "Listar todos os clientes com status e plano atual" },
      { id: "RN02", descricao: "Exibir distribuição por região e segmento" },
      { id: "RN03", descricao: "Mostrar evolução da base ao longo do tempo" },
      { id: "RN04", descricao: "Calcular taxa de crescimento líquido" },
    ],
    permissoes: [
      { perfil: "Admin", acoes: ["visualizar", "exportar"] },
      { perfil: "Comercial", acoes: ["visualizar", "exportar"] },
    ],
    entidades: [
      { nome: "Cliente", campos: ["id", "razao_social", "status", "plano_id", "regiao", "created_at"] },
    ],
  },
  {
    codigo: "F-ADMIN-079",
    nome: "Ranking de Clientes",
    descricao: "Classifica clientes por receita, engajamento ou outros critérios.",
    criticidade: "media",
    regrasNegocio: [
      { id: "RN01", descricao: "Ordenar por receita total ou recorrente" },
      { id: "RN02", descricao: "Classificar por tempo de casa" },
      { id: "RN03", descricao: "Ranquear por nível de engajamento com a plataforma" },
      { id: "RN04", descricao: "Identificar top 10/20% de clientes (regra 80/20)" },
    ],
    permissoes: [
      { perfil: "Admin", acoes: ["visualizar", "exportar"] },
      { perfil: "Comercial", acoes: ["visualizar"] },
    ],
    entidades: [
      { nome: "Cliente", campos: ["id", "razao_social", "receita_total", "engajamento_score"] },
    ],
  },
  {
    codigo: "F-ADMIN-080",
    nome: "Relatório de Saúde do Cliente",
    descricao: "Avalia saúde geral dos clientes para identificar riscos de churn.",
    criticidade: "media",
    regrasNegocio: [
      { id: "RN01", descricao: "Calcular health score baseado em múltiplos indicadores" },
      { id: "RN02", descricao: "Considerar adimplência, uso da plataforma e suporte" },
      { id: "RN03", descricao: "Classificar em faixas de risco (alto, médio, baixo)" },
      { id: "RN04", descricao: "Alertar sobre clientes com queda no health score" },
    ],
    permissoes: [
      { perfil: "Admin", acoes: ["visualizar", "exportar", "configurar indicadores"] },
      { perfil: "CS", acoes: ["visualizar", "exportar"] },
    ],
    entidades: [
      { nome: "Cliente", campos: ["id", "razao_social", "health_score", "risco_churn"] },
      { nome: "IndicadorSaude", campos: ["cliente_id", "indicador", "valor", "peso"] },
    ],
  },
  {
    codigo: "F-ADMIN-081",
    nome: "Relatório de Segmentação",
    descricao: "Agrupa e analisa clientes por diferentes critérios de segmentação.",
    criticidade: "baixa",
    regrasNegocio: [
      { id: "RN01", descricao: "Segmentar por porte (pequeno, médio, grande)" },
      { id: "RN02", descricao: "Agrupar por região geográfica" },
      { id: "RN03", descricao: "Classificar por tempo de contrato" },
      { id: "RN04", descricao: "Permitir segmentação customizada por atributos" },
    ],
    permissoes: [
      { perfil: "Admin", acoes: ["visualizar", "exportar", "criar segmentos"] },
      { perfil: "Comercial", acoes: ["visualizar"] },
    ],
    entidades: [
      { nome: "Cliente", campos: ["id", "razao_social", "porte", "regiao", "segmento"] },
      { nome: "Segmento", campos: ["id", "nome", "criterios", "clientes_count"] },
    ],
  },

  // === INFRAESTRUTURA ===
  {
    codigo: "F-ADMIN-082",
    nome: "Exportar Relatório em PDF",
    descricao: "Gera versão PDF formatada de qualquer relatório do sistema.",
    criticidade: "alta",
    regrasNegocio: [
      { id: "RN01", descricao: "Manter formatação e gráficos na exportação" },
      { id: "RN02", descricao: "Incluir cabeçalho com data de geração e filtros aplicados" },
      { id: "RN03", descricao: "Permitir personalização de logo e cores" },
      { id: "RN04", descricao: "Gerar PDFs com tamanho otimizado" },
    ],
    permissoes: [
      { perfil: "Admin", acoes: ["exportar", "configurar template"] },
      { perfil: "Financeiro", acoes: ["exportar"] },
      { perfil: "Suporte", acoes: ["exportar"] },
    ],
    entidades: [
      { nome: "ExportacaoRelatorio", campos: ["id", "relatorio_tipo", "formato", "usuario_id", "created_at"] },
    ],
  },
  {
    codigo: "F-ADMIN-083",
    nome: "Exportar Relatório em Excel/CSV",
    descricao: "Permite exportação de dados tabulares em formato Excel ou CSV.",
    criticidade: "alta",
    regrasNegocio: [
      { id: "RN01", descricao: "Exportar dados brutos para análise externa" },
      { id: "RN02", descricao: "Manter formatação de datas e números" },
      { id: "RN03", descricao: "Permitir seleção de colunas a exportar" },
      { id: "RN04", descricao: "Suportar grandes volumes de dados (pagination)" },
    ],
    permissoes: [
      { perfil: "Admin", acoes: ["exportar"] },
      { perfil: "Financeiro", acoes: ["exportar"] },
      { perfil: "Suporte", acoes: ["exportar"] },
    ],
    entidades: [
      { nome: "ExportacaoRelatorio", campos: ["id", "relatorio_tipo", "formato", "colunas", "registros_count"] },
    ],
  },
  {
    codigo: "F-ADMIN-084",
    nome: "Gerador de Relatórios Personalizado",
    descricao: "Permite criar relatórios customizados combinando diferentes métricas.",
    criticidade: "media",
    regrasNegocio: [
      { id: "RN01", descricao: "Selecionar métricas e dimensões desejadas" },
      { id: "RN02", descricao: "Definir filtros e agrupamentos" },
      { id: "RN03", descricao: "Salvar relatórios personalizados para reutilização" },
      { id: "RN04", descricao: "Compartilhar relatórios com outros usuários" },
    ],
    permissoes: [
      { perfil: "Admin", acoes: ["criar", "editar", "excluir", "compartilhar"] },
      { perfil: "Financeiro", acoes: ["criar", "editar próprios"] },
    ],
    entidades: [
      { nome: "RelatorioCustomizado", campos: ["id", "nome", "metricas", "filtros", "criador_id"] },
    ],
  },
];

const getCriticidadeBadge = (criticidade: Feature["criticidade"]) => {
  const config = {
    alta: { label: "Alta", className: "bg-red-500/10 text-red-500 border-red-500/20" },
    media: { label: "Média", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
    baixa: { label: "Baixa", className: "bg-green-500/10 text-green-500 border-green-500/20" },
  };
  const { label, className } = config[criticidade];
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

const RelatoriosFeatures = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {relatoriosFeatures.length} features documentadas
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-2">
        {relatoriosFeatures.map((feature) => (
          <AccordionItem
            key={feature.codigo}
            value={feature.codigo}
            className="rounded-lg border border-border bg-background px-4"
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3 text-left">
                <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
                  {feature.codigo}
                </code>
                <span className="font-medium text-foreground">{feature.nome}</span>
                {getCriticidadeBadge(feature.criticidade)}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="space-y-6">
                {/* Descrição */}
                <div>
                  <h4 className="mb-2 text-sm font-medium text-foreground">Descrição</h4>
                  <p className="text-sm text-muted-foreground">{feature.descricao}</p>
                </div>

                {/* Regras de Negócio */}
                <div>
                  <h4 className="mb-2 text-sm font-medium text-foreground">Regras de Negócio</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">ID</TableHead>
                        <TableHead>Descrição</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {feature.regrasNegocio.map((regra) => (
                        <TableRow key={regra.id}>
                          <TableCell className="font-mono text-xs">{regra.id}</TableCell>
                          <TableCell className="text-sm">{regra.descricao}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Permissões */}
                <div>
                  <h4 className="mb-2 text-sm font-medium text-foreground">Permissões</h4>
                  <div className="flex flex-wrap gap-2">
                    {feature.permissoes.map((perm) => (
                      <div
                        key={perm.perfil}
                        className="rounded-lg border border-border bg-muted/50 px-3 py-2"
                      >
                        <span className="text-xs font-medium text-foreground">{perm.perfil}</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {perm.acoes.map((acao) => (
                            <Badge key={acao} variant="secondary" className="text-[10px]">
                              {acao}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Entidades */}
                <div>
                  <h4 className="mb-2 text-sm font-medium text-foreground">Entidades de Dados</h4>
                  <div className="flex flex-wrap gap-2">
                    {feature.entidades.map((entidade) => (
                      <div
                        key={entidade.nome}
                        className="rounded-lg border border-border bg-muted/50 px-3 py-2"
                      >
                        <span className="text-xs font-medium text-foreground">{entidade.nome}</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {entidade.campos.map((campo) => (
                            <code
                              key={campo}
                              className="rounded bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground"
                            >
                              {campo}
                            </code>
                          ))}
                        </div>
                      </div>
                    ))}
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

export default RelatoriosFeatures;

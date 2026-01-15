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

const relatoriosClienteFeatures: Feature[] = [
  {
    codigo: "F-CLI-103",
    nome: "Gerar Relatório de Atendimentos",
    modulo: "Relatórios",
    plataforma: "Painel Cliente",
    descricao: "Relatório detalhado de todos os atendimentos no período selecionado.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-401", descricao: "Filtros: período, canal, status, operador" },
      { codigo: "RN-CLI-402", descricao: "Métricas: volume, tempo médio, taxa resolução" },
      { codigo: "RN-CLI-403", descricao: "Gráficos de evolução temporal" },
      { codigo: "RN-CLI-404", descricao: "Detalhamento por canal e categoria" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-104",
    nome: "Gerar Relatório de Performance da IA",
    modulo: "Relatórios",
    plataforma: "Painel Cliente",
    descricao: "Análise detalhada do desempenho dos agentes de IA.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-405", descricao: "Taxa de resolução autônoma por agente" },
      { codigo: "RN-CLI-406", descricao: "Motivos de escalação mais frequentes" },
      { codigo: "RN-CLI-407", descricao: "Comparativo entre agentes" },
      { codigo: "RN-CLI-408", descricao: "Evolução da performance ao longo do tempo" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-105",
    nome: "Gerar Relatório de Comunicação",
    modulo: "Relatórios",
    plataforma: "Painel Cliente",
    descricao: "Análise de campanhas e gatilhos de comunicação ativa.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-409", descricao: "Volume de envios por tipo (campanha vs gatilho)" },
      { codigo: "RN-CLI-410", descricao: "Taxas de entrega e leitura" },
      { codigo: "RN-CLI-411", descricao: "Custo por mensagem" },
      { codigo: "RN-CLI-412", descricao: "Comparativo entre campanhas" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-106",
    nome: "Gerar Relatório de Monitoramento",
    modulo: "Relatórios",
    plataforma: "Painel Cliente",
    descricao: "Relatório de disponibilidade e saúde da rede.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-413", descricao: "Uptime geral e por categoria de ativo" },
      { codigo: "RN-CLI-414", descricao: "Incidentes e tempo de resolução" },
      { codigo: "RN-CLI-415", descricao: "Ativos problemáticos (ranking)" },
      { codigo: "RN-CLI-416", descricao: "SLA atingido vs meta" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-107",
    nome: "Agendar Relatório Automático",
    modulo: "Relatórios",
    plataforma: "Painel Cliente",
    descricao: "Configura envio automático de relatórios por email.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-417", descricao: "Frequência: diário, semanal, mensal" },
      { codigo: "RN-CLI-418", descricao: "Definir destinatários (emails)" },
      { codigo: "RN-CLI-419", descricao: "Selecionar formato: PDF ou Excel" },
      { codigo: "RN-CLI-420", descricao: "Preview do relatório antes de agendar" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: true, excluir: true },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Agendamento Relatório", campos: ["id", "tipo_relatorio", "frequencia", "destinatarios", "formato"] },
    ],
  },
  {
    codigo: "F-CLI-108",
    nome: "Exportar Relatório (PDF/Excel)",
    modulo: "Relatórios",
    plataforma: "Painel Cliente",
    descricao: "Exporta qualquer relatório visualizado para arquivo.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-421", descricao: "Formatos: PDF (com gráficos) e Excel (dados brutos)" },
      { codigo: "RN-CLI-422", descricao: "Incluir logo e dados da empresa" },
      { codigo: "RN-CLI-423", descricao: "Registrar log de exportação" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: true, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-109",
    nome: "Visualizar Dashboard Analítico",
    modulo: "Relatórios",
    plataforma: "Painel Cliente",
    descricao: "Dashboard interativo com visão consolidada de todas as métricas.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-424", descricao: "Widgets customizáveis" },
      { codigo: "RN-CLI-425", descricao: "Drill-down em cada métrica" },
      { codigo: "RN-CLI-426", descricao: "Período selecionável" },
      { codigo: "RN-CLI-427", descricao: "Comparativo com período anterior" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: true, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-110",
    nome: "Filtrar Relatórios por Período",
    modulo: "Relatórios",
    plataforma: "Painel Cliente",
    descricao: "Controle de período aplicável a todos os relatórios.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-428", descricao: "Períodos predefinidos: hoje, 7, 30, 90 dias" },
      { codigo: "RN-CLI-429", descricao: "Seleção de intervalo customizado" },
      { codigo: "RN-CLI-430", descricao: "Limite máximo de 1 ano de histórico" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-111",
    nome: "Comparar Métricas entre Períodos",
    modulo: "Relatórios",
    plataforma: "Painel Cliente",
    descricao: "Compara indicadores entre dois períodos distintos.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-431", descricao: "Selecionar período base e período comparação" },
      { codigo: "RN-CLI-432", descricao: "Exibir variação percentual" },
      { codigo: "RN-CLI-433", descricao: "Destacar melhorias e pioras" },
      { codigo: "RN-CLI-434", descricao: "Gráfico comparativo lado a lado" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-112",
    nome: "Gerar Relatório de CSAT",
    modulo: "Relatórios",
    plataforma: "Painel Cliente",
    descricao: "Relatório de satisfação do cliente baseado nas avaliações coletadas.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-435", descricao: "Nota média geral e por operador" },
      { codigo: "RN-CLI-436", descricao: "Distribuição das notas (1-5)" },
      { codigo: "RN-CLI-437", descricao: "Comentários mais frequentes (word cloud)" },
      { codigo: "RN-CLI-438", descricao: "Evolução da satisfação ao longo do tempo" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
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

const RelatoriosClienteFeatures = () => {
  return (
    <div className="space-y-4">
      <Accordion type="multiple" className="space-y-2">
        {relatoriosClienteFeatures.map((feature) => (
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

export default RelatoriosClienteFeatures;

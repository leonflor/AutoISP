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

const monitoramentoClienteFeatures: Feature[] = [
  {
    codigo: "F-CLI-061",
    nome: "Visualizar Mapa de Ativos",
    modulo: "Monitoramento",
    plataforma: "Painel Cliente",
    descricao: "Exibe mapa geográfico com localização e status dos ativos monitorados.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-236", descricao: "Mapa interativo com zoom e pan" },
      { codigo: "RN-CLI-237", descricao: "Marcadores coloridos por status (verde, amarelo, vermelho)" },
      { codigo: "RN-CLI-238", descricao: "Clique no marcador abre detalhes do ativo" },
      { codigo: "RN-CLI-239", descricao: "Atualização de status em tempo real" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Ativo", campos: ["id", "tipo", "latitude", "longitude", "status"] },
    ],
  },
  {
    codigo: "F-CLI-062",
    nome: "Listar Ativos Monitorados",
    modulo: "Monitoramento",
    plataforma: "Painel Cliente",
    descricao: "Exibe lista tabular de todos os ativos do ISP com informações de status.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-240", descricao: "Colunas: nome, tipo, IP, status, último check, assinante" },
      { codigo: "RN-CLI-241", descricao: "Ordenar por qualquer coluna" },
      { codigo: "RN-CLI-242", descricao: "Indicador visual de tempo desde último check" },
      { codigo: "RN-CLI-243", descricao: "Paginação com 50 itens por página" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Ativo", campos: ["id", "nome", "tipo", "ip", "mac", "status", "assinante_id", "last_check"] },
    ],
  },
  {
    codigo: "F-CLI-063",
    nome: "Filtrar Ativos por Status/Tipo",
    modulo: "Monitoramento",
    plataforma: "Painel Cliente",
    descricao: "Permite filtrar a lista de ativos por diferentes critérios.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-244", descricao: "Status: online, offline, warning, unknown" },
      { codigo: "RN-CLI-245", descricao: "Tipos: ONU, roteador, switch, OLT, servidor" },
      { codigo: "RN-CLI-246", descricao: "Filtros podem ser combinados" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-064",
    nome: "Visualizar Detalhes do Ativo",
    modulo: "Monitoramento",
    plataforma: "Painel Cliente",
    descricao: "Exibe informações detalhadas de um ativo específico.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-247", descricao: "Dados: modelo, fabricante, firmware, MAC, IPs" },
      { codigo: "RN-CLI-248", descricao: "Métricas: uptime, sinal, temperatura se disponível" },
      { codigo: "RN-CLI-249", descricao: "Histórico de status das últimas 24h" },
      { codigo: "RN-CLI-250", descricao: "Link para o assinante associado" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Ativo Detalhe", campos: ["id", "modelo", "fabricante", "firmware", "uptime", "signal_rx", "signal_tx"] },
    ],
  },
  {
    codigo: "F-CLI-065",
    nome: "Executar Reinício Remoto",
    modulo: "Monitoramento",
    plataforma: "Painel Cliente",
    descricao: "Envia comando para reiniciar um ativo remotamente.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-251", descricao: "Confirmação obrigatória antes de executar" },
      { codigo: "RN-CLI-252", descricao: "Registrar log da ação com operador e motivo" },
      { codigo: "RN-CLI-253", descricao: "Exibir status de execução do comando" },
      { codigo: "RN-CLI-254", descricao: "Timeout de 60 segundos para resposta" },
      { codigo: "RN-CLI-255", descricao: "Disponível apenas para ativos que suportam a ação" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: true, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Comando Remoto", campos: ["id", "ativo_id", "tipo", "status", "operador_id", "created_at"] },
    ],
  },
  {
    codigo: "F-CLI-066",
    nome: "Executar Teste de Conectividade",
    modulo: "Monitoramento",
    plataforma: "Painel Cliente",
    descricao: "Realiza testes de ping, traceroute ou speed test para o ativo.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-256", descricao: "Tipos de teste: ping, traceroute, bandwidth" },
      { codigo: "RN-CLI-257", descricao: "Exibir resultado em tempo real" },
      { codigo: "RN-CLI-258", descricao: "Salvar histórico de testes realizados" },
      { codigo: "RN-CLI-259", descricao: "Limite de testes por minuto para evitar sobrecarga" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: true, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Teste Conectividade", campos: ["id", "ativo_id", "tipo", "resultado", "created_at"] },
    ],
  },
  {
    codigo: "F-CLI-067",
    nome: "Visualizar Histórico de Status do Ativo",
    modulo: "Monitoramento",
    plataforma: "Painel Cliente",
    descricao: "Gráfico timeline mostrando mudanças de status do ativo ao longo do tempo.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-260", descricao: "Período padrão: últimos 7 dias" },
      { codigo: "RN-CLI-261", descricao: "Visualização em timeline ou gráfico de disponibilidade" },
      { codigo: "RN-CLI-262", descricao: "Calcular e exibir uptime percentual" },
      { codigo: "RN-CLI-263", descricao: "Destacar períodos de indisponibilidade" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Status Histórico", campos: ["id", "ativo_id", "status", "timestamp"] },
    ],
  },
  {
    codigo: "F-CLI-068",
    nome: "Configurar Alertas de Monitoramento",
    modulo: "Monitoramento",
    plataforma: "Painel Cliente",
    descricao: "Define regras para disparo de alertas quando ativos apresentarem problemas.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-264", descricao: "Condições: offline por X minutos, sinal abaixo de threshold" },
      { codigo: "RN-CLI-265", descricao: "Canais de notificação: email, WhatsApp, webhook" },
      { codigo: "RN-CLI-266", descricao: "Severidade: crítico, warning, info" },
      { codigo: "RN-CLI-267", descricao: "Agrupar alertas para evitar flood" },
      { codigo: "RN-CLI-268", descricao: "Escalonamento se não reconhecido em X minutos" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: true, excluir: true },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Regra Alerta", campos: ["id", "condicao", "severidade", "canais", "escalonamento"] },
    ],
  },
  {
    codigo: "F-CLI-069",
    nome: "Visualizar Alertas Ativos",
    modulo: "Monitoramento",
    plataforma: "Painel Cliente",
    descricao: "Lista alertas ativos (não reconhecidos/resolvidos) do monitoramento.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-269", descricao: "Ordenar por severidade e depois por tempo" },
      { codigo: "RN-CLI-270", descricao: "Exibir contagem por severidade no topo" },
      { codigo: "RN-CLI-271", descricao: "Atualização em tempo real" },
      { codigo: "RN-CLI-272", descricao: "Link direto para o ativo relacionado" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Alerta", campos: ["id", "regra_id", "ativo_id", "severidade", "mensagem", "created_at"] },
    ],
  },
  {
    codigo: "F-CLI-070",
    nome: "Reconhecer/Silenciar Alerta",
    modulo: "Monitoramento",
    plataforma: "Painel Cliente",
    descricao: "Marca um alerta como reconhecido ou silencia por período determinado.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-273", descricao: "Reconhecer remove alerta da lista ativa" },
      { codigo: "RN-CLI-274", descricao: "Silenciar suprime notificações por período (1h, 4h, 24h)" },
      { codigo: "RN-CLI-275", descricao: "Registrar quem reconheceu/silenciou" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: true, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: true, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-071",
    nome: "Visualizar Gráfico de Disponibilidade",
    modulo: "Monitoramento",
    plataforma: "Painel Cliente",
    descricao: "Dashboard com métricas de disponibilidade da rede do ISP.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-276", descricao: "Uptime geral e por categoria de ativo" },
      { codigo: "RN-CLI-277", descricao: "Comparar com períodos anteriores" },
      { codigo: "RN-CLI-278", descricao: "SLA atingido vs não atingido" },
      { codigo: "RN-CLI-279", descricao: "Top 10 ativos com mais problemas" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-072",
    nome: "Exportar Relatório de Monitoramento",
    modulo: "Monitoramento",
    plataforma: "Painel Cliente",
    descricao: "Gera relatório exportável com dados de monitoramento do período.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-280", descricao: "Formatos: PDF, Excel" },
      { codigo: "RN-CLI-281", descricao: "Incluir gráficos e tabelas" },
      { codigo: "RN-CLI-282", descricao: "Selecionar período e tipos de ativo" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: false, excluir: false },
      { perfil: "Operador", visualizar: false, criar: false, editar: false, excluir: false },
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

const MonitoramentoClienteFeatures = () => {
  return (
    <div className="space-y-4">
      <Accordion type="multiple" className="space-y-2">
        {monitoramentoClienteFeatures.map((feature) => (
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

export default MonitoramentoClienteFeatures;

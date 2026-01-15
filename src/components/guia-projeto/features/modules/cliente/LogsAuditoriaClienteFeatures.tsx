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

const logsAuditoriaClienteFeatures: Feature[] = [
  {
    codigo: "F-CLI-113",
    nome: "Listar Logs de Auditoria",
    modulo: "Logs de Auditoria",
    plataforma: "Painel Cliente",
    descricao: "Exibe registro de todas as ações realizadas no sistema pelos operadores.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-439", descricao: "Registrar todas as ações de CRUD" },
      { codigo: "RN-CLI-440", descricao: "Incluir: usuário, ação, recurso, data/hora, IP" },
      { codigo: "RN-CLI-441", descricao: "Ordenação padrão por data decrescente" },
      { codigo: "RN-CLI-442", descricao: "Paginação com 100 itens por página" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: false, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Log Auditoria", campos: ["id", "usuario_id", "acao", "recurso", "detalhes", "ip", "created_at"] },
    ],
  },
  {
    codigo: "F-CLI-114",
    nome: "Filtrar Logs por Usuário/Ação/Data",
    modulo: "Logs de Auditoria",
    plataforma: "Painel Cliente",
    descricao: "Permite filtrar os logs de auditoria por diferentes critérios.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-443", descricao: "Filtrar por usuário específico" },
      { codigo: "RN-CLI-444", descricao: "Filtrar por tipo de ação (criar, editar, excluir, visualizar)" },
      { codigo: "RN-CLI-445", descricao: "Filtrar por intervalo de datas" },
      { codigo: "RN-CLI-446", descricao: "Filtros podem ser combinados" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: false, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-115",
    nome: "Visualizar Detalhes do Log",
    modulo: "Logs de Auditoria",
    plataforma: "Painel Cliente",
    descricao: "Exibe informações completas de uma entrada de log específica.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-447", descricao: "Mostrar dados antes e depois da alteração (diff)" },
      { codigo: "RN-CLI-448", descricao: "Exibir user-agent e informações de sessão" },
      { codigo: "RN-CLI-449", descricao: "Link para o recurso afetado se ainda existir" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: false, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-116",
    nome: "Exportar Logs de Auditoria",
    modulo: "Logs de Auditoria",
    plataforma: "Painel Cliente",
    descricao: "Permite exportar logs de auditoria para arquivo.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-450", descricao: "Formatos: CSV ou JSON" },
      { codigo: "RN-CLI-451", descricao: "Respeitar filtros aplicados" },
      { codigo: "RN-CLI-452", descricao: "Limite de 50.000 registros por exportação" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: false, excluir: false },
      { perfil: "Operador", visualizar: false, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-117",
    nome: "Configurar Retenção de Logs",
    modulo: "Logs de Auditoria",
    plataforma: "Painel Cliente",
    descricao: "Define por quanto tempo os logs de auditoria são mantidos.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-453", descricao: "Período padrão: 1 ano" },
      { codigo: "RN-CLI-454", descricao: "Opções: 6 meses, 1 ano, 2 anos, indefinido" },
      { codigo: "RN-CLI-455", descricao: "Logs expirados são arquivados antes de exclusão" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: true, excluir: false },
      { perfil: "Operador", visualizar: false, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-118",
    nome: "Buscar em Logs por Texto",
    modulo: "Logs de Auditoria",
    plataforma: "Painel Cliente",
    descricao: "Permite busca textual nos detalhes dos logs.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-456", descricao: "Busca full-text nos campos de detalhes" },
      { codigo: "RN-CLI-457", descricao: "Suportar busca por ID de recurso" },
      { codigo: "RN-CLI-458", descricao: "Resultados ordenados por relevância" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
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

const LogsAuditoriaClienteFeatures = () => {
  return (
    <div className="space-y-4">
      <Accordion type="multiple" className="space-y-2">
        {logsAuditoriaClienteFeatures.map((feature) => (
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

export default LogsAuditoriaClienteFeatures;

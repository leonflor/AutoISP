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

const helpCenterClienteFeatures: Feature[] = [
  {
    codigo: "F-CLI-119",
    nome: "Visualizar Tutoriais em Vídeo",
    modulo: "Help Center",
    plataforma: "Painel Cliente",
    descricao: "Acesso a vídeos tutoriais sobre uso do sistema.",
    criticidade: "baixa",
    regrasNegocio: [
      { codigo: "RN-CLI-459", descricao: "Vídeos organizados por módulo/funcionalidade" },
      { codigo: "RN-CLI-460", descricao: "Player embutido no painel" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Tutorial", campos: ["id", "titulo", "url_video", "modulo", "duracao"] },
    ],
  },
  {
    codigo: "F-CLI-120",
    nome: "Buscar na Base de Conhecimento",
    modulo: "Help Center",
    plataforma: "Painel Cliente",
    descricao: "Busca textual em artigos da base de conhecimento.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-461", descricao: "Busca full-text em títulos e conteúdo" },
      { codigo: "RN-CLI-462", descricao: "Resultados ordenados por relevância" },
      { codigo: "RN-CLI-463", descricao: "Sugestões de artigos relacionados" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Artigo", campos: ["id", "titulo", "conteudo", "categoria", "views"] },
    ],
  },
  {
    codigo: "F-CLI-121",
    nome: "Visualizar FAQ do Sistema",
    modulo: "Help Center",
    plataforma: "Painel Cliente",
    descricao: "Acesso a perguntas frequentes sobre o sistema.",
    criticidade: "baixa",
    regrasNegocio: [
      { codigo: "RN-CLI-464", descricao: "FAQs organizados por categoria" },
      { codigo: "RN-CLI-465", descricao: "Expandir/colapsar respostas" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "FAQ", campos: ["id", "pergunta", "resposta", "categoria", "ordem"] },
    ],
  },
  {
    codigo: "F-CLI-122",
    nome: "Abrir Chamado de Suporte AutoISP",
    modulo: "Help Center",
    plataforma: "Painel Cliente",
    descricao: "Permite abrir ticket de suporte diretamente para a equipe AutoISP.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-466", descricao: "Campos: assunto, categoria, descrição, anexos" },
      { codigo: "RN-CLI-467", descricao: "Prioridade baseada no plano contratado" },
      { codigo: "RN-CLI-468", descricao: "Enviar confirmação por email" },
      { codigo: "RN-CLI-469", descricao: "SLA de resposta conforme plano" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: true, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Ticket Suporte", campos: ["id", "assunto", "categoria", "descricao", "status", "created_at"] },
    ],
  },
  {
    codigo: "F-CLI-123",
    nome: "Visualizar Status de Chamados",
    modulo: "Help Center",
    plataforma: "Painel Cliente",
    descricao: "Acompanha o status dos chamados de suporte abertos.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-470", descricao: "Listar todos os chamados do tenant" },
      { codigo: "RN-CLI-471", descricao: "Filtrar por status: aberto, em andamento, resolvido" },
      { codigo: "RN-CLI-472", descricao: "Visualizar histórico de interações" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-124",
    nome: "Acessar Documentação da API",
    modulo: "Help Center",
    plataforma: "Painel Cliente",
    descricao: "Link para documentação técnica da API do sistema.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-473", descricao: "Documentação OpenAPI/Swagger" },
      { codigo: "RN-CLI-474", descricao: "Exemplos de código em múltiplas linguagens" },
      { codigo: "RN-CLI-475", descricao: "Sandbox para testes" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
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

const HelpCenterClienteFeatures = () => {
  return (
    <div className="space-y-4">
      <Accordion type="multiple" className="space-y-2">
        {helpCenterClienteFeatures.map((feature) => (
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

export default HelpCenterClienteFeatures;

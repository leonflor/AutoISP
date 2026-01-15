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

const usuariosClienteFeatures: Feature[] = [
  {
    codigo: "F-CLI-073",
    nome: "Listar Usuários/Operadores",
    modulo: "Usuários e Perfis",
    plataforma: "Painel Cliente",
    descricao: "Exibe lista de todos os usuários (operadores) do ISP cliente.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-283", descricao: "Exibir nome, email, perfil e status de cada usuário" },
      { codigo: "RN-CLI-284", descricao: "Indicar último acesso" },
      { codigo: "RN-CLI-285", descricao: "Filtrar por status: ativo, inativo, pendente" },
      { codigo: "RN-CLI-286", descricao: "Buscar por nome ou email" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: false, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Usuário", campos: ["id", "nome", "email", "perfil_id", "status", "last_login"] },
    ],
  },
  {
    codigo: "F-CLI-074",
    nome: "Criar Novo Usuário",
    modulo: "Usuários e Perfis",
    plataforma: "Painel Cliente",
    descricao: "Cadastra um novo operador para acessar o painel do ISP.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-287", descricao: "Campos obrigatórios: nome, email, perfil" },
      { codigo: "RN-CLI-288", descricao: "Email deve ser único no tenant" },
      { codigo: "RN-CLI-289", descricao: "Enviar email de convite com link de ativação" },
      { codigo: "RN-CLI-290", descricao: "Link de ativação válido por 48 horas" },
      { codigo: "RN-CLI-291", descricao: "Limite de usuários conforme plano contratado" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: false, excluir: false },
      { perfil: "Operador", visualizar: false, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Convite", campos: ["id", "email", "token", "expires_at", "accepted_at"] },
    ],
  },
  {
    codigo: "F-CLI-075",
    nome: "Editar Dados do Usuário",
    modulo: "Usuários e Perfis",
    plataforma: "Painel Cliente",
    descricao: "Permite alterar informações e perfil de um usuário existente.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-292", descricao: "Nome e perfil podem ser alterados" },
      { codigo: "RN-CLI-293", descricao: "Email não pode ser alterado após criação" },
      { codigo: "RN-CLI-294", descricao: "Alteração de perfil aplica imediatamente" },
      { codigo: "RN-CLI-295", descricao: "Registrar log de alterações" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: true, excluir: false },
      { perfil: "Operador", visualizar: false, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-076",
    nome: "Desativar/Reativar Usuário",
    modulo: "Usuários e Perfis",
    plataforma: "Painel Cliente",
    descricao: "Bloqueia ou restaura acesso de um usuário ao sistema.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-296", descricao: "Desativar encerra sessões ativas imediatamente" },
      { codigo: "RN-CLI-297", descricao: "Usuário desativado não pode fazer login" },
      { codigo: "RN-CLI-298", descricao: "Dados do usuário são mantidos" },
      { codigo: "RN-CLI-299", descricao: "Registrar log com motivo da desativação" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: true, excluir: false },
      { perfil: "Operador", visualizar: false, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-077",
    nome: "Configurar Perfil de Permissões",
    modulo: "Usuários e Perfis",
    plataforma: "Painel Cliente",
    descricao: "Define as permissões granulares de um perfil de acesso.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-300", descricao: "Permissões por módulo e ação (visualizar, criar, editar, excluir)" },
      { codigo: "RN-CLI-301", descricao: "Alteração afeta todos os usuários com o perfil" },
      { codigo: "RN-CLI-302", descricao: "Perfil Administrador ISP não pode ser editado" },
      { codigo: "RN-CLI-303", descricao: "Exibir preview do que o perfil pode acessar" },
      { codigo: "RN-CLI-304", descricao: "Validar que pelo menos um admin existe" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: true, excluir: true },
      { perfil: "Operador", visualizar: false, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Permissão", campos: ["id", "perfil_id", "modulo", "acao", "permitido"] },
    ],
  },
  {
    codigo: "F-CLI-078",
    nome: "Listar Perfis de Permissão",
    modulo: "Usuários e Perfis",
    plataforma: "Painel Cliente",
    descricao: "Exibe todos os perfis de permissão disponíveis.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-305", descricao: "Exibir nome, descrição e contagem de usuários" },
      { codigo: "RN-CLI-306", descricao: "Indicar perfis padrão do sistema" },
      { codigo: "RN-CLI-307", descricao: "Ordenar por nome" },
      { codigo: "RN-CLI-308", descricao: "Buscar por nome do perfil" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: false, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Perfil", campos: ["id", "nome", "descricao", "is_default", "user_count"] },
    ],
  },
  {
    codigo: "F-CLI-079",
    nome: "Criar Novo Perfil de Permissão",
    modulo: "Usuários e Perfis",
    plataforma: "Painel Cliente",
    descricao: "Cria um novo perfil de acesso com permissões customizadas.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-309", descricao: "Nome deve ser único no tenant" },
      { codigo: "RN-CLI-310", descricao: "Pode copiar permissões de perfil existente" },
      { codigo: "RN-CLI-311", descricao: "Limite de perfis conforme plano" },
      { codigo: "RN-CLI-312", descricao: "Descrição obrigatória" },
      { codigo: "RN-CLI-313", descricao: "Novo perfil começa sem usuários" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: false, excluir: false },
      { perfil: "Operador", visualizar: false, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-080",
    nome: "Atribuir Perfil ao Usuário",
    modulo: "Usuários e Perfis",
    plataforma: "Painel Cliente",
    descricao: "Vincula um perfil de permissão a um usuário.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-314", descricao: "Usuário pode ter apenas um perfil ativo" },
      { codigo: "RN-CLI-315", descricao: "Alteração aplica no próximo request" },
      { codigo: "RN-CLI-316", descricao: "Validar que não está removendo último admin" },
      { codigo: "RN-CLI-317", descricao: "Notificar usuário sobre alteração de perfil" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: true, excluir: false },
      { perfil: "Operador", visualizar: false, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-081",
    nome: "Visualizar Atividades do Usuário",
    modulo: "Usuários e Perfis",
    plataforma: "Painel Cliente",
    descricao: "Exibe log de ações realizadas por um usuário específico.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-318", descricao: "Listar ações com data, tipo e detalhes" },
      { codigo: "RN-CLI-319", descricao: "Filtrar por período e tipo de ação" },
      { codigo: "RN-CLI-320", descricao: "Paginação com 50 itens por página" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: false, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Log Atividade", campos: ["id", "usuario_id", "acao", "detalhes", "created_at"] },
    ],
  },
  {
    codigo: "F-CLI-082",
    nome: "Gerenciar Sessões Ativas do Usuário",
    modulo: "Usuários e Perfis",
    plataforma: "Painel Cliente",
    descricao: "Visualiza e encerra sessões ativas de um usuário.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-321", descricao: "Listar dispositivos/browsers com sessões ativas" },
      { codigo: "RN-CLI-322", descricao: "Exibir IP, user-agent e data de início" },
      { codigo: "RN-CLI-323", descricao: "Permitir encerrar sessão específica ou todas" },
      { codigo: "RN-CLI-324", descricao: "Usuário é notificado sobre encerramento forçado" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: true, excluir: true },
      { perfil: "Operador", visualizar: false, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Sessão", campos: ["id", "usuario_id", "ip", "user_agent", "created_at", "expires_at"] },
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

const UsuariosClienteFeatures = () => {
  return (
    <div className="space-y-4">
      <Accordion type="multiple" className="space-y-2">
        {usuariosClienteFeatures.map((feature) => (
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

export default UsuariosClienteFeatures;

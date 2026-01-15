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
  acao: string;
  perfis: string[];
}

interface Entidade {
  nome: string;
  campos: string[];
}

interface Feature {
  codigo: string;
  nome: string;
  descricao: string;
  categoria: string;
  criticidade: "Alta" | "Média" | "Baixa";
  regrasNegocio: RegraNegocio[];
  permissoes: Permissao[];
  entidades: Entidade[];
}

const equipeFeatures: Feature[] = [
  // Gestão de Usuários
  {
    codigo: "F-ADMIN-085",
    nome: "Listar Usuários da Equipe",
    descricao: "Exibir lista completa de todos os usuários cadastrados no sistema com informações de status, perfil e último acesso.",
    categoria: "Gestão de Usuários",
    criticidade: "Alta",
    regrasNegocio: [
      { codigo: "RN-085-01", descricao: "Apenas Super Admin pode visualizar todos os usuários de todos os ISPs" },
      { codigo: "RN-085-02", descricao: "Admin ISP visualiza apenas usuários de sua própria empresa" },
      { codigo: "RN-085-03", descricao: "Lista deve exibir indicador visual de status (ativo/inativo/suspenso)" },
      { codigo: "RN-085-04", descricao: "Ordenação padrão por nome, com opções de filtro por perfil e status" },
    ],
    permissoes: [
      { acao: "Visualizar lista completa", perfis: ["Super Admin"] },
      { acao: "Visualizar usuários do ISP", perfis: ["Admin ISP", "Gestor"] },
      { acao: "Exportar lista", perfis: ["Super Admin", "Admin ISP"] },
    ],
    entidades: [
      { nome: "Usuario", campos: ["id", "nome", "email", "perfil_id", "status", "ultimo_acesso", "criado_em"] },
      { nome: "Perfil", campos: ["id", "nome", "descricao"] },
    ],
  },
  {
    codigo: "F-ADMIN-086",
    nome: "Criar Usuário",
    descricao: "Cadastrar novo usuário no sistema com definição de perfil de acesso, dados pessoais e credenciais iniciais.",
    categoria: "Gestão de Usuários",
    criticidade: "Alta",
    regrasNegocio: [
      { codigo: "RN-086-01", descricao: "Email deve ser único em todo o sistema" },
      { codigo: "RN-086-02", descricao: "Senha inicial deve atender requisitos mínimos de segurança (8+ caracteres, maiúscula, número)" },
      { codigo: "RN-086-03", descricao: "Usuário deve redefinir senha no primeiro acesso" },
      { codigo: "RN-086-04", descricao: "Admin ISP só pode criar usuários com perfis de nível igual ou inferior ao seu" },
    ],
    permissoes: [
      { acao: "Criar qualquer usuário", perfis: ["Super Admin"] },
      { acao: "Criar usuários do ISP", perfis: ["Admin ISP"] },
      { acao: "Criar operadores", perfis: ["Gestor"] },
    ],
    entidades: [
      { nome: "Usuario", campos: ["id", "nome", "email", "telefone", "perfil_id", "isp_id", "status"] },
      { nome: "CredencialUsuario", campos: ["usuario_id", "senha_hash", "deve_redefinir", "criado_em"] },
    ],
  },
  {
    codigo: "F-ADMIN-087",
    nome: "Editar Usuário",
    descricao: "Alterar dados cadastrais, perfil de acesso e configurações de um usuário existente.",
    categoria: "Gestão de Usuários",
    criticidade: "Alta",
    regrasNegocio: [
      { codigo: "RN-087-01", descricao: "Email alterado requer confirmação via link enviado ao novo endereço" },
      { codigo: "RN-087-02", descricao: "Mudança de perfil deve registrar log de auditoria" },
      { codigo: "RN-087-03", descricao: "Usuário não pode editar seu próprio perfil de acesso" },
      { codigo: "RN-087-04", descricao: "Super Admin pode forçar redefinição de senha de qualquer usuário" },
    ],
    permissoes: [
      { acao: "Editar qualquer usuário", perfis: ["Super Admin"] },
      { acao: "Editar usuários do ISP", perfis: ["Admin ISP"] },
      { acao: "Editar dados básicos", perfis: ["Gestor"] },
    ],
    entidades: [
      { nome: "Usuario", campos: ["id", "nome", "email", "telefone", "perfil_id", "atualizado_em"] },
      { nome: "LogAuditoria", campos: ["usuario_id", "acao", "campo_alterado", "valor_anterior", "valor_novo"] },
    ],
  },
  {
    codigo: "F-ADMIN-088",
    nome: "Desativar Usuário",
    descricao: "Suspender ou desativar acesso de usuário ao sistema, mantendo histórico de ações.",
    categoria: "Gestão de Usuários",
    criticidade: "Alta",
    regrasNegocio: [
      { codigo: "RN-088-01", descricao: "Usuário desativado perde acesso imediato a todas as sessões ativas" },
      { codigo: "RN-088-02", descricao: "Não é permitido excluir usuário, apenas desativar (soft delete)" },
      { codigo: "RN-088-03", descricao: "Super Admin não pode ser desativado por outro usuário" },
      { codigo: "RN-088-04", descricao: "Desativação requer confirmação e registro de motivo" },
    ],
    permissoes: [
      { acao: "Desativar qualquer usuário", perfis: ["Super Admin"] },
      { acao: "Desativar usuários do ISP", perfis: ["Admin ISP"] },
      { acao: "Solicitar desativação", perfis: ["Gestor"] },
    ],
    entidades: [
      { nome: "Usuario", campos: ["id", "status", "desativado_em", "desativado_por", "motivo_desativacao"] },
      { nome: "SessaoUsuario", campos: ["usuario_id", "token", "encerrada_em"] },
    ],
  },
  // Perfis e Permissões
  {
    codigo: "F-ADMIN-089",
    nome: "Gerenciar Perfis Predefinidos",
    descricao: "Configurar e personalizar perfis de acesso predefinidos do sistema com conjunto de permissões padrão.",
    categoria: "Perfis e Permissões",
    criticidade: "Alta",
    regrasNegocio: [
      { codigo: "RN-089-01", descricao: "Perfis padrão do sistema (Super Admin, Admin ISP, Operador) não podem ser excluídos" },
      { codigo: "RN-089-02", descricao: "Novos perfis devem herdar de um perfil base existente" },
      { codigo: "RN-089-03", descricao: "Alteração em perfil afeta imediatamente todos os usuários vinculados" },
      { codigo: "RN-089-04", descricao: "Cada ISP pode criar até 10 perfis personalizados" },
    ],
    permissoes: [
      { acao: "Gerenciar perfis globais", perfis: ["Super Admin"] },
      { acao: "Criar perfis personalizados", perfis: ["Admin ISP"] },
      { acao: "Visualizar perfis", perfis: ["Gestor"] },
    ],
    entidades: [
      { nome: "Perfil", campos: ["id", "nome", "descricao", "perfil_base_id", "isp_id", "sistema"] },
      { nome: "PerfilPermissao", campos: ["perfil_id", "permissao_id", "concedida"] },
    ],
  },
  {
    codigo: "F-ADMIN-090",
    nome: "Configurar Permissões Granulares",
    descricao: "Definir permissões específicas por módulo, ação e recurso para controle fino de acesso.",
    categoria: "Perfis e Permissões",
    criticidade: "Alta",
    regrasNegocio: [
      { codigo: "RN-090-01", descricao: "Permissões são organizadas por módulo (Clientes, Financeiro, Suporte, etc.)" },
      { codigo: "RN-090-02", descricao: "Cada permissão define ações: visualizar, criar, editar, excluir" },
      { codigo: "RN-090-03", descricao: "Permissões podem ser concedidas ou negadas explicitamente" },
      { codigo: "RN-090-04", descricao: "Negação explícita prevalece sobre concessão herdada do perfil" },
    ],
    permissoes: [
      { acao: "Configurar todas as permissões", perfis: ["Super Admin"] },
      { acao: "Configurar permissões do ISP", perfis: ["Admin ISP"] },
    ],
    entidades: [
      { nome: "Permissao", campos: ["id", "modulo", "recurso", "acao", "descricao"] },
      { nome: "UsuarioPermissao", campos: ["usuario_id", "permissao_id", "concedida", "origem"] },
    ],
  },
  {
    codigo: "F-ADMIN-091",
    nome: "Auditoria de Acesso",
    descricao: "Registrar e consultar histórico completo de ações realizadas por usuários no sistema.",
    categoria: "Perfis e Permissões",
    criticidade: "Alta",
    regrasNegocio: [
      { codigo: "RN-091-01", descricao: "Todas as ações de escrita (criar, editar, excluir) são registradas automaticamente" },
      { codigo: "RN-091-02", descricao: "Logs de auditoria não podem ser editados ou excluídos" },
      { codigo: "RN-091-03", descricao: "Retenção mínima de logs: 2 anos para ações críticas" },
      { codigo: "RN-091-04", descricao: "Filtros disponíveis: usuário, período, módulo, tipo de ação" },
    ],
    permissoes: [
      { acao: "Visualizar auditoria global", perfis: ["Super Admin"] },
      { acao: "Visualizar auditoria do ISP", perfis: ["Admin ISP"] },
      { acao: "Exportar logs", perfis: ["Super Admin"] },
    ],
    entidades: [
      { nome: "LogAuditoria", campos: ["id", "usuario_id", "acao", "modulo", "recurso_id", "dados_anteriores", "dados_novos", "ip", "criado_em"] },
    ],
  },
  // Convites
  {
    codigo: "F-ADMIN-092",
    nome: "Enviar Convite por Email",
    descricao: "Enviar convite para novo usuário se cadastrar no sistema com perfil pré-definido.",
    categoria: "Convites",
    criticidade: "Alta",
    regrasNegocio: [
      { codigo: "RN-092-01", descricao: "Convite expira em 7 dias se não for aceito" },
      { codigo: "RN-092-02", descricao: "Email convidado não pode já existir no sistema" },
      { codigo: "RN-092-03", descricao: "Convite inclui link único de ativação com token seguro" },
      { codigo: "RN-092-04", descricao: "Máximo de 3 reenvios por convite antes de exigir novo convite" },
    ],
    permissoes: [
      { acao: "Enviar convites ilimitados", perfis: ["Super Admin"] },
      { acao: "Enviar convites para o ISP", perfis: ["Admin ISP"] },
      { acao: "Enviar convites para operadores", perfis: ["Gestor"] },
    ],
    entidades: [
      { nome: "Convite", campos: ["id", "email", "perfil_id", "isp_id", "token", "expira_em", "aceito_em", "enviado_por"] },
    ],
  },
  // Monitoramento
  {
    codigo: "F-ADMIN-093",
    nome: "Status Online da Equipe",
    descricao: "Visualizar em tempo real quais usuários estão online e sua última atividade.",
    categoria: "Monitoramento",
    criticidade: "Média",
    regrasNegocio: [
      { codigo: "RN-093-01", descricao: "Usuário considerado online se atividade nos últimos 5 minutos" },
      { codigo: "RN-093-02", descricao: "Status atualizado via heartbeat a cada 60 segundos" },
      { codigo: "RN-093-03", descricao: "Exibir módulo/tela atual do usuário quando disponível" },
      { codigo: "RN-093-04", descricao: "Indicador visual diferencia: online, ausente, offline" },
    ],
    permissoes: [
      { acao: "Visualizar status global", perfis: ["Super Admin"] },
      { acao: "Visualizar status do ISP", perfis: ["Admin ISP", "Gestor"] },
    ],
    entidades: [
      { nome: "SessaoUsuario", campos: ["usuario_id", "ultimo_heartbeat", "modulo_atual", "ip"] },
      { nome: "StatusUsuario", campos: ["usuario_id", "status", "atualizado_em"] },
    ],
  },
  {
    codigo: "F-ADMIN-094",
    nome: "Histórico de Sessões",
    descricao: "Consultar histórico de login/logout de usuários com detalhes de dispositivo e localização.",
    categoria: "Monitoramento",
    criticidade: "Alta",
    regrasNegocio: [
      { codigo: "RN-094-01", descricao: "Registrar IP, user-agent e geolocalização aproximada de cada login" },
      { codigo: "RN-094-02", descricao: "Identificar e alertar logins de novos dispositivos" },
      { codigo: "RN-094-03", descricao: "Permitir encerramento remoto de sessões ativas" },
      { codigo: "RN-094-04", descricao: "Retenção de histórico: 90 dias por padrão" },
    ],
    permissoes: [
      { acao: "Visualizar histórico global", perfis: ["Super Admin"] },
      { acao: "Visualizar histórico do ISP", perfis: ["Admin ISP"] },
      { acao: "Encerrar sessões remotamente", perfis: ["Super Admin", "Admin ISP"] },
    ],
    entidades: [
      { nome: "HistoricoSessao", campos: ["id", "usuario_id", "ip", "user_agent", "geolocalizacao", "login_em", "logout_em", "encerrado_por"] },
    ],
  },
  {
    codigo: "F-ADMIN-095",
    nome: "Notificações de Segurança",
    descricao: "Configurar e receber alertas sobre eventos de segurança relacionados à equipe.",
    categoria: "Monitoramento",
    criticidade: "Média",
    regrasNegocio: [
      { codigo: "RN-095-01", descricao: "Alertas obrigatórios: múltiplas tentativas de login falhadas, login de novo dispositivo" },
      { codigo: "RN-095-02", descricao: "Alertas configuráveis: alteração de permissões, desativação de usuário" },
      { codigo: "RN-095-03", descricao: "Notificações enviadas por email e in-app" },
      { codigo: "RN-095-04", descricao: "Admin pode definir destinatários adicionais para alertas críticos" },
    ],
    permissoes: [
      { acao: "Configurar alertas globais", perfis: ["Super Admin"] },
      { acao: "Configurar alertas do ISP", perfis: ["Admin ISP"] },
      { acao: "Receber notificações", perfis: ["Super Admin", "Admin ISP", "Gestor"] },
    ],
    entidades: [
      { nome: "ConfiguracaoAlerta", campos: ["id", "tipo_evento", "ativo", "destinatarios", "isp_id"] },
      { nome: "NotificacaoSeguranca", campos: ["id", "tipo", "usuario_afetado_id", "detalhes", "lida", "criado_em"] },
    ],
  },
];

const getCriticidadeBadge = (criticidade: Feature["criticidade"]) => {
  const styles = {
    Alta: "bg-red-500/10 text-red-500 border-red-500/20",
    Média: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    Baixa: "bg-green-500/10 text-green-500 border-green-500/20",
  };

  return (
    <Badge variant="outline" className={styles[criticidade]}>
      {criticidade}
    </Badge>
  );
};

const EquipeFeatures = () => {
  const categorias = [...new Set(equipeFeatures.map((f) => f.categoria))];

  return (
    <div className="space-y-6">
      {categorias.map((categoria) => (
        <div key={categoria}>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">{categoria}</h3>
          <Accordion type="single" collapsible className="space-y-2">
            {equipeFeatures
              .filter((f) => f.categoria === categoria)
              .map((feature) => (
                <AccordionItem
                  key={feature.codigo}
                  value={feature.codigo}
                  className="rounded-lg border border-border bg-background px-4"
                >
                  <AccordionTrigger className="py-3 hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
                        {feature.codigo}
                      </code>
                      <span className="font-medium text-foreground">{feature.nome}</span>
                      {getCriticidadeBadge(feature.criticidade)}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-4">
                      {/* Descrição */}
                      <p className="text-sm text-muted-foreground">{feature.descricao}</p>

                      {/* Regras de Negócio */}
                      <div>
                        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Regras de Negócio
                        </h4>
                        <div className="space-y-1">
                          {feature.regrasNegocio.map((rn) => (
                            <div key={rn.codigo} className="flex gap-2 text-sm">
                              <code className="shrink-0 text-xs text-muted-foreground">{rn.codigo}</code>
                              <span className="text-foreground">{rn.descricao}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Permissões */}
                      <div>
                        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Permissões
                        </h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="h-8 text-xs">Ação</TableHead>
                              <TableHead className="h-8 text-xs">Perfis</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {feature.permissoes.map((perm, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="py-2 text-sm">{perm.acao}</TableCell>
                                <TableCell className="py-2">
                                  <div className="flex flex-wrap gap-1">
                                    {perm.perfis.map((perfil) => (
                                      <Badge key={perfil} variant="secondary" className="text-xs">
                                        {perfil}
                                      </Badge>
                                    ))}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Entidades */}
                      <div>
                        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Entidades de Dados
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {feature.entidades.map((ent) => (
                            <div
                              key={ent.nome}
                              className="rounded-md border border-border bg-muted/50 px-2 py-1"
                            >
                              <span className="text-xs font-medium text-foreground">{ent.nome}</span>
                              <span className="ml-1 text-xs text-muted-foreground">
                                ({ent.campos.join(", ")})
                              </span>
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
      ))}
    </div>
  );
};

export default EquipeFeatures;

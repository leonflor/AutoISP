import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface RegraNegocio {
  codigo: string;
  descricao: string;
}

interface Permissao {
  perfil: string;
  acoes: string[];
}

interface Entidade {
  nome: string;
  atributos: string[];
}

interface Feature {
  codigo: string;
  nome: string;
  descricao: string;
  criticidade: "alta" | "media" | "baixa";
  categoria: string;
  regrasNegocio: RegraNegocio[];
  permissoes: Permissao[];
  entidades: Entidade[];
}

const configuracoesFeatures: Feature[] = [
  // Empresa/Provedor
  {
    codigo: "F-ADMIN-096",
    nome: "Gerenciar Dados Cadastrais",
    descricao: "Permite visualizar e editar os dados cadastrais da empresa/provedor no sistema.",
    criticidade: "alta",
    categoria: "Empresa/Provedor",
    regrasNegocio: [
      { codigo: "RN-096.1", descricao: "CNPJ deve ser válido e único no sistema" },
      { codigo: "RN-096.2", descricao: "Razão social e nome fantasia são obrigatórios" },
      { codigo: "RN-096.3", descricao: "Endereço completo deve ser validado via CEP" },
      { codigo: "RN-096.4", descricao: "Alterações devem ser registradas no histórico de auditoria" },
    ],
    permissoes: [
      { perfil: "Super Admin", acoes: ["visualizar", "editar"] },
      { perfil: "Admin", acoes: ["visualizar"] },
      { perfil: "Gerente", acoes: ["visualizar"] },
    ],
    entidades: [
      { nome: "Empresa", atributos: ["id", "cnpj", "razao_social", "nome_fantasia", "inscricao_estadual", "inscricao_municipal"] },
      { nome: "Endereco", atributos: ["id", "cep", "logradouro", "numero", "complemento", "bairro", "cidade", "uf"] },
    ],
  },
  {
    codigo: "F-ADMIN-097",
    nome: "Configurar Identidade Visual",
    descricao: "Permite personalizar a identidade visual do sistema com logo, cores e marca.",
    criticidade: "media",
    categoria: "Empresa/Provedor",
    regrasNegocio: [
      { codigo: "RN-097.1", descricao: "Logo deve ter formato PNG ou SVG com fundo transparente" },
      { codigo: "RN-097.2", descricao: "Cores primária e secundária devem ser definidas em hexadecimal" },
      { codigo: "RN-097.3", descricao: "Favicon deve ser gerado automaticamente a partir do logo" },
      { codigo: "RN-097.4", descricao: "Alterações visuais devem ser aplicadas em tempo real no preview" },
    ],
    permissoes: [
      { perfil: "Super Admin", acoes: ["visualizar", "editar"] },
      { perfil: "Admin", acoes: ["visualizar", "editar"] },
    ],
    entidades: [
      { nome: "IdentidadeVisual", atributos: ["id", "logo_url", "favicon_url", "cor_primaria", "cor_secundaria", "cor_acento"] },
    ],
  },
  {
    codigo: "F-ADMIN-098",
    nome: "Gerenciar Informações Fiscais",
    descricao: "Permite configurar informações fiscais para emissão de documentos e notas.",
    criticidade: "alta",
    categoria: "Empresa/Provedor",
    regrasNegocio: [
      { codigo: "RN-098.1", descricao: "Certificado digital A1 ou A3 deve estar válido e ativo" },
      { codigo: "RN-098.2", descricao: "Regime tributário deve ser selecionado corretamente" },
      { codigo: "RN-098.3", descricao: "CNAE principal e secundários devem ser informados" },
      { codigo: "RN-098.4", descricao: "Senha do certificado deve ser armazenada de forma criptografada" },
    ],
    permissoes: [
      { perfil: "Super Admin", acoes: ["visualizar", "editar", "upload_certificado"] },
      { perfil: "Admin", acoes: ["visualizar"] },
    ],
    entidades: [
      { nome: "ConfiguracaoFiscal", atributos: ["id", "regime_tributario", "cnae_principal", "cnaes_secundarios", "certificado_tipo"] },
      { nome: "CertificadoDigital", atributos: ["id", "tipo", "validade", "arquivo_hash", "senha_criptografada"] },
    ],
  },
  {
    codigo: "F-ADMIN-099",
    nome: "Gerenciar Termos e Contratos",
    descricao: "Permite criar e gerenciar modelos de termos de uso e contratos padrão.",
    criticidade: "alta",
    categoria: "Empresa/Provedor",
    regrasNegocio: [
      { codigo: "RN-099.1", descricao: "Termos de uso devem ter versão e data de vigência" },
      { codigo: "RN-099.2", descricao: "Contratos podem usar variáveis dinâmicas para personalização" },
      { codigo: "RN-099.3", descricao: "Histórico de versões anteriores deve ser mantido" },
      { codigo: "RN-099.4", descricao: "Novos termos devem exigir aceite dos clientes no próximo acesso" },
    ],
    permissoes: [
      { perfil: "Super Admin", acoes: ["visualizar", "criar", "editar", "publicar"] },
      { perfil: "Admin", acoes: ["visualizar", "criar", "editar"] },
      { perfil: "Jurídico", acoes: ["visualizar", "criar", "editar", "aprovar"] },
    ],
    entidades: [
      { nome: "TermoUso", atributos: ["id", "titulo", "conteudo", "versao", "data_vigencia", "ativo"] },
      { nome: "ModeloContrato", atributos: ["id", "nome", "conteudo_template", "variaveis", "versao"] },
    ],
  },
  // Integrações
  {
    codigo: "F-ADMIN-100",
    nome: "Configurar Gateway de Pagamento",
    descricao: "Permite configurar e gerenciar integrações com gateways de pagamento.",
    criticidade: "alta",
    categoria: "Integrações",
    regrasNegocio: [
      { codigo: "RN-100.1", descricao: "Credenciais de API devem ser validadas antes de salvar" },
      { codigo: "RN-100.2", descricao: "Ambiente sandbox e produção devem ser configuráveis separadamente" },
      { codigo: "RN-100.3", descricao: "Webhook URL deve ser gerado automaticamente para callbacks" },
      { codigo: "RN-100.4", descricao: "Somente um gateway pode estar ativo como principal por vez" },
    ],
    permissoes: [
      { perfil: "Super Admin", acoes: ["visualizar", "configurar", "testar", "ativar"] },
      { perfil: "Admin", acoes: ["visualizar"] },
    ],
    entidades: [
      { nome: "GatewayPagamento", atributos: ["id", "provedor", "ambiente", "api_key_hash", "webhook_url", "ativo", "principal"] },
    ],
  },
  {
    codigo: "F-ADMIN-101",
    nome: "Configurar Integração de Nota Fiscal",
    descricao: "Permite configurar integrações com sistemas de emissão de notas fiscais.",
    criticidade: "alta",
    categoria: "Integrações",
    regrasNegocio: [
      { codigo: "RN-101.1", descricao: "Token de API do emissor deve ser validado via teste de conexão" },
      { codigo: "RN-101.2", descricao: "Série e numeração inicial da NF devem ser configuráveis" },
      { codigo: "RN-101.3", descricao: "Ambiente de homologação deve estar disponível para testes" },
      { codigo: "RN-101.4", descricao: "Mapeamento de serviços para códigos fiscais deve ser configurável" },
    ],
    permissoes: [
      { perfil: "Super Admin", acoes: ["visualizar", "configurar", "testar"] },
      { perfil: "Admin", acoes: ["visualizar", "configurar"] },
      { perfil: "Financeiro", acoes: ["visualizar"] },
    ],
    entidades: [
      { nome: "IntegracaoNF", atributos: ["id", "provedor", "token_hash", "serie", "numero_atual", "ambiente"] },
      { nome: "MapeamentoFiscal", atributos: ["id", "servico_interno", "codigo_servico_nf", "aliquota"] },
    ],
  },
  {
    codigo: "F-ADMIN-102",
    nome: "Configurar WhatsApp/SMS",
    descricao: "Permite configurar integrações para envio de mensagens via WhatsApp e SMS.",
    criticidade: "media",
    categoria: "Integrações",
    regrasNegocio: [
      { codigo: "RN-102.1", descricao: "Número do WhatsApp Business deve ser verificado" },
      { codigo: "RN-102.2", descricao: "Templates de mensagem devem ser aprovados pela Meta" },
      { codigo: "RN-102.3", descricao: "Limite de mensagens por dia deve ser respeitado conforme plano" },
      { codigo: "RN-102.4", descricao: "Fallback para SMS deve ser configurável quando WhatsApp falhar" },
    ],
    permissoes: [
      { perfil: "Super Admin", acoes: ["visualizar", "configurar", "testar"] },
      { perfil: "Admin", acoes: ["visualizar", "configurar"] },
    ],
    entidades: [
      { nome: "IntegracaoWhatsApp", atributos: ["id", "numero", "token_hash", "verificado", "limite_diario"] },
      { nome: "IntegracaoSMS", atributos: ["id", "provedor", "api_key_hash", "remetente"] },
    ],
  },
  {
    codigo: "F-ADMIN-103",
    nome: "Configurar Sistemas Externos",
    descricao: "Permite configurar integrações com sistemas externos via API ou webhooks.",
    criticidade: "media",
    categoria: "Integrações",
    regrasNegocio: [
      { codigo: "RN-103.1", descricao: "Endpoints de integração devem suportar autenticação OAuth2 ou API Key" },
      { codigo: "RN-103.2", descricao: "Mapeamento de campos deve ser configurável para cada integração" },
      { codigo: "RN-103.3", descricao: "Logs de sincronização devem ser mantidos por 90 dias" },
      { codigo: "RN-103.4", descricao: "Retry automático deve ser configurável para falhas de conexão" },
    ],
    permissoes: [
      { perfil: "Super Admin", acoes: ["visualizar", "configurar", "testar", "excluir"] },
      { perfil: "Admin", acoes: ["visualizar", "configurar"] },
    ],
    entidades: [
      { nome: "IntegracaoExterna", atributos: ["id", "nome", "tipo", "endpoint", "auth_type", "credenciais_hash", "ativo"] },
      { nome: "LogIntegracao", atributos: ["id", "integracao_id", "direcao", "payload", "resposta", "status", "created_at"] },
    ],
  },
  // Personalização
  {
    codigo: "F-ADMIN-104",
    nome: "Gerenciar Notificações Automáticas",
    descricao: "Permite configurar regras e templates para notificações automáticas do sistema.",
    criticidade: "media",
    categoria: "Personalização",
    regrasNegocio: [
      { codigo: "RN-104.1", descricao: "Cada evento do sistema pode ter múltiplos canais de notificação" },
      { codigo: "RN-104.2", descricao: "Templates devem suportar variáveis dinâmicas com fallback" },
      { codigo: "RN-104.3", descricao: "Horários de envio devem respeitar configuração de janela permitida" },
      { codigo: "RN-104.4", descricao: "Frequência de notificações repetidas deve ser configurável" },
    ],
    permissoes: [
      { perfil: "Super Admin", acoes: ["visualizar", "configurar", "testar"] },
      { perfil: "Admin", acoes: ["visualizar", "configurar"] },
    ],
    entidades: [
      { nome: "RegraNotificacao", atributos: ["id", "evento", "canais", "template_id", "ativo", "janela_horario"] },
      { nome: "TemplateNotificacao", atributos: ["id", "nome", "assunto", "conteudo", "variaveis", "canal"] },
    ],
  },
  // Segurança/Backup
  {
    codigo: "F-ADMIN-105",
    nome: "Configurar Autenticação 2FA",
    descricao: "Permite configurar políticas de autenticação de dois fatores para usuários.",
    criticidade: "alta",
    categoria: "Segurança/Backup",
    regrasNegocio: [
      { codigo: "RN-105.1", descricao: "2FA pode ser obrigatório para perfis específicos" },
      { codigo: "RN-105.2", descricao: "Métodos suportados: TOTP (app), SMS e email" },
      { codigo: "RN-105.3", descricao: "Códigos de recuperação devem ser gerados e exibidos apenas uma vez" },
      { codigo: "RN-105.4", descricao: "Dispositivos confiáveis podem ser lembrados por período configurável" },
    ],
    permissoes: [
      { perfil: "Super Admin", acoes: ["visualizar", "configurar", "forcar_reset"] },
      { perfil: "Admin", acoes: ["visualizar"] },
    ],
    entidades: [
      { nome: "Politica2FA", atributos: ["id", "perfis_obrigatorios", "metodos_permitidos", "dias_dispositivo_confiavel"] },
      { nome: "Dispositivo2FA", atributos: ["id", "usuario_id", "metodo", "secret_hash", "verificado", "created_at"] },
    ],
  },
  {
    codigo: "F-ADMIN-106",
    nome: "Gerenciar Backup de Dados",
    descricao: "Permite configurar e gerenciar políticas de backup e restauração de dados.",
    criticidade: "alta",
    categoria: "Segurança/Backup",
    regrasNegocio: [
      { codigo: "RN-106.1", descricao: "Backups automáticos devem ocorrer diariamente no horário configurado" },
      { codigo: "RN-106.2", descricao: "Retenção de backups deve seguir política definida (7, 30, 90 dias)" },
      { codigo: "RN-106.3", descricao: "Download de backup deve requerer autenticação adicional" },
      { codigo: "RN-106.4", descricao: "Restauração deve ser feita apenas por Super Admin com confirmação" },
    ],
    permissoes: [
      { perfil: "Super Admin", acoes: ["visualizar", "configurar", "executar_backup", "restaurar", "download"] },
    ],
    entidades: [
      { nome: "PoliticaBackup", atributos: ["id", "frequencia", "horario", "retencao_dias", "destino"] },
      { nome: "Backup", atributos: ["id", "tipo", "tamanho_bytes", "arquivo_url", "status", "created_at", "expires_at"] },
    ],
  },
  {
    codigo: "F-ADMIN-107",
    nome: "Configurar Logs do Sistema",
    descricao: "Permite configurar e visualizar logs de auditoria e atividades do sistema.",
    criticidade: "media",
    categoria: "Segurança/Backup",
    regrasNegocio: [
      { codigo: "RN-107.1", descricao: "Logs devem registrar usuário, ação, recurso e timestamp" },
      { codigo: "RN-107.2", descricao: "Ações sensíveis devem capturar IP e user-agent" },
      { codigo: "RN-107.3", descricao: "Retenção de logs deve ser configurável (mínimo 90 dias)" },
      { codigo: "RN-107.4", descricao: "Exportação de logs deve estar disponível em CSV e JSON" },
    ],
    permissoes: [
      { perfil: "Super Admin", acoes: ["visualizar", "configurar", "exportar"] },
      { perfil: "Admin", acoes: ["visualizar"] },
    ],
    entidades: [
      { nome: "ConfiguracaoLog", atributos: ["id", "retencao_dias", "nivel_detalhe", "acoes_sensiveis"] },
      { nome: "LogAuditoria", atributos: ["id", "usuario_id", "acao", "recurso", "dados_antes", "dados_depois", "ip", "user_agent", "created_at"] },
    ],
  },
];

const getCriticidadeBadge = (criticidade: Feature["criticidade"]) => {
  const styles = {
    alta: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    media: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    baixa: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  };
  const labels = { alta: "Alta", media: "Média", baixa: "Baixa" };
  return <Badge className={styles[criticidade]}>{labels[criticidade]}</Badge>;
};

const ConfiguracoesFeatures = () => {
  const categorias = [...new Set(configuracoesFeatures.map((f) => f.categoria))];

  return (
    <div className="space-y-6">
      {categorias.map((categoria) => (
        <div key={categoria}>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {categoria}
          </h3>
          <Accordion type="multiple" className="space-y-2">
            {configuracoesFeatures
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
                      <p className="text-sm text-muted-foreground">{feature.descricao}</p>

                      <div>
                        <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                          Regras de Negócio
                        </h4>
                        <ul className="space-y-1">
                          {feature.regrasNegocio.map((rn) => (
                            <li key={rn.codigo} className="flex gap-2 text-sm">
                              <code className="shrink-0 text-xs text-primary">{rn.codigo}</code>
                              <span className="text-muted-foreground">{rn.descricao}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                          Permissões
                        </h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="h-8 text-xs">Perfil</TableHead>
                              <TableHead className="h-8 text-xs">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {feature.permissoes.map((perm) => (
                              <TableRow key={perm.perfil}>
                                <TableCell className="py-2 text-sm font-medium">
                                  {perm.perfil}
                                </TableCell>
                                <TableCell className="py-2">
                                  <div className="flex flex-wrap gap-1">
                                    {perm.acoes.map((acao) => (
                                      <Badge key={acao} variant="outline" className="text-xs">
                                        {acao}
                                      </Badge>
                                    ))}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      <div>
                        <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                          Entidades de Dados
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {feature.entidades.map((ent) => (
                            <div
                              key={ent.nome}
                              className="rounded-md border border-border bg-muted/50 px-3 py-2"
                            >
                              <p className="text-xs font-semibold text-foreground">{ent.nome}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {ent.atributos.join(", ")}
                              </p>
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

export default ConfiguracoesFeatures;

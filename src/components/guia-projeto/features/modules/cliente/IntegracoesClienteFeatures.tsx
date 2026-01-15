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

const integracoesClienteFeatures: Feature[] = [
  {
    codigo: "F-CLI-091",
    nome: "Configurar Integração com ERP",
    modulo: "Integrações",
    plataforma: "Painel Cliente",
    descricao: "Configura conexão com o ERP do ISP para sincronização de dados.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-350", descricao: "ERPs suportados: IXC, SGP, MK Solutions, outros via API" },
      { codigo: "RN-CLI-351", descricao: "Campos obrigatórios: URL API, token, tenant" },
      { codigo: "RN-CLI-352", descricao: "Validar credenciais antes de salvar" },
      { codigo: "RN-CLI-353", descricao: "Criptografar tokens armazenados" },
      { codigo: "RN-CLI-354", descricao: "Configurar frequência de sincronização" },
      { codigo: "RN-CLI-355", descricao: "Definir quais dados sincronizar" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: true, excluir: true },
      { perfil: "Operador", visualizar: false, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Integração ERP", campos: ["id", "tipo", "url_api", "token_encrypted", "config", "status"] },
    ],
  },
  {
    codigo: "F-CLI-092",
    nome: "Testar Conexão com ERP",
    modulo: "Integrações",
    plataforma: "Painel Cliente",
    descricao: "Executa teste de conectividade com o ERP configurado.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-356", descricao: "Testar autenticação e permissões" },
      { codigo: "RN-CLI-357", descricao: "Verificar endpoints necessários" },
      { codigo: "RN-CLI-358", descricao: "Exibir resultado detalhado do teste" },
      { codigo: "RN-CLI-359", descricao: "Sugerir correções em caso de falha" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: false, excluir: false },
      { perfil: "Operador", visualizar: false, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-093",
    nome: "Visualizar Status de Sincronização",
    modulo: "Integrações",
    plataforma: "Painel Cliente",
    descricao: "Exibe status atual e histórico das sincronizações com ERP.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-360", descricao: "Última sincronização: data, duração, registros" },
      { codigo: "RN-CLI-361", descricao: "Próxima sincronização agendada" },
      { codigo: "RN-CLI-362", descricao: "Histórico das últimas 50 sincronizações" },
      { codigo: "RN-CLI-363", descricao: "Alertar sobre falhas recentes" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Log Sincronização", campos: ["id", "integracao_id", "status", "registros", "duracao", "created_at"] },
    ],
  },
  {
    codigo: "F-CLI-094",
    nome: "Forçar Sincronização Manual",
    modulo: "Integrações",
    plataforma: "Painel Cliente",
    descricao: "Dispara sincronização imediata fora do agendamento regular.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-364", descricao: "Limite de 5 sincronizações manuais por hora" },
      { codigo: "RN-CLI-365", descricao: "Exibir progresso em tempo real" },
      { codigo: "RN-CLI-366", descricao: "Permitir sincronização parcial (apenas assinantes, etc)" },
      { codigo: "RN-CLI-367", descricao: "Registrar quem disparou a sincronização" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: false, excluir: false },
      { perfil: "Operador", visualizar: false, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-095",
    nome: "Configurar WhatsApp Business API",
    modulo: "Integrações",
    plataforma: "Painel Cliente",
    descricao: "Configura conexão com WhatsApp Business API para atendimento.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-368", descricao: "Suportar Meta Cloud API e BSPs" },
      { codigo: "RN-CLI-369", descricao: "Campos: phone_number_id, token, business_account_id" },
      { codigo: "RN-CLI-370", descricao: "Verificar webhook configurado corretamente" },
      { codigo: "RN-CLI-371", descricao: "Validar número verificado no WhatsApp" },
      { codigo: "RN-CLI-372", descricao: "Exibir QR code para conexão se BSP suportar" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: true, excluir: true },
      { perfil: "Operador", visualizar: false, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Integração WhatsApp", campos: ["id", "tipo", "phone_number_id", "token_encrypted", "status"] },
    ],
  },
  {
    codigo: "F-CLI-096",
    nome: "Verificar Status do WhatsApp",
    modulo: "Integrações",
    plataforma: "Painel Cliente",
    descricao: "Exibe status da conexão WhatsApp e métricas de uso.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-373", descricao: "Status: conectado, desconectado, limitado" },
      { codigo: "RN-CLI-374", descricao: "Qualidade do número (health status)" },
      { codigo: "RN-CLI-375", descricao: "Limite de mensagens e uso atual" },
      { codigo: "RN-CLI-376", descricao: "Alertar sobre risco de banimento" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-097",
    nome: "Configurar Integração de Monitoramento",
    modulo: "Integrações",
    plataforma: "Painel Cliente",
    descricao: "Configura conexão com sistema de monitoramento de rede.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-377", descricao: "Suportar: Zabbix, PRTG, LibreNMS, Nagios" },
      { codigo: "RN-CLI-378", descricao: "Configurar credenciais de API" },
      { codigo: "RN-CLI-379", descricao: "Mapear hosts/ativos para assinantes" },
      { codigo: "RN-CLI-380", descricao: "Definir quais métricas sincronizar" },
      { codigo: "RN-CLI-381", descricao: "Configurar frequência de polling" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: true, excluir: true },
      { perfil: "Operador", visualizar: false, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Integração Monitoramento", campos: ["id", "tipo", "url_api", "config", "status"] },
    ],
  },
  {
    codigo: "F-CLI-098",
    nome: "Testar Conexão de Monitoramento",
    modulo: "Integrações",
    plataforma: "Painel Cliente",
    descricao: "Valida conectividade com o sistema de monitoramento.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-382", descricao: "Verificar autenticação" },
      { codigo: "RN-CLI-383", descricao: "Listar hosts disponíveis" },
      { codigo: "RN-CLI-384", descricao: "Testar obtenção de métricas" },
      { codigo: "RN-CLI-385", descricao: "Exibir diagnóstico de problemas" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: false, excluir: false },
      { perfil: "Operador", visualizar: false, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-099",
    nome: "Configurar Webhooks de Saída",
    modulo: "Integrações",
    plataforma: "Painel Cliente",
    descricao: "Configura webhooks para notificar sistemas externos sobre eventos.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-386", descricao: "Eventos: novo atendimento, escalação, fechamento" },
      { codigo: "RN-CLI-387", descricao: "Configurar URL destino e headers" },
      { codigo: "RN-CLI-388", descricao: "Definir payload (JSON template)" },
      { codigo: "RN-CLI-389", descricao: "Configurar retries e timeout" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: true, excluir: true },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Webhook", campos: ["id", "evento", "url", "headers", "payload_template", "status"] },
    ],
  },
  {
    codigo: "F-CLI-100",
    nome: "Listar Webhooks Configurados",
    modulo: "Integrações",
    plataforma: "Painel Cliente",
    descricao: "Exibe todos os webhooks de saída configurados.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-390", descricao: "Exibir evento, URL e status de cada webhook" },
      { codigo: "RN-CLI-391", descricao: "Indicar taxa de sucesso de entrega" },
      { codigo: "RN-CLI-392", descricao: "Permitir ativar/desativar rapidamente" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: true, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-101",
    nome: "Visualizar Logs de Webhook",
    modulo: "Integrações",
    plataforma: "Painel Cliente",
    descricao: "Exibe histórico de chamadas de um webhook específico.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-393", descricao: "Listar últimas 100 chamadas" },
      { codigo: "RN-CLI-394", descricao: "Exibir request, response e status" },
      { codigo: "RN-CLI-395", descricao: "Permitir reenvio manual de falhas" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Webhook Log", campos: ["id", "webhook_id", "request", "response", "status_code", "created_at"] },
    ],
  },
  {
    codigo: "F-CLI-102",
    nome: "Configurar API Keys",
    modulo: "Integrações",
    plataforma: "Painel Cliente",
    descricao: "Gera e gerencia API keys para acesso externo aos dados.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-396", descricao: "Gerar chaves com escopos específicos" },
      { codigo: "RN-CLI-397", descricao: "Definir data de expiração opcional" },
      { codigo: "RN-CLI-398", descricao: "Exibir chave apenas uma vez na criação" },
      { codigo: "RN-CLI-399", descricao: "Log de uso de cada API key" },
      { codigo: "RN-CLI-400", descricao: "Permitir revogação imediata" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: true, excluir: true },
      { perfil: "Operador", visualizar: false, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "API Key", campos: ["id", "nome", "key_prefix", "escopos", "expires_at", "last_used_at"] },
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

const IntegracoesClienteFeatures = () => {
  return (
    <div className="space-y-4">
      <Accordion type="multiple" className="space-y-2">
        {integracoesClienteFeatures.map((feature) => (
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

export default IntegracoesClienteFeatures;

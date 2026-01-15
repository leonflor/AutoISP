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

const configuracoesClienteFeatures: Feature[] = [
  {
    codigo: "F-CLI-083",
    nome: "Configurar Dados da Empresa",
    modulo: "Configurações",
    plataforma: "Painel Cliente",
    descricao: "Permite editar informações cadastrais do ISP cliente.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-325", descricao: "Campos: razão social, CNPJ, endereço, telefone" },
      { codigo: "RN-CLI-326", descricao: "CNPJ não pode ser alterado após cadastro inicial" },
      { codigo: "RN-CLI-327", descricao: "Dados aparecem em comunicações e relatórios" },
      { codigo: "RN-CLI-328", descricao: "Validar formato de telefone e email" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: true, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Empresa", campos: ["id", "razao_social", "cnpj", "endereco", "telefone", "email"] },
    ],
  },
  {
    codigo: "F-CLI-084",
    nome: "Configurar Logo e Cores do Sistema",
    modulo: "Configurações",
    plataforma: "Painel Cliente",
    descricao: "Permite personalizar a identidade visual do painel.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-329", descricao: "Upload de logo em PNG ou SVG, máximo 500KB" },
      { codigo: "RN-CLI-330", descricao: "Cores primária e secundária em hexadecimal" },
      { codigo: "RN-CLI-331", descricao: "Preview em tempo real das alterações" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: true, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Branding", campos: ["id", "logo_url", "cor_primaria", "cor_secundaria"] },
    ],
  },
  {
    codigo: "F-CLI-085",
    nome: "Configurar Horário de Atendimento",
    modulo: "Configurações",
    plataforma: "Painel Cliente",
    descricao: "Define horário de funcionamento do atendimento do ISP.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-332", descricao: "Configurar por dia da semana" },
      { codigo: "RN-CLI-333", descricao: "Permitir múltiplos turnos por dia" },
      { codigo: "RN-CLI-334", descricao: "Usado pelo agente IA para mensagens fora do horário" },
      { codigo: "RN-CLI-335", descricao: "Feriados podem ser adicionados" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: true, excluir: true },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Horário Atendimento", campos: ["id", "dia_semana", "hora_inicio", "hora_fim"] },
    ],
  },
  {
    codigo: "F-CLI-086",
    nome: "Configurar Mensagens Padrão",
    modulo: "Configurações",
    plataforma: "Painel Cliente",
    descricao: "Define mensagens automáticas para situações específicas.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-336", descricao: "Mensagens: boas-vindas, fora de horário, fila de espera" },
      { codigo: "RN-CLI-337", descricao: "Suportar variáveis dinâmicas" },
      { codigo: "RN-CLI-338", descricao: "Preview da mensagem formatada" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: true, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Mensagem Padrão", campos: ["id", "tipo", "conteudo", "variaveis"] },
    ],
  },
  {
    codigo: "F-CLI-087",
    nome: "Configurar Timezone",
    modulo: "Configurações",
    plataforma: "Painel Cliente",
    descricao: "Define o fuso horário utilizado em todo o sistema.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-339", descricao: "Padrão: America/Sao_Paulo" },
      { codigo: "RN-CLI-340", descricao: "Afeta horários exibidos e agendamentos" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: true, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-088",
    nome: "Configurar Notificações do Sistema",
    modulo: "Configurações",
    plataforma: "Painel Cliente",
    descricao: "Define quais notificações o ISP deseja receber e por qual canal.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-341", descricao: "Tipos: alertas de monitoramento, novos atendimentos, relatórios" },
      { codigo: "RN-CLI-342", descricao: "Canais: email, WhatsApp, push browser" },
      { codigo: "RN-CLI-343", descricao: "Configurável por tipo de notificação" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: true, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Preferência Notificação", campos: ["id", "tipo", "canal", "ativo"] },
    ],
  },
  {
    codigo: "F-CLI-089",
    nome: "Visualizar Informações da Conta/Plano",
    modulo: "Configurações",
    plataforma: "Painel Cliente",
    descricao: "Exibe detalhes do plano contratado e uso atual.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-344", descricao: "Exibir plano atual, data de renovação, valor" },
      { codigo: "RN-CLI-345", descricao: "Mostrar limites e uso atual (usuários, agentes, etc)" },
      { codigo: "RN-CLI-346", descricao: "Histórico de faturas disponível" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: false, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Assinatura", campos: ["id", "plano", "valor", "data_inicio", "data_renovacao", "status"] },
    ],
  },
  {
    codigo: "F-CLI-090",
    nome: "Solicitar Upgrade de Plano",
    modulo: "Configurações",
    plataforma: "Painel Cliente",
    descricao: "Permite solicitar upgrade para um plano superior.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-347", descricao: "Exibir comparativo de planos disponíveis" },
      { codigo: "RN-CLI-348", descricao: "Calcular valor pro-rata para upgrade imediato" },
      { codigo: "RN-CLI-349", descricao: "Solicita aprovação da equipe AutoISP" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: false, excluir: false },
      { perfil: "Operador", visualizar: false, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Solicitação Upgrade", campos: ["id", "plano_atual", "plano_novo", "status", "created_at"] },
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

const ConfiguracoesClienteFeatures = () => {
  return (
    <div className="space-y-4">
      <Accordion type="multiple" className="space-y-2">
        {configuracoesClienteFeatures.map((feature) => (
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

export default ConfiguracoesClienteFeatures;

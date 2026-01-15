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

const assinantesClienteFeatures: Feature[] = [
  {
    codigo: "F-CLI-021",
    nome: "Listar Assinantes Sincronizados",
    modulo: "Assinantes",
    plataforma: "Painel Cliente",
    descricao: "Exibe lista de todos os assinantes sincronizados do ERP do ISP cliente.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-075", descricao: "Dados são sincronizados periodicamente do ERP" },
      { codigo: "RN-CLI-076", descricao: "Exibir data da última sincronização" },
      { codigo: "RN-CLI-077", descricao: "Lista paginada com 50 itens por página" },
      { codigo: "RN-CLI-078", descricao: "Ordenação padrão alfabética por nome" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Assinante", campos: ["id", "id_erp", "nome", "cpf", "status", "plano", "synced_at"] },
    ],
  },
  {
    codigo: "F-CLI-022",
    nome: "Buscar Assinante por Nome/CPF/Contrato",
    modulo: "Assinantes",
    plataforma: "Painel Cliente",
    descricao: "Permite busca rápida de assinantes por diferentes critérios.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-079", descricao: "Busca deve suportar pesquisa parcial" },
      { codigo: "RN-CLI-080", descricao: "CPF pode ser buscado com ou sem formatação" },
      { codigo: "RN-CLI-081", descricao: "Resultado deve aparecer em tempo real (debounce 300ms)" },
      { codigo: "RN-CLI-082", descricao: "Exibir até 10 sugestões durante digitação" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-023",
    nome: "Visualizar Detalhes do Assinante",
    modulo: "Assinantes",
    plataforma: "Painel Cliente",
    descricao: "Exibe página completa com todas as informações do assinante.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-083", descricao: "Dados pessoais: nome, CPF, RG, email, telefones" },
      { codigo: "RN-CLI-084", descricao: "Dados do contrato: plano, valor, vencimento, status" },
      { codigo: "RN-CLI-085", descricao: "Endereço completo com coordenadas se disponível" },
      { codigo: "RN-CLI-086", descricao: "Indicador visual do status (ativo, suspenso, cancelado)" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Assinante", campos: ["id", "nome", "cpf", "email", "telefone", "endereco", "plano", "status"] },
    ],
  },
  {
    codigo: "F-CLI-024",
    nome: "Visualizar Histórico de Atendimentos do Assinante",
    modulo: "Assinantes",
    plataforma: "Painel Cliente",
    descricao: "Lista todos os atendimentos anteriores do assinante.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-087", descricao: "Ordenação por data decrescente" },
      { codigo: "RN-CLI-088", descricao: "Exibir resumo: data, canal, status, duração" },
      { codigo: "RN-CLI-089", descricao: "Permitir abrir detalhes do atendimento" },
      { codigo: "RN-CLI-090", descricao: "Indicar atendimentos resolvidos por IA vs humano" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Atendimento", campos: ["id", "assinante_id", "canal", "status", "resolved_by", "created_at"] },
    ],
  },
  {
    codigo: "F-CLI-025",
    nome: "Visualizar Histórico de Comunicações",
    modulo: "Assinantes",
    plataforma: "Painel Cliente",
    descricao: "Exibe histórico de comunicações ativas enviadas ao assinante (campanhas, gatilhos).",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-091", descricao: "Listar campanhas e gatilhos que atingiram o assinante" },
      { codigo: "RN-CLI-092", descricao: "Exibir data de envio e status de entrega" },
      { codigo: "RN-CLI-093", descricao: "Permitir visualizar conteúdo da mensagem enviada" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Comunicação Enviada", campos: ["id", "assinante_id", "tipo", "template", "status", "sent_at"] },
    ],
  },
  {
    codigo: "F-CLI-026",
    nome: "Visualizar Status Financeiro do Assinante",
    modulo: "Assinantes",
    plataforma: "Painel Cliente",
    descricao: "Exibe situação financeira do assinante, incluindo faturas e débitos.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-094", descricao: "Dados são sincronizados do ERP" },
      { codigo: "RN-CLI-095", descricao: "Exibir últimas 12 faturas com status" },
      { codigo: "RN-CLI-096", descricao: "Destacar faturas vencidas ou em atraso" },
      { codigo: "RN-CLI-097", descricao: "Mostrar valor total em aberto" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Fatura", campos: ["id_erp", "assinante_id", "valor", "vencimento", "status", "pago_em"] },
    ],
  },
  {
    codigo: "F-CLI-027",
    nome: "Visualizar Equipamentos do Assinante",
    modulo: "Assinantes",
    plataforma: "Painel Cliente",
    descricao: "Lista equipamentos (ONUs, roteadores) vinculados ao assinante.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-098", descricao: "Dados sincronizados do sistema de monitoramento" },
      { codigo: "RN-CLI-099", descricao: "Exibir modelo, MAC, IP, status online/offline" },
      { codigo: "RN-CLI-100", descricao: "Indicar último sinal e tempo online" },
      { codigo: "RN-CLI-101", descricao: "Link para ações de monitoramento do equipamento" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Equipamento", campos: ["id", "assinante_id", "tipo", "modelo", "mac", "ip", "status"] },
    ],
  },
  {
    codigo: "F-CLI-028",
    nome: "Filtrar Assinantes por Status/Plano",
    modulo: "Assinantes",
    plataforma: "Painel Cliente",
    descricao: "Permite filtrar a lista de assinantes por diferentes critérios.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-102", descricao: "Status disponíveis: ativo, suspenso, cancelado, inadimplente" },
      { codigo: "RN-CLI-103", descricao: "Planos carregados dinamicamente do ERP" },
      { codigo: "RN-CLI-104", descricao: "Filtros podem ser combinados" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-029",
    nome: "Exportar Lista de Assinantes",
    modulo: "Assinantes",
    plataforma: "Painel Cliente",
    descricao: "Permite exportar a lista de assinantes filtrada em formato Excel ou CSV.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-105", descricao: "Exportação respeita filtros aplicados" },
      { codigo: "RN-CLI-106", descricao: "Limite de 10.000 registros por exportação" },
      { codigo: "RN-CLI-107", descricao: "Registrar log da exportação com usuário e data" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: false, excluir: false },
      { perfil: "Operador", visualizar: false, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-030",
    nome: "Visualizar Timeline do Assinante",
    modulo: "Assinantes",
    plataforma: "Painel Cliente",
    descricao: "Exibe linha do tempo unificada com eventos importantes do assinante.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-108", descricao: "Eventos: atendimentos, comunicações, alterações de status, OS" },
      { codigo: "RN-CLI-109", descricao: "Ordenação cronológica reversa" },
      { codigo: "RN-CLI-110", descricao: "Cada evento com ícone e cor distintivos por tipo" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Evento Assinante", campos: ["id", "assinante_id", "tipo", "descricao", "created_at"] },
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

const AssinantesClienteFeatures = () => {
  return (
    <div className="space-y-4">
      <Accordion type="multiple" className="space-y-2">
        {assinantesClienteFeatures.map((feature) => (
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

export default AssinantesClienteFeatures;

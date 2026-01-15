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
  tipo: string;
}

interface Permissao {
  role: string;
  acoes: string;
}

interface Entidade {
  tabela: string;
  campos: string;
  operacoes: string;
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

const planosFeatures: Feature[] = [
  {
    codigo: "F-ADMIN-024",
    nome: "Listar Planos",
    modulo: "Planos",
    plataforma: "Painel Admin",
    descricao: "Exibe listagem de todos os planos com: Nome, Valor mensal, Status (ativo/arquivado), Quantidade de assinantes e indicador de destaque.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F024-01", descricao: "Ordenação padrão: planos ativos primeiro, depois por nome", tipo: "Comportamento" },
      { codigo: "RN-F024-02", descricao: "Exibir badge 'Destaque' no plano marcado como destaque", tipo: "UX" },
      { codigo: "RN-F024-03", descricao: "Planos arquivados exibidos em seção separada ou filtro", tipo: "Comportamento" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Acesso total à listagem" },
      { role: "Roles com permissão de planos", acoes: "Visualizar listagem" },
    ],
    entidades: [
      { tabela: "plano", campos: "id, nome, valor, status, destaque, created_at", operacoes: "SELECT" },
      { tabela: "assinatura", campos: "plano_id", operacoes: "SELECT (count)" },
    ],
  },
  {
    codigo: "F-ADMIN-025",
    nome: "Criar Plano",
    modulo: "Planos",
    plataforma: "Painel Admin",
    descricao: "Permite criar novo plano com nome, valor, período (mensal), limites de recursos, agentes de IA liberados, configuração de trial e promoções.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F025-01", descricao: "Campos obrigatórios: nome, valor, período", tipo: "Validação" },
      { codigo: "RN-F025-02", descricao: "Nome do plano deve ser único", tipo: "Validação" },
      { codigo: "RN-F025-03", descricao: "Valor deve ser maior que zero", tipo: "Validação" },
      { codigo: "RN-F025-04", descricao: "Plano criado inicia como 'Ativo'", tipo: "Comportamento" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Criar plano" },
      { role: "Roles com permissão de planos (escrita)", acoes: "Criar plano" },
    ],
    entidades: [
      { tabela: "plano", campos: "todos os campos", operacoes: "INSERT" },
      { tabela: "plano_limite", campos: "plano_id, recurso, valor, tipo_limite", operacoes: "INSERT" },
      { tabela: "plano_agente", campos: "plano_id, agente_id", operacoes: "INSERT" },
    ],
  },
  {
    codigo: "F-ADMIN-026",
    nome: "Editar Plano",
    modulo: "Planos",
    plataforma: "Painel Admin",
    descricao: "Permite alterar dados do plano. Alterações de preço ou limites são registradas no histórico com operador e data.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F026-01", descricao: "Alteração de preço registrada no log com valor anterior/novo", tipo: "Auditoria" },
      { codigo: "RN-F026-02", descricao: "Alteração de limites notifica ISPs afetados (opcional)", tipo: "Comportamento" },
      { codigo: "RN-F026-03", descricao: "Não permite alterar período de planos com assinantes", tipo: "Validação" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Editar qualquer campo" },
      { role: "Roles com permissão de planos (escrita)", acoes: "Editar plano" },
    ],
    entidades: [
      { tabela: "plano", campos: "nome, valor, descricao, limites", operacoes: "UPDATE" },
      { tabela: "historico_plano", campos: "plano_id, campo, valor_anterior, valor_novo, operador_id", operacoes: "INSERT" },
    ],
  },
  {
    codigo: "F-ADMIN-027",
    nome: "Arquivar Plano",
    modulo: "Planos",
    plataforma: "Painel Admin",
    descricao: "Arquiva plano, ocultando para novas vendas mas mantendo assinantes atuais com suas condições.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-F027-01", descricao: "Assinantes atuais mantêm plano e condições", tipo: "Comportamento" },
      { codigo: "RN-F027-02", descricao: "Plano não aparece na landing page ou checkout", tipo: "Comportamento" },
      { codigo: "RN-F027-03", descricao: "Possibilidade de desarquivar plano", tipo: "Comportamento" },
      { codigo: "RN-F027-04", descricao: "Requer confirmação antes de arquivar", tipo: "Validação" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Arquivar/desarquivar plano" },
    ],
    entidades: [
      { tabela: "plano", campos: "status, arquivado_em, arquivado_por", operacoes: "UPDATE" },
    ],
  },
  {
    codigo: "F-ADMIN-028",
    nome: "Duplicar Plano",
    modulo: "Planos",
    plataforma: "Painel Admin",
    descricao: "Cria cópia de um plano existente para criar variações rapidamente, com nome sugerido '(cópia)'.",
    criticidade: "baixa",
    regrasNegocio: [
      { codigo: "RN-F028-01", descricao: "Plano duplicado inicia como rascunho/inativo", tipo: "Comportamento" },
      { codigo: "RN-F028-02", descricao: "Copiar todos os limites e configurações", tipo: "Comportamento" },
      { codigo: "RN-F028-03", descricao: "Nome sugerido: '[Nome original] (cópia)'", tipo: "UX" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Duplicar plano" },
      { role: "Roles com permissão de planos (escrita)", acoes: "Duplicar plano" },
    ],
    entidades: [
      { tabela: "plano", campos: "todos os campos", operacoes: "INSERT" },
      { tabela: "plano_limite", campos: "plano_id, recurso, valor", operacoes: "INSERT" },
      { tabela: "plano_agente", campos: "plano_id, agente_id", operacoes: "INSERT" },
    ],
  },
  {
    codigo: "F-ADMIN-029",
    nome: "Definir Plano Destaque",
    modulo: "Planos",
    plataforma: "Painel Admin",
    descricao: "Marca um plano como 'destaque/recomendado' para exibição destacada na landing page.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-F029-01", descricao: "Apenas um plano pode ser destaque por vez", tipo: "Validação" },
      { codigo: "RN-F029-02", descricao: "Exibir badge 'Recomendado' na landing", tipo: "UX" },
      { codigo: "RN-F029-03", descricao: "Destaque pode ser removido a qualquer momento", tipo: "Comportamento" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Definir/remover destaque" },
    ],
    entidades: [
      { tabela: "plano", campos: "destaque", operacoes: "UPDATE" },
    ],
  },
  {
    codigo: "F-ADMIN-030",
    nome: "Configurar Trial do Plano",
    modulo: "Planos",
    plataforma: "Painel Admin",
    descricao: "Define quantidade de dias de trial (ex: 7, 14, 30 dias) disponível para cada plano.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-F030-01", descricao: "Trial pode ser 0 (sem trial) ou N dias", tipo: "Comportamento" },
      { codigo: "RN-F030-02", descricao: "Trial padrão configurável no sistema", tipo: "Comportamento" },
      { codigo: "RN-F030-03", descricao: "Período de trial exibido na landing page", tipo: "UX" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Configurar trial" },
      { role: "Roles com permissão de planos (escrita)", acoes: "Configurar trial" },
    ],
    entidades: [
      { tabela: "plano", campos: "dias_trial", operacoes: "UPDATE" },
      { tabela: "configuracao_sistema", campos: "trial_padrao", operacoes: "SELECT" },
    ],
  },
  {
    codigo: "F-ADMIN-031",
    nome: "Configurar Limites do Plano",
    modulo: "Planos",
    plataforma: "Painel Admin",
    descricao: "Define limites de recursos: máx. assinantes do ISP, limite de uso de IA (tokens) e tipo de limite (hard/soft/cobrança).",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F031-01", descricao: "Hard limit: bloqueia recurso ao atingir", tipo: "Definição" },
      { codigo: "RN-F031-02", descricao: "Soft limit: alerta mas permite continuar", tipo: "Definição" },
      { codigo: "RN-F031-03", descricao: "Cobrança por excedente: cobra adicional", tipo: "Definição" },
      { codigo: "RN-F031-04", descricao: "Tipo de limite configurável por recurso", tipo: "Comportamento" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Configurar todos os limites" },
      { role: "Roles com permissão de planos (escrita)", acoes: "Configurar limites" },
    ],
    entidades: [
      { tabela: "plano_limite", campos: "plano_id, recurso, valor, tipo_limite, valor_excedente", operacoes: "INSERT, UPDATE, DELETE" },
    ],
  },
  {
    codigo: "F-ADMIN-032",
    nome: "Gerenciar Agentes de IA por Plano",
    modulo: "Planos",
    plataforma: "Painel Admin",
    descricao: "Vincula quais agentes de IA estão disponíveis para cada plano. Agentes são cadastrados dinamicamente.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F032-01", descricao: "Checkbox para selecionar agentes liberados", tipo: "UX" },
      { codigo: "RN-F032-02", descricao: "Plano pode ter 0 ou mais agentes", tipo: "Comportamento" },
      { codigo: "RN-F032-03", descricao: "Alteração reflete imediatamente para assinantes", tipo: "Comportamento" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Gerenciar agentes do plano" },
      { role: "Roles com permissão de planos (escrita)", acoes: "Gerenciar agentes" },
    ],
    entidades: [
      { tabela: "plano_agente", campos: "plano_id, agente_id", operacoes: "INSERT, DELETE" },
      { tabela: "agente_ia", campos: "id, nome", operacoes: "SELECT" },
    ],
  },
  {
    codigo: "F-ADMIN-033",
    nome: "Cadastrar Tipos de Agentes de IA",
    modulo: "Planos",
    plataforma: "Painel Admin",
    descricao: "CRUD de tipos de agentes de IA disponíveis no sistema (Atendente, Cobrador, Vendedor, etc.) com nome, descrição e custo.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F033-01", descricao: "Cada agente tem: nome, descrição, custo estimado", tipo: "Dados" },
      { codigo: "RN-F033-02", descricao: "Agentes podem ser desativados", tipo: "Comportamento" },
      { codigo: "RN-F033-03", descricao: "Custo usado para cálculo de uso de IA", tipo: "Cálculo" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "CRUD completo de agentes" },
    ],
    entidades: [
      { tabela: "agente_ia", campos: "id, nome, descricao, custo_token, ativo, created_at", operacoes: "SELECT, INSERT, UPDATE" },
    ],
  },
  {
    codigo: "F-ADMIN-034",
    nome: "Configurar Promoções do Plano",
    modulo: "Planos",
    plataforma: "Painel Admin",
    descricao: "Define desconto por período (ex: 20% nos 3 primeiros meses) ou preço de entrada para novos clientes.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-F034-01", descricao: "Desconto por período: % ou valor fixo por X meses", tipo: "Comportamento" },
      { codigo: "RN-F034-02", descricao: "Preço de entrada válido apenas para novos clientes", tipo: "Validação" },
      { codigo: "RN-F034-03", descricao: "Após período promocional, valor cheio é cobrado", tipo: "Comportamento" },
      { codigo: "RN-F034-04", descricao: "Exibir 'de X por Y' na landing quando houver promoção", tipo: "UX" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Configurar promoções" },
      { role: "Roles com permissão financeira", acoes: "Configurar promoções" },
    ],
    entidades: [
      { tabela: "plano_promocao", campos: "plano_id, tipo, valor, duracao_meses, valido_ate", operacoes: "INSERT, UPDATE, DELETE" },
    ],
  },
  {
    codigo: "F-ADMIN-035",
    nome: "Visualizar Histórico de Alterações do Plano",
    modulo: "Planos",
    plataforma: "Painel Admin",
    descricao: "Exibe log completo de alterações do plano: quem alterou, quando e o quê (preço, limites, configurações).",
    criticidade: "baixa",
    regrasNegocio: [
      { codigo: "RN-F035-01", descricao: "Log ordenado do mais recente para mais antigo", tipo: "Comportamento" },
      { codigo: "RN-F035-02", descricao: "Cada registro: campo alterado, valor anterior, valor novo, operador, data", tipo: "Dados" },
      { codigo: "RN-F035-03", descricao: "Paginação de 25 registros por página", tipo: "Limite" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Visualizar histórico completo" },
      { role: "Roles com permissão de auditoria", acoes: "Visualizar histórico" },
    ],
    entidades: [
      { tabela: "historico_plano", campos: "id, plano_id, campo, valor_anterior, valor_novo, operador_id, created_at", operacoes: "SELECT" },
      { tabela: "usuario", campos: "id, nome", operacoes: "SELECT (join)" },
    ],
  },
];

const getCriticidadeBadge = (criticidade: Feature["criticidade"]) => {
  const variants = {
    alta: "bg-red-500/10 text-red-600 border-red-500/20",
    media: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    baixa: "bg-green-500/10 text-green-600 border-green-500/20",
  };
  const labels = {
    alta: "Alta",
    media: "Média",
    baixa: "Baixa",
  };
  return (
    <Badge variant="outline" className={variants[criticidade]}>
      {labels[criticidade]}
    </Badge>
  );
};

const PlanosFeatures = () => {
  return (
    <div className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          12 features documentadas para o módulo Planos
        </p>
      </div>

      <Accordion type="single" collapsible className="space-y-3">
        {planosFeatures.map((feature) => (
          <AccordionItem
            key={feature.codigo}
            value={feature.codigo}
            className="rounded-lg border border-border bg-background px-4"
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex flex-1 items-center gap-3 text-left">
                <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
                  {feature.codigo}
                </code>
                <span className="font-medium text-foreground">{feature.nome}</span>
                {getCriticidadeBadge(feature.criticidade)}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6 pt-2">
                {/* Descrição */}
                <div>
                  <h4 className="mb-2 text-sm font-medium text-foreground">Descrição</h4>
                  <p className="text-sm text-muted-foreground">{feature.descricao}</p>
                </div>

                {/* Regras de Negócio */}
                <div>
                  <h4 className="mb-2 text-sm font-medium text-foreground">Regras de Negócio</h4>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-[120px]">Código</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead className="w-[120px]">Tipo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {feature.regrasNegocio.map((rn) => (
                          <TableRow key={rn.codigo}>
                            <TableCell className="font-mono text-xs">{rn.codigo}</TableCell>
                            <TableCell className="text-sm">{rn.descricao}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">
                                {rn.tipo}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Permissões */}
                <div>
                  <h4 className="mb-2 text-sm font-medium text-foreground">Permissões</h4>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-[250px]">Role</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {feature.permissoes.map((perm, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{perm.role}</TableCell>
                            <TableCell className="text-sm">{perm.acoes}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Entidades */}
                <div>
                  <h4 className="mb-2 text-sm font-medium text-foreground">Dados/Entidades</h4>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-[180px]">Tabela</TableHead>
                          <TableHead>Campos</TableHead>
                          <TableHead className="w-[120px]">Operações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {feature.entidades.map((ent, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-mono text-xs">{ent.tabela}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{ent.campos}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {ent.operacoes}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default PlanosFeatures;

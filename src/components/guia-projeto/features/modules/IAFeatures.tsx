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

const iaFeatures: Feature[] = [
  {
    codigo: "F-ADMIN-108",
    nome: "Listar Templates de Agentes de IA",
    modulo: "IA",
    plataforma: "Painel Admin",
    descricao: "Exibe tabela com todos os templates de agentes de IA cadastrados no sistema, incluindo nome, tipo, scope (tenant/platform), status e ações. Permite filtrar por tipo e status.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F108-01", descricao: "Templates com scope 'tenant' são disponibilizados para ISPs ativarem", tipo: "Comportamento" },
      { codigo: "RN-F108-02", descricao: "Templates com scope 'platform' são de uso interno do SaaS", tipo: "Comportamento" },
      { codigo: "RN-F108-03", descricao: "Ordenação padrão por sort_order, depois por nome", tipo: "Comportamento" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Visualizar, criar, editar, duplicar, ativar/desativar" },
    ],
    entidades: [
      { tabela: "ai_agents", campos: "id, name, slug, type, scope, is_active, sort_order", operacoes: "SELECT" },
    ],
  },
  {
    codigo: "F-ADMIN-109",
    nome: "Criar Template de Agente",
    modulo: "IA",
    plataforma: "Painel Admin",
    descricao: "Permite criar um novo template de agente de IA com configurações de nome, tipo, scope, system prompt, modelo, temperatura e tokens máximos. Inclui abas para configurações básicas, IA, features e status.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F109-01", descricao: "Slug é gerado automaticamente a partir do nome", tipo: "Geração" },
      { codigo: "RN-F109-02", descricao: "System prompt é obrigatório para agentes ativos", tipo: "Validação" },
      { codigo: "RN-F109-03", descricao: "Temperatura padrão: 0.7, Max Tokens padrão: 1000", tipo: "Default" },
      { codigo: "RN-F109-04", descricao: "Feature tags definem capacidades do agente", tipo: "Comportamento" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Criar templates de agentes" },
    ],
    entidades: [
      { tabela: "ai_agents", campos: "name, slug, type, scope, system_prompt, model, temperature, max_tokens, feature_tags, is_active", operacoes: "INSERT" },
    ],
  },
  {
    codigo: "F-ADMIN-110",
    nome: "Editar Template de Agente",
    modulo: "IA",
    plataforma: "Painel Admin",
    descricao: "Permite editar configurações de um template de agente existente. Alterações afetam novos agentes ativados por ISPs, mas não alteram agentes já ativos.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F110-01", descricao: "Alterações não afetam agentes já ativados por ISPs", tipo: "Comportamento" },
      { codigo: "RN-F110-02", descricao: "Histórico de alterações é registrado em audit_logs", tipo: "Auditoria" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Editar templates de agentes" },
    ],
    entidades: [
      { tabela: "ai_agents", campos: "name, slug, type, scope, system_prompt, model, temperature, max_tokens, feature_tags, is_active", operacoes: "UPDATE" },
      { tabela: "audit_logs", campos: "action, entity_type, entity_id, old_data, new_data", operacoes: "INSERT" },
    ],
  },
  {
    codigo: "F-ADMIN-111",
    nome: "Duplicar Template de Agente",
    modulo: "IA",
    plataforma: "Painel Admin",
    descricao: "Cria uma cópia de um template existente com nome modificado (sufixo 'Cópia'). Útil para criar variações de agentes sem reconfigurar do zero.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-F111-01", descricao: "Nome do clone: '{nome_original} (Cópia)'", tipo: "Geração" },
      { codigo: "RN-F111-02", descricao: "Slug é regenerado automaticamente", tipo: "Geração" },
      { codigo: "RN-F111-03", descricao: "Clone inicia com is_active = false", tipo: "Default" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Duplicar templates de agentes" },
    ],
    entidades: [
      { tabela: "ai_agents", campos: "*", operacoes: "SELECT, INSERT" },
    ],
  },
  {
    codigo: "F-ADMIN-112",
    nome: "Ativar/Desativar Template",
    modulo: "IA",
    plataforma: "Painel Admin",
    descricao: "Toggle para ativar ou desativar um template de agente. Templates desativados não aparecem no catálogo de agentes para ISPs.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-F112-01", descricao: "Template desativado não aparece no catálogo para ISPs", tipo: "Comportamento" },
      { codigo: "RN-F112-02", descricao: "ISPs com agente já ativo não são afetados imediatamente", tipo: "Comportamento" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Ativar/desativar templates" },
    ],
    entidades: [
      { tabela: "ai_agents", campos: "is_active", operacoes: "UPDATE" },
    ],
  },
  {
    codigo: "F-ADMIN-113",
    nome: "Gerenciar Cláusulas de Segurança LGPD",
    modulo: "IA",
    plataforma: "Painel Admin",
    descricao: "Visualiza e gerencia cláusulas de segurança obrigatórias que são injetadas nos prompts de todos os agentes de IA. Garante conformidade LGPD e políticas de privacidade.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F113-01", descricao: "Cláusulas ativas são injetadas em todos os agentes", tipo: "Comportamento" },
      { codigo: "RN-F113-02", descricao: "Campo 'applies_to' define escopo: all, tenant, platform", tipo: "Configuração" },
      { codigo: "RN-F113-03", descricao: "Ordenação por sort_order determina ordem de injeção", tipo: "Comportamento" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Gerenciar cláusulas de segurança" },
    ],
    entidades: [
      { tabela: "ai_security_clauses", campos: "id, name, content, applies_to, is_active, sort_order", operacoes: "SELECT" },
    ],
  },
  {
    codigo: "F-ADMIN-114",
    nome: "Criar Cláusula de Segurança",
    modulo: "IA",
    plataforma: "Painel Admin",
    descricao: "Adiciona nova cláusula de segurança que será incluída nos system prompts dos agentes. Permite definir nome, conteúdo, escopo de aplicação e ordem.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F114-01", descricao: "Conteúdo da cláusula é texto markdown", tipo: "Formato" },
      { codigo: "RN-F114-02", descricao: "Nova cláusula inicia como inativa por segurança", tipo: "Default" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Criar cláusulas de segurança" },
    ],
    entidades: [
      { tabela: "ai_security_clauses", campos: "name, content, applies_to, is_active, sort_order", operacoes: "INSERT" },
    ],
  },
  {
    codigo: "F-ADMIN-115",
    nome: "Editar Cláusula de Segurança",
    modulo: "IA",
    plataforma: "Painel Admin",
    descricao: "Edita uma cláusula de segurança existente. Alterações são aplicadas imediatamente em novas interações com agentes.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F115-01", descricao: "Alterações são aplicadas em tempo real", tipo: "Comportamento" },
      { codigo: "RN-F115-02", descricao: "Histórico mantido em audit_logs", tipo: "Auditoria" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Editar cláusulas de segurança" },
    ],
    entidades: [
      { tabela: "ai_security_clauses", campos: "name, content, applies_to, is_active, sort_order", operacoes: "UPDATE" },
      { tabela: "audit_logs", campos: "action, entity_type, entity_id, old_data, new_data", operacoes: "INSERT" },
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

const IAFeatures = () => {
  return (
    <div className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          8 features documentadas para o módulo de Inteligência Artificial
        </p>
      </div>

      <Accordion type="single" collapsible className="space-y-3">
        {iaFeatures.map((feature) => (
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

export default IAFeatures;

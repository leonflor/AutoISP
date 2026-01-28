
# Fase 2: UI Admin para Gestão de Agentes IA e Cláusulas LGPD

## Objetivo
Criar as páginas e componentes do painel administrativo para gerenciar templates de agentes de IA e cláusulas de segurança LGPD, seguindo os padrões existentes no projeto.

---

## Arquivos a Criar

### 1. Hooks de Dados

#### `src/hooks/admin/useAiAgentTemplates.ts`
Hook para CRUD completo de templates de agentes:
- Query para listar todos os agentes (com filtro por scope)
- Mutation para criar agente
- Mutation para atualizar agente
- Mutation para deletar agente
- Suporte a filtros (scope, is_active, is_premium)

#### `src/hooks/admin/useAiSecurityClauses.ts`
Hook para CRUD de cláusulas de segurança:
- Query para listar cláusulas ordenadas por sort_order
- Mutation para criar cláusula
- Mutation para atualizar cláusula
- Mutation para deletar cláusula

---

### 2. Páginas Admin

#### `src/pages/admin/AiAgents.tsx`
Página principal com abas:
- **Templates ISP** (scope='tenant'): Agentes que ISPs podem ativar
- **Agentes Plataforma** (scope='platform'): Agentes internos do SaaS

Funcionalidades:
- Listagem em cards ou tabela
- Botão "Novo Agente"
- Filtros: tipo, status, premium
- Ações: editar, duplicar, excluir

#### `src/pages/admin/AiSecurity.tsx`
Página para gestão de cláusulas LGPD:
- Tabela com nome, aplica-se a, status, ordem
- Botão "Nova Cláusula"
- Reordenação via drag-and-drop ou botões
- Preview do texto com placeholders destacados

---

### 3. Componentes

#### `src/components/admin/ai-agents/AgentTemplateTable.tsx`
Tabela de listagem de agentes com:
- Colunas: Avatar, Nome, Tipo, Modelo, Escopo, Premium, Status, Ações
- Loading skeleton
- Empty state
- Dialog de confirmação para exclusão

#### `src/components/admin/ai-agents/AgentTemplateForm.tsx`
Dialog/Sheet com formulário completo:

| Seção | Campos |
|-------|--------|
| Básico | Nome, Slug (auto-gerado), Descrição, Tipo (select), Avatar URL |
| Escopo | Scope (tenant/platform), Para platform: allowed_data_access |
| Configuração IA | Modelo (select), Temperatura (slider 0-2), Max Tokens (input) |
| Prompt | System Prompt (textarea grande com dicas de formatação) |
| Features | Tags pré-definidas (checkboxes) + Lista dinâmica de features customizadas |
| Base de Conhecimento | Toggle "Usa Base de Conhecimento" |
| Status | Ativo (switch), Premium (switch), Ordem (number) |

#### `src/components/admin/ai-agents/FeatureTagsSelector.tsx`
Componente para seleção de tags predefinidas:
- Tags disponíveis: "Responde dúvidas", "Consulta faturas", "Abre chamados", "Verifica status conexão", "Negocia débitos", "Registra promessas", "Apresenta planos", "Realiza upgrades", "Diagnóstico técnico", "Escala para humano"
- Checkboxes com ícones
- Badge counter de selecionados

#### `src/components/admin/ai-security/SecurityClauseTable.tsx`
Tabela de cláusulas com:
- Colunas: Ordem, Nome, Aplica-se a, Status, Ações
- Badges coloridas por tipo (all/tenant/platform)
- Botões para mover ordem (cima/baixo)

#### `src/components/admin/ai-security/SecurityClauseForm.tsx`
Dialog com formulário:
- Nome da cláusula
- Conteúdo (textarea grande com syntax highlighting para placeholders)
- Aplica-se a (select: Todos, Apenas Tenant, Apenas Platform)
- Ativo (switch)
- Ordem de injeção (number)
- Preview com placeholders substituídos por exemplo

---

## Arquivos a Modificar

### `src/App.tsx`
Adicionar rotas:
```tsx
<Route path="ai-agents" element={<AiAgentsPage />} />
<Route path="ai-security" element={<AiSecurityPage />} />
```

### `src/components/admin/AdminSidebar.tsx`
Adicionar item de menu "IA" com submenu:
- "Templates de Agentes" -> /admin/ai-agents
- "Cláusulas LGPD" -> /admin/ai-security

Localização: Após "Suporte" e antes de "Relatórios"

---

## Constantes e Tipos

### Tags de Features Predefinidas
```typescript
export const AGENT_FEATURE_TAGS = [
  { id: 'responde_duvidas', label: 'Responde dúvidas', icon: MessageCircle },
  { id: 'consulta_faturas', label: 'Consulta faturas', icon: FileText },
  { id: 'abre_chamados', label: 'Abre chamados', icon: Ticket },
  { id: 'verifica_conexao', label: 'Verifica status conexão', icon: Wifi },
  { id: 'negocia_debitos', label: 'Negocia débitos', icon: DollarSign },
  { id: 'registra_promessas', label: 'Registra promessas', icon: Calendar },
  { id: 'apresenta_planos', label: 'Apresenta planos', icon: Package },
  { id: 'realiza_upgrades', label: 'Realiza upgrades', icon: TrendingUp },
  { id: 'diagnostico_tecnico', label: 'Diagnóstico técnico', icon: Wrench },
  { id: 'escala_humano', label: 'Escala para humano', icon: UserPlus },
] as const;
```

### Modelos de IA Disponíveis
```typescript
export const AI_MODELS = [
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini (rápido e econômico)' },
  { value: 'gpt-4o', label: 'GPT-4o (mais capaz)' },
  { value: 'gemini-flash', label: 'Gemini Flash (muito rápido)' },
  { value: 'gemini-pro', label: 'Gemini Pro (avançado)' },
  { value: 'claude-sonnet', label: 'Claude Sonnet (análise)' },
] as const;
```

### Placeholders de Segurança
```typescript
export const SECURITY_PLACEHOLDERS = [
  { placeholder: '{ISP_NAME}', description: 'Nome do provedor (ISP)' },
  { placeholder: '{ISP_ID}', description: 'ID único do provedor' },
  { placeholder: '{USER_NAME}', description: 'Nome do usuário logado' },
  { placeholder: '{AGENT_NAME}', description: 'Nome do agente' },
  { placeholder: '{CURRENT_DATE}', description: 'Data atual' },
] as const;
```

---

## Fluxo de Implementação

### Passo 1: Criar hooks de dados
1. `useAiAgentTemplates.ts` com queries e mutations
2. `useAiSecurityClauses.ts` com queries e mutations

### Passo 2: Criar componentes de UI
1. `FeatureTagsSelector.tsx`
2. `AgentTemplateTable.tsx`
3. `AgentTemplateForm.tsx`
4. `SecurityClauseTable.tsx`
5. `SecurityClauseForm.tsx`

### Passo 3: Criar páginas
1. `AiAgents.tsx` com tabs e integração
2. `AiSecurity.tsx` com tabela e formulário

### Passo 4: Integrar ao layout
1. Atualizar `AdminSidebar.tsx` com novo menu
2. Atualizar `App.tsx` com novas rotas

---

## Validações e Regras de Negócio

### Agentes
- Slug deve ser único
- System prompt é obrigatório
- Temperatura: 0.0 a 2.0 (padrão 0.7)
- Max tokens: 100 a 4000 (padrão 1000)
- Agentes scope='platform' não podem ter uses_knowledge_base=true

### Cláusulas de Segurança
- Nome é obrigatório (mínimo 3 caracteres)
- Conteúdo é obrigatório (mínimo 50 caracteres)
- Não permitir excluir cláusulas padrão do sistema (as 3 iniciais)
- Alertar ao desativar cláusula que afeta todos os agentes

---

## Detalhes Técnicos

### Esquema Zod para AgentForm
```typescript
const agentSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  type: z.enum(['atendente', 'cobrador', 'vendedor', 'analista', 'suporte']),
  scope: z.enum(['tenant', 'platform']).default('tenant'),
  model: z.string().default('gpt-4o-mini'),
  temperature: z.coerce.number().min(0).max(2).default(0.7),
  max_tokens: z.coerce.number().min(100).max(4000).default(1000),
  system_prompt: z.string().min(10, 'Prompt é obrigatório'),
  avatar_url: z.string().url().optional().or(z.literal('')),
  feature_tags: z.array(z.string()).default([]),
  feature_custom: z.array(z.string()).default([]),
  uses_knowledge_base: z.boolean().default(false),
  is_active: z.boolean().default(true),
  is_premium: z.boolean().default(false),
  sort_order: z.coerce.number().default(0),
  allowed_data_access: z.array(z.string()).default([]),
});
```

### Esquema Zod para SecurityClauseForm
```typescript
const clauseSchema = z.object({
  name: z.string().min(3, 'Nome é obrigatório'),
  content: z.string().min(50, 'Conteúdo deve ter pelo menos 50 caracteres'),
  applies_to: z.enum(['all', 'tenant', 'platform']).default('all'),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().default(0),
});
```

---

## Resumo de Arquivos

| Tipo | Arquivo | Descrição |
|------|---------|-----------|
| Hook | `src/hooks/admin/useAiAgentTemplates.ts` | CRUD de templates de agentes |
| Hook | `src/hooks/admin/useAiSecurityClauses.ts` | CRUD de cláusulas LGPD |
| Página | `src/pages/admin/AiAgents.tsx` | Gestão de templates de IA |
| Página | `src/pages/admin/AiSecurity.tsx` | Gestão de cláusulas LGPD |
| Componente | `src/components/admin/ai-agents/AgentTemplateTable.tsx` | Tabela de agentes |
| Componente | `src/components/admin/ai-agents/AgentTemplateForm.tsx` | Formulário de agente |
| Componente | `src/components/admin/ai-agents/FeatureTagsSelector.tsx` | Seletor de tags |
| Componente | `src/components/admin/ai-security/SecurityClauseTable.tsx` | Tabela de cláusulas |
| Componente | `src/components/admin/ai-security/SecurityClauseForm.tsx` | Formulário de cláusula |
| Modificar | `src/App.tsx` | Adicionar rotas |
| Modificar | `src/components/admin/AdminSidebar.tsx` | Adicionar menu IA |

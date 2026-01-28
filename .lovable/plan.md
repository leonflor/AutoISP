
# Fase 3: Refatorar Painel ISP para Ativação de Agentes e Base de Conhecimento

## Objetivo

Refatorar o painel do ISP para que os provedores possam:
1. **Visualizar catálogo de agentes** disponíveis (scope='tenant')
2. **Ativar agentes** do catálogo, personalizando nome/avatar/prompt
3. **Gerenciar base de conhecimento Q&A** para agentes que suportam
4. **Usar chat com agentes ativados** (refatorar para usar `isp_agents`)

---

## Arquitetura Atual vs Nova

### Fluxo Atual (Incorreto)
```text
ISP usa ai_agents diretamente → Sem personalização
                              → Sem knowledge base
                              → Sem controle de ativação por ISP
```

### Novo Fluxo (Correto)
```text
┌─────────────────────────────────────────────────────────────────┐
│  CATÁLOGO (ai_agents scope='tenant')                            │
│  Templates disponíveis para ISPs ativarem                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ ISP ativa
┌─────────────────────────────────────────────────────────────────┐
│  ISP AGENTS (isp_agents)                                        │
│  ├── display_name (nome customizado)                            │
│  ├── avatar_url (avatar customizado)                            │
│  ├── additional_prompt (instruções extras)                      │
│  └── is_enabled (ativo/inativo)                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ Se uses_knowledge_base=true
┌─────────────────────────────────────────────────────────────────┐
│  KNOWLEDGE BASE (agent_knowledge_base)                          │
│  Q&A específico do ISP para este agente                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Arquivos a Criar

### 1. Hooks de Dados

#### `src/hooks/painel/useIspAgents.ts`
Hook para gerenciar agentes ativados pelo ISP:
- Query para listar agentes ativados (join com ai_agents)
- Mutation para ativar agente (criar em isp_agents)
- Mutation para atualizar configuração
- Mutation para desativar agente
- Query para listar catálogo disponível (ai_agents scope='tenant' + ai_limits)

#### `src/hooks/painel/useAgentKnowledge.ts`
Hook para CRUD da base de conhecimento:
- Query para listar Q&A de um agente
- Mutation para criar Q&A
- Mutation para atualizar Q&A
- Mutation para deletar Q&A
- Suporte a filtros por categoria

---

### 2. Componentes do Painel

#### `src/components/painel/ai/AgentCatalogCard.tsx`
Card para exibir agente do catálogo:
- Avatar e nome do template
- Descrição e tipo
- Features/tags do agente
- Badge "Premium" se aplicável
- Badge "Base de Conhecimento" se suporta
- Botão "Ativar" ou "Já Ativado"

#### `src/components/painel/ai/ActiveAgentCard.tsx`
Card para agente já ativado pelo ISP:
- Avatar customizado (ou do template)
- Nome de exibição customizado
- Status ativo/inativo
- Contador de Q&A na base de conhecimento
- Botões: Configurar, Chat, Base de Conhecimento

#### `src/components/painel/ai/AgentActivationDialog.tsx`
Dialog para ativar um agente do catálogo:
- Nome de exibição (pré-preenchido do template)
- Avatar URL (opcional)
- Instruções adicionais (textarea)
- Preview do prompt final (template + adicional)
- Botões: Cancelar, Ativar

#### `src/components/painel/ai/AgentConfigDialog.tsx`
Dialog para editar configuração de agente ativo:
- Mesmos campos do ActivationDialog
- Toggle para ativar/desativar
- Botão para desativar permanentemente (com confirmação)

#### `src/components/painel/ai/KnowledgeBaseTable.tsx`
Tabela de Q&A com:
- Colunas: Pergunta, Categoria, Status, Ações
- Busca por texto
- Filtro por categoria
- Loading skeleton
- Empty state

#### `src/components/painel/ai/KnowledgeBaseForm.tsx`
Dialog para criar/editar Q&A:
- Pergunta (textarea)
- Resposta (textarea com suporte a markdown)
- Categoria (input com autocomplete das existentes)
- Ativo (switch)
- Ordem (número)

#### `src/components/painel/ai/KnowledgeBaseImport.tsx`
Dialog para importação em massa:
- Upload de arquivo CSV
- Mapeamento de colunas (pergunta, resposta, categoria)
- Preview dos dados antes de importar
- Progress bar durante importação

---

### 3. Páginas

#### Refatorar `src/pages/painel/AiAgents.tsx`
Nova estrutura com tabs:
- **Meus Agentes**: Agentes ativados pelo ISP (cards)
- **Catálogo**: Templates disponíveis para ativar (cards)

Funcionalidades:
- Contador "X de Y agentes ativos" (baseado em ai_limits.max_agents_active)
- Stats de uso de tokens agregado

#### Criar `src/pages/painel/AiAgentKnowledge.tsx`
Página de gestão de base de conhecimento:
- Header com nome do agente
- Botão "Nova Pergunta"
- Botão "Importar CSV"
- Tabela de Q&A
- Stats: total de perguntas, por categoria

---

## Arquivos a Modificar

### `src/App.tsx`
Adicionar rota para knowledge base:
```tsx
<Route path="agentes/:agentId/conhecimento" element={<PainelAgentKnowledge />} />
```

### `src/components/painel/PainelSidebar.tsx`
Manter como está (já tem "Agentes IA" apontando para /painel/agentes)

### `src/pages/painel/AiChat.tsx`
Modificar para usar `isp_agents` em vez de `ai_agents`:
- Dropdown mostra apenas agentes ativados pelo ISP (isp_agents)
- Usa display_name e avatar_url do isp_agent
- Passa isp_agent_id para a Edge Function

---

## Fluxo de Dados

### Listagem de Catálogo
```typescript
// 1. Buscar todos os templates ativos para tenant
const { data: templates } = await supabase
  .from("ai_agents")
  .select("*")
  .eq("scope", "tenant")
  .eq("is_active", true);

// 2. Buscar limites do plano do ISP
const { data: limits } = await supabase
  .from("ai_limits")
  .select("*, plans!inner(id)")
  .eq("plans.id", ispPlanId);

// 3. Buscar agentes já ativados pelo ISP
const { data: activeAgents } = await supabase
  .from("isp_agents")
  .select("agent_id")
  .eq("isp_id", ispId);

// 4. Combinar para mostrar disponibilidade
```

### Ativação de Agente
```typescript
const { data: newIspAgent } = await supabase
  .from("isp_agents")
  .insert({
    isp_id: ispId,
    agent_id: templateId,
    display_name: formData.displayName || template.name,
    avatar_url: formData.avatarUrl,
    additional_prompt: formData.additionalPrompt,
    is_enabled: true
  })
  .select()
  .single();
```

### Uso no Chat
```typescript
// Buscar agente ativado com dados do template
const { data: ispAgent } = await supabase
  .from("isp_agents")
  .select(`
    *,
    ai_agents (
      name,
      description,
      type,
      model,
      temperature,
      max_tokens,
      system_prompt,
      uses_knowledge_base
    )
  `)
  .eq("isp_id", ispId)
  .eq("is_enabled", true);
```

---

## Resumo de Arquivos

| Tipo | Arquivo | Descrição |
|------|---------|-----------|
| Hook | `src/hooks/painel/useIspAgents.ts` | CRUD de agentes ativados + catálogo |
| Hook | `src/hooks/painel/useAgentKnowledge.ts` | CRUD de base de conhecimento |
| Componente | `src/components/painel/ai/AgentCatalogCard.tsx` | Card de template do catálogo |
| Componente | `src/components/painel/ai/ActiveAgentCard.tsx` | Card de agente ativado |
| Componente | `src/components/painel/ai/AgentActivationDialog.tsx` | Dialog de ativação |
| Componente | `src/components/painel/ai/AgentConfigDialog.tsx` | Dialog de configuração |
| Componente | `src/components/painel/ai/KnowledgeBaseTable.tsx` | Tabela de Q&A |
| Componente | `src/components/painel/ai/KnowledgeBaseForm.tsx` | Form de Q&A |
| Componente | `src/components/painel/ai/KnowledgeBaseImport.tsx` | Importação CSV |
| Página | `src/pages/painel/AiAgentKnowledge.tsx` | Gestão de knowledge base |
| Modificar | `src/pages/painel/AiAgents.tsx` | Refatorar com tabs e nova arquitetura |
| Modificar | `src/pages/painel/AiChat.tsx` | Usar isp_agents em vez de ai_agents |
| Modificar | `src/App.tsx` | Nova rota para knowledge base |

---

## Seção Técnica

### Tipos TypeScript

```typescript
// types/isp-agents.ts
export interface IspAgentWithTemplate {
  id: string;
  isp_id: string;
  agent_id: string;
  display_name: string | null;
  avatar_url: string | null;
  additional_prompt: string | null;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
  ai_agents: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    type: string;
    model: string;
    temperature: number;
    max_tokens: number;
    system_prompt: string;
    uses_knowledge_base: boolean;
    feature_tags: string[];
    is_premium: boolean;
  };
  knowledge_count?: number;
}

export interface AgentActivationForm {
  display_name: string;
  avatar_url?: string;
  additional_prompt?: string;
}

export interface KnowledgeBaseItem {
  id: string;
  isp_agent_id: string;
  question: string;
  answer: string;
  category: string | null;
  sort_order: number;
  is_active: boolean;
}
```

### Hook useIspAgents

```typescript
export function useIspAgents() {
  const { membership } = useIspMembership();
  const queryClient = useQueryClient();

  // Agentes ativados pelo ISP
  const activeAgentsQuery = useQuery({
    queryKey: ["isp-agents", membership?.ispId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("isp_agents")
        .select(`
          *,
          ai_agents!inner (
            id, name, slug, description, type, model,
            temperature, max_tokens, system_prompt,
            uses_knowledge_base, feature_tags, is_premium, avatar_url
          )
        `)
        .eq("isp_id", membership!.ispId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Adicionar contagem de knowledge base para cada agente
      const withCounts = await Promise.all(data.map(async (agent) => {
        const { count } = await supabase
          .from("agent_knowledge_base")
          .select("*", { count: "exact", head: true })
          .eq("isp_agent_id", agent.id);
        return { ...agent, knowledge_count: count || 0 };
      }));
      
      return withCounts;
    },
    enabled: !!membership?.ispId,
  });

  // Catálogo de templates disponíveis
  const catalogQuery = useQuery({
    queryKey: ["agent-catalog", membership?.ispId],
    queryFn: async () => {
      // Buscar templates scope='tenant' ativos
      const { data: templates } = await supabase
        .from("ai_agents")
        .select("*")
        .eq("scope", "tenant")
        .eq("is_active", true)
        .order("sort_order");

      // Buscar limites do plano (via subscription)
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("plan_id")
        .eq("isp_id", membership!.ispId)
        .single();

      let limits: any[] = [];
      let maxAgentsActive = 3; // default
      
      if (subscription?.plan_id) {
        const { data: limitsData } = await supabase
          .from("ai_limits")
          .select("*")
          .eq("plan_id", subscription.plan_id);
        limits = limitsData || [];
        maxAgentsActive = limits[0]?.max_agents_active || 3;
      }

      // Marcar disponibilidade
      return {
        templates: templates?.map(t => ({
          ...t,
          isAvailable: !t.is_premium || limits.some(l => l.agent_id === t.id && l.is_enabled),
        })) || [],
        maxAgentsActive,
      };
    },
    enabled: !!membership?.ispId,
  });

  // Mutations
  const activateAgent = useMutation({
    mutationFn: async (data: { agentId: string; form: AgentActivationForm }) => {
      const { data: result, error } = await supabase
        .from("isp_agents")
        .insert({
          isp_id: membership!.ispId,
          agent_id: data.agentId,
          display_name: data.form.display_name,
          avatar_url: data.form.avatar_url || null,
          additional_prompt: data.form.additional_prompt || null,
          is_enabled: true,
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isp-agents"] });
      toast({ title: "Agente ativado com sucesso!" });
    },
  });

  const updateAgent = useMutation({ /* ... */ });
  const deactivateAgent = useMutation({ /* ... */ });

  return {
    activeAgents: activeAgentsQuery.data,
    catalog: catalogQuery.data,
    isLoading: activeAgentsQuery.isLoading || catalogQuery.isLoading,
    activateAgent,
    updateAgent,
    deactivateAgent,
  };
}
```

### Validações

**Ativação de Agente:**
- Verificar se não excede max_agents_active
- Verificar se agente não já está ativado (unique constraint)
- Verificar se agente está disponível no plano

**Base de Conhecimento:**
- Pergunta: mínimo 10 caracteres
- Resposta: mínimo 20 caracteres
- Categoria: opcional, max 50 caracteres
- Limite de 500 Q&As por agente (soft limit no frontend)

### Fluxo de Implementação

1. **Criar hooks** (`useIspAgents.ts`, `useAgentKnowledge.ts`)
2. **Criar componentes de cards** (AgentCatalogCard, ActiveAgentCard)
3. **Criar dialogs** (ActivationDialog, ConfigDialog)
4. **Criar componentes de KB** (KnowledgeBaseTable, KnowledgeBaseForm)
5. **Refatorar página AiAgents.tsx** com nova estrutura
6. **Criar página AiAgentKnowledge.tsx**
7. **Atualizar AiChat.tsx** para usar isp_agents
8. **Adicionar rota** em App.tsx

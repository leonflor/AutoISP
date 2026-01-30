
# Implementar Alertas de Desativacao de Templates de IA

## Objetivo

Adicionar duas melhorias para alertar sobre o impacto da desativacao de templates:

1. **Admin**: Confirmacao com contagem de ISPs afetados ao desativar template
2. **ISP**: Alerta visual no card quando template pai esta inativo

---

## Cenario 1: Admin Desativa Template

Quando um superadmin tenta salvar um template com `is_active = false` e existem ISPs utilizando:

```text
+-----------------------------------------------------------+
|  Confirmar Desativacao                                     |
+-----------------------------------------------------------+
|                                                            |
|  Este template esta sendo utilizado por 5 ISPs.            |
|                                                            |
|  Ao desativar, os agentes desses ISPs deixarao de          |
|  funcionar no chat ate que o template seja reativado.      |
|                                                            |
|  ISPs afetados:                                            |
|  - Provedor Net Sul (2 agentes)                            |
|  - TurboNet (1 agente)                                     |
|  - FibraMax (2 agentes)                                    |
|                                                            |
|                       [Cancelar]  [Desativar Mesmo Assim]  |
+-----------------------------------------------------------+
```

---

## Cenario 2: Card do ISP com Template Inativo

Quando o template pai (`ai_agents.is_active = false`), exibir alerta no card:

```text
+---------------------------------------+
|  [!] Template desativado pelo admin   |  <- Badge vermelho
+---------------------------------------+
|  Atendente Virtual                    |
|  [Tipo] [Q&A]                         |
|                                       |
|  Descricao do agente...               |
|                                       |
|  [Configurar]  [Base Q&A]  [Chat X]   |  <- Chat desabilitado
+---------------------------------------+
```

---

## Fluxo de Validacao

```text
Admin salva template
        |
        v
  is_active mudou para false?
        |
     [Sim]
        |
        v
  Buscar ISPs com isp_agents.agent_id = template.id
        |
        v
  Quantidade > 0?
        |
     [Sim]
        |
        v
  Exibir AlertDialog com contagem e lista
        |
        v
  Admin confirma?
        |
     [Sim] --> Salvar
     [Nao] --> Cancelar
```

---

## Secao Tecnica

### Hook para Verificar ISPs Afetados

Novo hook `useTemplateUsage` para buscar ISPs que utilizam um template:

```typescript
export function useTemplateUsage(templateId: string | undefined) {
  return useQuery({
    queryKey: ['template-usage', templateId],
    queryFn: async () => {
      if (!templateId) return { count: 0, isps: [] };
      
      const { data, error } = await supabase
        .from('isp_agents')
        .select(`
          id,
          isp_id,
          display_name,
          isps!inner (id, name)
        `)
        .eq('agent_id', templateId);
      
      if (error) throw error;
      
      // Agrupar por ISP
      const ispMap = new Map();
      data?.forEach(agent => {
        const ispId = agent.isp_id;
        if (!ispMap.has(ispId)) {
          ispMap.set(ispId, { 
            name: agent.isps.name, 
            agents: [] 
          });
        }
        ispMap.get(ispId).agents.push(agent.display_name);
      });
      
      return {
        count: ispMap.size,
        isps: Array.from(ispMap.entries()).map(([id, data]) => ({
          id,
          name: data.name,
          agentCount: data.agents.length
        }))
      };
    },
    enabled: !!templateId
  });
}
```

---

### Modificacoes em Arquivos

| Arquivo | Modificacao |
|---------|-------------|
| `src/hooks/admin/useAiAgentTemplates.ts` | Adicionar hook `useTemplateUsage` |
| `src/components/admin/ai-agents/AgentTemplateForm.tsx` | Adicionar estado para confirmacao + AlertDialog |
| `src/components/painel/ai/ActiveAgentCard.tsx` | Adicionar badge de alerta quando `ai_agents.is_active = false` |
| `src/hooks/painel/useIspAgents.ts` | Incluir `ai_agents.is_active` no select (se nao estiver) |

---

### AgentTemplateForm - Logica de Confirmacao

```typescript
// Estados adicionais
const [showDeactivateAlert, setShowDeactivateAlert] = useState(false);
const [pendingData, setPendingData] = useState<AgentFormValues | null>(null);

// Verificar uso do template
const { data: templateUsage } = useTemplateUsage(agent?.id);

const handleSubmit = (data: AgentFormValues) => {
  // Se esta desativando E tem ISPs usando
  const isDeactivating = agent?.is_active && !data.is_active;
  
  if (isDeactivating && templateUsage && templateUsage.count > 0) {
    setPendingData(data);
    setShowDeactivateAlert(true);
    return;
  }
  
  onSubmit(data);
};

const handleConfirmDeactivate = () => {
  if (pendingData) {
    onSubmit(pendingData);
    setShowDeactivateAlert(false);
    setPendingData(null);
  }
};
```

---

### ActiveAgentCard - Badge de Template Inativo

```typescript
// Verificar se template esta inativo
const isTemplateInactive = !template.is_active;

return (
  <Card className={...}>
    {/* Alerta de template inativo */}
    {isTemplateInactive && (
      <div className="absolute top-0 left-0 right-0 bg-destructive/10 
                      border-b border-destructive px-3 py-1.5">
        <div className="flex items-center gap-2 text-xs text-destructive">
          <AlertTriangle className="h-3 w-3" />
          Template desativado pelo administrador
        </div>
      </div>
    )}
    
    {/* Desabilitar botao de chat quando template inativo */}
    <Button
      disabled={!agent.is_enabled || isTemplateInactive}
      ...
    >
      Chat
    </Button>
  </Card>
);
```

---

### Verificar useIspAgents

Confirmar que o JOIN com `ai_agents` inclui `is_active`:

```typescript
.select(`
  *,
  ai_agents!inner (
    id, name, slug, type, description, avatar_url,
    uses_knowledge_base, is_premium, system_prompt,
    is_active  // <-- Garantir que este campo esta presente
  )
`)
```

---

## Arquivos a Modificar

1. `src/hooks/admin/useAiAgentTemplates.ts`
   - Adicionar `useTemplateUsage` hook

2. `src/components/admin/ai-agents/AgentTemplateForm.tsx`
   - Importar `useTemplateUsage`
   - Adicionar estados `showDeactivateAlert` e `pendingData`
   - Modificar `handleSubmit` para verificar desativacao
   - Adicionar `AlertDialog` de confirmacao

3. `src/components/painel/ai/ActiveAgentCard.tsx`
   - Importar `AlertTriangle`
   - Adicionar verificacao `isTemplateInactive`
   - Adicionar banner de alerta
   - Desabilitar chat quando template inativo

4. `src/hooks/painel/useIspAgents.ts`
   - Verificar/adicionar `is_active` no select de `ai_agents`

---

## Ordem de Implementacao

1. Adicionar `useTemplateUsage` hook
2. Modificar `AgentTemplateForm` com confirmacao
3. Verificar `useIspAgents` inclui `is_active`
4. Modificar `ActiveAgentCard` com alerta visual
5. Testar fluxo completo

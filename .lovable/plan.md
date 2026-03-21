

# Plano: Suporte a Múltiplos Agentes de IA por ISP

## Problema atual
- O hook `useAgentConfig` usa `.maybeSingle()`, retornando apenas 1 agente
- A página `AgentConfig.tsx` é uma tela monolítica para um único agente
- O upload de avatar usa path fixo (`{ispId}/avatar.ext`), colidiria entre agentes

## Solução

### 1. Hook `useAgentConfig.ts` — buscar todos os agentes
- Trocar `.maybeSingle()` por query sem filtro de single, retornando array `AgentWithTemplate[]`
- Renomear retorno de `agent` para `agents` (array)
- Status passa a receber `agentId` opcional ou agrega dados de todos os agentes
- Upload de avatar usa path `{ispId}/{agentId}/avatar.{ext}` para evitar colisão
- `updateAgent` passa a receber o `agentId` como parâmetro

### 2. Página `AgentConfig.tsx` — layout de grid/lista
- Exibir grid de cards com todos os agentes do ISP
- Cada card mostra: avatar, nome (custom ou default), template base, badge ativo/inativo
- Ao clicar num card, expande um painel de edição inline (ou abre um dialog) com:
  - Upload de avatar + campo de nome (identidade)
  - Info do template base (read-only)
  - Status individual (conversas hoje, última mensagem)
  - Botão "Testar agente" (simulador)
- A seção de WhatsApp permanece global (uma única conexão por ISP), fora do loop de agentes
- Estado de loading usa skeleton grid

### 3. Arquivos afetados

| Arquivo | Alteração |
|---------|-----------|
| `src/hooks/painel/useAgentConfig.ts` | Retornar array, `updateAgent` com agentId, upload com agentId no path |
| `src/pages/painel/AgentConfig.tsx` | Grid de agent cards + painel de edição por agente selecionado |

### Detalhes técnicos

**Hook — query refatorada:**
```typescript
const { data: agents } = useQuery({
  queryKey: ['agent-config', ispId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('tenant_agents')
      .select('id, custom_name, custom_avatar_url, is_active, isp_id, template_id, agent_templates!inner(...)')
      .eq('isp_id', ispId);
    // retorna data mapeado como AgentWithTemplate[]
  },
});
```

**Página — estrutura:**
```text
┌──────────────────────────────────┐
│ Título: Agentes de IA            │
├──────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────┐ │
│ │ Agent 1  │ │ Agent 2  │ │ ... │ │  ← Grid de cards
│ │ (avatar) │ │ (avatar) │ │     │ │
│ │ Nome     │ │ Nome     │ │     │ │
│ │ Template │ │ Template │ │     │ │
│ └─────────┘ └─────────┘ └─────┘ │
├──────────────────────────────────┤
│ [Painel de edição do selecionado]│  ← Expandido ao clicar
│  Avatar upload + Nome + Salvar   │
│  Template info (read-only)       │
│  Status (conversas, última msg)  │
│  Botão testar                    │
├──────────────────────────────────┤
│ Conexão WhatsApp (global)        │  ← Permanece igual
└──────────────────────────────────┘
```


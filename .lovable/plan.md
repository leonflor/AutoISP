
# Remover Abas do Dialog "Ativar Agente"

## Objetivo

Simplificar a interface do dialog de ativação de agente removendo o sistema de abas e exibindo todo o conteúdo em uma única visualização contínua.

---

## Mudança Visual

**Antes:**
```
┌─────────────────────────────────────────┐
│ Ativar Agente: Nome                     │
│                                         │
│ [Configuração] [Comportamento]  ← Abas  │
│                                         │
│ Conteúdo da aba selecionada             │
└─────────────────────────────────────────┘
```

**Depois:**
```
┌─────────────────────────────────────────┐
│ Ativar Agente: Nome                     │
│                                         │
│ Nome de Exibição                        │
│ Avatar do Agente                        │
│ Base de Conhecimento (se aplicável)     │
│ ─────────────────────────────────────── │
│ Tom de Voz (se aplicável)               │
│ Escalonamento (se aplicável)            │
└─────────────────────────────────────────┘
```

---

## Arquivo a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/components/painel/ai/AgentActivationDialog.tsx` | Remover Tabs e mostrar conteúdo em scroll contínuo |

---

## Seção Técnica

### Mudanças no AgentActivationDialog.tsx

1. **Remover imports não utilizados:**
   - Remover `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger`
   - Remover `Settings2` (ícone da aba)
   - Remover estado `activeTab`

2. **Substituir estrutura de Tabs** por um `ScrollArea` único contendo:
   - Seção de Configuração (nome, avatar, upload de base)
   - Separador visual
   - Seção de Comportamento (tom de voz, escalonamento) - apenas se houver opções disponíveis

3. **Layout final:**
```tsx
<ScrollArea className="flex-1 mt-4">
  <div className="space-y-4 px-1">
    {/* Configuração */}
    <div className="space-y-4">
      {/* Nome, Avatar, Upload CSV, Badges */}
    </div>
    
    {/* Comportamento - se houver opções */}
    {hasBehaviorOptions && (
      <>
        <Separator />
        <BehaviorTab ... />
      </>
    )}
  </div>
</ScrollArea>
```

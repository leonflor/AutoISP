

# Alinhar Botões ao Bottom nos Cards de Agentes IA

## Problema

Os cards de agentes IA (`ActiveAgentCard` e `AgentCatalogCard`) possuem conteúdo de tamanhos variáveis:
- Descrições de diferentes comprimentos
- Instruções extras (opcional)
- Lista de features
- Tags de features

Isso faz com que os botões fiquem em alturas diferentes quando os cards são exibidos lado a lado em grid.

---

## Solução

Usar `flex` com `flex-col` e `h-full` nos cards para que:
1. O card ocupe toda a altura disponível
2. O `CardContent` cresça para preencher o espaço (`flex-1`)
3. Os botões fiquem sempre no final com `mt-auto`

---

## Mudanças

### 1. ActiveAgentCard.tsx

| Elemento | Antes | Depois |
|----------|-------|--------|
| Card | `relative overflow-hidden...` | `flex flex-col h-full relative overflow-hidden...` |
| CardContent | `space-y-4` | `flex-1 flex flex-col space-y-4` |
| Div dos botões | `flex gap-2` | `flex gap-2 mt-auto pt-2` |

### 2. AgentCatalogCard.tsx

| Elemento | Antes | Depois |
|----------|-------|--------|
| Card | `relative overflow-hidden...` | `flex flex-col h-full relative overflow-hidden...` |
| CardContent | `space-y-4` | `flex-1 flex flex-col space-y-4` |
| Button | `w-full` | `w-full mt-auto` |

---

## Seção Técnica

### ActiveAgentCard.tsx (linhas 35-38 e 87-98)

```tsx
// Card - adicionar flex flex-col h-full
<Card
  className={`flex flex-col h-full relative overflow-hidden transition-all hover:shadow-lg ${
    agent.is_enabled ? "hover:border-primary/50" : "opacity-60 border-muted"
  }`}
>

// CardContent - adicionar flex-1 flex flex-col
<CardContent className="flex-1 flex flex-col space-y-4">

// Div dos botões - adicionar mt-auto pt-2
<div className="flex gap-2 mt-auto pt-2">
```

### AgentCatalogCard.tsx (linhas 36-41, 76 e 108)

```tsx
// Card - adicionar flex flex-col h-full  
<Card
  className={`flex flex-col h-full relative overflow-hidden transition-all ${
    isBlocked || isAlreadyActivated
      ? "opacity-60"
      : "hover:shadow-lg hover:border-primary/50"
  }`}
>

// CardContent - adicionar flex-1 flex flex-col
<CardContent className="flex-1 flex flex-col space-y-4">

// Button - adicionar mt-auto
<Button
  className="w-full mt-auto"
  ...
>
```

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/painel/ai/ActiveAgentCard.tsx` | Adicionar classes flex para alinhar botões ao bottom |
| `src/components/painel/ai/AgentCatalogCard.tsx` | Adicionar classes flex para alinhar botões ao bottom |


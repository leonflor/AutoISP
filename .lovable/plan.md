
# Remoção da Coluna Premium da Tabela de Agentes

## Contexto

A coluna **Premium** será removida da tabela de Agentes de IA porque essa informação será configurada diretamente nos **Planos de assinatura** — uma abordagem mais flexível que permite vincular agentes específicos a cada plano.

---

## Mudanças

### Arquivo: `src/components/admin/ai-agents/AgentTemplateTable.tsx`

| Item | Ação |
|------|------|
| Import `Crown` | Remover (não será mais usado) |
| `<TableHead>Premium</TableHead>` | Remover (linha 93) |
| `<TableCell>` com ícone Crown | Remover (linhas 138-142) |

### Estrutura Final do Header

```
TableHeader
├── Avatar (w-12)
├── Nome
├── Tipo
├── Modelo
├── Escopo
├── Status (text-center)
└── Ações (w-12)
```

---

## Seção Técnica

### Alteração 1: Remover import Crown (linha 2)

```tsx
// Antes
import { Edit, Trash2, Copy, MoreHorizontal, Bot, Crown, Building2, Server } from 'lucide-react';

// Depois
import { Edit, Trash2, Copy, MoreHorizontal, Bot, Building2, Server } from 'lucide-react';
```

### Alteração 2: Remover TableHead Premium (linha 93)

```tsx
// Remover esta linha
<TableHead className="text-center">Premium</TableHead>
```

### Alteração 3: Remover TableCell Premium (linhas 138-142)

```tsx
// Remover este bloco
<TableCell className="text-center">
  {agent.is_premium && (
    <Crown className="h-4 w-4 text-amber-500 mx-auto" />
  )}
</TableCell>
```

---

## Resumo

| Tipo | Arquivo | Mudança |
|------|---------|---------|
| Modificar | `src/components/admin/ai-agents/AgentTemplateTable.tsx` | Remover coluna Premium |

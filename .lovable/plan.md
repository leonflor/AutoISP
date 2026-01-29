

# Correção de Margens na Página de Cláusulas LGPD

## Problema Identificado

A página de **Cláusulas LGPD** (`AiSecurity.tsx`) está com textos e botões muito próximos das bordas porque não possui o padding padrão `p-6` usado em outras páginas admin.

### Comparação de Páginas

| Página | Container Principal | Resultado |
|--------|---------------------|-----------|
| Dashboard | `<div className="p-6 space-y-6">` | ✅ Margens corretas |
| Users | `<div className="p-6 space-y-6">` | ✅ Margens corretas |
| AiSecurity | `<div className="space-y-6">` | ❌ Sem margens |
| AiAgents | `<div className="space-y-6">` | ❌ Sem margens |

---

## Solução

### Arquivos a Modificar

1. **`src/pages/admin/AiSecurity.tsx`** - Adicionar `p-6` ao container principal
2. **`src/pages/admin/AiAgents.tsx`** - Adicionar `p-6` ao container principal (mesmo problema)

### Mudança

```tsx
// Antes
<div className="space-y-6">

// Depois
<div className="p-6 space-y-6">
```

Isso aplicará:
- **padding: 24px (1.5rem)** em todos os lados
- Alinhamento visual com as demais páginas admin
- Espaço adequado entre o conteúdo e as bordas do container

---

## Resumo de Arquivos

| Tipo | Arquivo | Mudança |
|------|---------|---------|
| Modificar | `src/pages/admin/AiSecurity.tsx` | Adicionar `p-6` ao container |
| Modificar | `src/pages/admin/AiAgents.tsx` | Adicionar `p-6` ao container |


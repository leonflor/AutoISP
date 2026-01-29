
# Ajuste de Layout do Dialog de Cláusulas LGPD (SecurityClauseForm)

## Problemas Identificados

O componente `SecurityClauseForm.tsx` apresenta inconsistências de layout em comparação com o padrão estabelecido nos dialogs recentemente corrigidos (`AgentConfigDialog.tsx` e `AgentActivationDialog.tsx`):

| Problema | Atual | Padrão Esperado |
|----------|-------|-----------------|
| **DialogContent** | `max-w-2xl max-h-[90vh] p-0` | `max-w-2xl max-h-[90vh] overflow-hidden flex flex-col` |
| **DialogHeader** | `p-6 pb-0` (padding manual) | `flex-shrink-0` (padding padrão) |
| **Form** | `flex flex-col` sem overflow | `flex-1 overflow-y-auto` |
| **ScrollArea** | Wrapper externo com `max-h-[60vh]` | Não necessário (form já faz scroll) |
| **DialogFooter** | `p-6 pt-4 border-t` dentro do form | `flex-shrink-0 pt-4 border-t` fora do form |

### Problemas Visuais Resultantes

1. **Padding inconsistente**: O uso de `p-0` no DialogContent e `p-6 pb-0` no header cria padding não uniforme
2. **Scroll duplicado**: O ScrollArea com altura fixa `max-h-[60vh]` pode conflitar com o `max-h-[90vh]` do container
3. **Footer dentro do form**: Pode ser afetado pelo scroll do formulário
4. **Estrutura flex incorreta**: Falta `overflow-hidden` no container principal

---

## Solução

### Arquivo a Modificar

**`src/components/admin/ai-security/SecurityClauseForm.tsx`**

### Mudanças Propostas

1. **DialogContent**: Remover `p-0`, adicionar `overflow-hidden flex flex-col`
2. **DialogHeader**: Remover padding manual, adicionar `flex-shrink-0`
3. **Form**: Aplicar `flex-1 overflow-y-auto py-4 px-6`
4. **Remover ScrollArea**: O form já fará o scroll interno
5. **DialogFooter**: Mover para fora do form com classes corretas

### Estrutura Final

```
DialogContent (max-w-2xl max-h-[90vh] overflow-hidden flex flex-col)
├── DialogHeader (flex-shrink-0)
│   ├── DialogTitle
│   └── DialogDescription
├── Form
│   └── form (flex-1 overflow-y-auto py-4 px-6)
│       ├── Input Nome da Cláusula
│       ├── Select Aplica-se a
│       ├── Placeholders Disponíveis (badges)
│       ├── Textarea Conteúdo
│       ├── Preview (condicional)
│       └── Grid Ordem + Switch Ativo
└── div (flex-shrink-0 pt-4 border-t px-6 pb-6)
    └── div (flex justify-end gap-2)
        ├── Button Cancelar
        └── Button Salvar
```

---

## Resumo de Arquivos

| Tipo | Arquivo | Mudança |
|------|---------|---------|
| Modificar | `src/components/admin/ai-security/SecurityClauseForm.tsx` | Ajustar layout para padrão estabelecido |

---

## Seção Técnica

### Alterações Específicas

**Linha 131 (DialogContent)**:
```tsx
// Antes
<DialogContent className="max-w-2xl max-h-[90vh] p-0">

// Depois
<DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
```

**Linha 132-137 (DialogHeader)**:
```tsx
// Antes
<DialogHeader className="p-6 pb-0">

// Depois
<DialogHeader className="flex-shrink-0">
```

**Linha 140-141 (Form)**:
```tsx
// Antes
<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
  <ScrollArea className="flex-1 px-6 max-h-[60vh]">
    <div className="space-y-4 py-4">

// Depois
<form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-y-auto py-4 px-6">
  <div className="space-y-4">
```

**Linhas 286-296 (DialogFooter -> div customizada)**:
```tsx
// Antes
</ScrollArea>
<DialogFooter className="p-6 pt-4 border-t">
  ...
</DialogFooter>
</form>

// Depois
  </div>
</form>
<div className="flex justify-end gap-2 pt-4 border-t px-6 pb-6 flex-shrink-0">
  ...
</div>
```

### Importações

Remover `ScrollArea` das importações pois não será mais usado.

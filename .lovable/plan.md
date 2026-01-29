
# Correção de Layout do Dialog de Cláusulas LGPD

## Problemas Identificados

### 1. Input Excedendo o Limite do Dialog
O formulário tem `px-6` aplicado diretamente, e os campos internos podem exceder o container quando não há controle de overflow adequado.

### 2. Dois Inputs Desalinhados no Final
O grid com dois campos na parte inferior apresenta desalinhamento visual:

| Campo | Estrutura Atual | Problema |
|-------|-----------------|----------|
| Ordem de Injeção | `FormItem` padrão com Input + FormDescription | Altura menor |
| Cláusula Ativa | `FormItem` com `flex flex-col justify-end` + div com border/padding | Altura maior devido ao container estilizado |

A diferença de altura e estrutura causa desalinhamento visual entre os dois campos.

---

## Solução

### Arquivo a Modificar

**`src/components/admin/ai-security/SecurityClauseForm.tsx`**

### Mudanças Propostas

1. **Adicionar `overflow-hidden` ao container do form**:
   - Alterar `<div className="space-y-4">` para `<div className="space-y-4 overflow-hidden">`

2. **Equalizar altura dos campos no grid**:
   - Ambos os campos devem ter a mesma estrutura visual
   - Usar `h-full` no FormItem do switch para ocupar toda a altura disponível
   - Ajustar o container do switch para alinhar verticalmente com o input

### Estrutura Final do Grid

```
grid grid-cols-2 gap-4
├── FormItem (Ordem de Injeção)
│   ├── FormLabel
│   ├── FormControl > Input
│   ├── FormDescription
│   └── FormMessage
└── FormItem (Cláusula Ativa) [h-full flex flex-col]
    ├── div (spacer ou label área)
    └── div (flex-1 flex items-center justify-between rounded-lg border p-3)
        ├── FormLabel
        └── Switch
```

---

## Seção Técnica

### Alteração 1: Overflow no Container (Linha 141)

```tsx
// Antes
<div className="space-y-4">

// Depois  
<div className="space-y-4 overflow-hidden">
```

### Alteração 2: Equalizar Grid Items (Linhas 249-284)

```tsx
// Antes - sort_order sem altura definida
<FormItem>

// Depois - sort_order com estrutura para preencher altura
<FormItem className="space-y-2">

// Antes - is_active com flex-col justify-end
<FormItem className="flex flex-col justify-end">
  <div className="flex items-center justify-between rounded-lg border p-3">

// Depois - is_active com estrutura equalizada
<FormItem className="flex flex-col">
  <FormLabel>Cláusula Ativa</FormLabel>
  <div className="flex-1 flex items-center justify-between rounded-lg border p-3 h-10">
```

Isso garante que:
- O label "Cláusula Ativa" fica na mesma posição vertical que "Ordem de Injeção"
- Os containers de input (Input e Switch) ficam alinhados horizontalmente
- Ambos os campos têm altura visual consistente

---

## Resumo de Arquivos

| Tipo | Arquivo | Mudança |
|------|---------|---------|
| Modificar | `src/components/admin/ai-security/SecurityClauseForm.tsx` | Corrigir overflow e alinhar grid |


# Correção de Overflow no Dialog de Novo Agente

## Problema Identificado

Os elementos dentro do dialog de criação/edição de agentes estão excedendo os limites do container. O problema principal está na estrutura de layout:

| Componente | Classe Atual | Problema |
|------------|--------------|----------|
| `ScrollArea` | `flex-1 px-6` | Padding horizontal aplicado, mas conteúdo interno pode transbordar |
| `Tabs` | `w-full` | Sem controle de overflow |
| `TabsList` | `grid w-full grid-cols-4` | Pode comprimir muito em telas menores |
| `TabsContent` | `space-y-4 mt-0` | Sem overflow-hidden |

---

## Solução

### Arquivo: `src/components/admin/ai-agents/AgentTemplateForm.tsx`

### Mudanças Propostas

1. **Adicionar `overflow-hidden` ao container das Tabs**
2. **Adicionar padding direito extra no ScrollArea para compensar scrollbar**
3. **Limitar largura máxima dos elementos internos**
4. **Adicionar `overflow-hidden` a cada `TabsContent`**

---

## Seção Técnica

### Alteração 1: Ajustar ScrollArea (Linha 182)

```tsx
// Antes
<ScrollArea className="flex-1 px-6">

// Depois
<ScrollArea className="flex-1 px-6 pr-4">
```

Reduzir padding direito para `pr-4` para compensar a scrollbar.

### Alteração 2: Adicionar container com overflow às Tabs (Linha 183)

```tsx
// Antes
<Tabs defaultValue="basic" className="w-full">

// Depois
<Tabs defaultValue="basic" className="w-full overflow-hidden">
```

### Alteração 3: Adicionar overflow-hidden a cada TabsContent

**Linha 191 - Aba Básico:**
```tsx
// Antes
<TabsContent value="basic" className="space-y-4 mt-0">

// Depois
<TabsContent value="basic" className="space-y-4 mt-0 overflow-hidden">
```

**Linha 351 - Aba Configuração IA:**
```tsx
// Antes
<TabsContent value="ai" className="space-y-4 mt-0">

// Depois
<TabsContent value="ai" className="space-y-4 mt-0 overflow-hidden">
```

**Linha 442 - Aba Features:**
```tsx
// Antes
<TabsContent value="features" className="space-y-4 mt-0">

// Depois
<TabsContent value="features" className="space-y-4 mt-0 overflow-hidden">
```

**Linha 515 - Aba Status:**
```tsx
// Antes
<TabsContent value="status" className="space-y-4 mt-0">

// Depois
<TabsContent value="status" className="space-y-4 mt-0 overflow-hidden">
```

### Alteração 4: Adicionar padding bottom ao conteúdo scrollável

Adicionar uma `div` wrapper com padding bottom para garantir que o último elemento não fique colado no footer:

```tsx
// Antes (linha 182-576)
<ScrollArea className="flex-1 px-6 pr-4">
  <Tabs defaultValue="basic" className="w-full overflow-hidden">
    ...
  </Tabs>
</ScrollArea>

// Depois
<ScrollArea className="flex-1 px-6 pr-4">
  <div className="pb-4">
    <Tabs defaultValue="basic" className="w-full overflow-hidden">
      ...
    </Tabs>
  </div>
</ScrollArea>
```

---

## Resumo de Arquivos

| Tipo | Arquivo | Mudança |
|------|---------|---------|
| Modificar | `src/components/admin/ai-agents/AgentTemplateForm.tsx` | Corrigir overflow em Tabs e TabsContent, ajustar padding |


# Ajuste do Dialog de Novo Agente (AgentActivationDialog)

## Problema Identificado

O componente `AgentActivationDialog.tsx` apresenta problemas similares ao `AgentConfigDialog.tsx`:

1. **Falta overflow-hidden no container**: O `DialogContent` tem `max-h-[90vh]` mas falta `overflow-hidden` e estrutura flex para controlar corretamente o layout
2. **DialogHeader sem flex-shrink-0**: Pode ser comprimido quando o conteúdo é grande
3. **Form sem overflow controlado**: O formulário não tem estrutura flex para scroll interno
4. **DialogFooter dentro do form**: Pode causar problemas de layout quando o conteúdo excede a altura

---

## Solução

### Arquivo a Modificar

**`src/components/painel/ai/AgentActivationDialog.tsx`**

### Mudanças Propostas

| Problema | Antes | Depois |
|----------|-------|--------|
| DialogContent | `max-w-2xl max-h-[90vh]` | `max-w-2xl max-h-[90vh] overflow-hidden flex flex-col` |
| DialogHeader | (sem classe extra) | `flex-shrink-0` |
| Form | `<form onSubmit={handleSubmit}>` | `<form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">` |
| DialogFooter | Dentro do form | Fora do form com `flex-shrink-0 pt-4 border-t` |

### Estrutura Final do DialogContent

```
DialogContent (max-w-2xl max-h-[90vh] overflow-hidden flex flex-col)
├── DialogHeader (flex-shrink-0)
├── form (flex-1 overflow-y-auto py-4)
│   └── Tabs
│       ├── TabsList
│       ├── TabsContent "config"
│       │   ├── Input Nome de Exibição
│       │   ├── Input URL do Avatar
│       │   ├── Textarea Instruções Adicionais
│       │   └── Badges de configuração
│       └── TabsContent "preview"
│           └── ScrollArea com prompt
└── div (flex-shrink-0 pt-4 border-t)
    └── div (flex justify-end gap-2)
        ├── Button Cancelar
        └── Button Ativar Agente
```

---

## Código Atualizado

O DialogContent receberá:
- Classes: `max-w-2xl max-h-[90vh] overflow-hidden flex flex-col`

O DialogHeader receberá:
- Classe: `flex-shrink-0`

O form receberá:
- Classes: `flex-1 overflow-y-auto py-4`

O DialogFooter será movido para fora do form e substituído por:
- Div com classes: `flex justify-end gap-2 pt-4 border-t flex-shrink-0`

Isso garante:
- Layout consistente com o AgentConfigDialog atualizado
- Scroll interno quando o conteúdo excede a altura (especialmente na aba de preview)
- Footer fixo na parte inferior do dialog
- Separador visual entre conteúdo e ações

---

## Resumo de Arquivos

| Tipo | Arquivo | Mudança |
|------|---------|---------|
| Modificar | `src/components/painel/ai/AgentActivationDialog.tsx` | Ajustar layout, overflow e estrutura do footer |

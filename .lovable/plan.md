
# Ajuste do Dialog de Editar Agente (AgentConfigDialog)

## Problema Identificado

O componente `AgentConfigDialog.tsx` apresenta problemas de layout:

1. **Largura insuficiente**: Usa `max-w-lg` (512px) enquanto o similar `AgentActivationDialog` usa `max-w-2xl` (672px)
2. **Sem controle de altura máxima**: Falta `max-h-[90vh]` para evitar que o dialog ultrapasse a viewport
3. **Conflito no DialogFooter**: O CSS customizado `flex justify-between sm:justify-between` conflita com o comportamento padrão do componente que usa `flex-col-reverse sm:flex-row sm:justify-end`
4. **Falta ScrollArea**: O formulário não tem área scrollável para conteúdos longos

---

## Solução

### Arquivo a Modificar

**`src/components/painel/ai/AgentConfigDialog.tsx`**

### Mudanças Propostas

| Problema | Antes | Depois |
|----------|-------|--------|
| Largura | `max-w-lg` | `max-w-2xl` |
| Altura | (nenhum) | `max-h-[90vh]` |
| Overflow | (nenhum) | `overflow-hidden` no DialogContent, form com `overflow-y-auto` |
| DialogFooter | Conflito de classes | Estrutura limpa com `pt-4 border-t` |

### Estrutura Final do DialogContent

```
DialogContent (max-w-2xl max-h-[90vh] overflow-hidden flex flex-col)
├── DialogHeader (flex-shrink-0)
├── form (flex-1 overflow-y-auto space-y-4 py-4)
│   ├── Switch Agente Ativo
│   ├── Input Nome de Exibição
│   ├── Input URL do Avatar
│   └── Textarea Instruções Adicionais
└── DialogFooter (flex-shrink-0 pt-4 border-t)
    ├── Button Remover (esquerda)
    └── div (direita)
        ├── Button Cancelar
        └── Button Salvar
```

---

## Código Atualizado

O DialogContent receberá:
- Classes: `max-w-2xl max-h-[90vh] overflow-hidden flex flex-col`

O form receberá:
- Classes: `flex-1 overflow-y-auto space-y-4 py-4`

O DialogFooter será substituído por uma div customizada:
- Classes: `flex justify-between items-center pt-4 border-t flex-shrink-0`

Isso garante:
- Layout responsivo consistente com outros dialogs
- Scroll interno quando o conteúdo excede a altura
- Botões corretamente posicionados (Remover à esquerda, Cancelar/Salvar à direita)
- Separador visual entre conteúdo e ações

---

## Resumo de Arquivos

| Tipo | Arquivo | Mudança |
|------|---------|---------|
| Modificar | `src/components/painel/ai/AgentConfigDialog.tsx` | Ajustar layout, largura, altura e estrutura do footer |

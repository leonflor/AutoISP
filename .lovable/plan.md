

# Corrigir foco do textarea no dialog de teste de agente

## Problema

O `onClick` no `DialogContent` (linha 349) foca o textarea em qualquer clique, incluindo double-click (selecionar palavra) e click-drag (selecionar trecho). Isso impede o usuario de selecionar texto nas respostas do agente.

## Solucao

Substituir o `onClick` por logica que detecta se o clique foi um clique simples sem selecao de texto. Se o usuario fez double-click ou arrastou para selecionar, o foco nao e roubado.

## Alteracao

### `src/components/painel/ai/AgentTestDialog.tsx` (linhas 349-353)

**Antes:**
```typescript
onClick={() => {
  if (!isLoading && selectedAgentId && textareaRef.current) {
    textareaRef.current.focus();
  }
}}
```

**Depois:**
```typescript
onClick={() => {
  const selection = window.getSelection();
  const hasSelection = selection && selection.toString().length > 0;
  if (!hasSelection && !isLoading && selectedAgentId && textareaRef.current) {
    textareaRef.current.focus();
  }
}}
```

Verifica `window.getSelection()` — se o usuario selecionou texto (double-click ou drag), o foco nao e aplicado. Clique simples sem selecao continua focando normalmente.


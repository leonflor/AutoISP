

# Correcao: Foco automatico no textarea apos resposta da IA

## Problema

Na janela "Testar Agente", apos enviar uma mensagem e a IA responder, o textarea eh reabilitado (`disabled` sai de `true` para `false`) mas o foco nao retorna automaticamente. O usuario precisa clicar manualmente no campo para digitar novamente.

O codigo atual ja tem `textareaRef.current?.focus()` no bloco `finally` (linha 323), porem o `.focus()` dispara **antes** do React re-renderizar com `isLoading = false` — ou seja, o textarea ainda esta `disabled` no momento do focus, e o navegador ignora o foco em elementos desabilitados.

## Solucao

Duas melhorias complementares:

### 1. Foco apos reabilitacao via `useEffect`

Adicionar um `useEffect` que detecta a transicao de `isLoading` de `true` para `false` e foca o textarea com `requestAnimationFrame` (garante que o DOM ja atualizou):

```typescript
const wasLoadingRef = useRef(false);

useEffect(() => {
  if (wasLoadingRef.current && !isLoading) {
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }
  wasLoadingRef.current = isLoading;
}, [isLoading]);
```

### 2. Foco ao clicar na area da janela

Adicionar um handler `onClick` no container do dialog para focar o textarea quando o usuario clicar em qualquer area da janela (desde que o textarea esteja habilitado):

```typescript
const handleDialogClick = useCallback(() => {
  if (!isLoading && selectedAgentId && textareaRef.current) {
    textareaRef.current.focus();
  }
}, [isLoading, selectedAgentId]);
```

Aplicado no `DialogContent` via `onClick={handleDialogClick}`.

## Arquivo alterado

| Arquivo | Mudanca |
|---|---|
| `src/components/painel/ai/AgentTestDialog.tsx` | Adicionar `useEffect` para foco pos-loading + `onClick` no container |


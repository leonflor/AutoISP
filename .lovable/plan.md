

# Corrigir perda de foco e troca inesperada de agente no Testar Agente

## Problemas identificados

### 1. Perda de foco no campo de texto
Apos enviar a mensagem, nada no codigo refoca o campo de texto. O `sendMessage` limpa o input mas nao devolve o foco ao `Textarea`.

### 2. Troca inesperada de agente
O `useEffect` da linha 128-136 depende de `[open, initialAgentId, agents]`. Toda vez que o array `agents` muda de referencia (o que acontece quando o React Query refaz o fetch, por exemplo ao trocar de aba do navegador), o efeito roda novamente e redefine `selectedAgentId` para o primeiro agente da lista, limpando a conversa.

## Correcoes

### Arquivo: `src/components/painel/ai/AgentTestDialog.tsx`

**1. Adicionar ref no Textarea e refocus apos envio**

- Criar um `useRef` para o Textarea (`textareaRef`)
- Atribuir a ref ao componente `<Textarea ref={textareaRef} />`
- No final do `sendMessage` (bloco `finally`), chamar `textareaRef.current?.focus()`

**2. Evitar re-selecao do agente quando `agents` muda de referencia**

- Usar um `useRef` booleano (`hasInitializedRef`) para garantir que a selecao inicial so aconteca uma vez por abertura do dialog
- No `useEffect`, verificar `hasInitializedRef.current` antes de selecionar; setar para `true` apos a primeira selecao
- No `handleOpenChange`, resetar `hasInitializedRef.current = false` ao fechar

## Resultado

- O campo de texto mantem o foco apos cada envio de mensagem
- O agente selecionado nao muda sozinho durante a conversa

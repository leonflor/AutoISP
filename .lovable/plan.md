
# Corrigir erro "messages is not defined" no ai-chat

## Problema

Na edge function `ai-chat/index.ts`, a variavel `messages` e usada na linha 624 e em varios outros pontos do loop de tool calls, mas nunca foi declarada. O codigo constroi o `systemPrompt` (linha 575) e tem acesso a `body.messages` (mensagens do usuario), mas nunca combina os dois em um array `messages`.

## Correcao

### Arquivo: `supabase/functions/ai-chat/index.ts`

Adicionar uma linha apos a construcao do `systemPrompt` (apos linha 585) e antes do bloco de tools (linha 587):

```typescript
const messages: any[] = [
  { role: "system", content: systemPrompt },
  ...body.messages,
];
```

Isso cria o array `messages` com o system prompt como primeira mensagem, seguido das mensagens do usuario. Todas as referencias subsequentes (`messages.push` nas linhas 652 e 666, e o uso nas chamadas a OpenAI) passam a funcionar corretamente.

Nenhuma outra alteracao necessaria. A edge function `ai-chat` sera redeployada apos a alteracao.

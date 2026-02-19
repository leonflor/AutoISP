
# Corrigir erro "model is not defined" no ai-chat

## Problema

Na edge function `ai-chat/index.ts`, a variavel `model` e usada em 4 lugares (linhas 622, 711, 793, 834) mas nunca foi declarada como variavel local. O codigo referencia `template.model` na query do Supabase, mas nao extrai esse valor para uma variavel `model`.

Isso causa o erro `ReferenceError: model is not defined` toda vez que o agente tenta responder.

## Correcao

### Arquivo: `supabase/functions/ai-chat/index.ts`

Adicionar uma unica linha apos a linha 389 (`const template = ispAgent.ai_agents;`):

```typescript
const model = template.model || "gpt-4o-mini";
```

Isso declara a variavel `model` com o valor configurado no template do agente, usando `gpt-4o-mini` como fallback caso o campo esteja nulo.

Nenhuma outra alteracao necessaria -- todas as 4 referencias a `model` no arquivo passam a funcionar corretamente.

## Deploy

A edge function `ai-chat` sera redeployada automaticamente apos a alteracao.

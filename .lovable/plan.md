

# Corrigir encerramento do procedimento de cobrança

## Problema

Quando o último passo (entrega do pagamento) é concluído com sucesso, o procedimento termina via `end_procedure` e o `active_procedure_id` é anulado. Porém:

1. A resposta do LLM nesse passo não inclui "precisa de algo mais?" porque a instrução do passo 4 não orienta isso
2. O `collected_context` não é limpo — dados de cobrança anteriores permanecem na conversa
3. A próxima mensagem do usuário (ex: "2") cai em `detectProcedure` que re-ativa o procedimento do zero, gerando a saudação inicial novamente

## Correção (2 mudanças)

### 1. `procedure-runner.ts` — Limpar `collected_context` ao encerrar procedimento

No case `end_procedure` (linha 598), adicionar `collected_context: {}` ao update. Isso garante que a próxima interação comece com contexto limpo.

No case `next_step` quando `currentIndex + 1 >= totalSteps` (linha 576), fazer o mesmo — pois esse caminho também encerra o procedimento.

### 2. Migration SQL (v17) — Adicionar instrução de fechamento no passo 4

Atualizar a instrução do último passo para incluir ao final:
> "Após entregar a informação com sucesso, pergunte se o cliente precisa de algo mais."

Isso garante que o LLM encerre a conversa de cobrança de forma natural antes do procedimento ser desativado.

## Resultado esperado

```text
Passo 4: entrega linha digitável → "Aqui está: 0399... Posso ajudar com mais alguma coisa?"
→ Procedimento encerra, contexto limpo
→ Próxima mensagem do usuário é tratada como conversa livre ou novo procedimento
```

## Arquivos alterados (2)

| Arquivo | Mudança |
|---|---|
| `procedure-runner.ts` | Limpar `collected_context` em `end_procedure` e no fim natural do procedimento |
| Migration SQL | Passo 4 com instrução de fechamento amigável |




# Corrigir: bot não avança para listar contratos após confirmação de identidade

## Causa raiz

O fix anterior bloqueou o auto-advance para **todos** os passos com `user_confirmation`. Isso resolveu o problema de pular a seleção de contrato, mas criou um novo: após o usuário confirmar a identidade no passo 0, o sistema avança o `step_index` para 1 mas **não executa o passo 1** (que deveria listar os contratos). O bot fica preso na resposta do passo 0, que é genérica ("posso ajudar com mais alguma coisa?").

O fluxo correto deveria ser:
1. User: "sim" → step 0 `user_confirmation` → true → avança para step 1
2. Auto-advance ENTRA no step 1 → LLM chama `erp_contract_lookup`, lista contratos, pede escolha
3. Step 1 `user_confirmation` avalia `[continuar]` → **false** → para aqui e espera input real

O problema é que bloqueamos a **entrada** no step, quando deveríamos bloquear apenas a **saída** (o `evaluateAdvanceCondition` que roda dentro do step).

## Correção (1 arquivo)

### `procedure-runner.ts` — Reverter bloqueio de auto-advance, proteger no evaluateAdvanceCondition

**Mudança 1**: Remover a trava `nextNeedsUserInput` no bloco de auto-advance (linhas 452-460). Permitir auto-advance para TODOS os passos novamente.

**Mudança 2**: No `evaluateAdvanceCondition` case `user_confirmation` (linha 574-579), rejeitar explicitamente a mensagem sintética `[continuar]`:

```typescript
case "user_confirmation": {
  // Synthetic auto-advance message is never a real confirmation
  if (userMessage.trim() === "[continuar]") return false;
  
  const answer = await callOpenAIMini(
    openaiKey,
    `Analise a seguinte mensagem do usuário e determine se é uma confirmação positiva (sim, ok, confirmo, pode fazer, etc). Responda APENAS "sim" ou "não".\n\nMensagem: "${userMessage}"`,
  );
  return answer.trim().toLowerCase().startsWith("sim");
}
```

Isso garante que:
- O auto-advance **entra** no próximo passo e executa as tools/instrução (listando contratos)
- Mas `[continuar]` nunca é interpretado como confirmação do usuário
- O passo só avança quando o usuário envia uma mensagem real de confirmação

## Resultado esperado

```text
Turn 1: "boleto" → procedimento ativado, bot pede CPF
Turn 2: CPF → erp_client_lookup, bot pergunta "É você?"
Turn 3: "sim" → step 0 avança → auto-advance step 1 → erp_contract_lookup
         → bot lista contratos → evaluateAdvance("[continuar]") → false → PARA
Turn 4: "3" → step 1 avança → auto-advance step 2 → erp_invoice_search
         → bot mostra faturas e modalidades → evaluateAdvance("[continuar]") → false → PARA
Turn 5: "2" → step 2 avança → step 3 (always) → auto-advance step 4
         → erp_pix_lookup → entrega código PIX
```

## Arquivo alterado

| Arquivo | Mudança |
|---|---|
| `procedure-runner.ts` | Remover `nextNeedsUserInput` do auto-advance; adicionar guard `[continuar]` no `evaluateAdvanceCondition` |


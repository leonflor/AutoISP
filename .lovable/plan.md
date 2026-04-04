

# Corrigir: auto-advance atravessa passos que exigem interação do usuário

## Causa raiz

O mecanismo de auto-advance (linha 441-485 do `procedure-runner.ts`) envia `[continuar]` como mensagem do usuário ao avançar para o próximo passo. Quando esse próximo passo tem `advance_condition: user_confirmation`, o GPT-4o-mini interpreta `[continuar]` como confirmação positiva, fazendo o passo avançar automaticamente sem interação real do usuário.

Resultado observado no fluxo:
1. Usuário diz "sim" → step 0 avança → auto-advance para step 1 com `[continuar]`
2. Step 1: LLM chama `erp_contract_lookup`, lista contratos. `evaluateAdvanceCondition("user_confirmation", "[continuar]")` → GPT-4o-mini interpreta como "sim" → step 1 avança para step 2
3. Step 2: LLM chama `erp_invoice_search` sem o usuário ter escolhido contrato → mostra fatura de contrato arbitrário

O usuário nunca teve oportunidade de escolher o contrato.

## Correção (1 arquivo)

### `procedure-runner.ts` — Bloquear auto-advance para passos com `user_confirmation`

Na lógica de auto-advance (linha 441-485), antes de fazer a chamada recursiva, verificar se o **próximo passo** tem `advance_condition: "user_confirmation"`. Se sim, **não auto-avançar** — o passo precisa de input real do usuário.

```text
Lógica atual:
  if (refreshed.active_procedure_id && refreshed.mode === "bot" && newStepIndex !== oldStepIndex)
    → auto-advance

Lógica corrigida:
  // Ler o próximo passo da definição
  const nextStep = def.steps[newStepIndex]
  const nextNeedsUserInput = nextStep?.advance_condition === "user_confirmation"

  if (...mesmas condições... && !nextNeedsUserInput)
    → auto-advance
```

Isso garante que:
- Passos com `advance_condition: "always"` ou `"function_success"` continuam auto-avançando (ex: passo 3 → passo 4)
- Passos com `user_confirmation` (passos 0, 1, 2) **sempre** esperam a resposta do usuário

Nenhuma migration SQL é necessária — o procedimento v18 já está correto. O problema é exclusivamente no runner.

## Resultado esperado

```text
Turn 1: "boleto" → procedimento ativado, bot pede CPF
Turn 2: CPF → erp_client_lookup, bot pergunta "É você?"
Turn 3: "sim" → step 0 avança → step 1 precisa de user_confirmation → NÃO auto-avança
         → bot lista contratos e pede para escolher
Turn 4: "8" → contract selecionado → step 1 avança → step 2 precisa user_confirmation → NÃO auto-avança
         → bot busca faturas e apresenta modalidades
Turn 5: "2" (pix) → step 2 avança → step 3 (always) → auto-avança para step 4
         → bot executa erp_pix_lookup e entrega código
```

## Arquivo alterado

| Arquivo | Mudança |
|---|---|
| `procedure-runner.ts` | Bloquear auto-advance quando próximo passo tem `advance_condition: "user_confirmation"` |


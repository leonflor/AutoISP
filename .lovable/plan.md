

# Corrigir: transbordo prematuro por `stuck_after_turns` insuficiente

## Causa raiz

O fluxo no simulador foi:
1. "pix" → disparou o procedimento (keyword match) → step 0, turns=0
2. step 0 pede CPF, advance_condition=`user_confirmation`. "pix" não é confirmação → turns=1
3. "boleto" → procedimento já ativo, ainda step 0 → turns=2
4. CPF → erp_client_lookup roda com sucesso, bot pergunta "É você?" → turns=3 → **stuck_after_turns=3 atingido** → mode=human

O usuário nunca teve chance de dizer "sim" porque os 3 turnos se esgotaram antes da confirmação.

## Correção (2 arquivos)

### 1. Migration SQL — Procedimento v18

Aumentar `stuck_after_turns` de 3 para **5** nos passos que usam `user_confirmation` (passos 0, 1, 2). Isso dá margem para keywords de ativação + interação real + confirmação.

Passos afetados:
- Passo 0 (Identificação): 3 → 5
- Passo 1 (Contrato): 3 → 5
- Passo 2 (Faturas): 3 → 5

Passos 3 e 4 mantêm stuck_after_turns=3 (condições `always` e `function_success` não precisam de margem extra).

### 2. `procedure-runner.ts` — Usar `pending_handover` em vez de transbordo direto no stuck

Quando `turns_on_current_step >= stuckLimit` (linha 443-453), em vez de setar `mode: "human"` diretamente:

1. Setar `mode: "pending_handover"` e salvar o motivo
2. O LLM deve receber instrução para perguntar "Deseja falar com um atendente?"
3. Na próxima mensagem, se o usuário confirmar → `mode: "human"`. Se negar → manter `mode: "bot"` e resetar turns.

Isso alinha com o fluxo de confirmação de transbordo já documentado na memória do projeto.

**Implementação concreta no runner:**
- Linha 443-453: trocar `mode: "human"` por `mode: "pending_handover"`
- Adicionar handling no início de `runProcedureStep` (antes da chamada OpenAI): se `mode === "pending_handover"`, avaliar a mensagem do usuário como confirmação. Se "sim" → setar `mode: "human"` e retornar mensagem de transferência. Se "não" → setar `mode: "bot"`, resetar turns, e continuar normalmente.

## Resultado esperado

```
Turn 1: "pix" → procedimento ativado, bot pede CPF
Turn 2: CPF → tool roda, bot pergunta nome
Turn 3: "sim" → avança para step 1
```

Se o passo realmente travar após 5 turnos, o bot pergunta antes de transferir.

## Arquivos alterados

| Arquivo | Mudança |
|---|---|
| Migration SQL | v18 com stuck_after_turns=5 nos passos 0-2 |
| `procedure-runner.ts` | Lógica `pending_handover` no stuck handler |


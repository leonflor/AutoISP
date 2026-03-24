

# Corrigir avanço prematuro do Step 0 — "sim" avança sem CPF

## Problema

O fluxo atual falha assim:

```text
Usuário: "pagamento"
→ Procedimento ativado, step 0. Agente pergunta sobre boletos.

Usuário: "sim"
→ advance_condition = user_confirmation → "sim" = positivo → AVANÇA para step 1
→ Mas erp_client_lookup NUNCA foi chamado — nenhum CPF foi coletado
→ Step 1 tenta erp_contract_lookup sem dados → agente não sabe o que fazer → transfer_to_human
```

A `user_confirmation` no step 0 avança com qualquer "sim", mesmo que o cliente ainda não tenha sido identificado. A confirmação deveria ocorrer **depois** do lookup, não antes.

## Solucao

Trocar `advance_condition` do step 0 de `user_confirmation` para `llm_judge`. O `llm_judge` avalia se o **objetivo do passo** foi cumprido — que exige ambas as condições:

1. `erp_client_lookup` foi chamado com sucesso
2. O cliente confirmou sua identidade

Um simples "sim" sem lookup prévio fará o `llm_judge` responder "não, o objetivo não foi cumprido" e o step permanece ativo.

### Ajuste na instruction do Step 0

Reforçar que o agente deve:
- Primeiro solicitar CPF/CNPJ
- Chamar `erp_client_lookup`
- Perguntar "Estou falando com [nome]?"
- Só considerar o passo completo após confirmação positiva

## Implementacao

**Migration SQL** — atualizar definition do procedimento (v8):
- Step 0: `advance_condition` de `"user_confirmation"` → `"llm_judge"`
- Instruction atualizada para deixar claro que o objetivo só é cumprido quando **ambos** (lookup + confirmação) ocorrem
- Steps 1-3: mantidos sem alteração

| Arquivo | Alteracao |
|---|---|
| Nova migration SQL | Marcar v7 como inativa, inserir v8 com step 0 corrigido |


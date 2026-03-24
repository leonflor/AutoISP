

# Tornar o fluxo de Cobrança de Fatura mais fluido e contextual

## Problemas identificados no diálogo

### Problema 1: "Turno morto" entre steps
A arquitetura avalia o `advance_condition` **depois** de gerar a resposta. Quando step 0 avança, a resposta do bot ainda é do contexto do step 0 ("em que posso ajudar?"). O turno seguinte já está no step 1, mas o usuário não sabe o que dizer — e a mensagem ("consultar em aberto") confunde o LLM.

### Problema 2: Step 1 não age proativamente
O step 1 instrui o agente a "usar erp_contract_lookup", mas o LLM espera input relevante. Ao receber "consultar em aberto", não reconhece como trigger para chamar a ferramenta e transfere para humano.

### Problema 3: llm_judge tem contexto limitado
O `llm_judge` recebe apenas a instrução do passo e a resposta do bot. Não vê a mensagem do usuário nem o histórico de tool calls, o que prejudica a avaliação.

## Solução (2 frentes)

### Frente 1: Melhorar instruções do procedimento (migration SQL — v9)

**Step 0** — Adicionar na instrução:
- "Após a confirmação positiva do cliente, informe que vai consultar os contratos disponíveis. Exemplo: 'Perfeito, [nome]! Vou consultar seus contratos agora.'"
- Isso cria uma transição natural para o step 1.

**Step 1** — Reescrever instrução para ser proativa:
- "IMEDIATAMENTE ao receber qualquer mensagem neste passo, execute erp_contract_lookup com o CPF/CNPJ já identificado. NÃO espere o cliente pedir. NÃO pergunte o que ele deseja. NÃO transfira para humano. Sua PRIMEIRA ação deve ser chamar a ferramenta, depois apresentar os resultados numerados."
- Remover `transfer_to_human` do escopo implícito adicionando no texto: "A ferramenta transfer_to_human está PROIBIDA neste passo."

### Frente 2: Melhorar o llm_judge no procedure-runner (código)

Atualizar o prompt do `llm_judge` (linha ~450 do procedure-runner.ts) para incluir:
- A mensagem do usuário
- Se houve tool calls com sucesso neste turno

Prompt atual:
```
Dado o objetivo do passo: "{instruction}"
E a resposta do assistente: "{botReply}"
O objetivo foi cumprido?
```

Prompt melhorado:
```
Dado o objetivo do passo: "{instruction}"
Mensagem do usuário: "{userMessage}"
Houve chamada de ferramenta com sucesso neste turno: {sim/não}
Resposta do assistente: "{botReply}"
O objetivo deste passo foi cumprido? Responda APENAS "sim" ou "não".
```

## Resumo do fluxo corrigido

```text
Usuário: "boleto"
→ Step 0. Agente pede CPF.

Usuário: "12.059.400/0001-51"
→ erp_client_lookup. "Estou falando com Rei das Tecnologias?"
→ llm_judge: lookup feito mas sem confirmação → NÃO avança

Usuário: "sim"
→ Bot: "Perfeito, Rei das Tecnologias! Vou consultar seus contratos agora."
→ llm_judge: lookup + confirmação → AVANÇA para step 1

(qualquer mensagem seguinte, step 1)
→ Bot IMEDIATAMENTE chama erp_contract_lookup
→ Lista contratos numerados. Pede seleção.
→ llm_judge: contratos listados mas sem seleção → NÃO avança

Usuário: "3"
→ Bot confirma contrato selecionado → AVANÇA para step 2
→ erp_invoice_search → faturas
```

## Arquivos alterados

| Arquivo | Alteração |
|---|---|
| Nova migration SQL | Procedimento v9 com instruções reescritas para steps 0 e 1 |
| `supabase/functions/_shared/procedure-runner.ts` | Prompt do `llm_judge` (~linha 450) enriquecido com userMessage e lastToolSuccess |




# Corrigir fluxo de Cobrança de Fatura — confirmação de identidade e seleção de contrato

## Problemas identificados

1. Step 0 avança com `function_success` — não dá chance de confirmar identidade
2. Step 1 tem `transfer_to_human` disponível e instrução insuficiente — LLM transfere ao receber "7"
3. `user_confirmation` não reconhece seleção numérica como avanço válido

## Solução

Atualizar a `definition` JSONB do procedimento via migration SQL.

### Step 0 — Identificar cliente
- **advance_condition**: `"function_success"` → `"user_confirmation"`
- **instruction**: Após localizar o cliente, perguntar "Estou falando com [nome]?" e aguardar confirmação

### Step 1 — Listar contratos
- **advance_condition**: `"user_confirmation"` → `"llm_judge"`
  - `llm_judge` avalia se o objetivo do passo foi cumprido (listar + obter seleção). "7" + reply reconhecendo a seleção → "sim"
- **instruction**: Adicionar explicitamente:
  - "NÃO transfira para humano neste passo"
  - "Quando o cliente informar o número, confirme a seleção dizendo o endereço e plano escolhido"

### Steps 2 e 3 — Sem alteração

### Resumo do fluxo corrigido

```text
Usuário: "boleto"
→ Step 0 ativado. Agente pede CPF.

Usuário: "12.059.400/0001-51"
→ erp_client_lookup chamado. Sucesso.
→ advance_condition = user_confirmation → "12.059..." não é "sim" → fica no step 0.
→ Agente: "Estou falando com Rei das Tecnologias LTDA?"

Usuário: "sim"
→ user_confirmation → "sim" → avança para step 1.

(próximo turno, step 1)
→ erp_contract_lookup chamado. Lista contratos numerados.
→ llm_judge: objetivo cumprido? Não ainda (falta seleção) → fica no step 1.

Usuário: "7"
→ Agente confirma: "Contrato 855, Av. de acesso AR12, Plano Plus 500/100."
→ llm_judge: objetivo cumprido? Sim → avança para step 2.

(próximo turno, step 2)
→ erp_invoice_search chamado com filtro do contrato selecionado.
→ Apresenta faturas. Avança para step 3.
```

## Arquivo alterado

| Arquivo | Alteração |
|---|---|
| Nova migration SQL | Atualizar definition do procedimento (v7) com advance_conditions e instruções corrigidas |

## Detalhes técnicos da migration

A migration marca a versão atual como `is_current = false` e insere v7 com:
- Step 0: `advance_condition: "user_confirmation"`, instrução inclui confirmação de identidade
- Step 1: `advance_condition: "llm_judge"`, instrução inclui "NÃO transfira" e orientação para confirmar seleção
- Steps 2-3: mantidos


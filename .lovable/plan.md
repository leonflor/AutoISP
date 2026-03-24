

# Correcao: buscar faturas por contrato_id em vez de endereco

## Problema

Quando o usuario seleciona um contrato (ex: "5"), o sistema salva `selected_contract_id` no contexto. Porem, a ferramenta `erp_invoice_search` so aceita `cpf_cnpj` e `endereco` como parametros. Se o contrato nao tem endereco, o LLM nao consegue filtrar e pede o endereco ao usuario — mesmo ja tendo o `contrato_id` no contexto.

O driver (`buscarFaturas`) ja itera por `contratoId` internamente (linha 346-347). So falta expor esse filtro como parametro da ferramenta.

## Mudancas

### 1. `_shared/tool-catalog.ts` — adicionar parametro `contrato_id`
Adicionar `contrato_id` como parametro opcional em `erp_invoice_search`, com descricao clara de que deve ser usado quando disponivel no contexto (tem prioridade sobre endereco).

### 2. `_shared/tool-handlers.ts` — passar `contrato_id` ao driver
Extrair `args.contrato_id` e passar para `buscarFaturas`.

### 3. `_shared/erp-driver.ts` — aceitar `contrato_id` em `buscarFaturas`
Adicionar parametro opcional `contratoId?: string`. Quando fornecido, filtrar diretamente por esse ID sem precisar resolver via endereco. Logica simples: se `contratoId` foi passado, `allowedContratoIds = new Set([contratoId])`.

### 4. `_shared/procedure-runner.ts` — nao persistir campos nulos
Filtrar valores `null` em `resolveContractSelectionFromMessage` para que o LLM nunca veja `selected_contract_address: null` no contexto.

## Resultado esperado

```text
Usuario: 5
→ contexto: { selected_contract_id: "12345", selected_contract_plan: "Plano Plus 500/100" }
→ LLM chama erp_invoice_search(cpf_cnpj="12.059.400/0001-51", contrato_id="12345")
→ driver filtra faturas apenas do contrato 12345
→ retorna faturas sem pedir endereco
```

## Arquivos alterados

| Arquivo | Mudanca |
|---|---|
| `supabase/functions/_shared/tool-catalog.ts` | Adicionar `contrato_id` opcional em `erp_invoice_search` |
| `supabase/functions/_shared/tool-handlers.ts` | Passar `contrato_id` para `buscarFaturas` |
| `supabase/functions/_shared/erp-driver.ts` | Aceitar `contratoId` e filtrar direto por ele |
| `supabase/functions/_shared/procedure-runner.ts` | Nao salvar campos nulos no `collected_context` |


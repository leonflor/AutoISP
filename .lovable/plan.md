

# Correcao: Nomes de funcoes incompativeis entre Editor e Runtime

## Problema

O `ProcedureEditor` (linha 90-98) usa nomes hardcoded que **nao existem** no `TOOL_CATALOG` do runtime:

```text
Editor salva no banco         →  Runtime procura no TOOL_CATALOG
─────────────────────────────────────────────────────────────────
get_customer_by_document      →  erp_client_lookup          ✗
get_customer_by_email         →  (nao existe)               ✗
get_open_invoices             →  erp_invoice_search         ✗
get_service_status            →  (nao existe)               ✗
get_contract                  →  erp_contract_lookup        ✗
generate_payment_link         →  (nao existe)               ✗
send_invoice_by_email         →  (nao existe)               ✗
```

`buildStepTools` (linha 139) faz `TOOL_CATALOG[name]` — retorna `undefined` para todos. Resultado: so `transfer_to_human` e disponibilizado. O LLM transfere porque nao tem outra opcao.

## Plano

### 1. Sincronizar AVAILABLE_FUNCTIONS com o catalogo real

Em `src/components/admin/procedures/ProcedureEditor.tsx`, substituir a lista hardcoded (linhas 90-98) por uma derivada do catalogo frontend:

```typescript
const AVAILABLE_FUNCTIONS = TOOL_CATALOG
  .filter(t => t.handler !== 'transfer_to_human')
  .map(t => ({ handler: t.handler, label: t.display_name }));
```

Isso garante que os nomes salvos no banco correspondam aos que o runtime procura.

### 2. Migration para corrigir procedures existentes no banco

Renomear os handlers dentro do JSONB de todos os procedimentos ativos:

| Nome antigo (banco) | Nome correto (catalogo) |
|---|---|
| get_customer_by_document | erp_client_lookup |
| get_customer_by_email | erp_client_lookup |
| get_open_invoices | erp_invoice_search |
| get_contract | erp_contract_lookup |
| get_service_status | *(remover — nao existe)* |
| generate_payment_link | *(remover — nao existe)* |
| send_invoice_by_email | *(remover — nao existe)* |

### 3. Guardrail para ERP indisponivel com procedimento ativo

Em `context-builder.ts` (linha 288-289), quando `!hasErp` **e** `hasProcedure`, a instrucao atual diz "o recurso nao esta disponivel". Ajustar para:

```text
"O sistema ERP nao esta configurado. Informe ao usuario que a consulta
 esta temporariamente indisponivel. NAO transfira para humano a menos
 que o usuario solicite explicitamente."
```

## Arquivos a alterar

| Arquivo | Alteracao |
|---|---|
| `src/components/admin/procedures/ProcedureEditor.tsx` | Derivar AVAILABLE_FUNCTIONS do TOOL_CATALOG |
| `supabase/functions/_shared/context-builder.ts` | Guardrail especifico para !hasErp + hasProcedure |
| Nova migration SQL | Renomear handlers nos procedures existentes |

## Resultado esperado

Apos a correcao, ao enviar "boleto" seguido de CPF:
- Procedimento "Cobranca de fatura" e detectado (ja corrigido)
- Step 1 disponibiliza `erp_client_lookup` (nome correto)
- `buildStepTools` encontra no catalogo e injeta no OpenAI
- LLM chama `erp_client_lookup` com o CPF
- Nao ocorre transferencia automatica


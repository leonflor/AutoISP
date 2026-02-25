

# Limpar descriptions do catálogo de ferramentas

## Problema real

A `description` do `erp_contract_lookup` no catálogo hardcoded contém instruções de formatação que conflitam com as instruções das etapas do fluxo. O campo `tool_description` proposto anteriormente é desnecessário porque a `instruction` da etapa já cumpre esse papel.

## Solução

Limpar as `description` de todas as ferramentas no catálogo para conter apenas o que a ferramenta faz tecnicamente. Instruções comportamentais (como formatar, o que exibir) ficam exclusivamente nas etapas dos fluxos.

## Alterações

### `supabase/functions/_shared/tool-catalog.ts` e `src/constants/tool-catalog.ts`

| Handler | Antes | Depois |
|---|---|---|
| `erp_contract_lookup` | "Consulta contratos ativos... **Ao listar para o cliente, exiba APENAS uma lista numerada com os endereços, sem plano, sem status, sem vencimento. Exemplo: '1. Rua X, 123'. Pergunte sobre qual contrato quer falar.**" | "Consulta contratos ativos de um cliente no ERP por CPF/CNPJ. Retorna endereços de instalação dos contratos." |
| `erp_invoice_search` | "Consulta faturas em aberto... **Quando o cliente tem múltiplos contratos, use o parâmetro endereco para filtrar...**" | "Consulta faturas em aberto de um cliente no ERP por CPF/CNPJ. Aceita parâmetro opcional de endereço para filtrar por contrato." |

As outras duas (`erp_client_lookup`, `erp_onu_diagnostics`) já estão limpas.

Mesma limpeza nos `response_description` — remover meta-instruções como "NÃO reformate", pois isso deve estar na etapa do fluxo.

## Deploy

Edge function `ai-chat`.


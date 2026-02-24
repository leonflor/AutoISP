

# Remover `erp_search` do Catalogo de Tools de IA

## Contexto

O `erp_search` (busca de clientes no ERP por CPF/CNPJ) e uma funcionalidade da pagina de **Assinantes** (`fetch-erp-clients` edge function), nao uma ferramenta que o agente de IA deve invocar via function calling. As tools de IA devem ser apenas `erp_invoice_search` (faturas) e `onu_diagnostics` (sinal ONU).

A funcao `searchClients()` no `erp-driver.ts` **nao sera removida** — ela continua sendo usada pela edge function `fetch-erp-clients` e pelo handler de `erp_search` no `tool-handlers.ts`. Porem, o `erp_search` sera removido de todos os catalogos e referencias como "tool de IA".

## Arquivos a Alterar

### 1. `supabase/functions/_shared/tool-catalog.ts`
- Remover a entrada `erp_search` do `TOOL_CATALOG`
- Ficam apenas `erp_invoice_search` e `onu_diagnostics`

### 2. `supabase/functions/_shared/tool-handlers.ts`
- Remover o `erpSearchHandler` e sua entrada no registry `handlers`
- Remover import de `searchClients` (so usado pelo handler removido; `fetchClientSignal` e `fetchInvoices` permanecem)

### 3. `src/constants/tool-catalog.ts`
- Remover a entrada `erp_search` do array `TOOL_CATALOG`
- Ficam 2 tools: `erp_invoice_search` e `onu_diagnostics`

### 4. Guia do Projeto — 4 arquivos com referencias

| Arquivo | Linha | Alteracao |
|---|---|---|
| `src/components/guia-projeto/integracoes/ERPIntegration.tsx` | ~613 | Remover a linha `erp_search → searchClients()` da lista de tools; manter `searchClients` como funcao interna do driver |
| `src/components/guia-projeto/integracoes/OpenAIIntegration.tsx` | ~315, ~337 | Remover `erp_search` dos exemplos de tool_handler e da tabela de tools |
| `src/components/guia-projeto/integracoes/FluxosConversacionaisSection.tsx` | ~135 | Trocar exemplo `erp_search` por `erp_invoice_search` |
| `src/components/guia-projeto/features/modules/IAFeatures.tsx` | ~204 | Remover `erp_search` da descricao do catalogo de ferramentas |

## Resumo de Impacto

- **Tools de IA restantes:** 2 (`erp_invoice_search`, `onu_diagnostics`)
- **Funcionalidade de busca de assinantes:** Intacta (`fetch-erp-clients` + `searchClients()` no driver)
- **Nenhuma edge function precisa ser redeployada** alem do bundle `_shared` que e incluido automaticamente


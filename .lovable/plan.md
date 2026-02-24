
# Plano Atual — Concluído ✅

## Tool `erp_client_lookup` implementada

- **Backend catalog** (`tool-catalog.ts`): entrada adicionada com JSON Schema (`cpf_cnpj`, minLength: 11)
- **Backend handler** (`tool-handlers.ts`): `erpClientLookupHandler` usando `searchClients()` com filtro exato por CPF/CNPJ
- **Frontend catalog** (`src/constants/tool-catalog.ts`): entrada espelho adicionada
- **Guia do Projeto**: `IAFeatures.tsx` e `OpenAIIntegration.tsx` atualizados com 3 tools

### Tools de IA ativas: 3
| Tool | Descrição |
|---|---|
| `erp_invoice_search` | Consulta faturas em aberto |
| `onu_diagnostics` | Diagnóstico de sinal ONU |
| `erp_client_lookup` | Busca cliente por CPF/CNPJ → retorna `cliente_erp_id` |



# Fluxo de Cobrança v16 — Implementado

## Mudanças realizadas

### 1. Context Namespacing (procedure-runner.ts)
- `mergeToContext` agora aceita `toolName` e salva resultados em chaves nomeadas:
  - `erp_contract_lookup` → `contract_options`
  - `erp_invoice_search` → `invoice_options` + auto-seleção se 1 fatura
- Resolvers adicionados: `resolveInvoiceSelectionFromMessage`, `resolvePaymentMethodFromMessage`
- Limpeza automática de chaves downstream ao re-consultar contratos

### 2. Remoção de `dias_atraso` e `linha_digitavel` do FaturaResponse
- `response-models.ts`: campos removidos
- `erp-driver.ts`: cálculo de `dias_atraso` removido, `linha_digitavel` não mais populado

### 3. Nova ferramenta `erp_linha_digitavel`
- `ixc.ts`: `ixc_linha_digitavel` busca `fn_areceber` por ID
- `erp-driver.ts`: `buscarLinhaDigitavel`
- `tool-catalog.ts` e `tool-handlers.ts`: registrada
- `src/constants/tool-catalog.ts`: mirror frontend

### 4. Procedimento v16 (5 passos)
- Passo 0: Identificar cliente (user_confirmation)
- Passo 1: Listar contratos (data_collected: selected_contract_id)
- Passo 2: Consultar faturas (data_collected: selected_invoice_id)
- Passo 3: Oferecer modalidades (data_collected: selected_payment_method)
- Passo 4: Executar entrega (function_success → end_procedure)

## Arquivos alterados (8 + migration)

| Arquivo | Mudança |
|---|---|
| `response-models.ts` | Removido `dias_atraso`/`linha_digitavel`, adicionado `LinhaDigitavelResponse` |
| `erp-driver.ts` | Removido cálculo `dias_atraso`, adicionado `buscarLinhaDigitavel` |
| `erp-types.ts` | Adicionado `fetchLinhaDigitavel` na interface |
| `erp-providers/ixc.ts` | Adicionado `ixc_linha_digitavel` |
| `tool-catalog.ts` (backend) | Adicionado `erp_linha_digitavel`, atualizado `erp_invoice_search` |
| `tool-handlers.ts` | Adicionado handler `erp_linha_digitavel` |
| `procedure-runner.ts` | Context namespacing, 3 resolvers, mergeToContext com toolName |
| `src/constants/tool-catalog.ts` | Mirror frontend atualizado |
| Migration SQL | Procedimento v16 com 5 passos e `required_fields` |

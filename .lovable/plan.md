

# Renomear `onu_diagnostics` → `erp_onu_diagnostics`

## Objetivo

Padronizar a nomenclatura da tool de diagnóstico de sinal ONU para seguir o mesmo padrão `erp_` das demais tools (`erp_invoice_search`, `erp_client_lookup`, `erp_contract_lookup`).

## Alterações

### 1. `supabase/functions/_shared/tool-catalog.ts`
- Renomear chave `onu_diagnostics` → `erp_onu_diagnostics`
- Atualizar `handler: "erp_onu_diagnostics"`
- Atualizar referência na `response_description` do `erp_client_lookup` (linha 76: trocar "onu_diagnostics" por "erp_onu_diagnostics")

### 2. `supabase/functions/_shared/tool-handlers.ts`
- Renomear registro no `handlers` map: `onu_diagnostics` → `erp_onu_diagnostics` (linha 194)
- Atualizar comentário do handler (linha 70)

### 3. `src/constants/tool-catalog.ts`
- Atualizar `handler: "erp_onu_diagnostics"` (linha 29)

### 4. `src/components/guia-projeto/features/modules/IAFeatures.tsx`
- Atualizar referência textual de `onu_diagnostics` → `erp_onu_diagnostics` (linha 204)

### 5. `src/components/guia-projeto/integracoes/OpenAIIntegration.tsx`
- Atualizar referência de `onu_diagnostics` → `erp_onu_diagnostics` (linha 344)

### 6. `src/components/guia-projeto/integracoes/ERPIntegration.tsx`
- Atualizar referência de `onu_diagnostics` → `erp_onu_diagnostics` (linha 614)

## Impacto

Apenas renomeação de strings — nenhuma lógica alterada. A função `buildOpenAITools()` usa o campo `handler` dinamicamente, então o OpenAI function calling receberá automaticamente o novo nome. O handler backend continua apontando para a mesma função `onuDiagnosticsHandler`.


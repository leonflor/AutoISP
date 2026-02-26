

## Plano: Remover tudo relacionado a `/botao_rel_22991`

### Arquivos a DELETAR

1. **`supabase/functions/fetch-onu-signal/index.ts`** — Edge Function inteira dedicada ao diagnóstico ONU
2. **`src/hooks/painel/useOnuSignal.ts`** — Hook frontend que chama `fetch-onu-signal`
3. **`src/components/painel/subscribers/SignalDiagnosticsDialog.tsx`** — Dialog de diagnóstico detalhado

### Arquivos a EDITAR

4. **`supabase/functions/_shared/erp-providers/ixc.ts`**
   - Remover função `ixc_onu_diagnostics` (linhas 176-199)
   - Remover `fetchRawSignal: ixc_onu_diagnostics` do export do provider

5. **`supabase/functions/_shared/erp-driver.ts`**
   - Remover import de `analyzeOnuSignal`, `formatSignalReport` (linha 7)
   - Remover função `mapSignalFromProvider` (linhas 145-157)
   - Remover função `fetchClientSignal` (linhas 754-785)

6. **`supabase/functions/_shared/erp-types.ts`**
   - Remover `RawSignalData` interface (linhas 121-125)
   - Remover `fetchRawSignal?` do `ErpProviderDriver` (linha 179)

7. **`supabase/functions/_shared/tool-handlers.ts`**
   - Remover import de `fetchClientSignal` (linha 2)
   - Remover handler `onuDiagnosticsHandler` (linhas 77-110)
   - Remover `erp_onu_diagnostics` do registry (linha 223)

8. **`supabase/functions/_shared/tool-catalog.ts`**
   - Remover entrada `erp_onu_diagnostics` (linhas 42-62)

9. **`src/constants/tool-catalog.ts`**
   - Remover entrada `erp_onu_diagnostics` (linhas 29-40)

10. **`src/pages/painel/Subscribers.tsx`**
    - Remover import de `SignalDiagnosticsDialog`
    - Remover estado `diagClient` e lógica de clique no `SignalBadge`
    - Remover renderização do `<SignalDiagnosticsDialog>`
    - `SignalBadge` permanece (usa dados de `/radpop_radio_cliente_fibra`, não do `botao_rel_22991`)

11. **`supabase/config.toml`**
    - Remover bloco `[functions.fetch-onu-signal]`

### Arquivos de documentação (referências textuais)

12. **`src/components/guia-projeto/integracoes/ERPIntegration.tsx`**
    - Remover linha da tabela `fetch-onu-signal` (linhas 597-600)
    - Remover referência `erp_onu_diagnostics` na lista de tools (linha 614)
    - Remover bloco "Diagnóstico ONU" (linhas 656-659)

13. **`src/components/guia-projeto/integracoes/OpenAIIntegration.tsx`**
    - Remover linha da tabela `erp_onu_diagnostics` (linhas 343-346)

14. **`src/components/guia-projeto/ImplementacaoTab.tsx`**
    - Remover `fetch-onu-signal` da lista de functions (linha 80)
    - Remover referência `onu-signal-analyzer.ts` (linha 778)

15. **`src/components/guia-projeto/features/modules/IAFeatures.tsx`**
    - Atualizar descrição removendo `erp_onu_diagnostics` do texto (linha 204)

### O que NÃO será removido

- **`onu-signal-analyzer.ts`** — `classifySignalDb()` continua em uso pelo fluxo batch de `/radpop_radio_cliente_fibra`
- **`SignalBadge.tsx`** — componente de badge na lista de assinantes (dados vêm do batch, não do `botao_rel_22991`)

### Edge Function a deletar do deploy

- `fetch-onu-signal`


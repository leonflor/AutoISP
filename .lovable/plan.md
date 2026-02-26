

## Plano: Remover `ixc_contract_lookup_detailed` e `fetchContratosDetalhados`

### Arquivos a editar

1. **`supabase/functions/_shared/erp-providers/ixc.ts`**
   - Remover função `ixc_contract_lookup_detailed` (~linhas 126-143)
   - Remover `fetchContratosDetalhados: ixc_contract_lookup_detailed` do export do provider

2. **`supabase/functions/_shared/erp-types.ts`**
   - Remover interface `RawContratoDetalhado` (~linhas 93-101)
   - Remover `fetchContratosDetalhados?` do `ErpProviderDriver` (linhas 174-175)

3. **`supabase/functions/_shared/erp-driver.ts`**
   - Remover import de `RawContratoDetalhado` (linha 16)
   - Remover função `mapContratoDetalhadoFromProvider` (linhas 74-89)
   - Refatorar `fetchClientContracts` (linhas 656-667): usar sempre `fetchContratos` com fallback para campos de endereço extraídos diretamente do raw (o endpoint `/cliente_contrato` já retorna endereço, número, bairro, etc.)

### Detalhe técnico

O endpoint `/cliente_contrato` já retorna os campos de endereço (`endereco`, `numero`, `bairro`, `cidade`, `estado`, `cep`, `complemento`). A função "detalhada" era redundante — fazia a mesma chamada HTTP que `ixc_contract_lookup` mas com log extra. Após a remoção, `fetchClientContracts` usará `fetchContratos` e extrairá os campos de endereço diretamente do raw via `mapContratoFromProvider` expandido (ou inline no bloco existente).


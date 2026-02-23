
# Corrigir Join de Contratos: usar radusuarios.id_contrato

## Problema

O codigo atual faz o join de contratos via `id_cliente` (linha 158), buscando **todos** os contratos do cliente. Isso causa duplicacao de registros (1120 radusuarios virando 1338 linhas).

O campo correto para o join e `radusuarios.id_contrato`, que se relaciona diretamente com `cliente_contrato.id` -- garantindo **1 registro por usuario RADIUS**.

## Mudanca

### Arquivo: `supabase/functions/_shared/erp-providers/ixc.ts`

1. Adicionar `id_contrato` a interface `IxcRadusuario` (linha 11)
2. Trocar o mapa de contratos: em vez de `contratosByClienteId` (Map por id_cliente), usar `contratosById` (Map por id do contrato)
3. Na iteracao de `radRecs`, buscar o contrato via `r.id_contrato` em vez de `clienteId`
4. Remover o loop que cria multiplos registros por contrato -- agora sera sempre 1 registro

### Logica resultante (pseudo-codigo):

```text
// Mapa de contratos indexado por ID do contrato
contratosById = Map<contrato.id, contrato>

// Para cada radusuario:
contrato = contratosById.get(r.id_contrato) || null
results.push({ ...dados, contrato_id: contrato?.id, plano: contrato?.contrato, ... })
```

### Nenhum outro arquivo precisa ser alterado

A Edge Function `fetch-erp-clients` sera reimplantada apos a mudanca.

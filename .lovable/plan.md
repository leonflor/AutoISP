

# Implementar Arquitetura ERP 3 Camadas + Atualizar Guia

## Resumo

Refatorar a integracao ERP em 3 camadas com responsabilidades claras, origem obrigatoria em todo registro, e atualizar o guia de projeto para refletir a arquitetura real.

## Arquitetura

```text
CAMADA 1 - Tipos Padrao (erp-types.ts)
  Define O QUE sera exibido. Interfaces com provider obrigatorio.

CAMADA 2 - Driver (erp-driver.ts)
  Decide DE ONDE buscar, normaliza status/conexao, injeta origem.

CAMADA 3 - Providers (erp-providers/*.ts)
  Conexao efetiva com cada ERP. Retorna dados brutos.
```

## Arquivos Criados (6)

### 1. `supabase/functions/_shared/erp-types.ts`
- Tipos: `ErpProvider`, `ContractStatus`, `ErpClient`, `ErpCredentials`, `TestResult`
- Mapa `PROVIDER_DISPLAY_NAMES`
- Interface `ErpProviderDriver` (contrato para Camada 3)
- Tipos brutos: `RawErpClient`, `RawSignalData`
- Campo `field_availability: Record<string, boolean>` em `ErpClient`
- `provider` e `provider_name` obrigatorios em toda interface

### 2. `supabase/functions/_shared/erp-providers/ixc.ts`
- Implementa `ErpProviderDriver`
- Move logica de `fetchIxcClients` retornando `RawErpClient[]` (sem normalizar status)
- Move `testIxcConnection` (duplicada em test-erp e save-erp-config)
- Implementa `fetchRawSignal` via `/botao_rel_22991`
- `supportedFields()` retorna `["signal_db", "login", "plano", "contrato"]`

### 3. `supabase/functions/_shared/erp-providers/sgp.ts`
- Implementa `ErpProviderDriver`
- Move logica de `fetchSgpClients` retornando dados brutos
- Move `testSgpConnection`
- `fetchRawSignal` nao implementado (SGP nao suporta)
- `supportedFields()` retorna `["login", "plano"]`

### 4. `supabase/functions/_shared/erp-providers/mk.ts`
- Implementa `ErpProviderDriver`
- Move logica de `fetchMkClients` retornando dados brutos
- Move `testMkConnection`
- `supportedFields()` retorna `["login", "plano"]`

### 5. `supabase/functions/_shared/erp-providers/index.ts`
- Registry: `getProvider(name: ErpProvider): ErpProviderDriver`
- Mapa de providers registrados
- Lanca erro para provider desconhecido

### 6. `supabase/functions/_shared/erp-driver.ts`
- `resolveCredentials(config, encryptionKey)` -- decrypt AES-256-GCM
- `normalizeClient(raw, provider, providerName, supportedFields)` -- normaliza status, conexao, injeta provider obrigatorio, marca `field_availability`
- `fetchAllClients(supabaseAdmin, ispId, encryptionKey)` -- agrega todos ERPs
- `searchClients(supabaseAdmin, ispId, encryptionKey, query)` -- busca filtrada
- `testConnection(provider, credentials)` -- delega para provider
- `fetchClientSignal(supabaseAdmin, ispId, encryptionKey, clientId)` -- diagnostico ONU
- Tabela de normalizacao de status por ERP:
  - IXC: campo ativo "S"/"N", contrato.status "A"/"S"/"C"
  - SGP: "ativo"/"off"/"suspenso"
  - MK: "ativo"/"bloqueado" (toLowerCase)
  - Valor desconhecido -> "desconhecido"

## Arquivos Editados (7)

### 7. `supabase/functions/_shared/erp-fetcher.ts`
- Transforma em fachada retrocompativel
- Re-exporta `ErpClient`, `decrypt` de `erp-types.ts`
- `fetchIxcClients`, `fetchSgpClients`, `fetchMkClients` delegam para driver
- `searchErpClient` delega para `driver.searchClients()`

### 8. `supabase/functions/fetch-erp-clients/index.ts`
- Remove switch/case e logica de decrypt inline
- Chama `fetchAllClients()` do driver (~40 linhas)

### 9. `supabase/functions/test-erp/index.ts`
- Remove 3 funcoes de teste duplicadas (~270 linhas)
- Importa `getProvider` e `resolveCredentials` do driver
- Chama `driver.testConnection()` (~80 linhas)

### 10. `supabase/functions/save-erp-config/index.ts`
- Remove 3 funcoes de teste duplicadas (~200 linhas)
- Reutiliza `driver.testConnection()`
- Mantem logica de encrypt e upsert

### 11. `supabase/functions/fetch-onu-signal/index.ts`
- Remove logica IXC inline
- Chama `driver.fetchClientSignal()` (~40 linhas)

### 12. `supabase/functions/_shared/tool-handlers.ts`
- `erpSearchHandler` usa `driver.searchClients()`
- `onuDiagnosticsHandler` usa `driver.fetchClientSignal()`
- Remove imports diretos de `decrypt` e logica IXC inline

### 13. `src/components/guia-projeto/integracoes/ERPIntegration.tsx`
- Atualizar diagrama de arquitetura para mostrar 3 camadas (Tipos, Driver, Providers)
- Atualizar "Adapter Pattern" para refletir `ErpProviderDriver` real
- Atualizar tabela de secrets para modelo real (credenciais em `erp_configs` com AES-256-GCM, sem secrets individuais por ERP)
- Atualizar schema SQL para refletir tabela `erp_configs` real (com `isp_id` em vez de `tenant_id`)
- Remover tabelas aspiracionais nao implementadas (`erp_sync_logs`, `erp_field_mappings`, `erp_webhooks`, `erp_clientes`, `erp_faturas`, `erp_contratos`)
- Atualizar Edge Functions para listar as reais (`fetch-erp-clients`, `test-erp`, `save-erp-config`, `fetch-onu-signal`)
- Atualizar secao de seguranca para refletir modelo real (isolamento por `isp_id` via `isp_users`)
- Adicionar secao "Origem Obrigatoria" explicando que todo registro tem `provider` + `provider_name`
- Adicionar secao "Disponibilidade de Campos" explicando `field_availability`

## Ordem de Implementacao

1. Criar `erp-types.ts`
2. Criar os 3 providers (ixc, sgp, mk) + registry
3. Criar `erp-driver.ts`
4. Atualizar `erp-fetcher.ts` como fachada
5. Simplificar as 4 edge functions
6. Atualizar `tool-handlers.ts`
7. Atualizar `ERPIntegration.tsx` (guia)
8. Deploy e teste das edge functions

## Frontend

Sem alteracoes funcionais. A interface `ErpClient` no hook `useErpClients.ts` ja possui `provider` e `provider_name`. O campo `field_availability` e adicionado de forma opcional.

## Beneficio

Para adicionar um novo ERP (ex: Hubsoft):
1. Criar `erp-providers/hubsoft.ts` implementando `ErpProviderDriver`
2. Registrar no `erp-providers/index.ts`
3. Adicionar mapeamento de status no driver
4. Adicionar entrada em `PROVIDER_DISPLAY_NAMES`

Zero alteracoes nas edge functions, no frontend ou nos tool handlers.

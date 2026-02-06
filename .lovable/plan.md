

# Corrigir Rota de Validacao do SGP para `/api/ura/clientes`

## Problema

As Edge Functions `save-erp-config` e `test-erp` usam a rota `/api/clientes` para validar a conexao com o SGP, mas a rota correta e `/api/ura/clientes`.

## Alteracoes

### 1. `supabase/functions/save-erp-config/index.ts`

Na funcao `testSgpConnection`, alterar a URL de teste:

```text
// De:
const testUrl = `${baseUrl}/api/clientes`;
// Para:
const testUrl = `${baseUrl}/api/ura/clientes`;
```

### 2. `supabase/functions/test-erp/index.ts`

Na funcao que testa SGP, aplicar a mesma correcao:
- Adicionar normalizacao de URL (remover `/api` duplicado, como ja feito em `save-erp-config`)
- Alterar a rota de `/api/clientes` para `/api/ura/clientes`

### Requer redeploy das duas Edge Functions

Sem alteracao de banco. Sem novas dependencias.




## Corrigir URL Duplicada na Integracao IXC

### Problema
O codigo concatena `/webservice/v1/cliente` a URL fornecida pelo usuario. Se o usuario informar `https://central.supernetfibra.com.br/webservice/v1`, a URL final fica com o caminho duplicado: `.../webservice/v1/webservice/v1/cliente`.

### Solucao
Normalizar a URL base antes de montar o endpoint, removendo `/webservice/v1` do final se ja estiver presente. Isso sera aplicado nos 3 arquivos que fazem requisicoes IXC.

### Arquivos a Modificar

| Arquivo | Funcao afetada |
|---|---|
| `supabase/functions/save-erp-config/index.ts` | `testIxcConnection` (linhas 66-131) |
| `supabase/functions/test-erp/index.ts` | `testIxcConnection` (linhas 57-129) |
| `supabase/functions/_shared/erp-fetcher.ts` | `fetchIxcClients` (linhas 48-101) |

### Implementacao

Adicionar normalizacao no inicio de cada funcao IXC:

```ts
// Normalizar URL - remover /webservice/v1 se já presente
let baseUrl = apiUrl.replace(/\/+$/, '');
if (baseUrl.endsWith('/webservice/v1')) {
  baseUrl = baseUrl.slice(0, -'/webservice/v1'.length);
}

// Usar baseUrl no lugar de apiUrl
const response = await fetch(`${baseUrl}/webservice/v1/cliente`, { ... });
```

A mesma logica ja existe para o SGP (que remove `/api` do final). Apenas replicamos o padrao para o IXC.

### Resultado
Com a URL `https://central.supernetfibra.com.br/webservice/v1`, o sistema montara corretamente:
- `https://central.supernetfibra.com.br/webservice/v1/cliente`

E se o usuario informar apenas `https://central.supernetfibra.com.br`, tambem funcionara:
- `https://central.supernetfibra.com.br/webservice/v1/cliente`


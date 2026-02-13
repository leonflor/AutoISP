

## Corrigir Mensagem de Erro ao Salvar Configuracao IXC

### Problema

Quando a edge function `save-erp-config` retorna um erro (status 400, 401, 403, etc.), o Supabase JS encapsula isso em um `FunctionsHttpError` cuja propriedade `message` e generica ("Edge Function returned a non-2xx status code"). A mensagem real do erro (ex: "Token invalido ou expirado", "Erro HTTP 401") fica escondida dentro de `error.context`, que e um objeto Response.

O codigo atual em `useErpConfigs.ts` faz:
```ts
if (error) throw error;  // <-- lanca o FunctionsHttpError generico
```

E no `IxcConfigDialog.tsx` captura:
```ts
onError: (error) => {
  setFormError(error.message);  // <-- mostra "Edge Function returned a non-2xx status code"
}
```

### Solucao

Alterar o `saveConfig` mutation em `useErpConfigs.ts` para extrair a mensagem real do corpo da resposta usando `error.context.json()` quando o erro for do tipo `FunctionsHttpError`.

### Arquivo a Modificar

| Arquivo | Alteracao |
|---|---|
| `src/hooks/painel/useErpConfigs.ts` | Extrair mensagem de erro detalhada do contexto da resposta HTTP |

### Implementacao Tecnica

```ts
// Em useErpConfigs.ts, na mutationFn do saveConfig:
import { FunctionsHttpError } from '@supabase/supabase-js';

mutationFn: async (data: SaveErpConfigData) => {
  const { data: result, error } = await supabase.functions.invoke(
    'save-erp-config',
    { body: data }
  );

  if (error) {
    // Extrair mensagem real do corpo da resposta
    if (error instanceof FunctionsHttpError) {
      const errorBody = await error.context.json();
      throw new Error(errorBody.error || 'Erro ao salvar configuracao');
    }
    throw error;
  }

  if (result?.error) {
    throw new Error(result.error);
  }

  return result;
},
```

### Resultado Esperado

Ao inves de ver "Edge Function returned a non-2xx status code", o usuario vera mensagens especificas como:
- "Token invalido ou expirado. Gere um novo no IXC."
- "Endpoint nao encontrado. Verifique a URL do servidor."
- "Erro de certificado SSL. Marque 'Certificado Self-Signed' se aplicavel."
- "Erro HTTP 401"

Essas mensagens ja existem no backend -- o problema era apenas que o frontend nao as extraia corretamente.


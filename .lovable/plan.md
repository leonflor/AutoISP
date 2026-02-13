

## Alterar Autenticacao IXC para Login + Senha

### Problema Atual
O formulario IXC pede um unico campo "Token de Acesso", mas a API do IXC usa autenticacao **Basic Auth** no formato `base64(login:senha)`. O usuario precisa informar **login** e **senha** separadamente, e o sistema deve montar o token automaticamente.

### Alteracoes

| Arquivo | O que muda |
|---|---|
| `src/components/painel/erp/IxcConfigDialog.tsx` | Substituir campo "Token" por dois campos: "Login" e "Senha" |
| `supabase/functions/save-erp-config/index.ts` | Receber `username` + `password` ao inves de `token`, montar o Basic auth header com `btoa(login:senha)` |
| `supabase/functions/test-erp/index.ts` | Mesma alteracao na funcao `testIxcConnection` |
| `supabase/functions/_shared/erp-fetcher.ts` | Atualizar `fetchIxcClients` para receber e usar login+senha decodificados ou o token montado |

### Detalhes Tecnicos

**1. IxcConfigDialog.tsx**
- Remover campo `token` do schema Zod
- Adicionar campos `login` (string obrigatoria) e `senha` (string obrigatoria)
- No `onSubmit`, enviar `credentials: { username: data.login, password: data.senha }` ao inves de `credentials: { token }`
- Atualizar labels, placeholders e instrucoes de ajuda

**2. save-erp-config/index.ts**
- Na validacao do case `ixc`, exigir `username` e `password` ao inves de `token`
- Na funcao `testIxcConnection`, receber `username` e `password`, montar o token com:
  ```ts
  const token = btoa(`${username}:${password}`);
  const authHeader = `Basic ${token}`;
  ```
- Criptografar a `password` separadamente e salvar `username` em texto claro (igual ao MK)
- Ajustar `keyToEncrypt` para usar a password

**3. test-erp/index.ts**
- Atualizar `testIxcConnection` com a mesma logica de montar Basic auth a partir de username+password descriptografados do banco

**4. erp-fetcher.ts**
- Na funcao `fetchIxcClients`, receber `username` e `password` ao inves de `token`, montar o Basic auth header internamente

### Fluxo de Autenticacao

O token Basic Auth sera montado assim:
```
Authorization: Basic base64(login:senha)
```

Exemplo: login `admin`, senha `123456` resulta em:
```
Authorization: Basic YWRtaW46MTIzNDU2
```

### Armazenamento
- `username` salvo em texto claro na coluna `username` da tabela `erp_configs`
- `password` criptografada com AES-256-GCM na coluna `password_encrypted`
- `masked_key` exibira os primeiros/ultimos caracteres do login para identificacao visual

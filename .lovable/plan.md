
# Corrigir Erro "Invalid key length" na Criptografia AES-256-GCM

## Diagnostico

Os logs da Edge Function `save-erp-config` revelam a causa raiz:

```
21:14:19 INFO [SGP] Response status: 200         <-- conexao OK!
21:14:19 ERROR Error: DataError: Invalid key length  <-- crash ao criptografar
```

O teste de conexao com o SGP funciona quando as credenciais estao corretas (retorno 200). Porem, ao tentar salvar, a funcao `encrypt()` falha porque a `ENCRYPTION_KEY` armazenada nos Secrets nao tem o tamanho correto.

**AES-256-GCM exige uma chave de exatamente 32 bytes (256 bits).** Quando codificada em base64, isso resulta em uma string de 44 caracteres. A chave atual provavelmente tem um tamanho diferente.

## Solucao

### 1. Gerar uma nova ENCRYPTION_KEY valida

Uma chave AES-256 valida em base64 pode ser gerada assim (em qualquer terminal):

```bash
openssl rand -base64 32
```

Isso produz uma string de 44 caracteres, como por exemplo:
`k7G2qH8xNmP3rT5vB9wY1zA4cE6fI0jK2lM4nO6pQ8=`

### 2. Atualizar o Secret no projeto

Acessar as configuracoes do projeto e atualizar o valor de `ENCRYPTION_KEY` com a nova chave gerada.

### 3. Adicionar validacao no codigo da Edge Function

Alterar `supabase/functions/save-erp-config/index.ts` para validar o tamanho da chave antes de tentar criptografar, retornando um erro claro caso esteja incorreta:

```typescript
// Na funcao encrypt(), antes do importKey:
const keyBytes = Uint8Array.from(atob(keyBase64), (c) => c.charCodeAt(0));
if (keyBytes.length !== 32) {
  throw new Error(`ENCRYPTION_KEY invalida: esperado 32 bytes, recebido ${keyBytes.length}`);
}
```

E no handler principal, ao verificar a `ENCRYPTION_KEY`:

```typescript
const encryptionKey = Deno.env.get("ENCRYPTION_KEY");
if (!encryptionKey) {
  // ... erro existente
}

// Validar tamanho da chave
try {
  const keyBytes = Uint8Array.from(atob(encryptionKey), (c) => c.charCodeAt(0));
  if (keyBytes.length !== 32) {
    console.error(`ENCRYPTION_KEY has ${keyBytes.length} bytes, expected 32`);
    return new Response(
      JSON.stringify({ error: "Chave de criptografia com tamanho invalido. Contate o administrador." }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
} catch {
  return new Response(
    JSON.stringify({ error: "Chave de criptografia mal formatada" }),
    { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
```

### 4. Aplicar a mesma validacao em `test-erp/index.ts`

Se essa funcao tambem usa criptografia, aplicar a mesma validacao.

### 5. Re-deploy das Edge Functions

Redeployar `save-erp-config` e `test-erp` apos as alteracoes.

## Sobre o erro 403 do SGP

Nos logs mais recentes, o SGP retornou `403 Forbidden`. Isso indica que as credenciais (token/app) estao incorretas ou sem permissao. Isso e um problema de configuracao no SGP, nao no codigo. A mensagem de erro ja e exibida corretamente no modal ("Acesso negado. Verifique as permissoes do token.").

## Resumo

| Item | Acao |
|---|---|
| `ENCRYPTION_KEY` (Secret) | Gerar nova chave com `openssl rand -base64 32` e atualizar |
| `save-erp-config/index.ts` | Validar tamanho da chave antes de criptografar |
| `test-erp/index.ts` | Mesma validacao (se aplicavel) |
| Deploy | Re-deploy das funcoes |

Sem alteracao de banco. Sem novas dependencias.

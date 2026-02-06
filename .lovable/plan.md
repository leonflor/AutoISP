
# Corrigir Autenticacao SGP e Comportamento dos Modais ERP

## Problemas Identificados

### 1. Autenticacao SGP incorreta
A documentacao oficial do SGP (`https://bookstack.sgp.net.br/books`) indica que o metodo "Token e App" exige envio de `token` e `app` no **corpo** da requisicao via **POST**, nao no header `Authorization: Bearer`. Atualmente o codigo usa `GET` com header Bearer, o que causa erro.

### 2. Modal fecha ao clicar fora
Os tres dialogs (SGP, IXC, MK) usam `onOpenChange={(isOpen) => !isOpen && onClose()}`, que fecha o modal ao clicar fora, perdendo dados digitados.

### 3. Erro nao exibido no modal
Erros sao exibidos apenas via `toast`. O modal deveria permanecer aberto e mostrar o erro inline.

---

## Alteracoes Planejadas

### A. Edge Functions (SGP - metodo de autenticacao)

**Arquivos:** `supabase/functions/test-erp/index.ts` e `supabase/functions/save-erp-config/index.ts`

Alterar `testSgpConnection` em ambos:
- Metodo: `GET` para `POST`
- Remover header `Authorization: Bearer`
- Enviar `token`, `app` e filtro dummy (`cpfcnpj=00000000000`) no body via `URLSearchParams`
- Aceitar parametro `app` (username) na funcao

```typescript
async function testSgpConnection(apiUrl: string, token: string, app: string): Promise<TestResult> {
  let baseUrl = apiUrl.replace(/\/+$/, '');
  if (baseUrl.endsWith('/api')) baseUrl = baseUrl.slice(0, -4);
  const testUrl = `${baseUrl}/api/ura/clientes`;

  const body = new URLSearchParams();
  body.append('token', token);
  body.append('app', app);
  body.append('cpfcnpj', '00000000000');

  const response = await fetch(testUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString()
  });
  // ... tratamento de erros ...
}
```

Ajustar chamadas onde `testSgpConnection` e invocada para passar `credentials.username` como `app`.

### B. SgpConfigDialog - Adicionar campo "App" e corrigir modal

**Arquivo:** `src/components/painel/erp/SgpConfigDialog.tsx`

1. Adicionar campo `app` no schema zod (obrigatorio)
2. Adicionar campo de input "Nome do App" no formulario
3. Enviar `app` como `username` nas credentials: `credentials: { token, username: app }`
4. Adicionar `onInteractOutside` e `onEscapeKeyDown` no `DialogContent` para impedir fechamento acidental
5. Exibir erro inline via estado local + Alert quando `saveConfig` falhar (manter modal aberto)
6. Atualizar link da documentacao para `https://bookstack.sgp.net.br/books`

### C. IxcConfigDialog e MkConfigDialog - Corrigir modal

**Arquivos:** `src/components/painel/erp/IxcConfigDialog.tsx` e `MkConfigDialog.tsx`

1. Adicionar `onInteractOutside={(e) => e.preventDefault()}` no `DialogContent`
2. Adicionar `onEscapeKeyDown={(e) => e.preventDefault()}` no `DialogContent`
3. Exibir erro inline via estado local + Alert quando `saveConfig` falhar

### D. Redeploy das Edge Functions

Apos alteracoes, redeployar `save-erp-config` e `test-erp`.

---

## Secao Tecnica - Resumo de Arquivos

| Arquivo | Alteracao |
|---|---|
| `supabase/functions/test-erp/index.ts` | SGP: POST + body com token/app/filtro |
| `supabase/functions/save-erp-config/index.ts` | SGP: POST + body com token/app/filtro |
| `src/components/painel/erp/SgpConfigDialog.tsx` | Campo "App", prevenir fechamento, erro inline |
| `src/components/painel/erp/IxcConfigDialog.tsx` | Prevenir fechamento, erro inline |
| `src/components/painel/erp/MkConfigDialog.tsx` | Prevenir fechamento, erro inline |

Sem alteracao de banco (campo `username` ja existe em `erp_configs`). Sem novas dependencias.

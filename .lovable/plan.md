

## Revisao de Seguranca: Integracao WhatsApp - Criptografia e Privacidade

### Problemas Identificados

**1. Tokens de API salvos em texto claro no banco de dados (CRITICO)**

Tanto o hook Admin (`useAdminWhatsAppConfig.ts`) quanto o hook ISP (`useWhatsAppConfig.ts`) salvam o `access_token` diretamente no campo `api_key_encrypted` via cliente Supabase, **sem passar por nenhuma Edge Function de criptografia**. Isso contrasta com as integracoes OpenAI/Resend/Asaas, que utilizam a Edge Function `save-integration` para criptografar via AES-256-GCM antes de armazenar.

**2. Token exposto de volta para o frontend (CRITICO)**

Ao carregar a configuracao, ambas as paginas (`AdminWhatsApp.tsx` e `WhatsAppConfig.tsx`) pre-preenchem o campo `access_token` do formulario com o valor de `config.api_key_encrypted`. Se o token estiver em texto claro, ele e exposto diretamente na UI. Se estiver criptografado, a UI mostra o ciphertext (inutilizavel). O padrao correto e exibir apenas uma versao mascarada (ex: `EAAG...xYz4`).

**3. Teste de conexao feito pelo frontend com token bruto (ALTO)**

O `testConnection` em ambos os hooks faz uma chamada direta do browser para `graph.facebook.com` usando o token armazenado. Isso expoe o token no Network Tab do navegador e potencialmente em logs de proxy/CDN. Deveria ser feito por uma Edge Function server-side.

**4. Verify Token do ISP armazenado em coluna JSON sem criptografia**

O `verify_token` do ISP e salvo em `whatsapp_configs.settings` como JSON em texto claro. Embora menos critico que o access token, e uma credencial que deveria ter protecao adequada.

### Plano de Correcao

**Etapa 1: Criar Edge Function `save-whatsapp-config`**

Nova Edge Function que recebe as credenciais do WhatsApp e:
- Valida o JWT do usuario (admin ou ISP member)
- Criptografa o `access_token` com AES-256-GCM usando `ENCRYPTION_KEY`
- Gera um IV unico e armazena em `encryption_iv`
- Armazena a chave mascarada para exibicao na UI (ex: primeiros 4 + ultimos 4 caracteres)
- Salva o `verify_token` tambem criptografado (ou em campo separado protegido)
- Funciona para ambos os contextos: `admin_whatsapp_config` e `whatsapp_configs`

**Etapa 2: Criar Edge Function `test-whatsapp-connection`**

Nova Edge Function que:
- Recebe o contexto (admin ou ISP ID)
- Busca a configuracao no banco
- Descriptografa o token server-side
- Faz a chamada para `graph.facebook.com` do servidor
- Retorna apenas o status (conectado/erro) sem expor credenciais
- Atualiza `is_connected` e `connected_at` no banco

**Etapa 3: Refatorar hooks do frontend**

Alterar `useAdminWhatsAppConfig.ts`:
- `saveConfig` passa a chamar `save-whatsapp-config` via fetch em vez de gravar direto no Supabase
- `testConnection` passa a chamar `test-whatsapp-connection` em vez de fazer fetch direto para o Meta
- A query de leitura nunca retorna o token real -- exibe apenas `masked_key`

Alterar `useWhatsAppConfig.ts`:
- Mesmas alteracoes acima, adaptadas ao contexto ISP

**Etapa 4: Refatorar paginas de UI**

Alterar `AdminWhatsApp.tsx` e `WhatsAppConfig.tsx`:
- Ao editar, o campo `access_token` inicia vazio (placeholder "Insira novo token" ou mostra mascara)
- Se o usuario nao preencher o campo, o token existente e mantido (a Edge Function ignora campo vazio)
- Nunca pre-preencher com valor criptografado ou real

**Etapa 5: Registrar no `config.toml`**

Adicionar as novas Edge Functions:

```text
[functions.save-whatsapp-config]
verify_jwt = false

[functions.test-whatsapp-connection]
verify_jwt = false
```

(A autenticacao e feita manualmente via JWT dentro das funcoes, seguindo o padrao existente.)

### Resumo das Mudancas

| Arquivo | Acao |
|---|---|
| `supabase/functions/save-whatsapp-config/index.ts` | Criar -- criptografia AES-256-GCM server-side |
| `supabase/functions/test-whatsapp-connection/index.ts` | Criar -- teste de conexao server-side |
| `supabase/config.toml` | Registrar novas funcoes |
| `src/hooks/admin/useAdminWhatsAppConfig.ts` | Refatorar para usar Edge Functions |
| `src/hooks/painel/useWhatsAppConfig.ts` | Refatorar para usar Edge Functions |
| `src/pages/admin/WhatsApp.tsx` | Nao expor token no formulario |
| `src/pages/painel/WhatsAppConfig.tsx` | Nao expor token no formulario |

### Resultado Esperado

- Tokens de API nunca trafegam em texto claro no frontend apos o salvamento inicial
- Criptografia AES-256-GCM consistente com as demais integracoes (OpenAI, Resend, Asaas)
- Teste de conexao executado server-side, sem exposicao de credenciais no browser
- UI exibe apenas versao mascarada do token armazenado


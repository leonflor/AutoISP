

# Adicionar Integração SGP (Autenticação por Token)

## Objetivo

Habilitar a integração com o SGP (Sistema Gerencial de Provedores) usando autenticação por **token**, seguindo o mesmo padrão da integração IXC Soft.

---

## Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `src/components/painel/erp/SgpConfigDialog.tsx` | Modal de configuração do SGP (baseado no IxcConfigDialog) |

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/pages/painel/ErpIntegrations.tsx` | Habilitar provider SGP e adicionar dialog |
| `supabase/functions/save-erp-config/index.ts` | Adicionar case SGP com testSgpConnection |
| `supabase/functions/test-erp/index.ts` | Adicionar case SGP no switch |

---

## Seção Técnica

### Credenciais SGP

O SGP utiliza autenticação por token, similar ao IXC:

```typescript
interface SgpCredentials {
  token: string;  // Token de acesso gerado no SGP
}
```

### Componente SgpConfigDialog.tsx

Baseado no IxcConfigDialog com ajustes para SGP:

- Campos: URL do servidor e Token
- Instruções específicas de como gerar token no SGP
- Link para documentação em sgp.net.br

```typescript
const formSchema = z.object({
  api_url: z.string().url('URL inválida').min(1, 'URL é obrigatória'),
  token: z.string().min(1, 'Token é obrigatório'),
});

// Instruções no Collapsible:
// 1. Acesse o SGP > Configurações > API/Integrações
// 2. Gere um novo token de acesso
// 3. Copie o token gerado
// 4. Cole no campo acima
```

### Atualização em ErpIntegrations.tsx

```typescript
// Atualizar metadata do SGP
{
  provider: 'sgp',
  name: 'SGP',
  description: 'Sistema Gerencial de Provedores',
  docsUrl: 'https://sgp.net.br/',
  authType: 'token',  // Alterado de 'user_pass' para 'token'
}

// Remover SGP dos "em breve" e adicionar dialog
{configDialog?.provider === 'sgp' && (
  <SgpConfigDialog
    open={configDialog.isOpen}
    config={configByProvider?.sgp}
    onClose={() => setConfigDialog(null)}
  />
)}
```

### Função testSgpConnection (Edge Functions)

```typescript
async function testSgpConnection(
  apiUrl: string,
  token: string
): Promise<TestResult> {
  try {
    console.log(`[SGP] Testing connection to: ${apiUrl}`);

    // SGP usa Bearer token ou header customizado
    const response = await fetch(`${apiUrl}/api/clientes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log(`[SGP] Response status: ${response.status}`);

    if (response.status === 401) {
      return {
        success: false,
        message: 'Token inválido ou expirado. Gere um novo no SGP.',
      };
    }

    if (response.status === 403) {
      return {
        success: false,
        message: 'Acesso negado. Verifique as permissões do token.',
      };
    }

    if (response.status === 404) {
      return {
        success: false,
        message: 'Endpoint não encontrado. Verifique a URL do servidor.',
      };
    }

    if (!response.ok) {
      return {
        success: false,
        message: `Erro HTTP ${response.status}`,
      };
    }

    return {
      success: true,
      message: 'Conexão SGP estabelecida com sucesso',
    };
  } catch (error) {
    console.error('[SGP] Error:', error);

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro de conexão',
    };
  }
}
```

### Atualização do Switch em save-erp-config

```typescript
case "sgp":
  if (!body.credentials.token) {
    return new Response(
      JSON.stringify({ error: "Token é obrigatório para SGP" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  testResult = await testSgpConnection(body.api_url, body.credentials.token);
  keyToEncrypt = body.credentials.token;
  break;
```

### Atualização do Switch em test-erp

```typescript
case "sgp":
  if (!credentials.token) {
    return new Response(
      JSON.stringify({ error: "Token não configurado" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  result = await testSgpConnection(apiUrl, credentials.token);
  break;
```

---

## Tratamento de Erros SGP

| Código | Cenário | Mensagem |
|--------|---------|----------|
| 401 | Token inválido | Token inválido ou expirado. Gere um novo no SGP. |
| 403 | Sem permissão | Acesso negado. Verifique as permissões do token. |
| 404 | URL incorreta | Endpoint não encontrado. Verifique a URL do servidor. |
| Timeout | Servidor offline | Não foi possível conectar. Verifique se o servidor está online. |

---

## Ordem de Implementação

1. Criar `SgpConfigDialog.tsx` (baseado no IxcConfigDialog)
2. Atualizar `ErpIntegrations.tsx` para habilitar SGP
3. Adicionar `testSgpConnection` em `save-erp-config`
4. Adicionar case SGP em `test-erp`
5. Deploy das Edge Functions
6. Testar fluxo completo


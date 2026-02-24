

# Nova Tool: Busca de Cliente por CPF/CNPJ (`erp_client_lookup`)

## Objetivo

Criar uma tool de IA que busca um cliente pelo CPF/CNPJ e retorna seus dados cadastrais — especialmente o `cliente_erp_id` — para que a IA possa reutilizá-lo em chamadas subsequentes (ex: `onu_diagnostics` que exige o ID do cliente no ERP).

## Diferença do antigo `erp_search`

O antigo `erp_search` fazia busca genérica (nome ou CPF) e retornava uma lista completa de campos. Esta nova tool:
- Busca **exclusivamente por CPF/CNPJ** (parâmetro obrigatório com `minLength: 11`)
- Retorna dados enxutos focados no que a IA precisa: **ID do cliente no ERP**, nome, CPF/CNPJ, status, plano
- O `cliente_erp_id` é destacado na resposta para encadeamento com outras tools

## Alterações

### 1. Backend — `supabase/functions/_shared/tool-catalog.ts`

Adicionar entrada `erp_client_lookup`:

```
erp_client_lookup: {
  handler: "erp_client_lookup",
  display_name: "Busca Cliente por CPF/CNPJ",
  description: "Busca dados cadastrais de um cliente no ERP por CPF ou CNPJ. Retorna o ID do cliente no ERP (necessário para outras ferramentas como diagnóstico de sinal), nome, status do contrato e plano.",
  parameters_schema: {
    type: "object",
    properties: {
      cpf_cnpj: {
        type: "string",
        description: "CPF ou CNPJ do cliente (somente números ou formatado)",
        minLength: 11
      }
    },
    required: ["cpf_cnpj"],
    additionalProperties: false
  },
  response_description: "Dados do cliente incluindo cliente_erp_id (usar em onu_diagnostics), nome, CPF/CNPJ, status e plano.",
  requires_erp: true
}
```

### 2. Backend — `supabase/functions/_shared/tool-handlers.ts`

Adicionar handler `erpClientLookupHandler` que:
- Recebe `cpf_cnpj` como argumento obrigatório
- Usa `searchClients()` do erp-driver (já existente)
- Filtra resultado pelo CPF/CNPJ exato (limpando pontuação)
- Retorna dados enxutos: `cliente_erp_id`, `nome`, `cpf_cnpj`, `status_internet`, `plano`, `provider_name`, `conectado`
- Se não encontrar, retorna mensagem informativa
- Se encontrar múltiplos (multi-ERP), retorna todos

Adicionar import de `searchClients` e registrar no `handlers`.

### 3. Frontend — `src/constants/tool-catalog.ts`

Adicionar entrada espelho para exibição no admin:

```
{
  handler: "erp_client_lookup",
  display_name: "Busca Cliente por CPF/CNPJ",
  description: "Busca dados cadastrais de um cliente no ERP por CPF ou CNPJ. Retorna o ID do cliente (necessário para diagnóstico de sinal), nome, status e plano.",
  parameters: [
    { name: "cpf_cnpj", type: "string", description: "CPF ou CNPJ do cliente", required: true }
  ],
  response_description: "Dados do cliente com cliente_erp_id, nome, status e plano.",
  requires_erp: true
}
```

### 4. Guia do Projeto — atualizar referências

Atualizar `IAFeatures.tsx` e `OpenAIIntegration.tsx` para listar 3 tools no catálogo (adicionando `erp_client_lookup`).

## Fluxo de Uso pela IA

```text
Usuário: "Minha internet tá lenta, CPF 123.456.789-00"
  ↓
IA chama erp_client_lookup(cpf_cnpj: "12345678900")
  ↓ retorna { cliente_erp_id: "4521", nome: "João", status: "ativo", ... }
  ↓
IA chama onu_diagnostics(client_id: "4521")  ← reutiliza o ID
  ↓ retorna diagnóstico de sinal
  ↓
IA responde com diagnóstico completo
```

## Resumo

| Arquivo | Ação |
|---|---|
| `_shared/tool-catalog.ts` | Adicionar `erp_client_lookup` |
| `_shared/tool-handlers.ts` | Adicionar handler + import `searchClients` |
| `src/constants/tool-catalog.ts` | Adicionar entrada espelho |
| Guia (2 arquivos) | Atualizar contagem/lista de tools |


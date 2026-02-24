

# Remover campos `status_internet`, `plano` e `conectado` do retorno de `erp_client_lookup`

## Objetivo

Simplificar o retorno da tool `erp_client_lookup` removendo três campos que pertencem ao contexto de contrato/conexão e não à identificação do cliente. Esses dados são obtidos via `erp_contract_lookup` e `erp_onu_diagnostics`.

## Alteração

### `supabase/functions/_shared/tool-handlers.ts` (linhas 127-134)

Remover `status_internet`, `plano` e `conectado` do mapeamento de retorno:

```typescript
// De:
clientes: matched.map((c) => ({
  cliente_erp_id: c.id,
  nome: c.nome,
  cpf_cnpj: c.cpf_cnpj,
  status_internet: c.status_internet,
  plano: c.plano,
  conectado: c.conectado,
  provider_name: c.provider_name,
})),

// Para:
clientes: matched.map((c) => ({
  cliente_erp_id: c.id,
  nome: c.nome,
  cpf_cnpj: c.cpf_cnpj,
  provider_name: c.provider_name,
})),
```

Um arquivo, uma alteração. Requer redeploy da edge function `ai-chat`.




## Alerta: Arquivos Protegidos

Os arquivos `response-models.ts` e `erp-driver.ts` fazem parte da camada protegida ERP. Prossigo com as alterações conforme sua ordem expressa.

## Problema

`buscarContratos` duplica a lógica de resolução de cliente (loop configs → fetchClientes → match CPF) que já existe em `buscarCliente`. Além disso, `buscarCliente` não retorna o `id` do cliente ERP, impossibilitando seu reuso direto.

## Plano

### 1. Adicionar `id` a `ClienteResponse` em `response-models.ts`

Incluir campo `id: string` na interface para que `buscarCliente` retorne o ID ERP do cliente, permitindo reuso.

### 2. Atualizar `buscarCliente` em `erp-driver.ts`

Incluir `id: mapped.id` no `itens.push(...)`.

### 3. Adicionar `opcao` a `ContratoResponse` em `response-models.ts`

Novo campo `opcao: number` — índice incremental a partir de 1.

### 4. Refatorar `buscarContratos` em `erp-driver.ts`

- Remover a lógica interna de resolução de cliente (linhas 197-222)
- Chamar `buscarCliente(supabaseAdmin, ispId, encryptionKey, cpfCnpj)` para obter os IDs
- Iterar sobre os clientes retornados, usar `id` + `erp` para buscar contratos do provider correto
- Adicionar `opcao` incremental no `itens.push`
- Manter `ordem` existente (backward compat) com o mesmo valor de `opcao`

### Detalhe técnico: resolução de provider

Ao chamar `buscarCliente`, o retorno traz `erp` (nome display) mas não o `providerKey`. Precisaremos também retornar `provider` (chave interna) em `ClienteResponse` para que `buscarContratos` saiba qual driver usar para `fetchContratos`.

**Campos adicionados a `ClienteResponse`:** `id`, `provider` (chave interna tipo `"ixc"`)
**Campos adicionados a `ContratoResponse`:** `opcao`

### Impacto em `buscarFaturas`

`buscarFaturas` (linhas 269-390) também duplica a lógica de resolução de cliente. Não será alterada neste momento conforme escopo, mas fica como candidata futura.


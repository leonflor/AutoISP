

# Plano: LLM Tool Schemas + Executor + Formatter

## Análise

O projeto já possui duas camadas de tools:
1. **Server-side** (`supabase/functions/_shared/tool-catalog.ts` + `tool-handlers.ts`): 3 tools ERP com prefixo `erp_` que usam `cpf_cnpj` como input. Estas operam no Deno/Edge Functions.
2. **Frontend canonical adapter** (`src/lib/erp/`): Types + IXCSoft adapter que chamam Edge Functions via Supabase client.

O pedido cria uma **terceira camada** (`src/lib/llm/`) que conecta o adapter canônico ao formato OpenAI function calling. As 7 tools pedidas usam nomes diferentes das 3 server-side (ex: `get_customer_by_document` vs `erp_client_lookup`). Isso é intencional — a camada LLM usa os métodos do `ERPAdapter` diretamente, não os handlers server-side.

As tools `generate_payment_link` e `send_invoice_by_email` não existem no adapter canônico. O executor retornará placeholder/stub para essas (ainda não implementadas no ERP adapter).

## Arquivos a Criar

### 1. `src/lib/llm/tools.ts`
OpenAI-compatible tool definitions array com as 7 tools:
- `get_customer_by_document` → `{ document: string }`
- `get_customer_by_email` → `{ email: string }`
- `get_open_invoices` → `{ customer_id: string }`
- `get_service_status` → `{ customer_id: string }`
- `get_contract` → `{ customer_id: string }`
- `generate_payment_link` → `{ invoice_id: string, customer_id: string }`
- `send_invoice_by_email` → `{ invoice_id: string, email: string }`

Formato: `{ type: "function", function: { name, description, parameters } }[]`

### 2. `src/lib/llm/tool-executor.ts`
- `executeToolCall(toolName, toolArgs, tenantConfig)` → `Promise<string>`
- Instancia adapter via `getAdapter(tenantConfig.erp_type, tenantConfig)`
- Switch/case mapeando tool name → método do adapter
- `generate_payment_link` e `send_invoice_by_email`: retornam `{ error: "Funcionalidade ainda não implementada" }` (stub)
- Try/catch global: erros retornam `{ error: "Não foi possível consultar o sistema agora" }`
- Loga: tool name, tenant (ispId), latência em ms via `console.log`
- Retorna `JSON.stringify(result)`

### 3. `src/lib/llm/tool-result-formatter.ts`
- `formatToolResultForPrompt(toolName, result)` → `string`
- Formata dados canônicos em texto legível para a IA:
  - `centavos / 100` → `R$ X,XX`
  - `YYYY-MM-DD` → `DD/MM/YYYY`
  - `Invoice[]`: lista com valor, vencimento, status
  - `CustomerProfile`: nome, documento, status, plano
  - `ServiceStatus`: status conexão, sinal
  - `Contract`: plano, velocidade, valor mensal
- Caso de erro: retorna mensagem de erro diretamente

## Nenhum arquivo existente será alterado
A camada server-side (`tool-catalog.ts`, `tool-handlers.ts`) e o adapter (`src/lib/erp/`) permanecem intactos.


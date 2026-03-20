

# Plano: ERP Adapter — Camada de Normalização Canônica

## Contexto

O projeto já possui uma integração ERP robusta em 3 camadas dentro de `supabase/functions/_shared/` (Deno, server-side). O pedido é criar uma **nova camada canônica no frontend** (`src/lib/erp/`) que o motor de IA usará para acessar dados ERP de forma normalizada. Esta camada **não substitui** a existente — é um contrato de tipos TypeScript + adapter pattern para o lado client/orchestrator.

Nenhum arquivo em `src/lib/erp/` existe ainda.

## Arquivos a Criar

### 1. `src/lib/erp/types.ts`
Tipos canônicos conforme especificado: `CustomerProfile`, `Invoice`, `ServiceStatus`, `Contract`, `ERPAdapter` interface. Exatamente como descrito no prompt, com todos os campos e tipos.

### 2. `src/lib/erp/adapters/ixcsoft.ts`
Classe `IXCSoftAdapter` implementando `ERPAdapter`. Normaliza dados IXC para os tipos canônicos:
- Datas `dd/mm/aaaa` → `YYYY-MM-DD`
- Valores monetários `float` → `centavos` (`Math.round(float * 100)`)
- Telefones → E.164 (`+55...`)
- Status IXC → status canônico (`ativo`→`active`, `bloqueado`→`suspended`, etc.)
- `_source_erp: 'ixcsoft'` e `_fetched_at: new Date().toISOString()`
- Campos ausentes → `null` (nunca `undefined`)

O adapter chamará as Edge Functions existentes (`fetch-erp-clients`, etc.) via Supabase client, **não** acessará a API IXC diretamente do frontend. Isso mantém as credenciais seguras server-side.

### 3. `src/lib/erp/factory.ts`
Factory function `getAdapter(erpType, config): ERPAdapter` com switch/case para `'ixcsoft'`. Default lança erro.

## Decisão Técnica

O adapter do frontend não pode chamar a API IXC diretamente (credenciais ficam no server). Ele invocará as Edge Functions já existentes e normalizará as respostas para os tipos canônicos. A config passada ao adapter conterá `supabaseClient` e `ispId` para fazer as chamadas.

## Nenhum arquivo existente será alterado
Conforme instruído, a integração IXC existente em `supabase/functions/_shared/` permanece intacta.


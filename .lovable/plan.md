

# Correcao: Listagem de contratos com endereco "0" e status incorreto

## Problemas Identificados

### 1. Endereco "0"
Em `erp-driver.ts` linha 434, a composicao do endereco usa `filter(Boolean)`:
```typescript
const parts = [ct.endereco, ct.numero, ct.complemento, ct.bairro, ct.cidade, ct.estado, ct.cep].filter(Boolean);
```
O IXC retorna `"0"` para campos vazios de endereco. A string `"0"` eh truthy, entao passa no filtro e o endereco final vira `"0"`.

**Correcao**: Filtrar tambem strings "0" e strings vazias/whitespace:
```typescript
const parts = [ct.endereco, ct.numero, ct.complemento, ct.bairro, ct.cidade, ct.estado, ct.cep]
  .filter((p) => p && p.trim() !== "" && p.trim() !== "0");
```

### 2. Status "Outros"
O `normalizeInternetStatus` em `erp-driver.ts` mapeia apenas valores conhecidos. Se o IXC retornar um status nao mapeado (ex: `"ativado"`, `"Normal"` com caixa diferente, ou outro valor), cai no fallback `"outros"`.

**Correcao**: O `.toLowerCase().trim()` ja existe, mas o status vindo de `fetchContratosDetalhados` pode ter valores diferentes dos esperados. Adicionar log para diagnostico e mapear mais valores:
```typescript
const IXC_INTERNET_STATUS_MAP: Record<string, InternetStatus> = {
  normal: "ativo",
  ativo: "ativo",           // adicionar
  ativado: "ativo",         // adicionar
  bloqueado: "bloqueado",
  bloqueio_manual: "bloqueado",
  bloqueio_automatico: "bloqueado",
  reduzido: "financeiro_em_atraso",
  pendente_reativa: "bloqueado",
  desativado: "bloqueado",
  cancelado: "bloqueado",   // adicionar
  suspenso: "bloqueado",    // adicionar
};
```

### 3. Performance — searchClients carrega TODOS os registros
O handler `erp_contract_lookup` chama `searchClients` que internamente chama `fetchAllClients` (994 registros radius). Isso eh desnecessario — so precisa resolver CPF → `id_cliente`.

**Correcao**: Criar uma funcao leve `resolveClienteErpId` que usa diretamente `driver.fetchClientes(creds, { cpf_cnpj })` sem carregar todos os radusuarios. Isso reduz de ~4 requests paralelos (radusuarios + clientes + contratos + fibra) para 1 request (clientes filtrado por CPF).

```typescript
async function resolveClienteErpId(
  supabaseAdmin: SupabaseClient,
  ispId: string,
  encryptionKey: string,
  cpfCnpj: string
): Promise<{ id: string; nome: string; cpf_cnpj: string; provider: ErpProvider } | null> {
  const configs = await resolveActiveConfigs(supabaseAdmin, ispId);
  for (const config of configs) {
    const providerKey = config.provider as ErpProvider;
    const driver = getProvider(providerKey);
    const creds = await resolveCredentials(config, encryptionKey);
    if (!driver.fetchClientes) continue;
    const clientes = await driver.fetchClientes(creds, { cpf_cnpj: cpfCnpj });
    const cleanCpf = cpfCnpj.replace(/[\.\-\/]/g, "");
    const match = clientes.find((c) => c.cpf_cnpj.replace(/[\.\-\/]/g, "") === cleanCpf);
    if (match) return { id: match.id, nome: match.nome, cpf_cnpj: match.cpf_cnpj, provider: providerKey };
  }
  return null;
}
```

### 4. Handlers atualizados
Os 3 handlers que usam `searchClients` (`erp_contract_lookup`, `erp_onu_diagnostics`, `erp_invoice_search` com endereco) passam a usar `resolveClienteErpId` — muito mais leve.

## Arquivos Alterados

| Arquivo | Mudanca |
|---|---|
| `supabase/functions/_shared/erp-driver.ts` | Nova funcao `resolveClienteErpId`, filtro de endereco "0", export da funcao |
| `supabase/functions/_shared/erp-driver.ts` | Adicionar mapeamentos de status (ativo, ativado, cancelado, suspenso) |
| `supabase/functions/_shared/tool-handlers.ts` | Handlers usam `resolveClienteErpId` ao inves de `searchClients` |
| Deploy: `ai-chat` | |


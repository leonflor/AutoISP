

# Diagnóstico: IA inventa endereços e não exibe lista numerada

## Problemas encontrados

### Problema 1 — Endereço incompleto (causa do "na altura de...")

No arquivo `supabase/functions/_shared/erp-driver.ts` (linha 489-494), o campo `endereco_completo` é montado usando **apenas** `ct.endereco` (rua), ignorando os demais campos retornados pelo IXC:

```text
ct.endereco  = "Rua das Flores"
ct.numero    = "123"          ← ignorado
ct.bairro    = "Centro"       ← ignorado
ct.cidade    = "São Paulo"    ← ignorado
```

Como a IA recebe apenas "Rua das Flores" sem número, ela **inventa** complementos como "na altura de..." para parecer informativa.

### Problema 2 — Migração anterior aplicada no ID errado

A migração `20260225165917` atualizou o ID `886d4ad6-...`, que **não existe** no banco. O ID real da etapa "Listar contratos" é `0c89d6bc-5504-4b12-9e10-e88fadb621df`. A instrução nunca foi atualizada.

### Problema 3 — Dados internos vazam para a IA

O `tool-handlers.ts` retorna `_detalhes_internos` com plano, status e vencimento. A IA vê esses campos e pode usá-los mesmo que a instrução diga para não exibir.

---

## Plano de correção

### 1. Montar endereço completo no erp-driver.ts

**Arquivo:** `supabase/functions/_shared/erp-driver.ts` (linhas 488-494)

Substituir a lógica que usa apenas `ct.endereco` por uma função que concatena todos os campos de endereço disponíveis:

```typescript
// Antes:
const endereco = ct.endereco && ct.endereco.trim() !== "" ? ct.endereco.trim() : null;

// Depois:
const partes = [
  ct.endereco,
  ct.numero ? `nº ${ct.numero}` : null,
  ct.complemento,
  ct.bairro,
  ct.cidade,
  ct.estado,
].filter(p => p && String(p).trim() !== "").map(p => String(p).trim());
const endereco = partes.length > 0 ? partes.join(", ") : null;
```

Resultado: `"Rua das Flores, nº 123, Centro, São Paulo, SP"`

### 2. Remover `_detalhes_internos` da resposta visível

**Arquivo:** `supabase/functions/_shared/tool-handlers.ts` (handler `erp_contract_lookup`)

Mover os detalhes internos para um campo que a IA não processe, ou removê-los da resposta da tool call. Manter apenas `lista_enderecos` com `numero` e `endereco`.

### 3. Corrigir instrução no banco (ID correto)

**Migração SQL** para atualizar o registro correto:

```sql
UPDATE public.ai_agent_flow_steps
SET instruction = 'Exiba apenas os endereços de instalação em lista numerada com duplo espaçamento entre itens. Não exiba plano, status ou vencimento nesta etapa. Pergunte qual contrato o cliente deseja tratar.',
    updated_at = now()
WHERE id = '0c89d6bc-5504-4b12-9e10-e88fadb621df';
```

### 4. Remover migração anterior inválida

Deletar `supabase/migrations/20260225165917_3409290c-80bf-4a79-8dfc-e2b54fa5a0e3.sql` que atualizou um ID inexistente.

---

## Resumo das alterações

| Arquivo | Alteração |
|---|---|
| `supabase/functions/_shared/erp-driver.ts` | Montar `endereco_completo` com rua + nº + bairro + cidade + estado |
| `supabase/functions/_shared/tool-handlers.ts` | Remover `_detalhes_internos` da resposta do `erp_contract_lookup` |
| Nova migração SQL | Atualizar instrução no ID correto `0c89d6bc-...` |
| Migração antiga | Remover arquivo com ID errado |


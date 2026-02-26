

## Plano: Remover `gateway_link` de `FaturaResponse`

### Arquivos protegidos
- `field-maps.ts` — **SEM MUDANÇAS** (campo `gateway_link` permanece em `MappedFatura`)
- `erp-providers/*.ts` — **SEM MUDANÇAS**

### Edições

**1. `response-models.ts` (linha 36)**
Remover `gateway_link: string | null;` de `FaturaResponse`.

**2. `erp-driver.ts` (linha 360)**
Remover `gateway_link: mapped.gateway_link,` do objeto pushed em `buscarFaturas`.

**3. `tool-catalog.ts`**
Atualizar `response_description` de `erp_invoice_search` removendo menção a `gateway_link`.

**4. Deploy**: `ai-chat`, `fetch-erp-clients`


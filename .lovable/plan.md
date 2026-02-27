

## Investigation: `endereco_completo`

**Origin:** The field is composed in `erp-driver.ts` by the function `buildEnderecoCompleto()` (line 120-134). It concatenates `endereco`, `numero`, `complemento`, and `bairro` from the mapped contract data, filtering out nulls, "0", and "SN" values. When all parts are null/empty, it returns `null` — which is exactly what happens for 5 of the 8 contracts in this CPF.

**Full chain:**
1. IXC API `/cliente_contrato` returns raw address fields
2. `mapContrato.ixc()` in `field-maps.ts` maps them 1:1
3. `buildEnderecoCompleto()` in `erp-driver.ts` composes them into a single string
4. Result is included in `ContratoResponse` (defined in `response-models.ts`, line 20)
5. The flow step instruction tells the AI to show *only* addresses — but many are `null`

**The field is legitimate** — it's built in the Driver layer, included in the response model, and documented in the tool catalog. The problem is solely in the flow step instruction assuming every contract has an address.

## Plan: Update flow step instruction

**Single database UPDATE** on table `ai_agent_flow_steps`, row `0c89d6bc-5504-4b12-9e10-e88fadb621df`:

Change `instruction` from:
> Exiba apenas os endereços de instalação em lista numerada com duplo espaçamento entre itens. Não exiba plano, status ou vencimento nesta etapa. Pergunte qual contrato o cliente deseja tratar.

To:
> Exiba os contratos em lista numerada usando o campo 'ordem' como número. Para cada item, mostre o endereco_completo se disponível; caso contrário, mostre o plano. Use duplo espaçamento entre itens. Não exiba status ou vencimento. Pergunte qual número o cliente deseja tratar.

No code changes required.


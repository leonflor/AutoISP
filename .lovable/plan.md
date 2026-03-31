

# Ferramentas PIX e Boleto + Atualização do Procedimento de Cobrança

## Resumo

Criar duas novas ferramentas (`erp_pix_lookup` e `erp_boleto_lookup`) e atualizar o passo 3 do procedimento "Cobrança de fatura" para que o agente ofereça ao cliente três opções de pagamento: linha digitável, PIX copia-e-cola, ou boleto PDF.

## Arquitetura das mudanças

```text
Camada 3 (Provider)     → ixc.ts: ixc_pix_lookup, ixc_boleto_lookup
Camada 1 (Tipos)        → erp-types.ts: fetchPix, fetchBoleto
Camada 1 (Modelos)      → response-models.ts: PixResponse, BoletoResponse
Camada 2 (Driver)       → erp-driver.ts: buscarPix, buscarBoleto
Catálogo                → tool-catalog.ts: 2 novas ferramentas
Handlers                → tool-handlers.ts: 2 novos handlers
Frontend                → src/constants/tool-catalog.ts: mirror
Procedimento            → Migration SQL: atualizar steps do procedimento v13
```

## Mudanças por arquivo

### 1. `erp-providers/ixc.ts` — Duas novas funções HTTP

**`ixc_pix_lookup(creds, idAreceber)`**
- POST `/webservice/v1/get_pix` com body `{"id_areceber": "ID"}`
- Sem header `ixcsoft:listar` (não é listagem)
- Retorna objeto bruto com `pix.qrCode.qrcode`, `pix.qrCode.imagemSrc`, `pix.dadosPix.expiracaoPix`, `gateway.gatewayNome`

**`ixc_boleto_lookup(creds, idAreceber)`**
- POST `/webservice/v1/get_boleto` com body:
```json
{"boletos":"ID","juro":"S","multa":"S","atualiza_boleto":"S","tipo_boleto":"arquivo","base64":"S"}
```
- Retorna PDF em base64

Registrar ambas no `ixcProvider`: `fetchPix`, `fetchBoleto`

### 2. `erp-types.ts` — Interface do provider

Adicionar ao `ErpProviderDriver`:
```typescript
fetchPix?(creds: ErpCredentials, idAreceber: string): Promise<any>;
fetchBoleto?(creds: ErpCredentials, idAreceber: string): Promise<any>;
```

### 3. `response-models.ts` — Modelos de resposta

```typescript
export interface PixResponse {
  fatura_id: string;
  qrcode: string | null;
  qrcode_imagem: string | null;
  gateway: string | null;
  expirado: boolean;
  erp: string;
}

export interface BoletoResponse {
  fatura_id: string;
  boleto_url: string | null;
  erp: string;
}
```

### 4. `erp-driver.ts` — Funções de orquestração

**`buscarPix(supabaseAdmin, ispId, encryptionKey, faturaId)`**
- Resolve configs/credenciais
- Chama `driver.fetchPix(creds, faturaId)`
- Mapeia para `PixResponse`: extrai `qrCode.qrcode`, `qrCode.imagemSrc`, detecta expiração comparando `expiracaoPix` com `now()`
- Retorna `ToolEnvelope<PixResponse>`

**`buscarBoleto(supabaseAdmin, ispId, encryptionKey, faturaId)`**
- Resolve configs/credenciais
- Chama `driver.fetchBoleto(creds, faturaId)`
- Decodifica base64 → upload para Supabase Storage bucket `invoices` path `{ispId}/{faturaId}.pdf`
- Gera signed URL (1h de validade)
- Retorna `ToolEnvelope<BoletoResponse>`

### 5. `tool-catalog.ts` (backend) — Duas novas entradas

**`erp_pix_lookup`**: parâmetro `fatura_id` (obrigatório), `requires_erp: true`
Descrição: "Recupera o código PIX copia-e-cola de uma fatura em aberto pelo ID da fatura"

**`erp_boleto_lookup`**: parâmetro `fatura_id` (obrigatório), `requires_erp: true`
Descrição: "Gera segunda via do boleto em PDF e retorna link para download"

### 6. `tool-handlers.ts` — Dois novos handlers

`erpPixLookupHandler` e `erpBoletoLookupHandler` — validam `fatura_id`, chamam `buscarPix`/`buscarBoleto`, registram no `handlers`.

### 7. `src/constants/tool-catalog.ts` (frontend) — Mirror

Adicionar as duas ferramentas para exibição no catálogo do painel admin.

### 8. Migration SQL — Atualizar procedimento de cobrança

Inserir nova versão (v13) do procedimento "Cobrança de fatura" com a seguinte mudança no passo 3 (Consultar boletos → Oferecer forma de pagamento):

**Passo 2 (Consultar boletos)** — mantém igual, mas o `on_complete` avança para o novo passo 3.

**Passo 3 (novo: Oferecer forma de pagamento)** — substitui o antigo "Oferecer segunda via":
```
instruction: |
  Após apresentar as faturas em aberto, ofereça as opções de pagamento:
  1. Linha digitável (código de barras) — já disponível nos dados da fatura
  2. PIX copia-e-cola — use erp_pix_lookup com o id da fatura
  3. Boleto PDF (segunda via) — use erp_boleto_lookup com o id da fatura
  
  Pergunte: "Como deseja receber os dados para pagamento?"
  
  Quando o cliente escolher:
  - Linha digitável: envie o campo linha_digitavel já retornado pela consulta de faturas
  - PIX: chame erp_pix_lookup com fatura_id e envie o código qrcode (copia-e-cola)
  - Boleto: chame erp_boleto_lookup com fatura_id e envie o link de download
  
  Se o PIX estiver expirado, informe e ofereça as outras opções.
  Após enviar os dados, pergunte se precisa de mais alguma coisa.

available_functions: [erp_pix_lookup, erp_boleto_lookup]
advance_condition: user_confirmation
stuck_after_turns: 5
```

A migration marcará a v12 como `is_current = false` e inserirá v13 com `is_current = true`.

## Dados: de onde vem cada informação

| Dado | Fonte | Endpoint | Campo |
|---|---|---|---|
| Linha digitável | `erp_invoice_search` (já existe) | `/fn_areceber` | `linha_digitavel` |
| PIX copia-e-cola | `erp_pix_lookup` (novo) | `/get_pix` | `pix.qrCode.qrcode` |
| Boleto PDF | `erp_boleto_lookup` (novo) | `/get_boleto` | base64 → Storage URL |

## Fluxo conversacional esperado

```text
Cliente: quero pagar meu boleto
→ Passo 0: identifica cliente (CPF/CNPJ + confirmação)
→ Passo 1: lista contratos, cliente seleciona
→ Passo 2: busca faturas em aberto, apresenta valores
→ Passo 3: "Como deseja receber os dados para pagamento?
            1. Linha digitável  2. PIX  3. Boleto PDF"
  Cliente: pix
  → IA chama erp_pix_lookup(fatura_id)
  → IA envia: "Aqui está seu código PIX: 00020126..."
  → "Precisa de mais alguma coisa?"
```

## Arquivos alterados (total: 8)

| Arquivo | Mudança |
|---|---|
| `erp-types.ts` | `fetchPix`, `fetchBoleto` na interface |
| `erp-providers/ixc.ts` | 2 novas funções HTTP |
| `response-models.ts` | `PixResponse`, `BoletoResponse` |
| `erp-driver.ts` | `buscarPix`, `buscarBoleto` |
| `tool-catalog.ts` (backend) | 2 novas ferramentas |
| `tool-handlers.ts` | 2 novos handlers |
| `src/constants/tool-catalog.ts` | Mirror frontend |
| Migration SQL | Procedimento v13 com passo de opções de pagamento |


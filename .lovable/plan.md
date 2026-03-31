

# Adicionar envio de boleto por SMS ao fluxo de cobrança

## Resumo

Nova ferramenta `erp_boleto_sms` que aciona o endpoint IXC `/get_boleto` com `tipo_boleto: "sms"` para enviar o boleto diretamente por SMS ao cliente. Atualizar o procedimento de cobrança (v14) para incluir essa quarta opção.

## Mudanças por arquivo (6 arquivos + 1 migration)

### 1. `erp-providers/ixc.ts` — Nova função HTTP

```typescript
async function ixc_boleto_sms(creds, idAreceber): Promise<any>
```
- POST `/webservice/v1/get_boleto` com `{ boletos: ID, juro: "S", multa: "S", atualiza_boleto: "S", tipo_boleto: "sms" }`
- Sem header `ixcsoft:listar`
- Registrar no `ixcProvider`: `fetchBoletoSms`

### 2. `erp-types.ts` — Interface

Adicionar ao `ErpProviderDriver`:
```typescript
fetchBoletoSms?(creds: ErpCredentials, idAreceber: string): Promise<any>;
```

### 3. `response-models.ts` — Novo modelo

```typescript
export interface BoletoSmsResponse {
  fatura_id: string;
  enviado: boolean;
  erp: string;
}
```

### 4. `erp-driver.ts` — Nova função de orquestração

`buscarBoletoSms(supabaseAdmin, ispId, encryptionKey, faturaId)` → `ToolEnvelope<BoletoSmsResponse>`
- Resolve credenciais, chama `driver.fetchBoletoSms(creds, faturaId)`
- Verifica resposta do IXC (sucesso/falha) e retorna `enviado: true/false`

### 5. `tool-catalog.ts` (backend) — Nova entrada

```
erp_boleto_sms: {
  handler: "erp_boleto_sms",
  display_name: "Enviar Boleto por SMS",
  description: "Envia o boleto de uma fatura por SMS para o celular cadastrado do cliente no ERP",
  parameters: { fatura_id: obrigatório },
  requires_erp: true
}
```

### 6. `tool-handlers.ts` — Novo handler

`erpBoletoSmsHandler` — valida `fatura_id`, chama `buscarBoletoSms`, registra no `handlers`.

### 7. `src/constants/tool-catalog.ts` — Mirror frontend

Adicionar entrada para exibição no catálogo admin.

### 8. Migration SQL — Procedimento v14

Atualizar o passo 3 do procedimento "Cobrança de fatura" para incluir 4 opções:

```
1. Linha digitável (código de barras)
2. PIX copia-e-cola
3. Boleto PDF (segunda via)
4. Enviar boleto por SMS

available_functions: [erp_pix_lookup, erp_boleto_lookup, erp_boleto_sms]
```

Marca v13 como `is_current = false`, insere v14 com `is_current = true`.

## Fluxo esperado

```text
IA: Como deseja receber os dados para pagamento?
    1. Linha digitável  2. PIX  3. Boleto PDF  4. Receber por SMS
Cliente: sms
→ IA chama erp_boleto_sms(fatura_id)
→ IA: "Boleto enviado por SMS para o número cadastrado no sistema!"
```

## Arquivos alterados (total: 8)

| Arquivo | Mudança |
|---|---|
| `erp-types.ts` | `fetchBoletoSms` na interface |
| `erp-providers/ixc.ts` | `ixc_boleto_sms` + registro no provider |
| `response-models.ts` | `BoletoSmsResponse` |
| `erp-driver.ts` | `buscarBoletoSms` |
| `tool-catalog.ts` (backend) | Nova ferramenta `erp_boleto_sms` |
| `tool-handlers.ts` | Novo handler |
| `src/constants/tool-catalog.ts` | Mirror frontend |
| Migration SQL | Procedimento v14 com 4 opções de pagamento |


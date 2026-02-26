

## Plano: Adicionar tipos enumerados do `/fn_areceber` e interface `IxcFnAreceber`

### Novos tipos enumerados

```typescript
/** A = A receber, R = Recebido, P = Parcial, C = Cancelado */
export type IxcStatusFatura = "A" | "R" | "P" | "C";

/** M = Recebido de forma manual, R = Recebido automaticamente */
export type IxcFormaRecebimento = "M" | "R";

/** Boleto, Cheque, Cartão, Dinheiro, Depósito, Gateway, Débito, Fatura, ArrecadacaoRecebimento, Transferencia, Pix */
export type IxcTipoRecebimento = "Boleto" | "Cheque" | "Cartão" | "Dinheiro" | "Depósito" | "Gateway" | "Débito" | "Fatura" | "ArrecadacaoRecebimento" | "Transferencia" | "Pix";
```

- `tipo_cobranca` reutiliza `IxcTipoCobranca` (P/I/E) já existente
- `status_cobranca` será `string` (documentação pendente)
- `titulo_renegociado` será `IxcSimNao`

### Interface `IxcFnAreceber`

~70 campos mapeados 1:1 do JSON, com JSDoc e FKs inline:
- `id_cliente` → FK `/cliente.id`
- `id_contrato` → FK `/cliente_contrato.id`
- Campos S/N: `estornado`, `liberado`, `impresso`, `parcela_proporcional`, `titulo_protestado`, `titulo_importado`, `titulo_renegociado`, `aguardando_confirmacao_pagamento`, `parcelado_cartao`, `recebido_via_pix`, `previsao`, `libera_periodo`, `arquivo_remessa_baixado`

### Arquivo alterado

Append em `supabase/functions/_shared/erp-providers/ixc-types.ts` após linha 561.


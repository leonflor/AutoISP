

## Plano: Adicionar tipos enumerados do `/cliente_contrato` e interface `IxcClienteContrato`

### Novos tipos enumerados a adicionar em `ixc-types.ts`

```typescript
/** I = Internet, T = Telefonia, S = Serviços, SVA = SVA */
export type IxcTipoContrato = "I" | "T" | "S" | "SVA";

/** P = Pré-contrato, A = Ativo, I = Inativo, N = Negativado, D = Desistiu */
export type IxcStatusContrato = "P" | "A" | "I" | "N" | "D";

/** A = Ativo, D = Desativado, CM = Bloqueio Manual, CA = Bloqueio Automático, FA = Financeiro em atraso, AA = Aguardando Assinatura */
export type IxcStatusInternet = "A" | "D" | "CM" | "CA" | "FA" | "AA";

/** N = Normal, R = Reduzida */
export type IxcStatusVelocidade = "N" | "R";

/** P = Configuração padrão (Parâmetros), N = Competência (Previsão não), S = Caixa (Previsão sim), M = Manual */
export type IxcCcPrevisao = "P" | "N" | "S" | "M";

/** S = Habilitado, N = Desabilitado, P = Padrão */
export type IxcDesbloqueioConfianca = "S" | "N" | "P";

/** H = Habilitado, D = Desabilitado, P = Padrão */
export type IxcLiberacaoSuspensaoParcial = "H" | "D" | "P";

/** P = Configuração padrão, I = Impresso, E = E-mail */
export type IxcTipoCobranca = "P" | "I" | "E";

/** I = Instalação, U = Upgrade, D = Downgrade, M = Mudança de Endereço, T = Mudança de Tecnologia, L = Mudança de titularidade, N = Negociação, R = Reativação */
export type IxcMotivoInclusao = "I" | "U" | "D" | "M" | "T" | "L" | "N" | "R";

/** M = Manual, A = Automático */
export type IxcOrigemCancelamento = "M" | "A";

/** R = Regular (inferido do JSON) — documentação pendente para demais valores */
export type IxcSituacaoFinanceiraContrato = "R" | string;
```

### Interface `IxcClienteContrato`

Todos os ~120 campos do JSON mapeados 1:1, usando os tipos enumerados acima, `IxcSimNao`, `IxcSimNaoPadrao` e `IxcTipoLocalidade` (reutilizados do `/cliente`). Campos FK comentados inline.

### Arquivo alterado

Apenas `supabase/functions/_shared/erp-providers/ixc-types.ts` — append dos novos tipos e da interface.

### Campo `situacao_financeira_contrato`

O valor `"R"` aparece no JSON mas não foi documentado. Será tipado como `"R" | string` com JSDoc pedindo complemento. Se você tiver a documentação desse campo, cole antes de eu implementar.

### Campos `tipo_produtos_plano`

Documentação indica valor padrão `"P"` mas sem lista de valores. Será tipado como `string` com comentário.




# Criar `ixc-types.ts` com Union + JSDoc

## Arquivo

`supabase/functions/_shared/erp-providers/ixc-types.ts`

## Estilo dos tipos enumerados

Cada union type recebe JSDoc descritivo por valor:

```typescript
/** S = Sim, N = Não */
export type IxcSimNao = "S" | "N";

/** S = Sim, N = Não, P = Padrão */
export type IxcSimNaoPadrao = "S" | "N" | "P";

/** F = Física, J = Jurídica, E = Estrangeiro, 1 = Jurídica, 2 = Natural, 3 = Estrangeiro */
export type IxcTipoPessoa = "F" | "J" | "E" | "1" | "2" | "3";

/** F = Feminino, M = Masculino, NB = Não binário, O = Outro, PNI = Prefiro não dizer */
export type IxcSexo = "F" | "M" | "NB" | "O" | "PNI";

/** R = Zona rural, U = Zona urbana */
export type IxcTipoLocalidade = "R" | "U";

/** C = Novo, S = Sondagem, A = Apresentando, N = Negociando, V = Vencemos, P = Perdemos, AB = Abortamos, SV = Sem viabilidade, SP = Sem porta disponível */
export type IxcStatusProspeccao = "C" | "S" | "A" | "N" | "V" | "P" | "AB" | "SV" | "SP";

/** P = Própria, A = Alugada */
export type IxcMoradia = "P" | "A";
```

## Conteúdo completo

O arquivo conterá:
1. Os 7 tipos enumerados acima com JSDoc
2. A interface `IxcCliente` com todos os ~130 campos agrupados por seção (Identificação, Contato, Endereço, etc.)
3. Campos FK comentados inline: `cidade: string; /** FK → endpoint /cidade */`

## Mudanças em outros arquivos

Nenhuma nesta etapa. O tipo será consumido pelo Driver na próxima etapa.


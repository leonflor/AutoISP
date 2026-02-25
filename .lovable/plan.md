

# Correção: Contratos listados sem numeração e texto embolado

## Problema

Apesar da descrição da ferramenta instruir a IA a listar apenas endereços numerados, o screenshot mostra que o agente continua exibindo tudo embolado e sem numeração. Isso acontece porque:

1. O handler retorna todos os campos (`plano`, `status_internet`, `dia_vencimento`) junto com `endereco_completo` — a IA tende a usar tudo que recebe
2. A IA não tem um modelo claro de formatação no próprio dado retornado

## Solução

Duas mudanças complementares:

### 1. Reestruturar resposta do handler (`tool-handlers.ts`)

Separar o retorno em dois blocos:
- `lista_enderecos`: array simples com número + endereço (para exibição ao cliente)
- `_detalhes_internos`: campos extras marcados como internos (para uso posterior)

Adicionar campo `instrucao_exibicao` com o formato exato esperado.

```typescript
// Linha 190-206 de tool-handlers.ts
return {
  success: true,
  data: {
    encontrados: result.contracts.length,
    instrucao_exibicao: "Apresente EXATAMENTE assim, sem nenhuma informação adicional:\nSobre qual contrato você gostaria de falar?\n" +
      result.contracts.map((c, i) => `${i + 1}. ${c.endereco_completo}`).join("\n"),
    lista_enderecos: result.contracts.map((c, i) => ({
      numero: i + 1,
      endereco: c.endereco_completo,
    })),
    _detalhes_internos: result.contracts.map((c) => ({
      contrato_id: c.contrato_id,
      endereco_completo: c.endereco_completo,
      plano: c.plano,
      status_internet: c.status_internet,
      dia_vencimento: c.dia_vencimento,
      provider_name: c.provider_name,
    })),
    erros: result.errors,
  },
};
```

### 2. Reforçar descrição no catálogo (`tool-catalog.ts`)

Atualizar `response_description` para mencionar o campo `instrucao_exibicao`:

```
"Use o campo 'instrucao_exibicao' como resposta ao cliente. NÃO reformate, NÃO adicione informações extras. Os dados em '_detalhes_internos' são para uso posterior apenas."
```

## Resultado esperado

O agente receberá um texto pronto para copiar:

```
Sobre qual contrato você gostaria de falar?
1. Quadra Central 1, SN, Sobradinho, 73000-000
2. Eixo Monumental, sentido Shopping Popular, 73000-000
3. Rodovia DF-425, SN, Sobradinho, 73000-000
```

## Arquivos alterados

| Arquivo | Mudança |
|---|---|
| `supabase/functions/_shared/tool-handlers.ts` | Reestruturar resposta do `erp_contract_lookup` com `instrucao_exibicao`, `lista_enderecos` e `_detalhes_internos` |
| `supabase/functions/_shared/tool-catalog.ts` | Atualizar `response_description` para referenciar `instrucao_exibicao` |
| `src/constants/tool-catalog.ts` | Espelhar descrição atualizada |

## Deploy

Edge function `ai-chat`.


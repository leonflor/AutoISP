

# Corrigir formatacao de contratos no retorno da ferramenta

## Problema

O `instrucao_exibicao` em `tool-handlers.ts` (linha 194) tem dois problemas:

1. **Contem instrucoes comportamentais** ("Apresente EXATAMENTE assim") — contradiz a limpeza que acabamos de fazer nas descriptions do catalogo. Esse tipo de instrucao deve estar na `instruction` da etapa do fluxo, nao no retorno dos dados.

2. **Usa `\n` simples** para separar os enderecos. No Markdown (usado pelo `ReactMarkdown` no `AgentTestDialog`), `\n` simples nao cria quebra de linha visivel — precisa de `\n\n` (paragrafo) ou dois espacos antes do `\n`.

## Solucao

Remover o campo `instrucao_exibicao` com texto comportamental. Em vez disso, formatar a `lista_enderecos` de forma que os dados ja estejam estruturados para o agente usar. A IA vai formatar conforme a `instruction` da etapa do fluxo.

### Alteracao em `tool-handlers.ts` (linhas 193-199)

**Antes:**
```typescript
encontrados: result.contracts.length,
instrucao_exibicao: "Apresente EXATAMENTE assim, sem nenhuma informação adicional:\nSobre qual contrato você gostaria de falar?\n" +
      result.contracts.map((c) => `${c.ordem}. ${c.endereco_completo}`).join("\n"),
lista_enderecos: result.contracts.map((c) => ({
  numero: c.ordem,
  endereco: c.endereco_completo,
})),
```

**Depois:**
```typescript
encontrados: result.contracts.length,
lista_enderecos: result.contracts.map((c) => ({
  numero: c.ordem,
  endereco: c.endereco_completo,
})),
```

Remove `instrucao_exibicao` e mantem `lista_enderecos` como dado puro. A etapa do fluxo que usa `erp_contract_lookup` ja deve ter uma `instruction` dizendo como apresentar (lista numerada com espacamento).

## Sobre o espacamento no Markdown

O problema de "sem espaco entre linhas" e resolvido pelo Markdown: quando a IA gera a lista usando `1. Endereco X\n\n2. Endereco Y` (com linha em branco entre itens), o `ReactMarkdown` renderiza com espacamento. A IA naturalmente faz isso quando nao recebe instrucoes conflitantes como "Apresente EXATAMENTE assim" que a forca a copiar texto literal sem formatacao Markdown.

## Arquivos alterados

| Arquivo | Mudanca |
|---|---|
| `supabase/functions/_shared/tool-handlers.ts` | Remover `instrucao_exibicao`, manter apenas `lista_enderecos` como dado estruturado |

## Deploy

Edge function `ai-chat` (que importa `tool-handlers.ts`).


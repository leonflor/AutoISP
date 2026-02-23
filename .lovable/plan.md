

# Filtrar radusuarios por ativo = S

## Mudanca

Alterar a chamada ao endpoint `/radusuarios` em `ixc.ts` para filtrar apenas registros onde `ativo = S`, trazendo somente usuarios RADIUS ativos.

## Detalhe tecnico

Atualmente a funcao `ixcFetch` envia um body generico com `qtype: "radusuarios.id", query: "1", oper: ">"` que traz todos os registros. A mudanca e usar uma chamada dedicada para radusuarios com o filtro `qtype: "radusuarios.ativo", query: "S", oper: "="`.

### Arquivo: `supabase/functions/_shared/erp-providers/ixc.ts`

- Na linha 84-85, substituir `ixcFetch(baseUrl, headers, "radusuarios")` por uma chamada direta com body customizado filtrando `ativo = S`
- Alternativa mais limpa: adicionar parametro opcional de filtro na funcao `ixcFetch` e usa-lo apenas para radusuarios

### Nenhum outro arquivo precisa ser alterado


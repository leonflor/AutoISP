

# Correções pendentes na listagem de contratos

## Problemas identificados na resposta

### Problema 1 — Código numérico da cidade no endereço

O IXC retorna `cidade` como **ID numérico** (ex: `5564`, `5563`) em vez do nome da cidade. A lógica atual em `erp-driver.ts` inclui esse valor diretamente no endereço, gerando saídas como:

```
Quadra Central 1, nº SN, Sobradinho, 5564
                                       ^^^^
                                       ID numérico, não nome
```

O campo `bairro` retorna o nome correto ("Sobradinho", "Cruzeiro"), mas `cidade` e possivelmente `estado` são IDs internos do IXC.

**Correção:** Excluir `ct.cidade` e `ct.estado` da composição do endereço no `erp-driver.ts`, mantendo apenas `endereco`, `numero`, `complemento` e `bairro` — campos que retornam texto legível.

```typescript
// Antes (linha 489-496):
const partes = [
  ct.endereco,
  ct.numero ? `nº ${ct.numero}` : null,
  ct.complemento,
  ct.bairro,
  ct.cidade,   // ← ID numérico "5564"
  ct.estado,   // ← possivelmente numérico também
].filter(...)

// Depois:
const partes = [
  ct.endereco,
  ct.numero ? `nº ${ct.numero}` : null,
  ct.complemento,
  ct.bairro,
].filter(p => p && String(p).trim() !== "" && String(p).trim() !== "0" && String(p).trim() !== "SN")
 .map(p => String(p).trim());
```

Nota: também filtrar `"SN"` (Sem Número) para evitar exibir "nº SN" que não agrega informação.

### Problema 2 — Lista não aparece numerada

A IA recebe os dados como JSON com campo `numero` mas monta a resposta sem formatação numerada. Isso ocorre porque a **instrução no banco** já foi corrigida, mas a IA precisa de um formato mais explícito nos dados retornados pela ferramenta.

**Correção:** Pré-formatar a resposta da tool no `tool-handlers.ts` para que o JSON já contenha a lista formatada como texto, facilitando a exibição:

```typescript
// Em tool-handlers.ts, handler erp_contract_lookup:
return {
  success: true,
  data: {
    encontrados: result.contracts.length,
    lista_formatada: result.contracts.map((c) =>
      `${c.ordem}. ${c.endereco_completo || "Endereço não disponível"}`
    ).join("\n\n"),
    erros: result.errors,
  },
};
```

Substituir `lista_enderecos` (array de objetos) por `lista_formatada` (string pré-formatada com numeração e duplo espaçamento). Isso guia a IA a exibir o texto exatamente como está.

## Resumo das alterações

| Arquivo | Alteração |
|---|---|
| `supabase/functions/_shared/erp-driver.ts` | Remover `ct.cidade` e `ct.estado` da composição; filtrar "SN" |
| `supabase/functions/_shared/tool-handlers.ts` | Substituir `lista_enderecos` por `lista_formatada` (string pré-formatada) |
| Edge function `ai-chat` | Redeploy após alterações |

## Resultado esperado

```
Encontrei os seguintes endereços de instalação:

1. Quadra Central 1, Sobradinho

2. Eixo Monumental, sentido Shopping Popular/ Rodoviária, Cruzeiro

3. Rodovia DF-425, Sobradinho

4. Avenida das Jaqueiras, altura do terminal Rodoviário, do Cruzeiro, Sudoeste

5. Avenida de acesso AR12, altura da quadra 14, Sobradinho

6. Avenida do Jaqueiras, entrada do Cruzeiro Novo/ quadra 10, Cruzeiro

Qual contrato você deseja tratar?
```




# Corrigir: IA oferece linha digitável antes da seleção de modalidade

## Causa raiz

O campo `linha_digitavel` é retornado dentro do `FaturaResponse` pela ferramenta `erp_invoice_search` (executada no Passo 2). Quando o LLM recebe o resultado da tool call com esse campo visível, ele interpreta como informação relevante e a oferece proativamente — pulando o Passo 3 onde as opções de pagamento deveriam ser apresentadas.

O problema tem duas camadas:

1. **Dados vazando para o LLM cedo demais**: o `FaturaResponse` inclui `linha_digitavel` no resultado do Passo 2, e o LLM "vê" o dado e age sobre ele
2. **Instrução do Passo 2 não proíbe**: a instrução do passo de consulta financeira não diz explicitamente para NÃO apresentar formas de pagamento

## Solução (2 mudanças)

### 1. Omitir `linha_digitavel` do `FaturaResponse` retornado ao LLM

Em `erp-driver.ts`, na função `buscarFaturas`, remover o campo `linha_digitavel` do objeto montado para a IA. Esse dado será consultado apenas quando necessário no Passo 3 via `erp_boleto_lookup` (que já retorna `linha_digitavel`).

**Arquivo**: `supabase/functions/_shared/erp-driver.ts`
- Na construção do `FaturaResponse`, substituir `linha_digitavel: mapped.linha_digitavel` por omissão do campo (ou setar `null`)
- O campo continua existindo na interface `FaturaResponse` para compatibilidade, mas não será preenchido no passo de listagem

### 2. Atualizar instrução do Passo 2 do procedimento (migration v15)

Adicionar guardrail explícito na instrução do Passo 2:

> "NÃO ofereça formas de pagamento, linha digitável, PIX ou boleto neste passo. Apenas liste as faturas encontradas com valor e vencimento. As opções de pagamento serão apresentadas no próximo passo."

**Arquivo**: Nova migration SQL
- Marcar v14 como `is_current = false`
- Inserir v15 com instrução do Passo 2 atualizada incluindo o guardrail

## Resultado esperado

```text
Passo 2: IA lista faturas (valor, vencimento, dias atraso) — SEM linha digitável
Passo 3: IA pergunta modalidade → cliente escolhe → IA executa ferramenta correspondente
```

## Arquivos alterados (2)

| Arquivo | Mudança |
|---|---|
| `erp-driver.ts` | Omitir `linha_digitavel` do retorno de `buscarFaturas` |
| Migration SQL | Procedimento v15 com guardrail no Passo 2 |


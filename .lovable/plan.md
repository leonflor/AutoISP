

# Implementar V17 do procedimento "Cobrança de fatura"

## O que será feito

Duas mudanças já aprovadas:

### 1. Migration SQL — Procedimento v17

- Marcar v16 (`c0c349c2-...`) como `is_current = false`
- Inserir v17 com o **Passo 5** atualizado para incluir:

> *"Após entregar a informação com sucesso, pergunte ao cliente se precisa de algo mais."*

A instrução completa do Passo 5 será:

```
Execute APENAS a ferramenta correspondente à modalidade escolhida...
[mesma lógica atual]
...NÃO tente outra modalidade automaticamente.
Após entregar a informação com sucesso, pergunte ao cliente se precisa de algo mais.
```

### 2. procedure-runner.ts — Já aplicado

A limpeza de `collected_context: {}` no encerramento já foi implementada na mensagem anterior.

### 3. Deploy das Edge Functions

Redeployar `simulate-agent` e `whatsapp-webhook` para garantir que o runner atualizado esteja ativo.

## Arquivos alterados

| Arquivo | Ação |
|---|---|
| Migration SQL | INSERT v17 + UPDATE v16 `is_current = false` |
| Edge Functions | Redeploy (código do runner já atualizado) |


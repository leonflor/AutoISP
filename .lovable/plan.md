

# Evitar transferência prematura — pedir esclarecimento quando não entende

## Problema

"pagamento" não ativa nenhum procedimento porque os triggers do procedimento "Cobrança de fatura" provavelmente não incluem essa palavra. Sem procedimento ativo, o guardrail na linha 294 do `context-builder.ts` instrui o LLM a transferir para humano imediatamente:

```
"Nenhum procedimento está ativo. (...) use a ferramenta transfer_to_human para transferir"
```

Resultado: o bot transfere sem tentar entender o que o usuário precisa.

## Solucao (2 frentes)

### Frente 1: Ampliar triggers do procedimento (migration SQL)

Adicionar "pagamento" (e variações como "pagar", "segunda via", "débito") aos triggers do procedimento "Cobrança de fatura" v9, para que a detecção funcione com vocabulário mais amplo.

### Frente 2: Mudar guardrail "sem procedimento" (código)

No `context-builder.ts` (linha 293-294), trocar a instrução de transferir imediatamente por uma instrução de **pedir esclarecimento**:

**Antes:**
```
Nenhum procedimento está ativo. (...) use transfer_to_human para transferir
```

**Depois:**
```
Nenhum procedimento está ativo. Pergunte ao cliente de forma clara e simples
o que ele precisa. Tente entender a intenção antes de transferir para humano.
Exemplos: "Poderia me explicar melhor o que precisa?" ou "Você gostaria de
consultar boletos, verificar sua conexão ou outro assunto?"
Só use transfer_to_human se o cliente pedir explicitamente ou se após 2
tentativas de esclarecimento o assunto continuar fora do seu escopo.
```

## Fluxo corrigido

```text
Usuário: "pagamento"
→ Trigger detecta "pagamento" → procedimento ativado → step 0 pede CPF
```

Caso alternativo (palavra não mapeada):
```text
Usuário: "preciso de ajuda"
→ Sem procedimento → bot pergunta: "Claro! Poderia me dizer o que precisa?"
→ Usuário: "quero pagar meu boleto"
→ Trigger detecta "boleto/pagar" → procedimento ativado
```

## Arquivos alterados

| Arquivo | Alteracao |
|---|---|
| Nova migration SQL | Adicionar "pagamento", "pagar", "segunda via", "débito" aos triggers da v9 |
| `supabase/functions/_shared/context-builder.ts` | Linha 293-294: trocar guardrail de transferência por esclarecimento |


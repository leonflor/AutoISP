

# Correção: Listagem de contratos deve exibir apenas endereço

## Problema

O agente recebe do `erp_contract_lookup` os campos `contrato_id`, `endereco_completo`, `plano`, `status_internet` e `dia_vencimento`. A descrição da ferramenta diz explicitamente "Retorna ID do contrato, endereço de instalação, plano contratado e status", o que leva a IA a exibir todos esses campos na resposta.

O comportamento desejado (definido no fluxo conversacional) é:

```
De qual contrato quer informações?
1. Rua A
2. Rua B
```

Apenas endereço, numerado, sem plano nem status.

## Causa raiz

A `description` e `response_description` da ferramenta `erp_contract_lookup` instruem a IA a incluir plano e status na apresentação. Mesmo que o passo do fluxo diga "liste os contratos", a IA usa a descrição da ferramenta como guia de formatação.

## Solução

Alterar a descrição e `response_description` do `erp_contract_lookup` em ambos os catálogos (backend e frontend) para instruir a IA a apresentar apenas o endereço em lista numerada.

### Alterações

**Arquivo: `supabase/functions/_shared/tool-catalog.ts`** (backend — usado pela IA)

Linha 89-91 — `description`:
```typescript
description:
  "Consulta contratos ativos de um cliente por CPF/CNPJ. Retorna endereços de instalação dos contratos. Ao listar para o cliente, exiba APENAS uma lista numerada com os endereços, sem plano, sem status, sem vencimento. Exemplo: '1. Rua X, 123, Bairro, Cidade'. Pergunte sobre qual contrato quer falar.",
```

Linha 103-104 — `response_description`:
```typescript
response_description:
  "Contratos ativos com contrato_id e endereço completo. Ao apresentar ao cliente, liste SOMENTE os endereços numerados. Os demais campos (plano, status, vencimento) são internos para uso posterior quando o cliente escolher um contrato.",
```

**Arquivo: `src/constants/tool-catalog.ts`** (frontend — apenas exibição no admin)

Linha 56 — `description`:
```typescript
description:
  "Consulta contratos ativos de um cliente por CPF/CNPJ. Retorna endereços de instalação dos contratos.",
```

Linha 60 — `response_description`:
```typescript
response_description: "Contratos ativos com endereço completo. Apresenta lista numerada de endereços ao cliente.",
```

### Dados retornados pelo handler

Os campos `plano`, `status_internet` e `dia_vencimento` continuam sendo retornados pelo handler (linhas 196-203 de `tool-handlers.ts`) porque são necessarios em etapas posteriores do fluxo (quando o cliente escolhe um contrato e quer detalhes). A mudança é apenas na instrução de apresentação via descrição da ferramenta.

## Melhoria sugerida

O prompt do fluxo conversacional no passo "LISTAR CONTRATOS" poderia ser reforçado para alinhar com a descrição da ferramenta:

```
Busque os contratos. Liste APENAS os endereços de instalação com um número de ordem.
Formato: "De qual contrato quer informações?\n1. [endereço]\n2. [endereço]"
Não inclua plano, status nem vencimento nesta listagem.
Pergunte "Sobre qual contrato quer falar?"
```

Essa alteração é feita pelo admin na configuração do fluxo (banco de dados), não no código.

## Arquivos alterados

| Arquivo | Mudança |
|---|---|
| `supabase/functions/_shared/tool-catalog.ts` | Atualizar `description` e `response_description` do `erp_contract_lookup` |
| `src/constants/tool-catalog.ts` | Espelhar descrição atualizada no catálogo frontend |

## Deploy necessário

Edge function `ai-chat` (usa o catálogo backend).


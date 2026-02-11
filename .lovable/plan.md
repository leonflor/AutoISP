

# Seed: Procedimento "Cobranca e Financeiro"

## Contexto

O sistema ja possui ferramentas e fluxos cadastrados que se encaixam naturalmente em um procedimento de cobranca. Este seed agrupa esses recursos existentes em um procedimento reutilizavel.

## Pre-requisito

A tabela `ai_procedures` precisa existir. Como a migration anterior nao foi aplicada, o seed incluira a criacao das tabelas necessarias antes de inserir os dados.

## Dados do Seed

### Procedimento

| Campo | Valor |
|---|---|
| name | Cobranca e Financeiro |
| slug | cobranca-financeiro |
| description | Procedimento completo para identificacao de clientes, consulta de faturas em aberto e negociacao de debitos. Integra ferramentas de busca no ERP com fluxo conversacional estruturado. |
| icon | receipt |
| is_active | true |
| sort_order | 1 |

### Vinculos com Tools existentes

| Ferramenta | ID | Justificativa |
|---|---|---|
| buscar_contrato_cliente | `fa533441-...` | Localizar o contrato do cliente no ERP |
| consultar_faturas | `26bd11d1-...` | Listar faturas em aberto para negociacao |

### Vinculo com Flow existente

| Fluxo | ID | Justificativa |
|---|---|---|
| Cobranca | `ea447503-...` | Fluxo de 5 etapas: identificar -> buscar contrato -> verificar debitos -> negociar -> encerrar |

### Vinculo com Agentes

| Agente | ID | Justificativa |
|---|---|---|
| Atendente Virtual | `599bcd52-...` | Agente generalista que precisa lidar com cobranca |
| Financeiro | `8e08ca74-...` | Agente especializado em financeiro |

## Secao Tecnica

**Arquivo a criar:** `docs/migrations/f4-procedure-seed.sql`

O SQL fara:

1. Criar as 4 tabelas (`ai_procedures`, `ai_procedure_tools`, `ai_procedure_flows`, `ai_agent_procedures`) caso nao existam -- usando `CREATE TABLE IF NOT EXISTS`
2. Inserir o procedimento "Cobranca e Financeiro"
3. Vincular as 2 ferramentas existentes ao procedimento via `ai_procedure_tools`
4. Vincular o fluxo "Cobranca" ao procedimento via `ai_procedure_flows`
5. Vincular os agentes "Atendente Virtual" e "Financeiro" via `ai_agent_procedures`

Todo o seed usara `ON CONFLICT DO NOTHING` para ser idempotente (pode rodar varias vezes sem erro).


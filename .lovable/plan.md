

# Plano: Seed do Fluxo de Cobranca com 6 Estados

## Objetivo
Criar uma migration SQL que insere um fluxo global "Cobranca" na tabela `ai_agent_flows` e 6 estados completos na tabela `flow_state_definitions`, com todas as transition_rules preenchidas.

## Migration SQL

Insere 1 registro em `ai_agent_flows` e 6 registros em `flow_state_definitions`:

| # | state_key | objective | allowed_tools | transition |
|---|-----------|-----------|---------------|------------|
| 1 | identificar_cliente | Solicite CPF/CNPJ do cliente. Valide formato (11 ou 14 digitos). | [] | user_input (regex `\d{11,14}`) → buscar_faturas |
| 2 | buscar_faturas | Busque faturas em aberto usando o CPF/CNPJ informado. | [erp_invoice_search] | tool_success(erp_invoice_search) → apresentar_debitos |
| 3 | apresentar_debitos | Liste faturas encontradas (valor, vencimento, dias atraso). Pergunte se deseja negociar. | [] | user_input (regex `sim\|negoci\|quero\|pagar`) → negociar |
| 4 | negociar | Apresente opcoes: pagamento a vista com desconto, parcelamento, ou nova data. | [] | option_selected → gerar_boleto |
| 5 | gerar_boleto | Confirme a opcao escolhida e informe que o boleto sera gerado/enviado. | [] | user_input → finalizar |
| 6 | finalizar | Agradeca e encerre o atendimento. | [] | (nenhuma - estado terminal `__complete__`) |

### Detalhes tecnicos
- O fluxo e inserido como global (`agent_id = NULL`), `is_fixed = true`, `is_active = true`
- `trigger_keywords`: `['cobranca', 'fatura', 'boleto', 'debito', 'pagamento', 'segunda via']`
- Cada estado tem `fallback_message` e `max_attempts = 5`
- Estado `finalizar` usa transicao `auto` → `__complete__` para sinalizar fim de sessao

### Arquivos alterados
- **1 nova migration SQL** com INSERT do fluxo e dos 6 estados


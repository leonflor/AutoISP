

# Procedimento Suporte Tecnico + Encadeamento de Procedimentos + Transferencia entre Agentes IA

## Resumo

Implementar tres capacidades novas no motor de execucao:

1. **Procedimento "Sem Internet"** — fluxo guiado de diagnostico tecnico com verificacao financeira
2. **Encadeamento de procedimentos** (`chain_procedure`) — transicao automatica entre procedimentos preservando contexto
3. **Transferencia entre agentes IA** (`transfer_to_agent`) — nova ferramenta que permite um agente passar a conversa para outro agente especializado (ex: agente de suporte tecnico), preservando todo o contexto coletado

---

## Arquitetura da Transferencia entre Agentes

```text
Conversa (tenant_agent_id = AgentA)
  ↓ tool_call: transfer_to_agent(target_agent_name="Suporte Técnico")
  ↓
procedure-runner:
  1. Busca tenant_agent pelo nome + mesmo isp_id
  2. Atualiza conversations.tenant_agent_id → AgentB
  3. Preserva collected_context integralmente
  4. Limpa active_procedure_id (AgentB detecta procedimento via triggers)
  5. Retorna mensagem de transicao
```

Isso e diferente de `transfer_to_human` (que muda o `mode` para humano) e de `chain_procedure` (que muda o procedimento dentro do mesmo agente).

---

## Mudancas por Arquivo

### 1. `tool-catalog.ts` — 3 novas ferramentas

| Ferramenta | Input | Descricao |
|---|---|---|
| `erp_connection_status` | `contrato_id` | Status RADIUS (online/offline) por contrato |
| `erp_signal_diagnosis` | `contrato_id` | Sinal optico + diagnostico via onu-signal-analyzer |
| `transfer_to_agent` | `target_agent_name`, `reason` | Transfere conversa para outro agente IA do mesmo ISP |

### 2. `response-models.ts` — 2 novos tipos

- `ConnectionStatusResponse` — campos: contrato_id, online, login, erp
- `SignalDiagnosisResponse` — campos: contrato_id, rx_value, rx_level, tx_value, tx_level, diagnosis, recommended_action, severity (0-3), erp

### 3. `erp-providers/ixc.ts` — 2 novas funcoes granulares

- `ixc_radusuarios_by_contract(creds, contrato_id)` — filtra `/radusuarios` por `id_contrato`
- `ixc_fibra_by_login(creds, login_id)` — filtra `/radpop_radio_cliente_fibra` por `id_login`

Diferente das funcoes existentes que buscam TODOS os registros (monitoramento em massa), estas fazem consultas filtradas para uso pela IA.

### 4. `erp-types.ts` — Extender interface `ErpProvider`

Adicionar metodos opcionais:
- `fetchRadusuariosByContract?(creds, contrato_id): Promise<any[]>`
- `fetchFibraByLogin?(creds, login_id): Promise<any[]>`

### 5. `erp-driver.ts` — 2 novas funcoes

- `buscarStatusConexao(supabase, ispId, key, contratoId)` — resolve radusuarios por contrato, retorna online/offline
- `buscarDiagnosticoSinal(supabase, ispId, key, contratoId)` — resolve fibra correlacionada, aplica `analyzeOnuSignal()`, retorna diagnostico completo com severity

### 6. `tool-handlers.ts` — 3 novos handlers

- `erp_connection_status` — valida contrato_id, chama buscarStatusConexao
- `erp_signal_diagnosis` — valida contrato_id, chama buscarDiagnosticoSinal
- `transfer_to_agent` — busca tenant_agent por nome + isp_id, atualiza `tenant_agent_id` na conversa, preserva contexto, limpa procedimento ativo

### 7. `procedure-runner.ts` — 2 mudancas

**a) Nova acao `chain_procedure` no `resolveStepOutcome`:**
- Recebe `procedure_name` e `start_at_step`
- Busca procedimento pelo nome + template_id + is_current
- Atualiza `active_procedure_id` e `step_index` na conversa
- PRESERVA `collected_context`

**b) Persistir status do contrato no `mergeToContext`:**
- Quando `erp_contract_lookup` retorna, salvar `selected_contract_status` e `contract_is_blocked` (true se status bloqueado/financeiro_em_atraso)
- Adicionar na lista de cleanup ao re-consultar cliente

### 8. Nova migration SQL — Procedimento de Suporte Tecnico

```text
Passo 0 — Identificacao (erp_client_lookup, advance: user_confirmation)
Passo 1 — Selecao de contrato (erp_contract_lookup, advance: user_confirmation)
Passo 2 — Verificacao financeira (erp_invoice_search, advance: always)
  on_complete: conditional
    if contract_is_blocked == true → chain_procedure("Cobrança de fatura", start_at_step: 2)
    else → next_step
Passo 3 — Diagnostico tecnico (erp_connection_status, erp_signal_diagnosis, advance: always)
Passo 4 — Resolucao/Escalonamento (transfer_to_human, transfer_to_agent, advance: user_confirmation)
```

Triggers: "sem internet", "sem sinal", "caiu", "lento", "instavel", "nao conecta", "offline", "desconectado", "sem conexao", "internet caiu", "fibra", "onu", "roteador"

### 9. Atualizacao do procedimento de cobranca (v20)

Ajustar instrucao do passo 2 para mencionar: "Se `contract_is_blocked` estiver no contexto, informe ao cliente que o contrato esta com bloqueio financeiro antes de apresentar as faturas."

### 10. Deploy

Redeployar `simulate-agent` e `whatsapp-webhook` (compartilham os modulos _shared).

---

## Fluxo Completo — Exemplo

```text
Cliente: "Estou sem internet"
Bot (Agente Geral): Detecta procedure "Suporte Técnico"
  → Passo 0: Pede CPF → confirma cliente
  → Passo 1: Lista contratos → seleciona
  → Passo 2: Verifica bloqueio financeiro
    → Se bloqueado: chain_procedure → Cobrança (passo 2)
    → Se OK: avança
  → Passo 3: Consulta RADIUS + Sinal óptico
    → Severity 0-1: orienta reiniciar equipamento
    → Severity 2-3: prepara escalonamento
  → Passo 4: "Deseja que eu transfira para suporte técnico?"
    → transfer_to_agent("Suporte Técnico Avançado")
    → OU transfer_to_human (atendente humano)
```

---

## Arquivos editados

| Arquivo | Mudanca |
|---|---|
| `tool-catalog.ts` | +3 ferramentas (connection_status, signal_diagnosis, transfer_to_agent) |
| `response-models.ts` | +2 tipos (ConnectionStatus, SignalDiagnosis) |
| `erp-providers/ixc.ts` | +2 funcoes granulares filtradas por contrato |
| `erp-types.ts` | +2 metodos opcionais na interface |
| `erp-driver.ts` | +2 funcoes (buscarStatusConexao, buscarDiagnosticoSinal) |
| `tool-handlers.ts` | +3 handlers |
| `procedure-runner.ts` | +chain_procedure action, +persistir contract status |
| Nova migration SQL | Procedimento suporte tecnico + cobranca v20 |


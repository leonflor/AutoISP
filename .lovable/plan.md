

# Criar Agente "Suporte N1" — Template + Procedimento Dedicado

## Contexto

Hoje o procedimento "Suporte Técnico — Sem Internet" está vinculado ao template do agente geral (Atendente). O agente geral faz a triagem inicial e, ao detectar problemas técnicos, pode transferir via `transfer_to_agent` para um agente especializado. Precisamos criar esse agente especializado: o **Suporte N1**.

O Suporte N1 será o agente que executa ações técnicas de diagnóstico (verificação de sinal, status de conexão) e orienta o cliente com instruções guiadas de verificação de equipamento.

## O que será criado

### 1. Novo `agent_template` — "Suporte Nível 1"

| Campo | Valor |
|---|---|
| `name` | `suporte_n1` |
| `type` | `support` |
| `default_name` | `Suporte N1` |
| `tone` | `professional` |
| `temperature` | `0.3` (mais preciso, menos criativo) |
| `max_intent_attempts` | `3` |
| `intent_failure_action` | `human` |
| `system_prompt_base` | Prompt especializado em suporte técnico ISP (abaixo) |

**System prompt base:**
```
Você é {agent_name}, técnico de suporte de primeiro nível do provedor de internet. Sua função é realizar diagnósticos técnicos e orientar o cliente na verificação de equipamentos.

COMPORTAMENTO:
- Seja objetivo e técnico, mas acessível ao cliente leigo.
- Sempre explique o que está fazendo: "Vou verificar o status da sua conexão..."
- Ao dar instruções ao cliente (reiniciar roteador, verificar cabos), seja passo-a-passo, com linguagem simples.
- Se o diagnóstico indicar problema grave (sinal crítico, equipamento danificado), encaminhe para atendimento humano.
- Você não resolve questões financeiras. Se o contrato está bloqueado financeiramente, informe e transfira para o agente de atendimento geral ou encadeie o procedimento de cobrança.

INSTRUÇÕES PARA ORIENTAÇÃO DE EQUIPAMENTO:
- Reiniciar roteador/ONU: "1. Desligue o equipamento da tomada. 2. Aguarde 30 segundos. 3. Ligue novamente. 4. Aguarde 2 minutos para estabilizar."
- Verificar cabos: "Verifique se o cabo de fibra óptica está bem conectado na ONU (luz vermelha = cabo desconectado)."
- Verificar luzes: "A luz PON/GPON deve estar fixa (verde). Se estiver piscando ou apagada, há problema na fibra."
```

### 2. Novo `procedure` vinculado ao template — "Diagnóstico Técnico N1"

Fluxo de 4 passos (o cliente já chega identificado via `transfer_to_agent` com contexto preservado):

```
Passo 0 — Validação de contexto
  Se já tem selected_contract_id no contexto, confirmar com o cliente e avançar.
  Se não, pedir CPF e identificar (erp_client_lookup + erp_contract_lookup).
  advance: user_confirmation

Passo 1 — Diagnóstico de conexão e sinal
  Usar erp_connection_status + erp_signal_diagnosis.
  Apresentar resultados de forma clara ao cliente.
  advance: always

Passo 2 — Orientação guiada
  Com base no diagnóstico:
  - Severity 0-1: Orientar reiniciar equipamento, verificar cabos.
    Perguntar se resolveu após reiniciar.
  - Severity 2: Orientar reiniciar + verificar cabos.
    Se não resolver, informar necessidade de visita técnica.
  - Severity 3: Informar problema grave na rede óptica.
    Recomendar transferir para atendente humano.
  advance: user_confirmation

Passo 3 — Resolução / Escalonamento
  Se resolvido, encerrar amigavelmente.
  Se não, usar transfer_to_human para suporte presencial/avançado.
  advance: user_confirmation → end_procedure
```

### 3. Migration SQL

Uma única migration que:
1. Insere o `agent_template` "Suporte Nível 1"
2. Insere o `procedure` "Diagnóstico Técnico N1" vinculado a esse template
3. **Não** cria `tenant_agent` — isso é feito pelo ISP no painel quando ativa o agente

## Arquivos editados

| Arquivo | Mudança |
|---|---|
| Nova migration SQL | `agent_template` + `procedure` do Suporte N1 |

Nenhum arquivo de código precisa ser alterado — o motor (`procedure-runner.ts`, `context-builder.ts`, `tool-handlers.ts`) já suporta todos os recursos necessários (`erp_connection_status`, `erp_signal_diagnosis`, `transfer_to_human`, `transfer_to_agent`).


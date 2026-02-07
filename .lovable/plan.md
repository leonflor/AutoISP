

# Injecao de Prompt: Fluxos + Tools nos Agentes de IA

## Como funciona a injecao hoje

O `ai-chat/index.ts` monta o system prompt em camadas via `buildSystemPrompt()`:

```text
1. System prompt base (do template ai_agents)
2. Tom de voz (do isp_agent)
3. Documentos RAG (chunks por similaridade)
4. Perguntas frequentes (knowledge base)
5. Clausulas de seguranca
6. Contexto atual (nome ISP, data, agente)
```

O plano adiciona **duas novas camadas** entre a 5 e a 6: **Tools disponiveis** e **Fluxos ativos**.

---

## Modelo de dados

Tres novas tabelas, todas vinculadas ao template (`ai_agents`):

### `ai_agent_tools`
Cada registro vira uma funcao no `tools[]` da API OpenAI.

| Campo chave | Exemplo |
|---|---|
| name | `buscar_contrato_cliente` |
| description | "Busca contrato no ERP por nome ou CPF" |
| parameters_schema | `{ type: "object", properties: { busca: { type: "string" } }, required: ["busca"] }` |
| handler_type | `erp_search` |
| requires_erp | true |

### `ai_agent_flows`
Define fluxos conversacionais que o agente pode seguir.

| Campo chave | Exemplo |
|---|---|
| name | "Cobranca" |
| trigger_keywords | `["fatura", "boleto", "debito"]` |
| trigger_prompt | "Ative quando o usuario mencionar problemas financeiros" |
| is_fixed | true (roteiro) ou false (guia flexivel) |

### `ai_agent_flow_steps`
Etapas de cada fluxo, com referencia opcional a uma tool.

| Campo chave | Exemplo |
|---|---|
| step_order | 1 |
| name | "Identificar cliente" |
| instruction | "Peca o CPF ou nome completo" |
| tool_id | NULL (nao usa tool) ou FK para `buscar_contrato_cliente` |
| condition_to_advance | "Quando o cliente informar o CPF" |

---

## Exemplo concreto da injecao no system prompt

Apos carregar tools e flows do banco, o `buildSystemPrompt` adicionara algo como:

```text
## Ferramentas Disponiveis
Voce tem acesso as seguintes funcoes. Use-as quando necessario:
- buscar_contrato_cliente: Busca contrato no ERP por nome ou CPF
- consultar_faturas: Lista faturas abertas de um cliente

## Fluxos Conversacionais

### Fluxo: Cobranca (roteiro fixo)
Ative quando: fatura, boleto, debito, pagamento, cobranca
Siga as etapas na ordem. Nao pule etapas.

1. IDENTIFICAR CLIENTE
   Instrucao: Peca o CPF ou nome completo do cliente.
   Avance quando: O cliente informar o dado.

2. BUSCAR CONTRATO
   Instrucao: Use a funcao buscar_contrato_cliente com o dado informado.
   Ferramenta: buscar_contrato_cliente
   Avance quando: Os dados do contrato forem retornados.

3. LISTAR FATURAS
   Instrucao: Use consultar_faturas para verificar debitos em aberto.
   Ferramenta: consultar_faturas
   Avance quando: As faturas forem listadas.

4. NEGOCIAR
   Instrucao: Apresente as faturas e ofereca opcoes de pagamento.
   Avance quando: O cliente escolher uma opcao.

5. ENCERRAR
   Instrucao: Confirme o acordo e encerre o atendimento.

### Fluxo: Atendimento Geral (guia flexivel)
Ative quando: nenhum outro fluxo se aplicar.
Use as etapas como guia, adaptando conforme a conversa.
...
```

---

## Fluxo de execucao no ai-chat

### Passo 1 -- Carregar dados

Apos carregar o template e clausulas de seguranca (como ja faz), adicionar:

```text
// Buscar tools ativas do agente
SELECT * FROM ai_agent_tools WHERE agent_id = $templateId AND is_active = true

// Buscar flows ativos com steps
SELECT f.*, 
  (SELECT json_agg(s ORDER BY s.step_order) FROM ai_agent_flow_steps s WHERE s.flow_id = f.id AND s.is_active = true) as steps
FROM ai_agent_flows f
WHERE f.agent_id = $templateId AND f.is_active = true
ORDER BY f.sort_order
```

### Passo 2 -- Filtrar tools condicionais

Se uma tool tem `requires_erp = true`, verificar se o ISP tem `erp_configs` com `is_active = true`. Se nao tiver, remover a tool da lista e remover etapas de fluxo que dependem dela.

### Passo 3 -- Injetar no system prompt

Adicionar a `buildSystemPrompt` dois novos parametros: `tools` e `flows`. Gerar as secoes de texto mostradas acima.

### Passo 4 -- Registrar tools na chamada OpenAI

Converter cada registro de `ai_agent_tools` para o formato OpenAI:

```text
tools: [
  {
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters_schema  // ja esta no formato correto
    }
  }
]
```

### Passo 5 -- Tool call loop (max 3 iteracoes)

```text
loop (max 3x):
  resposta = chamar OpenAI(messages, tools)
  
  se resposta.tool_calls:
    para cada tool_call:
      handler = registry[tool.handler_type]
      resultado = handler.execute(args, config)
      messages.push({ role: "assistant", tool_calls: [...] })
      messages.push({ role: "tool", tool_call_id, content: JSON.stringify(resultado) })
    continuar loop
  
  senao:
    retornar resposta final (streaming ou nao)
```

### Passo 6 -- Streaming com tool calls

Quando `stream = true` e houver tool calls intermediarios:
- As chamadas de tool sao executadas internamente (sem streaming parcial)
- Somente a resposta final e transmitida via SSE ao cliente
- Isso significa: primeira chamada sem stream, processar tools, ultima chamada com stream

---

## Alteracoes nos arquivos

| Arquivo | O que muda |
|---|---|
| **Migracao SQL** | Criar `ai_agent_tools`, `ai_agent_flows`, `ai_agent_flow_steps` com RLS + triggers + seed (fluxos Cobranca, Suporte, Venda) |
| **`_shared/erp-fetcher.ts`** | Novo: extrair logica ERP de `fetch-erp-clients` + funcao `searchErpClient` |
| **`_shared/tool-handlers.ts`** | Novo: registry de handlers (`erp_search` inicialmente) |
| **`ai-chat/index.ts`** | Carregar tools/flows do banco, injetar no prompt, montar array `tools` para OpenAI, implementar tool call loop |
| **`fetch-erp-clients/index.ts`** | Refatorar para usar `_shared/erp-fetcher.ts` |
| **`AgentTemplateForm.tsx`** | Adicionar abas "Tools" e "Fluxos" |
| **`AgentToolsTab.tsx`** | Novo: lista/CRUD de tools do agente |
| **`AgentToolForm.tsx`** | Novo: formulario de tool (nome, schema, handler) |
| **`AgentFlowsTab.tsx`** | Novo: lista de fluxos do agente |
| **`AgentFlowForm.tsx`** | Novo: formulario de fluxo (nome, triggers, tipo) |
| **`AgentFlowStepsEditor.tsx`** | Novo: editor de etapas com reordenacao e selecao de tool |
| **`useAgentTools.ts`** | Novo: hook CRUD tools |
| **`useAgentFlows.ts`** | Novo: hook CRUD flows + steps |

---

## Seguranca

- O LLM recebe os fluxos como texto no prompt -- ele interpreta e segue. Nao ha maquina de estados no backend (o LLM e a maquina de estados).
- Tools executam no backend via handlers registrados. O LLM nunca acessa dados diretamente.
- O `handler_config` nunca contem credenciais (essas vem de `erp_configs` ou `platform_config`).
- RLS: somente `super_admin` gerencia tools, flows e steps.


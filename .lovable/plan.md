
# Implementar "Testar Agente" com Iteracao Real (Streaming + RAG + Fontes)

## Objetivo

Fazer o botao "Testar Agente" funcionar de verdade: o ISP envia uma mensagem, o agente responde usando a base de conhecimento (Q&A + documentos RAG), com efeito de digitacao (streaming) e exibindo as fontes consultadas abaixo de cada resposta.

## Problema Atual

O frontend (`AgentTestDialog.tsx`) envia o payload em formato **incompativel** com o que a Edge Function `ai-chat` espera:

```text
Frontend envia:          Backend espera:
  message                  messages[] (array OpenAI format)
  agentId                  isp_id
  ispAgentId               isp_agent_id
  ispId                    stream (boolean)
  conversationHistory
```

Alem disso, a resposta do backend retorna `data.message` mas o frontend le `data.response`. E nao ha suporte a streaming nem exibicao de fontes.

---

## Alteracoes Planejadas

### 1. Edge Function `ai-chat/index.ts` -- Retornar fontes no response

**O que muda:** No response nao-streaming (e no final do streaming), incluir os metadados das fontes consultadas.

- Adicionar ao JSON de resposta um campo `sources` contendo:
  - Trechos de documentos usados (titulo do documento, similaridade)
  - Itens de Q&A injetados (pergunta, categoria)
- No modo streaming: enviar as fontes como um evento SSE final especial (`data: {"sources": [...]}`) antes do `[DONE]`

### 2. Frontend `AgentTestDialog.tsx` -- Corrigir payload + streaming + fontes

**a) Corrigir o payload:**
- Enviar `isp_id`, `isp_agent_id`, `messages` (array com historico completo) e `stream: true`
- Usar `fetch()` direto em vez de `supabase.functions.invoke()` (necessario para streaming)

**b) Implementar streaming:**
- Usar `fetch` com leitura de `ReadableStream` 
- Parsear SSE linha por linha (padrao `data: {json}`)
- Atualizar a mensagem do assistente token por token (efeito digitacao)
- Tratar `[DONE]` e evento de fontes

**c) Exibir fontes consultadas:**
- Abaixo de cada mensagem do assistente, mostrar um bloco expansivel "Fontes consultadas"
- Listar documentos (com % de similaridade) e Q&As utilizadas
- Usar um Accordion ou Collapsible discreto

**d) Corrigir leitura da resposta:**
- Ler `data.message` (nao `data.response`) para o fallback nao-streaming

### 3. Interface `Message` -- Adicionar campo de fontes

Estender a interface para armazenar as fontes junto com cada mensagem:

```text
interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: {
    documents: { content: string; similarity: number; document_title?: string }[];
    knowledge: { question: string; category?: string }[];
  };
}
```

---

## Fluxo Tecnico Completo

```text
1. Usuario digita mensagem no AgentTestDialog
2. Frontend monta payload:
   { isp_id, isp_agent_id, messages: [...historico, nova_msg], stream: true }
3. fetch() para /functions/v1/ai-chat com Authorization header
4. Backend:
   a. Valida JWT, membership, agente
   b. Busca KB (Q&A) + RAG (document_chunks via pgvector)
   c. Monta prompt hierarquico (template + tom + docs + Q&A + seguranca)
   d. Chama OpenAI com stream: true
   e. Proxeia o stream SSE para o cliente
   f. Ao final, envia evento com fontes consultadas
   g. Registra uso em ai_usage
5. Frontend:
   a. Le stream token por token, atualiza mensagem em tempo real
   b. Recebe fontes no evento final
   c. Exibe bloco "Fontes consultadas" abaixo da resposta
```

---

## Secao Tecnica

### Arquivos a modificar:

1. **`supabase/functions/ai-chat/index.ts`**
   - Na branch de streaming (linhas 490-498): interceptar o stream da OpenAI para:
     - Proxeiar tokens normalmente
     - Coletar `usage` do ultimo chunk (OpenAI envia usage no ultimo evento quando `stream_options: { include_usage: true }`)
     - Apos o stream, enviar evento SSE customizado com `sources` (docs + Q&A usados)
     - Registrar `ai_usage` apos o stream terminar
   - Adicionar `stream_options: { include_usage: true }` no body enviado a OpenAI
   - No response nao-streaming (linhas 524-535): adicionar campo `sources` ao JSON

2. **`src/components/painel/ai/AgentTestDialog.tsx`**
   - Reescrever `sendMessage()` para usar `fetch()` com streaming SSE
   - Corrigir payload para formato `ChatRequest` (`isp_id`, `isp_agent_id`, `messages`, `stream`)
   - Adicionar parser SSE linha por linha com tratamento de `[DONE]` e evento `sources`
   - Estender interface `Message` com campo `sources`
   - Adicionar componente de fontes (Collapsible) abaixo de cada mensagem do assistente
   - Importar `Collapsible` do Radix UI

### Dependencias:
- `@radix-ui/react-collapsible` -- ja instalado no projeto

### Sem alteracao de banco:
- Nenhuma migracao necessaria
- Todas as tabelas e funcoes RPC ja existem

### Pre-requisitos para testar:
- `OPENAI_API_KEY` configurada no painel Admin (integracao OpenAI)
- `ENCRYPTION_KEY` configurada como secret do Supabase
- Template do agente com `uses_knowledge_base = true`
- Pelo menos 1 item de Q&A ou 1 documento indexado na base de conhecimento do agente

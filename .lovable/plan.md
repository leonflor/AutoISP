

# Restringir Tools aos Fluxos Vinculados

## Problema Atual

O `ai-chat` injeta **todas** as ferramentas do catalogo no contexto do agente, independentemente de quais fluxos estao vinculados. Isso permite que o agente use ferramentas que nao foram autorizadas para ele.

Exemplo: o "Atendente Virtual" tem acesso a `erp_invoice_search` mesmo sem nenhum fluxo que utilize essa ferramenta.

## Regra Nova

**Tools sao acessiveis ao agente SOMENTE por meio dos fluxos vinculados.** Se nenhum fluxo referencia uma tool, ela nao aparece no prompt nem no function calling.

## Mudanca (1 arquivo)

### `supabase/functions/ai-chat/index.ts`

Tres pontos de alteracao dentro do mesmo arquivo:

**A) Coletar tool_handlers dos fluxos (apos carregar steps, ~linha 549-555)**

Apos montar o `stepsMap`, extrair o conjunto de `tool_handler` strings usados pelos fluxos ativos:

```text
flowToolHandlers = Set de todos os step.tool_handler nao-nulos dos fluxos carregados
```

**B) Substituir a secao "Ferramentas Disponiveis" no prompt (linha 220-226)**

Em vez de listar todas as tools do catalogo, filtrar apenas as que pertencem ao conjunto `flowToolHandlers`:

```text
Antes:  Object.values(TOOL_CATALOG).filter(t => !t.requires_erp || hasErp)
Depois: Object.values(TOOL_CATALOG).filter(t => flowToolHandlers.has(t.handler) && (!t.requires_erp || hasErp))
```

O parametro `flowToolHandlers: Set<string>` sera adicionado a funcao `buildSystemPrompt`.

**C) Substituir o `buildOpenAITools` generico (linha 593)**

Em vez de enviar todas as tools ao OpenAI, construir a lista filtrada:

```text
Antes:  buildOpenAITools(hasActiveErp)
Depois: Filtrar TOOL_CATALOG por flowToolHandlers + hasActiveErp, e montar o array OpenAI somente com essas
```

Se `flowToolHandlers` estiver vazio, nenhuma tool e enviada (agente fica so com texto).

**D) Ajustar log (linha 576-577)**

Mostrar a contagem real de tools filtradas em vez do total do catalogo.

## Fluxo resultante

```text
1. Carrega flow_links do agente
2. Carrega flows ativos + steps
3. Extrai tool_handlers dos steps -> Set<string>
4. Filtra TOOL_CATALOG pelo Set (+ hasErp)
5. Injeta no prompt apenas as tools filtradas
6. Envia ao OpenAI apenas as tools filtradas
7. Agente so pode chamar tools que estao nos seus fluxos
```

## Impacto

- Agentes sem fluxos vinculados nao terao acesso a nenhuma tool
- Adicionar/remover uma tool de um agente passa a ser feito exclusivamente pela gestao de fluxos e seus steps
- Nenhuma alteracao no frontend, banco de dados ou catalogo de tools

## Secao Tecnica

Arquivos alterados: `supabase/functions/ai-chat/index.ts`

Funcoes impactadas:
- `buildSystemPrompt()` — recebe novo parametro `flowToolHandlers: Set<string>`
- Bloco principal do handler — coleta tool handlers apos montar stepsMap, e constroi openaiTools filtrado

Nenhuma migration de banco necessaria.

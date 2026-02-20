

# Documentar Arquitetura de Fluxos Conversacionais no Guia do Projeto

## Objetivo

Criar uma nova seção dedicada no guia do projeto que documenta a arquitetura completa dos fluxos conversacionais: campos de cada etapa, diferenca entre roteiro fixo e flexivel, boas praticas de instrucao e o sistema de rotas condicionais (planejado).

## Onde adicionar

Novo componente `src/components/guia-projeto/integracoes/FluxosConversacionaisSection.tsx` importado na `IASection.tsx` (aba Integracoes > IA), logo abaixo do bloco OpenAI existente. Esse local faz sentido porque os fluxos sao parte da arquitetura de IA do sistema.

## Conteudo da documentacao

### Bloco 1 — Visao Geral da Hierarquia

Card explicando a cadeia: **Agente > Fluxos (via flow_links) > Etapas > Ferramenta (tool_handler)**

Inclui descricao textual de como o `ai-chat/index.ts` monta o system prompt a partir dessa hierarquia.

### Bloco 2 — Campos do Fluxo (ai_agent_flows)

Tabela com cada campo e seu significado:

| Campo | Tipo | Descricao |
|---|---|---|
| `name` | text | Nome exibido no admin e injetado no prompt |
| `description` | text | Descricao interna (nao vai para o prompt) |
| `trigger_keywords` | text[] | Palavras-chave que ativam o fluxo automaticamente |
| `trigger_prompt` | text | Instrucao injetada quando o fluxo e ativado |
| `is_fixed` | boolean | Roteiro fixo (sequencial) vs flexivel (adaptavel) |
| `is_active` | boolean | Se o fluxo esta disponivel para vinculacao |
| `sort_order` | integer | Ordem de exibicao no admin |

### Bloco 3 — Campos da Etapa (ai_agent_flow_steps)

Tabela detalhada com cada campo, tipo e impacto no comportamento da IA:

| Campo | Descricao | Impacto no Prompt |
|---|---|---|
| `name` | Nome da etapa (ex: IDENTIFICACAO) | Titulo em maiusculo no prompt |
| `instruction` | Comando imperativo para a IA | Linha "Instrucao:" no prompt |
| `expected_input` | Dado esperado do usuario | Linha "Input esperado:" |
| `tool_handler` | String do catalogo de tools | Linha "Ferramenta:" (so aparece se a tool existir no catalogo) |
| `tool_auto_execute` | Executar tool automaticamente | Sem interacao manual |
| `condition_to_advance` | Condicao para proximo passo | Linha "Avance quando:" |
| `fallback_instruction` | Orientacao se a etapa falhar | (existe na tabela, ainda nao injetado no prompt) |

### Bloco 4 — Fixo vs Flexivel

Card lado a lado comparando os dois modos:

**Roteiro Fixo (`is_fixed: true`)**
- Prompt injeta: "Siga as etapas na ordem. Nao pule etapas."
- Ideal para: cobranca, compliance, onboarding
- A IA nao pode alterar a sequencia

**Roteiro Flexivel (`is_fixed: false`)**
- Prompt injeta: "Use as etapas como guia, adaptando conforme a conversa."
- Ideal para: suporte tecnico, vendas consultivas
- A IA pode pular ou reordenar etapas conforme contexto

### Bloco 5 — Boas Praticas de Instrucao

Lista de recomendacoes com exemplos:

1. **Use imperativo com restricoes negativas** — "Solicite o CPF do cliente. NAO prossiga sem validar."
2. **Uma ferramenta por etapa** — Evita ambiguidade na escolha de tools
3. **condition_to_advance concreto** — "Pelo menos 1 resultado retornado" em vez de "Cliente encontrado"
4. **trigger_keywords especificos** — "2via, segunda via, boleto" em vez de "pagamento"
5. **expected_input tipado** — "CPF (11 digitos) ou CNPJ (14 digitos)" em vez de "documento"
6. **fallback_instruction explicito** — "Se nao conseguir identificar, pergunte novamente informando o formato esperado"

### Bloco 6 — Rotas Condicionais (Planejado)

Card com badge "Planejado" explicando o sistema de `conditional_routes` (JSONB):

- Estrutura: `[{ condition, goto_step, label }]`
- Impacto no modo fixo: progresso linear COM saltos explicitos
- Impacto no modo flexivel: sugestoes fortes de navegacao
- Exemplo pratico: diagnostico ONU offline -> saltar para suporte tecnico

## Detalhes Tecnicos

### Arquivos a criar:
- `src/components/guia-projeto/integracoes/FluxosConversacionaisSection.tsx` — Componente principal com todos os 6 blocos

### Arquivos a editar:
- `src/components/guia-projeto/integracoes/IASection.tsx` — Importar e renderizar o novo componente abaixo do OpenAIIntegration

### Dependencias:
- Nenhuma nova. Usa apenas componentes UI existentes (Card, Badge, Table, Accordion)


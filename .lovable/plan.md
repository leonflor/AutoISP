
# Separar Nome do Template vs Nome de Apresentacao do Agente

## Resumo

Corrigir a logica para que existam dois nomes distintos e claros:
- **Nome do Template** (`ai_agents.name`): identifica a funcao do agente (ex: "Atendente N1"). Vem sempre do template, sincronizado automaticamente. O ISP nao edita.
- **Nome de Apresentacao** (`isp_agents.display_name`): como o agente se apresenta ao cliente final (ex: "Luna"). Personalizavel pelo ISP, nunca sobrescrito por atualizacoes do template.

## Problema Atual

No momento da ativacao, o campo `display_name` e preenchido automaticamente com `ai_agents.name`, misturando os dois conceitos. Isso faz com que:
- Alteracoes no nome do template nao aparecem no painel do ISP
- O ISP perde a referencia de qual template esta usando se renomear o `display_name`

## Alteracoes Planejadas

### 1. Dialog de Ativacao (`AgentActivationDialog.tsx`)
- Mudar o campo "Nome de Exibicao" para "Nome de Apresentacao" com descricao clara: "Como o agente se apresentara aos seus clientes"
- Iniciar o campo vazio (com placeholder mostrando sugestao)
- Tornar o campo opcional na validacao (remover `min(2)`)
- Exibir o nome do template como informacao fixa acima do campo editavel

### 2. Dialog de Configuracao (`AgentConfigDialog.tsx`)
- Mostrar o nome do template (`ai_agents.name`) como label fixo nao editavel
- Renomear o campo editavel para "Nome de Apresentacao"
- Permitir valor vazio (sem validacao de minimo)
- Ajustar o fallback: se vazio, manter vazio no banco (nao copiar template)

### 3. Card do Agente Ativo (`ActiveAgentCard.tsx`)
- Exibir o nome do template (`ai_agents.name`) como titulo principal ou badge
- Exibir o `display_name` como nome secundario (se preenchido)
- Logica: mostrar ambos quando diferentes, para o ISP sempre saber a funcao do agente

### 4. Hook de Ativacao (`useIspAgents.ts`)
- Na mutacao de ativacao, enviar `display_name` como `null` quando o campo estiver vazio
- Na mutacao de update, permitir salvar `display_name` como `null`

### 5. Edge Function de Chat (`ai-chat/index.ts`)
- Garantir que o nome injetado no prompt use `display_name` (nome de apresentacao) quando disponivel, com fallback para `template.name`

## Secao Tecnica

### Arquivos a modificar:
- `src/components/painel/ai/AgentActivationDialog.tsx` — schema + defaults + UI
- `src/components/painel/ai/AgentConfigDialog.tsx` — schema + UI + labels
- `src/components/painel/ai/ActiveAgentCard.tsx` — exibicao dual de nomes
- `src/hooks/painel/useIspAgents.ts` — logica de insert/update
- `supabase/functions/ai-chat/index.ts` — uso do nome no prompt

### Sem alteracao de banco:
- `isp_agents.display_name` ja e nullable (`is_nullable: YES`)
- `ai_agents.name` ja existe e e obrigatorio
- Nenhuma migracao necessaria

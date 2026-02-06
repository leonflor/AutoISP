
# Corrigir Rolagem do Chat e das Fontes Consultadas

## Problemas Identificados

### 1. Chat sem rolagem
O `ScrollArea` na linha 370 usa `className="flex-1 py-4 min-h-0"`. Embora `flex-1` + `min-h-0` seja o padrao correto para flex containers, o Radix `ScrollArea` precisa de uma altura concreta resolvida pelo layout. O problema e que o `DialogContent` usa `max-h-[90vh]` com `flex flex-col`, mas o `ScrollArea` nao herda a restricao corretamente porque nao ha um container intermediario que force o overflow.

**Solucao:** Envolver a area de mensagens (entre o seletor de agente e o input) em uma `div` com `flex-1 min-h-0 overflow-hidden`, e trocar o `ScrollArea` por uma `div` com `overflow-y-auto` que funciona de forma nativa sem as complicacoes do viewport interno do Radix.

### 2. Fontes consultadas sem rolagem
O `CollapsibleContent` (linha 72) renderiza todos os documentos e Q&A sem restricao de altura. Se houver muitos itens, o bloco cresce indefinidamente e empurra o conteudo do chat.

**Solucao:** Adicionar `max-h-[200px] overflow-y-auto` no container interno do `CollapsibleContent`.

---

## Alteracoes

### Arquivo: `src/components/painel/ai/AgentTestDialog.tsx`

**a) Trocar ScrollArea por div com overflow nativo (linha 370):**
- Remover `<ScrollArea className="flex-1 py-4 min-h-0">`
- Substituir por `<div className="flex-1 min-h-0 overflow-y-auto py-4">`
- Remover import do `ScrollArea` (se nao usado em outro lugar do arquivo)

**b) Adicionar rolagem no bloco de fontes (linha 72):**
- No `CollapsibleContent`, adicionar `max-h-[200px] overflow-y-auto` no container `div` interno (o `space-y-2`)

**c) Manter o `messagesEndRef` e `useEffect` de scroll** — continuam funcionando com a `div` nativa, pois `scrollIntoView` funciona independente do tipo de container.

### Resumo tecnico:
- 1 arquivo modificado: `AgentTestDialog.tsx`
- Sem impacto no backend
- Sem novas dependencias

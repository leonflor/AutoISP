
Objetivo: corrigir definitivamente o foco da janela “Testar Agente” para:
1) focar o textarea com clique simples;
2) ignorar foco automático em duplo clique;
3) ignorar foco automático quando houver seleção de texto (drag ou seleção de palavra), permitindo copiar texto normalmente.

Diagnóstico do problema atual:
- Hoje o foco está no `onClick` do `DialogContent`.
- Mesmo com verificação de `window.getSelection()`, o comportamento ainda falha porque:
  - no duplo clique, o primeiro clique já dispara foco e atrapalha a seleção da palavra;
  - a seleção pode ainda não estar estabilizada no instante do `click`;
  - cliques em elementos interativos (ex.: gatilhos de select/botões) também podem disparar foco indevido no textarea.

Causa raiz:
- Lógica de foco acoplada ao evento `click` “imediato” sem diferenciar clique simples x duplo clique e sem janela de espera para confirmar se haverá seleção.

Plano de implementação:

1) Ajustar estratégia de foco em `src/components/painel/ai/AgentTestDialog.tsx`
- Substituir o foco imediato por foco com pequeno delay (ex.: 180–250ms) no clique simples.
- Criar `timeoutRef` para foco pendente.
- No handler de clique:
  - sair cedo se `isLoading`, sem `selectedAgentId`, ou sem `textareaRef`;
  - ignorar se o alvo do clique for elemento interativo (button, input, textarea, select trigger/content, links, etc.);
  - agendar foco (não focar imediatamente).
- Antes de focar (dentro do timeout), revalidar:
  - se há texto selecionado (`window.getSelection()?.toString().trim().length > 0`) → não focar;
  - se estado ainda permite foco (`!isLoading`, etc.).

2) Cancelar foco pendente em duplo clique
- Adicionar `onDoubleClick` no `DialogContent` para limpar o timeout.
- Isso evita que o primeiro clique de um duplo clique roube foco do usuário durante seleção de palavra.

3) Cancelar foco pendente quando houver início de interação de seleção
- (Opcional robustez) adicionar `onMouseDown` para limpar timeout anterior.
- Mantém comportamento estável em sequência rápida de cliques.

4) Higienização e segurança de ciclo de vida
- Limpar timeout em `useEffect` de cleanup para evitar foco após unmount/fechamento do dialog.
- Garantir tipagem correta do timeout para browser (`number | null`).

5) Preservar comportamento desejado existente
- Manter foco automático após término da resposta (`isLoading -> false`) como já existe.
- Manter foco no envio (`finally`) se isso for útil ao fluxo de chat.

Trecho lógico esperado (alto nível):
- Clique simples na área “neutra” do dialog → foco no textarea.
- Duplo clique em mensagem → sem foco forçado, seleção funciona.
- Drag para selecionar texto → sem foco forçado, seleção funciona.
- Clique em componentes interativos (ex.: select, botão enviar) → não redireciona foco.

Validação (manual, end-to-end):
1. Abrir “Testar Agente”.
2. Clique simples em área vazia do dialog → textarea recebe foco.
3. Duplo clique em palavra da resposta do agente → palavra selecionada, foco não volta para textarea.
4. Selecionar trecho arrastando mouse em mensagem do agente → seleção permanece, possível copiar.
5. Interagir com selector de agente e botão enviar → sem “puxar foco” indevido.
6. Enviar mensagem e aguardar resposta → foco volta ao textarea ao final (comportamento produtivo).

Arquivo alvo:
- `src/components/painel/ai/AgentTestDialog.tsx`

Risco/impacto:
- Baixo risco e escopo local.
- Impacta somente UX do foco no modal de teste de agente, sem alterar backend nem contrato de dados.

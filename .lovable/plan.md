
# Corrigir Overflow no Editor de Etapas dos Fluxos Conversacionais

## Problema

Ao expandir um fluxo para editar etapas, o conteudo excede a largura da tela porque a linha de cada etapa usa `flex` sem `flex-wrap`, com um Select de largura fixa (`w-[160px]`) e um Input que nao encolhe.

## Solucao

### Arquivo: `src/components/admin/ai-agents/GlobalFlowStepsEditor.tsx`

1. **Linha 90 (container da etapa)**: Adicionar `overflow-hidden` ao `div.border` para evitar que o card exceda o pai
2. **Linha 91 (flex row principal)**: Alterar de `flex items-center gap-2` para `flex flex-wrap items-center gap-2` para permitir quebra de linha em telas menores
3. **Linha 97 (Input do nome)**: Adicionar `min-w-0 flex-1` para que o input encolha corretamente dentro do flex
4. **Linha 98-108 (Select da tool)**: Trocar `w-[160px]` por `w-[160px] shrink-0` (ja tem shrink implicitamente, mas garantir) ou usar `min-w-[140px] max-w-[160px]` para flexibilidade
5. **Linha 114 (grid de inputs)**: Alterar `grid-cols-2` para `grid grid-cols-1 sm:grid-cols-2` para empilhar em telas pequenas

### Arquivo: `src/pages/admin/AiFlows.tsx`

6. **Container do CollapsibleContent (linha ~80)**: Adicionar `overflow-hidden` ao CardContent para conter qualquer overflow residual

## Impacto

- 2 arquivos editados
- Apenas classes CSS (Tailwind) alteradas, sem mudanca de logica

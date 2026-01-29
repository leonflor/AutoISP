
## Objetivo
Garantir que o botão “Ativar Agente” (e os botões dos cards ativos) fique sempre alinhado no rodapé do card, independentemente do tamanho do texto/quantidade de features.

## Diagnóstico (por que ainda está desalinhado)
Mesmo com `flex-1` e `mt-auto`, o alinhamento não acontece porque o `space-y-*` do Tailwind aplica `margin-top` nos filhos via seletor (`.space-y-4 > ...`), que acaba sobrescrevendo o `mt-auto` do botão/linha de botões. Resultado: o botão não “empurra” para baixo e fica flutuando acima.

## Solução
Substituir `space-y-4` por `gap-4` nos containers que precisam permitir `mt-auto`:
- `gap-*` usa `gap` do flexbox (não mexe em `margin-top` dos filhos).
- Assim, `mt-auto` volta a funcionar e o botão vai para o fundo do card.

## Mudanças propostas

### 1) AgentCatalogCard (Catálogo)
**Arquivo:** `src/components/painel/ai/AgentCatalogCard.tsx`

- Trocar:
  - `CardContent className="flex-1 flex flex-col space-y-4"`
  - por `CardContent className="flex-1 flex flex-col gap-4"`
- Manter o botão com `className="w-full mt-auto"` (agora o `mt-auto` funcionará de verdade).

**Efeito esperado:** o botão “Ativar Agente” fica sempre no bottom do card, mesmo quando não houver lista de features/tags.

### 2) ActiveAgentCard (Meus Agentes)
**Arquivo:** `src/components/painel/ai/ActiveAgentCard.tsx`

- Trocar:
  - `CardContent className="flex-1 flex flex-col space-y-4"`
  - por `CardContent className="flex-1 flex flex-col gap-4"`
- Manter a linha de botões com `className="flex gap-2 mt-auto pt-2"`.

**Efeito esperado:** os botões “Configurar / Base Q&A / Chat” ficam sempre alinhados no rodapé do card, mesmo com/sem “Instruções extras”.

## Checklist de validação (manual)
1. Ir em **Painel → Agentes de IA → Catálogo** e conferir uma linha com cards com:
   - poucos recursos (sem lista) e muitos recursos (com lista).
   - O botão deve ficar alinhado com os demais na mesma linha.
2. Ir em **Painel → Agentes de IA → Meus Agentes** e conferir:
   - agentes com e sem “Instruções extras”.
   - os botões inferiores devem alinhar.

## Observação técnica
- Não vamos remover espaçamentos visuais: `gap-4` mantém o mesmo “respiro” que `space-y-4`, mas sem conflitar com `mt-auto`.

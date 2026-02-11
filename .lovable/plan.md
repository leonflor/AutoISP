

# Ajuste Visual das Paginas de Procedimentos de IA

## Problema

As paginas `AiProcedures.tsx` e `AiProcedureDetail.tsx` nao possuem o padding padrao `p-6` usado nas demais paginas admin (como `AiAgents.tsx`). O conteudo fica colado nas bordas, sem as margens consistentes do restante da interface.

## Ajustes planejados

### 1. AiProcedures.tsx (listagem)

- Adicionar `p-6` no container raiz para alinhar com o padrao admin
- Melhorar o estado vazio com mais respiro visual (padding maior no card)
- Adicionar `tracking-tight` no titulo para consistencia tipografica
- Ajustar os cards da grid: usar `flex flex-col h-full` para alinhamento uniforme entre cards de alturas diferentes
- Separar melhor os contadores (tools/fluxos/agentes) com badges ou separadores visuais
- Adicionar `gap-6` no grid em vez de `gap-4` para mais respiro

### 2. AiProcedureDetail.tsx (detalhe)

- Adicionar `p-6` no container raiz
- Melhorar espacamento do header (botao voltar + titulo)
- Adicionar subtitulo descritivo abaixo do titulo
- Melhorar o formulario basico: envolver campos em um Card para consistencia visual
- Adicionar `gap-6` entre os campos do formulario
- Botao "Salvar" alinhado a direita com mais destaque

## Secao tecnica

**Arquivos a modificar:**

| Arquivo | Mudanca |
|---|---|
| `src/pages/admin/AiProcedures.tsx` | Adicionar `p-6`, ajustar grid gap, melhorar cards com `flex flex-col h-full`, consistencia tipografica |
| `src/pages/admin/AiProcedureDetail.tsx` | Adicionar `p-6`, envolver formulario basico em Card, ajustar espacamentos, alinhar botao salvar |

**Padrao seguido:** Mesmo layout de `AiAgents.tsx` que usa `p-6 space-y-6` e `tracking-tight` no titulo.


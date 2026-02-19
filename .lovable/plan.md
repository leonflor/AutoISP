

# Atualizar Guia do Projeto com Implementacoes Recentes

## O que foi implementado

Tres melhorias nos modais de Fluxos Conversacionais (GlobalFlowForm e AgentFlowForm):

1. **Modal responsivo** -- alinhado ao topo com scroll interno (`max-h-[90vh]`, `top-[5vh]`, `ScrollArea`)
2. **Largura aumentada** -- de `max-w-lg` (512px) para `max-w-2xl` (672px)
3. **Texto de ajuda no Roteiro Fixo** -- `FormDescription` explicando a diferenca entre fixo e flexivel

## Onde atualizar no guia

### 1. ComponentsSection.tsx -- Nova secao "Modais / Dialogs"

Adicionar um novo `Card` ao final do arquivo `src/components/guia-projeto/design/ComponentsSection.tsx` documentando o padrao de modais adotado no projeto:

- Padrao de posicionamento: `top-[5vh] translate-y-0` (alinhado ao topo)
- Altura maxima: `max-h-[90vh]` com `flex flex-col`
- Scroll interno: `ScrollArea` envolvendo o conteudo do formulario
- Header e Footer fixos (fora do scroll)
- Largura recomendada: `max-w-2xl` para formularios complexos
- Tabela de especificacoes com as classes Tailwind

### 2. ComponentsSection.tsx -- Nova secao "Formularios com Switches"

Adicionar um Card documentando o padrao de switches com texto de ajuda:

- Layout: `flex flex-col gap-1` para empilhar switch+label e descricao
- Switch+Label em `div flex items-center gap-2`
- `FormDescription` com classe `text-xs` para texto explicativo abaixo

## Arquivos editados (1)

| Arquivo | Mudanca |
|---------|---------|
| `src/components/guia-projeto/design/ComponentsSection.tsx` | Adicionar 2 novos Cards: "Modais / Dialogs" e "Formularios com Switches" |

## Detalhe tecnico

Dois novos blocos `Card` serao adicionados apos o card "Estilos de Interface" (linha 243), seguindo o mesmo padrao visual ja usado nos outros cards da secao (CardHeader + CardTitle + CardContent com tabela de especificacoes e exemplos visuais).

O card de Modais incluira uma tabela com:

| Propriedade | Valor |
|-------------|-------|
| Posicao | `top-[5vh] translate-y-0` |
| Altura Max | `max-h-[90vh]` |
| Layout | `flex flex-col` |
| Scroll | `ScrollArea` no conteudo |
| Largura (complexo) | `max-w-2xl` (672px) |
| Header/Footer | Fixos, fora do scroll |

O card de Switches incluira exemplo visual do padrao com descricao e a tabela de classes.



# Aumentar Largura dos Modais de Fluxo

## Problema

Os modais de criar/editar fluxo usam `max-w-lg` (512px), deixando o conteudo apertado lateralmente.

## Solucao

Alterar `max-w-lg` para `max-w-2xl` (672px) nos dois formularios de fluxo. Isso segue o padrao ja documentado para modais de configuracao complexos.

## Arquivos editados (2)

| Arquivo | Linha | Mudanca |
|---------|-------|---------|
| `GlobalFlowForm.tsx` | 82 | `max-w-lg` -> `max-w-2xl` |
| `AgentFlowForm.tsx` | 129 | `max-w-lg` -> `max-w-2xl` |

Apenas uma classe Tailwind alterada em cada arquivo, sem mudanca de logica.


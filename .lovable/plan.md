

# Ajustar Status de Assinantes: Ativo / Nao Ativo

## Contexto

O campo `radusuarios.ativo` retorna apenas `S` ou `N`. Portanto, os status "suspenso", "bloqueado" e "cancelado" nao se aplicam ao IXC neste modelo. O filtro e os cards devem refletir apenas dois estados: **Ativo** e **Nao Ativo**.

## Mudancas

### 1. `ixc.ts` -- Remover filtro ativo=S e usar campo ativo como status

- Remover o filtro `{ qtype: "radusuarios.ativo", query: "S", oper: "=" }` para trazer todos os registros (S e N)
- Usar o campo `ativo` do radusuarios como `raw_status`: `ativo:S` ou `ativo:N`
- Manter o preenchimento de dados de cliente, contrato e fibra como esta (left join por associacao)

### 2. `erp-types.ts` -- Adicionar "nao_ativo" ao ContractStatus

- Incluir `"nao_ativo"` como valor valido no tipo `ContractStatus`

### 3. `erp-driver.ts` -- Atualizar mapeamento IXC

- Alterar `IXC_STATUS_MAP` para:
  - `ativo:S` -> `"ativo"`
  - `ativo:N` -> `"nao_ativo"`
- Remover mapeamentos de `contrato:A/S/C` que nao sao mais usados pelo IXC
- Mapeamento de `sem_contrato` -> `"ativo"` (esta em radusuarios, entao e ativo na rede)

### 4. `Subscribers.tsx` -- Simplificar filtro e cards de status

- Filtro de status: manter apenas "Todos", "Ativo", "Nao Ativo"
- Cards de estatisticas: remover "Suspensos" e "Bloqueados", manter Total, Ativos, Nao Ativos, Conectados, Sinal Critico (5 cards em vez de 6)
- Adicionar cor para "nao_ativo" no `statusColors`
- Exibir label "nao ativo" formatado como "Não Ativo"

### 5. `useErpClients.ts` -- Atualizar stats

- Remover `suspensos` e `bloqueados` das stats
- Adicionar `nao_ativos` (count de `status_contrato !== "ativo"`)
- Manter filtro "nao_ativo" funcionando (status_contrato === "nao_ativo")

### 6. `useErpClients.ts` (frontend type) -- Incluir "nao_ativo" no SignalQuality/status

- O tipo `SignalQuality` nao muda
- Mas a lista de status possiveis muda para contemplar "nao_ativo"

## Resumo de arquivos alterados

| Arquivo | O que muda |
|---|---|
| `erp-providers/ixc.ts` | Remove filtro ativo=S, usa campo ativo como raw_status |
| `erp-types.ts` | Adiciona "nao_ativo" ao ContractStatus |
| `erp-driver.ts` | Atualiza IXC_STATUS_MAP |
| `Subscribers.tsx` | Simplifica filtro e cards |
| `useErpClients.ts` | Atualiza stats (remove suspensos/bloqueados, adiciona nao_ativos) |


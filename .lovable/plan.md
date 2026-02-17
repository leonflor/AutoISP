
# Implementacao UI: Sinal ONU na Lista de Assinantes

## Resumo

O backend ja esta completo (`onu-signal-analyzer.ts`, `fetch-erp-clients` com `signal_db`/`signal_quality`, `fetch-onu-signal` para diagnostico detalhado). Agora implementaremos a camada de UI seguindo os padroes existentes do SaaS.

---

## 1. Componente SignalBadge

**Arquivo**: `src/components/painel/subscribers/SignalBadge.tsx`

Componente reutilizavel que recebe `signal_quality` e `signal_db` e renderiza um badge colorido com tooltip. Segue o padrao de cores ja usado no projeto (statusColors, providerColors).

| Qualidade | Cor | Icone |
|-----------|-----|-------|
| excellent / ideal | Verde | Sinal cheio |
| acceptable | Amarelo | Sinal medio |
| weak | Laranja | Sinal fraco |
| critical / saturated | Vermelho | Alerta |
| unknown | Cinza | Traco |

---

## 2. Coluna "Sinal" na tabela de Assinantes

**Arquivo**: `src/pages/painel/Subscribers.tsx`

- Adicionar coluna "Sinal" entre "Status" e "Conexao"
- Renderizar `SignalBadge` com `client.signal_quality` e `client.signal_db`
- Clientes de provedores sem suporte a sinal (SGP, MK) exibem traco

---

## 3. Dialog de Diagnostico Detalhado (on-demand)

**Arquivo**: `src/components/painel/subscribers/SignalDiagnosticsDialog.tsx`

- Abre ao clicar no `SignalBadge` de um cliente IXC
- Chama a Edge Function `fetch-onu-signal` com `client_id`
- Exibe TX e RX separados com classificacao, diagnostico e acao recomendada
- Usa os componentes existentes: `Dialog`, `Card`, `Badge`, `Skeleton`

---

## 4. Hook useOnuSignal

**Arquivo**: `src/hooks/painel/useOnuSignal.ts`

- Hook que encapsula a chamada a `fetch-onu-signal`
- Recebe `clientId` (erp_id do IXC)
- Retorna `{ signal, report, loading, error, fetch }`
- Usa `useQuery` com `enabled: false` (manual trigger)

---

## 5. Alerta de sinal critico nos stats cards

**Arquivo**: `src/pages/painel/Subscribers.tsx`

- Adicionar um sexto card de stats: "Sinal Critico"
- Conta clientes com `signal_quality === 'critical' || signal_quality === 'weak'`
- Cor vermelha/laranja conforme quantidade

---

## Detalhes tecnicos

### Arquivos criados (3):
1. `src/components/painel/subscribers/SignalBadge.tsx` -- badge com tooltip
2. `src/components/painel/subscribers/SignalDiagnosticsDialog.tsx` -- dialog de diagnostico TX/RX
3. `src/hooks/painel/useOnuSignal.ts` -- hook para Edge Function fetch-onu-signal

### Arquivos editados (1):
1. `src/pages/painel/Subscribers.tsx` -- coluna Sinal + card stats + integracao do dialog

### Nenhuma dependencia nova
Todos os componentes UI ja existem no projeto (Dialog, Badge, Tooltip, Card, Skeleton).

### Nenhuma tabela nova
Dados vem 100% das Edge Functions ja implementadas.

### Padrao mantido
- SignalQuality type reutilizado do hook `useErpClients`
- Cores seguem o mapa `statusColors` / `providerColors` existente
- Hook segue o padrao `useErpClients` com react-query
- Dialog segue o padrao do projeto (Dialog do radix-ui)

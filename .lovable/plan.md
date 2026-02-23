

# Refatorar IXC: radpop_radio_cliente_fibra como Eixo Principal

## Contexto

Atualmente o provider IXC itera sobre `/cliente` (pessoas) como eixo principal e faz joins com contratos, RADIUS e fibra. O usuario identificou que `/radpop_radio_cliente_fibra` e o melhor ponto de partida porque representa conexoes ativas reais (equipamentos provisionados), e a partir dele se obtem sinal, conexao e se faz o join com contrato e cliente.

## Nova Logica de Iteracao (IXC)

```text
ANTES:  /cliente (pessoa) --> join contrato --> join radius --> join fibra
DEPOIS: /radpop_radio_cliente_fibra --> join radusuarios --> join cliente_contrato --> join cliente
```

## Mapeamento de Colunas: Origem de Cada Campo

| Coluna UI | Campo normalizado | Endpoint IXC de origem | Campo IXC |
|---|---|---|---|
| Integracao | `provider` / `provider_name` | Injetado pelo Driver | fixo "ixc" / "IXC Soft" |
| Nome | `nome` | `/cliente` | `razao` ou `fantasia` |
| CPF/CNPJ | `cpf_cnpj` | `/cliente` | `cnpj_cpf` |
| Vencimento | `data_vencimento` | `/cliente_contrato` | `dia_vencimento` |
| Plano | `plano` | `/cliente_contrato` | `contrato` ou `id_vd_contrato` |
| Login | `login` | `/radusuarios` | `login` |
| Status | `status_contrato` | `/cliente_contrato` | `status` (normalizado A/S/C) |
| Sinal | `signal_db` / `signal_quality` | `/radpop_radio_cliente_fibra` | `sinal_rx` |
| Conexao | `conectado` | `/radusuarios` | `online` (S/N) |

## Fluxo de Dados Detalhado

1. **Buscar `/radpop_radio_cliente_fibra`** (rp: 5000) — eixo principal, cada registro = 1 conexao fibra
   - Campos usados: `id`, `id_login`, `sinal_rx`, `sinal_tx`

2. **Buscar `/radusuarios`** (rp: 5000) — vincular via `id_login` (fibra) = `id` (radusuarios)
   - Campos usados: `id`, `id_cliente`, `login`, `online`

3. **Buscar `/cliente_contrato`** (rp: 5000) — vincular via `id_cliente` do radusuarios
   - Campos usados: `id`, `id_cliente`, `status`, `contrato`, `id_vd_contrato`, `dia_vencimento`

4. **Buscar `/cliente`** (rp: 5000) — vincular via `id_cliente` do radusuarios
   - Campos usados: `id`, `razao`, `fantasia`, `cnpj_cpf`

5. **Montagem**: Iterar sobre registros de fibra. Para cada um:
   - Encontrar radusuario pelo `id_login`
   - Encontrar cliente pelo `id_cliente` do radusuario
   - Encontrar contrato(s) pelo `id_cliente` do radusuario
   - Se houver multiplos contratos para o mesmo `id_cliente`, gerar 1 registro por contrato
   - Se nao houver contrato, gerar 1 registro com plano/status como null

## Impacto nos IDs

- `erp_id`: passa a ser o ID do registro em `radpop_radio_cliente_fibra` (identificador unico da conexao)
- Novo campo `contrato_id`: ID do contrato em `cliente_contrato`
- Novo campo `cliente_erp_id`: ID da pessoa em `/cliente` (necessario para diagnostico ONU via `botao_rel_22991`)

## Alteracoes por Arquivo

### 1. `erp-types.ts`
- Adicionar `contrato_id: string` e `cliente_erp_id: string` em `RawErpClient` e `ErpClient`
- Campos opcionais (null) para providers que nao distinguem (SGP, MK)

### 2. `erp-providers/ixc.ts` — Mudanca principal
- Inverter logica: iterar sobre `/radpop_radio_cliente_fibra`
- Construir maps: `radusuariosById` (id -> record), `clientesById` (id -> record), `contratosByClienteId` (id_cliente -> contrato[])
- Para cada registro fibra:
  - Resolver radusuario via `id_login`
  - Resolver cliente via `id_cliente` do radusuario
  - Resolver contratos via `id_cliente`
  - Gerar N registros se houver N contratos, ou 1 se nao houver contrato

### 3. `erp-providers/sgp.ts` e `mk.ts`
- Adicionar `contrato_id: erp_id` e `cliente_erp_id: erp_id` (mesmo valor, pois esses ERPs nao separam contrato de cliente)

### 4. `erp-driver.ts`
- `normalizeClient`: incluir `contrato_id` e `cliente_erp_id` na saida
- `fetchClientSignal`: usar `cliente_erp_id` em vez de `erp_id` para diagnostico ONU (o endpoint `botao_rel_22991` usa `id_cliente`, nao ID de contrato)

### 5. `tool-handlers.ts`
- Incluir `contrato_id` e `login` na saida do `erp_search` e `erp_active_client_search` para a IA referenciar contratos especificos

### 6. `useErpClients.ts` (frontend)
- Atualizar interface `ErpClient` com `contrato_id` e `cliente_erp_id`

### 7. `Subscribers.tsx` (frontend)
- Key do map: `${client.provider}-${client.erp_id}-${idx}` (ja funciona, erp_id agora e unico por conexao fibra)
- Diagnostico ONU: usar `client.cliente_erp_id` em vez de `client.erp_id`
- Subtitulo: "Conexoes de todas as integracoes ERP" (reflete que cada linha e uma conexao, nao uma pessoa)

### Nenhuma migracao de banco necessaria
Os dados vem diretamente da API do ERP em tempo real.

### Nenhuma dependencia nova necessaria

### Retrocompatibilidade
- SGP e MK continuam funcionando identicamente (contrato_id = erp_id)
- A UI nao muda visualmente — apenas exibe mais linhas quando ha multiplos contratos/conexoes para o mesmo CPF


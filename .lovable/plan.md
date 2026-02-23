

# Refatorar IXC: radusuarios como Eixo Principal

## Contexto

O endpoint `/radusuarios` lista todos os usuarios RADIUS autenticados na infraestrutura -- tanto clientes proprios do ISP quanto parceiros que compartilham a mesma rede. Isso o torna a melhor fonte para monitoramento completo de conexoes.

## Nova Logica de Iteracao (IXC)

```text
ANTES:  /radpop_radio_cliente_fibra --> join radusuarios --> join cliente/contrato
DEPOIS: /radusuarios --> join cliente --> join cliente_contrato --> left join radpop_radio_cliente_fibra (sinal)
```

## Mapeamento de Colunas: Origem de Cada Campo

| Coluna UI | Campo normalizado | Endpoint IXC | Campo IXC |
|---|---|---|---|
| Integracao | `provider` / `provider_name` | Driver | fixo "ixc" / "IXC Soft" |
| Nome | `nome` | `/cliente` | `razao` ou `fantasia` |
| CPF/CNPJ | `cpf_cnpj` | `/cliente` | `cnpj_cpf` |
| Vencimento | `data_vencimento` | `/cliente_contrato` | `dia_vencimento` |
| Plano | `plano` | `/cliente_contrato` | `contrato` ou `id_vd_contrato` |
| Login | `login` | `/radusuarios` | `login` |
| Status | `status_contrato` | `/cliente_contrato` | `status` (normalizado A/S/C) |
| Sinal | `signal_db` | `/radpop_radio_cliente_fibra` | `sinal_rx` |
| Conexao | `conectado` | `/radusuarios` | `online` (S/N) |

## Fluxo de Dados

1. **Buscar `/radusuarios`** (rp: 5000) -- eixo principal, cada registro = 1 usuario RADIUS (conexao)
   - Campos: `id`, `id_cliente`, `login`, `online`

2. **Buscar `/cliente`** (rp: 5000) -- dados pessoais, join via `id_cliente`
   - Campos: `id`, `razao`, `fantasia`, `cnpj_cpf`

3. **Buscar `/cliente_contrato`** (rp: 5000) -- contratos, join via `id_cliente`
   - Campos: `id`, `id_cliente`, `status`, `contrato`, `id_vd_contrato`, `dia_vencimento`

4. **Buscar `/radpop_radio_cliente_fibra`** (rp: 5000) -- sinal optico, join via `id_login` = `radusuarios.id`
   - Campos: `id`, `id_login`, `sinal_rx`

5. **Montagem**: Iterar sobre radusuarios. Para cada um:
   - Encontrar cliente pelo `id_cliente`
   - Encontrar contrato(s) pelo `id_cliente`
   - Encontrar fibra pelo `id_login` = `radusuarios.id` (para sinal)
   - Se houver multiplos contratos, gerar 1 registro por contrato
   - Se nao houver contrato, gerar 1 registro com plano/status null
   - Se nao houver fibra, sinal = null (usuario pode ser radio/cabo, nao fibra)

## Impacto nos IDs

- `erp_id`: ID do registro em `/radusuarios` (identificador unico da conexao RADIUS)
- `contrato_id`: ID do contrato em `/cliente_contrato`
- `cliente_erp_id`: ID da pessoa em `/cliente` (necessario para diagnostico ONU)

## Alteracoes por Arquivo

### 1. `erp-providers/ixc.ts` -- Mudanca principal
- Trocar eixo de `radpop_radio_cliente_fibra` para `radusuarios`
- Construir maps: `clientesById`, `contratosByClienteId`, `fibraByIdLogin` (id_login -> record)
- Para cada radusuario:
  - Resolver cliente via `id_cliente`
  - Resolver contratos via `id_cliente`
  - Resolver sinal via fibra onde `id_login` = `radusuarios.id`
  - Gerar N registros se N contratos, ou 1 se nenhum contrato
- Atualizar comentario do arquivo

### 2. `erp-types.ts` -- Sem alteracao
Os campos `erp_id`, `contrato_id`, `cliente_erp_id` ja existem e continuam validos.

### 3. `erp-driver.ts` -- Sem alteracao
`normalizeClient` e `fetchClientSignal` (usa `cliente_erp_id`) ja estao corretos.

### 4. `erp-providers/sgp.ts` e `mk.ts` -- Sem alteracao
Ja mapeiam `contrato_id` e `cliente_erp_id` corretamente.

### 5. `tool-handlers.ts` -- Sem alteracao
Ja inclui `contrato_id` e `login` na saida.

### 6. `useErpClients.ts` e `Subscribers.tsx` -- Sem alteracao
Interfaces e keys ja suportam os campos necessarios.

### Resumo: apenas `ixc.ts` precisa ser alterado.

- Nenhuma migracao de banco necessaria
- Nenhuma dependencia nova
- SGP e MK inalterados
- UI inalterada visualmente -- agora captura conexoes de parceiros alem dos clientes proprios


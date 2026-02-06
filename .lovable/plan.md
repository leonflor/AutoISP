
# Lista de Clientes ERP na Pagina de Assinantes

## Objetivo
Substituir os dados mock da pagina de assinantes por dados reais buscados de todas as integracoes ERP configuradas (IXC, SGP, MK-Solutions). Cada cliente exibira: nome, CPF/CNPJ, data de vencimento, plano, login, status do contrato, status de conexao e qual ERP ele pertence.

## Arquitetura

A solucao envolve:
1. Uma nova Edge Function `fetch-erp-clients` que busca clientes de todos os ERPs conectados
2. Um novo hook `useErpClients` para consumir essa Edge Function
3. Atualizacao da pagina `Subscribers.tsx` para usar os dados reais

## Detalhes Tecnicos

### 1. Edge Function: `supabase/functions/fetch-erp-clients/index.ts`

Responsabilidades:
- Receber requisicao autenticada do usuario
- Buscar todas as `erp_configs` ativas e conectadas do ISP
- Para cada config, descriptografar credenciais e chamar a API do ERP correspondente
- Buscar lista de clientes com dados de contrato/conexao
- Normalizar os dados em um formato unificado
- Retornar array consolidado com campo `provider` identificando a origem

Endpoints por ERP:
- **IXC**: `POST /webservice/v1/cliente` (listar) + `POST /webservice/v1/cliente_contrato` para contratos
- **SGP**: `POST /api/ura/clientes` com parametros de busca
- **MK**: `POST /mk/WSMKIntegracaoGeral.rule` com `funcao=listarClientes`

Formato de retorno unificado:
```typescript
interface ErpClient {
  erp_id: string;
  provider: 'ixc' | 'mk_solutions' | 'sgp';
  provider_name: string; // "IXC Soft", "SGP", "MK-Solutions"
  nome: string;
  cpf_cnpj: string;
  data_vencimento: string | null;
  plano: string | null;
  login: string | null;
  status_contrato: string; // ativo, suspenso, cancelado, bloqueado
  conectado: boolean;
}
```

Parametros aceitos via query/body:
- `search` (opcional): filtro por nome ou CPF
- `page` e `limit` para paginacao

### 2. Hook: `src/hooks/painel/useErpClients.ts`

- Usa `useQuery` do TanStack Query para chamar `fetch-erp-clients`
- Recebe filtros de busca, status e paginacao
- Retorna lista tipada de `ErpClient[]`, loading, error e stats

### 3. Pagina: `src/pages/painel/Subscribers.tsx`

Alteracoes:
- Remover uso do hook mock `useSubscribers`
- Usar o novo `useErpClients`
- Adicionar coluna "Integracao" com Badge colorido por provider
- Colunas: Integracao | Nome | CPF/CNPJ | Vencimento | Plano | Login | Status Contrato | Conectado
- Status de conexao exibido com icone verde/vermelho (circulo)
- Filtro por integracao (Select com os ERPs ativos)
- Manter cards de estatisticas no topo
- Estado vazio: mensagem orientando a configurar integracao ERP

### 4. Cores dos providers (Badge)

| Provider | Cor |
|---|---|
| IXC Soft | Azul |
| SGP | Verde |
| MK-Solutions | Roxo |

## Arquivos

| Arquivo | Acao |
|---|---|
| `supabase/functions/fetch-erp-clients/index.ts` | Criar - Edge Function para buscar clientes |
| `src/hooks/painel/useErpClients.ts` | Criar - Hook para consumir a Edge Function |
| `src/pages/painel/Subscribers.tsx` | Alterar - Usar dados reais do ERP |

## Consideracoes

- A Edge Function reutiliza o padrao de descriptografia ja existente em `test-erp`
- Se nenhum ERP estiver configurado, retorna array vazio com mensagem amigavel
- Erros de um ERP nao bloqueiam os demais (cada um e processado independentemente)
- A resposta inclui um campo `errors` com falhas parciais por provider
- Paginacao e feita no frontend inicialmente (os ERPs retornam listas completas)

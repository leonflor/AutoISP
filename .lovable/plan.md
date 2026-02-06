
# Corrigir Refresh da Tela ERP ao Perder/Recuperar Foco

## Problema

O TanStack React Query possui a opcao `refetchOnWindowFocus` ativada por padrao. Toda vez que o usuario troca de aba (para consultar documentacao, por exemplo) e retorna, todas as queries sao reexecutadas, causando um "flash" de loading (skeletons) na tela de Integracoes ERP.

## Causa Raiz

No `QueryClient` configurado em `src/App.tsx`, a opcao `refetchOnWindowFocus` nao esta definida, herdando o valor padrao `true`.

## Alteracao

### Arquivo: `src/App.tsx`

Adicionar `refetchOnWindowFocus: false` nas opcoes padrao do `QueryClient`:

```text
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,  // <-- adicionar esta linha
    },
  },
});
```

## Impacto

- Os dados continuarao sendo buscados normalmente no carregamento inicial da pagina e apos mutacoes (salvar, excluir, etc.)
- A tela nao ira mais "piscar" ao trocar de aba e voltar
- Aplica-se globalmente a todas as paginas do sistema, nao apenas a tela de ERP

Sem alteracao de banco. Sem novas dependencias. Apenas uma linha adicionada.



# Melhorias na Página de Integração ERP

## Objetivo

Implementar três ajustes na página de integração ERP:
1. Adicionar botão "Testar" para verificar conexão dos ERPs configurados
2. Colocar os cards em linha (horizontal)
3. Remover a caixa "Como funciona?"

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/components/painel/erp/ErpProviderCard.tsx` | Adicionar botão "Testar" e prop `onTest` |
| `src/pages/painel/ErpIntegrations.tsx` | Remover info card, ajustar grid para linha, passar `onTest` |

---

## Seção Técnica

### ErpProviderCard.tsx

Adicionar prop `onTest` e `isTestingConnection` para o botão de teste:

```typescript
interface ErpProviderCardProps {
  provider: ErpProviderInfo;
  config?: ErpConfig;
  onConfigure: () => void;
  onTest?: () => void;           // Nova prop
  isTestingConnection?: boolean;  // Nova prop
}

// No JSX, adicionar botão "Testar" quando configurado:
{isConfigured && (
  <>
    <Button
      variant="outline"
      size="icon"
      onClick={onTest}
      disabled={isTestingConnection}
      title="Testar conexão"
    >
      {isTestingConnection ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}
    </Button>
    <Button variant="outline" size="icon" asChild>
      <a href={provider.docsUrl} ...>
        <ExternalLink className="h-4 w-4" />
      </a>
    </Button>
  </>
)}
```

### ErpIntegrations.tsx

1. **Remover info card** - Deletar linhas 100-113 (Card "Como funciona?")

2. **Ajustar grid para linha** - Mudar de `grid-cols-3` para `grid-cols-4` ou usar `flex`:

```typescript
// De:
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

// Para (4 colunas em telas grandes):
<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
```

3. **Passar handlers de teste** - Usar `testConnection` do hook:

```typescript
const { configs, isLoading, activeConfigsCount, testConnection } = useErpConfigs();

// No card:
<ErpProviderCard
  provider={provider}
  config={configByProvider?.[provider.provider]}
  onConfigure={() => handleConfigure(provider.provider)}
  onTest={() => testConnection.mutate(provider.provider)}
  isTestingConnection={
    testConnection.isPending && 
    testConnection.variables === provider.provider
  }
/>
```

---

## Resultado Visual

```text
Antes:
+--------------------------------------------------+
| ← Integração ERP                     [1 ativo]   |
+--------------------------------------------------+
| +----------------------------------------------+ |
| | Como funciona?                               | |
| | • Múltiplos ERPs simultaneamente             | |
| | • Credenciais seguras                        | |
| +----------------------------------------------+ |
|                                                  |
| +----------+  +----------+  +----------+         |
| | IXC Soft |  | MK-Sol.. |  | SGP      |         |
| +----------+  +----------+  +----------+         |
| +----------+                                     |
| | Hubsoft  |                                     |
| +----------+                                     |
+--------------------------------------------------+

Depois:
+--------------------------------------------------+
| ← Integração ERP                     [1 ativo]   |
+--------------------------------------------------+
|                                                  |
| +----------+  +----------+  +----------+  +----+ |
| | IXC Soft |  | MK-Sol.. |  | SGP      |  |Hub | |
| | [Config] |  | [Editar] |  | [Config] |  |soft| |
| |    [🔄]  |  |  [🔄]    |  |          |  |    | |
| +----------+  +----------+  +----------+  +----+ |
|                                                  |
+--------------------------------------------------+
```

---

## Ordem de Implementação

1. Atualizar `ErpProviderCard.tsx` com props `onTest` e `isTestingConnection`
2. Adicionar botão "Testar" no card quando configurado
3. Remover info card de `ErpIntegrations.tsx`
4. Ajustar grid para 4 colunas
5. Passar handlers de teste para os cards




# Plano: Configuração ERP IXC Soft (`/painel/erp-config`)

## Análise do existente

A infraestrutura de ERP já está completa:
- **`useErpConfigs`**: hook com `saveConfig`, `testConnection`, `removeConfig` — reutilizar integralmente
- **`test-erp` Edge Function**: já aceita credenciais temporárias via `api_url` + `credentials` no body — **não precisa criar `test-erp-connection`**
- **`save-erp-config` Edge Function**: já criptografa e salva — reutilizar
- **`IxcConfigDialog`**: dialog existente — **não modificar** (política non-destructive)

## O que falta

1. Uma página dedicada `/painel/erp-config` com layout inline (não dialog), selector de provider, seção de campos disponíveis pós-teste, e enforcement de "testar antes de salvar"
2. Link na sidebar
3. Rota no App.tsx

## 1. Página `/painel/erp-config`

**`src/pages/painel/ErpConfig.tsx`**

### Header
- Título "Integração com sistema de gestão"

### Selector de ERP
- Cards/tabs: IXC Soft (ativo), SGP/MK-Auth/Hubsoft (disabled + badge "em breve")

### Formulário IXC (inline, não dialog)
- URL base da API (input)
- Token de acesso (password, mascarado após salvar)
- ID do usuário API (input number)
- Checkbox "Usar HTTPS" (default: true)

### Botão "Testar conexão"
- Chama `test-erp` com credenciais temporárias: `supabase.functions.invoke('test-erp', { body: { provider: 'ixc', api_url, credentials: { username, password } } })`
- Resultado: success → mostrar seção campos disponíveis; error → mensagem clara

### Seção "Campos disponíveis" (aparece após teste OK)
- Lista estática dos campos canônicos agrupados por categoria (CustomerProfile, Invoice, ServiceStatus, Contract) com ícone check verde
- Dados estáticos baseados no `supportedFields()` do provider IXC

### Botão "Salvar" (habilitado somente após teste OK)
- Usa `saveConfig` do `useErpConfigs`

### Status (se já configurado)
- Badge ativo/inativo, data da última conexão

## 2. Sidebar e Rota

- **`PainelSidebar.tsx`**: Adicionar "Integração ERP" (icon `Database`) após "Base de Conhecimento"
- **`App.tsx`**: Rota `erp-config` dentro de `/painel`

## Sem nova Edge Function

`test-erp` já suporta o fluxo completo de teste com credenciais temporárias.

## Sem Migration

Tabela `erp_configs` já existe com RLS adequado.

## Arquivos

| Ação | Arquivo |
|------|---------|
| Criar | `src/pages/painel/ErpConfig.tsx` |
| Editar | `src/components/painel/PainelSidebar.tsx` — adicionar "Integração ERP" |
| Editar | `src/App.tsx` — adicionar rota `erp-config` |

Nenhum arquivo existente de ERP será modificado.


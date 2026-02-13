
## Corrigir Botao X do Modal ERP e Implementar Exclusao de Integracao

### Problema 1: Botao X nao funciona

Os tres modais de configuracao ERP (IXC, MK, SGP) usam `onOpenChange={() => {}}` no componente `Dialog`, o que ignora qualquer tentativa de fechar -- incluindo o botao X nativo do Radix. A intencao original era impedir fechamento acidental (clique fora, Esc), mas o efeito colateral e que o X tambem para de funcionar.

**Correcao**: Mudar `onOpenChange={() => {}}` para `onOpenChange={(open) => { if (!open) onClose(); }}` nos tres modais. Isso permite que o X funcione enquanto `onInteractOutside` e `onEscapeKeyDown` continuam bloqueados.

### Problema 2: Exclusao de integracao ERP com impacto em procedimentos

**Fluxo proposto:**

1. Adicionar botao "Excluir Integracao" (vermelho, com icone Trash) no footer de cada modal de configuracao, visivel apenas quando `config?.is_connected` for true
2. Ao clicar, abrir um `AlertDialog` de confirmacao com:
   - Titulo: "Excluir Integracao {Nome do ERP}?"
   - Descricao alertando que procedimentos de IA que dependem de ERP (`requires_erp=true`) deixarao de funcionar
   - Botao "Cancelar" e botao "Excluir" (destructive)
3. A exclusao chama `removeConfig.mutate(provider)` do hook `useErpConfigs` (ja existente)
4. O registro de auditoria e feito automaticamente pelo trigger `log_audit_event()` que ja esta configurado na tabela `erp_configs` -- a exclusao gera um evento `delete` com `old_data` contendo o provider e ISP

### Arquivos alterados

| Arquivo | Alteracao |
|---|---|
| `src/components/painel/erp/IxcConfigDialog.tsx` | Corrigir onOpenChange + adicionar botao excluir com AlertDialog |
| `src/components/painel/erp/MkConfigDialog.tsx` | Corrigir onOpenChange + adicionar botao excluir com AlertDialog |
| `src/components/painel/erp/SgpConfigDialog.tsx` | Corrigir onOpenChange + adicionar botao excluir com AlertDialog |

### Detalhes tecnicos

**Correcao do X (nos 3 modais):**
```
// De:
<Dialog open={open} onOpenChange={() => {}}>

// Para:
<Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
```

**Botao de exclusao (no DialogFooter, antes do Cancelar):**
- Importar `Trash2` do lucide-react
- Importar componentes `AlertDialog*` do ui/alert-dialog
- Estado local `showDeleteConfirm` para controlar o AlertDialog
- Importar `removeConfig` do `useErpConfigs()`
- Botao visivel apenas se `config?.is_connected`
- AlertDialog com texto explicando impacto nos procedimentos de IA dependentes de ERP
- Ao confirmar: `removeConfig.mutate(provider, { onSuccess: () => onClose() })`

**Auditoria:**
- O trigger `log_audit_event()` do banco ja captura DELETE em `erp_configs` automaticamente
- O `old_data` registrado inclui provider, isp_id, api_url (sem campos criptografados, que sao filtrados)
- Nao e necessaria nenhuma alteracao no backend para auditoria

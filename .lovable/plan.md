

# Remover Asaas e OpenAI das Integrações do Cliente

## Contexto

Na área do cliente (Painel ISP), as configurações de integrações devem mostrar apenas as integrações que o ISP gerencia diretamente:

| Manter | Remover |
|--------|---------|
| WhatsApp Business | Asaas (Pagamentos) |
| ERP (SGP/IXC) | OpenAI |

**Motivo:** Asaas e OpenAI são integrações gerenciadas pelo SaaS Admin central. O cliente ISP apenas integra seus próprios números de WhatsApp e ERPs.

---

## Mudança

### Arquivo: `src/pages/painel/Settings.tsx`

**Linha 13-18:** Atualizar array de integrações

```typescript
// Antes
const integrations = [
  { name: 'WhatsApp Business', status: 'pendente', icon: '💬' },
  { name: 'ERP (SGP/IXC)', status: 'pendente', icon: '📊' },
  { name: 'Asaas (Pagamentos)', status: 'configurado', icon: '💳' },
  { name: 'OpenAI', status: 'configurado', icon: '🤖' },
];

// Depois
const integrations = [
  { name: 'WhatsApp Business', status: 'pendente', icon: '💬' },
  { name: 'ERP (SGP/IXC)', status: 'pendente', icon: '📊' },
];
```

---

## Resumo

| Tipo | Arquivo | Mudança |
|------|---------|---------|
| Modificar | `src/pages/painel/Settings.tsx` | Remover Asaas e OpenAI do array de integrações |


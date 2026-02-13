
## Adicionar Botão de Voltar na Configuração WhatsApp

### Contexto
As páginas de configuração WhatsApp (`src/pages/admin/WhatsApp.tsx` e `src/pages/painel/WhatsAppConfig.tsx`) atualmente não possuem um botão de navegação para voltar. Outras páginas de detalhe/configuração no projeto (como `AiAgentDetail.tsx`, `SupportTicketDetail.tsx`, `ErpIntegrations.tsx`) implementam esse padrão usando:
- Ícone `ArrowLeft` do lucide-react
- Hook `useNavigate` do react-router-dom
- Botão com variant "ghost" ou "outline"

### Alterações Propostas

**1. `src/pages/admin/WhatsApp.tsx`**
- Importar `useNavigate` do react-router-dom e `ArrowLeft` do lucide-react
- Adicionar um botão de voltar antes do título principal (dentro da `<div>` que contém a navegação)
- Navegação para `/admin/config` (a página de configurações do SaaS Admin)
- Padrão: `<Button variant="ghost" onClick={() => navigate('/admin/config')}>`

**2. `src/pages/painel/WhatsAppConfig.tsx`**
- Importar `useNavigate` do react-router-dom e `ArrowLeft` do lucide-react
- Adicionar um botão de voltar antes do título principal
- Navegação para `/painel/configuracoes` (a página de configurações do Painel ISP, onde WhatsApp está listado nas Integrações)
- Padrão: `<Button variant="ghost" onClick={() => navigate('/painel/configuracoes')}>`

### Layout
Ambos os botões seguirão o padrão encontrado em `ErpIntegrations.tsx`:
```
<Button variant="ghost" size="icon">
  <ArrowLeft className="h-4 w-4" />
</Button>
```

Posicionado logo acima do título (h1), antes do ícone e texto do heading, permitindo uma navegação intuitiva de volta para a página anterior.

### Resultado Esperado
- Usuários podem voltar facilmente das páginas de configuração WhatsApp para as páginas pai de configurações
- Consistência visual com outras páginas de detalhe/configuração do projeto
- Melhoria na navegabilidade e UX




## Remover "WhatsApp" do menu lateral do Admin e adicionar em Configuracoes > Integracoes

### Alteracoes

**1. `src/components/admin/AdminSidebar.tsx`**
- Remover o item `{ title: 'WhatsApp', url: '/admin/whatsapp', icon: MessageCircle }` do array `menuItems`
- Remover o import do icone `MessageCircle` dos imports do lucide-react

**2. `src/pages/admin/Config.tsx`**
- Adicionar um novo item ao array `integrations` dentro da aba "Integracoes":

```text
{
  name: "WhatsApp Business",
  key: "integration_whatsapp",
  icon: MessageCircle,
  configured: false,
  description: "Comunicacao via WhatsApp Cloud API"
}
```

- Diferente das outras integracoes (OpenAI, Resend, Asaas) que abrem um dialog de configuracao inline, o WhatsApp tera um botao que redireciona para `/admin/whatsapp` (a pagina completa de configuracao ja existente), seguindo o mesmo padrao do painel ISP
- Importar o icone `MessageCircle` do lucide-react
- Importar `Link` ou `useNavigate` do react-router-dom para redirecionar ao clicar

### Detalhes tecnicos

O card do WhatsApp na listagem de integracoes tera um tratamento especial no render: ao inves de abrir o `IntegrationConfigDialog`, o botao "Configurar" redirecionara para `/admin/whatsapp`. Isso sera feito com uma condicao no handler `handleOpenIntegrationDialog` ou diretamente no JSX com um link para a rota.

A rota `/admin/whatsapp` permanece ativa no `App.tsx` -- nenhuma rota sera removida.


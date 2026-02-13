

## Remover "WhatsApp" do menu lateral do Painel ISP

O item "WhatsApp" sera removido do menu principal da sidebar do painel do cliente (`PainelSidebar.tsx`), ja que essa funcionalidade esta acessivel atraves de **Configuracoes > Integracoes**.

### Alteracoes

1. **`src/components/painel/PainelSidebar.tsx`**
   - Remover o item `{ title: 'WhatsApp', url: '/painel/whatsapp', icon: MessageCircle }` do array `menuItems`
   - Remover o import do icone `MessageCircle` que nao sera mais utilizado

Nenhuma rota sera removida do `App.tsx` -- a pagina `/painel/whatsapp` continuara acessivel normalmente atraves do link em Configuracoes > Integracoes.


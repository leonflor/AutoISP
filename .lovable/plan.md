

# Alterar Ícones do Menu - Agentes IA e Faturas

## Mudanças

| Menu | Ícone Atual | Novo Ícone | Motivo |
|------|-------------|------------|--------|
| Agentes IA | `Wifi` | `Bot` | Remete a robôs, automação e inteligência artificial |
| Faturas | `BarChart3` | `Receipt` | Remete a contas, recibos e documentos financeiros |

---

## Visual

```
Antes:                          Depois:
📶 Agentes IA                   🤖 Agentes IA
📊 Faturas                      🧾 Faturas
```

---

## Arquivo a Modificar

**`src/components/painel/PainelSidebar.tsx`**

### Alterações:

1. **Imports** (linha 1-12):
   - Remover: `Wifi` (não será mais usado no menu, mas atenção: ainda é usado no header)
   - Adicionar: `Bot`, `Receipt`

2. **menuItems** (linhas 37 e 40):
   - Linha 37: Trocar `Wifi` por `Bot` em "Agentes IA"
   - Linha 40: Trocar `BarChart3` por `Receipt` em "Faturas"

---

## Seção Técnica

### Código final dos imports:
```tsx
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare,
  MessageCircle,
  BarChart3,
  Settings,
  LogOut,
  Wifi,
  Send,
  UserCog,
  Bot,
  Receipt
} from 'lucide-react';
```

### Código final do menuItems:
```tsx
const menuItems = [
  { title: 'Dashboard', url: '/painel', icon: LayoutDashboard },
  { title: 'Assinantes', url: '/painel/assinantes', icon: Users },
  { title: 'Atendimentos', url: '/painel/atendimentos', icon: MessageSquare },
  { title: 'WhatsApp', url: '/painel/whatsapp', icon: MessageCircle },
  { title: 'Agentes IA', url: '/painel/agentes', icon: Bot },
  { title: 'Comunicação', url: '/painel/comunicacao', icon: Send },
  { title: 'Usuários', url: '/painel/usuarios', icon: UserCog },
  { title: 'Faturas', url: '/painel/faturas', icon: Receipt },
  { title: 'Relatórios', url: '/painel/relatorios', icon: BarChart3 },
  { title: 'Configurações', url: '/painel/configuracoes', icon: Settings },
];
```

**Obs:** O ícone `Wifi` permanece no import pois é usado no header do sidebar (logo do provedor).


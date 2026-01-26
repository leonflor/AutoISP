
## Plano: Sistema de Tickets Completo para Painel Admin

### Objetivo
Implementar um sistema de tickets completo no painel administrativo, permitindo que a equipe AutoISP gerencie os chamados de suporte dos ISPs com detalhe de ticket, respostas, notas internas, configuracao de SLA e alertas visuais.

---

## 1. Arquitetura Atual

### Tabelas Existentes no Banco
- `support_tickets`: tickets de ISPs para AutoISP (campos: id, isp_id, user_id, subject, category, description, priority, status, created_at, updated_at, resolved_at)
- `support_ticket_messages`: mensagens/respostas (campos: id, ticket_id, user_id, is_staff, message, attachments, created_at)

### Pagina Atual
- `src/pages/admin/Support.tsx`: lista apenas `conversations` (atendimentos de assinantes), nao os tickets de suporte ISP->Admin.

### Gap Identificado
A pagina Admin Suporte usa a tabela `conversations` (tickets de assinantes), mas os tickets ISP->Admin estao em `support_tickets`. Precisamos criar uma interface dedicada.

---

## 2. Estrutura de Implementacao

### 2.1 Alteracoes no Banco de Dados

**Novas colunas em `support_tickets`:**
```sql
assigned_to uuid REFERENCES auth.users(id)  -- Atendente responsavel
first_response_at timestamptz              -- Primeira resposta (SLA)
sla_response_hours integer                 -- SLA de resposta horas
sla_resolution_hours integer               -- SLA de resolucao horas
```

**Nova tabela `support_ticket_notes`:**
```sql
CREATE TABLE support_ticket_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

**Tabela de configuracao SLA:**
```sql
CREATE TABLE sla_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid REFERENCES plans(id),
  category text NOT NULL,
  response_hours integer NOT NULL DEFAULT 24,
  resolution_hours integer NOT NULL DEFAULT 72,
  created_at timestamptz DEFAULT now()
);
```

---

## 3. Componentes Frontend

### 3.1 Pagina Principal - Lista de Tickets
**Arquivo:** `src/pages/admin/SupportTickets.tsx`

```
+--------------------------------------------------+
|  Tickets de Suporte              [+ Filtros]     |
+--------------------------------------------------+
|  KPIs: Abertos | Em Andamento | SLA Critico | Resolvidos Hoje
+--------------------------------------------------+
|  [Buscar...]  [Status: v]  [Categoria: v]  [Prioridade: v]
+--------------------------------------------------+
| Protocolo | ISP      | Assunto    | Status | SLA    | Atendente |
| #TKT-001  | NetCom   | Erro...    | Aberto | ⚠️ 2h  | -         |
| #TKT-002  | FiberMax | Duvida...  | Andamento| ✅ 8h | Ana       |
+--------------------------------------------------+
```

**Funcionalidades:**
- Lista paginada com dados reais de `support_tickets`
- Filtros por status, categoria, prioridade, atendente
- Badge de SLA com cores (verde=OK, amarelo=proximo, vermelho=violado)
- Clique na linha abre detalhe

### 3.2 Pagina de Detalhe do Ticket
**Arquivo:** `src/pages/admin/SupportTicketDetail.tsx`

```
+--------------------------------------------------+
| < Voltar    #TKT-001 - Erro ao acessar sistema   |
| Status: [Aberto v]  Prioridade: [Alta v]         |
+--------------------------------------------------+
| Sidebar Esquerda        | Chat Principal         |
| +--------------------+  | +-------------------+  |
| | Cliente: NetCom    |  | | [ISP] 10:30       |  |
| | Plano: Enterprise  |  | | Nao consigo...    |  |
| | Status: Ativo      |  | |                   |  |
| | Atendente: [v]     |  | | [Staff] 10:45     |  |
| | SLA: ⚠️ 2h restantes| | | Vou verificar...  |  |
| +--------------------+  | |                   |  |
|                         | | [Nota Interna]    |  |
| +--------------------+  | | Verificar logs    |  |
| | Timeline           |  | +-------------------+  |
| | - Criado as 10:30  |  |                        |
| | - Resposta 10:45   |  | [Resposta] [Nota Int]  |
| +--------------------+  | [________________]     |
|                         | [Enviar]               |
+--------------------------------------------------+
```

**Funcionalidades:**
- Info do ISP (nome, plano, status)
- Chat com mensagens (cliente vs staff)
- Notas internas em cor diferente (amarelo)
- Timeline de eventos
- Alterar status/prioridade/atendente
- Indicador visual de SLA

### 3.3 Dialog de Configuracao SLA
**Arquivo:** `src/components/admin/support/SLAConfigDialog.tsx`

```
+--------------------------------------------------+
|  Configuracao de SLA                    [X]      |
+--------------------------------------------------+
|  Plano: [Selecionar v]                          |
|                                                  |
|  | Categoria    | Resposta | Resolucao |        |
|  | Técnico      | [4h]     | [24h]     |        |
|  | Financeiro   | [8h]     | [48h]     |        |
|  | Comercial    | [24h]    | [72h]     |        |
|  | Ouvidoria    | [2h]     | [24h]     |        |
+--------------------------------------------------+
|  [Cancelar]                    [Salvar]          |
+--------------------------------------------------+
```

---

## 4. Hooks de Dados

| Hook | Descricao |
|------|-----------|
| `useAdminSupportTickets` | Lista tickets com filtros, paginacao e stats |
| `useAdminSupportTicketDetail` | Detalhe de um ticket com mensagens e notas |
| `useSLAConfig` | CRUD de configuracoes SLA |
| `useSendTicketMessage` | Mutation para responder ticket |
| `useSendTicketNote` | Mutation para adicionar nota interna |
| `useUpdateTicketStatus` | Mutation para alterar status/atendente |

---

## 5. Arquivos a Criar/Modificar

### Novos Arquivos
| Arquivo | Descricao |
|---------|-----------|
| `src/pages/admin/SupportTickets.tsx` | Pagina principal de tickets |
| `src/pages/admin/SupportTicketDetail.tsx` | Detalhe do ticket |
| `src/components/admin/support/TicketChat.tsx` | Componente de chat |
| `src/components/admin/support/TicketSidebar.tsx` | Sidebar com info ISP |
| `src/components/admin/support/TicketTimeline.tsx` | Timeline de eventos |
| `src/components/admin/support/SLABadge.tsx` | Badge visual de SLA |
| `src/components/admin/support/SLAConfigDialog.tsx` | Config de SLA |
| `src/components/admin/support/TicketFilters.tsx` | Filtros da listagem |
| `src/components/admin/support/TicketStatsCards.tsx` | KPIs do suporte |
| `src/hooks/admin/useSupportTickets.ts` | Hooks de tickets admin |

### Arquivos Modificados
| Arquivo | Mudanca |
|---------|---------|
| `src/App.tsx` | Adicionar rotas `/admin/tickets` e `/admin/tickets/:id` |
| `src/components/admin/AdminSidebar.tsx` | Expandir item Suporte com submenu |
| `src/pages/admin/Support.tsx` | Manter como "Conversas" (assinantes) |

---

## 6. Rotas

| Rota | Componente | Descricao |
|------|------------|-----------|
| `/admin/suporte` | `Support.tsx` | Conversas de assinantes (existente) |
| `/admin/tickets` | `SupportTickets.tsx` | Tickets de ISPs (novo) |
| `/admin/tickets/:id` | `SupportTicketDetail.tsx` | Detalhe do ticket |
| `/admin/suporte/sla` | Dialog/Tab | Configuracao SLA |

---

## 7. Features Cobertas

| Codigo | Feature | Status |
|--------|---------|--------|
| F-ADMIN-054 | Dashboard de Suporte | Implementar (KPIs) |
| F-ADMIN-055 | Listar Tickets | Implementar |
| F-ADMIN-056 | Visualizar Detalhe | Implementar |
| F-ADMIN-057 | Responder Ticket | Implementar |
| F-ADMIN-059 | Configurar SLA | Implementar |
| F-ADMIN-061 | Notas Internas | Implementar |

---

## 8. Calculo de SLA

**Logica de cores:**
- Verde: > 50% do tempo restante
- Amarelo: 25-50% do tempo restante
- Vermelho: < 25% do tempo restante
- Vermelho piscante: SLA violado

**Formula:**
```typescript
const slaDeadline = new Date(ticket.created_at);
slaDeadline.setHours(slaDeadline.getHours() + ticket.sla_response_hours);

const now = new Date();
const remaining = slaDeadline.getTime() - now.getTime();
const total = ticket.sla_response_hours * 60 * 60 * 1000;
const percentRemaining = (remaining / total) * 100;
```

---

## 9. Fluxo de Implementacao

```text
1. Migration SQL
   |
   +-> Adicionar colunas em support_tickets
   +-> Criar tabela support_ticket_notes
   +-> Criar tabela sla_configs
   +-> RLS policies
   |
2. Hooks de Dados
   |
   +-> useSupportTickets (listagem)
   +-> useSupportTicketDetail (detalhe + mensagens)
   +-> Mutations (responder, nota, status)
   |
3. Componentes UI
   |
   +-> TicketStatsCards (KPIs)
   +-> TicketFilters (filtros)
   +-> TicketChat (mensagens)
   +-> TicketSidebar (info ISP)
   +-> SLABadge (indicador visual)
   |
4. Paginas
   |
   +-> SupportTickets.tsx (listagem)
   +-> SupportTicketDetail.tsx (detalhe)
   |
5. Navegacao
   |
   +-> Atualizar sidebar (submenu Suporte)
   +-> Adicionar rotas em App.tsx
```

---

## 10. Estimativa

| Etapa | Horas |
|-------|-------|
| Migration SQL + RLS | 0.5h |
| Hooks de dados | 1.5h |
| Componentes UI | 2h |
| Paginas completas | 2h |
| Navegacao + testes | 0.5h |
| **Total** | **6-7h** |

---

## 11. Secao Tecnica

### Tipos TypeScript
```typescript
interface AdminSupportTicket {
  id: string;
  isp_id: string;
  isp: { name: string; slug: string };
  user_id: string | null;
  subject: string;
  category: string;
  description: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  assigned_to: string | null;
  assigned_user: { full_name: string } | null;
  first_response_at: string | null;
  sla_response_hours: number;
  sla_resolution_hours: number;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

interface TicketMessage {
  id: string;
  ticket_id: string;
  user_id: string | null;
  user: { full_name: string; email: string } | null;
  is_staff: boolean;
  message: string;
  attachments: { name: string; url: string }[];
  created_at: string;
}

interface TicketNote {
  id: string;
  ticket_id: string;
  user_id: string;
  user: { full_name: string };
  content: string;
  created_at: string;
}

interface SLAConfig {
  id: string;
  plan_id: string;
  category: string;
  response_hours: number;
  resolution_hours: number;
}
```

### Query Principal (Listagem)
```typescript
const { data } = await supabase
  .from('support_tickets')
  .select(`
    *,
    isp:isps(name, slug),
    assigned_user:profiles!assigned_to(full_name)
  `)
  .order('created_at', { ascending: false });
```

### Query Detalhe
```typescript
const { data: ticket } = await supabase
  .from('support_tickets')
  .select(`
    *,
    isp:isps(id, name, slug, status, email),
    subscription:subscriptions!isp_id(plan:plans(name)),
    assigned_user:profiles!assigned_to(full_name, email)
  `)
  .eq('id', ticketId)
  .single();

const { data: messages } = await supabase
  .from('support_ticket_messages')
  .select('*, user:profiles(full_name)')
  .eq('ticket_id', ticketId)
  .order('created_at', { ascending: true });

const { data: notes } = await supabase
  .from('support_ticket_notes')
  .select('*, user:profiles(full_name)')
  .eq('ticket_id', ticketId)
  .order('created_at', { ascending: true });
```

# AutoISP - Plano de Desenvolvimento

## Status Geral: Fase F4 - Admin Panel (Em Andamento)

---

## Histórico de Implementação

### ✅ Fase F4 - Opção C: Gestão de Equipe Admin
- **Status:** Concluído
- **Features:** F-ADMIN-038 a F-ADMIN-048
- **Arquivos criados:**
  - `src/hooks/useAuditLogs.ts` - Hook para logs de auditoria
  - `src/components/admin/users/AuditLogsTable.tsx` - Tabela de logs
  - `src/components/admin/users/UserActionsDialog.tsx` - Timeline de ações do usuário
- **Arquivos modificados:**
  - `src/pages/admin/Users.tsx` - Layout com tabs (Usuários + Logs)
  - `src/components/admin/users/UserTable.tsx` - Seleção em massa e revogação

### ✅ Fase F4 - Opção A: Sistema de Tickets Completo
- **Status:** Concluído
- **Features:** F-ADMIN-054 a F-ADMIN-061
- **Migration SQL executada:**
  - Novas colunas em `support_tickets`: assigned_to, first_response_at, sla_response_hours, sla_resolution_hours
  - Nova tabela `support_ticket_notes` para notas internas
  - Nova tabela `sla_configs` para configuração de SLA por plano/categoria
  - RLS policies aplicadas
  - Configurações SLA padrão inseridas

- **Arquivos criados:**
  - `src/hooks/admin/useSupportTickets.ts` - Hooks completos para tickets
  - `src/components/admin/support/SLABadge.tsx` - Badge visual de SLA
  - `src/components/admin/support/TicketStatsCards.tsx` - KPIs do suporte
  - `src/components/admin/support/TicketFilters.tsx` - Filtros da listagem
  - `src/components/admin/support/TicketChat.tsx` - Chat com mensagens e notas
  - `src/components/admin/support/TicketSidebar.tsx` - Sidebar com info ISP
  - `src/components/admin/support/TicketTimeline.tsx` - Timeline de eventos
  - `src/components/admin/support/SLAConfigDialog.tsx` - Configuração de SLA
  - `src/pages/admin/SupportTickets.tsx` - Página de listagem
  - `src/pages/admin/SupportTicketDetail.tsx` - Página de detalhe

- **Arquivos modificados:**
  - `src/App.tsx` - Rotas /admin/tickets e /admin/tickets/:id
  - `src/components/admin/AdminSidebar.tsx` - Submenu Suporte expandido

---

## Próximas Opções de Implementação

### Opção B: Relatórios Avançados
- **Features:** F-ADMIN-070 a F-ADMIN-084
- **Faltando:**
  - Relatório de inadimplência (aging 30/60/90 dias)
  - Relatório MRR e Churn com tendências
  - Relatório de crescimento de ISPs
  - Exportação para Excel/PDF
  - Agendamento de relatórios por email
  - Filtros avançados por período/cliente/plano
- **Estimativa:** 4-5 horas

### Opção D: Integrações Funcionais
- **Features:** F-ADMIN-049 a F-ADMIN-053
- **Faltando:**
  - Formulário para inserir API keys (OpenAI, Resend, Asaas)
  - Botão "Testar Conexão" funcional
  - Webhook URLs para copiar
  - Logs de webhooks recebidos
  - Configurar templates de email
- **Estimativa:** 3-4 horas

### Opção E: Onboarding Wizard
- **Faltando:**
  - Wizard multi-step (dados -> plano -> pagamento)
  - Integração Asaas
  - Email automático de boas-vindas
  - Criação automática de usuário owner
- **Estimativa:** 4-5 horas

---

## Resumo do Sistema de Tickets Implementado

### Funcionalidades
1. **Listagem de Tickets** (`/admin/tickets`)
   - KPIs: Abertos, Em Andamento, SLA Crítico, Resolvidos Hoje
   - Filtros por status, categoria, prioridade, busca
   - Badge de SLA com cores (verde, amarelo, vermelho, piscante)
   - Clique para abrir detalhe

2. **Detalhe do Ticket** (`/admin/tickets/:id`)
   - Chat com mensagens (cliente vs staff)
   - Notas internas (visíveis apenas para staff)
   - Sidebar com info do ISP, plano, contato
   - Controles: status, prioridade, atendente
   - Indicadores de SLA (resposta e resolução)
   - Timeline de eventos

3. **Configuração de SLA**
   - Por plano e categoria
   - Tempo de resposta e resolução
   - Categorias: Técnico, Financeiro, Comercial, Ouvidoria, Outros

### Cálculo de SLA
- **Verde:** > 50% do tempo restante
- **Amarelo:** 25-50% do tempo restante
- **Vermelho:** < 25% do tempo restante
- **Vermelho piscante:** SLA violado

### Navegação
- Sidebar Admin expandida com submenu "Suporte":
  - Tickets ISPs (`/admin/tickets`)
  - Conversas (`/admin/suporte`)

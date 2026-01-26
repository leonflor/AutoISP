
## Plano: Analise F4 - O Que Falta Implementar no Painel Admin

### Resumo Executivo

A Fase F4 (Plataforma Admin) tem a infraestrutura base funcionando, mas faltam funcionalidades avancadas documentadas no guia. Abaixo esta a lista completa organizada por modulo e criticidade.

---

## Status Atual por Modulo

| Modulo | Status | Implementado | Pendente |
|--------|--------|--------------|----------|
| Dashboard | 70% | KPIs, graficos, alertas | Drill-down, metricas tempo real |
| Clientes ISP | 85% | CRUD completo, filtros | Onboarding wizard, historico |
| Planos | 90% | CRUD, features, limites | Comparador visual |
| Financeiro | 75% | Faturas, assinaturas | Segunda via, creditos/estornos |
| Suporte | 40% | Listagem conversas | SLA, tickets avancados, notas internas |
| Relatorios | 60% | Graficos basicos | Exportacao, agendamento, churn |
| Equipe | 50% | CRUD usuarios | Convites, logs auditoria |
| Configuracoes | 80% | 4 tabs funcionais | Upload logo, testar integracoes |

---

## Features Pendentes por Prioridade

### ALTA PRIORIDADE (Essenciais para operacao)

#### 1. Sistema de Tickets Completo (Suporte Admin)
**Features:** F-ADMIN-054 a F-ADMIN-068
**Atual:** Apenas listagem de conversas
**Faltando:**
- Detalhe do ticket com historico de mensagens
- Responder ticket (texto + anexos)
- Notas internas (visiveis apenas para equipe)
- Alterar status/prioridade do ticket
- Atribuir atendente
- Configuracao de SLA por plano
- Alertas de SLA proximo de violar
- Escalonamento automatico

**Estimativa:** 6-8 horas

#### 2. Relatorios Avancados
**Features:** F-ADMIN-070 a F-ADMIN-084
**Atual:** Graficos basicos de receita e uso IA
**Faltando:**
- Relatorio de inadimplencia (aging 30/60/90 dias)
- Relatorio MRR e Churn com tendencias
- Relatorio de crescimento de ISPs
- Exportacao para Excel/PDF
- Agendamento de relatorios por email
- Filtros avancados por periodo/cliente/plano

**Estimativa:** 4-5 horas

#### 3. Gestao de Equipe Admin
**Features:** F-ADMIN-038 a F-ADMIN-048
**Atual:** CRUD basico de usuarios
**Faltando:**
- Convite por email (ja tem edge function, falta UI)
- Definir permissoes granulares por modulo
- Logs de auditoria (quem fez o que)
- Revogar acessos em massa
- Historico de acoes por usuario

**Estimativa:** 3-4 horas

---

### MEDIA PRIORIDADE (Melhoram operacao)

#### 4. Configuracoes de Integracao
**Features:** F-ADMIN-049 a F-ADMIN-053
**Atual:** Cards de status (configurado/pendente)
**Faltando:**
- Formulario para inserir API keys (OpenAI, Resend, Asaas)
- Botao "Testar Conexao" funcional
- Webhook URLs para copiar
- Logs de webhooks recebidos
- Configurar templates de email

**Estimativa:** 3-4 horas

#### 5. Dashboard com Drill-Down
**Features:** F-ADMIN-001 a F-ADMIN-009
**Atual:** KPIs estaticos e graficos
**Faltando:**
- Clicar em KPI abre lista filtrada
- Alertas em tempo real (trial expirando, faturas vencendo)
- Grafico de conversao trial -> pago
- Comparativo mes anterior
- Notificacoes push para eventos criticos

**Estimativa:** 2-3 horas

#### 6. Onboarding de ISP
**Features:** F-ADMIN-010 a F-ADMIN-014
**Atual:** Formulario simples de cadastro
**Faltando:**
- Wizard de onboarding (dados -> plano -> pagamento)
- Checklist de configuracao inicial
- Email de boas-vindas automatico
- Criacao automatica de usuario owner

**Estimativa:** 4-5 horas

---

### BAIXA PRIORIDADE (Nice-to-have)

#### 7. Base de Conhecimento Admin
**Feature:** F-ADMIN-063
**Faltando:**
- CRUD de artigos de ajuda
- Editor rich text
- Sugestao automatica ao abrir ticket

**Estimativa:** 2-3 horas

#### 8. Respostas Predefinidas
**Feature:** F-ADMIN-062
**Faltando:**
- CRUD de templates de resposta
- Variaveis dinamicas (nome, numero ticket)
- Busca rapida

**Estimativa:** 2 horas

#### 9. Upload de Logo
**Atual:** Botao existe mas nao funciona
**Faltando:**
- Integrar com Supabase Storage
- Preview da imagem
- Redimensionamento automatico

**Estimativa:** 1-2 horas

---

## Resumo de Estimativas

| Prioridade | Items | Horas Estimadas |
|------------|-------|-----------------|
| Alta | 3 | 13-17 horas |
| Media | 3 | 9-12 horas |
| Baixa | 3 | 5-7 horas |
| **Total** | **9** | **27-36 horas** |

---

## Opcoes de Implementacao

Escolha qual(is) voce gostaria de implementar:

### Opcao A: Sistema de Tickets Completo
Implementar F-ADMIN-054 a F-ADMIN-068:
- Pagina de detalhe do ticket
- Responder com texto/anexos
- Notas internas
- Configuracao de SLA
- Alertas visuais

### Opcao B: Relatorios Avancados
Implementar F-ADMIN-070 a F-ADMIN-084:
- Dashboard de inadimplencia
- Relatorio MRR/Churn
- Exportacao Excel/PDF
- Filtros avancados

### Opcao C: Gestao de Equipe
Implementar F-ADMIN-038 a F-ADMIN-048:
- Interface de convites
- Permissoes granulares
- Logs de auditoria

### Opcao D: Integrações Funcionais
Implementar configuracao real:
- Forms para API keys
- Testar conexao
- Logs de webhooks

### Opcao E: Onboarding Wizard
Implementar fluxo completo:
- Wizard multi-step
- Integracao Asaas
- Email automatico

---

## Recomendacao

Sugiro comecar pelo **Sistema de Tickets Completo (Opcao A)** pois:
1. E o modulo com maior gap (40% implementado)
2. Impacta diretamente o suporte aos clientes ISP
3. As tabelas `support_tickets` e `support_ticket_messages` ja existem
4. Conecta com a Central de Ajuda do Painel Cliente (planejada anteriormente)


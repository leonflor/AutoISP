# SAISP - Migrations SQL

Este diretório contém os scripts SQL para configuração do banco de dados no Supabase.

## 📋 Arquivos Disponíveis

| Arquivo | Fase | Descrição |
|---------|------|-----------|
| `f1-database.sql` | F1 | Schema completo: enums, tabelas, funções, triggers, RLS e seeds |

## 🚀 Como Executar

### Pré-requisitos

- Acesso ao [Supabase Dashboard](https://supabase.com/dashboard)
- Projeto Supabase configurado (URL: `https://zvxcwwhsjtdliihlvvof.supabase.co`)

### Passo a Passo

1. **Acesse o Supabase Dashboard**
   - Vá para [supabase.com/dashboard](https://supabase.com/dashboard)
   - Selecione o projeto SAISP

2. **Abra o SQL Editor**
   - No menu lateral, clique em **SQL Editor**
   - Clique em **+ New query**

3. **Execute o Script**
   - Copie todo o conteúdo do arquivo `f1-database.sql`
   - Cole no editor SQL
   - Clique em **Run** (ou pressione `Ctrl/Cmd + Enter`)

4. **Verifique a Execução**
   - Vá para **Database > Tables** no menu lateral
   - Confirme que todas as tabelas foram criadas:
     - `profiles`
     - `user_roles`
     - `isps`
     - `isp_users`
     - `plans`
     - `subscriptions`
     - `invoices`
     - `ai_agents`
     - `ai_usage`
     - `ai_limits`
     - `audit_logs`
     - `webhook_logs`

5. **Verifique o Storage**
   - Vá para **Storage** no menu lateral
   - Confirme que os buckets foram criados:
     - `logos` (público)
     - `documents` (privado)
     - `invoices` (privado)

## 📊 Estrutura do F1

### Seções do Script

| Seção | Conteúdo |
|-------|----------|
| 1 | **Enums** - Tipos customizados (roles, status, etc.) |
| 2 | **Helper Functions** - Funções SECURITY DEFINER para RLS |
| 3 | **Tabelas Core** - profiles, user_roles, isps, isp_users |
| 4 | **Tabelas de Negócio** - plans, subscriptions, invoices |
| 5 | **Tabelas de IA** - ai_agents, ai_usage, ai_limits |
| 6 | **Tabelas de Logs** - audit_logs, webhook_logs |
| 7 | **Triggers** - Automações (new_user, updated_at) |
| 8 | **RLS Policies** - Políticas de segurança por tabela |
| 9 | **Storage Buckets** - Configuração de armazenamento |
| 10 | **Seeds** - Dados iniciais (planos, agentes IA) |

### Helper Functions

Funções críticas para evitar recursão infinita nas RLS policies:

```sql
-- Verifica role global
public.has_role(user_id, role) → boolean

-- Retorna ISP do usuário
public.get_user_isp_id(user_id) → uuid

-- Verifica se é admin do ISP
public.is_isp_admin(user_id, isp_id) → boolean

-- Verifica se é membro do ISP
public.is_isp_member(user_id, isp_id) → boolean
```

## ⚠️ Troubleshooting

### Erro: "relation already exists"
- O script já foi executado anteriormente
- Solução: Ignore ou delete as tabelas existentes antes

### Erro: "permission denied"
- Verifique se está logado como owner do projeto
- Verifique as permissões do usuário

### Erro: "infinite recursion detected"
- Não acontecerá se usar as helper functions corretamente
- Nunca referencie a própria tabela dentro de uma RLS policy

## 📝 Notas Importantes

1. **Ordem de Execução**: O script deve ser executado na ordem apresentada
2. **SECURITY DEFINER**: As helper functions usam SECURITY DEFINER para evitar recursão
3. **Seeds**: O script já inclui dados iniciais (3 planos, 5 agentes IA)
4. **Storage**: Os buckets são configurados automaticamente

## 🔒 Segurança

- Todas as tabelas têm RLS habilitado
- Roles são armazenados em tabela separada (não no profile)
- Helper functions evitam recursão infinita
- Storage tem policies por bucket e por ISP

---

**Projeto**: SAISP - Sistema de Atendimento para ISPs  
**Versão**: 1.0.0  
**Última atualização**: Janeiro 2026

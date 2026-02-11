
# Verificacao Completa de Seguranca do Banco de Dados

## Resultado do Scan

| # | Problema | Severidade | Status |
|---|----------|-----------|--------|
| 1 | Leaked Password Protection desativada | WARN | Pendente (config Supabase) |
| 2 | `ai_agents` - leitura publica (anon) | ERROR | **Corrigir** |
| 3 | `plans` - leitura publica (anon) | ERROR | **Corrigir** |

## Problemas ja resolvidos anteriormente

- Policies com `USING (true)` em `ai_limits`, `help_categories`, `sla_configs` -- corrigidas
- Extensao `pgvector` movida para schema `extensions` -- concluido
- `audit_logs` imutavel -- ja possui policies `no_update`/`no_delete`
- `profiles` e `subscribers` -- validados como falsos positivos

## Problema 1: Leaked Password Protection (WARN)

Nao pode ser corrigido via codigo. Requer acao manual:
1. Acesse o Supabase Dashboard
2. Va em **Authentication > Attack Protection**
3. Ative **Leaked Password Protection**

Isso impede usuarios de criarem contas com senhas que ja vazaram em data breaches.

## Problemas 2 e 3: Tabelas `ai_agents` e `plans` expostas publicamente

### Analise

Ambas possuem policy `Anyone can view active [agents/plans]` que permite leitura por usuarios anonimos (`anon`). A landing page **nao usa** essas tabelas (usa dados hardcoded). Todas as queries do frontend sao feitas em contextos autenticados (painel ISP ou admin).

### Risco

- **ai_agents**: Expoe prompts de sistema, configuracoes de comportamento e logica de negocio dos agentes IA. Concorrentes podem copiar a estrategia completa.
- **plans**: Expoe limites internos (tokens IA, max assinantes, trial days) que revelam estrutura de custos.

### Correcao

Restringir ambas as policies para exigir autenticacao.

## Secao tecnica

**Migration SQL:**

```text
-- 1. ai_agents: restringir leitura a autenticados
DROP POLICY "Anyone can view active agents" ON ai_agents;
CREATE POLICY "Authenticated can view active agents" ON ai_agents
  FOR SELECT TO authenticated
  USING (is_active = true);

-- 2. plans: restringir leitura a autenticados
DROP POLICY "Anyone can view active plans" ON plans;
CREATE POLICY "Authenticated can view active plans" ON plans
  FOR SELECT TO authenticated
  USING (is_active = true);
```

**Impacto:** Nenhum no uso normal. A landing page usa dados hardcoded. O painel admin e painel ISP ja exigem login. Apenas bloqueia acesso anonimo direto a API do Supabase.

**Arquivos afetados:** Apenas migration SQL. Nenhum codigo frontend precisa ser alterado.

## Resumo pos-correcao

Apos aplicar esta migration, o banco tera:
- **0 tabelas** com leitura anonima
- **0 policies** usando `USING (true)`
- **Todas as tabelas** com RLS ativo
- **1 item pendente**: Leaked Password Protection (acao manual no Dashboard)

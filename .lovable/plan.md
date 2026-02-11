

# Corrigir Problemas Criticos de Seguranca

## Problemas identificados

| # | Tabela | Problema | Severidade |
|---|--------|----------|------------|
| 1 | ai_security_clauses | SELECT permite leitura sem autenticacao (qualquer usuario anonimo pode ler as regras de seguranca da IA) | Critico |
| 2 | audit_logs | Sem policies de UPDATE/DELETE -- logs podem ser modificados ou apagados | Aviso |
| 3 | document_processing_logs | INSERT com `WITH CHECK (true)` -- qualquer autenticado pode inserir logs falsos | Aviso |

**Nota:** Os problemas anteriores de `profiles`, `subscribers`, `erp_configs` e `whatsapp_configs` ja foram validados como falsos positivos ou corrigidos. As policies existentes estao corretas (isolamento por ISP, acesso restrito a admins).

## Correcoes

### 1. ai_security_clauses -- Restringir leitura a autenticados

**Problema:** A policy `Authenticated can read active clauses` usa `USING (is_active = true)` sem verificar `auth.role() = 'authenticated'`. Usuarios anonimos conseguem ler as clausulas de seguranca LGPD.

**Correcao:** Alterar a policy para exigir autenticacao.

### 2. audit_logs -- Tornar imutavel

**Problema:** Nao existem policies bloqueando UPDATE e DELETE. Embora nao haja policies permitindo essas operacoes, a melhor pratica e criar policies explicitas com `USING (false)`.

**Correcao:** Adicionar policies de bloqueio.

### 3. document_processing_logs -- Restringir INSERT

**Problema:** A policy `Service role can insert logs` usa `WITH CHECK (true)`, permitindo que qualquer usuario autenticado insira logs. Deveria ser restrito ao service_role (Edge Functions).

**Correcao:** Alterar para `WITH CHECK (false)` no nivel RLS (o service_role ja ignora RLS por padrao, entao os Edge Functions continuam funcionando).

## Secao tecnica

**Migration SQL:**

```text
-- 1. ai_security_clauses: exigir autenticacao para leitura
DROP POLICY "Authenticated can read active clauses" ON ai_security_clauses;
CREATE POLICY "Authenticated can read active clauses" ON ai_security_clauses
  FOR SELECT
  USING (is_active = true AND auth.role() = 'authenticated');

-- 2. audit_logs: bloqueio explicito de modificacoes
CREATE POLICY "audit_logs_no_update" ON audit_logs
  FOR UPDATE USING (false);
CREATE POLICY "audit_logs_no_delete" ON audit_logs
  FOR DELETE USING (false);

-- 3. document_processing_logs: restringir INSERT
DROP POLICY "Service role can insert logs" ON document_processing_logs;
CREATE POLICY "Service role only insert logs" ON document_processing_logs
  FOR INSERT WITH CHECK (false);
```

**Nenhum arquivo de codigo precisa ser alterado** -- todas as correcoes sao no banco de dados.

**Impacto:** Zero. O frontend ja usa sessoes autenticadas, entao a restricao em ai_security_clauses nao afeta o uso normal. O service_role (Edge Functions) ignora RLS, entao as restricoes em audit_logs e document_processing_logs nao afetam funcionalidades existentes.

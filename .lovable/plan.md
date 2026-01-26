
## Plano: Corrigir Persistencia das Configuracoes

### Problema Identificado

A tabela `platform_config` nao possui politica RLS para UPDATE. Atualmente existe:

| Operacao | Politica | Status |
|----------|----------|--------|
| SELECT | Admins podem visualizar | OK |
| INSERT | Super admins podem inserir | OK |
| UPDATE | --- | FALTANDO |
| DELETE | --- | FALTANDO |

Quando o usuario (que e super_admin) tenta salvar alteracoes:
1. A requisicao PATCH e enviada ao Supabase
2. O RLS bloqueia a operacao silenciosamente
3. Retorna status 204 (0 linhas afetadas)
4. Os dados nao sao salvos no banco

### Solucao

Adicionar politicas RLS para UPDATE e DELETE na tabela `platform_config`:

```sql
-- Super admins podem atualizar configuracoes
CREATE POLICY "Super admins can update platform config"
  ON public.platform_config FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Super admins podem deletar configuracoes
CREATE POLICY "Super admins can delete platform config"
  ON public.platform_config FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role));
```

### Arquivos a Modificar

Uma migracao SQL sera criada para adicionar as politicas faltantes.

### Resultado Esperado

Apos a migracao:
- Super admins poderao salvar alteracoes nas configuracoes
- As mudancas serao persistidas no banco de dados
- O toast "Configuracoes salvas" refletira a realidade

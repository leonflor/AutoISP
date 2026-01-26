

## Plano: Correcao de Politicas RLS na Tabela Profiles

### Objetivo
Adicionar politicas RLS que permitam admins/support visualizar perfis para o sistema de tickets e logs de auditoria, e membros ISP verem colegas de equipe, mantendo conformidade com LGPD.

---

## 1. Situacao Atual

### Politicas Existentes
| Politica | Permissao |
|----------|-----------|
| Users can view own profile | Usuario ve apenas seu proprio perfil |
| Users can update own profile | Usuario atualiza apenas seu perfil |
| Super admins can view all profiles | Apenas super_admin ve todos |

### Problema Identificado
- **Admins e Suporte**: Nao conseguem ver nomes/emails nos tickets e logs de auditoria
- **Membros ISP**: Nao conseguem ver perfis de colegas de equipe
- **Resultado**: Funcionalidades quebradas no sistema de tickets e gestao de equipe

---

## 2. Novas Politicas Propostas

### 2.1 Admins e Suporte Visualizam Perfis
```sql
CREATE POLICY "Admins and support can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'support')
  );
```

**Justificativa LGPD**: Funcionarios com papel administrativo tem acesso legitimo para atendimento ao cliente.

### 2.2 Membros ISP Visualizam Colegas de Equipe
```sql
CREATE POLICY "ISP members can view team profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM public.isp_users my_isp
      JOIN public.isp_users their_isp ON my_isp.isp_id = their_isp.isp_id
      WHERE my_isp.user_id = auth.uid()
        AND their_isp.user_id = profiles.id
        AND my_isp.is_active = true
        AND their_isp.is_active = true
    )
  );
```

**Justificativa LGPD**: Membros da mesma organizacao tem interesse legitimo em ver colegas para colaboracao.

---

## 3. Matriz de Acesso Final

| Papel | Proprio Perfil | Colegas ISP | Todos Perfis |
|-------|----------------|-------------|--------------|
| Usuario comum | Sim | Nao | Nao |
| Membro ISP | Sim | Sim | Nao |
| Admin | Sim | Sim | Sim |
| Support | Sim | Sim | Sim |
| Super Admin | Sim | Sim | Sim |

---

## 4. Conformidade LGPD

| Requisito | Como Atendemos |
|-----------|----------------|
| Minimizacao de dados | Apenas dados necessarios expostos (nome, email) |
| Base legal | Interesse legitimo (colaboracao interna e suporte) |
| Limitacao de acesso | RLS restringe acesso por papel/organizacao |
| Proporcionalidade | Admins veem todos para atendimento; membros veem apenas equipe |

---

## 5. Implementacao

### Arquivo de Migracao SQL
```sql
-- Politica para admins e suporte visualizarem perfis
CREATE POLICY "Admins and support can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'support')
  );

-- Politica para membros ISP visualizarem colegas de equipe
CREATE POLICY "ISP members can view team profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM public.isp_users my_isp
      JOIN public.isp_users their_isp ON my_isp.isp_id = their_isp.isp_id
      WHERE my_isp.user_id = auth.uid()
        AND their_isp.user_id = profiles.id
        AND my_isp.is_active = true
        AND their_isp.is_active = true
    )
  );
```

---

## 6. Impacto nas Funcionalidades

| Funcionalidade | Antes | Depois |
|----------------|-------|--------|
| Sistema de Tickets | Nomes nao apareciam | Nomes visiveis para staff |
| Logs de Auditoria | Usuarios sem nome | Nomes exibidos corretamente |
| Gestao de Equipe ISP | Perfis nao carregavam | Lista de equipe funcional |
| Atribuicao de Tickets | Dropdown vazio | Lista de atendentes visivel |

---

## 7. Secao Tecnica

### Ordem de Avaliacao das Politicas
PostgreSQL avalia politicas RLS com OR logico. Um usuario precisa satisfazer apenas UMA das politicas para ter acesso:

1. `id = auth.uid()` - Usuario ve proprio perfil
2. `has_role('super_admin')` - Super admin ve todos
3. `has_role('admin') OR has_role('support')` - Admin/suporte veem todos
4. `EXISTS (isp_users join)` - Membro ISP ve colegas

### Performance
O join em `isp_users` usa indices existentes (`user_id`, `isp_id`), garantindo consultas eficientes mesmo com muitos usuarios.


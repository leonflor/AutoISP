
# Corrigir Race Condition no Fluxo de Login Admin

## Problema Real

A correção anterior só resolve o **carregamento inicial** (refresh de página). O bug persiste no **fluxo de login ativo** porque o `onAuthStateChange` atualiza `user` imediatamente, mas os `roles` são carregados de forma assíncrona sem bloquear a renderização.

## Solução

Adicionar um estado `rolesLoaded` no AuthContext que indica quando os roles estão sincronizados com o usuário atual. O AdminLogin deve aguardar este estado antes de decidir se mostra a tela de "Acesso Restrito".

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/contexts/AuthContext.tsx` | Adicionar estado `rolesLoaded` |
| `src/pages/admin/AdminLogin.tsx` | Aguardar `rolesLoaded` antes de mostrar "Acesso Restrito" |

---

## Seção Técnica

### 1. AuthContext.tsx - Adicionar estado `rolesLoaded`

```tsx
// Novos estados
const [rolesLoaded, setRolesLoaded] = useState(false);

// No onAuthStateChange
if (session?.user) {
  setRolesLoaded(false); // Resetar quando usuário muda
  fetchProfile(session.user.id);
  fetchRolesAsync(session.user.id).then(roles => {
    if (isMounted) {
      setRoles(roles);
      setRolesLoaded(true); // Marcar como carregado
    }
  });
} else {
  setProfile(null);
  setRoles([]);
  setRolesLoaded(true); // Sem usuário = roles "carregados" (vazio)
}

// No initializeAuth
if (session?.user) {
  fetchProfile(session.user.id);
  const roles = await fetchRolesAsync(session.user.id);
  if (isMounted) {
    setRoles(roles);
    setRolesLoaded(true);
  }
} else {
  setRolesLoaded(true);
}

// Exportar no contexto
value={{ ..., rolesLoaded }}
```

### 2. AdminLogin.tsx - Aguardar rolesLoaded

```tsx
const { user, loading, signIn, signOut, hasRole, rolesLoaded } = useAuth();

// Mostrar loading enquanto roles não carregaram
if (loading || (user && !rolesLoaded)) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

// Agora sim, só mostra "Acesso Restrito" quando roles estão carregados
if (user && !hasRole('super_admin')) {
  // ... tela de acesso restrito
}
```

---

## Fluxo Corrigido

```
ANTES (bugado):
1. signIn() → sucesso
2. onAuthStateChange → setUser(user)
3. roles = [] (ainda carregando)
4. user && !hasRole() = true → "Acesso Restrito" aparece! ❌
5. roles carregam → navega para /admin

DEPOIS (corrigido):
1. signIn() → sucesso
2. onAuthStateChange → setUser(user), setRolesLoaded(false)
3. Componente vê: user existe + rolesLoaded=false → mostra loading
4. roles carregam → setRoles(), setRolesLoaded(true)
5. hasRole('super_admin') = true → navega direto para /admin ✅
```

---

## Tipos a Atualizar

```tsx
interface AuthContextType {
  // ... campos existentes
  rolesLoaded: boolean; // Novo campo
}
```

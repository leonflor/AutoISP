
# Corrigir Race Condition no Login Admin

## Problema Identificado

O `AuthContext` define `loading=false` ANTES de completar o carregamento dos roles do usuário, causando um flash da tela "Acesso Restrito" durante o login admin.

## Solução

Separar o fluxo de inicialização do fluxo de mudanças contínuas de auth, garantindo que `loading` só seja `false` após carregar os roles.

---

## Arquivo a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/contexts/AuthContext.tsx` | Aguardar roles antes de definir loading=false |

---

## Seção Técnica

### Mudança no AuthContext.tsx

**Padrão**: Separar "carga inicial" de "mudanças contínuas"

```tsx
useEffect(() => {
  let isMounted = true;

  // Função que busca roles e retorna Promise
  const fetchRolesAsync = async (userId: string): Promise<AppRole[]> => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    
    return data?.map((r) => r.role as AppRole) ?? [];
  };

  // Listener para MUDANÇAS CONTÍNUAS (NÃO controla loading)
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (!isMounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);

      // Fire-and-forget - não await, não afeta loading
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchRolesAsync(session.user.id).then(roles => {
          if (isMounted) setRoles(roles);
        });
      } else {
        setProfile(null);
        setRoles([]);
      }
    }
  );

  // CARGA INICIAL (controla loading)
  const initializeAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!isMounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      // Buscar roles ANTES de definir loading=false
      if (session?.user) {
        fetchProfile(session.user.id);
        const roles = await fetchRolesAsync(session.user.id);
        if (isMounted) setRoles(roles);
      }
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  initializeAuth();

  return () => {
    isMounted = false;
    subscription.unsubscribe();
  };
}, []);
```

### Por que isso resolve:

1. **Carga inicial**: `loading` só fica `false` APÓS `fetchRolesAsync` completar
2. **Mudanças contínuas**: Não afetam `loading`, apenas atualizam os estados
3. **Cleanup**: Flag `isMounted` evita atualizações em componente desmontado

---

## Fluxo Corrigido

```
ANTES (bugado):
1. Login → user definido
2. loading = false (imediato)
3. roles = [] → "Acesso Restrito" aparece! ❌
4. roles carrega → navega para /admin

DEPOIS (corrigido):
1. Login → user definido
2. Aguarda fetchRoles completar
3. roles = ['super_admin']
4. loading = false
5. hasRole('super_admin') = true → navega direto ✅
```

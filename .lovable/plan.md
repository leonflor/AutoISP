
# Corrigir Refresh do PainelLayout ao Trocar de Aba

## Causa Raiz

O fluxo que causa o problema:

1. Ao trocar de aba e voltar, o Supabase dispara `onAuthStateChange` com um novo objeto `session.user`
2. O `AuthContext` chama `setUser(session.user)` — mesmo sendo o mesmo usuario, e um objeto novo
3. O `useIspMembership` tem `[user]` como dependencia do `useEffect`, entao reexecuta e chama `setLoading(true)` (linha 49)
4. O `PainelLayout` ve `loading=true` e desmonta TODO o conteudo (incluindo modais abertos) para mostrar o spinner
5. Ao terminar, remonta tudo — mas os dados digitados nos modais ja foram perdidos

## Correcao

### 1. `src/contexts/AuthContext.tsx` — Evitar setar user se o ID nao mudou

Na linha 60, dentro do `onAuthStateChange`, trocar:

```typescript
setUser(session?.user ?? null);
```

Por:

```typescript
setUser(prev => {
  const newUser = session?.user ?? null;
  if (prev?.id === newUser?.id) return prev;
  return newUser;
});
```

Isso evita que o React considere o `user` como alterado quando e o mesmo usuario retornando do token refresh.

### 2. `src/hooks/useIspMembership.ts` — Nao mostrar loading se ja tem dados

Na linha 49, trocar:

```typescript
setLoading(true);
```

Por:

```typescript
if (!membership) setLoading(true);
```

Isso garante que, se o membership ja foi carregado, a re-validacao acontece em background sem desmontar a UI.

Como `membership` e um estado local e nao esta no array de deps do useEffect, precisamos usar a forma funcional ou uma ref. A solucao mais simples e usar uma ref:

```typescript
const membershipRef = useRef<IspMembership | null>(null);
```

Atualizar a ref junto com o estado, e usar `membershipRef.current` na verificacao.

## Impacto

- Modais ERP (e qualquer outro conteudo do painel) nao serao mais desmontados ao trocar de aba
- Dados digitados nos formularios serao preservados
- A validacao de membership continua acontecendo em background
- Sem alteracao de banco, sem novas dependencias

## Arquivos Alterados

| Arquivo | Alteracao |
|---|---|
| `src/contexts/AuthContext.tsx` | Comparar user.id antes de chamar setUser |
| `src/hooks/useIspMembership.ts` | Usar ref para evitar setLoading(true) quando ja tem dados |

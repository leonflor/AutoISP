

# Plano: Agrupar itens de Agentes de IA no menu admin

## O que muda

Os tres itens soltos no sidebar admin — **Ferramentas IA**, **Templates** e **Procedimentos** — serao agrupados num unico submenu colapsavel chamado **Agentes de IA** com icone `Bot`.

## Antes → Depois

```text
ANTES                        DEPOIS
─────                        ──────
...                          ...
Ferramentas IA               Agentes de IA ▾
Templates                      ├ Templates
Procedimentos                  ├ Procedimentos
Relatórios                     └ Ferramentas
...                          Relatórios
                             ...
```

## Implementacao

**Arquivo**: `src/components/admin/AdminSidebar.tsx`

Substituir as 3 entradas no array `menuItems` (linhas 53-55) por uma unica entrada com submenu:

```ts
{
  title: 'Agentes de IA',
  icon: Bot,
  submenu: [
    { title: 'Templates', url: '/admin/templates', icon: Bot },
    { title: 'Procedimentos', url: '/admin/procedures', icon: GitBranch },
    { title: 'Ferramentas', url: '/admin/ai-tools', icon: Wrench },
  ]
},
```

Remover `Wrench` do import se nao for mais usado no nivel raiz (ainda sera usado no submenu, entao manter).

Nenhuma outra alteracao necessaria — rotas e paginas permanecem iguais.


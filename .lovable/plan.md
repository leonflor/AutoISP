

# Converter Cards para Abas na Página de Configurações do Cliente

## Visão Geral

Atualmente a página de Configurações exibe 4 cards em grid (2 colunas). Vamos reorganizar para uma interface com abas, onde cada seção ocupa uma aba dedicada.

---

## Nova Estrutura

| Aba | Ícone | Conteúdo |
|-----|-------|----------|
| Dados da Empresa | Building2 | Formulário com nome, CNPJ, e-mail, telefone |
| Personalização | Palette | Upload de logo, cor primária |
| Notificações | Bell | Switches de preferências de alertas |
| Integrações | Link | Lista de status das integrações |

---

## Layout Proposto

```text
┌────────────────────────────────────────────────────────┐
│  Configurações                                         │
│  Gerencie as configurações do seu provedor             │
├────────────────────────────────────────────────────────┤
│  [Empresa] [Personalização] [Notificações] [Integrações]│
├────────────────────────────────────────────────────────┤
│                                                        │
│     Conteúdo da aba selecionada                        │
│     (em um Card único)                                 │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## Mudanças

### Arquivo: `src/pages/painel/Settings.tsx`

**Imports a adicionar:**
- `Tabs, TabsList, TabsTrigger, TabsContent` de `@/components/ui/tabs`

**Estrutura:**
1. Substituir o grid de cards por um componente `<Tabs>`
2. Criar `<TabsList>` com 4 triggers (ícone + texto)
3. Cada `<TabsContent>` contém o conteúdo do card correspondente dentro de um único `<Card>`

---

## Seção Técnica

### Estrutura do código:

```tsx
<Tabs defaultValue="empresa" className="space-y-4">
  <TabsList className="grid w-full grid-cols-4">
    <TabsTrigger value="empresa" className="flex items-center gap-2">
      <Building2 className="h-4 w-4" />
      <span className="hidden sm:inline">Empresa</span>
    </TabsTrigger>
    <TabsTrigger value="personalizacao" className="flex items-center gap-2">
      <Palette className="h-4 w-4" />
      <span className="hidden sm:inline">Personalização</span>
    </TabsTrigger>
    <TabsTrigger value="notificacoes" className="flex items-center gap-2">
      <Bell className="h-4 w-4" />
      <span className="hidden sm:inline">Notificações</span>
    </TabsTrigger>
    <TabsTrigger value="integracoes" className="flex items-center gap-2">
      <Link className="h-4 w-4" />
      <span className="hidden sm:inline">Integrações</span>
    </TabsTrigger>
  </TabsList>

  <TabsContent value="empresa">
    <Card>
      <CardHeader>...</CardHeader>
      <CardContent>...</CardContent>
    </Card>
  </TabsContent>

  <TabsContent value="personalizacao">
    <Card>
      <CardHeader>...</CardHeader>
      <CardContent>...</CardContent>
    </Card>
  </TabsContent>

  <TabsContent value="notificacoes">
    <Card>
      <CardHeader>...</CardHeader>
      <CardContent>...</CardContent>
    </Card>
  </TabsContent>

  <TabsContent value="integracoes">
    <Card>
      <CardHeader>...</CardHeader>
      <CardContent>...</CardContent>
    </Card>
  </TabsContent>
</Tabs>
```

### Detalhes:
- `defaultValue="empresa"` - aba inicial
- `grid-cols-4` no `TabsList` para distribuir igualmente
- `hidden sm:inline` no texto das abas para responsividade (em mobile mostra só ícone)
- Cada `TabsContent` mantém o conteúdo original do card correspondente

---

## Resumo de Arquivos

| Tipo | Arquivo | Mudança |
|------|---------|---------|
| Modificar | `src/pages/painel/Settings.tsx` | Converter grid de cards para interface com Tabs |


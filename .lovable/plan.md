
# Adicionar URL da Documentacao da API do SGP no Guia do Projeto

## Alteracao

No arquivo `src/components/guia-projeto/integracoes/ERPIntegration.tsx`, na tabela de ERPs Suportados (linha 94), substituir o badge generico "Disponivel" do SGP por um link clicavel apontando para a documentacao oficial:

**De:**
```
<Badge className="bg-green-500/10 text-green-600">Disponível</Badge>
```

**Para:**
Um link externo com o texto "bookstack.sgp.net.br" apontando para `https://bookstack.sgp.net.br/books`, com icone de link externo. O badge tera estilo clicavel e abrira em nova aba.

## Secao Tecnica

### Arquivo: `src/components/guia-projeto/integracoes/ERPIntegration.tsx`

1. Adicionar `ExternalLink` aos imports do lucide-react (linha 17-30)
2. Linha 94 — substituir o badge estatico por:
```tsx
<a href="https://bookstack.sgp.net.br/books" target="_blank" rel="noopener noreferrer">
  <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 cursor-pointer gap-1">
    Docs API <ExternalLink className="h-3 w-3" />
  </Badge>
</a>
```

Sem alteracao de banco. Sem novas dependencias.



# Plano: Melhorar o Cropper de Imagem

## Conceito atual (e o problema)

O `react-easy-crop` usa o conceito "mover a imagem por trás de um retículo fixo". O retículo (área de recorte) fica parado no centro e o usuário arrasta a imagem. Isso é o padrão da lib e funciona bem quando o container é grande, mas no caso atual:

- O container tem apenas `h-72` (288px) de altura
- O `cropSize` não está definido, então a lib calcula automaticamente um tamanho pequeno baseado no container e no aspect ratio
- Resultado: retículo pequeno e difícil de usar

## Melhorias propostas

### 1. Aumentar a área do cropper
- Mudar `h-72` para `h-96` (384px), dando mais espaço

### 2. Definir `cropSize` explícito
- Usar `cropSize={{ width: 280, height: 280 }}` para que o retículo ocupe a maior parte do container
- Isso garante uma área de recorte grande e confortável

### 3. Melhorar controles de zoom
- Aumentar range do zoom para `min={1} max={4}` para mais flexibilidade
- Adicionar botões +/- além do slider

### 4. Adicionar `objectFit="contain"` 
- Garante que a imagem inteira fique visível inicialmente dentro do container

### 5. Estilo visual
- Adicionar `style` no Cropper com cores de overlay mais suaves
- Grid opcional para ajudar no alinhamento

## Arquivo alterado

| Arquivo | Alteração |
|---------|-----------|
| `src/components/ui/image-crop-dialog.tsx` | Aumentar container, definir cropSize, melhorar controles |

## Detalhe técnico

```text
Antes:  container h-72, sem cropSize, zoom 1-3
Depois: container h-96, cropSize 280x280, zoom 1-4, botões +/-
```

A interação continuará sendo "mover a imagem" (padrão da lib `react-easy-crop`), mas com retículo maior e mais espaço, a experiência será muito mais confortável.


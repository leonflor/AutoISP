

# Plano: Adicionar recorte de imagem no upload de avatar

## Contexto
Tanto `TemplateForm.tsx` (admin) quanto `AgentConfig.tsx` (ISP) usam `react-dropzone` para upload de avatar, mas enviam a imagem sem possibilidade de recortar/redimensionar. A lib `react-easy-crop` já está instalada.

## Abordagem
Criar um componente reutilizável `ImageCropDialog` que ambas as telas usarão.

### 1. Criar `src/components/ui/image-crop-dialog.tsx`

Um Dialog que recebe a imagem selecionada e retorna um `Blob` recortado:
- Usa `react-easy-crop` com `Cropper` (aspect ratio 1:1 para avatares)
- Slider para zoom
- Botões "Cancelar" e "Confirmar"
- Helper `getCroppedImg` que usa Canvas API para gerar o blob recortado

Props:
```typescript
{
  open: boolean;
  imageSrc: string;        // objectURL da imagem original
  onClose: () => void;
  onConfirm: (file: File) => void;
  aspect?: number;         // default 1
}
```

### 2. Alterar `src/pages/admin/TemplateForm.tsx`

- No `onAvatarDrop`, em vez de definir diretamente `avatarFile`/`avatarPreview`, abrir o `ImageCropDialog` com a imagem
- No `onConfirm` do dialog, definir `avatarFile` e `avatarPreview` com o resultado recortado

### 3. Alterar `src/pages/painel/AgentConfig.tsx`

- Mesma lógica no `onDrop` do `AgentEditPanel`: abrir o crop dialog
- No `onConfirm`, definir `avatarFile` e `avatarPreview`

### Arquivos

| Arquivo | Ação |
|---------|------|
| `src/components/ui/image-crop-dialog.tsx` | Criar (novo) |
| `src/pages/admin/TemplateForm.tsx` | Integrar crop dialog no fluxo de upload |
| `src/pages/painel/AgentConfig.tsx` | Integrar crop dialog no fluxo de upload |


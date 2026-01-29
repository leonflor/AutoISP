
# Adicionar Preview e Crop de Avatar do Agente

## Objetivo

Adicionar uma tela de preview com ferramenta de enquadramento (crop) antes de fazer upload do avatar do agente, permitindo ao usuário ajustar a área visível da imagem.

---

## Comportamento Visual

**Antes:**
```
1. Usuário clica "Fazer Upload"
2. Seleciona arquivo
3. Upload direto para storage
4. Avatar exibido
```

**Depois:**
```
1. Usuário clica "Fazer Upload"
2. Seleciona arquivo
3. → Abre dialog de preview/crop
   ┌────────────────────────────────────┐
   │      Ajustar Avatar                │
   │  ┌────────────────────────────┐    │
   │  │                            │    │
   │  │    [Área de Crop]          │    │
   │  │    (círculo guia)          │    │
   │  │                            │    │
   │  └────────────────────────────┘    │
   │                                    │
   │  Zoom: [──────●──────]             │
   │                                    │
   │  [Cancelar]        [Confirmar]     │
   └────────────────────────────────────┘
4. Upload da imagem recortada
5. Avatar exibido
```

---

## Arquivos a Criar/Modificar

| Tipo | Arquivo | Descrição |
|------|---------|-----------|
| Criar | `src/components/painel/ai/ImageCropperDialog.tsx` | Dialog de crop com preview |
| Modificar | `src/components/painel/ai/AvatarUpload.tsx` | Integrar dialog de crop no fluxo |
| Instalar | `react-easy-crop` | Biblioteca de crop de imagens |

---

## Seção Técnica

### Nova Dependência

```bash
npm install react-easy-crop
```

### ImageCropperDialog.tsx

O componente receberá:
- `imageUrl`: URL temporária da imagem (ObjectURL)
- `onConfirm`: Callback com o Blob recortado
- `onCancel`: Callback para fechar sem salvar

Funcionalidades:
- Área de crop circular (aspect 1:1 para avatar)
- Controle de zoom via slider
- Arraste para reposicionar a imagem
- Canvas API para gerar imagem final recortada

```tsx
interface ImageCropperDialogProps {
  open: boolean;
  imageUrl: string;
  onConfirm: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

// Função utilitária para criar imagem recortada
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );
  
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.9);
  });
}
```

### Modificações no AvatarUpload.tsx

1. Adicionar estados para controlar o dialog:
```tsx
const [cropDialogOpen, setCropDialogOpen] = useState(false);
const [tempImageUrl, setTempImageUrl] = useState<string>('');
const [selectedFile, setSelectedFile] = useState<File | null>(null);
```

2. Modificar `handleFileSelect` para abrir o dialog em vez de fazer upload direto:
```tsx
const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  // Validações...
  
  // Criar URL temporária e abrir dialog de crop
  const objectUrl = URL.createObjectURL(file);
  setTempImageUrl(objectUrl);
  setSelectedFile(file);
  setCropDialogOpen(true);
};
```

3. Adicionar handler para confirmação do crop:
```tsx
const handleCropConfirm = async (croppedBlob: Blob) => {
  setCropDialogOpen(false);
  
  // Fazer upload do blob recortado
  setIsUploading(true);
  try {
    const fileName = `${ispId}/${crypto.randomUUID()}.jpg`;
    
    const { error } = await supabase.storage
      .from('agent-avatars')
      .upload(fileName, croppedBlob, { upsert: true });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('agent-avatars')
      .getPublicUrl(fileName);
    
    onChange(publicUrl);
    toast({ title: 'Avatar enviado' });
  } catch (error) {
    toast({ variant: 'destructive', title: 'Erro ao enviar' });
  } finally {
    setIsUploading(false);
    URL.revokeObjectURL(tempImageUrl);
    setTempImageUrl('');
  }
};
```

---

## Fluxo de Usuário

```
1. Clica "Fazer Upload"
2. Seleciona imagem do dispositivo
3. Sistema valida formato e tamanho
4. Abre dialog com preview da imagem
5. Usuário ajusta zoom e posição
6. Área circular mostra o enquadramento final
7. Clica "Confirmar"
8. Sistema recorta imagem via Canvas
9. Upload do recorte para Supabase Storage
10. Avatar atualizado no formulário
```

---

## Considerações de UX

- Aspect ratio 1:1 (quadrado) para avatares
- Guia visual circular para indicar área de crop
- Zoom mínimo: 1x (imagem original)
- Zoom máximo: 3x
- Saída final: JPEG com qualidade 90%
- Tamanho máximo de saída: 512x512px

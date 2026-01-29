
# Adicionar Cropper Dialog no Upload de Avatar do Admin

## Objetivo

Integrar o mesmo componente `ImageCropperDialog` já existente no upload de avatar dos templates de agentes do painel Admin, permitindo que superadmins também possam enquadrar a imagem antes do upload.

---

## Mudança Visual

**Antes:**
```
1. Admin clica "Fazer Upload"
2. Seleciona arquivo
3. Upload direto → Avatar exibido
```

**Depois:**
```
1. Admin clica "Fazer Upload"
2. Seleciona arquivo
3. → Abre dialog de preview/crop
4. Admin ajusta zoom e posição
5. Clica "Confirmar"
6. Upload da imagem recortada
7. Avatar exibido
```

---

## Arquivo a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/components/admin/ai-agents/TemplateAvatarUpload.tsx` | Integrar ImageCropperDialog existente |

---

## Seção Técnica

### Mudanças no TemplateAvatarUpload.tsx

1. **Importar o componente existente:**
```tsx
import { ImageCropperDialog } from '@/components/painel/ai/ImageCropperDialog';
```

2. **Adicionar estados para o dialog:**
```tsx
const [cropDialogOpen, setCropDialogOpen] = useState(false);
const [tempImageUrl, setTempImageUrl] = useState<string>('');
```

3. **Modificar `handleFileSelect`** para abrir o dialog em vez de upload direto:
   - Manter validações de formato e tamanho
   - Criar ObjectURL temporária
   - Abrir dialog de crop

4. **Adicionar handlers:**
```tsx
const handleCropConfirm = async (croppedBlob: Blob) => {
  // Upload do blob recortado para templates/{slug}/
  // Limpar URL temporária
};

const handleCropCancel = () => {
  // Fechar dialog e limpar URL temporária
};
```

5. **Renderizar o dialog:**
```tsx
<ImageCropperDialog
  open={cropDialogOpen}
  imageUrl={tempImageUrl}
  onConfirm={handleCropConfirm}
  onCancel={handleCropCancel}
/>
```

---

## Benefícios

- **Consistência**: Mesmo fluxo de upload em ambos os painéis (Admin e ISP)
- **Reutilização**: Aproveita o componente `ImageCropperDialog` já implementado
- **Qualidade**: Avatares de templates com enquadramento padronizado (512x512px)

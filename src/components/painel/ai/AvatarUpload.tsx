import { useState, useRef } from 'react';
import { Upload, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ImageCropperDialog } from './ImageCropperDialog';

interface AvatarUploadProps {
  value?: string;
  onChange: (url: string) => void;
  ispId: string;
  defaultAvatar?: string;
}

export function AvatarUpload({ value, onChange, ispId, defaultAvatar }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validações
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Formato inválido',
        description: 'Use imagens JPG, PNG ou WEBP.',
      });
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast({
        variant: 'destructive',
        title: 'Arquivo muito grande',
        description: 'O tamanho máximo é 2MB.',
      });
      return;
    }

    // Criar URL temporária e abrir dialog de crop
    const objectUrl = URL.createObjectURL(file);
    setTempImageUrl(objectUrl);
    setCropDialogOpen(true);

    // Limpar input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropConfirm = async (croppedBlob: Blob) => {
    setCropDialogOpen(false);
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

      toast({
        title: 'Avatar enviado',
        description: 'A imagem foi carregada com sucesso.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar',
        description: error.message,
      });
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(tempImageUrl);
      setTempImageUrl('');
    }
  };

  const handleCropCancel = () => {
    setCropDialogOpen(false);
    URL.revokeObjectURL(tempImageUrl);
    setTempImageUrl('');
  };

  const handleRemove = () => {
    onChange('');
  };

  const displayUrl = value || defaultAvatar;

  return (
    <>
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={displayUrl} alt="Avatar do agente" />
          <AvatarFallback>
            <User className="h-8 w-8 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                'Enviando...'
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-1" />
                  Fazer Upload
                </>
              )}
            </Button>

            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
              >
                <X className="h-4 w-4 mr-1" />
                Remover
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            JPG, PNG ou WEBP. Máx 2MB.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      </div>

      <ImageCropperDialog
        open={cropDialogOpen}
        imageUrl={tempImageUrl}
        onConfirm={handleCropConfirm}
        onCancel={handleCropCancel}
      />
    </>
  );
}

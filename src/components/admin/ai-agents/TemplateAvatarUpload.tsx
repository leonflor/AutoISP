import { useState, useRef } from 'react';
import { Upload, X, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TemplateAvatarUploadProps {
  value?: string;
  onChange: (url: string) => void;
  slug?: string;
}

export function TemplateAvatarUpload({ value, onChange, slug }: TemplateAvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    try {
      setIsUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const folder = slug || 'default';
      const fileName = `templates/${folder}/${crypto.randomUUID()}.${fileExt}`;

      const { error } = await supabase.storage
        .from('agent-avatars')
        .upload(fileName, file, { upsert: true });

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
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16">
        <AvatarImage src={value} alt="Avatar do agente" />
        <AvatarFallback>
          <Bot className="h-8 w-8 text-muted-foreground" />
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
  );
}

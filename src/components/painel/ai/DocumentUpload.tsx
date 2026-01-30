import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface DocumentUploadProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  disabled?: boolean;
  maxFiles?: number;
  currentCount?: number;
}

const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "text/plain": [".txt"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.oasis.opendocument.text": [".odt"],
};

const MAX_SIZE = 25 * 1024 * 1024; // 25MB

export function DocumentUpload({
  onUpload,
  isUploading,
  disabled,
  maxFiles = 5,
  currentCount = 0,
}: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const remainingSlots = maxFiles - currentCount;
  const isLimitReached = remainingSlots <= 0;

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: unknown[]) => {
    setError(null);

    if (rejectedFiles.length > 0) {
      setError("Arquivo inválido. Use PDF, TXT, DOCX ou ODT (máx 25MB).");
      return;
    }

    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    maxFiles: 1,
    disabled: disabled || isUploading || isLimitReached,
  });

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      setError(null);
    } catch (err) {
      // Error is handled by the mutation
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setError(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLimitReached) {
    return (
      <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
        <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm font-medium text-muted-foreground">
          Limite de documentos atingido
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Seu plano permite até {maxFiles} documentos por agente.
          Remova um documento para adicionar novos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50",
            (disabled || isUploading) && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
          <p className="text-sm font-medium">
            {isDragActive
              ? "Solte o arquivo aqui..."
              : "Arraste um arquivo ou clique para selecionar"}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            PDF, TXT, DOCX ou ODT (máx. 25MB)
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {remainingSlots} de {maxFiles} slots disponíveis
          </p>
        </div>
      ) : (
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatSize(selectedFile.size)}
              </p>
            </div>
            {!isUploading && (
              <Button variant="ghost" size="icon" onClick={handleClear}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {isUploading ? (
            <div className="space-y-2">
              <Progress value={undefined} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                Enviando...
              </p>
            </div>
          ) : (
            <Button onClick={handleUpload} className="w-full" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Enviar Documento
            </Button>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Database,
  Upload,
  Shield,
  Zap,
  AlertTriangle,
  CheckCircle2,
  FileImage,
  FileText,
  FolderOpen,
  Lock,
  Globe,
  HardDrive
} from "lucide-react";

const SupabaseStorageIntegration = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
            <HardDrive className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">Supabase Storage</h3>
              <Badge variant="outline" className="text-xs">INT-05</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Armazenamento de arquivos e CDN integrado</p>
          </div>
        </div>
        <Badge className="bg-orange-500/20 text-orange-600 hover:bg-orange-500/30">
          Alta Criticidade
        </Badge>
      </div>

      {/* Visão Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-4 w-4" />
            Visão Geral
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Supabase Storage fornece armazenamento de objetos com controle de acesso granular via RLS,
            CDN integrado para distribuição global, e transformações de imagem on-the-fly. Ideal para
            arquiteturas multi-tenant com isolamento completo de dados.
          </p>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: FileImage, label: "Avatars de usuários", desc: "Fotos de perfil e logos" },
              { icon: FileText, label: "Documentos", desc: "PDFs, contratos, manuais" },
              { icon: FolderOpen, label: "Knowledge Base RAG", desc: "Arquivos para indexação IA" },
              { icon: Upload, label: "Anexos de atendimento", desc: "Prints, logs, evidências" },
              { icon: HardDrive, label: "Relatórios exportados", desc: "CSVs, planilhas geradas" },
              { icon: Globe, label: "Assets públicos", desc: "Imagens do site, banners" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3 rounded-lg border border-border p-3">
                <item.icon className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Arquitetura Multi-tenant */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FolderOpen className="h-4 w-4" />
            Arquitetura Multi-tenant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
{`┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE STORAGE                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   avatars   │  │  documents  │  │  knowledge  │              │
│  │  (public)   │  │  (private)  │  │  (private)  │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                      │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐              │
│  │ {tenant_id}/│  │ {tenant_id}/│  │ {tenant_id}/│              │
│  │ {user_id}/  │  │ {category}/ │  │ {agent_id}/ │              │
│  │ avatar.jpg  │  │ doc.pdf     │  │ file.txt    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ attachments │  │   exports   │  │   public    │              │
│  │  (private)  │  │  (private)  │  │  (public)   │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                      │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐              │
│  │ {tenant_id}/│  │ {tenant_id}/│  │  site-logo/ │              │
│  │ {ticket_id}/│  │ {report_id}/│  │  banners/   │              │
│  │ print.png   │  │ report.csv  │  │  hero.jpg   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘`}
          </pre>
        </CardContent>
      </Card>

      {/* Fluxos de Upload e Download */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Upload className="h-4 w-4" />
            Fluxos de Upload e Download
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="mb-2 text-sm font-medium text-foreground">Fluxo de Upload</h4>
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
{`┌──────────┐    ┌──────────────┐    ┌─────────────────┐    ┌─────────────┐
│  Client  │───▶│   Validate   │───▶│  RLS Policy     │───▶│   Storage   │
│  (React) │    │  File Type   │    │  Check Tenant   │    │   Bucket    │
└──────────┘    │  Size Limit  │    │  Check Role     │    └──────┬──────┘
                └──────────────┘    └─────────────────┘           │
                                                                   │
                ┌──────────────────────────────────────────────────┘
                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  RESPONSE                                                               │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  {                                                               │   │
│  │    "path": "{tenant_id}/{user_id}/avatar.jpg",                   │   │
│  │    "fullPath": "avatars/{tenant_id}/{user_id}/avatar.jpg",       │   │
│  │    "id": "uuid"                                                  │   │
│  │  }                                                               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘`}
            </pre>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-medium text-foreground">Fluxo de Download (Signed URL)</h4>
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
{`┌──────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐
│  Client  │───▶│  createSignedUrl│───▶│  RLS Policy     │───▶│  Signed URL │
│  (React) │    │  (60s expiry)   │    │  Verify Access  │    │  Generated  │
└──────────┘    └─────────────────┘    └─────────────────┘    └──────┬──────┘
                                                                      │
┌─────────────────────────────────────────────────────────────────────┘
▼
┌─────────────────────────────────────────────────────────────────────────┐
│  SIGNED URL (expires in 60s)                                            │
│  https://xxx.supabase.co/storage/v1/object/sign/documents/...           │
│  ?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...                         │
└─────────────────────────────────────────────────────────────────────────┘`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Configuração de Buckets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FolderOpen className="h-4 w-4" />
            Configuração de Buckets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left font-medium text-foreground">Bucket</th>
                  <th className="pb-3 text-left font-medium text-foreground">Público</th>
                  <th className="pb-3 text-left font-medium text-foreground">Limite</th>
                  <th className="pb-3 text-left font-medium text-foreground">MIME Types</th>
                  <th className="pb-3 text-left font-medium text-foreground">Uso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-3">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">avatars</code>
                  </td>
                  <td className="py-3">
                    <Badge variant="outline" className="bg-green-500/10 text-green-600">Sim</Badge>
                  </td>
                  <td className="py-3">2MB</td>
                  <td className="py-3 text-xs text-muted-foreground">image/jpeg, image/png, image/webp</td>
                  <td className="py-3 text-muted-foreground">Fotos de perfil</td>
                </tr>
                <tr>
                  <td className="py-3">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">documents</code>
                  </td>
                  <td className="py-3">
                    <Badge variant="outline" className="bg-red-500/10 text-red-600">Não</Badge>
                  </td>
                  <td className="py-3">50MB</td>
                  <td className="py-3 text-xs text-muted-foreground">application/pdf, application/msword, ...</td>
                  <td className="py-3 text-muted-foreground">Contratos, manuais</td>
                </tr>
                <tr>
                  <td className="py-3">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">knowledge</code>
                  </td>
                  <td className="py-3">
                    <Badge variant="outline" className="bg-red-500/10 text-red-600">Não</Badge>
                  </td>
                  <td className="py-3">100MB</td>
                  <td className="py-3 text-xs text-muted-foreground">text/*, application/pdf, ...</td>
                  <td className="py-3 text-muted-foreground">Base RAG</td>
                </tr>
                <tr>
                  <td className="py-3">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">attachments</code>
                  </td>
                  <td className="py-3">
                    <Badge variant="outline" className="bg-red-500/10 text-red-600">Não</Badge>
                  </td>
                  <td className="py-3">10MB</td>
                  <td className="py-3 text-xs text-muted-foreground">image/*, application/pdf</td>
                  <td className="py-3 text-muted-foreground">Anexos tickets</td>
                </tr>
                <tr>
                  <td className="py-3">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">exports</code>
                  </td>
                  <td className="py-3">
                    <Badge variant="outline" className="bg-red-500/10 text-red-600">Não</Badge>
                  </td>
                  <td className="py-3">100MB</td>
                  <td className="py-3 text-xs text-muted-foreground">text/csv, application/vnd.ms-excel, ...</td>
                  <td className="py-3 text-muted-foreground">Relatórios</td>
                </tr>
                <tr>
                  <td className="py-3">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">public</code>
                  </td>
                  <td className="py-3">
                    <Badge variant="outline" className="bg-green-500/10 text-green-600">Sim</Badge>
                  </td>
                  <td className="py-3">5MB</td>
                  <td className="py-3 text-xs text-muted-foreground">image/*</td>
                  <td className="py-3 text-muted-foreground">Assets site</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* SQL Migrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-4 w-4" />
            SQL Migrations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="mb-2 text-sm font-medium text-foreground">Criação de Buckets</h4>
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
{`-- Bucket público para avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Bucket privado para documentos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  52428800, -- 50MB
  ARRAY['application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Bucket privado para knowledge base (RAG)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'knowledge',
  'knowledge',
  false,
  104857600, -- 100MB
  ARRAY['text/plain', 'text/markdown', 'application/pdf', 'text/csv']
);

-- Bucket privado para anexos de atendimento
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'attachments',
  'attachments',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
);

-- Bucket privado para exports
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'exports',
  'exports',
  false,
  104857600, -- 100MB
  ARRAY['text/csv', 'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
);

-- Bucket público para assets do site
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'public',
  'public',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
);`}
            </pre>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-medium text-foreground">RLS Policies para storage.objects</h4>
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
{`-- Helper function para extrair tenant_id do path
CREATE OR REPLACE FUNCTION storage.get_tenant_from_path(path text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = storage, public
AS $$
BEGIN
  -- Path format: {tenant_id}/{...}
  RETURN (split_part(path, '/', 1))::uuid;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

-- Helper function para verificar acesso do usuário ao tenant
CREATE OR REPLACE FUNCTION storage.user_has_tenant_access(tenant_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND tenant_id = $1
  );
$$;

-- Policy: Usuários podem fazer upload no seu tenant
CREATE POLICY "Users can upload to own tenant"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id IN ('documents', 'knowledge', 'attachments', 'exports')
  AND storage.user_has_tenant_access(storage.get_tenant_from_path(name))
);

-- Policy: Usuários podem ver arquivos do seu tenant
CREATE POLICY "Users can view own tenant files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id IN ('documents', 'knowledge', 'attachments', 'exports')
  AND storage.user_has_tenant_access(storage.get_tenant_from_path(name))
);

-- Policy: Usuários podem deletar arquivos do seu tenant (com role adequada)
CREATE POLICY "Users can delete own tenant files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id IN ('documents', 'knowledge', 'attachments', 'exports')
  AND storage.user_has_tenant_access(storage.get_tenant_from_path(name))
  AND public.has_role(auth.uid(), 'admin')
);

-- Policy: Avatars - usuários podem gerenciar seus próprios
CREATE POLICY "Users can manage own avatar"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[2] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy: Bucket público - qualquer um pode ver
CREATE POLICY "Public bucket is publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'public');

-- Policy: Admins podem gerenciar bucket público
CREATE POLICY "Admins can manage public bucket"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'public'
  AND public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  bucket_id = 'public'
  AND public.has_role(auth.uid(), 'admin')
);`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Implementação Frontend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4" />
            Implementação Frontend
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="mb-2 text-sm font-medium text-foreground">Upload de Avatar</h4>
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
{`// hooks/useAvatarUpload.ts
import { supabase } from '@/integrations/supabase/client';

export const useAvatarUpload = () => {
  const uploadAvatar = async (file: File, tenantId: string, userId: string) => {
    // Validação
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      throw new Error('Arquivo muito grande. Máximo: 2MB');
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Tipo de arquivo não permitido');
    }

    // Gerar nome único
    const fileExt = file.name.split('.').pop();
    const fileName = \`\${tenantId}/\${userId}/avatar.\${fileExt}\`;

    // Upload
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type
      });

    if (error) throw error;

    // Retornar URL pública
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  return { uploadAvatar };
};`}
            </pre>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-medium text-foreground">Upload de Documento Privado</h4>
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
{`// hooks/useDocumentUpload.ts
import { supabase } from '@/integrations/supabase/client';

export const useDocumentUpload = () => {
  const uploadDocument = async (
    file: File, 
    tenantId: string, 
    category: string
  ) => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new Error('Arquivo muito grande. Máximo: 50MB');
    }

    // Gerar nome único com timestamp
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = \`\${tenantId}/\${category}/\${timestamp}_\${sanitizedName}\`;

    const { data, error } = await supabase.storage
      .from('documents')
      .upload(fileName, file, {
        contentType: file.type
      });

    if (error) throw error;

    // Registrar no banco
    const { error: dbError } = await supabase
      .from('documents')
      .insert({
        tenant_id: tenantId,
        name: file.name,
        storage_path: data.path,
        size_bytes: file.size,
        mime_type: file.type,
        category
      });

    if (dbError) throw dbError;

    return data.path;
  };

  return { uploadDocument };
};`}
            </pre>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-medium text-foreground">Download com Signed URL</h4>
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
{`// hooks/useDocumentDownload.ts
import { supabase } from '@/integrations/supabase/client';

export const useDocumentDownload = () => {
  const downloadDocument = async (storagePath: string) => {
    // Gerar signed URL válida por 60 segundos
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(storagePath, 60);

    if (error) throw error;

    // Abrir em nova aba ou forçar download
    window.open(data.signedUrl, '_blank');
  };

  const getSignedUrl = async (storagePath: string, expiresIn = 3600) => {
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(storagePath, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  };

  return { downloadDocument, getSignedUrl };
};`}
            </pre>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-medium text-foreground">Componente FileUpload Genérico</h4>
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
{`// components/FileUpload.tsx
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FileUploadProps {
  bucket: string;
  path: string;
  accept?: string;
  maxSize?: number;
  onUpload: (url: string) => void;
  onError?: (error: Error) => void;
}

export const FileUpload = ({
  bucket,
  path,
  accept = '*/*',
  maxSize = 10 * 1024 * 1024,
  onUpload,
  onError
}: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = useCallback(async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize) {
      onError?.(new Error(\`Arquivo excede \${maxSize / 1024 / 1024}MB\`));
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const fileName = \`\${path}/\${Date.now()}_\${file.name}\`;
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          onUploadProgress: (prog) => {
            setProgress(Math.round((prog.loaded / prog.total) * 100));
          }
        });

      if (error) throw error;
      
      onUpload(data.path);
    } catch (err) {
      onError?.(err as Error);
    } finally {
      setUploading(false);
    }
  }, [bucket, path, maxSize, onUpload, onError]);

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept={accept}
        onChange={handleUpload}
        disabled={uploading}
        className="file-input"
      />
      {uploading && (
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: \`\${progress}%\` }}
          />
        </div>
      )}
    </div>
  );
};`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Integração RAG */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-4 w-4" />
            Integração com RAG (Knowledge Base)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
{`┌──────────────────────────────────────────────────────────────────────┐
│  FLUXO DE INDEXAÇÃO                                                  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────┐    ┌─────────────┐    ┌─────────────┐                 │
│  │  Upload  │───▶│  Storage    │───▶│  Webhook    │                 │
│  │  File    │    │  knowledge/ │    │  Trigger    │                 │
│  └──────────┘    └─────────────┘    └──────┬──────┘                 │
│                                            │                         │
│                                     ┌──────▼──────┐                 │
│                                     │  Edge Func  │                 │
│                                     │  index-doc  │                 │
│                                     └──────┬──────┘                 │
│                                            │                         │
│               ┌────────────────────────────┼────────────────────┐   │
│               │                            │                     │   │
│        ┌──────▼──────┐            ┌────────▼────────┐           │   │
│        │  Parse Doc  │            │  Generate       │           │   │
│        │  (text)     │            │  Embeddings     │           │   │
│        └──────┬──────┘            │  (OpenAI)       │           │   │
│               │                    └────────┬────────┘           │   │
│               │                             │                     │   │
│        ┌──────▼─────────────────────────────▼──────┐             │   │
│        │           document_chunks                  │             │   │
│        │  (content, embedding, metadata)           │             │   │
│        └────────────────────────────────────────────┘             │   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘`}
          </pre>

          <div>
            <h4 className="mb-2 text-sm font-medium text-foreground">Tabelas de Suporte</h4>
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
{`-- Documentos da knowledge base
CREATE TABLE public.knowledge_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  agent_id uuid REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  name text NOT NULL,
  storage_path text NOT NULL,
  size_bytes bigint NOT NULL,
  mime_type text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'indexed', 'error')),
  indexed_at timestamptz,
  chunk_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Chunks indexados com embeddings
CREATE TABLE public.document_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES public.knowledge_documents(id) ON DELETE CASCADE NOT NULL,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  embedding vector(1536), -- OpenAI ada-002
  metadata jsonb DEFAULT '{}',
  chunk_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Índice para busca vetorial
CREATE INDEX document_chunks_embedding_idx 
ON public.document_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* CDN e Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4" />
            CDN e Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left font-medium text-foreground">Tipo</th>
                  <th className="pb-3 text-left font-medium text-foreground">Cache-Control</th>
                  <th className="pb-3 text-left font-medium text-foreground">CDN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-3 text-muted-foreground">Avatars</td>
                  <td className="py-3"><code className="text-xs">public, max-age=3600</code></td>
                  <td className="py-3">✅ Via CDN</td>
                </tr>
                <tr>
                  <td className="py-3 text-muted-foreground">Documentos</td>
                  <td className="py-3"><code className="text-xs">private, no-cache</code></td>
                  <td className="py-3">❌ Signed URLs</td>
                </tr>
                <tr>
                  <td className="py-3 text-muted-foreground">Assets públicos</td>
                  <td className="py-3"><code className="text-xs">public, max-age=86400</code></td>
                  <td className="py-3">✅ Via CDN</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-medium text-foreground">Image Transformations</h4>
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
{`// Transformações de imagem on-the-fly
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl(path, {
    transform: {
      width: 200,
      height: 200,
      resize: 'cover',
      quality: 80,
      format: 'webp'
    }
  });

// URL resultante:
// https://xxx.supabase.co/storage/v1/render/image/public/avatars/...
//   ?width=200&height=200&resize=cover&quality=80&format=webp`}
            </pre>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Features Relacionadas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Features Relacionadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="mb-2 text-sm font-medium text-foreground">Painel Cliente</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• CLI-AG-02: Upload de arquivos para knowledge base</li>
                <li>• CLI-AT-03: Anexos em conversas de atendimento</li>
                <li>• CLI-US-03: Upload de avatar do usuário</li>
                <li>• CLI-RE-04: Download de relatórios exportados</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-medium text-foreground">Painel Admin</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• ADM-CL-05: Gestão de documentos por tenant</li>
                <li>• ADM-RE-03: Export de relatórios em lote</li>
                <li>• ADM-CF-04: Upload de logo da plataforma</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left font-medium text-foreground">Aspecto</th>
                  <th className="pb-3 text-left font-medium text-foreground">Implementação</th>
                  <th className="pb-3 text-left font-medium text-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-3 text-muted-foreground">Isolamento Multi-tenant</td>
                  <td className="py-3">RLS com tenant_id no path</td>
                  <td className="py-3">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </td>
                </tr>
                <tr>
                  <td className="py-3 text-muted-foreground">Validação de MIME Type</td>
                  <td className="py-3">Whitelist por bucket</td>
                  <td className="py-3">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </td>
                </tr>
                <tr>
                  <td className="py-3 text-muted-foreground">Limite de Tamanho</td>
                  <td className="py-3">Por bucket + validação client</td>
                  <td className="py-3">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </td>
                </tr>
                <tr>
                  <td className="py-3 text-muted-foreground">Signed URLs</td>
                  <td className="py-3">Expiração curta (60s default)</td>
                  <td className="py-3">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </td>
                </tr>
                <tr>
                  <td className="py-3 text-muted-foreground">Sanitização de Nomes</td>
                  <td className="py-3">Remoção de caracteres especiais</td>
                  <td className="py-3">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4" />
            Troubleshooting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left font-medium text-foreground">Erro</th>
                  <th className="pb-3 text-left font-medium text-foreground">Causa</th>
                  <th className="pb-3 text-left font-medium text-foreground">Solução</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-3 font-mono text-xs text-red-500">new row violates RLS</td>
                  <td className="py-3 text-muted-foreground">Path não contém tenant_id válido</td>
                  <td className="py-3 text-muted-foreground">Verificar formato do path</td>
                </tr>
                <tr>
                  <td className="py-3 font-mono text-xs text-red-500">Payload too large</td>
                  <td className="py-3 text-muted-foreground">Arquivo excede limite do bucket</td>
                  <td className="py-3 text-muted-foreground">Validar tamanho no client</td>
                </tr>
                <tr>
                  <td className="py-3 font-mono text-xs text-red-500">Invalid mime type</td>
                  <td className="py-3 text-muted-foreground">Tipo não permitido no bucket</td>
                  <td className="py-3 text-muted-foreground">Validar tipo no client</td>
                </tr>
                <tr>
                  <td className="py-3 font-mono text-xs text-red-500">Signed URL expired</td>
                  <td className="py-3 text-muted-foreground">URL expirou após tempo limite</td>
                  <td className="py-3 text-muted-foreground">Gerar nova URL antes do download</td>
                </tr>
                <tr>
                  <td className="py-3 font-mono text-xs text-red-500">Object not found</td>
                  <td className="py-3 text-muted-foreground">Arquivo deletado ou path incorreto</td>
                  <td className="py-3 text-muted-foreground">Verificar path no banco</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Custos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4" />
            Custos Estimados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left font-medium text-foreground">Recurso</th>
                  <th className="pb-3 text-left font-medium text-foreground">Incluído (Pro)</th>
                  <th className="pb-3 text-left font-medium text-foreground">Adicional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-3 text-muted-foreground">Armazenamento</td>
                  <td className="py-3">100GB</td>
                  <td className="py-3">$0.021/GB</td>
                </tr>
                <tr>
                  <td className="py-3 text-muted-foreground">Egress (transferência)</td>
                  <td className="py-3">250GB</td>
                  <td className="py-3">$0.09/GB</td>
                </tr>
                <tr>
                  <td className="py-3 text-muted-foreground">Image Transformations</td>
                  <td className="py-3">Ilimitado</td>
                  <td className="py-3">—</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            <strong>Estimativa para 100 tenants:</strong> ~50GB storage + ~100GB egress/mês = dentro do plano Pro
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupabaseStorageIntegration;

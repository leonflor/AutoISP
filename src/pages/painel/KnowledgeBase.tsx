import { useState, useCallback } from 'react';
import { useKnowledgeBase } from '@/hooks/painel/useKnowledgeBase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  BookOpen, FileText, Globe, Plus, Trash2, Upload, Loader2, AlertCircle, CheckCircle2,
  Clock, HelpCircle
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { format } from 'date-fns';

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; className: string }> = {
  pending: { label: 'Pendente', icon: Clock, className: 'bg-muted text-muted-foreground' },
  indexing: { label: 'Indexando...', icon: Loader2, className: 'bg-primary/10 text-primary' },
  indexed: { label: 'Indexado', icon: CheckCircle2, className: 'bg-green-500/10 text-green-600' },
  error: { label: 'Erro', icon: AlertCircle, className: 'bg-destructive/10 text-destructive' },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] || statusConfig.pending;
  const Icon = cfg.icon;
  return (
    <Badge variant="secondary" className={cfg.className}>
      <Icon className={`h-3 w-3 mr-1 ${status === 'indexing' ? 'animate-spin' : ''}`} />
      {cfg.label}
    </Badge>
  );
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function KnowledgeBase() {
  const {
    faqs, documents, urls, stats, isLoading, indexingCount,
    createFaq, uploadDocument, addUrl, deleteItem,
  } = useKnowledgeBase();

  const [faqOpen, setFaqOpen] = useState(false);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqCategory, setFaqCategory] = useState('');
  const [urlInput, setUrlInput] = useState('');

  const handleCreateFaq = () => {
    if (!faqQuestion.trim() || !faqAnswer.trim()) return;
    createFaq.mutate(
      { question: faqQuestion, answer: faqAnswer, category: faqCategory },
      {
        onSuccess: () => {
          setFaqOpen(false);
          setFaqQuestion('');
          setFaqAnswer('');
          setFaqCategory('');
        },
      }
    );
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    try {
      new URL(urlInput);
    } catch {
      return;
    }
    addUrl.mutate(urlInput, { onSuccess: () => setUrlInput('') });
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => uploadDocument.mutate(file));
  }, [uploadDocument]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 10 * 1024 * 1024,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Base de Conhecimento</h1>
        <p className="text-muted-foreground">
          Gerencie FAQs, documentos e URLs que alimentam o agente IA
        </p>
      </div>

      {/* Stats Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm">
              <span className="flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-primary" />
                <strong>{stats.faqCount}</strong> perguntas
              </span>
              <span className="flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-primary" />
                <strong>{stats.docCount}</strong> documentos
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-primary" />
                <strong>{stats.urlCount}</strong> URLs
              </span>
            </div>
            {indexingCount > 0 && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                {indexingCount} indexando
              </Badge>
            )}
          </div>
          {indexingCount > 0 && (
            <Progress className="mt-3 h-1.5" value={undefined} />
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="faq">
        <TabsList>
          <TabsTrigger value="faq">
            <HelpCircle className="h-4 w-4 mr-1.5" /> FAQ ({faqs.length})
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 mr-1.5" /> Documentos ({documents.length})
          </TabsTrigger>
          <TabsTrigger value="urls">
            <Globe className="h-4 w-4 mr-1.5" /> URLs ({urls.length})
          </TabsTrigger>
        </TabsList>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setFaqOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> Nova FAQ
            </Button>
          </div>

          {faqs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>Nenhuma FAQ cadastrada ainda</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {faqs.map(faq => (
                <Card key={faq.id}>
                  <CardContent className="py-4 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{faq.title}</p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {faq.content.replace('Pergunta: ', '').split('\nResposta: ')[1] || faq.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={faq.status} />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteItem.mutate(faq)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* FAQ Dialog */}
          <Dialog open={faqOpen} onOpenChange={setFaqOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova FAQ</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Pergunta</Label>
                  <Input
                    value={faqQuestion}
                    onChange={e => setFaqQuestion(e.target.value)}
                    placeholder="Ex: Como alterar meu plano?"
                  />
                </div>
                <div>
                  <Label>Resposta</Label>
                  <Textarea
                    value={faqAnswer}
                    onChange={e => setFaqAnswer(e.target.value)}
                    placeholder="Escreva a resposta completa..."
                    rows={4}
                  />
                </div>
                <div>
                  <Label>Categoria (opcional)</Label>
                  <Input
                    value={faqCategory}
                    onChange={e => setFaqCategory(e.target.value)}
                    placeholder="Ex: Planos, Suporte, Pagamento"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setFaqOpen(false)}>Cancelar</Button>
                <Button
                  onClick={handleCreateFaq}
                  disabled={!faqQuestion.trim() || !faqAnswer.trim() || createFaq.isPending}
                >
                  {createFaq.isPending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isDragActive
                ? 'Solte o arquivo aqui...'
                : 'Arraste arquivos ou clique para selecionar (PDF, TXT, DOCX — máx 10MB)'}
            </p>
          </div>

          {documents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>Nenhum documento enviado</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {documents.map(doc => (
                <Card key={doc.id}>
                  <CardContent className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(doc.file_size)} · {doc.created_at ? format(new Date(doc.created_at), 'dd/MM/yyyy HH:mm') : '—'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={doc.status} />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteItem.mutate(doc)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* URLs Tab */}
        <TabsContent value="urls" className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              placeholder="https://exemplo.com/pagina"
              onKeyDown={e => e.key === 'Enter' && handleAddUrl()}
            />
            <Button onClick={handleAddUrl} disabled={addUrl.isPending}>
              {addUrl.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1.5" />}
              Adicionar
            </Button>
          </div>

          {urls.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Globe className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>Nenhuma URL adicionada</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {urls.map(url => (
                <Card key={url.id}>
                  <CardContent className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Globe className="h-5 w-5 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{url.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {url.created_at ? format(new Date(url.created_at), 'dd/MM/yyyy HH:mm') : '—'}
                        </p>
                        {url.error_message && (
                          <p className="text-xs text-destructive mt-1">{url.error_message}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={url.status} />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteItem.mutate(url)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

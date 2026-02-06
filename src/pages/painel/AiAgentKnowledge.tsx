import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Upload, BookOpen, Bot, FileText, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAgentKnowledge, KnowledgeBaseForm as KnowledgeFormType } from "@/hooks/painel/useAgentKnowledge";
import { useDocumentKnowledge, useDocumentLimits } from "@/hooks/painel/useDocumentKnowledge";
import { KnowledgeBaseTable } from "@/components/painel/ai/KnowledgeBaseTable";
import { KnowledgeBaseForm } from "@/components/painel/ai/KnowledgeBaseForm";
import { KnowledgeBaseViewDialog } from "@/components/painel/ai/KnowledgeBaseViewDialog";
import { KnowledgeBaseImport } from "@/components/painel/ai/KnowledgeBaseImport";
import { DocumentUpload } from "@/components/painel/ai/DocumentUpload";
import { DocumentsTable } from "@/components/painel/ai/DocumentsTable";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type KnowledgeBase = Database["public"]["Tables"]["agent_knowledge_base"]["Row"];

const AiAgentKnowledgePage = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeBase | null>(null);
  const [viewingItem, setViewingItem] = useState<KnowledgeBase | null>(null);
  const [activeTab, setActiveTab] = useState("qa");

  // Fetch agent details
  const { data: ispAgent, isLoading: agentLoading } = useQuery({
    queryKey: ["isp-agent", agentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("isp_agents")
        .select(`*, ai_agents!inner (*)`)
        .eq("id", agentId!)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!agentId,
  });

  // Q&A Knowledge
  const {
    knowledge,
    categories,
    stats: qaStats,
    isLoading: knowledgeLoading,
    createKnowledge,
    updateKnowledge,
    deleteKnowledge,
    importKnowledge,
  } = useAgentKnowledge(agentId || null);

  // Document Knowledge
  const {
    documents,
    stats: docStats,
    isLoading: documentsLoading,
    uploadDocument,
    deleteDocument,
    reprocessDocument,
  } = useDocumentKnowledge(agentId || null, ispAgent?.isp_id || null);

  // Document limits
  const { data: limits } = useDocumentLimits(
    ispAgent?.isp_id || null,
    ispAgent?.agent_id || null
  );

  const handleEdit = (item: KnowledgeBase) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleSave = (form: KnowledgeFormType) => {
    if (editingItem) {
      updateKnowledge.mutate(
        { id: editingItem.id, form },
        {
          onSuccess: () => {
            setFormOpen(false);
            setEditingItem(null);
          },
        }
      );
    } else {
      createKnowledge.mutate(form, {
        onSuccess: () => {
          setFormOpen(false);
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta pergunta?")) {
      deleteKnowledge.mutate(id);
    }
  };

  const handleImport = (items: KnowledgeFormType[]) => {
    importKnowledge.mutate(items, {
      onSuccess: () => {
        setImportOpen(false);
      },
    });
  };

  const handleDocumentUpload = async (file: File) => {
    await uploadDocument.mutateAsync(file);
  };

  // Verificar se uses_knowledge_base está habilitado
  const usesKnowledgeBase = ispAgent?.ai_agents?.uses_knowledge_base;

  if (agentLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!ispAgent) {
    return (
      <div className="text-center py-12">
        <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-semibold">Agente não encontrado</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Este agente não existe ou você não tem acesso a ele.
        </p>
        <Button onClick={() => navigate("/painel/agentes")}>Voltar</Button>
      </div>
    );
  }

  // Redirecionar se uses_knowledge_base estiver desabilitado
  if (!usesKnowledgeBase) {
    return (
      <div className="text-center py-12">
        <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-semibold">Base de Conhecimento não disponível</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Este agente não suporta base de conhecimento personalizada.
        </p>
        <Button onClick={() => navigate("/painel/agentes")}>Voltar para Agentes</Button>
      </div>
    );
  }

  const template = ispAgent.ai_agents;
  const displayName = ispAgent.display_name || template.name;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/painel/agentes")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Base de Conhecimento
            </h1>
            <p className="text-muted-foreground">{displayName}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="qa" className="gap-2">
            <HelpCircle className="h-4 w-4" />
            Perguntas/Respostas
            {qaStats && (
              <Badge variant="secondary" className="ml-1">
                {qaStats.total}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="docs" className="gap-2">
            <FileText className="h-4 w-4" />
            Documentos
            {docStats && (
              <Badge variant="secondary" className="ml-1">
                {docStats.total}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Q&A Tab */}
        <TabsContent value="qa" className="space-y-6">
          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Importar CSV
            </Button>
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Pergunta
            </Button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Perguntas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{qaStats?.total || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Perguntas Ativas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{qaStats?.active || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Categorias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {categories?.length ? (
                    categories.map((cat) => (
                      <Badge key={cat} variant="outline" className="text-xs">
                        {cat} ({qaStats?.byCategory[cat] || 0})
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhuma</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          <Card>
            <CardContent className="pt-6">
              <KnowledgeBaseTable
                knowledge={knowledge}
                categories={categories}
                isLoading={knowledgeLoading}
                onView={setViewingItem}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="docs" className="space-y-6">
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Documentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{docStats?.total || 0}</p>
                <p className="text-xs text-muted-foreground">
                  de {limits?.limit || 5} permitidos
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Indexados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">
                  {docStats?.indexed || 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Em Processamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600">
                  {docStats?.processing || 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Chunks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{docStats?.totalChunks || 0}</p>
              </CardContent>
            </Card>
          </div>

          {/* Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Enviar Documento</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentUpload
                onUpload={handleDocumentUpload}
                isUploading={uploadDocument.isPending}
                maxFiles={limits?.limit || 5}
                currentCount={docStats?.total || 0}
              />
            </CardContent>
          </Card>

          {/* Documents Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Documentos Enviados</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentsTable
                documents={documents}
                isLoading={documentsLoading}
                onDelete={(id) => deleteDocument.mutate(id)}
                onReprocess={(id) => reprocessDocument.mutate(id)}
                isDeleting={deleteDocument.isPending}
                isReprocessing={reprocessDocument.isPending}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <KnowledgeBaseForm
        item={editingItem}
        categories={categories}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingItem(null);
        }}
        onSave={handleSave}
        isLoading={createKnowledge.isPending || updateKnowledge.isPending}
      />

      {/* View Dialog */}
      <KnowledgeBaseViewDialog
        item={viewingItem}
        open={!!viewingItem}
        onOpenChange={(open) => { if (!open) setViewingItem(null); }}
        onEdit={(item) => {
          setViewingItem(null);
          handleEdit(item);
        }}
      />

      {/* Import Dialog */}
      <KnowledgeBaseImport
        open={importOpen}
        onOpenChange={setImportOpen}
        onImport={handleImport}
        isLoading={importKnowledge.isPending}
      />
    </div>
  );
};

export default AiAgentKnowledgePage;

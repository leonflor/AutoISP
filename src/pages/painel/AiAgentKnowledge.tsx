import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Upload, BookOpen, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAgentKnowledge, KnowledgeBaseForm as KnowledgeFormType } from "@/hooks/painel/useAgentKnowledge";
import { KnowledgeBaseTable } from "@/components/painel/ai/KnowledgeBaseTable";
import { KnowledgeBaseForm } from "@/components/painel/ai/KnowledgeBaseForm";
import { KnowledgeBaseImport } from "@/components/painel/ai/KnowledgeBaseImport";
import type { Database } from "@/integrations/supabase/types";

type KnowledgeBase = Database["public"]["Tables"]["agent_knowledge_base"]["Row"];

const AiAgentKnowledgePage = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();

  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeBase | null>(null);

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

  const {
    knowledge,
    categories,
    stats,
    isLoading: knowledgeLoading,
    createKnowledge,
    updateKnowledge,
    deleteKnowledge,
    importKnowledge,
  } = useAgentKnowledge(agentId || null);

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
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Importar CSV
          </Button>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Pergunta
          </Button>
        </div>
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
            <p className="text-2xl font-bold">{stats?.total || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Perguntas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.active || 0}</p>
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
                    {cat} ({stats?.byCategory[cat] || 0})
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
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

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

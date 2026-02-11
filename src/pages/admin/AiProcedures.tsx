import { useNavigate } from 'react-router-dom';
import { Plus, Package, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAiProcedures, useDeleteProcedure } from '@/hooks/admin/useAiProcedures';

export default function AiProcedures() {
  const navigate = useNavigate();
  const { data: procedures, isLoading } = useAiProcedures();
  const deleteProcedure = useDeleteProcedure();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Procedimentos de IA</h1>
          <p className="text-muted-foreground mt-1">Pacotes reutilizáveis de ferramentas e fluxos para agentes</p>
        </div>
        <Button onClick={() => navigate('/admin/ai-procedures/novo')}>
          <Plus className="h-4 w-4 mr-2" /> Novo Procedimento
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : !procedures?.length ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <p className="font-medium">Nenhum procedimento criado ainda.</p>
            <p className="text-sm mt-1">Crie um procedimento para agrupar ferramentas e fluxos reutilizáveis.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {procedures.map(proc => (
            <Card key={proc.id} className="flex flex-col h-full cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate(`/admin/ai-procedures/${proc.id}`)}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  {proc.name}
                </CardTitle>
                <Badge variant={proc.is_active ? 'default' : 'secondary'}>
                  {proc.is_active ? 'Ativo' : 'Inativo'}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-col flex-1">
                {proc.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{proc.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto pt-3 border-t">
                  <Badge variant="outline" className="font-normal">{proc.tools_count || 0} tools</Badge>
                  <Badge variant="outline" className="font-normal">{proc.flows_count || 0} fluxos</Badge>
                  <Badge variant="outline" className="font-normal">{proc.agents_count || 0} agentes</Badge>
                </div>
                <div className="flex justify-end gap-1 mt-3">
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); navigate(`/admin/ai-procedures/${proc.id}`); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); deleteProcedure.mutate(proc.id); }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Edit, Trash2, Copy, MoreHorizontal, Bot, Building2, Server } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { AiAgent } from '@/hooks/admin/useAiAgentTemplates';
import { AGENT_TYPES, AI_MODELS } from './constants';

interface AgentTemplateTableProps {
  agents: AiAgent[] | undefined;
  isLoading: boolean;
  onEdit: (agent: AiAgent) => void;
  onDuplicate: (agent: AiAgent) => void;
  onDelete: (agent: AiAgent) => void;
}

export function AgentTemplateTable({
  agents,
  isLoading,
  onEdit,
  onDuplicate,
  onDelete,
}: AgentTemplateTableProps) {
  const [deleteAgent, setDeleteAgent] = useState<AiAgent | null>(null);

  const getTypeLabel = (type: string) => {
    return AGENT_TYPES.find(t => t.value === type)?.label || type;
  };

  const getModelLabel = (model: string | null) => {
    if (!model) return 'GPT-4o Mini';
    return AI_MODELS.find(m => m.value === model)?.label.split(' (')[0] || model;
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!agents?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Bot className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium">Nenhum agente encontrado</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Crie seu primeiro template de agente para começar.
        </p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Modelo</TableHead>
            <TableHead>Escopo</TableHead>
            
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((agent) => (
            <TableRow key={agent.id}>
              <TableCell>
                <Avatar className="h-9 w-9">
                  <AvatarImage src={agent.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>
                <div>
                  <span className="font-medium">{agent.name}</span>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {agent.description || agent.slug}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{getTypeLabel(agent.type)}</Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {getModelLabel(agent.model)}
              </TableCell>
              <TableCell>
                <Badge 
                  variant="secondary" 
                  className={agent.scope === 'platform' 
                    ? 'bg-purple-500/10 text-purple-600' 
                    : 'bg-blue-500/10 text-blue-600'
                  }
                >
                  {agent.scope === 'platform' ? (
                    <><Server className="h-3 w-3 mr-1" /> Plataforma</>
                  ) : (
                    <><Building2 className="h-3 w-3 mr-1" /> ISPs</>
                  )}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={agent.is_active ? 'default' : 'secondary'}>
                  {agent.is_active ? 'Ativo' : 'Inativo'}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(agent)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDuplicate(agent)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setDeleteAgent(agent)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={!!deleteAgent} onOpenChange={() => setDeleteAgent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir agente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o agente "{deleteAgent?.name}"? 
              Esta ação não pode ser desfeita e afetará todos os ISPs que utilizam este template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteAgent) onDelete(deleteAgent);
                setDeleteAgent(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

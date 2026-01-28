import { useState } from 'react';
import { Edit, Trash2, ChevronUp, ChevronDown, MoreHorizontal, Shield } from 'lucide-react';
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
import type { AiSecurityClause } from '@/hooks/admin/useAiSecurityClauses';
import { APPLIES_TO_OPTIONS } from '../ai-agents/constants';

interface SecurityClauseTableProps {
  clauses: AiSecurityClause[] | undefined;
  isLoading: boolean;
  onEdit: (clause: AiSecurityClause) => void;
  onDelete: (clause: AiSecurityClause) => void;
  onReorder: (clauses: { id: string; sort_order: number }[]) => void;
}

export function SecurityClauseTable({
  clauses,
  isLoading,
  onEdit,
  onDelete,
  onReorder,
}: SecurityClauseTableProps) {
  const [deleteClause, setDeleteClause] = useState<AiSecurityClause | null>(null);

  const getAppliesToBadge = (appliesTo: string | null) => {
    const option = APPLIES_TO_OPTIONS.find(o => o.value === (appliesTo || 'all'));
    return option || APPLIES_TO_OPTIONS[0];
  };

  const handleMoveUp = (index: number) => {
    if (!clauses || index === 0) return;
    
    const newOrder = clauses.map((c, i) => ({
      id: c.id,
      sort_order: i === index ? clauses[i - 1].sort_order || 0 : 
                  i === index - 1 ? clauses[i + 1].sort_order || 0 : 
                  c.sort_order || 0,
    }));
    
    // Swap the two items
    const reordered = [
      ...newOrder.slice(0, index - 1),
      newOrder[index],
      newOrder[index - 1],
      ...newOrder.slice(index + 1),
    ].map((item, i) => ({ ...item, sort_order: i }));
    
    onReorder(reordered);
  };

  const handleMoveDown = (index: number) => {
    if (!clauses || index === clauses.length - 1) return;
    
    const newOrder = clauses.map((c, i) => ({
      id: c.id,
      sort_order: c.sort_order || 0,
    }));
    
    // Swap the two items
    const reordered = [
      ...newOrder.slice(0, index),
      newOrder[index + 1],
      newOrder[index],
      ...newOrder.slice(index + 2),
    ].map((item, i) => ({ ...item, sort_order: i }));
    
    onReorder(reordered);
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

  if (!clauses?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Shield className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium">Nenhuma cláusula encontrada</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Crie cláusulas de segurança para proteger os dados dos tenants.
        </p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">Ordem</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Aplica-se a</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clauses.map((clause, index) => {
            const appliesToBadge = getAppliesToBadge(clause.applies_to);
            
            return (
              <TableRow key={clause.id}>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <span className="w-6 text-center text-muted-foreground">
                      {(clause.sort_order ?? index) + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === clauses.length - 1}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <span className="font-medium">{clause.name}</span>
                    <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                      {clause.content.slice(0, 80)}...
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={appliesToBadge.color}>
                    {appliesToBadge.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={clause.is_active ? 'default' : 'secondary'}>
                    {clause.is_active ? 'Ativa' : 'Inativa'}
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
                      <DropdownMenuItem onClick={() => onEdit(clause)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setDeleteClause(clause)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <AlertDialog open={!!deleteClause} onOpenChange={() => setDeleteClause(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cláusula</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a cláusula "{deleteClause?.name}"? 
              Esta ação afetará a segurança de todos os agentes que utilizam esta cláusula.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteClause) onDelete(deleteClause);
                setDeleteClause(null);
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

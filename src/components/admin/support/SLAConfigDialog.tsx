import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useSLAConfigs, useUpdateSLAConfig } from '@/hooks/admin/useSupportTickets';
import { usePlans } from '@/hooks/usePlans';

interface SLAConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categoryLabels: Record<string, string> = {
  tecnico: 'Técnico',
  financeiro: 'Financeiro',
  comercial: 'Comercial',
  ouvidoria: 'Ouvidoria',
  outros: 'Outros',
};

export function SLAConfigDialog({ open, onOpenChange }: SLAConfigDialogProps) {
  const { data: configs, isLoading } = useSLAConfigs();
  const { plans } = usePlans();
  const updateSLA = useUpdateSLAConfig();
  const [selectedPlan, setSelectedPlan] = useState<string>('default');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ response: number; resolution: number }>({ 
    response: 24, 
    resolution: 72 
  });

  // Filtrar configs por plano selecionado
  const filteredConfigs = configs?.filter(c => 
    selectedPlan === 'default' ? !c.plan_id : c.plan_id === selectedPlan
  ) || [];

  const handleEdit = (config: { id: string; response_hours: number; resolution_hours: number }) => {
    setEditingId(config.id);
    setEditValues({ response: config.response_hours, resolution: config.resolution_hours });
  };

  const handleSave = (id: string) => {
    updateSLA.mutate({
      id,
      response_hours: editValues.response,
      resolution_hours: editValues.resolution,
    }, {
      onSuccess: () => setEditingId(null),
    });
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configuração de SLA</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-sm text-muted-foreground">Plano:</label>
            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecionar plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Padrão (todos)</SelectItem>
                {plans?.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredConfigs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma configuração encontrada para este plano.
              <br />
              <span className="text-sm">
                As configurações padrão serão utilizadas.
              </span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="w-[120px]">Resposta (h)</TableHead>
                  <TableHead className="w-[120px]">Resolução (h)</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConfigs.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell className="font-medium">
                      {categoryLabels[config.category] || config.category}
                    </TableCell>
                    <TableCell>
                      {editingId === config.id ? (
                        <Input
                          type="number"
                          min={1}
                          value={editValues.response}
                          onChange={(e) => setEditValues(prev => ({ 
                            ...prev, 
                            response: parseInt(e.target.value) || 1 
                          }))}
                          className="w-20"
                        />
                      ) : (
                        `${config.response_hours}h`
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === config.id ? (
                        <Input
                          type="number"
                          min={1}
                          value={editValues.resolution}
                          onChange={(e) => setEditValues(prev => ({ 
                            ...prev, 
                            resolution: parseInt(e.target.value) || 1 
                          }))}
                          className="w-20"
                        />
                      ) : (
                        `${config.resolution_hours}h`
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === config.id ? (
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            onClick={() => handleSave(config.id)}
                            disabled={updateSLA.isPending}
                          >
                            Salvar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={handleCancel}
                          >
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleEdit(config)}
                        >
                          Editar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <p className="text-xs text-muted-foreground">
            * O SLA de Resposta define o tempo máximo para a primeira resposta do suporte.
            <br />
            * O SLA de Resolução define o tempo máximo para resolver o ticket completamente.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlanTable } from '@/components/admin/plans/PlanTable';
import { PlanForm } from '@/components/admin/plans/PlanForm';
import { usePlans } from '@/hooks/usePlans';
import { Plan } from '@/types/database';

export default function PlansPage() {
  const { plans, isLoading, createPlan, updatePlan, deletePlan, isCreating, isUpdating } = usePlans();
  const [formOpen, setFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormOpen(true);
  };

  const handleClose = () => {
    setFormOpen(false);
    setEditingPlan(null);
  };

  const handleSubmit = async (data: any) => {
    if (editingPlan) {
      await updatePlan({ id: editingPlan.id, ...data });
    } else {
      await createPlan(data);
    }
    handleClose();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Planos</h1>
          <p className="text-muted-foreground">Gerencie os planos do sistema.</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      <PlanTable
        plans={plans}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={deletePlan}
      />

      <PlanForm
        plan={editingPlan}
        open={formOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
      />
    </div>
  );
}

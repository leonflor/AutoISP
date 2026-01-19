import { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import type { Isp } from '@/types/database';
import { useIsps } from '@/hooks/useIsps';
import { IspTable } from '@/components/admin/IspTable';
import { IspForm } from '@/components/admin/IspForm';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function IspsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingIsp, setEditingIsp] = useState<Isp | null>(null);

  const {
    isps,
    isLoading,
    createIsp,
    updateIsp,
    deleteIsp,
    isCreating,
    isUpdating,
    isDeleting,
  } = useIsps();

  const handleEdit = (isp: Isp) => {
    setEditingIsp(isp);
    setFormOpen(true);
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingIsp(null);
    }
  };

  const handleSubmit = async (data: {
    name: string;
    slug: string;
    document: string;
    email: string;
    phone?: string;
    status: 'ativo' | 'suspenso' | 'cancelado' | 'pendente';
  }) => {
    if (editingIsp) {
      await updateIsp({ id: editingIsp.id, ...data });
    } else {
      await createIsp(data);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Provedores (ISPs)</h1>
          <p className="text-muted-foreground">
            Gerencie os provedores de internet cadastrados no sistema.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo ISP
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <IspTable
          isps={isps}
          onEdit={handleEdit}
          onDelete={deleteIsp}
          isDeleting={isDeleting}
        />
      )}

      {/* Form Dialog */}
      <IspForm
        open={formOpen}
        onOpenChange={handleFormClose}
        isp={editingIsp}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
      />
    </div>
  );
}

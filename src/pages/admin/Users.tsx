import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { UserTable } from '@/components/admin/users/UserTable';
import { AddUserDialog } from '@/components/admin/users/AddUserDialog';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export default function UsersPage() {
  const { users, isLoading, addRole, removeRole, removeAllRoles, searchUserByEmail, isSearching } = useAdminUsers();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Usuários</h1>
          <p className="text-muted-foreground">Gerencie os administradores do sistema.</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Novo
        </Button>
      </div>

      <UserTable
        users={users}
        isLoading={isLoading}
        onAddRole={(userId, role) => addRole({ user_id: userId, role })}
        onRemoveRole={(userId, role) => removeRole({ user_id: userId, role })}
        onRemoveAllRoles={removeAllRoles}
        currentUserId={user?.id}
      />

      <AddUserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSearch={searchUserByEmail}
        onAddUser={(userId, role) => addRole({ user_id: userId, role })}
        isSearching={isSearching}
      />
    </div>
  );
}

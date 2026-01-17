import { UserTable } from '@/components/admin/users/UserTable';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useAuth } from '@/hooks/useAuth';

export default function UsersPage() {
  const { users, isLoading, addRole, removeRole } = useAdminUsers();
  const { user } = useAuth();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Usuários</h1>
        <p className="text-muted-foreground">Gerencie os administradores do sistema.</p>
      </div>

      <UserTable
        users={users}
        isLoading={isLoading}
        onAddRole={(userId, role) => addRole({ user_id: userId, role })}
        onRemoveRole={(userId, role) => removeRole({ user_id: userId, role })}
        currentUserId={user?.id}
      />
    </div>
  );
}

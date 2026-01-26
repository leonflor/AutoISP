import { useState } from 'react';
import { UserPlus, Users, Activity } from 'lucide-react';
import { UserTable } from '@/components/admin/users/UserTable';
import { AddUserDialog } from '@/components/admin/users/AddUserDialog';
import { AuditLogsTable } from '@/components/admin/users/AuditLogsTable';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function UsersPage() {
  const { users, isLoading, addRole, removeRole, removeAllRoles, inviteUser, isInviting } = useAdminUsers();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Equipe Admin</h1>
          <p className="text-muted-foreground">Gerencie administradores e visualize logs de auditoria.</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Convidar
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuários ({users.length})
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Logs de Auditoria
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <UserTable
            users={users}
            isLoading={isLoading}
            onAddRole={(userId, role) => addRole({ user_id: userId, role })}
            onRemoveRole={(userId, role) => removeRole({ user_id: userId, role })}
            onRemoveAllRoles={removeAllRoles}
            currentUserId={user?.id}
          />
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <AuditLogsTable />
        </TabsContent>
      </Tabs>

      <AddUserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onInviteUser={(email, fullName, role) => inviteUser({ email, full_name: fullName, role })}
        isInviting={isInviting}
      />
    </div>
  );
}

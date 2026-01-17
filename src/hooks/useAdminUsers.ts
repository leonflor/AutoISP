import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Profile, UserRole, AppRole } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

interface AdminUser extends Profile {
  roles: AppRole[];
}

interface UpdateUserRoleData {
  user_id: string;
  role: AppRole;
  action: 'add' | 'remove';
}

export const useAdminUsers = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // First get all user_roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Get unique user IDs with admin roles
      const adminRoles: AppRole[] = ['super_admin', 'admin', 'support', 'viewer'];
      const adminUserIds = [...new Set(
        (rolesData ?? [])
          .filter(r => adminRoles.includes(r.role as AppRole))
          .map(r => r.user_id)
      )];

      if (adminUserIds.length === 0) return [];

      // Get profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', adminUserIds);

      if (profilesError) throw profilesError;

      // Combine profiles with roles
      const users: AdminUser[] = (profilesData ?? []).map(profile => ({
        ...profile,
        roles: (rolesData ?? [])
          .filter(r => r.user_id === profile.id)
          .map(r => r.role as AppRole),
      }));

      return users;
    },
  });

  const addRoleMutation = useMutation({
    mutationFn: async ({ user_id, role }: Omit<UpdateUserRoleData, 'action'>) => {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id, role } as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: 'Permissão adicionada',
        description: 'O usuário recebeu a nova permissão.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao adicionar permissão',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: async ({ user_id, role }: Omit<UpdateUserRoleData, 'action'>) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user_id)
        .eq('role', role);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: 'Permissão removida',
        description: 'A permissão foi removida do usuário.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao remover permissão',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    users: usersQuery.data ?? [],
    superAdmins: (usersQuery.data ?? []).filter(u => u.roles.includes('super_admin')),
    isLoading: usersQuery.isLoading,
    error: usersQuery.error,
    addRole: addRoleMutation.mutateAsync,
    removeRole: removeRoleMutation.mutateAsync,
    isUpdating: addRoleMutation.isPending || removeRoleMutation.isPending,
  };
};

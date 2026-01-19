import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Profile, AppRole } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

interface AdminUser extends Profile {
  roles: AppRole[];
}

interface UpdateUserRoleData {
  user_id: string;
  role: AppRole;
}

export const useAdminUsers = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSearching, setIsSearching] = useState(false);

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

  const searchUserByEmail = async (email: string): Promise<Profile | null> => {
    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('email', email)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error searching user:', error);
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  const addRoleMutation = useMutation({
    mutationFn: async ({ user_id, role }: UpdateUserRoleData) => {
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
    mutationFn: async ({ user_id, role }: UpdateUserRoleData) => {
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

  const removeAllRolesMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: 'Administrador removido',
        description: 'Todas as permissões foram removidas do usuário.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao remover administrador',
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
    removeAllRoles: removeAllRolesMutation.mutateAsync,
    searchUserByEmail,
    isSearching,
    isUpdating: addRoleMutation.isPending || removeRoleMutation.isPending || removeAllRolesMutation.isPending,
  };
};

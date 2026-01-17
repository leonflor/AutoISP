import { useState, useEffect } from 'react';
import { useIspMembership } from '@/hooks/useIspMembership';
import { supabase } from '@/integrations/supabase/client';
import { IspMemberRole, IspUser, Profile } from '@/types/database';
import { toast } from 'sonner';

interface IspUserWithProfile extends IspUser {
  profile: Profile | null;
}

interface UseIspUsersReturn {
  users: IspUserWithProfile[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  inviteUser: (email: string, role: IspMemberRole) => Promise<boolean>;
  updateUserRole: (userId: string, role: IspMemberRole) => Promise<boolean>;
  toggleUserActive: (userId: string, isActive: boolean) => Promise<boolean>;
  removeUser: (userId: string) => Promise<boolean>;
}

export function useIspUsers(): UseIspUsersReturn {
  const { membership } = useIspMembership();
  const [users, setUsers] = useState<IspUserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    if (!membership?.ispId) {
      setUsers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('isp_users')
        .select(`
          *,
          profile:user_id (
            id,
            email,
            full_name,
            avatar_url,
            phone
          )
        `)
        .eq('isp_id', membership.ispId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Transform the data to match our interface
      const transformedData = (data || []).map((item) => ({
        ...item,
        profile: item.profile as unknown as Profile | null,
      }));

      setUsers(transformedData);
    } catch (err) {
      console.error('Error fetching ISP users:', err);
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [membership?.ispId]);

  const inviteUser = async (email: string, role: IspMemberRole): Promise<boolean> => {
    if (!membership?.ispId) return false;

    try {
      // First, check if user exists
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!existingProfile) {
        toast.error('Usuário não encontrado. O usuário precisa criar uma conta primeiro.');
        return false;
      }

      const profileId = (existingProfile as { id: string }).id;

      // Check if already a member
      const { data: existingMember, error: memberError } = await supabase
        .from('isp_users')
        .select('id')
        .eq('isp_id', membership.ispId)
        .eq('user_id', profileId)
        .maybeSingle();

      if (memberError) throw memberError;

      if (existingMember) {
        toast.error('Este usuário já é membro do provedor.');
        return false;
      }

      // Add user - using any to bypass strict typing
      const insertData = {
        isp_id: membership.ispId,
        user_id: profileId,
        role,
        is_active: true,
        invited_at: new Date().toISOString(),
      };
      const { error: insertError } = await (supabase
        .from('isp_users') as any)
        .insert(insertData);

      if (insertError) throw insertError;

      toast.success('Usuário adicionado com sucesso!');
      fetchUsers();
      return true;
    } catch (err) {
      console.error('Error inviting user:', err);
      toast.error('Erro ao adicionar usuário');
      return false;
    }
  };

  const updateUserRole = async (userId: string, role: IspMemberRole): Promise<boolean> => {
    if (!membership?.ispId) return false;

    try {
      const updateData = { role, updated_at: new Date().toISOString() };
      const { error: updateError } = await (supabase
        .from('isp_users') as any)
        .update(updateData)
        .eq('isp_id', membership.ispId)
        .eq('user_id', userId);

      if (updateError) throw updateError;

      toast.success('Papel atualizado com sucesso!');
      fetchUsers();
      return true;
    } catch (err) {
      console.error('Error updating user role:', err);
      toast.error('Erro ao atualizar papel');
      return false;
    }
  };

  const toggleUserActive = async (userId: string, isActive: boolean): Promise<boolean> => {
    if (!membership?.ispId) return false;

    try {
      const updateData = { is_active: isActive, updated_at: new Date().toISOString() };
      const { error: updateError } = await (supabase
        .from('isp_users') as any)
        .update(updateData)
        .eq('isp_id', membership.ispId)
        .eq('user_id', userId);

      if (updateError) throw updateError;

      toast.success(isActive ? 'Usuário ativado!' : 'Usuário desativado!');
      fetchUsers();
      return true;
    } catch (err) {
      console.error('Error toggling user active:', err);
      toast.error('Erro ao alterar status');
      return false;
    }
  };

  const removeUser = async (userId: string): Promise<boolean> => {
    if (!membership?.ispId) return false;

    try {
      const { error: deleteError } = await supabase
        .from('isp_users')
        .delete()
        .eq('isp_id', membership.ispId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      toast.success('Usuário removido!');
      fetchUsers();
      return true;
    } catch (err) {
      console.error('Error removing user:', err);
      toast.error('Erro ao remover usuário');
      return false;
    }
  };

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    inviteUser,
    updateUserRole,
    toggleUserActive,
    removeUser,
  };
}

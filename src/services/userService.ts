
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  role: string;
  active?: boolean | null;
  permissions?: {
    pos?: boolean;
    sales?: boolean;
    products?: boolean;
    reports?: boolean;
    users?: boolean;
  } | null;
}

// Get all users
export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch users:', error);
    toast.error('Falha ao carregar usuários');
    return [];
  }
};

// Create user
export const createUser = async (
  name: string, 
  email: string, 
  password: string,
  role: string = 'user'
): Promise<UserProfile | null> => {
  try {
    // Step 1: Create the user in Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (authError || !authData.user) {
      console.error('Error creating user:', authError);
      throw authError || new Error('User creation failed');
    }

    // Step 2: Create profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        name,
        email,
        role,
        active: true,
        permissions: {}
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error creating profile:', profileError);
      throw profileError;
    }

    return profileData;
  } catch (error: any) {
    console.error('Failed to create user:', error);
    toast.error(`Falha ao criar usuário: ${error.message}`);
    return null;
  }
};

// Delete user
export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    // We can't directly call admin.deleteUser from the client
    // Instead, we'll just delete the profile and rely on cascade
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting user:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete user:', error);
    toast.error('Falha ao excluir usuário');
    return false;
  }
};

// Update user
export const updateUser = async (id: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to update user:', error);
    toast.error('Falha ao atualizar usuário');
    return null;
  }
};

// Toggle user active status
export const toggleUserStatus = async (id: string, active: boolean): Promise<UserProfile | null> => {
  return updateUser(id, { active });
};

export const userService = {
  getAllUsers,
  createUser,
  deleteUser,
  updateUser,
  toggleUserStatus
};

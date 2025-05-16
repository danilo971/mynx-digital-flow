
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string | null;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export const userService = {
  async getAllUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Erro ao buscar usuários:', error);
        toast.error('Não foi possível carregar os usuários');
        return [];
      }

      return data || [];
    } catch (e) {
      console.error('Erro inesperado ao buscar usuários:', e);
      toast.error('Erro ao carregar usuários');
      return [];
    }
  },

  async getUserById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Erro ao buscar usuário ${id}:`, error);
        toast.error('Não foi possível carregar o usuário');
        return null;
      }

      return data;
    } catch (e) {
      console.error(`Erro inesperado ao buscar usuário ${id}:`, e);
      toast.error('Erro ao carregar o usuário');
      return null;
    }
  },

  async createUser(user: CreateUserRequest): Promise<User | null> {
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            name: user.name,
          }
        }
      });

      if (authError || !authData.user) {
        console.error('Erro ao criar usuário:', authError);
        toast.error(`Erro ao criar usuário: ${authError?.message}`);
        return null;
      }

      // 2. Create profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          name: user.name,
          email: user.email,
          role: user.role || 'user',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
        toast.error(`Erro ao criar perfil: ${profileError.message}`);
        return null;
      }

      toast.success('Usuário cadastrado com sucesso');
      return profileData;
    } catch (e) {
      console.error('Erro inesperado ao criar usuário:', e);
      toast.error('Erro ao criar usuário');
      return null;
    }
  },

  async updateUser(id: string, user: Partial<User>): Promise<User | null> {
    try {
      // Update only profile data, not auth data
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: user.name,
          role: user.role,
          avatar_url: user.avatar_url,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Erro ao atualizar usuário ${id}:`, error);
        toast.error(`Erro ao atualizar usuário: ${error.message}`);
        return null;
      }

      toast.success('Usuário atualizado com sucesso');
      return data;
    } catch (e) {
      console.error(`Erro inesperado ao atualizar usuário ${id}:`, e);
      toast.error('Erro ao atualizar usuário');
      return null;
    }
  },

  async deleteUser(id: string): Promise<boolean> {
    try {
      // Delete auth user (will cascade delete profile)
      const { error } = await supabase.auth.admin.deleteUser(id);

      if (error) {
        console.error(`Erro ao excluir usuário ${id}:`, error);
        toast.error(`Erro ao excluir usuário: ${error.message}`);
        return false;
      }

      toast.success('Usuário excluído com sucesso');
      return true;
    } catch (e) {
      console.error(`Erro inesperado ao excluir usuário ${id}:`, e);
      toast.error('Erro ao excluir usuário');
      return false;
    }
  }
};

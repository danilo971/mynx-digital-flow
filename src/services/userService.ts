
import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string | null;
  created_at?: string;
}

export const userService = {
  // Obter todos os usuários
  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Erro ao buscar usuários:', error);
      throw new Error('Não foi possível carregar os usuários');
    }

    return data || [];
  },

  // Obter um usuário pelo ID
  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Erro ao buscar usuário ${id}:`, error);
      throw new Error('Não foi possível carregar o usuário');
    }

    return data;
  },

  // Atualizar um usuário existente
  async updateUser(id: string, user: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .update(user)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Erro ao atualizar usuário ${id}:`, error);
      throw new Error('Não foi possível atualizar o usuário');
    }

    return data;
  },

  // Excluir um usuário (cuidado com esta operação!)
  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase.auth.admin.deleteUser(id);

    if (error) {
      console.error(`Erro ao excluir usuário ${id}:`, error);
      throw new Error('Não foi possível excluir o usuário');
    }
  }
};

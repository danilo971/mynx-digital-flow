
import { supabase, handleApiError } from '@/lib/supabase';
import { toast } from 'sonner';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  role: string;
  created_at?: string;
  updated_at?: string;
}

export const userService = {
  // Criar um novo usuário
  async createUser(name: string, email: string, password: string, role = 'user'): Promise<UserProfile | null> {
    try {
      console.log('Criando usuário:', { name, email, role });

      // Verificando se todos os campos obrigatórios estão presentes
      if (!name || !email || !password) {
        toast.error('Preencha todos os campos obrigatórios');
        alert('Preencha todos os campos obrigatórios');
        return null;
      }

      // Registrar o usuário no auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });

      if (authError) {
        console.error('Erro ao criar usuário:', authError);
        toast.error(`Erro ao criar usuário: ${authError.message}`);
        alert(`Erro ao criar usuário: ${authError.message}`);
        return null;
      }

      if (!authData.user) {
        console.error('Usuário não criado');
        toast.error('Não foi possível criar o usuário');
        alert('Não foi possível criar o usuário');
        return null;
      }

      // Criar perfil na tabela profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          name,
          email,
          role,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
        
        // Se for erro de tabela não existente, mostra toast específico
        if (profileError.code === '42P01') {
          toast.error('Tabela de perfis não encontrada. Por favor, crie a tabela profiles no Supabase.');
          alert('Tabela de perfis não encontrada. Por favor, crie a tabela profiles no Supabase.');
        } else {
          toast.error(`Erro ao criar perfil: ${profileError.message}`);
          alert(`Erro ao criar perfil: ${profileError.message}`);
        }
        
        // O usuário foi criado, mas o perfil não. Retorna os dados básicos.
        toast.warning('Usuário criado com sucesso, mas algumas informações podem estar incompletas.');
        return {
          id: authData.user.id,
          name,
          email,
          role,
        };
      }

      toast.success('Usuário cadastrado com sucesso');
      alert('Usuário cadastrado com sucesso');
      return profileData;
    } catch (e: any) {
      console.error('Erro inesperado ao criar usuário:', e);
      toast.error(`Erro ao criar usuário: ${e?.message || 'Erro desconhecido'}`);
      alert(`Erro ao criar usuário: ${e?.message || 'Erro desconhecido'}`);
      return null;
    }
  },

  // Listar todos os usuários
  async getAllUsers(): Promise<UserProfile[]> {
    try {
      console.log('Buscando todos os usuários...');

      // Verifica se a tabela "profiles" existe
      const { data: tablesData, error: tablesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      // Se houver erro de tabela não existente, retorna array vazio e mostra toast
      if (tablesError && tablesError.code === '42P01') {
        console.error('Tabela profiles não existe:', tablesError);
        toast.error('Tabela de perfis não encontrada. Por favor, crie a tabela profiles no Supabase.');
        
        // Retornar dados mockados para demonstração se a tabela não existir
        console.log('Retornando dados mockados para demonstração...');
        return [
          { 
            id: '1', 
            name: 'Admin User',
            email: 'admin@example.com',
            avatar_url: 'https://ui-avatars.com/api/?name=Admin+User&background=8B5CF6&color=fff',
            role: 'admin',
          },
          { 
            id: '2', 
            name: 'Demo User',
            email: 'demo@example.com',
            avatar_url: 'https://ui-avatars.com/api/?name=Demo+User&background=8B5CF6&color=fff',
            role: 'user',
          },
        ];
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

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

  // Obter usuário por ID
  async getUserById(id: string): Promise<UserProfile | null> {
    try {
      console.log(`Buscando usuário ${id}...`);
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

  // Atualizar usuário
  async updateUser(id: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      console.log(`Atualizando usuário ${id}:`, updates);
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Erro ao atualizar usuário ${id}:`, error);
        toast.error(`Erro ao atualizar usuário: ${error.message}`);
        alert(`Erro ao atualizar usuário: ${error.message}`);
        return null;
      }

      toast.success('Usuário atualizado com sucesso');
      return data;
    } catch (e: any) {
      console.error(`Erro inesperado ao atualizar usuário ${id}:`, e);
      toast.error(`Erro ao atualizar usuário: ${e?.message || 'Erro desconhecido'}`);
      return null;
    }
  },

  // Excluir usuário
  async deleteUser(id: string): Promise<boolean> {
    try {
      console.log(`Excluindo usuário ${id}...`);
      
      // Excluir o perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (profileError) {
        console.error(`Erro ao excluir perfil ${id}:`, profileError);
        toast.error(`Erro ao excluir usuário: ${profileError.message}`);
        alert(`Erro ao excluir usuário: ${profileError.message}`);
        return false;
      }
      
      // NOTA: A exclusão do usuário da auth requer uma função de admin no backend.
      // Para uma implementação completa, seria necessário criar uma edge function
      // que utiliza o admin client para excluir o usuário.
      // Por ora, apenas excluímos o perfil.

      toast.success('Usuário excluído com sucesso');
      return true;
    } catch (e: any) {
      console.error(`Erro inesperado ao excluir usuário ${id}:`, e);
      toast.error(`Erro ao excluir usuário: ${e?.message || 'Erro desconhecido'}`);
      return false;
    }
  }
};

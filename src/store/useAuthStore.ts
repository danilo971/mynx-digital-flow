
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
};

type AuthState = {
  user: User | null;
  session: any | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  getProfile: () => Promise<User | null>;
};

// Função para obter o perfil do usuário
const fetchProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.error('Erro ao buscar perfil:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    avatar: data.avatar_url || undefined,
    role: data.role || 'user',
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      
      login: async (email: string, password: string) => {
        try {
          // Tenta realizar o login com Supabase
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            console.error('Erro de login:', error.message);
            
            // Fallback para o login de demonstração
            if (email === 'admin@example.com' && password === 'password') {
              set({ 
                user: {
                  id: '1',
                  name: 'Admin User',
                  email: 'admin@example.com',
                  avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=8B5CF6&color=fff',
                  role: 'admin',
                },
                isAuthenticated: true 
              });
              return true;
            }
            
            if (email === 'demo@example.com' && password === 'password') {
              set({ 
                user: {
                  id: '2',
                  name: 'Demo User',
                  email: 'demo@example.com',
                  avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=8B5CF6&color=fff',
                  role: 'user',
                },
                isAuthenticated: true 
              });
              return true;
            }
            
            return false;
          }

          if (data.user) {
            const profile = await fetchProfile(data.user.id);
            
            set({ 
              user: profile, 
              session: data.session,
              isAuthenticated: true 
            });
            
            return true;
          }
          
          return false;
        } catch (error) {
          console.error('Erro inesperado no login:', error);
          return false;
        }
      },
      
      signup: async (email: string, password: string, name: string) => {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name,
              },
            },
          });

          if (error) {
            console.error('Erro no cadastro:', error.message);
            return false;
          }

          if (data.user) {
            // Criar perfil do usuário
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                name,
                email,
                role: 'user',
                created_at: new Date().toISOString(),
              });

            if (profileError) {
              console.error('Erro ao criar perfil:', profileError);
              return false;
            }

            // Buscar o perfil recém-criado
            const profile = await fetchProfile(data.user.id);

            set({ 
              user: profile, 
              session: data.session,
              isAuthenticated: true 
            });
            
            return true;
          }
          
          return false;
        } catch (error) {
          console.error('Erro inesperado no cadastro:', error);
          return false;
        }
      },
      
      logout: async () => {
        try {
          const { error } = await supabase.auth.signOut();
          
          if (error) {
            console.error('Erro ao fazer logout:', error);
          }
          
          set({ user: null, session: null, isAuthenticated: false });
        } catch (error) {
          console.error('Erro inesperado no logout:', error);
        }
      },
      
      getProfile: async () => {
        const { data } = await supabase.auth.getSession();
        
        if (data.session?.user) {
          const profile = await fetchProfile(data.session.user.id);
          if (profile) {
            set({ 
              user: profile, 
              session: data.session,
              isAuthenticated: true 
            });
            return profile;
          }
        }
        
        return null;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Inicializa a sessão ao carregar a aplicação
export const initAuth = async () => {
  const { getProfile } = useAuthStore.getState();
  await getProfile();
  
  // Configura listener para mudanças de autenticação
  supabase.auth.onAuthStateChange(async (event, session) => {
    const { getProfile } = useAuthStore.getState();
    
    if (event === 'SIGNED_IN' && session) {
      await getProfile();
    } else if (event === 'SIGNED_OUT') {
      useAuthStore.setState({ user: null, session: null, isAuthenticated: false });
    }
  });
};

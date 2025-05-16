
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

type User = {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  role: string;
};

type AuthState = {
  user: User | null;
  session: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  getProfile: () => Promise<User | null>;
};

// Função para obter o perfil do usuário
const fetchProfile = async (userId: string) => {
  try {
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
      avatar_url: data.avatar_url,
      role: data.role || 'user',
    };
  } catch (error) {
    console.error('Erro inesperado ao buscar perfil:', error);
    return null;
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: true,
      
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
                  avatar_url: 'https://ui-avatars.com/api/?name=Admin+User&background=8B5CF6&color=fff',
                  role: 'admin',
                },
                isAuthenticated: true,
                isLoading: false,
              });
              toast.success('Login bem-sucedido como administrador (modo demo)');
              return true;
            }
            
            if (email === 'demo@example.com' && password === 'password') {
              set({ 
                user: {
                  id: '2',
                  name: 'Demo User',
                  email: 'demo@example.com',
                  avatar_url: 'https://ui-avatars.com/api/?name=Demo+User&background=8B5CF6&color=fff',
                  role: 'user',
                },
                isAuthenticated: true,
                isLoading: false,
              });
              toast.success('Login bem-sucedido como usuário (modo demo)');
              return true;
            }
            
            toast.error('Email ou senha incorretos');
            return false;
          }

          if (data.user) {
            const profile = await fetchProfile(data.user.id);
            
            if (!profile) {
              toast.error('Erro ao carregar perfil do usuário');
              return false;
            }
            
            set({ 
              user: profile, 
              session: data.session,
              isAuthenticated: true,
              isLoading: false,
            });
            
            toast.success(`Bem-vindo, ${profile.name}!`);
            return true;
          }
          
          toast.error('Erro ao processar login');
          return false;
        } catch (error) {
          console.error('Erro inesperado no login:', error);
          toast.error('Ocorreu um erro durante o login');
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
            toast.error(`Erro no cadastro: ${error.message}`);
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
              toast.error(`Erro ao criar perfil: ${profileError.message}`);
              return false;
            }

            // Buscar o perfil recém-criado
            const profile = await fetchProfile(data.user.id);

            if (!profile) {
              toast.error('Erro ao carregar perfil do usuário');
              return false;
            }

            set({ 
              user: profile, 
              session: data.session,
              isAuthenticated: true,
              isLoading: false,
            });
            
            toast.success('Conta criada com sucesso!');
            return true;
          }
          
          toast.error('Erro ao processar cadastro');
          return false;
        } catch (error) {
          console.error('Erro inesperado no cadastro:', error);
          toast.error('Ocorreu um erro durante o cadastro');
          return false;
        }
      },
      
      logout: async () => {
        try {
          set({ isLoading: true });
          const { error } = await supabase.auth.signOut();
          
          if (error) {
            console.error('Erro ao fazer logout:', error);
            toast.error(`Erro ao fazer logout: ${error.message}`);
          } else {
            toast.success('Logout realizado com sucesso');
          }
          
          set({ user: null, session: null, isAuthenticated: false, isLoading: false });
        } catch (error) {
          console.error('Erro inesperado no logout:', error);
          toast.error('Ocorreu um erro durante o logout');
          set({ isLoading: false });
        }
      },
      
      getProfile: async () => {
        try {
          set({ isLoading: true });
          const { data } = await supabase.auth.getSession();
          
          if (data.session?.user) {
            const profile = await fetchProfile(data.session.user.id);
            if (profile) {
              set({ 
                user: profile, 
                session: data.session,
                isAuthenticated: true,
                isLoading: false,
              });
              return profile;
            }
          }
          
          set({ isLoading: false });
          return null;
        } catch (error) {
          console.error('Erro ao carregar perfil:', error);
          set({ isLoading: false });
          return null;
        }
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
      // Use setTimeout to avoid potential deadlocks
      setTimeout(async () => {
        await getProfile();
      }, 0);
    } else if (event === 'SIGNED_OUT') {
      useAuthStore.setState({ user: null, session: null, isAuthenticated: false });
    }
  });
};

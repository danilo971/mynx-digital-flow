
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
    console.log('Buscando perfil do usuário:', userId);
    
    // Primeiro, tentamos buscar o perfil da tabela profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Se houver erro (possivelmente porque a tabela não existe)
    if (error) {
      console.error('Erro ao buscar perfil:', error);
      
      // Tentamos buscar os metadados do usuário diretamente do auth
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        console.error('Erro ao buscar dados do usuário:', userError);
        return null;
      }
      
      // Usar os metadados do usuário como fallback
      const metadata = userData.user.user_metadata;
      return {
        id: userData.user.id,
        name: metadata?.name || userData.user.email?.split('@')[0] || 'Usuário',
        email: userData.user.email || '',
        avatar_url: metadata?.avatar_url || null,
        role: metadata?.role || 'user',
      };
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
          console.log('Tentando login:', email);
          
          // Validar campos
          if (!email || !password) {
            toast.error('Por favor, preencha todos os campos');
            return false;
          }
          
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
              alert('Login bem-sucedido como administrador (modo demo)');
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
              alert('Login bem-sucedido como usuário (modo demo)');
              return true;
            }
            
            toast.error('Email ou senha incorretos');
            alert('Email ou senha incorretos');
            return false;
          }

          if (data.user) {
            const profile = await fetchProfile(data.user.id);
            
            if (!profile) {
              toast.error('Erro ao carregar perfil do usuário');
              alert('Erro ao carregar perfil do usuário');
              return false;
            }
            
            set({ 
              user: profile, 
              session: data.session,
              isAuthenticated: true,
              isLoading: false,
            });
            
            toast.success(`Bem-vindo, ${profile.name}!`);
            alert(`Bem-vindo, ${profile.name}!`);
            return true;
          }
          
          toast.error('Erro ao processar login');
          alert('Erro ao processar login');
          return false;
        } catch (error: any) {
          console.error('Erro inesperado no login:', error);
          toast.error(`Ocorreu um erro durante o login: ${error?.message || 'Erro desconhecido'}`);
          alert(`Ocorreu um erro durante o login: ${error?.message || 'Erro desconhecido'}`);
          return false;
        }
      },
      
      signup: async (email: string, password: string, name: string) => {
        try {
          console.log('Tentando cadastro:', { email, name });
          
          // Validar campos
          if (!email || !password || !name) {
            toast.error('Por favor, preencha todos os campos');
            alert('Por favor, preencha todos os campos');
            return false;
          }
          
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
            alert(`Erro no cadastro: ${error.message}`);
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
              // Se a tabela não existir, apenas mostra a mensagem
              if (profileError.code === '42P01') {
                console.error('Tabela profiles não existe:', profileError);
                toast.warning('Tabela de perfis não encontrada. Usuário criado, mas algumas funcionalidades podem estar limitadas.');
                alert('Tabela de perfis não encontrada. Usuário criado, mas algumas funcionalidades podem estar limitadas.');
              } else {
                console.error('Erro ao criar perfil:', profileError);
                toast.error(`Erro ao criar perfil: ${profileError.message}`);
                alert(`Erro ao criar perfil: ${profileError.message}`);
              }
            }

            // Após o cadastro, vamos buscar o perfil (ou criar um objeto básico se necessário)
            const profile = await fetchProfile(data.user.id) || {
              id: data.user.id,
              name,
              email,
              role: 'user',
            };

            set({ 
              user: profile, 
              session: data.session,
              isAuthenticated: true,
              isLoading: false,
            });
            
            toast.success('Conta criada com sucesso!');
            alert('Conta criada com sucesso!');
            return true;
          }
          
          toast.error('Erro ao processar cadastro');
          alert('Erro ao processar cadastro');
          return false;
        } catch (error: any) {
          console.error('Erro inesperado no cadastro:', error);
          toast.error(`Ocorreu um erro durante o cadastro: ${error?.message || 'Erro desconhecido'}`);
          alert(`Ocorreu um erro durante o cadastro: ${error?.message || 'Erro desconhecido'}`);
          return false;
        }
      },
      
      logout: async () => {
        try {
          console.log('Fazendo logout...');
          set({ isLoading: true });
          const { error } = await supabase.auth.signOut();
          
          if (error) {
            console.error('Erro ao fazer logout:', error);
            toast.error(`Erro ao fazer logout: ${error.message}`);
            alert(`Erro ao fazer logout: ${error.message}`);
          } else {
            toast.success('Logout realizado com sucesso');
            alert('Logout realizado com sucesso');
          }
          
          set({ user: null, session: null, isAuthenticated: false, isLoading: false });
        } catch (error: any) {
          console.error('Erro inesperado no logout:', error);
          toast.error(`Ocorreu um erro durante o logout: ${error?.message || 'Erro desconhecido'}`);
          alert(`Ocorreu um erro durante o logout: ${error?.message || 'Erro desconhecido'}`);
          set({ isLoading: false });
        }
      },
      
      getProfile: async () => {
        try {
          console.log('Obtendo perfil do usuário...');
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
        } catch (error: any) {
          console.error('Erro ao carregar perfil:', error);
          toast.error(`Erro ao carregar perfil: ${error?.message || 'Erro desconhecido'}`);
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
  console.log('Inicializando autenticação...');
  const { getProfile } = useAuthStore.getState();
  await getProfile();
  
  // Configura listener para mudanças de autenticação
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Evento de autenticação:', event);
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

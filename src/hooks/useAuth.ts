
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useTenantStore } from '@/store/useTenantStore';
import { useSupabase } from '@/hooks/useSupabase';

export interface UserWithAvatar {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  avatar_url?: string | null;
  role?: string;
  active?: boolean | null;
  permissions?: {
    pos?: boolean;
    sales?: boolean;
    products?: boolean;
    reports?: boolean;
    users?: boolean;
  };
}

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    isSystemAdmin,
    login,
    logout,
    signup,
    getProfile
  } = useAuthStore();
  
  const { currentTenant, tenants, fetchTenants } = useTenantStore();
  
  const [profile, setProfile] = useState<UserWithAvatar | null>(null);
  const navigate = useNavigate();
  const { isTenantConnection } = useSupabase();

  // Transform the user into a format with avatar property for compatibility
  useEffect(() => {
    if (user) {
      setProfile({
        ...user,
        avatar: user.avatar_url // Add avatar property for backward compatibility
      });
    } else {
      setProfile(null);
    }
  }, [user]);

  const handleLogin = async (email: string, password: string) => {
    const success = await login(email, password);
    if (success) {
      // After login, fetch tenants
      await fetchTenants();
      navigate('/');
    }
    return success;
  };

  const handleSignup = async (email: string, password: string, name: string) => {
    const success = await signup(email, password, name);
    if (success) {
      navigate('/');
    }
    return success;
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return {
    user: profile,
    isAuthenticated,
    isLoading,
    isSystemAdmin,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
    getProfile,
    currentTenant,
    hasTenants: tenants.length > 0,
    isTenantConnection,
  };
}

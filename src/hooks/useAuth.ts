
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

export interface UserWithAvatar {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  avatar_url?: string | null;
  role?: string;
}

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    signup,
    getProfile
  } = useAuthStore();
  
  const [profile, setProfile] = useState<UserWithAvatar | null>(null);
  const navigate = useNavigate();

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
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
    getProfile,
  };
}

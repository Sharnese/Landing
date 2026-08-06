import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Admin = {
  id: string;
  auth_user_id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  first_login?: boolean;
  // kept for backward-compat with components reading this flag
  must_change_password?: boolean;
};

type Ctx = {
  admin: Admin | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const AdminAuthContext = createContext<Ctx>({} as Ctx);
export const useAdminAuth = () => useContext(AdminAuthContext);

function mapProfile(p: any): Admin {
  return {
    id: p.id,
    auth_user_id: p.auth_user_id,
    email: p.email,
    name: p.full_name || p.email,
    role: p.role,
    status: p.status,
    first_login: p.first_login,
    must_change_password: p.first_login,
  };
}

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (authUserId: string): Promise<Admin | null> => {
    const { data, error } = await supabase
      .from('admin_profiles')
      .select('*')
      .eq('auth_user_id', authUserId)
      .maybeSingle();
    if (error || !data) return null;
    return mapProfile(data);
  };

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await loadProfile(session.user.id);
        if (mounted && profile && profile.status === 'Active') {
          setAdmin(profile);
          localStorage.setItem('mq_admin', JSON.stringify(profile));
        }
      }
      if (mounted) setLoading(false);
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setAdmin(null);
        localStorage.removeItem('mq_admin');
      }
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const cleanEmail = email.trim();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });
    if (error) {
      // Surface the real Supabase auth error so the cause is clear.
      return error.message || 'Unable to sign in. Please try again.';
    }
    const user = data.user;
    if (!user) return 'Unable to sign in. Please try again.';

    const profile = await loadProfile(user.id);
    if (!profile) {
      await supabase.auth.signOut();
      return 'Admin profile exists issue: auth user found, but no admin profile is linked.';
    }
    if (profile.status !== 'Active') {
      await supabase.auth.signOut();
      return 'Admin account is not active.';
    }
    setAdmin(profile);
    localStorage.setItem('mq_admin', JSON.stringify(profile));
    return null;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setAdmin(null);
    localStorage.removeItem('mq_admin');
  };

  const refresh = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    const profile = await loadProfile(session.user.id);
    if (profile) {
      setAdmin(profile);
      localStorage.setItem('mq_admin', JSON.stringify(profile));
    }
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout, refresh }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

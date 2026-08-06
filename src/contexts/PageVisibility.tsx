import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { DEFAULT_VISIBILITY } from '@/lib/pageSettings';

type Ctx = {
  loading: boolean;
  isVisible: (key: string) => boolean;
  refresh: () => Promise<void>;
};

const PageVisibilityContext = createContext<Ctx>({
  loading: true,
  isVisible: (key: string) => DEFAULT_VISIBILITY[key] ?? true,
  refresh: async () => {},
});

export const usePageVisibility = () => useContext(PageVisibilityContext);

export const PageVisibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [map, setMap] = useState<Record<string, boolean>>(DEFAULT_VISIBILITY);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data, error } = await supabase.from('mq_page_settings').select('key, visible');
    if (!error && data) {
      const next: Record<string, boolean> = { ...DEFAULT_VISIBILITY };
      data.forEach((row: any) => { next[row.key] = row.visible; });
      setMap(next);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <PageVisibilityContext.Provider
      value={{
        loading,
        isVisible: (key: string) => map[key] ?? true,
        refresh: load,
      }}
    >
      {children}
    </PageVisibilityContext.Provider>
  );
};

// Wraps a route's element. If the page is toggled off, sends visitors home
// instead of rendering it — used for pages like Learning Center and Pricing
// that the admin can turn on/off from Admin → Page Visibility.
export const GatedPage: React.FC<{ pageKey: string; children: React.ReactNode }> = ({ pageKey, children }) => {
  const { loading, isVisible } = usePageVisibility();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Loading…</div>;
  if (!isVisible(pageKey)) {
    if (typeof window !== 'undefined') window.location.replace('/');
    return null;
  }
  return <>{children}</>;
};

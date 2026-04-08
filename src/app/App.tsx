import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { OSControl } from '../features/settings/OSControl';
import { useAppStore } from '../store/useAppStore';
import { isSupabaseConfigured, supabase, supabaseConfigError } from '../services/supabase';

const Auth = lazy(() => import('../features/auth/Auth').then((m) => ({ default: m.Auth })));
const Notifications = lazy(() => import('../features/notifications/Notifications').then((m) => ({ default: m.Notifications })));

function LoadingScreen({ message = "Initializing Link..." }) {
  return (
    <div className="h-screen w-full bg-[#050505] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
        <p className="text-red-500 animate-pulse text-[10px] tracking-[0.3em] uppercase font-black">
          {message}
        </p>
      </div>
    </div>
  );
}

function ConfigurationScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] p-6 text-slate-200">
      <div className="w-full max-w-2xl rounded-[2rem] border border-red-500/20 bg-black/70 p-10 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
        <div className="mb-8 flex items-center gap-4">
          <div className="rounded-2xl bg-red-600/15 p-4">
            <ShieldAlert size={28} className="text-red-500" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white">Configuration Required</h1>
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.35em] text-red-400">
              Supabase Link Not Initialized
            </p>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-slate-400">
          COMMAND.OS now reads its Supabase connection from Vite environment variables instead of hardcoded values.
        </p>

        <div className="mt-8 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Required Variables</p>
          <div className="mt-4 space-y-3 font-mono text-sm text-white">
            <div>VITE_SUPABASE_URL</div>
            <div>VITE_SUPABASE_ANON_KEY</div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">Quick Start</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Copy `.env.example` to `.env.local`, add your Supabase project values, and restart the dev server.
          </p>
        </div>

        {supabaseConfigError && (
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-red-400">
            {supabaseConfigError}
          </p>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, setAuthenticated } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let isMounted = true;

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      setAuthenticated(!!session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setAuthenticated(!!session);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [setAuthenticated]);

  if (!isSupabaseConfigured || !supabase) {
    return <ConfigurationScreen />;
  }

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<LoadingScreen message="Establishing Auth Link..." />}>
        <Auth />
      </Suspense>
    );
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen message="Optimizing Module Graph..." />}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<DashboardLayout tabId="command" />} />
            <Route path="market" element={<DashboardLayout tabId="market" />} />
            <Route path="physical" element={<DashboardLayout tabId="physical" />} />
            <Route path="english" element={<DashboardLayout tabId="english" />} />
            <Route path="habits" element={<DashboardLayout tabId="habits" />} />
            <Route path="focus" element={<DashboardLayout tabId="focus" />} />
            <Route path="goals" element={<DashboardLayout tabId="goals" />} />
            <Route path="journal" element={<DashboardLayout tabId="journal" />} />
            <Route path="settings" element={<OSControl />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

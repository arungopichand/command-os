import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { GlassCard } from '../components/ui/GlassCard';
import { OSControl } from '../features/settings/OSControl';
import { useAppStore } from '../store/useAppStore';
import { isSupabaseConfigured, supabase, supabaseConfigError } from '../services/supabase';

const Auth = lazy(() => import('../features/auth/Auth').then((m) => ({ default: m.Auth })));
const Notifications = lazy(() => import('../features/notifications/Notifications').then((m) => ({ default: m.Notifications })));
const AUTH_BOOT_TIMEOUT_MS = 8000;

function LoadingScreen({ message = "Initializing Link..." }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--shell-bg)] px-6">
      <GlassCard className="w-full max-w-md p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[24px] border border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.14)]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/12 border-t-[var(--shell-brand)]" />
        </div>
        <p className="section-eyebrow mt-6">Boot Sequence</p>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          {message}
        </p>
      </GlassCard>
    </div>
  );
}

function ConfigurationScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--shell-bg)] p-6 text-slate-200">
      <GlassCard className="w-full max-w-2xl p-8 sm:p-10">
        <div className="mb-8 flex items-center gap-4">
          <div className="rounded-2xl border border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.14)] p-4">
            <ShieldAlert size={28} className="text-[color:var(--shell-brand)]" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-[-0.05em] text-white">Configuration required</h1>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--shell-brand)]">
              Supabase Link Not Initialized
            </p>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-slate-400">
          COMMAND.OS now reads its Supabase connection from Vite environment variables instead of hardcoded values.
        </p>

        <div className="mt-8 rounded-[24px] border border-white/8 bg-white/[0.03] p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">Required Variables</p>
          <div className="mt-4 space-y-3 font-mono text-sm text-white">
            <div>VITE_SUPABASE_URL</div>
            <div>VITE_SUPABASE_ANON_KEY</div>
          </div>
        </div>

        <div className="mt-8 rounded-[24px] border border-amber-500/18 bg-amber-500/10 p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-300">Quick Start</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Copy `.env.example` to `.env.local`, add your Supabase project values, and restart the dev server.
          </p>
        </div>

        {supabaseConfigError && (
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-red-400">
            {supabaseConfigError}
          </p>
        )}
      </GlassCard>
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
    const authBootstrapTimeout = window.setTimeout(() => {
      if (!isMounted) {
        return;
      }

      console.warn('Auth session bootstrap timed out. Falling back to the signed-out surface.');
      setAuthenticated(false);
      setLoading(false);
    }, AUTH_BOOT_TIMEOUT_MS);

    void supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!isMounted) {
          return;
        }

        setAuthenticated(!!session);
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        console.error('Unable to initialize auth session.', error);
        setAuthenticated(false);
      })
      .finally(() => {
        if (!isMounted) {
          return;
        }

        window.clearTimeout(authBootstrapTimeout);
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setAuthenticated(!!session);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      window.clearTimeout(authBootstrapTimeout);
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

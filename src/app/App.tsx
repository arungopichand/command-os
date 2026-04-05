import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { OSControl } from '../features/settings/OSControl';

// Lazy Loading for Specialized Tactical Modes (Non-Widget)
const Auth = lazy(() => import('../features/auth/Auth').then(m => ({ default: m.Auth })));
const Notifications = lazy(() => import('../features/notifications/Notifications').then(m => ({ default: m.Notifications })));

// Initial Feature Set (Migrated to Widget System)
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../services/supabase';

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

export default function App() {
  const { isAuthenticated, setAuthenticated } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthenticated(!!session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, [setAuthenticated]);

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
            {/* Universal Customizable Dashboards (9 Core Tabs) */}
            <Route index element={<DashboardLayout tabId="command" />} />
            <Route path="market" element={<DashboardLayout tabId="market" />} />
            <Route path="physical" element={<DashboardLayout tabId="physical" />} />
            <Route path="english" element={<DashboardLayout tabId="english" />} />
            <Route path="habits" element={<DashboardLayout tabId="habits" />} />
            <Route path="focus" element={<DashboardLayout tabId="focus" />} />
            <Route path="goals" element={<DashboardLayout tabId="goals" />} />
            <Route path="journal" element={<DashboardLayout tabId="journal" />} />
            
            {/* Tactical Special Features */}
            <Route path="settings" element={<OSControl />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { WarRoom } from './modules/WarRoom';
import { HabitMatrix } from './modules/HabitMatrix';
import { EnglishTimer } from './modules/EnglishTimer';
import { Meals } from './modules/Meals';
import { Manifestation } from './modules/Manifestation';
import { Project360 } from './modules/Project360';
import { Learning } from './modules/Learning';
import { CustomSandbox } from './modules/CustomSandbox';
import { Auth } from './modules/Auth';
import { supabase } from './lib/supabase';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="h-screen w-full bg-[#050505] flex items-center justify-center"><p className="text-red-500 animate-pulse text-xs tracking-[0.2em] uppercase font-black">Initializing Database...</p></div>;

  if (!isAuthenticated) return <Auth onAuthenticated={() => setIsAuthenticated(true)} />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<WarRoom />} />
          <Route path="habits" element={<HabitMatrix />} />
          <Route path="english" element={<EnglishTimer />} />
          <Route path="meals" element={<Meals />} />
          <Route path="manifestation" element={<Manifestation />} />
          <Route path="360" element={<Project360 />} />
          <Route path="learning" element={<Learning />} />
          <Route path="sandbox" element={<CustomSandbox />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

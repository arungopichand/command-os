import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldAlert, Zap } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { GlassCard } from '../../components/ui/GlassCard';
import { useAppStore } from '../../store/useAppStore';

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string') {
      return message;
    }
  }

  return "AUTHENTICATION FAULT: CONNECTION REFUSED";
}

export function Auth() {
  const { setAuthenticated } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supabase) {
      setErrorMsg('SUPABASE CONFIGURATION REQUIRED');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setAuthenticated(true);
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        const { error: signError } = await supabase.auth.signInWithPassword({ email, password });
        if (!signError) setAuthenticated(true);
      }
    } catch (error) {
      setErrorMsg(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--shell-bg)] p-6 font-sans">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(76,106,255,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(240,90,61,0.14),transparent_22%),linear-gradient(180deg,#081018_0%,#060b10_44%,#04070b_100%)]" />
        <div className="absolute left-[12%] top-[18%] h-80 w-80 rounded-full bg-[rgba(240,90,61,0.14)] blur-[120px]" />
        <div className="absolute bottom-[10%] right-[12%] h-80 w-80 rounded-full bg-[rgba(76,106,255,0.1)] blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full relative z-10"
      >
        <GlassCard className="flex flex-col items-center p-8 sm:p-10">
          <div className="relative mb-8 rounded-[28px] border border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.14)] p-5 shadow-[0_20px_40px_rgba(240,90,61,0.14)]">
            <Lock size={36} className="relative z-10 text-[color:var(--shell-brand)]" />
          </div>

          <div className="mb-10 text-center">
            <p className="section-eyebrow">Authorization</p>
            <h1 className="mt-3 font-display text-5xl font-bold tracking-[-0.07em] text-white">
              COMMAND.OS
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Sign in to return to the command surface, or create the first account for this install.
            </p>
          </div>

          <form onSubmit={handleAuth} className="w-full space-y-5">
            <div className="space-y-1">
              <label className="ml-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Email</label>
              <input
                type="email"
                placeholder="name@command.os"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-surface"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="ml-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Password</label>
              <input
                type="password"
                placeholder="************"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-surface"
                required
              />
            </div>

            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 rounded-[22px] border border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.1)] p-4"
                >
                  <ShieldAlert size={16} className="shrink-0 text-[color:var(--shell-brand)]" />
                  <p className="text-[11px] font-semibold leading-tight text-slate-200">
                    {errorMsg}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              disabled={loading}
              type="submit"
              className="primary-action mt-2 w-full justify-center py-4 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Zap size={18} fill="currentColor" />
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                </>
              )}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMsg('');
            }}
            className="mt-8 text-sm font-semibold text-slate-400 transition-colors hover:text-white"
          >
            {isLogin ? 'No account yet? Create one.' : 'Already have an account? Sign in.'}
          </button>
        </GlassCard>

        <p className="mt-6 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
          Secure local workspace
        </p>
      </motion.div>
    </div>
  );
}

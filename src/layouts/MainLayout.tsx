import { useState, useCallback, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle,
  Droplets,
  EyeOff,
  Menu,
  Shield,
  ShieldAlert,
  Sparkles,
  Wind,
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useFocus } from '../features/focus/useFocus';
import { useAppStore } from '../store/useAppStore';

const STATEMENTS = [
  'I KEEP PROMISES TO MYSELF.',
  'NO ZERO DAYS. EVER.',
  'DISCIPLINE EQUALS FREEDOM.',
  'BUILD. SURVIVE. RECOVER.',
  'I AM AN ARCHITECT OF MY DESTINY.',
];

const PAGE_LABELS: Record<string, string> = {
  '/': 'Command Center',
  '/market': 'Market Command',
  '/physical': 'Physical Ops',
  '/english': 'Language Lab',
  '/habits': 'Discipline Engine',
  '/focus': 'Deep Work',
  '/goals': 'Mission Planning',
  '/journal': 'After Action Log',
  '/settings': 'OS Control',
  '/notifications': 'Alerts',
};

const TOAST_STYLES = {
  success: 'border-emerald-500/18 bg-[rgba(17,34,26,0.92)] text-emerald-200',
  error: 'border-[rgba(240,90,61,0.24)] bg-[rgba(31,16,14,0.94)] text-[color:var(--shell-copy)]',
  warning: 'border-amber-500/18 bg-[rgba(36,28,14,0.92)] text-amber-200',
} as const;

export type ToastType = 'success' | 'error' | 'warning';
export type ShowToastFn = (msg: string, type?: ToastType) => void;

interface Toast {
  id: number;
  msg: string;
  type: ToastType;
}

export function MainLayout() {
  const location = useLocation();
  const { identityIndex } = useAppStore();
  const { isFocusModeEnabled, toggleFocusMode } = useFocus();
  const [isEmergency, setIsEmergency] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const pageLabel = PAGE_LABELS[location.pathname] ?? 'COMMAND.OS';

  const showToast = useCallback((msg: string, type: ToastType = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== id)), 3500);
  }, []);

  useEffect(() => {
    const handleEmergency = () => setIsEmergency(true);
    window.addEventListener('emergency-override', handleEmergency);
    return () => window.removeEventListener('emergency-override', handleEmergency);
  }, []);

  return (
    <div
      className={`relative flex min-h-screen w-full overflow-hidden text-slate-200 transition-colors duration-700 ${
        isFocusModeEnabled ? 'bg-black' : 'bg-[var(--shell-bg)]'
      }`}
    >
      <div className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${isFocusModeEnabled ? 'opacity-40' : 'opacity-100'}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(75,123,236,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(240,90,61,0.12),transparent_24%),linear-gradient(180deg,#081018_0%,#060b10_44%,#04070b_100%)]" />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
        <div className="absolute inset-y-0 left-[18%] w-[28rem] bg-[radial-gradient(circle,rgba(240,90,61,0.12)_0%,transparent_72%)] blur-[120px]" />
        <div className="absolute right-[10%] top-[10%] h-72 w-72 rounded-full bg-[rgba(76,106,255,0.08)] blur-[120px]" />
      </div>

      <AnimatePresence>
        {isFocusModeEnabled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-[100] border-[8px] border-amber-500/12 shadow-[inset_0_0_90px_rgba(245,158,11,0.06)]"
          >
            <button
              type="button"
              onClick={toggleFocusMode}
              className="pointer-events-auto absolute left-4 right-4 top-20 inline-flex items-center justify-center gap-3 rounded-full border border-amber-400/18 bg-[rgba(245,158,11,0.92)] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.28em] text-black shadow-[0_18px_40px_rgba(245,158,11,0.28)] sm:left-auto sm:right-6 sm:top-6"
            >
              <EyeOff size={14} />
              Focus Mode Active
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/72 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <Sidebar mobileOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />

      <main
        className={`relative min-w-0 flex-1 overflow-y-auto overflow-x-hidden pb-28 pt-24 transition-all duration-500 custom-scrollbar lg:pt-10 ${
          isFocusModeEnabled ? 'px-4 sm:px-6 lg:px-10' : 'px-4 sm:px-6 lg:px-12'
        }`}
      >
        <div className="fixed left-0 right-0 top-0 z-30 px-4 py-4 lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-[24px] border border-white/8 bg-[rgba(8,13,20,0.78)] px-4 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="inline-flex items-center justify-center rounded-2xl border border-white/8 bg-white/[0.04] p-3 text-slate-100 transition-colors hover:bg-white/[0.08]"
            >
              <Menu size={18} />
            </button>

            <div className="min-w-0 text-center">
              <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-[color:var(--shell-brand)]">
                <Shield size={12} />
                COMMAND.OS
              </div>
              <p className="mt-1 truncate text-sm font-semibold tracking-[-0.02em] text-white">{pageLabel}</p>
            </div>

            <button
              type="button"
              onClick={toggleFocusMode}
              className={`inline-flex items-center justify-center rounded-2xl border px-3 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${
                isFocusModeEnabled
                  ? 'border-amber-400/18 bg-amber-400 text-black'
                  : 'border-white/8 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]'
              }`}
            >
              <EyeOff size={16} />
            </button>
          </div>
        </div>

        <div className={`mx-auto w-full transition-all duration-500 ${isFocusModeEnabled ? 'max-w-5xl' : 'max-w-7xl'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8 md:space-y-10"
            >
              <Outlet context={{ showToast }} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence mode="wait">
        {!isFocusModeEnabled && (
          <motion.div
            key={identityIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="pointer-events-none fixed bottom-5 left-1/2 z-30 hidden -translate-x-1/2 xl:block"
          >
            <div className="rounded-full border border-white/8 bg-[rgba(8,13,20,0.84)] px-6 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-slate-400">
                {STATEMENTS[identityIndex % STATEMENTS.length]}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-none fixed left-4 right-4 top-24 z-[300] space-y-3 sm:left-6 sm:right-6 lg:left-auto lg:right-10 lg:top-10 lg:w-[26rem]">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.96 }}
              className={`pointer-events-auto flex items-start gap-3 rounded-[24px] border px-5 py-4 shadow-[0_24px_50px_rgba(0,0,0,0.42)] backdrop-blur-2xl ${TOAST_STYLES[toast.type]}`}
            >
              <div className="mt-0.5 rounded-2xl border border-white/8 bg-white/[0.04] p-2">
                {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">
                  {toast.type === 'success' ? 'Saved' : toast.type === 'error' ? 'Attention' : 'Heads Up'}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-current">{toast.msg}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isEmergency && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/92 p-5 backdrop-blur-2xl sm:p-8"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(240,90,61,0.16)_0%,transparent_64%)]" />

            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-panel relative z-10 w-full max-w-5xl rounded-[36px] border-[rgba(240,90,61,0.18)] p-6 sm:p-8 lg:p-10"
            >
              <div className="mx-auto max-w-3xl text-center">
                <div className="mx-auto inline-flex rounded-[28px] border border-[rgba(240,90,61,0.22)] bg-[rgba(240,90,61,0.16)] p-5 shadow-[0_24px_50px_rgba(240,90,61,0.18)]">
                  <ShieldAlert size={44} className="text-[color:var(--shell-brand)]" />
                </div>
                <p className="section-eyebrow mt-6">Recovery Protocol</p>
                <h2 className="mt-4 font-display text-4xl font-bold tracking-[-0.05em] text-white sm:text-5xl">
                  Reset the day before you continue.
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-[15px]">
                  When the system feels noisy, run the shortest reliable recovery loop first. The goal is calm and control, not intensity.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                  {
                    icon: Droplets,
                    title: 'Hydrate',
                    detail: 'Drink a glass of water and lower the physical noise first.',
                    accent: 'text-sky-300',
                    surface: 'border-sky-500/16 bg-sky-500/8',
                  },
                  {
                    icon: Wind,
                    title: 'Reset Physiology',
                    detail: 'Cold water, slower breathing, and one minute without screens.',
                    accent: 'text-cyan-300',
                    surface: 'border-cyan-500/16 bg-cyan-500/8',
                  },
                  {
                    icon: Sparkles,
                    title: 'Clear Space',
                    detail: 'Fix the room for three minutes so the next action starts cleanly.',
                    accent: 'text-emerald-300',
                    surface: 'border-emerald-500/16 bg-emerald-500/8',
                  },
                ].map((step, index) => (
                  <div key={step.title} className={`rounded-[28px] border p-6 text-left ${step.surface}`}>
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-3">
                        <step.icon size={18} className={step.accent} />
                      </div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-300">Step {index + 1}</p>
                    </div>
                    <h3 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-white">{step.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-300">{step.detail}</p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsEmergency(false)}
                className="primary-action mt-8 w-full justify-center rounded-[26px] py-4 text-[11px] tracking-[0.24em]"
              >
                Return to Command
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

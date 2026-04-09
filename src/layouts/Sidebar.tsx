import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertOctagon,
  Bell,
  ChevronLeft,
  ChevronRight,
  Download,
  Dumbbell,
  Eye,
  EyeOff,
  Layers,
  LogOut,
  PencilLine,
  Shield,
  ShieldCheck,
  Target,
  Timer,
  Wallet,
  X,
  Zap,
} from 'lucide-react';
import { exportData } from '../utils/exportData';
import { supabase } from '../services/supabase';
import { useFocus } from '../features/focus/useFocus';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../utils/cn';

const NAV_GROUPS = [
  {
    title: 'Core',
    items: [
      { path: '/', label: 'Command Center', icon: Activity },
      { path: '/habits', label: 'Habits', icon: ShieldCheck },
      { path: '/focus', label: 'Focus', icon: Zap },
      { path: '/goals', label: 'Goals', icon: Target },
    ],
  },
  {
    title: 'Extensions',
    items: [
      { path: '/market', label: 'Market', icon: Wallet },
      { path: '/physical', label: 'Physical', icon: Dumbbell },
      { path: '/english', label: 'Language', icon: Timer },
    ],
  },
  {
    title: 'System',
    items: [
      { path: '/journal', label: 'Daily Review', icon: PencilLine },
      { path: '/notifications', label: 'Alerts', icon: Bell },
      { path: '/settings', label: 'Settings', icon: Layers },
    ],
  },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { setAuthenticated } = useAppStore();
  const { isFocusModeEnabled, toggleFocusMode } = useFocus();
  const navigate = useNavigate();
  const isCompact = collapsed && !mobileOpen;

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }

    setAuthenticated(false);
    onClose();
    navigate('/');
  };

  return (
    <aside
      className={cn(
        'group/sidebar fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-[min(20rem,calc(100vw-1.5rem))] shrink-0 flex-col overflow-hidden border-r border-white/8 bg-[rgba(8,13,20,0.9)] shadow-[20px_0_40px_rgba(0,0,0,0.28)] backdrop-blur-2xl transition-all duration-300 lg:sticky lg:top-0 lg:h-screen',
        isCompact ? 'lg:w-[92px]' : 'lg:w-[290px]',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        isFocusModeEnabled ? 'lg:opacity-70 lg:hover:opacity-100' : '',
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(240,90,61,0.09),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_100%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-white/8" />

      <button
        type="button"
        onClick={() => setCollapsed((value) => !value)}
        className="absolute -right-3 top-9 z-50 hidden rounded-full border border-white/10 bg-[rgba(8,13,20,0.96)] p-1.5 text-slate-300 shadow-[0_10px_24px_rgba(0,0,0,0.35)] transition-all hover:border-white/16 hover:text-white lg:block"
      >
        {isCompact ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      <div className={cn('relative z-10 border-b border-white/8', isCompact ? 'px-4 py-6' : 'px-6 py-6 sm:px-7')}>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl border border-white/10 bg-white/[0.03] p-2 text-slate-300 transition-colors hover:bg-white/[0.08] lg:hidden"
        >
          <X size={16} />
        </button>

        {isCompact ? (
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(240,90,61,0.2)] bg-[rgba(240,90,61,0.16)] text-[color:var(--shell-brand)] shadow-[0_16px_28px_rgba(240,90,61,0.14)]">
            <Shield size={20} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(240,90,61,0.2)] bg-[rgba(240,90,61,0.16)] text-[color:var(--shell-brand)] shadow-[0_16px_28px_rgba(240,90,61,0.14)]">
                <Shield size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[color:var(--shell-brand)]">COMMAND.OS</p>
                <h1 className="mt-1 font-display text-2xl font-bold tracking-[-0.05em] text-white">Personal control layer</h1>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] px-4 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">Status</p>
              <p className="mt-2 text-sm font-semibold text-white">Late alpha / early beta</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Core workflows are live. This pass is focused on polish, hierarchy, and making the app feel page-first.
              </p>
            </div>
          </div>
        )}
      </div>

      <nav className="relative z-10 mt-4 flex-1 space-y-7 overflow-y-auto px-4 pb-6 pt-3 custom-scrollbar">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-3">
            {!isCompact ? (
              <div className="px-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">{group.title}</p>
              </div>
            ) : null}

            <div className="space-y-1.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'relative flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-semibold transition-all',
                      isCompact ? 'justify-center px-0' : 'pr-4',
                      isActive
                        ? 'border-white/10 bg-white/10 text-white shadow-[0_16px_28px_rgba(0,0,0,0.22)]'
                        : 'border-transparent text-slate-400 hover:border-white/10 hover:bg-white/5 hover:text-white',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive ? <span className="absolute bottom-3 left-0 top-3 w-1 rounded-full bg-sky-400" /> : null}
                      <span className={cn('inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03]', isActive ? 'text-sky-300' : '')}>
                        <item.icon size={16} />
                      </span>
                      {!isCompact ? <span className="truncate">{item.label}</span> : null}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="relative z-10 mt-auto border-t border-white/8 bg-[rgba(7,11,17,0.72)] p-4 backdrop-blur-2xl sm:p-5">
        {!isCompact && !isFocusModeEnabled ? (
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('emergency-override'))}
            className="mb-3 flex w-full items-center gap-3 rounded-[20px] border border-[rgba(240,90,61,0.2)] bg-[rgba(240,90,61,0.12)] px-4 py-4 text-left transition-colors hover:bg-[rgba(240,90,61,0.18)]"
          >
            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-2.5 text-[color:var(--shell-brand)]">
              <AlertOctagon size={16} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[color:var(--shell-brand)]">Recovery</p>
              <p className="mt-1 text-sm font-semibold text-white">Run reset protocol</p>
            </div>
          </button>
        ) : null}

        <button
          type="button"
          onClick={toggleFocusMode}
          className={cn(
            'flex w-full items-center rounded-[20px] border px-4 py-4 text-sm font-semibold transition-all',
            isCompact ? 'justify-center' : 'gap-3',
            isFocusModeEnabled
              ? 'border-amber-400/18 bg-amber-400 text-black shadow-[0_14px_30px_rgba(245,158,11,0.2)]'
              : 'border-white/8 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]',
          )}
        >
          {isFocusModeEnabled ? <EyeOff size={16} /> : <Eye size={16} />}
          {!isCompact ? <span>{isFocusModeEnabled ? 'Exit Focus Mode' : 'Enter Focus Mode'}</span> : null}
        </button>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={exportData}
            title="Export Data"
            className="inline-flex items-center justify-center rounded-[18px] border border-white/8 bg-white/[0.03] py-3 text-slate-300 transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            <Download size={16} />
          </button>

          <button
            type="button"
            onClick={handleLogout}
            title="Log Out"
            className="inline-flex items-center justify-center rounded-[18px] border border-white/8 bg-white/[0.03] py-3 text-slate-300 transition-colors hover:border-[rgba(240,90,61,0.18)] hover:bg-[rgba(240,90,61,0.1)] hover:text-white"
          >
            <LogOut size={16} />
          </button>
        </div>

        {!isCompact ? (
          <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-[0.28em] text-slate-600">
            Build v2.1.2
          </p>
        ) : null}
      </div>
    </aside>
  );
}

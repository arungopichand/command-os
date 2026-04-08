import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Activity, Timer, 
  Target, Layers, LogOut, Download, 
  ChevronLeft, ChevronRight, Bell,
  Wallet, Eye, EyeOff, Shield, Dumbbell,
  ShieldCheck, PencilLine, Zap, AlertOctagon, X
} from 'lucide-react';
import { exportData } from '../utils/exportData';
import { supabase } from '../services/supabase';
import { useAppStore } from '../store/useAppStore';
import { useFocus } from '../features/focus/useFocus';

const MISSION_GROUPS = [
  {
    title: 'OPERATIONS',
    items: [
      { path: '/', label: 'Command', icon: Activity },
      { path: '/habits', label: 'Discipline', icon: ShieldCheck },
      { path: '/focus', label: 'Deep Work', icon: Zap },
      { path: '/physical', label: 'Physics', icon: Dumbbell },
    ]
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { path: '/market', label: 'Market', icon: Wallet },
      { path: '/english', label: 'Lexicon', icon: Timer },
      { path: '/goals', label: 'Planning', icon: Target },
    ]
  },
  {
    title: 'SYSTEMS',
    items: [
      { path: '/journal', label: 'Logbook', icon: PencilLine },
      { path: '/notifications', label: 'Alerts', icon: Bell },
      { path: '/settings', label: 'Control', icon: Layers },
    ]
  }
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
    <aside className={`${isCompact ? 'lg:w-20' : 'lg:w-72'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${isFocusModeEnabled ? 'lg:opacity-40 lg:hover:opacity-100' : ''} fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-[min(20rem,calc(100vw-1.5rem))] shrink-0 flex-col overflow-hidden border-r border-red-900/20 bg-[#020202] transition-all duration-300 lg:sticky lg:top-0 lg:h-screen group/sidebar`}>
      
      {/* Tactical Glow Trace */}
      <div className="absolute inset-y-0 left-0 w-[1px] bg-red-600/30 shadow-[0_0_20px_rgba(220,38,38,0.5)] z-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-red-600/5 to-transparent pointer-events-none" />

      {/* Collapse Action Hub */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-10 z-50 hidden rounded-full border border-black bg-red-600 p-1 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all hover:scale-110 lg:block"
      >
        {isCompact ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Primary Identifier */}
      <div className={`${isCompact ? 'justify-center p-6' : 'p-6 pb-5 sm:p-8 sm:pb-6'} relative z-10 flex items-center border-b border-red-900/10`}>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl border border-white/10 bg-white/[0.03] p-2 text-slate-300 transition-colors hover:bg-white/[0.08] lg:hidden"
        >
          <X size={16} />
        </button>

        {isCompact ? (
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)]">
            <Shield size={20} className="text-white" />
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-red-600" />
              <h1 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">COMMAND<span className="text-red-600">.</span></h1>
            </div>
            <p className="text-[8px] text-red-500/40 uppercase tracking-[0.5em] font-black mt-3 leading-none">Global Architecture</p>
          </div>
        )}
      </div>

      {/* Navigational Logic */}
      <nav className="relative z-10 mt-6 flex-1 space-y-8 overflow-y-auto px-4 pb-6 custom-scrollbar lg:mt-10">
        {MISSION_GROUPS.map((group) => (
          <div key={group.title} className="space-y-4">
             {!isCompact && (
               <div className="flex items-center gap-3 px-4">
                  <div className="w-1 h-3 bg-red-600/30 rounded-full" />
                  <h3 className="text-[9px] font-black text-red-500/40 uppercase tracking-[0.5em] mb-0">
                    {group.title}
                  </h3>
               </div>
             )}
               <div className="space-y-1.5">
               {group.items.map((item) => (
                 <NavLink
                   key={item.path}
                   to={item.path}
                   onClick={onClose}
                   className={({ isActive }) =>
                     `flex items-center gap-4 rounded-2xl px-4 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${isCompact ? 'justify-center' : ''} ${
                       isActive
                         ? 'bg-red-600 text-white shadow-[0_10px_25px_rgba(220,38,38,0.3)] border border-red-400/20'
                         : 'text-zinc-500 hover:text-red-400 hover:bg-red-950/20'
                     }`
                   }
                 >
                   <item.icon size={18} className="shrink-0" />
                   {!isCompact && <span>{item.label}</span>}
                 </NavLink>
               ))}
             </div>
          </div>
        ))}
      </nav>

      {/* Operational Auxiliaries */}
      <div className="relative z-10 mt-auto space-y-3 border-t border-red-900/10 bg-black/40 p-4 backdrop-blur-md sm:p-6">
        
        {/* Emergency Override (Relocated for Layout De-Clutter) */}
        {!isCompact && !isFocusModeEnabled && (
          <button 
            className="w-full flex items-center gap-4 px-4 py-4 mb-2 bg-red-600/10 hover:bg-red-600/20 border border-red-600/40 rounded-2xl text-red-500 font-black tracking-[0.3em] uppercase text-[9px] shadow-[0_0_20px_rgba(220,38,38,0.2)] transition-all group"
            onClick={() => window.dispatchEvent(new CustomEvent('emergency-override'))}
          >
            <AlertOctagon size={16} className="group-hover:rotate-12 transition-transform" />
            <span>Emergency Purge</span>
          </button>
        )}

        <button
          onClick={toggleFocusMode}
          className={`w-full flex items-center ${isCompact ? 'justify-center' : 'gap-4'} rounded-2xl px-4 py-4 text-[9px] font-black uppercase tracking-[0.3em] transition-all duration-300 ${isFocusModeEnabled ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.5)]' : 'bg-zinc-900 text-slate-500 hover:bg-amber-950/20 hover:text-amber-400'}`}
        >
          {isFocusModeEnabled ? <EyeOff size={16} /> : <Eye size={16} />}
          {!isCompact && <span>{isFocusModeEnabled ? 'Exit Dark Zone' : 'Focus Mode'}</span>}
        </button>

        <div className="flex gap-2">
          <button
            onClick={exportData}
            title="Data Export"
            className={`flex-1 flex items-center justify-center py-4 bg-transparent hover:bg-blue-950/20 border border-white/5 rounded-2xl transition-all duration-300 text-slate-600 hover:text-blue-400`}
          >
            <Download size={16} />
          </button>

          <button
            onClick={handleLogout}
            title="Terminate Session"
            className={`flex-1 flex items-center justify-center py-4 bg-transparent hover:bg-red-950/30 border border-white/5 rounded-2xl transition-all duration-300 text-slate-600 hover:text-red-500`}
          >
            <LogOut size={16} />
          </button>
        </div>

        {!isCompact && (
          <p className="text-[7px] text-zinc-800 text-center uppercase tracking-[1em] mt-6 font-black">
            Build v2.1.2 Re-Arch
          </p>
        )}
      </div>
    </aside>
  );
}

import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Activity, LayoutGrid, Timer, 
  Target, BookOpen, Layers, LogOut, Download, 
  ChevronLeft, ChevronRight, BarChart2, Bell,
  Wallet, Eye, EyeOff, Shield, Dumbbell,
  ShieldCheck, PencilLine, Zap, AlertOctagon
} from 'lucide-react';
import { exportData } from '../utils/exportData';
import { supabase } from '../services/supabase';
import { useAppStore } from '../store/useAppStore';

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

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { isFocusMode, toggleFocus, setAuthenticated } = useAppStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthenticated(false);
    navigate('/');
  };

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-72'} ${isFocusMode ? 'opacity-10 hover:opacity-100' : ''} transition-all duration-500 bg-[#020202] border-r border-red-900/20 flex flex-col h-screen sticky top-0 z-50 shrink-0 relative overflow-hidden group/sidebar`}>
      
      {/* Tactical Glow Trace */}
      <div className="absolute inset-y-0 left-0 w-[1px] bg-red-600/30 shadow-[0_0_20px_rgba(220,38,38,0.5)] z-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-red-600/5 to-transparent pointer-events-none" />

      {/* Collapse Action Hub */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-10 bg-red-600 border border-black text-white rounded-full p-1 z-50 hover:scale-110 transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)]"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Primary Identifier */}
      <div className={`${collapsed ? 'p-6 justify-center' : 'p-8 pb-6'} border-b border-red-900/10 flex items-center relative z-10`}>
        {collapsed ? (
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
      <nav className="flex-1 px-4 space-y-8 mt-10 overflow-y-auto custom-scrollbar relative z-10">
        {MISSION_GROUPS.map((group) => (
          <div key={group.title} className="space-y-3">
             {!collapsed && (
               <h3 className="px-4 text-[8px] font-black text-zinc-700 uppercase tracking-[0.4em] mb-4">
                 {group.title}
               </h3>
             )}
             <div className="space-y-1">
               {group.items.map((item) => (
                 <NavLink
                   key={item.path}
                   to={item.path}
                   className={({ isActive }) =>
                     `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 font-black uppercase tracking-[0.2em] text-[10px] ${collapsed ? 'justify-center' : ''} ${
                       isActive
                         ? 'bg-red-600 text-white shadow-[0_10px_25px_rgba(220,38,38,0.3)] border border-red-400/20'
                         : 'text-zinc-500 hover:text-red-400 hover:bg-red-950/20'
                     }`
                   }
                 >
                   <item.icon size={18} className="shrink-0" />
                   {!collapsed && <span>{item.label}</span>}
                 </NavLink>
               ))}
             </div>
          </div>
        ))}
      </nav>

      {/* Operational Auxiliaries */}
      <div className={`p-6 mt-auto border-t border-red-900/10 space-y-3 relative z-10 bg-black/40 backdrop-blur-md`}>
        
        {/* Emergency Override (Relocated for Layout De-Clutter) */}
        {!collapsed && !isFocusMode && (
          <button 
            className="w-full flex items-center gap-4 px-4 py-4 mb-2 bg-red-600/10 hover:bg-red-600/20 border border-red-600/40 rounded-2xl text-red-500 font-black tracking-[0.3em] uppercase text-[9px] shadow-[0_0_20px_rgba(220,38,38,0.2)] transition-all group"
            onClick={() => window.dispatchEvent(new CustomEvent('emergency-override'))}
          >
            <AlertOctagon size={16} className="group-hover:rotate-12 transition-transform" />
            <span>Emergency Purge</span>
          </button>
        )}

        <button
          onClick={toggleFocus}
          className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-4'} px-4 py-4 rounded-2xl transition-all duration-300 uppercase text-[9px] font-black tracking-[0.3em] ${isFocusMode ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.5)]' : 'bg-zinc-900 text-slate-500 hover:bg-amber-950/20 hover:text-amber-400'}`}
        >
          {isFocusMode ? <EyeOff size={16} /> : <Eye size={16} />}
          {!collapsed && <span>{isFocusMode ? 'Exit Dark Zone' : 'Focus Mode'}</span>}
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

        {!collapsed && (
          <p className="text-[7px] text-zinc-800 text-center uppercase tracking-[1em] mt-6 font-black">
            Build v2.1.2 Re-Arch
          </p>
        )}
      </div>
    </aside>
  );
}

import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, LayoutGrid, Timer, Coffee, Sparkles, Target, BookOpen, Layers, LogOut, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { exportData } from '../../utils/exportData';
import { supabase } from '../../lib/supabase';

const navItems = [
  { path: '/', label: 'Command', icon: Activity },
  { path: '/habits', label: 'Matrix', icon: LayoutGrid },
  { path: '/english', label: 'Lexicon', icon: Timer },
  { path: '/meals', label: 'Fuel', icon: Coffee },
  { path: '/360', label: 'Life 360', icon: Target },
  { path: '/learning', label: 'Learning Vault', icon: BookOpen },
  { path: '/manifestation', label: 'Vision', icon: Sparkles },
  { path: '/sandbox', label: 'Sandbox', icon: Layers },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-black/90 border-r border-red-900/30 flex flex-col h-full sticky top-0 shadow-[4px_0_24px_-4px_rgba(220,38,38,0.15)] z-20 shrink-0 relative`}>
      
      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-8 bg-red-950 border border-red-900/50 text-red-500 rounded-full p-0.5 z-30 hover:bg-red-900 transition-colors shadow-lg"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Brand */}
      <div className={`${collapsed ? 'p-4 justify-center' : 'p-6 pb-4'} border-b border-red-900/30 flex items-center`}>
        {collapsed ? (
          <span className="text-red-600 font-black text-xl drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]">C.</span>
        ) : (
          <div>
            <h1 className="text-3xl font-black text-red-600 tracking-tighter uppercase mb-1 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)] leading-tight">COMMAND.</h1>
            <p className="text-[10px] text-red-500/60 uppercase tracking-[0.2em] font-bold mt-2">Zero Excuses Protocol</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-1 mt-4 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300 font-bold uppercase tracking-widest text-[11px] ${collapsed ? 'justify-center' : ''} ${
                isActive
                  ? 'bg-red-950/40 text-red-400 border border-red-900/50 shadow-[inset_0_0_12px_rgba(220,38,38,0.2)]'
                  : 'text-slate-500 hover:text-red-300 hover:bg-black border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={16} className={`shrink-0 ${isActive ? "text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]" : ""}`} />
                {!collapsed && <span>{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className={`p-3 mt-auto border-t border-red-900/30 pt-4 space-y-2`}>
        <button
          onClick={exportData}
          title="Export Logs"
          className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-2'} px-3 py-3 bg-black hover:bg-red-950/30 rounded-lg transition-all duration-300 text-slate-500 hover:text-red-400 border border-red-900/20 uppercase text-[10px] font-bold tracking-[0.2em]`}
        >
          <Download size={14} className="shrink-0" />
          {!collapsed && <span>Export Logs</span>}
        </button>

        <button
          onClick={handleLogout}
          title="Logout"
          className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-2'} px-3 py-3 bg-black hover:bg-red-950/40 rounded-lg transition-all duration-300 text-slate-500 hover:text-red-400 border border-red-900/20 uppercase text-[10px] font-bold tracking-[0.2em]`}
        >
          <LogOut size={14} className="shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

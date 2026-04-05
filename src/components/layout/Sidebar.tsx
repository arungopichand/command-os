import { NavLink } from 'react-router-dom';
import { Activity, LayoutGrid, Timer, Coffee, Sparkles, Target, BookOpen, Layers } from 'lucide-react';
import { exportData } from '../../utils/exportData';

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
  return (
    <aside className="w-64 bg-black/90 border-r border-red-900/30 flex flex-col h-full sticky top-0 rounded-none border-y-0 border-l-0 shadow-[4px_0_24px_-4px_rgba(220,38,38,0.15)] z-20">
      <div className="p-6 pb-4 border-b border-red-900/30">
        <h1 className="text-3xl font-black text-red-600 tracking-tighter uppercase mb-1 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)] leading-tight">
          COMMAND.
        </h1>
        <p className="text-[10px] text-red-500/60 uppercase tracking-[0.2em] font-bold mt-2">Zero Excuses Protocol</p>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-6 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 font-bold uppercase tracking-widest text-[11px] ${
                isActive
                  ? 'bg-red-950/40 text-red-400 border border-red-900/50 shadow-[inset_0_0_12px_rgba(220,38,38,0.2)] translate-x-1 outline outline-1 outline-red-900/20'
                  : 'text-slate-500 hover:text-red-300 hover:bg-black hover:translate-x-1 border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={16} className={isActive ? "text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]" : ""} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto mb-4 border-t border-red-900/30 pt-6">
        <button
          onClick={exportData}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black hover:bg-red-950/30 rounded-lg transition-all duration-300 text-slate-500 hover:text-red-400 border border-red-900/20 shadow-sm uppercase text-[10px] font-bold tracking-[0.2em]"
        >
          <span>Export Logs</span>
        </button>
      </div>
    </aside>
  );
}

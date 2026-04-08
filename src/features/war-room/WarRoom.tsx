import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { 
  Activity, Wallet, Dumbbell, Timer, 
  ShieldCheck, Zap, Target, PencilLine, 
  Layers, Shield,
  ArrowUpRight, AlertCircle, CheckCircle2,
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../utils/cn';
import { useCommandCenterMetrics } from './useCommandCenterMetrics';

interface StrategicSector {
  id: string;
  path: string;
  label: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
  desc: string;
}

const STATUS_STYLES = {
  ready: {
    dot: 'bg-emerald-500',
    text: 'text-emerald-400',
  },
  empty: {
    dot: 'bg-slate-600',
    text: 'text-slate-400',
  },
  loading: {
    dot: 'bg-amber-500',
    text: 'text-amber-300',
  },
  error: {
    dot: 'bg-red-500',
    text: 'text-red-400',
  },
} as const;

function pluralize(value: number, singular: string, plural = `${singular}s`) {
  return `${value} ${value === 1 ? singular : plural}`;
}

const STRATEGIC_SECTORS: StrategicSector[] = [
  { 
    id: 'command', 
    path: '/', 
    label: 'Command Center', 
    icon: Activity, 
    color: 'text-red-500', 
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    desc: 'Primary Tactical HUD'
  },
  { 
    id: 'market', 
    path: '/market', 
    label: 'Market Command', 
    icon: Wallet, 
    color: 'text-emerald-500', 
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    desc: 'Wealth & Asset Intel'
  },
  { 
    id: 'physical', 
    path: '/physical', 
    label: 'Physical Ops', 
    icon: Dumbbell, 
    color: 'text-cyan-500', 
    bg: 'bg-cyan-600/10',
    border: 'border-cyan-500/20',
    desc: 'Operational Readiness'
  },
  { 
    id: 'english', 
    path: '/english', 
    label: 'Language Lab', 
    icon: Timer, 
    color: 'text-fuchsia-500', 
    bg: 'bg-fuchsia-500/10',
    border: 'border-fuchsia-500/20',
    desc: 'Lexicon Intelligence'
  },
  { 
    id: 'habits', 
    path: '/habits', 
    label: 'Discipline Engine', 
    icon: ShieldCheck, 
    color: 'text-amber-500', 
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    desc: 'Behavioral Protocols'
  },
  { 
    id: 'focus', 
    path: '/focus', 
    label: 'Deep Work', 
    icon: Zap, 
    color: 'text-violet-500', 
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    desc: 'Cognitive Sprint'
  },
  { 
    id: 'goals', 
    path: '/goals', 
    label: 'Mission Planning', 
    icon: Target, 
    color: 'text-blue-500', 
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    desc: 'Strategic Trajectory'
  },
  { 
    id: 'journal', 
    path: '/journal', 
    label: 'After Action Log', 
    icon: PencilLine, 
    color: 'text-slate-400', 
    bg: 'bg-white/5',
    border: 'border-white/10',
    desc: 'Historical Recon'
  },
  { 
    id: 'settings', 
    path: '/settings', 
    label: 'OS Control', 
    icon: Layers, 
    color: 'text-red-600', 
    bg: 'bg-red-600/5',
    border: 'border-red-600/20',
    desc: 'System Configuration'
  }
];

export function WarRoom() {
  const navigate = useNavigate();
  const { totalXP } = useAppStore();
  const { sectors, summary } = useCommandCenterMetrics();

  const footerMessage = summary.errorCount > 0
    ? `${pluralize(summary.errorCount, 'sector')} need attention before the dashboard is fully trustworthy.`
    : summary.loadingCount > 0
      ? `Syncing ${pluralize(summary.loadingCount, 'sector')} for the latest dashboard state.`
      : summary.readyCount > 0
        ? `COMMAND.OS is reporting live data across ${pluralize(summary.readyCount, 'sector')}.`
        : 'No dashboard data yet. Start with goals, habits, focus, journal, or alerts.';

  return (
    <div className="space-y-12">
      {/* Prime HUD Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-10 border-b border-white/5">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <Shield className="text-red-600 w-5 h-5" />
              <span className="text-[10px] font-black text-red-500/60 tracking-[0.4em] uppercase">Tactical HUD Alpha</span>
           </div>
           <h1 className="text-7xl font-black text-white tracking-tighter uppercase leading-none">
              COMMAND CENTER
           </h1>
           <div className="flex items-center gap-6">
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest indent-2">{summary.missionLabel}</p>
              <div className="h-px w-24 bg-red-600/30" />
              <div className="flex items-center gap-2">
                 <Zap size={14} className="text-amber-500 fill-amber-500" />
                 <span className="text-lg font-black text-white">{totalXP} XP</span>
              </div>
           </div>
        </div>
        
        <div className="bg-red-600/10 border border-red-600/30 px-8 py-5 rounded-3xl flex items-center gap-6 group cursor-default">
           <div className="text-right">
              <p className="text-[8px] text-red-500 font-black uppercase tracking-widest leading-none">Dashboard Truth</p>
              <p className="text-lg font-black text-white mt-1">{summary.uplinkStatus}</p>
              <p className="mt-2 text-[9px] font-black uppercase tracking-[0.28em] text-red-200/70">{summary.uplinkDetail}</p>
           </div>
           <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.3)]">
              <Activity size={24} className="text-white animate-pulse" />
           </div>
        </div>
      </div>

      {/* Strategic Mission Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {STRATEGIC_SECTORS.map((sector, idx) => (
          <motion.div
            key={sector.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <GlassCard 
              className={cn(
                "group hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer p-8 relative overflow-hidden",
                sector.border,
                sector.id === 'command' && "bg-[#080808] border-red-600/40"
              )}
              onClick={() => navigate(sector.path)}
            >
               {/* Sector Glow Icon */}
               <div className="flex justify-between items-start mb-10">
                  <div className={cn("p-4 rounded-2xl transition-all shadow-[0_0_20px_transparent] group-hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]", sector.bg, sector.color)}>
                     <sector.icon size={28} />
                  </div>
                  <div className="p-2 border border-white/5 rounded-lg text-slate-700 group-hover:text-red-500 transition-colors">
                     <ArrowUpRight size={18} />
                  </div>
               </div>

               {/* Sector Intelligence */}
               <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter transition-colors group-hover:text-white">
                    {sector.label}
                  </h3>
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em]">{sector.desc}</p>
               </div>

               {/* Sector KPI Bar */}
               <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <div className={cn("w-1.5 h-1.5 rounded-full", STATUS_STYLES[sectors[sector.id].status].dot)} />
                     <span className={cn("text-[10px] font-black uppercase tracking-widest", STATUS_STYLES[sectors[sector.id].status].text)}>
                        {sectors[sector.id].label}
                     </span>
                  </div>
                  <span className="text-[8px] font-black text-slate-800 uppercase tracking-widest group-hover:text-slate-600 transition-colors">DEPLOY SECTOR</span>
               </div>

               {/* Sector Background Texture */}
               <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                  <sector.icon size={120} />
               </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Global Status Footer */}
      <div className="p-12 border border-white/5 rounded-[3rem] bg-white/[0.01] flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
         <div className="flex items-center gap-6">
            <div className="p-4 bg-white/5 rounded-2xl">
               <AlertCircle size={24} className="text-slate-600" />
            </div>
            <div>
               <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">Integrated Intelligence</p>
               <p className="text-white font-bold text-sm mt-1">{footerMessage}</p>
            </div>
         </div>
         <div className="flex gap-4">
            <div className="px-6 py-3 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
               <CheckCircle2 size={16} className="text-emerald-500" />
               <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.3em]">{pluralize(summary.readyCount, 'sector')} live</span>
            </div>
            <div className="px-6 py-3 bg-red-600/5 border border-red-600/20 rounded-2xl flex items-center gap-3">
               <ShieldCheck size={16} className="text-red-500" />
               <span className="text-[9px] font-black text-red-400 uppercase tracking-[0.3em]">
                  {summary.errorCount > 0 ? `${pluralize(summary.errorCount, 'issue')} open` : `${pluralize(summary.emptyCount, 'sector')} awaiting setup`}
               </span>
            </div>
         </div>
      </div>
    </div>
  );
}

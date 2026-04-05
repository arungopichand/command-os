import { GlassCard } from '../components/ui/GlassCard';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Wallet, BookOpen, Dumbbell, Shirt, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export function GlobalStats() {
  const [financials] = useLocalStorage<{type: 'income'|'expense', amount: number}[]>('life_os_financials', []);
  const [workouts] = useLocalStorage<any[]>('life_os_workouts', []);
  const [learning] = useLocalStorage<any[]>('life_os_learning', []);
  const [trades] = useLocalStorage<{pnl: number}[]>('life_os_trades', []);
  const [habits] = useLocalStorage<{completed: boolean}[]>('life_os_habits', []);
  const [wardrobe] = useLocalStorage<any[]>('life_os_wardrobe', []);

  // Compute Summaries
  const balance = financials.reduce((acc, curr) => curr.type === 'income' ? acc + curr.amount : acc - curr.amount, 0);
  const totalPnl = trades.reduce((acc, curr) => acc + curr.pnl, 0);
  const completedHabits = habits.filter(h => h.completed).length;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, bounce: 0.4 } }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-blue-200 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
          Welcome to the Future.
        </h1>
        <p className="text-blue-200/60 font-semibold text-lg tracking-wide">Next Level Dashboard Synced.</p>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Finance Snapshot */}
        <motion.div variants={item}>
          <GlassCard className="border-blue-500/20 group hover:border-blue-500/40 relative overflow-hidden h-full">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-all duration-700"></div>
            <div className="flex justify-between items-start mb-6 relative">
              <div className="bg-blue-500/20 p-3 rounded-2xl text-blue-400"><Wallet size={24} /></div>
              <p className="text-xs text-blue-400/80 font-bold uppercase tracking-[0.2em]">Net Balance</p>
            </div>
            <h3 className={`text-4xl font-bold ${balance >= 0 ? 'text-blue-400' : 'text-orange-400'} relative`}>
              ${balance.toFixed(2)}
            </h3>
            <p className="text-sm text-slate-400 mt-2 font-medium relative">{financials.length} total transactions</p>
          </GlassCard>
        </motion.div>

        {/* PnL Snapshot */}
        <motion.div variants={item}>
          <GlassCard className="border-emerald-500/20 group hover:border-emerald-500/40 relative overflow-hidden h-full">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-all duration-700"></div>
            <div className="flex justify-between items-start mb-6 relative">
              <div className="bg-emerald-500/20 p-3 rounded-2xl text-emerald-400"><TrendingUp size={24} /></div>
              <p className="text-xs text-emerald-400/80 font-bold uppercase tracking-[0.2em]">Trading P&L</p>
            </div>
            <h3 className={`text-4xl font-bold ${totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'} relative`}>
              {totalPnl >= 0 ? '+' : '-'}${Math.abs(totalPnl).toFixed(2)}
            </h3>
            <p className="text-sm text-slate-400 mt-2 font-medium relative">{trades.length} trades taken</p>
          </GlassCard>
        </motion.div>

        {/* Workout Snapshot */}
        <motion.div variants={item}>
          <GlassCard className="border-fuchsia-500/20 group hover:border-fuchsia-500/40 relative overflow-hidden h-full">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-3xl group-hover:bg-fuchsia-500/30 transition-all duration-700"></div>
            <div className="flex justify-between items-start mb-6 relative">
              <div className="bg-fuchsia-500/20 p-3 rounded-2xl text-fuchsia-400"><Dumbbell size={24} /></div>
              <p className="text-xs text-fuchsia-400/80 font-bold uppercase tracking-[0.2em]">Workouts</p>
            </div>
            <h3 className="text-4xl font-bold text-white relative">
              {workouts.length}
            </h3>
            <p className="text-sm text-slate-400 mt-2 font-medium relative">Sessions logged</p>
          </GlassCard>
        </motion.div>

        {/* Habits Snapshot */}
        <motion.div variants={item}>
          <GlassCard className="border-teal-500/20 group hover:border-teal-500/40 relative overflow-hidden h-full">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl group-hover:bg-teal-500/30 transition-all duration-700"></div>
            <div className="flex justify-between items-start mb-6 relative">
              <div className="bg-teal-500/20 p-3 rounded-2xl text-teal-400"><Shirt size={24} /></div>
              <p className="text-xs text-teal-400/80 font-bold uppercase tracking-[0.2em]">Habits & Style</p>
            </div>
            <h3 className="text-4xl font-bold text-white relative">
              {completedHabits} <span className="text-xl text-slate-500">/ {habits.length}</span>
            </h3>
            <p className="text-sm text-slate-400 mt-2 font-medium relative">{wardrobe.length} items in wardrobe</p>
          </GlassCard>
        </motion.div>

        {/* Learning Snapshot */}
        <motion.div variants={item}>
          <GlassCard className="border-indigo-500/20 group hover:border-indigo-500/40 relative overflow-hidden h-full">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-all duration-700"></div>
            <div className="flex justify-between items-start mb-6 relative">
              <div className="bg-indigo-500/20 p-3 rounded-2xl text-indigo-400"><BookOpen size={24} /></div>
              <p className="text-xs text-indigo-400/80 font-bold uppercase tracking-[0.2em]">Learning</p>
            </div>
            <h3 className="text-4xl font-bold text-white relative">
              {learning.length}
            </h3>
            <p className="text-sm text-slate-400 mt-2 font-medium relative">Courses & books queued</p>
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
  );
}

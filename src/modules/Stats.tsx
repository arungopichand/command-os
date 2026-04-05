import { useMemo } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getRank, getNextRank, getLevelProgress, RANKS } from '../lib/xp';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap, Star, Flame, Trophy, TrendingUp, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

function buildStreakData() {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const stored = localStorage.getItem(`war_room_progress_${dateStr}`);
    const progress = stored ? JSON.parse(stored) : {};
    const completedCount = Object.values(progress).filter(Boolean).length;
    days.push({ 
      date: d.toLocaleDateString('default', { month: 'short', day: 'numeric' }),
      tasks: completedCount,
      isPerfect: completedCount >= 5
    });
  }
  return days;
}

function computeStreak() {
  let streak = 0;
  for (let i = 1; i <= 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const stored = localStorage.getItem(`war_room_progress_${dateStr}`);
    const progress = stored ? JSON.parse(stored) : {};
    const completedCount = Object.values(progress).filter(Boolean).length;
    if (completedCount >= 3) { streak++; } else break;
  }
  return streak;
}

export function Stats() {
  const [totalXP] = useLocalStorage<number>('command_total_xp', 0);
  const rank = getRank(totalXP);
  const nextRank = getNextRank(totalXP);
  const levelPct = getLevelProgress(totalXP);
  
  const chartData = useMemo(() => buildStreakData(), []);
  const streak = useMemo(() => computeStreak(), []);
  
  const perfectDays = chartData.filter(d => d.isPerfect).length;
  const totalTasksLast30 = chartData.reduce((acc, d) => acc + d.tasks, 0);

  const rankIndex = RANKS.findIndex(r => r.title === rank.title);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-5xl font-black tracking-tighter text-amber-500 drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]">COMMAND STATS</h2>
        <p className="text-amber-400/80 font-bold tracking-widest uppercase mt-2">Your Performance Intelligence</p>
      </div>

      {/* Rank Card */}
      <GlassCard className="border-amber-900/30 bg-black/60 shadow-[inset_0_0_30px_rgba(245,158,11,0.05)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="flex flex-col items-center text-center md:text-left md:items-start">
            <div className={`text-8xl md:text-9xl font-black tracking-tighter mb-2 ${rank.color} drop-shadow-[0_0_20px_${rank.glow}]`}>
              {rank.title.charAt(0)}
            </div>
            <p className={`text-2xl font-black uppercase tracking-widest ${rank.color}`}>{rank.title}</p>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1 flex items-center gap-1"><Zap size={12} /> {totalXP} XP Total</p>
          </div>
          <div className="flex-1 w-full space-y-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Rank Progress</span>
              {nextRank && <span className="text-xs text-amber-500 font-bold uppercase">→ {nextRank.title}</span>}
            </div>
            <div className="w-full bg-amber-950/20 h-3 rounded-full overflow-hidden border border-amber-900/20">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${levelPct}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]"
              />
            </div>
            <p className="text-xs text-amber-500/60 font-bold uppercase tracking-widest text-right">{levelPct}% to next rank</p>

            {/* Rank Ladder */}
            <div className="flex gap-2 flex-wrap pt-2">
              {RANKS.slice(0, -1).map((r, i) => (
                <div key={r.title} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                  i < rankIndex ? 'bg-amber-950/20 border-amber-900/30 text-amber-400' :
                  i === rankIndex ? `bg-amber-950/40 border-amber-500/50 ${r.color} shadow-[0_0_8px_rgba(251,191,36,0.3)]` :
                  'bg-black/20 border-white/5 text-slate-600'
                }`}>
                  {i <= rankIndex ? '✓ ' : ''}{r.title}
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Day Streak', value: streak, icon: Flame, color: 'text-orange-400', glow: 'rgba(251,146,60,0.3)', bg: 'bg-orange-950/20 border-orange-900/30' },
          { label: 'Perfect Days (30d)', value: perfectDays, icon: Trophy, color: 'text-yellow-400', glow: 'rgba(253,224,71,0.3)', bg: 'bg-yellow-950/20 border-yellow-900/30' },
          { label: 'Tasks (30d)', value: totalTasksLast30, icon: TrendingUp, color: 'text-emerald-400', glow: 'rgba(52,211,153,0.3)', bg: 'bg-emerald-950/20 border-emerald-900/30' },
          { label: 'Total XP Earned', value: totalXP, icon: Zap, color: 'text-amber-400', glow: 'rgba(251,191,36,0.3)', bg: 'bg-amber-950/20 border-amber-900/30' },
        ].map((stat) => (
          <GlassCard key={stat.label} className={`${stat.bg} border flex flex-col items-center justify-center py-6 text-center`}>
            <stat.icon size={28} className={`${stat.color} mb-3`} />
            <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">{stat.label}</p>
          </GlassCard>
        ))}
      </div>

      {/* Activity Chart */}
      <GlassCard className="border-amber-900/20 bg-black/60 p-6">
        <div className="flex items-center gap-2 mb-8">
          <Calendar size={20} className="text-amber-500" />
          <h3 className="font-bold uppercase tracking-widest text-amber-400 text-sm">30-Day Mission Activity</h3>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="taskGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', color: '#f59e0b' }}
                labelStyle={{ color: '#64748b', fontSize: 11 }}
              />
              <Area type="monotone" dataKey="tasks" name="Tasks Completed" stroke="#f59e0b" strokeWidth={2} fill="url(#taskGradient)" dot={false} activeDot={{ r: 4, fill: '#f59e0b' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Daily Activity Heatmap */}
      <GlassCard className="border-amber-900/20 bg-black/60 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Star size={20} className="text-amber-500" />
          <h3 className="font-bold uppercase tracking-widest text-amber-400 text-sm">Activity Heatmap</h3>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {chartData.map((d, i) => (
            <div key={i} title={`${d.date}: ${d.tasks} tasks`} className={`w-8 h-8 rounded-md border transition-all ${
              d.isPerfect ? 'bg-amber-500/40 border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.4)]' :
              d.tasks >= 3 ? 'bg-amber-900/40 border-amber-900/40' :
              d.tasks >= 1 ? 'bg-amber-950/20 border-amber-950/30' :
              'bg-black/40 border-white/5'
            }`} />
          ))}
        </div>
        <div className="flex gap-4 mt-4 items-center">
          <div className="w-4 h-4 rounded bg-black/40 border border-white/5" /><span className="text-[10px] text-slate-500 uppercase font-bold">No Activity</span>
          <div className="w-4 h-4 rounded bg-amber-950/20 border border-amber-950/30" /><span className="text-[10px] text-slate-500 uppercase font-bold">Light</span>
          <div className="w-4 h-4 rounded bg-amber-500/40 border border-amber-500/60" /><span className="text-[10px] text-amber-400 uppercase font-bold">Perfect Day</span>
        </div>
      </GlassCard>
    </div>
  );
}

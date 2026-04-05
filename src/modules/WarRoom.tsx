import { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { CheckCircle2, Circle, TrendingUp, Play, RefreshCcw, Settings, X, Plus, Trash2, Zap, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRank, getNextRank, getLevelProgress, XP_PER_TASK, XP_PERFECT_DAY_BONUS } from '../lib/xp';

const DEFAULT_MISSIONS: Record<number, any> = {
  1: { type: 'BUILD', subtitle: 'Push the limits.', tasks: [{ id: '1', title: '.NET Development', min: 50 }, { id: '2', title: 'English Practice', min: 20 }, { id: '3', title: 'Trading Study', min: 20 }, { id: '4', title: 'Workout', min: 20 }, { id: '5', title: 'Typing Drill', min: 10 }] },
  2: { type: 'BUILD', subtitle: 'Push the limits.', tasks: [{ id: '1', title: '.NET Development', min: 50 }, { id: '2', title: 'English Practice', min: 20 }, { id: '3', title: 'Trading Study', min: 20 }, { id: '4', title: 'Workout', min: 20 }, { id: '5', title: 'Typing Drill', min: 10 }] },
  3: { type: 'BUILD', subtitle: 'Push the limits.', tasks: [{ id: '1', title: '.NET Development', min: 50 }, { id: '2', title: 'English Practice', min: 20 }, { id: '3', title: 'Trading Study', min: 20 }, { id: '4', title: 'Workout', min: 20 }, { id: '5', title: 'Typing Drill', min: 10 }] },
  4: { type: 'BUILD', subtitle: 'Push the limits.', tasks: [{ id: '1', title: '.NET Development', min: 50 }, { id: '2', title: 'English Practice', min: 20 }, { id: '3', title: 'Trading Study', min: 20 }, { id: '4', title: 'Workout', min: 20 }, { id: '5', title: 'Typing Drill', min: 10 }] },
  5: { type: 'SURVIVE', subtitle: 'Maintain momentum. Do not break.', tasks: [{ id: '1', title: '.NET Maintenance', min: 20 }, { id: '2', title: 'English Review', min: 10 }, { id: '3', title: 'Workout Light', min: 10 }, { id: '4', title: 'Trading Check', min: 10 }] },
  6: { type: 'RECOVER', subtitle: 'Heal the body. Review the code.', tasks: [{ id: '1', title: 'Deep Stretching', min: 15 }, { id: '2', title: '.NET Review', min: 20 }, { id: '3', title: 'English Immersion', min: 10 }] },
  0: { type: 'RESET', subtitle: 'Prepare the environment for War.', tasks: [{ id: '1', title: 'Room Reset', min: 30 }, { id: '2', title: 'Meal Prep', min: 60 }, { id: '3', title: 'Plan 4 .NET Tasks', min: 15 }] }
};

const TRADING_LESSONS = [
  "Support & Resistance: Identify key levels on the 4H timeframe before entering.",
  "Risk Management: Never risk more than 1% of your account per trade.",
  "Price Action: Bull flags form during uptrends — a tight consolidation before continuation.",
  "Volume Analysis: A breakout on high volume is far more reliable than a low-volume move.",
  "Psychology: Your P&L is irrelevant mid-trade. Focus only on execution quality.",
  "Moving Averages: A 9 EMA crossing above the 20 EMA signals short-term momentum shifts.",
  "Backtesting: Paper trade 100 setups before risking real capital on any new strategy.",
];

export function WarRoom() {
  const day = new Date().getDay();
  const dateStr = new Date().toISOString().split('T')[0];
  
  const [customMissions, setCustomMissions] = useLocalStorage<Record<number, any>>('war_room_missions_v2', DEFAULT_MISSIONS);
  const currentMission = customMissions[day] || DEFAULT_MISSIONS[day];
  const [progress, setProgress] = useLocalStorage<Record<string, boolean>>(`war_room_progress_${dateStr}`, {});
  const [totalXP, setTotalXP] = useLocalStorage<number>('command_total_xp', 0);
  const [awardedToday, setAwardedToday] = useLocalStorage<Record<string, boolean>>(`xp_awarded_${dateStr}`, {});

  const [cryptoPrices, setCryptoPrices] = useState<any>(null);
  const [loadingCrypto, setLoadingCrypto] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editMin, setEditMin] = useState('');
  const [xpFlash, setXpFlash] = useState<string | null>(null);

  useEffect(() => {
    const fetchCryptoPrices = async () => {
      setLoadingCrypto(true);
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true');
        const data = await res.json();
        setCryptoPrices({
          BTC: { price: data.bitcoin.usd, change: data.bitcoin.usd_24h_change },
          ETH: { price: data.ethereum.usd, change: data.ethereum.usd_24h_change },
          SOL: { price: data.solana.usd, change: data.solana.usd_24h_change },
        });
      } catch (e) { console.warn("Failed to fetch crypto", e); }
      setLoadingCrypto(false);
    };
    fetchCryptoPrices();
  }, []);

  const toggleTask = (id: string) => {
    if (isEditing) return;
    const newProgress = { ...progress, [id]: !progress[id] };
    setProgress(newProgress);

    // Award XP on first-time completion
    if (!progress[id] && !awardedToday[id]) {
      const newXP = totalXP + XP_PER_TASK;
      setTotalXP(newXP);
      setAwardedToday({ ...awardedToday, [id]: true });
      setXpFlash(`+${XP_PER_TASK} XP`);
      setTimeout(() => setXpFlash(null), 1500);

      // Perfect day bonus
      const willBeAllDone = currentMission.tasks.every((t: any) => t.id === id || newProgress[t.id]);
      if (willBeAllDone && !awardedToday['__perfect_day__']) {
        setTimeout(() => {
          setTotalXP(prev => prev + XP_PERFECT_DAY_BONUS);
          setAwardedToday(prev => ({ ...prev, '__perfect_day__': true }));
          setXpFlash(`+${XP_PERFECT_DAY_BONUS} XP PERFECT DAY!`);
          setTimeout(() => setXpFlash(null), 2500);
        }, 1600);
      }
    }
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle || !editMin) return;
    const newTask = { id: crypto.randomUUID(), title: editTitle, min: Number(editMin) };
    const updatedPhase = { ...currentMission, tasks: [...currentMission.tasks, newTask] };
    setCustomMissions({ ...customMissions, [day]: updatedPhase });
    setEditTitle(''); setEditMin('');
  };

  const removeTask = (taskId: string) => {
    const updatedPhase = { ...currentMission, tasks: currentMission.tasks.filter((t: any) => t.id !== taskId) };
    setCustomMissions({ ...customMissions, [day]: updatedPhase });
  };

  const completedCount = currentMission.tasks.filter((t: any) => progress[t.id]).length;
  const totalCount = currentMission.tasks.length;
  const percentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const startYear = new Date(new Date().getFullYear(), 0, 0);
  const diff = (new Date() as any) - (startYear as any);
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const dailyLesson = TRADING_LESSONS[dayOfYear % TRADING_LESSONS.length];

  const rank = getRank(totalXP);
  const nextRank = getNextRank(totalXP);
  const levelPct = getLevelProgress(totalXP);

  return (
    <div className="space-y-6">
      {/* XP Flash Banner */}
      <AnimatePresence>
        {xpFlash && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[300] bg-amber-500/90 text-black font-black px-8 py-3 rounded-full text-lg uppercase tracking-widest shadow-[0_0_30px_rgba(251,191,36,0.8)] backdrop-blur-sm flex items-center gap-2"
          >
            <Zap size={20} /> {xpFlash}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Row */}
      <div className="flex justify-between items-end mb-2 relative">
        <div>
          <h2 className="text-5xl font-black tracking-tighter text-red-600 drop-shadow-[0_0_12px_rgba(220,38,38,0.5)]">PHASE: {currentMission.type}</h2>
          <p className="text-red-400/80 font-bold tracking-widest uppercase mt-2">{currentMission.subtitle}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-white">{percentage}%</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Daily Completion</p>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`absolute -top-4 right-0 p-2 rounded-full transition-all ${isEditing ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-red-950/20 text-red-500 hover:bg-black'}`}
        >
          {isEditing ? <X size={20} /> : <Settings size={20} />}
        </button>
      </div>

      {/* XP Rank Bar */}
      <GlassCard className="border-amber-900/20 bg-black/60 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Star size={18} className={`${rank.color} drop-shadow-[0_0_6px_${rank.glow}]`} />
            <span className={`font-black uppercase tracking-[0.2em] text-sm ${rank.color}`}>{rank.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-black text-sm"><Zap size={14} className="inline mr-1" />{totalXP} XP</span>
            {nextRank && <span className="text-slate-600 text-xs font-bold">→ {nextRank.title}</span>}
          </div>
        </div>
        <div className="w-full bg-amber-950/20 h-2 rounded-full overflow-hidden border border-amber-900/20">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${levelPct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
          />
        </div>
        <p className="text-[10px] text-amber-500/60 mt-1 text-right font-bold uppercase tracking-widest">{levelPct}% to {nextRank?.title ?? 'Max Rank'}</p>
      </GlassCard>

      {/* Mission Progress Bar */}
      <div className="w-full bg-red-950/20 h-4 rounded-full overflow-hidden border border-red-900/30">
        <motion.div 
           initial={{ width: 0 }}
           animate={{ width: `${percentage}%` }}
           className={`h-full ${percentage === 100 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]' : 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)]'} transition-all duration-1000`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        
        {/* Mission Checklist */}
        <GlassCard className="lg:col-span-2 border-red-900/30 shadow-[inset_0_0_20px_rgba(220,38,38,0.05)] bg-black/60 relative">
          <h3 className="text-xl font-bold mb-6 text-red-500 uppercase tracking-widest flex items-center gap-2">
            <Play size={20} /> {isEditing ? 'Edit Protocol' : 'Active Missions'}
          </h3>
          
          <div className="space-y-3">
             <AnimatePresence>
               {currentMission.tasks.map((task: any) => (
                  <motion.div initial={{opacity:0, y:5}} animate={{opacity:1, y:0}} exit={{opacity:0, scale:0.9}} key={task.id} className="relative group">
                    <button 
                      onClick={() => toggleTask(task.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                         progress[task.id] && !isEditing
                         ? 'bg-red-950/20 border-red-900/50 text-slate-500' 
                         : 'bg-black/40 border-red-900/20 text-white hover:bg-red-950/40 hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(220,38,38,0.2)]'
                      } ${isEditing && 'opacity-60 cursor-default'}`}
                    >
                      <div className="flex items-center gap-4">
                         {!isEditing && (progress[task.id] ? <CheckCircle2 className="text-red-600 shrink-0" /> : <Circle className="text-red-400 shrink-0" />)}
                         <span className={`font-black text-lg tracking-wide ${progress[task.id] && !isEditing && 'line-through decoration-red-900/50'}`}>{task.title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                         {awardedToday[task.id] && !isEditing && <Zap size={14} className="text-amber-400" />}
                         <span className="text-xs uppercase tracking-widest font-bold text-red-400 bg-red-950/40 px-3 py-1 rounded-md border border-red-900/40">
                            {task.min}m
                         </span>
                      </div>
                    </button>
                    {isEditing && (
                      <button onClick={() => removeTask(task.id)} className="absolute -right-2 -top-2 bg-red-600 hover:bg-rose-500 text-white p-2 rounded-full shadow-lg z-10">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </motion.div>
               ))}
             </AnimatePresence>
          </div>

          {isEditing && (
             <form onSubmit={addTask} className="mt-8 pt-6 border-t border-red-900/40 flex flex-col sm:flex-row gap-3">
                <input value={editTitle} onChange={e=>setEditTitle(e.target.value)} type="text" placeholder="Task Name" className="flex-1 bg-black/40 border border-red-900/30 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500/50" />
                <input value={editMin} onChange={e=>setEditMin(e.target.value)} type="number" placeholder="Mins" className="w-24 bg-black/40 border border-red-900/30 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500/50" />
                <button type="submit" className="bg-red-600 hover:bg-red-500 text-white font-bold tracking-widest uppercase px-6 py-3 rounded-xl flex justify-center items-center gap-2">
                   <Plus size={18} /> Add
                </button>
             </form>
          )}
        </GlassCard>

        {/* Intel Panel */}
        <div className="space-y-6">
          <GlassCard className="border-red-900/20 bg-black/40 border-l-4 border-l-red-600 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
             <div className="relative z-10 flex items-center gap-2 mb-4">
               <TrendingUp size={20} className="text-red-500" />
               <h3 className="font-bold uppercase tracking-widest text-red-400 text-sm">Daily Intelligence</h3>
             </div>
             <div className="mb-4 bg-red-950/20 p-4 rounded-xl border border-red-900/30">
                <p className="text-[10px] text-red-500/80 uppercase tracking-widest font-bold mb-1">Trading Curriculum</p>
                <p className="text-sm font-semibold text-white leading-relaxed">{dailyLesson}</p>
             </div>
             <div className="space-y-2">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Live Market Tape</p>
                {loadingCrypto ? <p className="text-red-400 animate-pulse text-xs uppercase">Establishing Connection...</p> : (
                  cryptoPrices && Object.entries(cryptoPrices).map(([coin, data]: any) => (
                    <div key={coin} className="flex justify-between items-center bg-black/60 border border-white/5 rounded-lg p-2.5">
                      <p className="text-xs text-slate-400 font-bold">{coin}</p>
                      <p className="text-sm font-black text-white">${data.price.toLocaleString()}</p>
                      <p className={`text-[10px] font-bold ${data.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {data.change >= 0 ? '▲' : '▼'} {Math.abs(data.change).toFixed(2)}%
                      </p>
                    </div>
                  ))
                )}
             </div>
          </GlassCard>

          <GlassCard className="border-red-900/20 bg-black/40 h-[130px] flex flex-col justify-center items-center text-center group hover:bg-black transition-colors cursor-default relative overflow-hidden">
             <div className="absolute inset-0 bg-red-900/5 group-hover:bg-red-500/10 transition-colors pointer-events-none"></div>
             <RefreshCcw size={28} className={`transition-colors mb-2 ${percentage === 100 ? 'text-emerald-600' : 'text-red-900 group-hover:text-red-600'}`} />
             <p className="text-xs text-red-500/60 font-black uppercase tracking-[0.2em] group-hover:text-red-400 relative z-10 transition-colors">Condition</p>
             <p className={`font-bold text-base mt-1 relative z-10 transition-colors ${percentage === 100 ? 'text-emerald-400' : 'text-white'}`}>
                {percentage === 100 ? 'MISSION COMPLETE.' : `${completedCount}/${totalCount} ACTIVE`}
             </p>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}

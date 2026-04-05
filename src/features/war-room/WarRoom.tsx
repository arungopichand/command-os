import { useState, useEffect, useCallback, useMemo } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { useAppStore } from '../../store/useAppStore';
import { 
  CheckCircle2, Circle, TrendingUp, Play, 
  RefreshCcw, Settings, X, Plus, Trash2, 
  Zap, Star, Mic, MicOff, Shield, Target, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRank, getNextRank, getLevelProgress } from '../../services/xp';
import { getDailyLesson } from '../../services/curriculum';
import { useVoiceCommands } from '../../hooks/useVoiceCommands';
import type { MarketTicker } from '../../services/market';
import { getSimulatedMarketData, getMarketSentiment } from '../../services/market';

const IDENTITY_STATEMENTS = [
  "I AM THE ONE WHO EXECUTES WHEN OTHERS SLEEP.",
  "DISCIPLINE IS NOT AN OPTION. IT IS MY IDENTITY.",
  "EVERY SECOND WASTED IS A MISSION FAILED.",
  "THE WAR ROOM ATTENDS TO NO EXCUSES.",
  "I AM AN ARCHITECT OF MY OWN DESTINY."
];

export function WarRoom() {
  const day = new Date().getDay();
  const dateStr = new Date().toISOString().split('T')[0];
  
  // Zustand State
  const { 
    totalXP, progress, awardedToday, missions,
    toggleTask: storeToggleTask, nextIdentity, identityIndex
  } = useAppStore();

  const currentMission = missions[day];
  
  // Local UI State
  const [marketData, setMarketData] = useState<MarketTicker[]>(getSimulatedMarketData());
  const [sentiment, setSentiment] = useState(getMarketSentiment(marketData));
  const [cryptoPrices, setCryptoPrices] = useState<any>(null);
  const [loadingCrypto, setLoadingCrypto] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editMin, setEditMin] = useState('');
  const [xpFlash, setXpFlash] = useState<string | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  // Identity Rotation Effect
  useEffect(() => {
    const interval = setInterval(nextIdentity, 10000);
    return () => clearInterval(interval);
  }, [nextIdentity]);

  // Market Updates
  useEffect(() => {
    const fetchMarketData = () => {
      const data = getSimulatedMarketData();
      setMarketData(data);
      setSentiment(getMarketSentiment(data));
    };
    const interval = setInterval(fetchMarketData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Crypto Updates
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
      } catch (e) {
        console.warn("Market Intel Connection Fault", e);
      }
      setLoadingCrypto(false);
    };
    fetchCryptoPrices();
    const interval = setInterval(fetchCryptoPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = (id: string) => {
    const result = storeToggleTask(dateStr, id, currentMission.tasks);
    if (result.xpAwarded > 0) {
      setXpFlash(`+${result.xpAwarded} XP ${result.perfectDay ? 'PERFECT DAY!' : ''}`);
      setTimeout(() => setXpFlash(null), 2500);
    }
  };

  const handleVoiceCommand = useCallback((command: string) => {
    setVoiceTranscript(command);
    setTimeout(() => setVoiceTranscript(''), 2500);
    const tasks = currentMission?.tasks || [];
    for (const task of tasks) {
      const keywords = task.title.toLowerCase().split(' ');
      if (keywords.some((kw: string) => kw.length > 3 && command.includes(kw))) {
        handleToggle(task.id);
        return;
      }
    }
  }, [currentMission, handleToggle]);

  const { isListening, supported: voiceSupported, startListening, stopListening } = useVoiceCommands({
    onCommand: handleVoiceCommand
  });

  // Derived Values
  const currentDayProgress = progress[dateStr] || {};
  const completedCount = currentMission.tasks.filter((t: any) => currentDayProgress[t.id]).length;
  const totalCount = currentMission.tasks.length;
  const percentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const dailyLesson = getDailyLesson();
  
  const rank = getRank(totalXP);
  const nextRank = getNextRank(totalXP);
  const levelPct = getLevelProgress(totalXP);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Identity Banner */}
      <div className="relative h-12 flex items-center justify-center overflow-hidden bg-black/40 border-y border-red-900/20 backdrop-blur-sm -mx-4 sm:-mx-6 lg:-mx-8">
        <AnimatePresence mode="wait">
          <motion.p
            key={identityIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="text-[10px] sm:text-xs font-black tracking-[0.4em] text-red-500/80 uppercase"
          >
            {IDENTITY_STATEMENTS[identityIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {voiceTranscript && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[400] bg-slate-900/95 border border-violet-700/50 px-8 py-4 rounded-full text-violet-400 font-black text-xs tracking-widest backdrop-blur-md flex items-center gap-3">
            <div className="w-2 h-2 bg-violet-500 rounded-full animate-ping" />
            "{voiceTranscript.toUpperCase()}"
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {xpFlash && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="fixed inset-0 flex items-center justify-center z-[500] pointer-events-none"
          >
            <div className="bg-amber-500 text-black font-black px-12 py-6 rounded-2xl text-4xl uppercase tracking-tighter shadow-[0_0_50px_rgba(251,191,36,0.8)] border-4 border-black">
               {xpFlash}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Command Center Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-red-600 w-6 h-6" />
            <span className="text-[10px] font-black text-red-500/60 tracking-[0.3em] uppercase">Tactical Deployment</span>
          </div>
          <h2 className="text-6xl sm:text-7xl font-black tracking-tighter text-white leading-none">
            PHASE {currentMission.type}
          </h2>
          <p className="text-xl font-bold text-red-400/80 tracking-widest uppercase mt-2 indent-1">{currentMission.subtitle}</p>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-6 mb-2">
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">Operational Intensity</p>
              <p className="text-4xl font-black text-white">{percentage}%</p>
            </div>
            {voiceSupported && (
              <button
                onClick={isListening ? stopListening : startListening}
                className={`p-4 rounded-2xl transition-all border ${isListening ? 'bg-violet-600 border-violet-400 text-white shadow-[0_0_20px_rgba(139,92,246,0.6)] animate-pulse' : 'bg-black/40 border-violet-900/30 text-violet-500 hover:bg-black'}`}
              >
                {isListening ? <Mic size={24} /> : <MicOff size={24} />}
              </button>
            )}
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={`p-4 rounded-2xl transition-all border ${isEditing ? 'bg-red-600 border-red-400 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]' : 'bg-black/40 border-red-900/30 text-red-500 hover:bg-black'}`}
            >
              {isEditing ? <X size={24} /> : <Settings size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Progress Architect */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8 flex flex-col gap-6">
          <GlassCard className="border-amber-900/20 bg-black/40 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-black border border-white/5`}>
                  <Star size={24} className={`${rank.color} drop-shadow-[0_0_8px_${rank.glow}]`} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-0.5">Current Rank</p>
                  <h4 className={`text-2xl font-black uppercase tracking-widest ${rank.color}`}>{rank.title}</h4>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-amber-400 flex items-center gap-2 justify-end">
                   <Zap size={20} fill="currentColor" /> {totalXP}
                </p>
                {nextRank && <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Next Target: {nextRank.title}</p>}
              </div>
            </div>
            <div className="w-full bg-slate-900/60 h-3 rounded-full overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${levelPct}%` }}
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]"
              />
            </div>
          </GlassCard>

          <GlassCard className="border-red-900/30 bg-black/60 p-8 flex-1">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-red-500 uppercase tracking-tighter flex items-center gap-3">
                <Target size={24} /> {isEditing ? 'Protocol Modification' : 'Active Mission Parameters'}
              </h3>
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={`w-1 h-3 rounded-full ${i < Math.floor(percentage / 20) ? 'bg-red-500 shadow-[0_0_8px_rgba(220,38,38,0.5)]' : 'bg-red-900/20'}`} />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {currentMission.tasks.map((task: any) => (
                  <motion.div layout key={task.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                    <div className="relative group">
                       <button 
                        onClick={() => handleToggle(task.id)}
                        className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 ${
                           currentDayProgress[task.id] && !isEditing
                           ? 'bg-red-950/10 border-red-900/30 text-slate-600' 
                           : 'bg-black/40 border-red-900/20 text-white hover:bg-black/80 hover:border-red-500'
                        } ${isEditing && 'opacity-60 cursor-default'}`}
                      >
                        <div className="flex items-center gap-5">
                           {!isEditing && (
                             <div className={`p-1.5 rounded-lg transition-all ${currentDayProgress[task.id] ? 'bg-red-600 text-white' : 'bg-red-950/30 text-red-900'}`}>
                               {currentDayProgress[task.id] ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                             </div>
                           )}
                           <span className={`text-xl font-black tracking-tight ${currentDayProgress[task.id] && !isEditing && 'line-through decoration-red-900/50 text-slate-600'}`}>
                             {task.title}
                           </span>
                        </div>
                        <div className="flex items-center gap-4">
                           {awardedToday[dateStr]?.[task.id] && !isEditing && (
                             <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                               <Zap size={16} className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                             </motion.div>
                           )}
                           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 bg-red-950/40 px-4 py-2 rounded-xl border border-red-900/40">
                              {task.min} MINS
                           </span>
                        </div>
                      </button>
                      {isEditing && (
                        <button className="absolute -right-3 -top-3 bg-red-600 hover:bg-white hover:text-red-600 text-white p-3 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all z-20">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </GlassCard>
        </div>

        <div className="md:col-span-4 flex flex-col gap-6">
          <GlassCard className="border-red-900/20 bg-black/40 border-l-4 border-l-red-600 overflow-hidden">
             <div className="p-6">
               <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                   <Activity size={20} className="text-red-500" />
                   <h3 className="font-black uppercase tracking-widest text-red-400 text-sm">Market Intelligence</h3>
                 </div>
                 <div className={`text-[8px] font-black uppercase tracking-[0.2em] ${sentiment.color} bg-black/60 px-3 py-1.5 rounded-full border border-white/5`}>
                   {sentiment.status}
                 </div>
               </div>

               <div className="bg-red-950/20 p-5 rounded-2xl border border-red-900/30 mb-6 group cursor-default">
                  <p className="text-[9px] text-red-500/60 uppercase tracking-[0.3em] font-black mb-2">Neural Link: Trading Curriculum</p>
                  <p className="text-sm font-bold text-slate-100 leading-relaxed group-hover:text-red-400 transition-colors">{dailyLesson}</p>
               </div>

               <div className="space-y-6">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-3">Priority Equities</p>
                    <div className="grid grid-cols-1 gap-2">
                      {marketData.map((ticker) => (
                        <div key={ticker.symbol} className="bg-black/60 border border-white/5 rounded-2xl p-4 flex justify-between items-center transition-all hover:bg-black/80 hover:border-red-900/30">
                          <div>
                            <p className={`text-xs font-black ${ticker.type === 'index' ? 'text-amber-500' : 'text-sky-500'} tracking-widest`}>{ticker.symbol}</p>
                            <p className="text-[8px] text-slate-600 font-bold uppercase">{ticker.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-white">${ticker.price.toLocaleString()}</p>
                            <p className={`text-[10px] font-bold ${ticker.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                              {ticker.change >= 0 ? '+' : ''}{ticker.change}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-3">Crypto Volatility</p>
                    {loadingCrypto ? (
                      <div className="flex flex-col gap-2 animate-pulse">
                        <div className="h-12 bg-white/5 rounded-2xl" />
                        <div className="h-12 bg-white/5 rounded-2xl" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2">
                        {cryptoPrices && Object.entries(cryptoPrices).map(([coin, data]: any) => (
                           <div key={coin} className="bg-black/40 border border-white/5 rounded-2xl p-4 flex justify-between items-center">
                             <p className="text-xs font-black text-slate-400 tracking-tighter">{coin}</p>
                             <div className="text-right">
                               <p className="text-sm font-black text-white">${data.price.toLocaleString()}</p>
                               <p className={`text-[10px] font-bold ${data.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                 {data.change >= 0 ? '▲' : '▼'} {Math.abs(data.change).toFixed(2)}%
                               </p>
                             </div>
                           </div>
                        ))}
                      </div>
                    )}
                  </div>
               </div>
             </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

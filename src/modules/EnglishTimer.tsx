import { useState, useEffect, useRef } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Play, Pause, RotateCcw, Volume2, Mic, BookOpen, Headphones, Speech } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STAGES = [
  { name: 'Read Aloud', seconds: 300, icon: BookOpen, desc: 'Read text clearly, focusing on pronunciation and rhythm.' },
  { name: 'Shadowing', seconds: 300, icon: Headphones, desc: 'Listen to native audio and mimic their speech instantly.' },
  { name: 'Free Speaking', seconds: 300, icon: Speech, desc: 'Talk continuously about a random topic without stopping.' },
  { name: 'Record & Review', seconds: 300, icon: Mic, desc: 'Record yourself speaking and analyze the playback.' }
];

export function EnglishTimer() {
  const [stageIndex, setStageIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(STAGES[0].seconds);
  const [isRunning, setIsRunning] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn("Audio Context blocked or unsupported");
    }
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            playBeep();
            setIsRunning(false);
            if (stageIndex < STAGES.length - 1) {
               setStageIndex(i => i + 1);
               return STAGES[stageIndex + 1].seconds;
            }
            return 0; // finished
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning, stageIndex]);

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    setStageIndex(0);
    setTimeLeft(STAGES[0].seconds);
  };

  const skipStage = (idx: number) => {
    setIsRunning(false);
    setStageIndex(idx);
    setTimeLeft(STAGES[idx].seconds);
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeString = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  const progressPercent = ((STAGES[stageIndex].seconds - timeLeft) / STAGES[stageIndex].seconds) * 100;

  return (
    <div className="space-y-6 max-w-4xl mx-auto items-center">
       <div className="text-center mb-10">
        <h2 className="text-5xl font-black tracking-tighter text-fuchsia-600 drop-shadow-[0_0_12px_rgba(192,38,211,0.5)]">ENGLISH PROTOCOL</h2>
        <p className="text-fuchsia-400/80 font-bold tracking-widest uppercase mt-2">20-Minute Deep Practice</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
         {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = stageIndex === idx;
            const isFinished = stageIndex > idx;
            return (
              <button 
                key={stage.name} 
                onClick={() => skipStage(idx)}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-500 ${
                  isActive 
                  ? 'bg-fuchsia-950/40 border-fuchsia-500/50 shadow-[0_0_20px_rgba(192,38,211,0.2)] scale-105' 
                  : isFinished
                    ? 'bg-black/60 border-emerald-900/40 text-emerald-500/60'
                    : 'bg-black/40 border-fuchsia-900/10 text-slate-500 hover:border-fuchsia-900/30'
                }`}
              >
                 <Icon size={24} className={isActive ? 'text-fuchsia-400' : ''} />
                 <span className={`text-[10px] font-black uppercase tracking-[0.1em] ${isActive ? 'text-fuchsia-300' : ''}`}>{stage.name}</span>
                 {isActive && (
                    <motion.div layoutId="underline" className="w-8 h-1 bg-fuchsia-500 rounded-full mt-1 blur-[1px]" />
                 )}
              </button>
            )
         })}
      </div>

      <GlassCard className="border-fuchsia-900/30 bg-[#050505] shadow-[0_4px_40px_rgba(192,38,211,0.05)] text-center relative overflow-hidden py-16">
         <div className="absolute top-0 right-1/4 w-64 h-64 bg-fuchsia-600/10 rounded-full blur-[100px] pointer-events-none"></div>
         <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>
         
         <div className="relative z-10 flex flex-col items-center">
            <h3 className="text-2xl font-bold text-fuchsia-200 uppercase tracking-widest mb-4">{STAGES[stageIndex].name}</h3>
            <p className="text-slate-400 text-sm max-w-sm mb-12 h-10">{STAGES[stageIndex].desc}</p>
            
            <div className="relative w-64 h-64 flex items-center justify-center mb-12">
               {/* Progress Ring */}
               <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                 <circle cx="128" cy="128" r="120" fill="transparent" stroke="rgba(192,38,211,0.1)" strokeWidth="4" />
                 <circle 
                   cx="128" cy="128" r="120" 
                   fill="transparent" 
                   stroke="rgba(192,38,211,0.8)" 
                   strokeWidth="8" 
                   strokeDasharray={120 * 2 * Math.PI} 
                   strokeDashoffset={(120 * 2 * Math.PI) - (progressPercent / 100) * (120 * 2 * Math.PI)}
                   strokeLinecap="round"
                   className="transition-all duration-1000 ease-linear"
                 />
               </svg>
               <span className="text-7xl font-black text-white tracking-tighter tabular-nums drop-shadow-[0_0_15px_rgba(192,38,211,0.6)]">
                 {timeString}
               </span>
            </div>

            <div className="flex items-center gap-6">
               <button onClick={resetTimer} className="p-4 rounded-full bg-black border border-fuchsia-900/30 hover:bg-fuchsia-950/20 hover:text-fuchsia-400 transition-colors text-slate-400">
                  <RotateCcw size={20} />
               </button>
               <button onClick={toggleTimer} className="px-12 py-5 rounded-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black uppercase tracking-[0.2em] shadow-[0_4px_20px_rgba(192,38,211,0.4)] hover:shadow-[0_4px_30px_rgba(192,38,211,0.6)] hover:scale-105 transition-all flex items-center gap-3">
                  {isRunning ? <><Pause size={20} /> PAUSE</> : <><Play size={20} /> INITIATE</>}
               </button>
               <button onClick={playBeep} className="p-4 rounded-full bg-black border border-fuchsia-900/30 hover:bg-fuchsia-950/20 hover:text-fuchsia-400 transition-colors text-slate-400">
                  <Volume2 size={20} />
               </button>
            </div>
         </div>
      </GlassCard>
    </div>
  );
}

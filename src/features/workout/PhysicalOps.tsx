import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dumbbell, Flame, Trophy, 
  RotateCcw, Activity, Info,
  CheckCircle2, Circle, Home, Sword
} from 'lucide-react';
import { GlassCard, cn } from '../../components/ui/GlassCard';
import { useAppStore } from '../../store/useAppStore';

// --- Sub-Component: Daily Protocol ---
function DailyProtocol() {
  const [exercises, setExercises] = useState([
    { id: '1', name: 'Elite Push-ups', sets: '4x25', completed: false, type: 'Tactical Strength' },
    { id: '2', name: 'Bulgarian Split Squats', sets: '3x15', completed: false, type: 'Operational Power' },
    { id: '3', name: 'Plank Protocol', sets: '3x60s', completed: false, type: 'Core Integrity' },
    { id: '4', name: 'Explosive Burpees', sets: '5x10', completed: false, type: 'CNS Conditioning' },
  ]);

  const toggleExercise = (id: string) => {
    setExercises(exs => exs.map(ex => ex.id === id ? { ...ex, completed: !ex.completed } : ex));
  };

  const progress = Math.round((exercises.filter(e => e.completed).length / exercises.length) * 100);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-2">
        <div>
          <p className="text-[9px] font-black text-red-500 uppercase tracking-[0.3em]">Operational Readiness</p>
          <p className="text-2xl font-black text-white uppercase tracking-tighter mt-1">{progress}% Complete</p>
        </div>
        <div className="w-32 bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
          <div className="bg-red-600 h-full transition-all duration-1000 shadow-[0_0_15px_rgba(220,38,38,0.5)]" style={{ width: `${progress}%` }} />
        </div>
      </div>
      
      <div className="space-y-3">
        {exercises.map((ex) => (
          <button
            key={ex.id}
            onClick={() => toggleExercise(ex.id)}
            className={cn(
              "w-full flex items-center justify-between p-5 rounded-2xl border transition-all group",
              ex.completed ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-black/40 border-white/5 text-slate-400 hover:border-red-600/30"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn("p-2 rounded-lg transition-colors", ex.completed ? "bg-emerald-500/20" : "bg-white/5 group-hover:bg-red-600/10")}>
                {ex.completed ? <CheckCircle2 size={18} /> : <Circle size={18} className="opacity-20" />}
              </div>
              <div className="text-left">
                <p className={cn("text-[10px] font-black uppercase tracking-widest", ex.completed ? "text-emerald-300" : "text-white")}>{ex.name}</p>
                <p className="text-[8px] font-bold uppercase mt-1 opacity-50">{ex.type}</p>
              </div>
            </div>
            <span className="text-[10px] font-black bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">{ex.sets}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// --- Sub-Component: Weekly Mission Profile ---
function WeeklySplit() {
  const DAYS = [
    { day: 'MON', focus: 'PUSH', status: 'completed' },
    { day: 'TUE', focus: 'PULL', status: 'completed' },
    { day: 'WED', focus: 'LEGS', status: 'active' },
    { day: 'THU', focus: 'REST', status: 'pending' },
    { day: 'FRI', focus: 'UPPER', status: 'pending' },
    { day: 'SAT', focus: 'LOWER', status: 'pending' },
    { day: 'SUN', focus: 'RESET', status: 'pending' },
  ];

  return (
    <div className="grid grid-cols-7 gap-2">
      {DAYS.map((d) => (
        <div key={d.day} className="flex flex-col items-center">
          <div className={cn(
            "w-full aspect-square rounded-xl flex items-center justify-center border transition-all mb-2",
            d.status === 'completed' ? "bg-red-600 border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)] text-white" :
            d.status === 'active' ? "bg-white/10 border-red-600/50 text-red-500 animate-pulse" :
            "bg-black/60 border-white/5 text-slate-700"
          )}>
            <p className="text-[9px] font-black">{d.day}</p>
          </div>
          <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest">{d.focus}</p>
        </div>
      ))}
    </div>
  );
}

// --- Main Feature Component: Physical Ops ---
export function PhysicalOps() {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Prime Execution Panel */}
        <GlassCard className="col-span-3 border-white/5 bg-black/40">
           <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-red-600/10 border border-red-600/20 rounded-xl">
                   <Sword size={20} className="text-red-500" />
                 </div>
                 <h2 className="text-xl font-black text-white uppercase tracking-tighter">PHYSICAL PROTOCOL</h2>
              </div>
              <div className="flex items-center gap-6">
                 <div className="text-right">
                    <p className="text-[8px] text-red-500 font-black uppercase tracking-widest leading-none">Streak Maintenance</p>
                    <p className="text-lg font-black text-white mt-1">14 DAYS ACTIVE</p>
                 </div>
                 <div className="bg-red-600/20 p-3 rounded-2xl border border-red-600/30">
                    <Flame size={24} className="text-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5)]" />
                 </div>
              </div>
           </div>
           
           <DailyProtocol />
        </GlassCard>

        {/* Tactical Support Panel */}
        <div className="space-y-8">
           <GlassCard className="border-white/5 bg-black/40">
              <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6 flex items-center gap-2">
                 <RotateCcw size={12} /> Weekly Mission Profile
              </h3>
              <WeeklySplit />
           </GlassCard>

           <GlassCard className="border-cyan-500/10 bg-black/40">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-cyan-500">Quick Deployment</h3>
                 <Home size={16} className="text-cyan-500" />
              </div>
              <div className="space-y-3">
                 <button className="w-full py-4 px-6 bg-cyan-600/10 hover:bg-cyan-600/20 border border-cyan-600/30 rounded-2xl text-left transition-all group">
                    <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Minimalist Recon</p>
                    <p className="text-[8px] text-cyan-500/60 font-bold uppercase mt-1">15m Bodyweight / No Equipment</p>
                 </button>
                 <button className="w-full py-4 px-6 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-2xl text-left transition-all">
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Mobility Reset</p>
                    <p className="text-[8px] text-slate-500 font-bold uppercase mt-1">Active Recovery Protocol</p>
                 </button>
              </div>
           </GlassCard>

           <GlassCard className="border-red-500/30 bg-black/60 shadow-[0_20px_40px_rgba(220,38,38,0.1)]">
              <div className="flex items-center gap-3 mb-4">
                 <Trophy size={18} className="text-amber-500" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-white">Elite Status Milestone</span>
              </div>
              <p className="text-xs text-slate-400 font-bold leading-relaxed">COMPLETE 3 MORE SESSIONS TO ACHIEVE <span className="text-red-500">TITAN LEVEL 3</span> RANKING.</p>
           </GlassCard>
        </div>
      </div>
    </div>
  );
}

// Named exports for Widget Registry
export const PhysicalOpsWidget = DailyProtocol;
export const WeeklySplitWidget = WeeklySplit;
export const QuickWorkoutWidget = () => (
  <div className="p-4 bg-cyan-950/10 border border-cyan-500/20 rounded-xl flex items-center gap-4">
    <div className="bg-cyan-600/20 p-2 rounded-lg">
      <Home size={16} className="text-cyan-400" />
    </div>
    <div>
      <p className="text-[10px] font-black uppercase text-cyan-300">Quick Protocol</p>
      <p className="text-[8px] text-cyan-600 uppercase font-black tracking-widest mt-1">Home Recon Ready</p>
    </div>
  </div>
);

import { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Droplet, Plus, Trash2, CheckCircle, Circle, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BASE_GOALS = [
  "Build a $50k Emergency Fund", "Deadlift 2.5x Bodyweight", "Run a sub 2-hour Half Marathon",
  "Master Spanish to B2 Fluency", "Read 50 classic literature books", "Solo travel across Japan",
  "Launch a profitable side-business", "Achieve 8% Body Fat at least once", "Buy an investment property",
  "Survive a 3-day water fast", "Learn to ride a motorcycle", "Skydive", "Master Advanced Cloud Architecture",
  "Automate trading strategies via API", "Build a bespoke physical library", "Invest first $100k in the market"
].map(g => ({ id: crypto.randomUUID(), text: g, completed: false }));

export function Project360() {
  const [goals, setGoals] = useLocalStorage<{id: string, text: string, completed: boolean}[]>('apex_360_goals', BASE_GOALS);
  const [hyration, setHydration] = useLocalStorage<number>('apex_hydration_today', 0);
  const [newGoal, setNewGoal] = useState('');

  const toggleGoal = (id: string) => {
    setGoals(goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };
  
  const removeGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const addGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal) return;
    setGoals([{ id: crypto.randomUUID(), text: newGoal, completed: false }, ...goals]);
    setNewGoal('');
  };

  const completedCount = goals.filter(g => g.completed).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-5xl font-black tracking-tighter text-cyan-500 drop-shadow-[0_0_12px_rgba(6,182,212,0.5)]">PROJECT 360</h2>
          <p className="text-cyan-400/80 font-bold tracking-widest uppercase mt-2">The 27-Year-Old Baseline Protocol</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {/* Hydration Tracker */}
         <GlassCard className="md:col-span-1 border-cyan-900/30 bg-black/60 shadow-[inset_0_0_20px_rgba(6,182,212,0.05)] flex flex-col items-center justify-center py-10 relative overflow-hidden group">
            <div className="absolute top-0 w-full h-full bg-cyan-900/10 transition-all group-hover:bg-cyan-600/10 pointer-events-none"></div>
            <Droplet size={48} className="text-cyan-500 mb-6 drop-shadow-[0_0_12px_rgba(6,182,212,0.5)]" />
            <h3 className="text-xs font-black text-cyan-400 uppercase tracking-[0.2em] mb-2">Daily Intake</h3>
            <p className="text-5xl font-black text-white mb-6 tracking-tighter">{hyration}L</p>
            <div className="flex gap-4 relative z-10">
               <button onClick={() => setHydration(Math.max(0, hyration - 1))} className="px-5 py-3 rounded-xl bg-black border border-cyan-900/30 text-slate-400 hover:text-cyan-400 font-black text-xl hover:bg-cyan-950/20 transition-all">-</button>
               <button onClick={() => setHydration(hyration + 1)} className="px-5 py-3 rounded-xl bg-cyan-600 border border-cyan-500 text-white font-black text-xl hover:bg-cyan-500 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]">+</button>
            </div>
         </GlassCard>

         {/* The List Overview */}
         <GlassCard className="md:col-span-3 border-cyan-900/30 bg-black/60 shadow-[inset_0_0_20px_rgba(6,182,212,0.05)] flex flex-col justify-center">
            <div className="flex justify-between w-full items-start mb-6">
              <div>
                 <h3 className="text-2xl font-black text-white tracking-wide flex items-center gap-2">
                   <Target className="text-cyan-500" /> Executive Milestones
                 </h3>
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Conquer the full list.</p>
              </div>
              <div className="text-right bg-cyan-950/30 px-6 py-4 rounded-2xl border border-cyan-900/50">
                 <p className="text-4xl font-black text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]">{completedCount} <span className="text-slate-600 text-2xl">/ {Math.max(360, goals.length)}</span></p>
                 <p className="text-[10px] text-cyan-500/80 uppercase tracking-widest font-bold mt-1">Milestones Hit</p>
              </div>
            </div>
            
            <form onSubmit={addGoal} className="flex gap-2">
               <input value={newGoal} onChange={e=>setNewGoal(e.target.value)} type="text" placeholder="Add a new paradigm-shifting goal..." className="flex-1 bg-black border border-cyan-900/40 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:border-cyan-500/50" />
               <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 font-black uppercase tracking-widest text-xs rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all">Add</button>
            </form>
         </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
         <AnimatePresence>
            {goals.map(goal => (
               <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} key={goal.id} className="relative group">
                  <button 
                    onClick={() => toggleGoal(goal.id)}
                    className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 h-full ${
                      goal.completed 
                      ? 'bg-cyan-950/20 border-cyan-900/50 opacity-60' 
                      : 'bg-black/60 border-cyan-900/20 hover:border-cyan-500/50 hover:bg-cyan-950/10 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                    }`}
                  >
                     <div className="flex items-start gap-4">
                        <div className="mt-1 flex-shrink-0">
                           {goal.completed ? <CheckCircle className="text-cyan-600" /> : <Circle className="text-cyan-900 group-hover:text-cyan-500 transition-colors" />}
                        </div>
                        <p className={`font-semibold text-sm leading-relaxed ${goal.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>{goal.text}</p>
                     </div>
                  </button>
                  <button 
                    onClick={() => removeGoal(goal.id)}
                    className="absolute bottom-4 right-4 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 bg-black rounded-lg border border-white/5"
                  >
                     <Trash2 size={16} />
                  </button>
               </motion.div>
            ))}
         </AnimatePresence>
      </div>
    </div>
  );
}

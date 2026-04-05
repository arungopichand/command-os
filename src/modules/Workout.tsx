import { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Plus, Trash2, CheckCircle2, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Workout() {
  const [workouts, setWorkouts] = useLocalStorage<{id: string, date: string, name: string, sets: number, reps: number}[]>('life_os_workouts', []);
  const [name, setName] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');

  // AI Motivational Quote
  const [quote, setQuote] = useState<{text: string, author: string} | null>(null);

  useEffect(() => {
    fetch('https://type.fit/api/quotes')
      .then(res => res.json())
      .then(data => {
        const randomQuote = data[Math.floor(Math.random() * data.length)];
        setQuote({ text: randomQuote.text, author: randomQuote.author?.split(',')[0] || 'Unknown' });
      })
      .catch(() => setQuote({ text: "Strength does not come from physical capacity. It comes from an indomitable will.", author: "Mahatma Gandhi" }));
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sets || !reps) return;
    setWorkouts([{ id: crypto.randomUUID(), date: new Date().toLocaleDateString(), name, sets: Number(sets), reps: Number(reps) }, ...workouts]);
    setName('');
    setSets('');
    setReps('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-fuchsia-300 to-purple-500 bg-clip-text text-transparent">Workout Tracker</h2>
      
      {/* Motivational Quote API */}
      <GlassCard className="border-purple-500/30 bg-gradient-to-r from-fuchsia-500/10 to-purple-500/10 backdrop-blur-xl relative overflow-hidden">
         <div className="absolute left-[30%] top-[-50%] w-64 h-64 bg-fuchsia-500/20 mix-blend-screen animate-pulse blur-3xl rounded-full"></div>
         <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-fuchsia-500/20 rounded-2xl text-fuchsia-400">
               <Quote size={28} />
            </div>
            <div>
               <p className="text-[10px] text-fuchsia-400 font-bold tracking-[0.2em] uppercase">AI Motivation</p>
               <p className="text-xl font-serif italic text-white mt-1">"{quote?.text || 'Loading inspiration...'}"</p>
               {quote && <p className="text-xs text-fuchsia-300 mt-1">— {quote.author}</p>}
            </div>
         </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-1 border-fuchsia-500/20 shadow-fuchsia-500/5">
          <h3 className="text-xl font-bold mb-6 text-fuchsia-400">Log Exercise</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Exercise Name</label>
              <input value={name} onChange={e => setName(e.target.value)} type="text" placeholder="e.g. Bench Press" className="w-full bg-black/20 border border-fuchsia-500/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500/50 transition-colors" />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs text-slate-400 mb-1 block">Sets</label>
                <input value={sets} onChange={e => setSets(e.target.value)} type="number" placeholder="0" className="w-full bg-black/20 border border-fuchsia-500/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500/50 transition-colors" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-400 mb-1 block">Reps</label>
                <input value={reps} onChange={e => setReps(e.target.value)} type="number" placeholder="0" className="w-full bg-black/20 border border-fuchsia-500/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500/50 transition-colors" />
              </div>
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold py-2.5 rounded-lg transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 mt-2">
              <Plus size={18} /> Add to Log
            </button>
          </form>
        </GlassCard>

        <GlassCard className="lg:col-span-2">
          <h3 className="text-xl font-bold mb-6 text-fuchsia-200">History</h3>
          <div className="space-y-3 h-[400px] overflow-y-auto pr-2">
            <AnimatePresence>
              {workouts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2 opacity-50">
                  <CheckCircle2 size={32} />
                  <p>No workouts logged yet. Time to hit the gym!</p>
                </div>
              ) : workouts.map(workout => (
                <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} key={workout.id} className="flex justify-between items-center p-4 bg-black/20 border border-fuchsia-500/10 rounded-xl hover:bg-black/40 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20 text-purple-400 p-3 rounded-xl border border-purple-500/20"><CheckCircle2 size={24} /></div>
                    <div>
                      <h4 className="font-bold text-lg text-slate-200">{workout.name}</h4>
                      <p className="text-xs text-slate-400">{workout.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest">Sets</p>
                      <p className="font-bold text-xl text-white">{workout.sets}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest">Reps</p>
                      <p className="font-bold text-xl text-white">{workout.reps}</p>
                    </div>
                    <button onClick={() => setWorkouts(workouts.filter(w => w.id !== workout.id))} className="text-slate-600 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

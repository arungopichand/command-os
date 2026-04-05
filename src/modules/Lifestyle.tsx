import { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Plus, Trash2, CheckSquare, Square, Tags, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Lifestyle() {
  const [habits, setHabits] = useLocalStorage<{id: string, name: string, completed: boolean}[]>('life_os_habits', [
    { id: '1', name: 'Drink 2L Water', completed: false },
    { id: '2', name: 'Read 10 pages', completed: false }
  ]);
  const [wardrobe, setWardrobe] = useLocalStorage<{id: string, item: string, category: string}[]>('life_os_wardrobe', []);
  
  const [newHabit, setNewHabit] = useState('');
  const [newItem, setNewItem] = useState('');
  const [category, setCategory] = useState('');

  // AI Advice Insight
  const [advice, setAdvice] = useState<string | null>(null);

  useEffect(() => {
    fetch('https://api.adviceslip.com/advice')
      .then(res => res.json())
      .then(data => setAdvice(data.slip.advice))
      .catch(() => setAdvice("Keep pushing forward. Every habit counts."));
  }, []);

  const toggleHabit = (id: string) => {
    setHabits(habits.map(h => h.id === id ? { ...h, completed: !h.completed } : h));
  };

  const addHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit) return;
    setHabits([...habits, { id: crypto.randomUUID(), name: newHabit, completed: false }]);
    setNewHabit('');
  };

  const addWardrobe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem) return;
    setWardrobe([{ id: crypto.randomUUID(), item: newItem, category: category || 'Misc' }, ...wardrobe]);
    setNewItem('');
    setCategory('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-teal-300 to-cyan-500 bg-clip-text text-transparent">Lifestyle & Wardrobe</h2>
      
      {/* Daily API Insight */}
      <GlassCard className="border-cyan-500/30 shadow-cyan-500/10 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 backdrop-blur-xl relative overflow-hidden">
         <div className="absolute right-[-10%] top-[-50%] w-64 h-64 bg-cyan-500/20 mix-blend-screen animate-pulse blur-3xl rounded-full"></div>
         <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-cyan-500/20 rounded-2xl text-cyan-400">
               <Sparkles size={28} />
            </div>
            <div>
               <p className="text-[10px] text-cyan-400 font-bold tracking-[0.2em] uppercase">AI Daily Insight</p>
               <p className="text-xl font-serif italic text-white mt-1">"{advice || 'Aligning your chakras...'}"</p>
            </div>
         </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Habit Tracker */}
        <GlassCard className="border-teal-500/20 shadow-teal-500/5">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-teal-400">Daily Habits</h3>
          <div className="space-y-2 mb-6">
            <AnimatePresence>
              {habits.map(habit => (
                <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.9}} key={habit.id} className="flex items-center justify-between p-3 bg-black/20 border border-teal-500/10 rounded-xl group transition-all hover:bg-teal-500/5">
                  <button onClick={() => toggleHabit(habit.id)} className="flex items-center gap-3 flex-1 text-left">
                    {habit.completed ? <CheckSquare className="text-teal-400" size={20} /> : <Square className="text-slate-500" size={20} />}
                    <span className={`font-medium transition-all ${habit.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{habit.name}</span>
                  </button>
                  <button onClick={() => setHabits(habits.filter(h => h.id !== habit.id))} className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all px-2"><Trash2 size={16}/></button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <form onSubmit={addHabit} className="flex gap-2">
            <input value={newHabit} onChange={e => setNewHabit(e.target.value)} type="text" placeholder="New positive habit..." className="flex-1 bg-black/20 border border-teal-500/20 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-teal-500/50 transition-colors" />
            <button type="submit" className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center font-bold">
              <Plus size={18} /> Add
            </button>
          </form>
        </GlassCard>

        {/* Digital Wardrobe */}
        <div className="space-y-6">
          <GlassCard className="border-pink-500/20 shadow-pink-500/5">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-pink-400">
              <Tags size={24} /> Add to Closet
            </h3>
            <form onSubmit={addWardrobe} className="space-y-4">
              <div className="flex gap-4">
                <input value={newItem} onChange={e => setNewItem(e.target.value)} type="text" placeholder="Item (e.g. Black Hoodie)" className="flex-1 bg-black/20 border border-pink-500/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-pink-500/50 transition-colors" />
                <input value={category} onChange={e => setCategory(e.target.value)} type="text" placeholder="Category" className="w-1/3 bg-black/20 border border-pink-500/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-pink-500/50 transition-colors" />
              </div>
              <button type="submit" className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-2.5 text-sm rounded-lg transition-colors flex items-center justify-center gap-2">
                <Plus size={18} /> Add Item
              </button>
            </form>
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg font-bold mb-4 text-pink-200">Inventory</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              <AnimatePresence>
                {wardrobe.length === 0 ? <p className="text-slate-400 text-sm">Closet is empty.</p> : wardrobe.map(item => (
                  <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} key={item.id} className="p-3 bg-black/20 border border-pink-500/10 rounded-xl flex justify-between items-center group">
                    <div>
                      <h4 className="font-bold text-slate-200 text-lg">{item.item}</h4>
                      <span className="text-[10px] text-pink-300 bg-pink-500/20 border border-pink-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">{item.category}</span>
                    </div>
                    <button onClick={() => setWardrobe(wardrobe.filter(w => w.id !== item.id))} className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}

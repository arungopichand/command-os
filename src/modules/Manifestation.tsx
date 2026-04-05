import { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Sparkles, Plus, Trash2, Crosshair } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Manifestation() {
  const [visions, setVisions] = useLocalStorage<{id: string, text: string, date: string}[]>('war_room_visions', [
    { id: '1', text: 'I am a highly capable .NET full-stack developer handling complex systemic architectures.', date: new Date().toLocaleDateString() },
    { id: '2', text: 'Trading execution is perfectly disciplined, strictly adhering to risk management without emotional interference.', date: new Date().toLocaleDateString() }
  ]);
  
  const [newVision, setNewVision] = useState('');

  const addVision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVision.trim()) return;
    setVisions([{ id: crypto.randomUUID(), text: newVision, date: new Date().toLocaleDateString() }, ...visions]);
    setNewVision('');
  };

  const removeVision = (id: string) => {
    setVisions(visions.filter(v => v.id !== id));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-5xl font-black tracking-tighter text-blue-500 drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]">MANIFESTATION</h2>
          <p className="text-blue-400/80 font-bold tracking-widest uppercase mt-2">Write it. Believe it. Execute.</p>
        </div>
      </div>

      <GlassCard className="border-blue-900/30 bg-black/60 shadow-[0_0_30px_rgba(59,130,246,0.05)] p-2">
        <form onSubmit={addVision} className="flex flex-col sm:flex-row gap-2">
           <input 
             value={newVision} 
             onChange={e => setNewVision(e.target.value)} 
             type="text" 
             placeholder="I will achieve..." 
             className="flex-1 bg-blue-950/20 border border-blue-900/30 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-blue-500/50 focus:bg-blue-950/40 transition-all font-serif italic text-lg" 
           />
           <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl transition-all font-black tracking-[0.2em] uppercase flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.4)]">
             <Plus size={20} /> Cement
           </button>
        </form>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        <AnimatePresence>
          {visions.map((vision, idx) => (
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95 }}
               transition={{ delay: idx * 0.05 }}
               key={vision.id} 
               className="relative group p-6 rounded-2xl bg-black border border-blue-900/20 hover:border-blue-500/40 hover:bg-blue-950/10 transition-all duration-300"
            >
               <Crosshair size={100} className="absolute -top-4 -right-4 text-blue-900/20 pointer-events-none group-hover:text-blue-500/10 group-hover:rotate-45 transition-all duration-700" />
               <p className="text-[10px] text-blue-500 uppercase tracking-widest font-black mb-3">{vision.date}</p>
               <p className="text-xl font-serif text-white/90 italic leading-relaxed relative z-10">"{vision.text}"</p>
               
               <button 
                 onClick={() => removeVision(vision.id)} 
                 className="absolute bottom-4 right-4 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
               >
                 <Trash2 size={18} />
               </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}

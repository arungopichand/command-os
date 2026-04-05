import { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Plus, Trash2, BookOpen, Video, Code, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Learning() {
  const [vault, setVault] = useLocalStorage<{id: string, type: 'book'|'course'|'skill', title: string, progress: string, link: string}[]>('apex_learning_vault', []);
  
  const [type, setType] = useState<'book'|'course'|'skill'>('course');
  const [title, setTitle] = useState('');
  const [progress, setProgress] = useState('');
  const [link, setLink] = useState('');

  const addResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setVault([{ id: crypto.randomUUID(), type, title, progress, link }, ...vault]);
    setTitle('');
    setProgress('');
    setLink('');
  };

  const removeResource = (id: string) => setVault(vault.filter(v => v.id !== id));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-5xl font-black tracking-tighter text-indigo-500 drop-shadow-[0_0_12px_rgba(99,102,241,0.5)]">LEARNING VAULT</h2>
          <p className="text-indigo-400/80 font-bold tracking-widest uppercase mt-2">Continuous Intellectual Expansion</p>
        </div>
      </div>

      <GlassCard className="border-indigo-900/30 bg-black/60 shadow-[0_0_30px_rgba(99,102,241,0.05)] p-6 mb-8">
        <form onSubmit={addResource} className="space-y-4">
          <div className="flex bg-black rounded-lg p-1 border border-indigo-900/30 max-w-xs">
             <button type="button" onClick={() => setType('course')} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-md transition-all ${type === 'course' ? 'bg-indigo-600/30 text-indigo-300 shadow-sm' : 'text-slate-500'}`}>Course</button>
             <button type="button" onClick={() => setType('book')} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-md transition-all ${type === 'book' ? 'bg-indigo-600/30 text-indigo-300 shadow-sm' : 'text-slate-500'}`}>Book</button>
             <button type="button" onClick={() => setType('skill')} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-md transition-all ${type === 'skill' ? 'bg-indigo-600/30 text-indigo-300 shadow-sm' : 'text-slate-500'}`}>Skill</button>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
             <input value={title} onChange={e=>setTitle(e.target.value)} type="text" placeholder="Title or Concept (e.g., Clean Architecture)" className="flex-[2] bg-indigo-950/20 border border-indigo-900/30 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:border-indigo-500/50" />
             <input value={progress} onChange={e=>setProgress(e.target.value)} type="text" placeholder="Progress (e.g., Chapter 3)" className="flex-1 bg-indigo-950/20 border border-indigo-900/30 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:border-indigo-500/50" />
             <input value={link} onChange={e=>setLink(e.target.value)} type="text" placeholder="URL Link (Optional)" className="flex-1 bg-indigo-950/20 border border-indigo-900/30 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:border-indigo-500/50" />
             <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 font-black uppercase tracking-widest text-xs rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all">Store</button>
          </div>
        </form>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {vault.map(item => (
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, scale:0.95}} key={item.id} className="relative group">
              <GlassCard className="border-indigo-900/20 hover:border-indigo-500/40 hover:bg-indigo-950/10 transition-all duration-300 h-full flex flex-col">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="bg-indigo-950/40 p-3 rounded-xl border border-indigo-900/40">
                       {item.type === 'book' ? <BookOpen size={20} className="text-indigo-400" /> : item.type === 'course' ? <Video size={20} className="text-indigo-400" /> : <BrainCircuit size={20} className="text-indigo-400" />}
                    </div>
                    <div>
                       <p className="text-[10px] text-indigo-500/80 uppercase tracking-widest font-black">{item.type}</p>
                       <h3 className="font-bold text-white text-lg leading-tight line-clamp-2 mt-0.5">{item.title}</h3>
                    </div>
                 </div>
                 
                 <div className="mt-auto pt-4 border-t border-indigo-900/20 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 bg-black/40 px-3 py-1.5 rounded-lg border border-indigo-900/20 truncate max-w-[150px]">
                      {item.progress || 'Not started'}
                    </span>
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 text-xs font-black uppercase tracking-widest">
                         Open Link
                      </a>
                    )}
                 </div>
                 <button onClick={() => removeResource(item.id)} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all text-slate-500 hover:text-red-500">
                    <Trash2 size={16} />
                 </button>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}

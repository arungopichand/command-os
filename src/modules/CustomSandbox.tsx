import { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Plus, Trash2, LayoutTemplate } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type SandboxItem = { id: string, text: string };
type SandboxBoard = { id: string, title: string, items: SandboxItem[] };

export function CustomSandbox() {
  const [boards, setBoards] = useLocalStorage<SandboxBoard[]>('apex_sandbox_boards', [
    { id: '1', title: 'Ideas Dump', items: [] },
    { id: '2', title: 'To Research', items: [] }
  ]);
  
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newItemTexts, setNewItemTexts] = useState<Record<string, string>>({});

  const addBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle) return;
    setBoards([...boards, { id: crypto.randomUUID(), title: newBoardTitle, items: [] }]);
    setNewBoardTitle('');
  };

  const removeBoard = (id: string) => setBoards(boards.filter(b => b.id !== id));

  const addItem = (e: React.FormEvent, boardId: string) => {
    e.preventDefault();
    const text = newItemTexts[boardId];
    if (!text) return;
    
    setBoards(boards.map(b => {
      if (b.id === boardId) {
        return { ...b, items: [...b.items, { id: crypto.randomUUID(), text }] };
      }
      return b;
    }));
    setNewItemTexts({ ...newItemTexts, [boardId]: '' });
  };

  const removeItem = (boardId: string, itemId: string) => {
    setBoards(boards.map(b => {
      if (b.id === boardId) {
        return { ...b, items: b.items.filter(i => i.id !== itemId) };
      }
      return b;
    }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col pb-4">
      <div className="flex justify-between items-end mb-8 shrink-0">
        <div>
          <h2 className="text-5xl font-black tracking-tighter text-slate-400 drop-shadow-[0_0_12px_rgba(148,163,184,0.3)]">SANDBOX</h2>
          <p className="text-slate-500 font-bold tracking-widest uppercase mt-2">Unstructured Workspace</p>
        </div>
        <form onSubmit={addBoard} className="flex gap-2">
           <input value={newBoardTitle} onChange={e=>setNewBoardTitle(e.target.value)} type="text" placeholder="New Column Name..." className="bg-black/80 border border-slate-800 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-slate-500 transition-colors w-48" />
           <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white px-4 rounded-lg flex items-center justify-center transition-colors"><Plus size={18} /></button>
        </form>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 flex-1 items-start snap-x">
         {boards.length === 0 && (
           <div className="w-full h-full flex flex-col items-center justify-center opacity-30 text-slate-500 mt-20">
              <LayoutTemplate size={64} className="mb-4" />
              <p className="font-bold uppercase tracking-widest">No environments active</p>
           </div>
         )}
         <AnimatePresence>
           {boards.map(board => (
              <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.9}} key={board.id} className="min-w-[320px] max-w-[320px] shrink-0 snap-start">
                 <GlassCard className="border-slate-800 bg-black/60 shadow-xl p-4 flex flex-col max-h-[70vh]">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-800/50">
                       <h3 className="font-bold text-slate-300 uppercase tracking-widest truncate pr-4">{board.title}</h3>
                       <button onClick={() => removeBoard(board.id)} className="text-slate-600 hover:text-red-500 transition-colors shrink-0"><Trash2 size={16} /></button>
                    </div>

                    <div className="space-y-2 overflow-y-auto mb-4 flex-1 pr-1 custom-scrollbar">
                       <AnimatePresence>
                         {board.items.map(item => (
                            <motion.div initial={{opacity:0, y:5}} animate={{opacity:1, y:0}} exit={{opacity:0, height:0}} key={item.id} className="group relative bg-slate-900/50 border border-slate-800 p-3 rounded-xl hover:border-slate-600 transition-colors">
                               <p className="text-sm text-slate-300 whitespace-pre-wrap pr-6">{item.text}</p>
                               <button onClick={() => removeItem(board.id, item.id)} className="absolute top-3 right-3 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                            </motion.div>
                         ))}
                       </AnimatePresence>
                    </div>

                    <form onSubmit={(e) => addItem(e, board.id)} className="relative mt-auto shrink-0 border-t border-slate-800/50 pt-4">
                       <input 
                         value={newItemTexts[board.id] || ''} 
                         onChange={e => setNewItemTexts({...newItemTexts, [board.id]: e.target.value})} 
                         type="text" 
                         placeholder="Add an item..." 
                         className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-slate-500 transition-colors pr-10" 
                       />
                       <button type="submit" className="absolute right-2 top-6 text-slate-500 hover:text-slate-300"><Plus size={18} /></button>
                    </form>
                 </GlassCard>
              </motion.div>
           ))}
         </AnimatePresence>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertOctagon, X, Droplets, Sparkles, Wind } from 'lucide-react';

const STATEMENTS = [
  "I keep promises to myself.",
  "No zero days. Ever.",
  "Discipline equals freedom.",
  "Build. Survive. Recover.",
  "Do the work, especially when you don't feel like it."
];

export function Layout() {
  const location = useLocation();
  const [statementIndex, setStatementIndex] = useState(0);
  const [isEmergency, setIsEmergency] = useState(false);

  useEffect(() => {
    const int = setInterval(() => {
      setStatementIndex((prev) => (prev + 1) % STATEMENTS.length);
    }, 10000);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden relative bg-[#050505] text-slate-200">
      <div className="absolute inset-0 pointer-events-none transition-colors duration-1000 bg-gradient-to-br from-red-950/10 via-[#050505] to-zinc-950 z-[-1]" />
      
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12 relative pb-24">
        {/* Emergency Reset Button */}
        <button 
          onClick={() => setIsEmergency(true)}
          className="fixed top-8 right-8 z-50 flex items-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600/30 border border-red-600/50 rounded-full text-red-500 font-bold tracking-widest uppercase text-[10px] shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all duration-300 hover:scale-105 backdrop-blur-md"
        >
          <AlertOctagon size={14} className="animate-pulse" />
          Emergency Reset
        </button>

        <div className="max-w-6xl mx-auto h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-8 h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Identity Footer */}
      <div className="fixed bottom-0 right-0 left-64 h-12 bg-black/90 border-t border-red-900/30 backdrop-blur-lg flex items-center justify-center z-40 shadow-[0_-4px_24px_rgba(0,0,0,0.5)]">
         <AnimatePresence mode="wait">
           <motion.p
             key={statementIndex}
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -10 }}
             transition={{ duration: 0.5 }}
             className="text-red-500/80 uppercase tracking-[0.3em] font-black text-xs text-center"
           >
             {STATEMENTS[statementIndex]}
           </motion.p>
         </AnimatePresence>
      </div>

      {/* Emergency Modal */}
      <AnimatePresence>
        {isEmergency && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
          >
            <div className="absolute top-8 right-8">
               <button onClick={() => setIsEmergency(false)} className="text-slate-500 hover:text-white transition-colors">
                 <X size={32} />
               </button>
            </div>
            
            <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="max-w-3xl w-full"
            >
               <h2 className="text-5xl md:text-7xl font-black text-red-600 uppercase tracking-tighter mb-4 text-center drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">Protocol Override</h2>
               <p className="text-red-400/80 text-center uppercase tracking-[0.3em] font-bold text-sm mb-12">Immediate physical intervention required.</p>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-blue-950/20 border border-blue-900/40 p-8 rounded-3xl flex flex-col items-center text-center">
                    <Droplets size={54} className="text-blue-500 mb-6 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    <h3 className="font-black text-white tracking-widest uppercase text-lg mb-2">1. Hydrate</h3>
                    <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold leading-relaxed">Drink 500ml of cold water immediately.</p>
                 </div>
                 <div className="bg-cyan-950/20 border border-cyan-900/40 p-8 rounded-3xl flex flex-col items-center text-center">
                    <Wind size={54} className="text-cyan-500 mb-6 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                    <h3 className="font-black text-white tracking-widest uppercase text-lg mb-2">2. Wash Face</h3>
                    <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold leading-relaxed">Cold water splash. Shock the nervous system.</p>
                 </div>
                 <div className="bg-emerald-950/20 border border-emerald-900/40 p-8 rounded-3xl flex flex-col items-center text-center">
                    <Sparkles size={54} className="text-emerald-500 mb-6 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <h3 className="font-black text-white tracking-widest uppercase text-lg mb-2">3. Clean</h3>
                    <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold leading-relaxed">3-minute frantic tidying of your immediate physical space.</p>
                 </div>
               </div>

               <button 
                 onClick={() => setIsEmergency(false)}
                 className="mt-12 w-full py-5 bg-red-600 hover:bg-red-500 text-white font-black tracking-[0.3em] uppercase rounded-2xl transition-all shadow-[0_0_30px_rgba(220,38,38,0.6)] hover:shadow-[0_0_50px_rgba(220,38,38,0.8)]"
               >
                 I am recovered. Back to War.
               </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

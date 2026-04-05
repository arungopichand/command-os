import { useState, useCallback, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  AlertOctagon, Droplets, Sparkles, Wind, 
  CheckCircle, AlertTriangle, EyeOff, ShieldAlert
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const STATEMENTS = [
  "I KEEP PROMISES TO MYSELF.",
  "NO ZERO DAYS. EVER.",
  "DISCIPLINE EQUALS FREEDOM.",
  "BUILD. SURVIVE. RECOVER.",
  "I AM AN ARCHITECT OF MY DESTINY."
];

export type ToastType = 'success' | 'error' | 'warning';
export type ShowToastFn = (msg: string, type?: ToastType) => void;

interface Toast {
  id: number;
  msg: string;
  type: ToastType;
}

export function MainLayout() {
  const location = useLocation();
  const { isFocusMode, toggleFocus, identityIndex } = useAppStore();
  const [isEmergency, setIsEmergency] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((msg: string, type: ToastType = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  // Listen for Strategic Global Actions
  useEffect(() => {
    const handleEmergency = () => setIsEmergency(true);
    window.addEventListener('emergency-override', handleEmergency);
    return () => window.removeEventListener('emergency-override', handleEmergency);
  }, []);

  return (
    <div className={`flex h-screen w-full overflow-hidden relative transition-colors duration-1000 ${isFocusMode ? 'bg-black' : 'bg-[#050505]'} text-slate-200`}>
      {/* Tactical Background Layer */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${isFocusMode ? 'opacity-50' : 'opacity-100'}`}>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-950/20 via-[#050505] to-zinc-950 z-[-1]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      {/* Focus Mode Protocol Overlay */}
      <AnimatePresence>
        {isFocusMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] pointer-events-none border-[12px] border-amber-500/20 shadow-[inset_0_0_100px_rgba(245,158,11,0.1)]"
          >
            <div className="absolute top-10 right-10 flex items-center gap-3 bg-amber-500 text-black px-6 py-3 rounded-full font-black text-[10px] tracking-widest uppercase animate-pulse shadow-[0_0_30px_rgba(245,158,11,0.4)] pointer-events-auto cursor-pointer" onClick={toggleFocus}>
              <EyeOff size={14} /> The Dark Zone Active
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Sidebar />
      
      <main className={`flex-1 overflow-y-auto transition-all duration-700 ${isFocusMode ? 'p-8 md:p-12 lg:p-16 blur-sm grayscale opacity-30 select-none pointer-events-none' : 'p-6 md:p-10 lg:p-12'} relative pb-32 min-w-0 custom-scrollbar`}>
        {/* Unified Dashboard Grid */}
        <div className="max-w-7xl mx-auto h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-12"
            >
              <Outlet context={{ showToast }} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Persistence Identity Ticker */}
      <div className={`fixed bottom-0 right-0 left-0 transition-all duration-500 ${isFocusMode ? 'h-0 opacity-0' : 'h-14 bg-black/80 border-t border-red-900/20 backdrop-blur-xl flex items-center justify-center z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]'}`}>
         <AnimatePresence mode="wait">
           <motion.p
             key={identityIndex}
             initial={{ opacity: 0, letterSpacing: '0.4em' }}
             animate={{ opacity: 1, letterSpacing: '0.8em' }}
             exit={{ opacity: 0, letterSpacing: '0.4em' }}
             transition={{ duration: 1.2 }}
             className="text-red-600 font-black text-[8px] text-center px-4 uppercase whitespace-nowrap"
           >
             {STATEMENTS[identityIndex % STATEMENTS.length]}
           </motion.p>
         </AnimatePresence>
      </div>

      {/* Intelligence Notification Hub */}
      <div className="fixed top-12 right-12 z-[300] space-y-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, filter: 'blur(10px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`flex items-center gap-4 px-8 py-5 rounded-3xl border-2 backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] pointer-events-auto text-xs font-black uppercase tracking-widest ${
                toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-400' :
                toast.type === 'error' ? 'bg-red-950/90 border-red-500/30 text-red-500' :
                'bg-amber-950/90 border-amber-500/30 text-amber-500'
              }`}
            >
              {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
              {toast.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Emergency Breach Modal Implementation */}
      <AnimatePresence>
        {isEmergency && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/98 backdrop-blur-3xl p-8"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.15)_0%,transparent_70%)]" />
            
            <motion.div 
               initial={{ scale: 0.95, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="max-w-4xl w-full relative z-10"
            >
              <div className="flex flex-col items-center text-center mb-16">
                 <div className="p-8 bg-red-600 rounded-[2rem] mb-10 shadow-[0_0_60px_rgba(220,38,38,0.5)]">
                   <ShieldAlert size={64} className="text-white" />
                 </div>
                 <h2 className="text-7xl md:text-9xl font-black text-white uppercase tracking-tighter mb-4 leading-none">SYSTEM BREACH</h2>
                 <p className="text-red-500 text-sm font-black uppercase tracking-[0.6em]">Tactical Recovery Required</p>
              </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {[
                   { icon: Droplets, title: 'Hydration', color: 'text-blue-500', bg: 'bg-blue-600/10', desc: 'Ingest 500ml H2O instantly.' },
                   { icon: Wind, title: 'Thermal Shock', color: 'text-cyan-500', bg: 'bg-cyan-600/10', desc: 'Cold water facial contact. Reset CNS.' },
                   { icon: Sparkles, title: 'Spatial Purge', color: 'text-emerald-500', bg: 'bg-emerald-600/10', desc: 'Clear physical environment for 180s.' }
                 ].map((step, i) => (
                   <div key={i} className={`${step.bg} border border-white/5 p-12 rounded-[3rem] flex flex-col items-center text-center group hover:border-red-600/40 transition-all`}>
                      <step.icon size={56} className={`${step.color} mb-8 group-hover:scale-110 transition-transform`} />
                      <h3 className="font-black text-white tracking-widest uppercase text-xl mb-4">{i+1}. {step.title}</h3>
                      <p className="text-slate-500 text-[11px] uppercase tracking-widest font-black leading-relaxed">{step.desc}</p>
                   </div>
                 ))}
               </div>

               <button 
                 onClick={() => setIsEmergency(false)}
                 className="mt-16 w-full py-8 bg-red-600 hover:bg-white hover:text-red-600 text-white font-black tracking-[0.5em] uppercase text-sm rounded-[2rem] transition-all shadow-[0_30px_70px_rgba(220,38,38,0.5)]"
               >
                 I am Ready for Redeployment
               </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

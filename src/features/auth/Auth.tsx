import { useState } from 'react';
import { supabase } from '../../services/supabase';
import { Lock, ShieldAlert, Zap } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { useAppStore } from '../../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';

export function Auth() {
  const { setAuthenticated } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setAuthenticated(true);
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // Auto-login after signup
        const { error: signError } = await supabase.auth.signInWithPassword({ email, password });
        if (!signError) setAuthenticated(true);
      }
    } catch (e: any) {
      setErrorMsg(e.message || "AUTHENTICATION FAULT: CONNECTION REFUSED");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020202] p-6 relative overflow-hidden font-sans">
      {/* Tactical Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-zinc-900/40 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full relative z-10"
      >
        <GlassCard className="border-red-900/30 bg-black/80 shadow-[0_0_80px_rgba(220,38,38,0.15)] p-12 flex flex-col items-center border-t-8 border-t-red-600">
           <div className="bg-red-950/20 p-5 rounded-3xl border border-red-900/30 mb-8 relative group">
              <div className="absolute inset-0 bg-red-600/10 rounded-3xl blur-md group-hover:bg-red-600/20 transition-all" />
              <Lock size={40} className="text-red-500 relative z-10" />
           </div>
           
           <div className="text-center mb-10">
              <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none mb-2">
                COMMAND<span className="text-red-600">.</span>
              </h1>
              <p className="text-[10px] text-red-500/60 uppercase tracking-[0.4em] font-black">
                Neural Interface: Authorization Required
              </p>
           </div>
           
           <form onSubmit={handleAuth} className="w-full space-y-5">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-4">Credentials: Email ID</label>
                <input 
                  type="email" 
                  placeholder="name@command.os" 
                  value={email}
                  onChange={e=>setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-red-900/20 rounded-2xl px-6 py-4 text-white placeholder-slate-800 focus:outline-none focus:border-red-500/50 focus:bg-black transition-all" 
                  required 
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-4">Passphrase: Key-Code</label>
                <input 
                  type="password" 
                  placeholder="••••••••••••" 
                  value={password}
                  onChange={e=>setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-red-900/20 rounded-2xl px-6 py-4 text-white placeholder-slate-800 focus:outline-none focus:border-red-500/50 focus:bg-black transition-all" 
                  required 
                />
              </div>

              <AnimatePresence>
                {errorMsg && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 bg-red-950/20 border border-red-500/30 rounded-2xl"
                  >
                    <ShieldAlert size={16} className="text-red-500 shrink-0" />
                    <p className="text-[10px] text-red-400 font-black uppercase tracking-widest leading-tight">
                      {errorMsg}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <button 
                disabled={loading} 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-500 disabled:bg-red-950 disabled:opacity-50 text-white font-black tracking-[0.3em] uppercase px-8 py-5 rounded-2xl mt-6 shadow-[0_15px_30px_rgba(220,38,38,0.3)] hover:shadow-[0_20px_40px_rgba(220,38,38,0.4)] hover:-translate-y-1 transition-all flex justify-center items-center gap-3"
              >
                 {loading ? (
                   <>
                     <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                     <span>Decrypting...</span>
                   </>
                 ) : (
                   <>
                     <Zap size={18} fill="currentColor" />
                     <span>{isLogin ? 'Establish Link' : 'Initialize Core'}</span>
                   </>
                 )}
              </button>
           </form>

           <button 
             onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }} 
             className="mt-10 text-[10px] text-slate-600 hover:text-red-400 uppercase tracking-[0.2em] font-black transition-colors"
           >
             {isLogin ? 'No active protocol? Register new unit.' : 'Unit already initialized? Login here.'}
           </button>
        </GlassCard>
        
        <p className="mt-8 text-center text-slate-800 text-[8px] font-black tracking-[0.5em] uppercase">
          Encryption Level: MIL-SPEC AES-256-GCM
        </p>
      </motion.div>
    </div>
  );
}

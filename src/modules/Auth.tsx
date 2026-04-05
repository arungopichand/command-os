import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Activity, Lock } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';

export function Auth({ onAuthenticated }: { onAuthenticated: () => void }) {
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
        onAuthenticated();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // Auto-login after signup
        const { error: signError } = await supabase.auth.signInWithPassword({ email, password });
        if (!signError) onAuthenticated();
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Authentication failed. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none transition-colors duration-1000 bg-gradient-to-br from-red-950/20 via-[#050505] to-zinc-950 z-0" />
      
      <GlassCard className="max-w-md w-full border-red-900/30 bg-black/80 shadow-[0_0_50px_rgba(220,38,38,0.1)] p-10 relative z-10 flex flex-col items-center">
         <div className="bg-red-950/40 p-4 rounded-full border border-red-900/40 mb-6">
            <Lock size={32} className="text-red-500" />
         </div>
         <h1 className="text-4xl font-black text-red-600 tracking-tighter uppercase mb-2">COMMAND.</h1>
         <p className="text-xs text-red-400/80 uppercase tracking-[0.2em] font-bold mb-8 text-center">Secure Database Authentication Required</p>
         
         <form onSubmit={handleAuth} className="w-full space-y-4">
            <div>
              <input 
                type="email" 
                placeholder="Secure Email ID" 
                value={email}
                onChange={e=>setEmail(e.target.value)}
                className="w-full bg-black border border-red-900/30 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-red-500/50" 
                required 
              />
            </div>
            <div>
              <input 
                type="password" 
                placeholder="Passphrase" 
                value={password}
                onChange={e=>setPassword(e.target.value)}
                className="w-full bg-black border border-red-900/30 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-red-500/50" 
                required 
              />
            </div>

            {errorMsg && <p className="text-red-500 text-xs font-bold uppercase tracking-widest text-center mt-4 bg-red-950/20 py-2 border border-red-900/30 rounded-lg">{errorMsg}</p>}
            
            <button disabled={loading} type="submit" className="w-full bg-red-600 hover:bg-red-500 disabled:bg-red-900 disabled:opacity-50 text-white font-black tracking-widest uppercase px-6 py-4 rounded-xl mt-4 shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all flex justify-center">
               {loading ? 'Decrypting...' : isLogin ? 'Access Command' : 'Initialize Command'}
            </button>
         </form>

         <button 
           onClick={() => setIsLogin(!isLogin)} 
           className="mt-6 text-xs text-slate-500 hover:text-red-400 uppercase tracking-widest font-bold transition-colors"
         >
           {isLogin ? 'No active protocol? Initialize one here.' : 'Already initialized? Access Command.'}
         </button>
      </GlassCard>
    </div>
  );
}

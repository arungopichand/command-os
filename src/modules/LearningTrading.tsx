import { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Plus, Trash2, Library, TrendingUp, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

export function LearningTrading() {
  const [learning, setLearning] = useLocalStorage<{id: string, title: string, type: 'course'|'book', progress: number}[]>('life_os_learning', []);
  const [trades, setTrades] = useLocalStorage<{id: string, ticker: string, pnl: number, notes: string}[]>('life_os_trades', []);

  // Learning State
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'course'|'book'>('course');
  
  // Trade State
  const [ticker, setTicker] = useState('');
  const [pnl, setPnl] = useState('');
  const [notes, setNotes] = useState('');

  // Live Crypto Tracker API
  const [cryptoPrices, setCryptoPrices] = useState<any>(null);
  const [loadingCrypto, setLoadingCrypto] = useState(true);

  useEffect(() => {
    const fetchCryptoPrices = async () => {
      setLoadingCrypto(true);
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true');
        const data = await res.json();
        setCryptoPrices({
          BTC: { price: data.bitcoin.usd, change: data.bitcoin.usd_24h_change },
          ETH: { price: data.ethereum.usd, change: data.ethereum.usd_24h_change },
          SOL: { price: data.solana.usd, change: data.solana.usd_24h_change },
        });
      } catch (e) {
        console.warn("Failed to fetch crypto prices", e);
      }
      setLoadingCrypto(false);
    };
    fetchCryptoPrices();
  }, []);

  const addLearning = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setLearning([{ id: crypto.randomUUID(), title, type, progress: 0 }, ...learning]);
    setTitle('');
  };

  const addTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker || !pnl) return;
    setTrades([{ id: crypto.randomUUID(), ticker: ticker.toUpperCase(), pnl: parseFloat(pnl), notes }, ...trades]);
    setTicker('');
    setPnl('');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-300 to-pink-500 bg-clip-text text-transparent">Learning & Trading</h2>
      
      {/* Live Market AI View */}
      <GlassCard className="border-pink-500/20 shadow-pink-500/10 bg-gradient-to-r from-pink-500/5 to-indigo-500/5 backdrop-blur-3xl overflow-hidden relative">
        <div className="absolute right-0 top-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl mix-blend-screen opacity-50"></div>
        <div className="flex items-center gap-2 mb-4 relative z-10">
          <Cpu size={20} className="text-pink-400" />
          <h3 className="font-bold uppercase tracking-widest text-pink-400 text-sm">Live Markets API</h3>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-2 relative z-10">
          {loadingCrypto ? <p className="text-slate-400 animate-pulse text-sm">Syncing with CoinGecko...</p> : (
            cryptoPrices && Object.entries(cryptoPrices).map(([coin, data]: any) => (
              <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} key={coin} className="flex-shrink-0 bg-black/40 border border-white/5 rounded-xl p-4 min-w-[150px]">
                <p className="text-xs text-slate-400 font-bold">{coin}/USD</p>
                <p className="text-xl font-bold text-white my-1">${data.price.toLocaleString()}</p>
                <p className={`text-xs font-semibold ${data.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {data.change >= 0 ? '▲' : '▼'} {Math.abs(data.change).toFixed(2)}% (24h)
                </p>
              </motion.div>
            ))
          )}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Log */}
        <div className="space-y-6">
          <GlassCard className="border-indigo-500/20 shadow-indigo-500/10">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-indigo-400">
              <Library size={24} /> Add Material
            </h3>
            <form onSubmit={addLearning} className="space-y-4">
              <div className="flex bg-black/20 rounded-lg p-1 border border-white/5">
                <button type="button" onClick={() => setType('course')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'course' ? 'bg-indigo-500/20 text-indigo-300 shadow-sm' : 'text-slate-400'}`}>Course</button>
                <button type="button" onClick={() => setType('book')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'book' ? 'bg-indigo-500/20 text-indigo-300 shadow-sm' : 'text-slate-400'}`}>Book</button>
              </div>
              <input value={title} onChange={e => setTitle(e.target.value)} type="text" placeholder="Algorithm Design, Clean Code..." className="w-full bg-black/20 border border-indigo-500/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500/50 transition-colors" />
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 text-sm rounded-lg transition-colors flex items-center justify-center gap-2">
                <Plus size={16} /> Add Material
              </button>
            </form>
          </GlassCard>

          <GlassCard className="min-h-[250px]">
            <h3 className="text-lg font-semibold mb-4 text-indigo-200">In Progress Syllabus</h3>
            <div className="space-y-3">
              {learning.length === 0 ? <p className="text-slate-400 text-sm">No items added.</p> : learning.map(item => (
                <div key={item.id} className="p-3 bg-black/20 border border-indigo-500/10 rounded-xl flex justify-between items-center group hover:bg-white/5 transition-all">
                  <div>
                    <h4 className="font-medium text-slate-200 text-lg">{item.title}</h4>
                    <p className="text-[10px] bg-indigo-500/20 text-indigo-300 inline-block px-2 py-0.5 mt-1 rounded-full uppercase tracking-wider">{item.type}</p>
                  </div>
                  <button onClick={() => setLearning(learning.filter(l => l.id !== item.id))} className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18}/></button>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Trade Journal */}
        <div className="space-y-6">
          <GlassCard className="border-sky-500/30 border-2 shadow-sky-500/10">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-sky-400">
              <TrendingUp size={24} /> Log Trade
            </h3>
            <form onSubmit={addTrade} className="space-y-4">
              <div className="flex gap-4">
                <input value={ticker} onChange={e => setTicker(e.target.value)} type="text" placeholder="Ticker (SOL)" className="w-1/3 bg-black/20 border border-sky-500/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-sky-500/50 transition-colors" />
                <input value={pnl} onChange={e => setPnl(e.target.value)} type="number" step="0.01" placeholder="P&L ($)" className="flex-1 bg-black/20 border border-sky-500/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-sky-500/50 transition-colors" />
              </div>
              <input value={notes} onChange={e => setNotes(e.target.value)} type="text" placeholder="AI/Trading insight. What drove you?" className="w-full bg-black/20 border border-sky-500/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-sky-500/50 transition-colors" />
              <button type="submit" className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 text-sm rounded-lg transition-colors flex items-center justify-center gap-2">
                <Plus size={16} /> Commit Trade Entry
              </button>
            </form>
          </GlassCard>

          <GlassCard className="min-h-[250px]">
            <h3 className="text-lg font-semibold mb-4 text-sky-200">Recent Executions</h3>
            <div className="space-y-3">
              {trades.length === 0 ? <p className="text-slate-400 text-sm">No trades logged.</p> : trades.map(trade => (
                <div key={trade.id} className="p-4 bg-sky-500/5 border border-sky-500/10 rounded-xl flex justify-between items-center group hover:bg-sky-500/10 transition-all">
                  <div className="flex-1 pr-4">
                    <h4 className="font-black text-white text-xl tracking-wide">{trade.ticker}</h4>
                    <p className="text-xs text-slate-400 mt-1 truncate max-w-[200px]">{trade.notes}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-black text-xl ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {trade.pnl >= 0 ? '+' : '-'}${Math.abs(trade.pnl).toFixed(2)}
                    </span>
                    <button onClick={() => setTrades(trades.filter(t => t.id !== trade.id))} className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}

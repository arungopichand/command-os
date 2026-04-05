import { useState, useEffect, useMemo } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { useAppStore } from '../../store/useAppStore';
import { 
  Plus, Trash2, 
  Briefcase, Coins, 
  BarChart3, ShieldCheck, Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Holding {
  id: string;
  type: 'crypto' | 'equity';
  symbol: string;
  coinId?: string;
  amount: number;
  buyPrice: number;
}

const CRYPTO_MAP: Record<string, string> = {
  'BTC': 'bitcoin', 'ETH': 'ethereum', 'SOL': 'solana', 'BNB': 'binancecoin', 'XRP': 'ripple',
  'ADA': 'cardano', 'AVAX': 'avalanche-2', 'DOT': 'polkadot', 'MATIC': 'matic-network', 'LINK': 'chainlink',
};

const EQUITY_BASE_PRICES: Record<string, number> = {
  'SPY': 512.45, 'QQQ': 438.20, 'NVDA': 895.10, 'TSLA': 175.40, 'AAPL': 182.30, 'MSFT': 415.60, 'AMZN': 178.50, 'GOOGL': 152.40,
};

export function Portfolio() {
  const { portfolioHoldings, setPortfolio } = useAppStore();
  const [prices, setPrices] = useState<Record<string, { price: number; change: number }>>({});
  const [viewType, setViewType] = useState<'all' | 'crypto' | 'equity'>('all');

  const [formType, setFormType] = useState<'crypto' | 'equity'>('crypto');
  const [symbol, setSymbol] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [buyPrice, setBuyPrice] = useState('');

  const fetchPrices = async () => {
    const newPrices: Record<string, { price: number; change: number }> = {};
    
    const cryptoHoldings = portfolioHoldings.filter((h: Holding) => h.type === 'crypto');
    const cryptoIds = [...new Set([...cryptoHoldings.map((h: Holding) => h.coinId!), ...Object.values(CRYPTO_MAP)])].join(',');
    
    try {
      if (cryptoIds) {
        const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds}&vs_currencies=usd&include_24hr_change=true`);
        const data = await res.json();
        Object.entries(data).forEach(([id, val]: any) => {
          newPrices[id] = { price: val.usd, change: val.usd_24h_change };
        });
      }
    } catch (e) { console.warn('Market Intel Grid Failure (Crypto)', e); }

    Object.entries(EQUITY_BASE_PRICES).forEach(([sym, price]) => {
      const vol = (Math.random() - 0.5) * 0.01;
      newPrices[sym] = { price: price * (1+vol), change: (Math.random() - 0.5) * 2 };
    });

    setPrices(newPrices);
  };

  useEffect(() => { fetchPrices(); }, [portfolioHoldings.length]);

  const addHolding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !buyPrice) return;
    
    const newHolding: Holding = {
      id: crypto.randomUUID(),
      type: formType,
      symbol: symbol.toUpperCase(),
      amount: parseFloat(amount),
      buyPrice: parseFloat(buyPrice),
      coinId: formType === 'crypto' ? (CRYPTO_MAP[symbol.toUpperCase()] || symbol.toLowerCase()) : undefined
    };

    setPortfolio([...portfolioHoldings, newHolding]);
    setAmount(''); setBuyPrice('');
  };

  const removeHolding = (id: string) => {
    setPortfolio(portfolioHoldings.filter((h: Holding) => h.id !== id));
  };

  const filteredHoldings = portfolioHoldings.filter((h: Holding) => viewType === 'all' || h.type === viewType);

  const stats = useMemo(() => portfolioHoldings.reduce((acc, h: Holding) => {
    const currentPrice = h.type === 'crypto' ? (prices[h.coinId!]?.price || 0) : (prices[h.symbol]?.price || EQUITY_BASE_PRICES[h.symbol] || h.buyPrice);
    const value = h.amount * currentPrice;
    const cost = h.amount * h.buyPrice;
    return {
      value: acc.value + value,
      cost: acc.cost + cost,
      crypto: acc.crypto + (h.type === 'crypto' ? value : 0),
      equity: acc.equity + (h.type === 'equity' ? value : 0)
    };
  }, { value: 0, cost: 0, crypto: 0, equity: 0 }), [portfolioHoldings, prices]);

  const totalPnL = stats.value - stats.cost;
  const totalPnLPct = stats.cost > 0 ? (totalPnL / stats.cost) * 100 : 0;

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="text-emerald-500 w-6 h-6" />
            <span className="text-[10px] font-black text-emerald-500/60 tracking-[0.3em] uppercase">Asset Intelligence</span>
          </div>
          <h2 className="text-6xl font-black tracking-tighter text-white leading-none">
            COMMAND. WEALTH
          </h2>
          <p className="text-xl font-bold text-emerald-400/80 tracking-widest uppercase mt-2 indent-1">
            MULTI-ASSET PORTFOLIO GRID
          </p>
        </div>

        <div className="flex gap-2 p-1.5 bg-black/40 border border-emerald-900/30 rounded-2xl">
          {(['all', 'crypto', 'equity'] as const).map(t => (
            <button key={t} onClick={() => setViewType(t)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${viewType === t ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-slate-500 hover:text-emerald-400'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <GlassCard className="border-emerald-900/30 bg-black/60 p-8 flex flex-col justify-center text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet size={60} className="text-emerald-400" />
          </div>
          <div className="relative z-10">
            <p className="text-4xl font-black text-white leading-none">${stats.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
            <p className="text-[10px] text-emerald-500/60 uppercase tracking-widest font-black mt-3">Net Asset Value</p>
          </div>
        </GlassCard>

        <GlassCard className="border-cyan-900/30 bg-black/60 p-8 flex flex-col justify-center text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <BarChart3 size={60} className="text-cyan-400" />
          </div>
          <div className="relative z-10">
            <p className="text-4xl font-black text-white leading-none">${stats.cost.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
            <p className="text-[10px] text-cyan-500/60 uppercase tracking-widest font-black mt-3">Deployed Capital</p>
          </div>
        </GlassCard>

        <GlassCard className={`p-8 flex flex-col justify-center text-center border-t-4 ${totalPnL >= 0 ? 'border-emerald-500 bg-emerald-950/10' : 'border-red-500 bg-red-950/10'}`}>
          <p className={`text-4xl font-black ${totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'} leading-none`}>
            {totalPnL >= 0 ? '+' : ''}${Math.abs(totalPnL).toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
          <div className="flex items-center justify-center gap-2 mt-3 text-[10px] uppercase font-black tracking-widest">
            <span className="text-slate-500">Unrealized P&L</span>
            <span className={totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}>{totalPnLPct.toFixed(1)}%</span>
          </div>
        </GlassCard>

        <GlassCard className="border-violet-900/30 bg-black/60 p-6 flex flex-col justify-between">
           <div>
             <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest mb-2">
                <span className="text-amber-400 flex items-center gap-1"><Coins size={12} /> Crypto</span>
                <span className="text-white">${stats.crypto.toLocaleString()}</span>
             </div>
             <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-white/5">
                <div className="bg-amber-400 h-full shadow-[0_0_8px_rgba(251,191,36,0.4)]" style={{width: `${(stats.crypto/stats.value)*100}%`}}></div>
             </div>
           </div>
           <div className="mt-4">
             <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest mb-2">
                <span className="text-sky-400 flex items-center gap-1"><Briefcase size={12} /> Equity</span>
                <span className="text-white">${stats.equity.toLocaleString()}</span>
             </div>
             <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-white/5">
                <div className="bg-sky-400 h-full shadow-[0_0_8px_rgba(56,189,248,0.4)]" style={{width: `${(stats.equity/stats.value)*100}%`}}></div>
             </div>
           </div>
        </GlassCard>
      </div>

      <GlassCard className="border-emerald-900/30 bg-black/60 p-0 overflow-hidden border-t-2 border-t-emerald-500/30">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-emerald-950/20 border-b border-emerald-900/20">
              <tr>
                {['Asset', 'Classification', 'Amount', 'Buy Basis', 'Market', 'Delta', 'Hold Value', 'Performance', ''].map(h => (
                  <th key={h} className="px-6 py-5 text-left text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {filteredHoldings.map((h: Holding) => {
                  const currentPrice = h.type === 'crypto' ? (prices[h.coinId!]?.price || 0) : (prices[h.symbol]?.price || EQUITY_BASE_PRICES[h.symbol] || h.buyPrice);
                  const change = h.type === 'crypto' ? (prices[h.coinId!]?.change || 0) : (prices[h.symbol]?.change || 0);
                  const value = h.amount * currentPrice;
                  const pnl = value - (h.amount * h.buyPrice);
                  const pnlPct = h.buyPrice > 0 ? ((currentPrice - h.buyPrice) / h.buyPrice) * 100 : 0;

                  return (
                    <motion.tr key={h.id} layout initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0, x: -20}} className="hover:bg-emerald-950/10 transition-colors group">
                      <td className="px-6 py-5"><span className="text-lg font-black tracking-tight text-white uppercase">{h.symbol}</span></td>
                      <td className="px-6 py-5">
                        <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-lg border tracking-widest ${h.type === 'crypto' ? 'text-amber-500 border-amber-900/30 bg-amber-950/20' : 'text-sky-400 border-sky-900/30 bg-sky-950/20'}`}>
                          {h.type}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-slate-300 font-bold">{h.amount.toLocaleString()}</td>
                      <td className="px-6 py-5 text-slate-500 font-bold uppercase text-[10px]">${h.buyPrice.toLocaleString()}</td>
                      <td className="px-6 py-5 text-white font-black">${currentPrice.toLocaleString()}</td>
                      <td className="px-6 py-5">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-md ${change >= 0 ? 'text-emerald-400 bg-emerald-950/30' : 'text-red-400 bg-red-950/30'}`}>
                           {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-6 py-5 text-white font-black leading-none">
                         <p>${value.toLocaleString()}</p>
                         <p className="text-[8px] text-slate-500 uppercase mt-1 tracking-widest">Total Valuation</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className={`font-black tracking-tighter text-base leading-none ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {pnl >= 0 ? '+' : '-'}${Math.abs(pnl).toLocaleString()}
                        </div>
                        <p className={`text-[10px] font-bold mt-1 ${pnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{pnlPct.toFixed(1)}%</p>
                      </td>
                      <td className="px-6 py-5">
                        <button onClick={() => removeHolding(h.id)} className="text-slate-800 hover:text-red-500 transition-all p-2 rounded-full hover:bg-red-500/10">
                           <Trash2 size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </GlassCard>

      <GlassCard className="border-emerald-900/30 bg-black/40 p-10 mt-12 border-b-4 border-b-emerald-600 shadow-[0_20px_50px_rgba(16,185,129,0.1)]">
        <h3 className="font-black uppercase tracking-[0.3em] text-emerald-400 text-sm mb-10 flex items-center gap-3">
          <Plus size={24} /> Deploy Capital
        </h3>
        <form onSubmit={addHolding} className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-3 flex flex-col gap-2">
            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2">AssetState</label>
            <select value={formType} onChange={e => setFormType(e.target.value as 'crypto' | 'equity')} className="w-full bg-black/60 border border-emerald-900/30 rounded-2xl px-6 py-4 text-white text-xs font-black uppercase tracking-[0.2em] focus:border-emerald-500 focus:outline-none transition-all">
              <option value="crypto">Cryptocurrency</option>
              <option value="equity">Equity Equity</option>
            </select>
          </div>
          <div className="md:col-span-2 flex flex-col gap-2">
             <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2">Ticker</label>
             <select value={symbol} onChange={e => setSymbol(e.target.value)} className="w-full bg-black/60 border border-emerald-900/30 rounded-2xl px-6 py-4 text-white text-xs font-black uppercase tracking-[0.2em] focus:border-emerald-500 focus:outline-none transition-all">
                {formType === 'crypto' 
                  ? Object.keys(CRYPTO_MAP).map(s => <option key={s} value={s}>{s}</option>)
                  : Object.keys(EQUITY_BASE_PRICES).map(s => <option key={s} value={s}>{s}</option>)
                }
             </select>
          </div>
          <div className="md:col-span-2 flex flex-col gap-2">
             <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2">Volume</label>
             <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" step="any" placeholder="0.00" className="w-full bg-black/60 border border-emerald-900/30 rounded-2xl px-6 py-4 text-white text-sm font-black focus:border-emerald-500 focus:outline-none transition-all" />
          </div>
          <div className="md:col-span-2 flex flex-col gap-2">
             <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2">Index Price</label>
             <input value={buyPrice} onChange={e => setBuyPrice(e.target.value)} type="number" step="any" placeholder="$0.00" className="w-full bg-black/60 border border-emerald-900/30 rounded-2xl px-6 py-4 text-white text-sm font-black focus:border-emerald-500 focus:outline-none transition-all" />
          </div>
          <div className="md:col-span-3 flex items-end">
            <button type="submit" className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-[0.3em] text-xs rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)]">
              Initialize Trade
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}

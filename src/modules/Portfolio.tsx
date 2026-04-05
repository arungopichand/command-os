import { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { TrendingUp, Plus, Trash2, RefreshCw, DollarSign, PieChart, ArrowUpRight, ArrowDownRight, Briefcase, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Holding {
  id: string;
  type: 'crypto' | 'equity';
  symbol: string;
  coinId?: string; // For CoinGecko
  amount: number;
  buyPrice: number;
}

const CRYPTO_MAP: Record<string, string> = {
  'BTC': 'bitcoin', 'ETH': 'ethereum', 'SOL': 'solana', 'BNB': 'binancecoin', 'XRP': 'ripple',
  'ADA': 'cardano', 'AVAX': 'avalanche-2', 'DOT': 'polkadot', 'MATIC': 'matic-network', 'LINK': 'chainlink',
};

// Simulated Stock Prices for Equity support if no API key
const EQUITY_BASE_PRICES: Record<string, number> = {
  'SPY': 512.45, 'QQQ': 438.20, 'NVDA': 895.10, 'TSLA': 175.40, 'AAPL': 182.30, 'MSFT': 415.60, 'AMZN': 178.50, 'GOOGL': 152.40,
};

export function Portfolio() {
  const [holdings, setHoldings] = useLocalStorage<Holding[]>('command_portfolio_v2', []);
  const [prices, setPrices] = useState<Record<string, { price: number; change: number }>>({});
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState<'all' | 'crypto' | 'equity'>('all');

  const [formType, setFormType] = useState<'crypto' | 'equity'>('crypto');
  const [symbol, setSymbol] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [buyPrice, setBuyPrice] = useState('');

  const fetchPrices = async () => {
    setLoadingCrypto(true);
    const newPrices: Record<string, { price: number; change: number }> = {};
    
    // 1. Fetch Crypto Prices
    const cryptoHoldings = holdings.filter(h => h.type === 'crypto');
    const cryptoIds = [...new Set([...cryptoHoldings.map(h => h.coinId!), ...Object.values(CRYPTO_MAP)])].join(',');
    
    try {
      if (cryptoIds) {
        const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds}&vs_currencies=usd&include_24hr_change=true`);
        const data = await res.json();
        Object.entries(data).forEach(([id, val]: any) => {
          newPrices[id] = { price: val.usd, change: val.usd_24h_change };
        });
      }
    } catch (e) { console.warn('Crypto fetch failed', e); }

    // 2. Simulate Equity Prices (Top Stocks)
    Object.entries(EQUITY_BASE_PRICES).forEach(([sym, price]) => {
      const vol = (Math.random() - 0.5) * 0.01;
      newPrices[sym] = { price: price * (1+vol), change: (Math.random() - 0.5) * 2 };
    });

    setPrices(newPrices);
    setLoadingCrypto(false);
  };

  const [loadingCrypto, setLoadingCrypto] = useState(false);

  useEffect(() => { fetchPrices(); }, [holdings.length]);

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

    setHoldings([...holdings, newHolding]);
    setAmount(''); setBuyPrice('');
  };

  const removeHolding = (id: string) => setHoldings(holdings.filter(h => h.id !== id));

  const filteredHoldings = holdings.filter(h => viewType === 'all' || h.type === viewType);

  const stats = holdings.reduce((acc, h) => {
    const currentPrice = h.type === 'crypto' ? (prices[h.coinId!]?.price || 0) : (prices[h.symbol]?.price || EQUITY_BASE_PRICES[h.symbol] || h.buyPrice);
    const value = h.amount * currentPrice;
    const cost = h.amount * h.buyPrice;
    return {
      value: acc.value + value,
      cost: acc.cost + cost,
      crypto: acc.crypto + (h.type === 'crypto' ? value : 0),
      equity: acc.equity + (h.type === 'equity' ? value : 0)
    };
  }, { value: 0, cost: 0, crypto: 0, equity: 0 });

  const totalPnL = stats.value - stats.cost;
  const totalPnLPct = stats.cost > 0 ? (totalPnL / stats.cost) * 100 : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h2 className="text-6xl font-black tracking-tighter text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">COMMAND. WEALTH</h2>
          <p className="text-emerald-400/80 font-bold tracking-widest uppercase mt-2">Multi-Asset Portfolio Intelligence</p>
        </div>
        <div className="flex gap-2 p-1 bg-black/40 border border-emerald-900/30 rounded-2xl">
          {(['all', 'crypto', 'equity'] as const).map(t => (
            <button key={t} onClick={() => setViewType(t)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewType === t ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-emerald-400'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="border-emerald-900/30 bg-black/60 p-6 flex flex-col justify-center text-center">
          <DollarSign size={24} className="text-emerald-400 mx-auto mb-3" />
          <p className="text-3xl font-black text-white">${stats.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Total Net Worth</p>
        </GlassCard>
        <GlassCard className="border-cyan-900/30 bg-black/60 p-6 flex flex-col justify-center text-center">
          <PieChart size={24} className="text-cyan-400 mx-auto mb-3" />
          <p className="text-xl font-black text-white">${stats.cost.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Total Capital Invested</p>
        </GlassCard>
        <GlassCard className={`border-emerald-900/30 bg-black/60 p-6 flex flex-col justify-center text-center ${totalPnL >= 0 ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
          <TrendingUp size={24} className={`${totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'} mx-auto mb-3`} />
          <p className={`text-xl font-black ${totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalPnL >= 0 ? '+' : ''}${Math.abs(totalPnL).toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">{totalPnLPct.toFixed(1)}% Return</p>
        </GlassCard>
        <GlassCard className="border-violet-900/30 bg-black/60 p-6 flex flex-col gap-2">
           <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
              <span className="text-amber-400 flex items-center gap-1"><Coins size={10} /> Crypto</span>
              <span className="text-white">${stats.crypto.toLocaleString()}</span>
           </div>
           <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full" style={{width: `${(stats.crypto/stats.value)*100}%`}}></div>
           </div>
           <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest mt-1">
              <span className="text-sky-400 flex items-center gap-1"><Briefcase size={10} /> Equity</span>
              <span className="text-white">${stats.equity.toLocaleString()}</span>
           </div>
           <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
              <div className="bg-sky-400 h-full" style={{width: `${(stats.equity/stats.value)*100}%`}}></div>
           </div>
        </GlassCard>
      </div>

      <GlassCard className="border-emerald-900/30 bg-black/60 p-0 overflow-hidden">
        <table className="w-full">
          <thead className="bg-emerald-950/20 border-b border-emerald-900/20">
            <tr>
              {['Asset', 'Type', 'Amount', 'Buy Price', 'Current', '24h', 'Value', 'PnL', ''].map(h => (
                <th key={h} className="px-6 py-4 text-left text-[10px] text-slate-500 uppercase font-black tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredHoldings.map(h => {
                const currentPrice = h.type === 'crypto' ? (prices[h.coinId!]?.price || 0) : (prices[h.symbol]?.price || EQUITY_BASE_PRICES[h.symbol] || h.buyPrice);
                const change = h.type === 'crypto' ? (prices[h.coinId!]?.change || 0) : (prices[h.symbol]?.change || 0);
                const value = h.amount * currentPrice;
                const pnl = value - (h.amount * h.buyPrice);
                const pnlPct = h.buyPrice > 0 ? ((currentPrice - h.buyPrice) / h.buyPrice) * 100 : 0;

                return (
                  <motion.tr key={h.id} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="border-b border-white/5 hover:bg-emerald-950/10 transition-colors group">
                    <td className="px-6 py-4"><span className="font-black text-white">{h.symbol}</span></td>
                    <td className="px-6 py-4">
                      <span className={`text-[8px] font-black uppercase px-2 py-1 rounded border ${h.type === 'crypto' ? 'text-amber-500 border-amber-900/30 bg-amber-950/20' : 'text-sky-400 border-sky-900/30 bg-sky-950/20'}`}>
                        {h.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-bold">{h.amount}</td>
                    <td className="px-6 py-4 text-slate-400 font-bold">${h.buyPrice.toLocaleString()}</td>
                    <td className="px-6 py-4 text-white font-black">${currentPrice.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                         {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white font-black">${value.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`font-black text-sm ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {pnl >= 0 ? '+' : ''}${Math.abs(pnl).toLocaleString()} ({pnlPct.toFixed(1)}%)
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => removeHolding(h.id)} className="text-slate-700 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </GlassCard>

      <GlassCard className="border-emerald-900/30 bg-black/40 p-6">
        <h3 className="font-black uppercase tracking-widest text-emerald-400 text-sm mb-6 flex items-center gap-2">
          <Plus size={18} /> Add Deployment
        </h3>
        <form onSubmit={addHolding} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select value={formType} onChange={e => setFormType(e.target.value as 'crypto' | 'equity')} className="bg-black border border-emerald-900/30 rounded-xl px-4 py-3 text-white text-xs font-black uppercase tracking-widest focus:border-emerald-500">
            <option value="crypto">Crypto</option>
            <option value="equity">Equity / Stock</option>
          </select>
          <div className="md:col-span-1">
             {formType === 'crypto' ? (
                <select value={symbol} onChange={e => setSymbol(e.target.value)} className="w-full bg-black border border-emerald-900/30 rounded-xl px-4 py-3 text-white text-xs font-black uppercase tracking-widest focus:border-emerald-500">
                  {Object.keys(CRYPTO_MAP).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
             ) : (
                <select value={symbol} onChange={e => setSymbol(e.target.value)} className="w-full bg-black border border-emerald-900/30 rounded-xl px-4 py-3 text-white text-xs font-black uppercase tracking-widest focus:border-emerald-500">
                   {Object.keys(EQUITY_BASE_PRICES).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
             )}
          </div>
          <input value={amount} onChange={e => setAmount(e.target.value)} type="number" step="any" placeholder="Amount / Shares" className="bg-black border border-emerald-900/30 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500" />
          <input value={buyPrice} onChange={e => setBuyPrice(e.target.value)} type="number" step="any" placeholder="Avg Buy Price ($)" className="bg-black border border-emerald-900/30 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500" />
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]">Deploy Capital</button>
        </form>
      </GlassCard>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { 
  TrendingUp, TrendingDown, Target, 
  ShieldAlert,
  Wallet, RefreshCcw
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { cn } from '../../utils/cn';

// --- Sub-Component: TradingView Chart ---
function AdvancedChart() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = container.current;
    if (!node) return;
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": "BINANCE:BTCUSDT",
      "interval": "D",
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1",
      "locale": "en",
      "allow_symbol_change": true,
      "calendar": false,
      "support_host": "https://www.tradingview.com"
    });
    node.appendChild(script);
    return () => {
      node.innerHTML = '';
    };
  }, []);

  return (
    <div className="h-[500px] w-full rounded-2xl overflow-hidden border border-white/5 bg-black/40" ref={container}>
      <div className="tradingview-widget-container__widget h-full w-full"></div>
    </div>
  );
}

// --- Sub-Component: Tactical Watchlist ---
function TacticalWatchlist() {
  const WATCHLIST_SYMBOLS = [
    { symbol: 'BTC/USDT', price: '94,231', change: '+2.4%', status: 'bullish' },
    { symbol: 'ETH/USDT', price: '2,845', change: '-1.2%', status: 'bearish' },
    { symbol: 'NVDA', price: '132.45', change: '+0.8%', status: 'bullish' },
    { symbol: 'TSLA', price: '241.12', change: '-3.5%', status: 'bearish' },
  ];

  return (
    <div className="space-y-4">
      {WATCHLIST_SYMBOLS.map((item) => (
        <div key={item.symbol} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] transition-all group">
          <div className="flex items-center gap-4">
            <div className={cn("p-2 rounded-lg", item.status === 'bullish' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400')}>
              {item.status === 'bullish' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            </div>
            <div>
              <p className="text-[10px] font-black text-white uppercase tracking-widest">{item.symbol}</p>
              <p className="text-[8px] text-slate-500 font-bold uppercase mt-1">Instrument Identity</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-black text-white">${item.price}</p>
            <p className={cn("text-[9px] font-bold mt-1", item.status === 'bullish' ? 'text-emerald-500' : 'text-red-500')}>{item.change}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Sub-Component: Strategic P&L Snapshot ---
function PnLSnapshot() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
        <p className="text-2xl font-black text-emerald-400">+$2,451</p>
        <p className="text-[8px] text-emerald-600 font-black uppercase tracking-[0.3em] mt-2">Daily Alpha</p>
      </div>
      <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
        <p className="text-2xl font-black text-white">+12.4%</p>
        <p className="text-[8px] text-slate-600 font-black uppercase tracking-[0.3em] mt-2">Yield Metric</p>
      </div>
    </div>
  );
}

// --- Main Feature Component: Market Command ---
export function MarketCommand() {
  return (
    <div className="space-y-10">
      {/* Tactical Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <GlassCard className="col-span-3 border-white/5 bg-black/40">
           <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-red-600/10 border border-red-600/20 rounded-xl">
                   <Target size={20} className="text-red-500" />
                 </div>
                 <h2 className="text-xl font-black text-white uppercase tracking-tighter">TECHNICAL INTELLIGENCE</h2>
              </div>
              <div className="flex items-center gap-3">
                 <button className="p-2 border border-white/10 rounded-lg text-slate-500 hover:text-white transition-all">
                    <RefreshCcw size={14} />
                 </button>
                 <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/10 transition-all">
                    Advanced View
                 </button>
              </div>
           </div>
           <AdvancedChart />
        </GlassCard>

        <div className="space-y-8">
           <GlassCard className="border-emerald-500/10 bg-black/40">
              <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-6 flex items-center gap-2">
                 <Wallet size={12} /> Strategic P&L
              </h3>
              <PnLSnapshot />
           </GlassCard>

           <GlassCard className="border-white/5 bg-black/40">
              <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6 flex items-center gap-2">
                 <TrendingUp size={12} /> Market Pulse
              </h3>
              <TacticalWatchlist />
           </GlassCard>

           <GlassCard className="border-red-500/20 bg-red-950/10 border-t-4 border-t-red-600">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-red-500">Risk Mitigation</h3>
                 <ShieldAlert size={16} className="text-red-500" />
              </div>
              <p className="text-lg font-black text-white">MAX DRAWDOWN: 2.5%</p>
              <div className="w-full bg-white/5 h-1.5 rounded-full mt-4 overflow-hidden">
                 <div className="bg-red-600 h-full w-[25%]" />
              </div>
              <p className="text-[8px] text-red-500/60 font-black uppercase mt-4 tracking-widest">Protocol: Active Containment</p>
           </GlassCard>
        </div>
      </div>
    </div>
  );
}

// Named exports for Widget Registry
export const TacticalWatchlistWidget = TacticalWatchlist;
export const MarketChartWidget = AdvancedChart;
export const RiskPanelWidget = () => (
  <div className="p-4 bg-red-950/10 border border-red-500/20 rounded-xl">
    <div className="flex items-center gap-3 mb-4">
      <ShieldAlert size={18} className="text-red-500" />
      <span className="text-[9px] font-black uppercase tracking-widest text-red-600">Risk Assessment</span>
    </div>
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-bold">
        <span className="text-slate-500">MAX EXPOSURE</span>
        <span className="text-white">$50,000</span>
      </div>
      <div className="flex justify-between text-[10px] font-bold">
        <span className="text-slate-500">UNCERTAINTY INDEX</span>
        <span className="text-amber-500">HIGH</span>
      </div>
    </div>
  </div>
);

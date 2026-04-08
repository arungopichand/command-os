import { useEffect, useRef } from 'react';
import {
  Activity,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { MetricCard } from '../../components/ui/MetricCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { cn } from '../../utils/cn';

const WATCHLIST_SYMBOLS = [
  { symbol: 'BTC/USDT', price: 94231, change: 2.4, status: 'bullish' as const },
  { symbol: 'ETH/USDT', price: 2845, change: -1.2, status: 'bearish' as const },
  { symbol: 'NVDA', price: 132.45, change: 0.8, status: 'bullish' as const },
  { symbol: 'TSLA', price: 241.12, change: -3.5, status: 'bearish' as const },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
}

function AdvancedChart() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = container.current;
    if (!node) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: 'BINANCE:BTCUSDT',
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      allow_symbol_change: true,
      calendar: false,
      support_host: 'https://www.tradingview.com',
    });

    node.appendChild(script);

    return () => {
      node.innerHTML = '';
    };
  }, []);

  return (
    <div
      ref={container}
      className="h-[420px] w-full overflow-hidden rounded-[24px] border border-white/8 bg-[rgba(5,9,14,0.72)]"
    >
      <div className="tradingview-widget-container__widget h-full w-full" />
    </div>
  );
}

function TacticalWatchlist() {
  return (
    <div className="space-y-3">
      {WATCHLIST_SYMBOLS.map((item) => (
        <div
          key={item.symbol}
          className="flex items-center justify-between rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4"
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'rounded-2xl border p-2.5',
                item.status === 'bullish'
                  ? 'border-emerald-500/18 bg-emerald-500/10 text-emerald-300'
                  : 'border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.1)] text-[color:var(--shell-brand)]',
              )}
            >
              {item.status === 'bullish' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{item.symbol}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Local watchlist</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm font-semibold text-white">{formatCurrency(item.price)}</p>
            <p className={cn('mt-1 text-[11px] font-semibold uppercase tracking-[0.14em]', item.change >= 0 ? 'text-emerald-300' : 'text-[color:var(--shell-brand)]')}>
              {item.change >= 0 ? '+' : ''}
              {item.change}%
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MarketCommand() {
  const totalPnl = 2571;
  const dailyChange = 78;
  const riskBudget = 2.5;
  const positiveMoves = WATCHLIST_SYMBOLS.filter((item) => item.change > 0).length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Market Command"
        title="Keep market context useful, not noisy"
        description="This surface stays secondary to the core loop. It should give you enough chart, watchlist, and risk context to orient quickly without pretending to be a full trading terminal."
        meta={(
          <>
            <div className="rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
              Demo data
            </div>
            <div className="rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
              Secondary surface
            </div>
          </>
        )}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Net P&L"
          value={formatCurrency(totalPnl)}
          description={`Daily move ${formatCurrency(dailyChange)}.`}
          icon={Wallet}
          tone="success"
          trend={{ value: `${dailyChange >= 0 ? '+' : '-'}${formatCurrency(Math.abs(dailyChange))}`, direction: dailyChange >= 0 ? 'up' : 'down' }}
        />
        <MetricCard
          label="Watchlist"
          value={WATCHLIST_SYMBOLS.length}
          description={`${positiveMoves} instruments printing positive change.`}
          icon={Activity}
          tone="neutral"
          trend={{ value: `${positiveMoves}/${WATCHLIST_SYMBOLS.length} green`, direction: positiveMoves >= WATCHLIST_SYMBOLS.length / 2 ? 'up' : 'neutral' }}
        />
        <MetricCard
          label="Risk Budget"
          value={`${riskBudget}%`}
          description="Maximum drawdown tolerance for the current plan."
          icon={ShieldAlert}
          tone="warning"
          trend={{ value: 'Capital first', direction: 'neutral' }}
        />
        <MetricCard
          label="Bias"
          value={positiveMoves >= WATCHLIST_SYMBOLS.length / 2 ? 'Risk On' : 'Mixed'}
          description="Simple watchlist breadth signal from the local demo set."
          icon={TrendingUp}
          tone="brand"
          trend={{ value: positiveMoves >= WATCHLIST_SYMBOLS.length / 2 ? 'Broad strength' : 'Mixed tape', direction: positiveMoves >= WATCHLIST_SYMBOLS.length / 2 ? 'up' : 'neutral' }}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <GlassCard className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="section-eyebrow">Chart</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">Technical snapshot</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Use this as a quick orientation layer before making any deeper market decision.
              </p>
            </div>
            <Activity size={18} className="text-[var(--shell-brand)]" />
          </div>

          <div className="mt-6">
            <AdvancedChart />
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-eyebrow">Watchlist</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">Priority instruments</h2>
              </div>
              <Wallet size={18} className="text-[var(--shell-brand)]" />
            </div>

            <div className="mt-6">
              <TacticalWatchlist />
            </div>
          </GlassCard>

          <GlassCard className="border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.08)] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-eyebrow">Risk</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">Contain downside first</h2>
              </div>
              <ShieldAlert size={18} className="text-[color:var(--shell-brand)]" />
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-[22px] border border-white/8 bg-[rgba(5,9,14,0.48)] px-4 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Max drawdown</p>
                <p className="mt-2 text-xl font-semibold text-white">{riskBudget}%</p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-[linear-gradient(90deg,#f05a3d_0%,#f1b94d_100%)]" style={{ width: `${riskBudget * 10}%` }} />
              </div>
              <p className="text-sm leading-relaxed text-slate-300">
                Keep size small until conviction and structure align. This module should inform decisions, not pull you into noise.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

export const TacticalWatchlistWidget = TacticalWatchlist;
export const MarketChartWidget = AdvancedChart;
export const RiskPanelWidget = () => (
  <div className="space-y-3 rounded-[24px] border border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.08)] p-5">
    <div className="flex items-center gap-3">
      <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-2.5 text-[color:var(--shell-brand)]">
        <ShieldAlert size={16} />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">Risk Panel</p>
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Demo guardrails</p>
      </div>
    </div>

    <div className="space-y-2 text-sm text-slate-300">
      <div className="flex items-center justify-between">
        <span>Max exposure</span>
        <span className="font-semibold text-white">$50,000</span>
      </div>
      <div className="flex items-center justify-between">
        <span>Risk state</span>
        <span className="font-semibold text-amber-300">Elevated</span>
      </div>
    </div>
  </div>
);

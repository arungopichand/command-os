import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { cn } from '../../utils/cn';

type MetricTone = 'neutral' | 'brand' | 'success' | 'warning';
type MetricTrendDirection = 'up' | 'down' | 'neutral';

interface MetricCardProps {
  label: string;
  value: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  tone?: MetricTone;
  trend?: {
    value: ReactNode;
    direction?: MetricTrendDirection;
  };
  className?: string;
}

const TONE_STYLES: Record<MetricTone, string> = {
  neutral: 'border-white/8 bg-[rgba(255,255,255,0.02)]',
  brand: 'border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.08)]',
  success: 'border-emerald-500/18 bg-emerald-500/8',
  warning: 'border-amber-500/18 bg-amber-500/8',
};

const ICON_STYLES: Record<MetricTone, string> = {
  neutral: 'bg-white/6 text-slate-200',
  brand: 'bg-[rgba(240,90,61,0.14)] text-[var(--shell-brand)]',
  success: 'bg-emerald-500/14 text-emerald-300',
  warning: 'bg-amber-500/14 text-amber-300',
};

const TREND_STYLES: Record<MetricTrendDirection, string> = {
  up: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200',
  down: 'border-[rgba(240,90,61,0.2)] bg-[rgba(240,90,61,0.1)] text-white',
  neutral: 'border-white/10 bg-white/[0.04] text-slate-300',
};

export function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  tone = 'neutral',
  trend,
  className,
}: MetricCardProps) {
  const trendDirection = trend?.direction ?? 'neutral';
  const TrendIcon = trendDirection === 'up' ? ArrowUpRight : trendDirection === 'down' ? ArrowDownRight : Minus;

  return (
    <GlassCard className={cn('p-5', TONE_STYLES[tone], className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">{label}</p>
          <div className="metric-value mt-3 text-2xl font-semibold tracking-tight sm:text-[1.75rem]">{value}</div>
          {description ? <p className="mt-2 text-sm leading-relaxed text-white/60">{description}</p> : null}
          {trend ? (
            <div className={cn('mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em]', TREND_STYLES[trendDirection])}>
              <TrendIcon size={12} />
              {trend.value}
            </div>
          ) : null}
        </div>

        {Icon ? (
          <div className={cn('rounded-2xl border border-white/8 p-3 shadow-[0_8px_24px_rgba(0,0,0,0.18)]', ICON_STYLES[tone])}>
            <Icon size={18} />
          </div>
        ) : null}
      </div>
    </GlassCard>
  );
}

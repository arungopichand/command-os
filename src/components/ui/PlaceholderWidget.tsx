import { Wrench } from 'lucide-react';

export function PlaceholderWidget() {
  return (
    <div className="flex h-full min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
      <div className="mb-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
        <Wrench size={22} className="text-amber-400" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.35em] text-amber-400">
        Module Pending
      </p>
      <p className="mt-3 max-w-xs text-xs font-medium leading-relaxed text-slate-500">
        This widget shell is wired into the dashboard, but its feature logic has not been implemented yet.
      </p>
    </div>
  );
}

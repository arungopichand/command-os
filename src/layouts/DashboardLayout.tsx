import { Suspense, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LayoutGrid, Settings2, Eye, EyeOff, RefreshCcw } from 'lucide-react';
import { WidgetContainer } from '../components/ui/WidgetContainer';
import { WIDGET_REGISTRY } from '../config/widgetRegistry';
import { useWidgetStore } from '../store/useWidgetStore';

interface DashboardLayoutProps {
  tabId: string;
}

export function DashboardLayout({ tabId }: DashboardLayoutProps) {
  const { tabs, resetTab } = useWidgetStore();
  const [isEditMode, setIsEditMode] = useState(false);
  
  const tab = tabs[tabId];
  if (!tab) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-center text-slate-500 border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
        <LayoutGrid size={48} className="mb-6 opacity-20" />
        <h3 className="text-xl font-black uppercase tracking-widest text-red-500/50">Mission Data Not Found</h3>
        <p className="text-[10px] uppercase tracking-[0.4em] mt-2 font-black">Verify Tab Configuration</p>
      </div>
    );
  }

  const visibleWidgets = (isEditMode ? tab.widgets : tab.widgets.filter(w => w.visible))
    .slice()
    .sort((a, b) => a.order - b.order);
  const totalWidgetCount = tab.widgets.length;
  const activeWidgetCount = tab.widgets.filter((widget) => widget.visible).length;
  const hiddenWidgetCount = totalWidgetCount - activeWidgetCount;
  const statusLabel = isEditMode
    ? `${activeWidgetCount} active, ${hiddenWidgetCount} hidden`
    : activeWidgetCount === 0
      ? 'No widgets active'
      : hiddenWidgetCount === 0
        ? `All ${activeWidgetCount} widgets active`
        : `${activeWidgetCount} active, ${hiddenWidgetCount} hidden`;

  return (
    <div className="space-y-8 md:space-y-10">
      {/* Dashboard Tactical Control Bar */}
      <div className="flex flex-col gap-4 rounded-[2rem] border border-white/5 bg-black/60 px-5 py-5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl md:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
           <div className="rounded-xl border border-red-600/20 bg-red-600/10 p-3">
             <LayoutGrid size={20} className="text-red-500" />
           </div>
           <div className="min-w-0">
             <h2 className="text-2xl font-black uppercase leading-none tracking-tighter text-white">{tab.label}</h2>
             <p className="mt-2 text-[9px] font-black uppercase leading-none tracking-[0.35em] text-slate-500 md:text-[8px] md:tracking-[0.5em]">{statusLabel}</p>
           </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
           <button 
             onClick={() => setIsEditMode(!isEditMode)}
             className={`inline-flex items-center justify-center gap-3 rounded-2xl px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${isEditMode ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'border border-white/5 bg-white/5 text-slate-500 hover:bg-white/10 hover:text-white'}`}
           >
             {isEditMode ? <Eye size={14} /> : <Settings2 size={14} />}
             {isEditMode ? 'Exit Command Mode' : 'Tactical Configuration'}
           </button>
           <button
             type="button"
             onClick={() => resetTab(tabId)}
             className="inline-flex items-center justify-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 transition-all hover:bg-white/10 hover:text-white"
           >
             <RefreshCcw size={14} />
             Reset Layout
           </button>
        </div>
      </div>

      {/* Responsive Widget Grid System */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 xl:gap-8">
        <AnimatePresence>
          {visibleWidgets.map((widget) => {
            const WidgetComponent = WIDGET_REGISTRY[widget.type];
            return (
              <WidgetContainer
                key={widget.id}
                tabId={tabId}
                widgetId={widget.id}
                type={widget.type}
                label={widget.label}
                size={widget.size}
              >
                {!widget.visible && isEditMode && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-red-500/20 bg-black/80 p-6 text-center backdrop-blur-sm">
                     <EyeOff size={24} className="mb-4 text-red-500/20" />
                     <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Widget Offline</p>
                  </div>
                )}
                <Suspense fallback={
                  <div className="h-48 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin" />
                  </div>
                }>
                  {WidgetComponent ? <WidgetComponent /> : (
                    <div className="h-48 flex items-center justify-center text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] border-2 border-dashed border-white/5 rounded-3xl">
                      Interface Not Connected
                    </div>
                  )}
                </Suspense>
              </WidgetContainer>
            );
          })}
        </AnimatePresence>

        {visibleWidgets.length === 0 && !isEditMode && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center opacity-30">
             <div className="p-8 border-2 border-dashed border-white/20 rounded-[3rem] mb-8">
               <EyeOff size={48} className="text-slate-500" />
             </div>
             <h4 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">Grid Empty. Command Mode Required.</h4>
          </div>
        )}
      </div>
    </div>
  );
}

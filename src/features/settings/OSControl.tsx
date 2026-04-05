import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, Layout, Eye, EyeOff, 
  RefreshCw, Cloud, ShieldCheck, 
  ToggleLeft, ToggleRight, Save
} from 'lucide-react';
import { GlassCard, cn } from '../../components/ui/GlassCard';
import { useWidgetStore } from '../../store/useWidgetStore';

export function OSControl() {
  const { tabs, toggleWidget, setActiveTab, activeTabId } = useWidgetStore();

  return (
    <div className="space-y-10">
      {/* Prime Control Header */}
      <div className="flex justify-between items-center bg-black/60 backdrop-blur-xl border border-white/5 px-8 py-6 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-5">
           <div className="p-4 bg-red-600 rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.3)]">
             <Settings size={28} className="text-white" />
           </div>
           <div>
             <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">OS CONTROL</h2>
             <p className="text-[10px] text-red-500 font-black uppercase tracking-[0.5em] mt-3">Tactical Configuration Interface</p>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-2xl flex items-center gap-3">
              <Cloud size={16} className="text-emerald-500" />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Supabase Sync: ACTIVE</span>
           </div>
           <button className="p-4 bg-white/5 text-slate-500 hover:text-white rounded-2xl border border-white/5 transition-all">
             <RefreshCw size={18} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Module Visibility Controller */}
        <GlassCard className="col-span-2 border-white/5 bg-black/40 p-8">
           <div className="flex items-center gap-3 mb-10">
              <Layout size={20} className="text-red-500" />
              <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">Module Visibility Engine</h3>
           </div>

           <div className="space-y-10">
              {Object.values(tabs).map((tab) => (
                <div key={tab.id} className="space-y-6">
                   <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                      <div className="w-1 h-4 bg-red-600 rounded-full" />
                      <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest">{tab.label}</h4>
                   </div>
                   
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {tab.widgets.map((widget) => (
                        <button
                          key={widget.id}
                          onClick={() => toggleWidget(tab.id, widget.id)}
                          className={cn(
                            "flex items-center justify-between p-5 rounded-2xl border transition-all group",
                            widget.visible ? "bg-white/[0.03] border-white/10 text-white" : "bg-black/60 border-white/5 text-slate-600"
                          )}
                        >
                           <div className="flex items-center gap-4">
                              <div className={cn("p-2 rounded-lg transition-colors", widget.visible ? "bg-red-600/10 text-red-500" : "bg-white/5")}>
                                 {widget.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest">{widget.label}</span>
                           </div>
                           {widget.visible ? <ToggleRight className="text-red-500" size={24} /> : <ToggleLeft size={24} />}
                        </button>
                      ))}
                   </div>
                </div>
              ))}
           </div>
        </GlassCard>

        {/* Global Tactical Presets */}
        <div className="space-y-8">
           <GlassCard className="border-red-500/20 bg-red-950/10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500 mb-8 flex items-center gap-2">
                 <ShieldCheck size={14} /> Mission Presets
              </h3>
              <div className="space-y-4">
                 <button className="w-full py-5 px-6 bg-red-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_10px_30px_rgba(220,38,38,0.3)] hover:scale-105 transition-all text-left flex justify-between items-center">
                    TRADING PROTOCOL
                    <Save size={14} className="opacity-50" />
                 </button>
                 <button className="w-full py-5 px-6 bg-white/5 border border-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all text-left">
                    DEEP FOCUS SPRINT
                 </button>
                 <button className="w-full py-5 px-6 bg-white/5 border border-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all text-left">
                    PHYSICAL RECON
                 </button>
              </div>
           </GlassCard>

           <GlassCard className="border-emerald-500/10 bg-black/40">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-6 flex items-center gap-2">
                 <Cloud size={14} /> Synchronization Intelligence
              </h3>
              <p className="text-[10px] text-slate-500 font-bold leading-relaxed mb-6">
                All tactical configurations are synchronized to the <span className="text-white">Supabase Global Grid</span>. Changes persist across all authorized devices instantly.
              </p>
              <div className="space-y-3">
                 <div className="flex justify-between items-center p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                    <span className="text-[9px] font-black uppercase text-slate-400">Realtime Engine</span>
                    <span className="text-[9px] font-black uppercase text-emerald-500">Connected</span>
                 </div>
                 <div className="flex justify-between items-center p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                    <span className="text-[9px] font-black uppercase text-slate-400">Tactical Backup</span>
                    <span className="text-[9px] font-black uppercase text-slate-600">Pending</span>
                 </div>
              </div>
           </GlassCard>

           <div className="p-10 border border-white/10 rounded-[3rem] bg-white/[0.01] flex flex-col items-center text-center opacity-40">
              <ShieldCheck size={48} className="text-slate-600 mb-6" />
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]">Command Grade Encryption</p>
           </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, X, GripVertical, Edit3 } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { useWidgetStore, type WidgetSize } from '../../store/useWidgetStore';
import { cn } from '../../utils/cn';

interface WidgetContainerProps {
  tabId: string;
  widgetId: string;
  type: string;
  label: string;
  size: WidgetSize;
  children: React.ReactNode;
  isDraggable?: boolean;
}

export function WidgetContainer({ tabId, widgetId, label, size, children, isDraggable = true }: WidgetContainerProps) {
  const { toggleWidget, updateWidgetSize, renameWidget } = useWidgetStore();
  const [showSettings, setShowSettings] = useState(false);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [newLabel, setNewLabel] = useState(label);

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    renameWidget(tabId, widgetId, newLabel);
    setIsEditingLabel(false);
  };

  const sizeClasses = {
    sm: 'col-span-1 row-span-1',
    md: 'col-span-1 md:col-span-2 row-span-1',
    lg: 'col-span-1 md:col-span-2 row-span-2',
    full: 'col-span-1 md:col-span-4 row-span-2'
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn("relative group/widget", sizeClasses[size])}
    >
      <GlassCard className="h-full border-white/5 bg-black/40 hover:border-red-600/20 transition-all duration-500 p-0 overflow-hidden flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.3)]">
        
        {/* Widget Strategic Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02] backdrop-blur-sm">
          <div className="flex items-center gap-3">
             {isDraggable && <GripVertical size={14} className="text-white/20 cursor-grab active:cursor-grabbing hover:text-red-500/50 transition-colors" />}
             {isEditingLabel ? (
               <form onSubmit={handleRename}>
                 <input
                   autoFocus
                   value={newLabel}
                   onChange={e => setNewLabel(e.target.value)}
                   onBlur={handleRename}
                   className="bg-red-950/20 border border-red-500/30 rounded px-2 py-0.5 text-[10px] font-black uppercase text-white focus:outline-none"
                 />
               </form>
             ) : (
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover/widget:text-red-500 transition-colors flex items-center gap-2">
                 {label}
                 <Edit3 size={10} className="opacity-0 group-hover/widget:opacity-100 cursor-pointer text-white/30" onClick={() => setIsEditingLabel(true)} />
               </h3>
             )}
          </div>

          <div className="flex items-center gap-2">
             <button onClick={() => setShowSettings(!showSettings)} className="p-1.5 hover:bg-white/5 rounded-lg text-white/20 hover:text-red-500 transition-all">
                <Settings2 size={14} />
             </button>
             <button onClick={() => toggleWidget(tabId, widgetId)} className="p-1.5 hover:bg-white/5 rounded-lg text-white/20 hover:text-red-600 transition-all">
                <X size={14} />
             </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 relative overflow-hidden">
          {children}
        </div>

        {/* Settings Tactical Overlay */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute inset-0 z-20 bg-black/95 backdrop-blur-md p-8 flex flex-col justify-center"
            >
              <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-red-500 mb-6">Size Configuration</h4>
              <div className="grid grid-cols-2 gap-3 mb-8">
                 {(['sm', 'md', 'lg', 'full'] as WidgetSize[]).map(s => (
                   <button
                     key={s}
                     onClick={() => { updateWidgetSize(tabId, widgetId, s); setShowSettings(false); }}
                     className={cn(
                       "px-4 py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all",
                       size === s ? "bg-red-600 border-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]" : "bg-white/5 border-white/5 text-slate-500 hover:text-white"
                     )}
                   >
                     {s}
                   </button>
                 ))}
              </div>
              <button onClick={() => setShowSettings(false)} className="mx-auto text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors">
                 Close Uplink
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  );
}

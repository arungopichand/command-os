import { useLocalStorage } from '../hooks/useLocalStorage';
import { GlassCard } from '../components/ui/GlassCard';
import { Target, CheckSquare, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function HabitMatrix() {
  const [gridData, setGridData] = useLocalStorage<Record<string, boolean>>('war_room_habit_matrix', {});

  // Generate days between Mar 21 and May 15
  const generateDays = () => {
    const days = [];
    let current = new Date(new Date().getFullYear(), 2, 21); // Mar 21
    const end = new Date(new Date().getFullYear(), 4, 15); // May 15

    // If we are past May 15 this year, generate for next year? Or just current year.
    // Assume current year context.
    
    while (current <= end) {
      days.push({
        id: current.toISOString().split('T')[0],
        monthStr: current.toLocaleString('default', { month: 'short' }),
        dayNum: current.getDate()
      });
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  const days = generateDays();

  const toggleDay = (id: string) => {
    setGridData({ ...gridData, [id]: !gridData[id] });
  };

  const completedCount = Object.values(gridData).filter(Boolean).length;
  const percentage = Math.round((completedCount / days.length) * 100) || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-5xl font-black tracking-tighter text-amber-500 drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]">HABIT MATRIX</h2>
          <p className="text-amber-400/80 font-bold tracking-widest uppercase mt-2">March 21 — May 15 | No Zero Days</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-white">{percentage}%</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Campaign Status</p>
        </div>
      </div>

      <GlassCard className="border-amber-900/30 bg-black/60 shadow-[inset_0_0_30px_rgba(245,158,11,0.05)] p-8">
         <div className="flex items-center justify-between mb-8">
           <h3 className="font-bold uppercase tracking-[0.2em] text-amber-400 flex items-center gap-2">
             <Target size={20} /> The Grid
           </h3>
           <p className="text-xs text-slate-400 font-bold uppercase tracking-widest bg-amber-950/20 px-4 py-2 border border-amber-900/30 rounded-lg">
             {completedCount} / {days.length} Days Won
           </p>
         </div>

         {/* 7 Columns Grid */}
         <div className="grid grid-cols-7 gap-3 sm:gap-4 max-w-5xl mx-auto">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-[10px] font-black text-slate-500 uppercase tracking-widest pb-2">
                {d}
              </div>
            ))}
            
            {/* Empty slots for start padding if Mar 21 isn't Sunday */}
            {Array.from({ length: new Date(new Date().getFullYear(), 2, 21).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square opacity-0"></div>
            ))}

            <AnimatePresence>
              {days.map((day, i) => {
                const isWon = gridData[day.id];
                return (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.005 }}
                    key={day.id}
                    onClick={() => toggleDay(day.id)}
                    className={`aspect-square relative flex flex-col items-center justify-center rounded-xl border transition-all duration-300 group ${
                      isWon 
                      ? 'bg-amber-500/20 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:bg-amber-500/30' 
                      : 'bg-black border-amber-900/20 hover:border-amber-500/30 hover:bg-amber-950/20'
                    }`}
                  >
                    <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${isWon ? 'text-amber-300/60' : 'text-slate-600'}`}>{day.monthStr}</span>
                    <span className={`text-xl font-black transition-colors ${isWon ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'text-slate-400 group-hover:text-amber-500/50'}`}>{day.dayNum}</span>
                    
                    {isWon && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-2 bg-amber-500 text-black rounded-full p-0.5">
                        <CheckSquare size={12} className="fill-amber-500" />
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </AnimatePresence>
         </div>
      </GlassCard>
    </div>
  );
}

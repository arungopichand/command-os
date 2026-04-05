import { useLocalStorage } from '../hooks/useLocalStorage';
import { GlassCard } from '../components/ui/GlassCard';
import { Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export function HabitMatrix() {
  const [gridData, setGridData] = useLocalStorage<Record<string, boolean>>('war_room_habit_matrix', {});
  const [currentYear] = useState(new Date().getFullYear());
  const today = new Date().toISOString().split('T')[0];

  // Generate days for the entire year, grouped by month
  const generateYearlyData = () => {
    const months = [];
    for (let m = 0; m < 12; m++) {
      const monthDays = [];
      const date = new Date(currentYear, m, 1);
      const monthName = date.toLocaleString('default', { month: 'long' });
      
      while (date.getMonth() === m) {
        monthDays.push({
          id: date.toISOString().split('T')[0],
          dayNum: date.getDate(),
          isToday: date.toISOString().split('T')[0] === today,
          dayOfWeek: date.getDay()
        });
        date.setDate(date.getDate() + 1);
      }
      months.push({ name: monthName, days: monthDays, monthIdx: m });
    }
    return months;
  };

  const yearlyData = generateYearlyData();

  const toggleDay = (id: string) => {
    setGridData({ ...gridData, [id]: !gridData[id] });
  };

  const allDays = yearlyData.flatMap(m => m.days);
  const completedCount = allDays.filter(d => gridData[d.id]).length;
  const annualProgress = Math.round((completedCount / allDays.length) * 100) || 0;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h2 className="text-5xl font-black tracking-tighter text-amber-500 drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]">ANNUAL MATRIX</h2>
          <p className="text-amber-400/80 font-bold tracking-widest uppercase mt-2">{currentYear} | Full Operational Cycle</p>
        </div>
        <div className="bg-amber-950/20 px-8 py-4 rounded-2xl border border-amber-900/30 text-right min-w-[200px]">
          <p className="text-4xl font-black text-white">{annualProgress}%</p>
          <p className="text-[10px] text-amber-500 uppercase tracking-widest font-bold">Annual Win Rate</p>
          <div className="w-full bg-amber-900/20 h-1.5 rounded-full mt-3 overflow-hidden">
             <motion.div initial={{width: 0}} animate={{width: `${annualProgress}%`}} className="h-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {yearlyData.map((month) => {
          const monthCompleted = month.days.filter(d => gridData[d.id]).length;
          const monthPct = Math.round((monthCompleted / month.days.length) * 100);
          
          return (
            <GlassCard key={month.name} className="border-amber-900/20 bg-black/40 p-6 flex flex-col h-full relative group hover:bg-black/60 transition-all">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black uppercase tracking-[0.2em] text-amber-400 text-sm flex items-center gap-2">
                  <Calendar size={16} /> {month.name}
                </h3>
                <span className="text-[10px] font-bold text-slate-500 uppercase">{monthPct}%</span>
              </div>

              <div className="grid grid-cols-7 gap-1.5 mb-4">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={`${month.name}-${d}-${i}`} className="text-center text-[8px] font-black text-slate-700 uppercase">{d}</div>
                ))}
                
                {/* Padding for start of month */}
                {Array.from({ length: month.days[0].dayOfWeek }).map((_, i) => (
                  <div key={`${month.name}-pad-${i}`} className="aspect-square opacity-0"></div>
                ))}

                {month.days.map((day) => {
                  const isWon = gridData[day.id];
                  return (
                    <motion.button
                      key={day.id}
                      onClick={() => toggleDay(day.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={`aspect-square relative flex items-center justify-center rounded-md border text-[10px] font-black transition-all duration-300 ${
                        day.isToday
                          ? 'border-amber-500 ring-2 ring-amber-500/50 ring-offset-2 ring-offset-black shadow-[0_0_15px_rgba(245,158,11,0.6)] z-10'
                          : isWon
                            ? 'bg-amber-500 border-amber-400 text-black shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                            : 'bg-black/40 border-amber-900/10 text-slate-600 hover:border-amber-900/50 hover:text-amber-500/50'
                      }`}
                    >
                      {day.dayNum}
                      {day.isToday && (
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[7px] px-1.5 py-0.5 rounded font-black uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                          CRITICAL TARGET: TODAY
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <div className="mt-auto pt-4 border-t border-amber-900/10 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-600">
                <span>{monthCompleted} / {month.days.length} Won</span>
                <div className="flex gap-1">
                   {Array.from({length: 5}).map((_, i) => (
                     <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < Math.floor(monthPct/20) ? 'bg-amber-500' : 'bg-amber-900/20'}`}></div>
                   ))}
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}

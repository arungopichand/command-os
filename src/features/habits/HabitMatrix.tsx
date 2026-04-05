import { GlassCard } from '../../components/ui/GlassCard';
import { useAppStore } from '../../store/useAppStore';
import { Calendar, Flame, Target, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';

export function HabitMatrix() {
  const { habitMatrix, updateHabit } = useAppStore();
  const [currentYear] = useState(new Date().getFullYear());
  const today = new Date().toISOString().split('T')[0];

  // Generate days for the entire year, grouped by month
  const yearlyData = useMemo(() => {
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
  }, [currentYear, today]);

  const toggleDay = (id: string) => {
    updateHabit(id);
  };

  const allDays = yearlyData.flatMap(m => m.days);
  const completedCount = allDays.filter(d => habitMatrix[d.id]).length;
  const annualProgress = Math.round((completedCount / allDays.length) * 100) || 0;

  // Streak Calculation
  const currentStreak = useMemo(() => {
    let streak = 0;
    const sortedDays = [...allDays].reverse();
    const todayIdx = sortedDays.findIndex(d => d.isToday);
    
    if (todayIdx === -1) return 0;

    for (let i = todayIdx; i < sortedDays.length; i++) {
      if (habitMatrix[sortedDays[i].id]) {
        streak++;
      } else if (i > todayIdx) {
        // If we missed today, the streak might still be from yesterday
        break;
      } else if (i === todayIdx && !habitMatrix[sortedDays[i].id]) {
        // Check if there's a streak ending yesterday
        continue; 
      } else {
        break;
      }
    }
    return streak;
  }, [allDays, habitMatrix]);

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Target className="text-amber-500 w-6 h-6" />
            <span className="text-[10px] font-black text-amber-500/60 tracking-[0.3em] uppercase">Discipline Coordinate</span>
          </div>
          <h2 className="text-6xl font-black tracking-tighter text-white leading-none">
            ANNUAL MATRIX
          </h2>
          <p className="text-xl font-bold text-amber-400/80 tracking-widest uppercase mt-2 indent-1">
            {currentYear} | FULL OPERATIONAL CYCLE
          </p>
        </div>

        <div className="flex gap-4 w-full lg:w-auto">
          <GlassCard className="flex-1 lg:flex-none bg-amber-950/20 border-amber-900/30 p-6 min-w-[160px] text-center relative overflow-hidden">
             <div className="relative z-10">
               <p className="text-4xl font-black text-white">{currentStreak}</p>
               <p className="text-[10px] text-amber-500 uppercase tracking-widest font-black mt-1">Current Streak</p>
             </div>
             <Flame size={40} className="absolute -right-2 -bottom-2 text-amber-500/10 rotate-12" />
          </GlassCard>

          <GlassCard className="flex-1 lg:flex-none bg-black/40 border-amber-900/30 p-6 min-w-[200px] text-right">
            <p className="text-4xl font-black text-white">{annualProgress}%</p>
            <p className="text-[10px] text-amber-500 uppercase tracking-widest font-black mt-1">Annual Win Rate</p>
            <div className="w-full bg-amber-900/20 h-1.5 rounded-full mt-4 overflow-hidden border border-white/5">
               <motion.div 
                 initial={{ width: 0 }} 
                 animate={{ width: `${annualProgress}%` }} 
                 className="h-full bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]" 
               />
            </div>
          </GlassCard>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {yearlyData.map((month) => {
          const monthCompleted = month.days.filter(d => habitMatrix[d.id]).length;
          const monthPct = Math.round((monthCompleted / month.days.length) * 100);
          
          return (
            <GlassCard key={month.name} className="border-amber-900/20 bg-black/40 p-6 flex flex-col h-full relative group hover:bg-black/80 transition-all border-t-2 border-t-amber-500/30">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black uppercase tracking-[0.2em] text-amber-400 text-xs flex items-center gap-2">
                  <Calendar size={14} className="text-amber-600" /> {month.name}
                </h3>
                <div className="flex items-center gap-2">
                   <div className="h-1 w-12 bg-amber-950/40 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: `${monthPct}%` }} />
                   </div>
                   <span className="text-[10px] font-black text-slate-500">{monthPct}%</span>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-6">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={`${month.name}-${d}-${i}`} className="text-center text-[9px] font-black text-slate-700 uppercase">{d}</div>
                ))}
                
                {Array.from({ length: month.days[0].dayOfWeek }).map((_, i) => (
                  <div key={`${month.name}-pad-${i}`} className="aspect-square"></div>
                ))}

                {month.days.map((day) => {
                  const isWon = habitMatrix[day.id];
                  return (
                    <motion.button
                      key={day.id}
                      onClick={() => toggleDay(day.id)}
                      whileHover={{ scale: 1.15, zIndex: 10 }}
                      whileTap={{ scale: 0.9 }}
                      className={`aspect-square relative flex items-center justify-center rounded-lg border text-[10px] font-black transition-all duration-300 ${
                        day.isToday
                          ? 'border-amber-400 ring-2 ring-amber-500/30 ring-offset-4 ring-offset-black shadow-[0_0_20px_rgba(245,158,11,0.4)] z-10 bg-amber-950/20'
                          : isWon
                            ? 'bg-amber-500 border-amber-300 text-black shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                            : 'bg-black/40 border-white/5 text-slate-700 hover:border-amber-900/50 hover:text-amber-500/50'
                      }`}
                    >
                      {day.dayNum}
                      {day.isToday && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                   <Trophy size={12} className={monthPct === 100 ? "text-amber-400" : "text-slate-700"} />
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{monthCompleted} / {month.days.length}</span>
                </div>
                <div className="flex gap-0.5">
                   {Array.from({length: 4}).map((_, i) => (
                     <div key={i} className={`w-1 h-3 rounded-full ${i < Math.floor(monthPct/25) ? 'bg-amber-500' : 'bg-amber-900/20'}`}></div>
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

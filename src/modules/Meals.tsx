import { GlassCard } from '../components/ui/GlassCard';
import { Utensils, Wheat, Egg, Flame, Clock, BatteryCharging } from 'lucide-react';

const MEALS = [
  { id: 1, name: 'Oatmeal Power Bowl', staple: 'Oats', cost: 'Super Low', time: '5m', icon: Wheat, desc: '1 cup oats, 2 cups water, 1 tbsp peanut butter, 1 banana. Microwave 3 mins. High slow-carb energy.', cal: '500 kcal' },
  { id: 2, name: 'The 6-Egg Scramble', staple: 'Eggs', cost: 'Low', time: '10m', icon: Egg, desc: '6 large eggs scrambled in a hot pan with salt. Pure protein and healthy fats for cognitive function.', cal: '420 kcal' },
  { id: 3, name: 'Dal Tadka (Lentils)', staple: 'Dal', cost: 'Super Low', time: '30m', icon: Flame, desc: 'Boil 1 cup yellow lentils. In a pan, fry cumin, garlic, and chopped onions. Mix and simmer. Vegan protein.', cal: '350 kcal' },
  { id: 4, name: 'Egg Fried Rice', staple: 'Rice & Eggs', cost: 'Low', time: '15m', icon: Utensils, desc: 'Day-old cold rice, 3 eggs, soy sauce, and frozen veggies. High heat wok/pan. Massive carb refeed.', cal: '650 kcal' },
  { id: 5, name: 'Rice & Beans', staple: 'Rice & Beans', cost: 'Super Low', time: '20m', icon: BatteryCharging, desc: 'White rice with black beans, heavily spiced with cumin and cayenne. The ultimate survival staple.', cal: '400 kcal' },
];

export function Meals() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-5xl font-black tracking-tighter text-emerald-500 drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]">MEAL LOOP</h2>
          <p className="text-emerald-400/80 font-bold tracking-widest uppercase mt-2">Low-Budget. High-Octane. Fuel Only.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {MEALS.map((meal) => {
           const Icon = meal.icon;
           return (
             <GlassCard key={meal.id} className="border-emerald-900/30 bg-black/60 shadow-[inset_0_0_15px_rgba(16,185,129,0.05)] hover:border-emerald-500/50 hover:bg-emerald-950/20 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                   <div className="bg-emerald-950/40 p-3 rounded-2xl border border-emerald-900/40 group-hover:bg-emerald-600/20 transition-colors">
                      <Icon size={24} className="text-emerald-500" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded-md border border-emerald-900/40">
                     {meal.staple}
                   </span>
                </div>
                <h3 className="text-xl font-black text-white tracking-wide mb-1 flex items-center gap-2">{meal.name}</h3>
                
                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 bg-black/40 p-2 rounded-lg border border-emerald-900/10">
                   <span className="flex items-center gap-1"><Clock size={12} className="text-emerald-500/70" /> {meal.time}</span>
                   <span className="text-emerald-700 font-black">•</span>
                   <span className="flex items-center gap-1 text-emerald-400">{meal.cal}</span>
                </div>

                <p className="text-sm font-medium text-slate-400 leading-relaxed mb-4 min-h-[60px]">{meal.desc}</p>
                
                <div className="pt-4 border-t border-emerald-900/20 text-xs font-black uppercase tracking-widest text-slate-500">
                   Cost Level: <span className="text-emerald-500">{meal.cost}</span>
                </div>
             </GlassCard>
           )
         })}
      </div>
    </div>
  );
}

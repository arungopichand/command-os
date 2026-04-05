import { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Plus, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function Financials() {
  const [entries, setEntries] = useLocalStorage<{id: string, type: 'income'|'expense', amount: number, desc: string}[]>('life_os_financials', []);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income'|'expense'>('expense');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;
    setEntries([{ id: crypto.randomUUID(), type, amount: parseFloat(amount), desc }, ...entries]);
    setDesc('');
    setAmount('');
  };

  const removeEntry = (id: string) => setEntries(entries.filter(e => e.id !== id));

  const totalIncome = entries.filter(e => e.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = entries.filter(e => e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  const chartData = [
    { name: 'Income', value: totalIncome },
    { name: 'Expenses', value: totalExpense },
  ];
  const COLORS = ['#34d399', '#fb7185']; // emerald-400 and rose-400

  return (
    <div className="space-y-6">
      <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-300 to-teal-500 bg-clip-text text-transparent">Financials</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="md:col-span-1 bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20 shadow-emerald-500/10">
          <p className="text-sm text-emerald-300/80 uppercase tracking-wider font-semibold">Total Income</p>
          <p className="text-4xl font-bold text-white mt-2">${totalIncome.toFixed(2)}</p>
        </GlassCard>
        <GlassCard className="md:col-span-1 bg-gradient-to-br from-rose-500/10 to-transparent border-rose-500/20 shadow-rose-500/10">
          <p className="text-sm text-rose-300/80 uppercase tracking-wider font-semibold">Total Expenses</p>
          <p className="text-4xl font-bold text-white mt-2">${totalExpense.toFixed(2)}</p>
        </GlassCard>
        <GlassCard className={`md:col-span-1 bg-gradient-to-br transition-colors ${balance >= 0 ? 'from-blue-500/10 border-blue-500/20 shadow-blue-500/10' : 'from-orange-500/10 border-orange-500/20 shadow-orange-500/10'} to-transparent`}>
          <p className="text-sm text-slate-300/80 uppercase tracking-wider font-semibold">Monthly Balance</p>
          <p className={`text-4xl font-bold mt-2 ${balance >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>${balance.toFixed(2)}</p>
        </GlassCard>
        <div className="md:col-span-1 flex justify-center items-center h-full relative">
          {(totalIncome > 0 || totalExpense > 0) ? (
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={chartData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-32 h-32 rounded-full border-4 border-dashed border-white/10 flex items-center justify-center text-slate-500 text-xs text-center">No Chart Data</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 align-top items-start">
        <GlassCard className="lg:col-span-1">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-emerald-300">Add Transaction</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="flex bg-black/20 rounded-lg p-1 border border-emerald-500/10">
              <button type="button" onClick={() => setType('income')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'income' ? 'bg-emerald-500/20 text-emerald-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>Income</button>
              <button type="button" onClick={() => setType('expense')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'expense' ? 'bg-rose-500/20 text-rose-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>Expense</button>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Description</label>
              <input value={desc} onChange={e => setDesc(e.target.value)} type="text" placeholder="e.g. Salary, Groceries" className="w-full bg-black/20 border border-emerald-500/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 transition-colors" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Amount ($)</label>
              <input value={amount} onChange={e => setAmount(e.target.value)} type="number" step="0.01" placeholder="0.00" className="w-full bg-black/20 border border-emerald-500/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 transition-colors" />
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2.5 rounded-lg transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-2">
              <Plus size={18} /> Add Entry
            </button>
          </form>
        </GlassCard>

        <GlassCard className="lg:col-span-2">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">Recent Transactions</h3>
          <div className="space-y-3 h-[300px] overflow-y-auto pr-2">
            {entries.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2 opacity-50">
                <Trash2 size={32} />
                <p>No transactions recorded yet.</p>
              </div>
            ) : entries.map(entry => (
              <div key={entry.id} className="flex justify-between items-center p-4 bg-black/20 border border-emerald-500/5 rounded-xl hover:bg-white/5 transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-10 rounded-full ${entry.type === 'income' ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                  <div>
                    <p className="font-medium text-slate-200 text-lg">{entry.desc}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">{entry.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-semibold text-lg ${entry.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {entry.type === 'income' ? '+' : '-'}${entry.amount.toFixed(2)}
                  </span>
                  <button onClick={() => removeEntry(entry.id)} className="text-slate-600 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

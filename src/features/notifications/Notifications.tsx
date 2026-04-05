import { useState, useEffect } from 'react';
import { generateUUID } from '../../utils/uuid';
import { GlassCard } from '../../components/ui/GlassCard';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { 
  Bell, BellOff, BellRing, Check, 
  Save, Clock, ShieldCheck, Zap, Plus,
  Trash2, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  requestNotificationPermission,
  getNotificationPermission,
  scheduleNotificationsForToday,
  showImmediateNotification
} from '../../services/notifications';

interface Alert {
  id: string;
  label: string;
  time: string;
  message: string;
  enabled: boolean;
}

const DEFAULT_ALERTS: Alert[] = [
  { id: '1', label: 'Morning Deploy', time: '07:00', message: 'War Room is open. Initiate your Build Phase.', enabled: true },
  { id: '2', label: '1H Check-In', time: '08:00', message: 'One hour in. Are you on mission?', enabled: true },
  { id: '3', label: 'Midday Recon', time: '13:00', message: 'Hydrate. Are your afternoon tasks on track?', enabled: true },
  { id: '4', label: 'English Protocol', time: '17:00', message: 'Initiate the 20-min English Lexicon session.', enabled: true },
  { id: '5', label: 'Evening Debrief', time: '20:00', message: 'Log your progress and prepare for tomorrow.', enabled: false },
  { id: '6', label: 'Sleep Protocol', time: '22:30', message: 'System shutdown. Lights off in 30 minutes.', enabled: false },
];

export function Notifications() {
  const [alerts, setAlerts] = useLocalStorage<Alert[]>('command_notification_alerts_v2', DEFAULT_ALERTS);
  const [permission, setPermission] = useState(getNotificationPermission());
  const [saved, setSaved] = useState(false);
  const [newAlert, setNewAlert] = useState({ label: '', time: '09:00', message: '', enabled: true });

  useEffect(() => {
    setPermission(getNotificationPermission());
  }, []);

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermission(granted ? 'granted' : 'denied');
    if (granted) {
      showImmediateNotification('System Active', 'Neural Link Established. Alerts authorized.');
    }
  };

  const handleSaveAndSchedule = () => {
    scheduleNotificationsForToday(alerts);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  const updateAlert = (id: string, updates: Partial<Alert>) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const addAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlert.label || !newAlert.message) return;
    setAlerts([...alerts, { ...newAlert, id: generateUUID() }]);
    setNewAlert({ label: '', time: '09:00', message: '', enabled: true });
  };

  const removeAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="text-violet-500 w-6 h-6" />
            <span className="text-[10px] font-black text-violet-500/60 tracking-[0.3em] uppercase">Communication Vector</span>
          </div>
          <h2 className="text-6xl font-black tracking-tighter text-white leading-none">
            ALERTS
          </h2>
          <p className="text-xl font-bold text-violet-400/80 tracking-widest uppercase mt-2 indent-1">
            NEURAL PUSH NOTIFICATIONS
          </p>
        </div>
      </div>

      {/* Permission Tactical Panel */}
      <GlassCard className={`p-8 border-t-4 transition-all duration-500 ${permission === 'granted' ? 'border-emerald-500 bg-emerald-950/10' : 'border-red-500 bg-red-950/10 shadow-[0_0_50px_rgba(220,38,38,0.1)]'}`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className={`p-5 rounded-[2rem] border transition-all ${permission === 'granted' ? 'bg-emerald-600 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)]' : 'bg-red-600 text-white animate-pulse shadow-[0_0_30px_rgba(220,38,38,0.4)]'}`}>
              {permission === 'granted' ? <BellRing size={32} /> : <BellOff size={32} />}
            </div>
            <div>
              <h4 className="text-2xl font-black text-white tracking-widest uppercase mb-1">
                {permission === 'granted' ? 'Interface Active' : 'Access Restricted'}
              </h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] leading-relaxed">
                {permission === 'granted' 
                  ? 'COMMAND. is currently linked to your local device notification unit.' 
                  : 'Establish a neural link to receive mission-critical deployment alerts.'}
              </p>
            </div>
          </div>
          {permission !== 'granted' && (
            <button onClick={handleRequestPermission} className="w-full md:w-auto px-10 py-5 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.3em] text-xs rounded-2xl transition-all shadow-[0_15px_30px_rgba(220,38,38,0.3)]">
              Authorize Access
            </button>
          )}
        </div>
      </GlassCard>

      {/* Scheduled Procotols */}
      <div className="grid grid-cols-1 gap-4">
        <h3 className="text-xs font-black text-violet-500/60 uppercase tracking-[0.3em] flex items-center gap-3 mb-2 ml-4">
          <Clock size={16} /> Scheduled Deployment Protocols
        </h3>
        <AnimatePresence mode="popLayout">
          {alerts.map(alert => (
            <motion.div key={alert.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
               <GlassCard className={`p-6 border-l-4 transition-all duration-300 ${alert.enabled ? 'border-l-violet-600 bg-black/60 border-white/5' : 'border-l-slate-800 bg-black/20 opacity-40'}`}>
                 <div className="flex flex-col md:flex-row items-center gap-6">
                    <button onClick={() => toggleAlert(alert.id)} className={`p-4 rounded-2xl border transition-all ${alert.enabled ? 'bg-violet-600/20 border-violet-500 text-violet-400' : 'bg-black border-slate-800 text-slate-700'}`}>
                       {alert.enabled ? <Zap size={20} fill="currentColor" /> : <Zap size={20} />}
                    </button>
                    
                    <div className="flex-1 space-y-4 w-full">
                       <div className="flex items-center justify-between gap-4">
                          <p className="text-lg font-black text-white uppercase tracking-tighter">{alert.label}</p>
                          <input 
                            type="time" 
                            value={alert.time}
                            onChange={e => updateAlert(alert.id, { time: e.target.value })}
                            className="bg-black/80 border border-violet-900/30 rounded-xl px-4 py-2 text-violet-400 text-xs font-black tracking-widest focus:border-violet-500 [color-scheme:dark]"
                          />
                       </div>
                       <div className="relative group">
                          <input 
                            type="text" 
                            value={alert.message}
                            onChange={e => updateAlert(alert.id, { message: e.target.value })}
                            className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-slate-400 text-[11px] font-bold tracking-wide focus:border-violet-900/50 transition-colors"
                          />
                       </div>
                    </div>

                    <button onClick={() => removeAlert(alert.id)} className="p-3 text-slate-800 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                       <Trash2 size={20} />
                    </button>
                 </div>
               </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* New Vector Initialization */}
      <GlassCard className="p-10 border-violet-900/20 bg-black/40 relative group overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
           <Plus size={120} className="text-violet-500" />
        </div>
        <h3 className="text-sm font-black text-violet-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
          <Plus size={20} /> Initialize New Alert Vector
        </h3>
        <form onSubmit={addAlert} className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
          <div className="md:col-span-4 flex flex-col gap-2">
            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Vector Label</label>
            <input value={newAlert.label} onChange={e => setNewAlert({...newAlert, label: e.target.value})} type="text" placeholder="Mission Code" className="w-full bg-black/60 border border-violet-900/30 rounded-2xl px-6 py-4 text-white text-xs font-black uppercase tracking-widest focus:border-violet-500" />
          </div>
          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Time-Zero</label>
            <input value={newAlert.time} onChange={e => setNewAlert({...newAlert, time: e.target.value})} type="time" className="w-full bg-black/60 border border-violet-900/30 rounded-2xl px-6 py-4 text-violet-400 text-xs font-black tracking-widest focus:border-violet-500 [color-scheme:dark]" />
          </div>
          <div className="md:col-span-4 flex flex-col gap-2">
             <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Engagement Intel</label>
             <input value={newAlert.message} onChange={e => setNewAlert({...newAlert, message: e.target.value})} type="text" placeholder="Neural Payload Description" className="w-full bg-black/60 border border-violet-900/30 rounded-2xl px-6 py-4 text-white text-xs font-black uppercase focus:border-violet-500" />
          </div>
          <div className="md:col-span-2 flex items-end">
            <button type="submit" className="w-full h-14 bg-violet-600 hover:bg-violet-500 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl transition-all shadow-[0_0_30px_rgba(139,92,246,0.3)]">Deploy</button>
          </div>
        </form>
      </GlassCard>

      {/* Global Sync Command */}
      {permission === 'granted' && (
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSaveAndSchedule} 
          className={`w-full py-8 font-black tracking-[0.5em] uppercase rounded-3xl transition-all flex items-center justify-center gap-4 text-xl border-2 ${saved ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_50px_rgba(16,185,129,0.5)]' : 'bg-black hover:bg-violet-900 border-violet-900/50 text-violet-500 hover:text-white shadow-[0_0_30px_rgba(139,92,246,0.2)]'}`}
        >
          {saved ? <><Check size={28} /> Deployment Synchronized</> : <><Send size={28} /> Synchronize Global Alerts</>}
        </motion.button>
      )}
    </div>
  );
}

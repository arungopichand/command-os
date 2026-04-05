import { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Bell, BellOff, BellRing, Check, Save, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  requestNotificationPermission,
  getNotificationPermission,
  scheduleNotificationsForToday,
  showImmediateNotification
} from '../lib/notifications';

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
  const [alerts, setAlerts] = useLocalStorage<Alert[]>('command_notification_alerts', DEFAULT_ALERTS);
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
      showImmediateNotification('System Active', 'Notifications are now enabled. COMMAND. is watching.');
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

  const updateAlertTime = (id: string, time: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, time } : a));
  };

  const updateAlertMessage = (id: string, message: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, message } : a));
  };

  const addAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlert.label || !newAlert.message) return;
    setAlerts([...alerts, { ...newAlert, id: crypto.randomUUID() }]);
    setNewAlert({ label: '', time: '09:00', message: '', enabled: true });
  };

  const removeAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-5xl font-black tracking-tighter text-violet-500 drop-shadow-[0_0_12px_rgba(139,92,246,0.5)]">ALERTS</h2>
        <p className="text-violet-400/80 font-bold tracking-widest uppercase mt-2">Push Notification Command Center</p>
      </div>

      {/* Permission Banner */}
      <GlassCard className={`border ${permission === 'granted' ? 'border-emerald-900/40 bg-emerald-950/10' : 'border-violet-900/30 bg-black/60'} p-6`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {permission === 'granted'
              ? <div className="bg-emerald-950/40 p-3 rounded-2xl border border-emerald-900/40"><BellRing size={28} className="text-emerald-500" /></div>
              : <div className="bg-violet-950/40 p-3 rounded-2xl border border-violet-900/40"><BellOff size={28} className="text-violet-400" /></div>
            }
            <div>
              <p className={`font-black uppercase tracking-wide text-lg ${permission === 'granted' ? 'text-emerald-400' : 'text-white'}`}>
                {permission === 'granted' ? 'Notifications Active' : permission === 'denied' ? 'Notifications Blocked' : 'Notifications Disabled'}
              </p>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
                {permission === 'granted'
                  ? 'COMMAND. will push reminders to your device.'
                  : permission === 'denied'
                    ? 'Unblock via browser settings → Site Permissions → Notifications.'
                    : 'Enable to receive mission reminders on your device.'}
              </p>
            </div>
          </div>
          {permission !== 'granted' && permission !== 'denied' && (
            <button onClick={handleRequestPermission} className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all">
              Enable Notifications
            </button>
          )}
        </div>
      </GlassCard>

      {/* Alerts List */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-violet-400 uppercase tracking-widest flex items-center gap-2">
          <Clock size={16} /> Scheduled Alerts
        </h3>
        <AnimatePresence>
          {alerts.map(alert => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <GlassCard className={`border transition-all duration-300 ${alert.enabled ? 'border-violet-900/40 bg-black/60' : 'border-white/5 bg-black/20 opacity-50'} p-4`}>
                <div className="flex items-start gap-4 flex-wrap">
                  {/* Toggle */}
                  <button onClick={() => toggleAlert(alert.id)} className={`mt-1 p-2 rounded-full border transition-all shrink-0 ${alert.enabled ? 'bg-violet-950/40 border-violet-600/50 text-violet-400' : 'bg-black border-white/10 text-slate-600'}`}>
                    {alert.enabled ? <Bell size={16} /> : <BellOff size={16} />}
                  </button>

                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-black text-white uppercase tracking-wide">{alert.label}</p>
                      <input
                        type="time"
                        value={alert.time}
                        onChange={e => updateAlertTime(alert.id, e.target.value)}
                        className="bg-violet-950/20 border border-violet-900/30 rounded-lg px-3 py-1.5 text-violet-300 text-xs font-bold focus:outline-none focus:border-violet-500/50 [color-scheme:dark]"
                      />
                    </div>
                    <input
                      type="text"
                      value={alert.message}
                      onChange={e => updateAlertMessage(alert.id, e.target.value)}
                      className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-slate-400 text-sm focus:outline-none focus:border-violet-500/30 focus:text-white transition-colors"
                    />
                  </div>

                  <button onClick={() => removeAlert(alert.id)} className="text-slate-700 hover:text-red-500 transition-colors shrink-0 mt-1 text-xs font-bold uppercase tracking-widest">
                    ✕
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add New Alert */}
      <GlassCard className="border-violet-900/20 bg-black/40 p-6">
        <h3 className="text-sm font-black text-violet-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Bell size={16} /> Add Custom Alert</h3>
        <form onSubmit={addAlert} className="space-y-3">
          <div className="flex gap-3 flex-wrap">
            <input value={newAlert.label} onChange={e => setNewAlert({...newAlert, label: e.target.value})} type="text" placeholder="Alert Label (e.g. Pre-Workout)" className="flex-1 min-w-[180px] bg-black border border-violet-900/30 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500/50" />
            <input value={newAlert.time} onChange={e => setNewAlert({...newAlert, time: e.target.value})} type="time" className="bg-black border border-violet-900/30 rounded-xl px-4 py-3 text-violet-300 text-sm focus:outline-none focus:border-violet-500/50 [color-scheme:dark]" />
          </div>
          <div className="flex gap-3">
            <input value={newAlert.message} onChange={e => setNewAlert({...newAlert, message: e.target.value})} type="text" placeholder="Notification message body..." className="flex-1 bg-black border border-violet-900/30 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500/50" />
            <button type="submit" className="px-6 bg-violet-700 hover:bg-violet-600 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all">Add</button>
          </div>
        </form>
      </GlassCard>

      {/* Save & Schedule Button */}
      {permission === 'granted' && (
        <button onClick={handleSaveAndSchedule} className={`w-full py-5 font-black tracking-[0.3em] uppercase rounded-2xl transition-all flex items-center justify-center gap-3 text-lg ${saved ? 'bg-emerald-700 shadow-[0_0_30px_rgba(16,185,129,0.6)]' : 'bg-violet-700 hover:bg-violet-600 shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_rgba(139,92,246,0.7)]'}`}>
          {saved ? <><Check size={22} /> Scheduled for Today!</> : <><Save size={22} /> Save & Schedule Today's Alerts</>}
        </button>
      )}
    </div>
  );
}

// Notification utilities for COMMAND. OS

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    console.log('[COMMAND] Service Worker registered:', reg.scope);
    return reg;
  } catch (err) {
    console.warn('[COMMAND] Service Worker registration failed:', err);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('[COMMAND] Notifications not supported');
    return false;
  }
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission;
}

interface ScheduledAlert {
  label: string;
  time: string; // 'HH:MM'
  message: string;
  enabled: boolean;
}

export function scheduleNotificationsForToday(alerts: ScheduledAlert[]) {
  if (Notification.permission !== 'granted') return;
  
  navigator.serviceWorker.ready.then(reg => {
    const now = new Date();
    
    alerts.forEach(alert => {
      if (!alert.enabled) return;
      
      const [hours, minutes] = alert.time.split(':').map(Number);
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);

      // Skip if time has already passed today
      if (scheduledTime <= now) return;

      const delay = scheduledTime.getTime() - now.getTime();

      if (reg.active) {
        reg.active.postMessage({
          type: 'SCHEDULE_NOTIFICATION',
          title: `COMMAND. — ${alert.label}`,
          body: alert.message,
          delay
        });
      }
    });
  });
}

export function showImmediateNotification(title: string, body: string) {
  if (Notification.permission !== 'granted') return;
  new Notification(`COMMAND. — ${title}`, {
    body,
    icon: '/icon-192.png',
  });
}

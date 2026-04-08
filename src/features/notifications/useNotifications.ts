import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  NotificationAlert,
  NotificationAlertDraft,
  NotificationPermissionState,
  NotificationRuntimeState,
} from './notification.types';
import {
  createAlert,
  deleteAlert,
  getAlerts,
  subscribeToNotificationStorage,
  updateAlert,
} from './notificationStorage';
import {
  getNotificationRuntimeSnapshot,
  initializeNotificationsRuntime,
  requestBrowserNotificationPermission,
  rescheduleNotificationAlerts,
  subscribeToNotificationRuntime,
} from './notificationRuntime';

interface NotificationsDataState {
  alerts: NotificationAlert[];
  loading: boolean;
  error: string | null;
}

function formatNotificationsError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export interface UseNotificationsResult {
  alerts: NotificationAlert[];
  permission: NotificationPermissionState;
  notificationsSupported: boolean;
  serviceWorkerSupported: boolean;
  serviceWorkerRegistered: boolean;
  serviceWorkerError: string | null;
  loading: boolean;
  error: string | null;
  isSaving: boolean;
  isRequestingPermission: boolean;
  enabledAlertCount: number;
  activeAlertCount: number;
  requestPermission: () => Promise<NotificationPermissionState>;
  addAlert: (draft: NotificationAlertDraft) => Promise<void>;
  editAlert: (alertId: string, updates: Partial<NotificationAlertDraft>) => Promise<void>;
  toggleAlert: (alertId: string) => Promise<void>;
  removeAlert: (alertId: string) => Promise<void>;
  rescheduleAlerts: () => Promise<void>;
}

export function useNotifications(): UseNotificationsResult {
  const [dataState, setDataState] = useState<NotificationsDataState>({
    alerts: [],
    loading: true,
    error: null,
  });
  const [runtimeState, setRuntimeState] = useState<NotificationRuntimeState>(() => getNotificationRuntimeSnapshot());
  const [isSaving, setIsSaving] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  const refreshAlerts = useCallback(() => {
    try {
      setDataState({
        alerts: getAlerts(),
        loading: false,
        error: null,
      });
    } catch (error) {
      setDataState({
        alerts: [],
        loading: false,
        error: formatNotificationsError(error, 'Unable to load reminders.'),
      });
    }
  }, []);

  useEffect(() => {
    initializeNotificationsRuntime();
    refreshAlerts();
    setRuntimeState(getNotificationRuntimeSnapshot());

    const unsubscribeStorage = subscribeToNotificationStorage(() => {
      refreshAlerts();
      setRuntimeState(getNotificationRuntimeSnapshot());
    });
    const unsubscribeRuntime = subscribeToNotificationRuntime(() => {
      setRuntimeState(getNotificationRuntimeSnapshot());
    });

    return () => {
      unsubscribeStorage();
      unsubscribeRuntime();
    };
  }, [refreshAlerts]);

  const runAlertMutation = useCallback(async (mutation: () => void, fallbackError: string) => {
    setIsSaving(true);
    setDataState((currentState) => ({
      ...currentState,
      error: null,
    }));

    try {
      mutation();
      refreshAlerts();
      await rescheduleNotificationAlerts();
      setRuntimeState(getNotificationRuntimeSnapshot());
    } catch (error) {
      setDataState((currentState) => ({
        ...currentState,
        error: formatNotificationsError(error, fallbackError),
      }));
    } finally {
      setIsSaving(false);
    }
  }, [refreshAlerts]);

  const requestPermission = useCallback(async () => {
    setIsRequestingPermission(true);
    setDataState((currentState) => ({
      ...currentState,
      error: null,
    }));

    try {
      const permission = await requestBrowserNotificationPermission();
      setRuntimeState(getNotificationRuntimeSnapshot());
      return permission;
    } catch (error) {
      setDataState((currentState) => ({
        ...currentState,
        error: formatNotificationsError(error, 'Unable to request browser notification permission.'),
      }));
      return getNotificationRuntimeSnapshot().permission;
    } finally {
      setIsRequestingPermission(false);
    }
  }, []);

  const addAlertEntry = useCallback(async (draft: NotificationAlertDraft) => {
    await runAlertMutation(() => {
      createAlert(draft);
    }, 'Unable to create reminder.');
  }, [runAlertMutation]);

  const editAlertEntry = useCallback(async (alertId: string, updates: Partial<NotificationAlertDraft>) => {
    await runAlertMutation(() => {
      updateAlert(alertId, updates);
    }, 'Unable to update reminder.');
  }, [runAlertMutation]);

  const toggleAlertEntry = useCallback(async (alertId: string) => {
    const alert = dataState.alerts.find((currentAlert) => currentAlert.id === alertId);
    if (!alert) {
      setDataState((currentState) => ({
        ...currentState,
        error: 'Unable to find the reminder you are trying to update.',
      }));
      return;
    }

    await editAlertEntry(alertId, { isEnabled: !alert.isEnabled });
  }, [dataState.alerts, editAlertEntry]);

  const removeAlertEntry = useCallback(async (alertId: string) => {
    await runAlertMutation(() => {
      deleteAlert(alertId);
    }, 'Unable to delete reminder.');
  }, [runAlertMutation]);

  const rescheduleAlerts = useCallback(async () => {
    setDataState((currentState) => ({
      ...currentState,
      error: null,
    }));

    try {
      await rescheduleNotificationAlerts();
      setRuntimeState(getNotificationRuntimeSnapshot());
    } catch (error) {
      setDataState((currentState) => ({
        ...currentState,
        error: formatNotificationsError(error, 'Unable to restore reminder scheduling.'),
      }));
    }
  }, []);

  const enabledAlertCount = useMemo(
    () => dataState.alerts.filter((alert) => alert.isEnabled).length,
    [dataState.alerts],
  );
  const activeAlertCount = runtimeState.permission === 'granted' ? enabledAlertCount : 0;

  return {
    alerts: dataState.alerts,
    permission: runtimeState.permission,
    notificationsSupported: runtimeState.notificationsSupported,
    serviceWorkerSupported: runtimeState.serviceWorkerSupported,
    serviceWorkerRegistered: runtimeState.serviceWorkerRegistered,
    serviceWorkerError: runtimeState.serviceWorkerError,
    loading: dataState.loading,
    error: dataState.error,
    isSaving,
    isRequestingPermission,
    enabledAlertCount,
    activeAlertCount,
    requestPermission,
    addAlert: addAlertEntry,
    editAlert: editAlertEntry,
    toggleAlert: toggleAlertEntry,
    removeAlert: removeAlertEntry,
    rescheduleAlerts,
  };
}

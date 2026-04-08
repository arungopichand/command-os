export type NotificationPermissionState = NotificationPermission | 'unsupported';

export interface NotificationAlert {
  id: string;
  title: string;
  message: string;
  hour: number;
  minute: number;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationState {
  permission: NotificationPermissionState;
  serviceWorkerRegistered: boolean;
}

export interface NotificationRuntimeState extends NotificationState {
  notificationsSupported: boolean;
  serviceWorkerSupported: boolean;
  serviceWorkerError: string | null;
}

export interface NotificationAlertDraft {
  title: string;
  message: string;
  hour: number;
  minute: number;
  isEnabled: boolean;
}

/**
 * Smart Bharat Office Visit Notification Service
 * Manages browser local notifications, permission requests, scheduling, rescheduling,
 * cancellation, and duplicate prevention for citizen office visit appointments.
 */

import { Platform } from 'react-native';
import { getTodayIST } from '@/utils/date-time';

const NOTIFICATIONS_STORAGE_KEY = 'smart_bharat_scheduled_notifications';

export interface ScheduledNotification {
  appointmentId: string;
  officeName: string;
  date: string; // YYYY-MM-DD in IST
  time: string; // e.g., "10:30 AM"
  serviceName: string;
  token: string;
  scheduledAt: string;
  isDelivered: boolean;
  bookingConfirmedDelivered?: boolean;
}

// In-memory fallback if localStorage is unavailable
let memoryNotifications: ScheduledNotification[] = [];

const getStoredNotifications = (): ScheduledNotification[] => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // Fallback to in-memory
    }
  }
  return memoryNotifications;
};

const saveStoredNotifications = (items: ScheduledNotification[]) => {
  memoryNotifications = items;
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }
};

/**
 * Checks platform support and current notification permission
 */
export const getNotificationStatus = (): {
  isSupported: boolean;
  permission: NotificationPermission | 'unsupported';
  limitationNote: string;
} => {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !('Notification' in window)) {
    return {
      isSupported: false,
      permission: 'unsupported',
      limitationNote:
        'Local notifications are supported in modern web browsers (Chrome, Edge, Firefox, Safari). On mobile web, notifications require the site to be opened in an active tab or saved to Home Screen.',
    };
  }

  const perm = Notification.permission;
  let limitationNote = '';
  if (perm === 'denied') {
    limitationNote =
      'Notification permission was blocked in browser settings. You can re-enable it by clicking the lock icon next to the browser URL bar.';
  } else if (perm === 'granted') {
    limitationNote =
      'Notifications are active. Reminders will be shown for your confirmed appointment dates while the browser is accessible.';
  } else {
    limitationNote = 'Notification permission has not yet been requested.';
  }

  return {
    isSupported: true,
    permission: perm,
    limitationNote,
  };
};

/**
 * Requests notification permission gracefully from the user
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission | 'unsupported'> => {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  try {
    if (Notification.permission === 'granted') {
      return 'granted';
    }
    const result = await Notification.requestPermission();
    return result;
  } catch (err) {
    console.warn('[NotificationService] Permission request error:', err);
    return 'denied';
  }
};

/**
 * Dispatches an immediate browser notification if permissions are granted
 */
const fireNotification = (title: string, body: string, tag?: string) => {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: tag || 'smart-bharat-notice',
      });
    } catch (err) {
      console.warn('[NotificationService] Failed to fire notification:', err);
    }
  }
};

/**
 * Schedules an appointment notification.
 * Dispatches an instant booking confirmation notice and queues a reminder for the appointment date.
 * Avoids duplicate notifications.
 */
export const scheduleAppointmentNotification = async (appointment: {
  id: string;
  officeName: string;
  date: string; // YYYY-MM-DD
  time: string;
  serviceName: string;
  token: string;
}) => {
  // First request/verify permission
  const perm = await requestNotificationPermission();

  const items = getStoredNotifications();
  const existingIdx = items.findIndex((i) => i.appointmentId === appointment.id);

  const entry: ScheduledNotification = {
    appointmentId: appointment.id,
    officeName: appointment.officeName,
    date: appointment.date,
    time: appointment.time,
    serviceName: appointment.serviceName,
    token: appointment.token,
    scheduledAt: new Date().toISOString(),
    isDelivered: false,
    bookingConfirmedDelivered: true,
  };

  if (existingIdx !== -1) {
    items[existingIdx] = entry;
  } else {
    items.push(entry);
  }
  saveStoredNotifications(items);

  // Send immediate booking confirmation notification if permitted
  if (perm === 'granted') {
    fireNotification(
      `Office Visit Confirmed: ${appointment.officeName}`,
      `Your slot for ${appointment.serviceName} is booked for ${appointment.date} at ${appointment.time}. Token: ${appointment.token}.`,
      `confirm-${appointment.id}`
    );
  }

  return perm;
};

/**
 * Reschedules notification when an appointment date or time is edited
 */
export const rescheduleAppointmentNotification = async (
  appointmentId: string,
  updated: {
    officeName: string;
    date: string;
    time: string;
    serviceName: string;
    token: string;
  }
) => {
  const items = getStoredNotifications();
  const idx = items.findIndex((i) => i.appointmentId === appointmentId);

  const entry: ScheduledNotification = {
    appointmentId,
    officeName: updated.officeName,
    date: updated.date,
    time: updated.time,
    serviceName: updated.serviceName,
    token: updated.token,
    scheduledAt: new Date().toISOString(),
    isDelivered: false,
    bookingConfirmedDelivered: true,
  };

  if (idx !== -1) {
    items[idx] = entry;
  } else {
    items.push(entry);
  }
  saveStoredNotifications(items);

  if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    fireNotification(
      `Appointment Rescheduled: ${updated.officeName}`,
      `New scheduled date: ${updated.date} at ${updated.time}. Slot Token: ${updated.token}.`,
      `reschedule-${appointmentId}`
    );
  }
};

/**
 * Cancels scheduled notifications when an appointment is cancelled by the citizen
 */
export const cancelAppointmentNotification = (appointmentId: string, officeName?: string) => {
  const items = getStoredNotifications();
  const filtered = items.filter((i) => i.appointmentId !== appointmentId);
  saveStoredNotifications(filtered);

  if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    fireNotification(
      `Booking Cancelled: ${officeName || 'Office Visit'}`,
      `Your appointment has been cancelled and removed from the active schedule.`,
      `cancel-${appointmentId}`
    );
  }
};

/**
 * Checks all saved appointments and delivers notifications for appointments that are TODAY in IST
 * Ensures no duplicate reminders are delivered.
 */
export const checkAndDeliverAppointmentReminders = () => {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  if (Notification.permission !== 'granted') return;

  const todayIST = getTodayIST();
  const items = getStoredNotifications();
  let updated = false;

  items.forEach((item) => {
    // If appointment is today and reminder hasn't been delivered yet
    if (item.date === todayIST && !item.isDelivered) {
      fireNotification(
        `🚨 Office Visit Today: ${item.officeName}`,
        `Reminder: You have a scheduled visit today at ${item.time} for ${item.serviceName}. Bring your required documents and Token ${item.token}.`,
        `today-${item.appointmentId}`
      );
      item.isDelivered = true;
      updated = true;
    }
  });

  if (updated) {
    saveStoredNotifications(items);
  }
};


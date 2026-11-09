/**
 * Indian Standard Time (IST - Asia/Kolkata, UTC+05:30) Date & Time Utilities
 * Provides consistent IST date parsing, future date validation, and countdown calculations.
 */

const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Returns current date string formatted as YYYY-MM-DD in Indian Standard Time (IST)
 */
export const getTodayIST = (): string => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(now); // Output format: YYYY-MM-DD
};

/**
 * Returns current time in IST as a Date object adjusted for calculations
 */
export const getNowIST = (): Date => {
  const now = new Date();
  const istString = now.toLocaleString('en-US', { timeZone: IST_TIMEZONE });
  return new Date(istString);
};

/**
 * Formats a YYYY-MM-DD string into a human-friendly IST display format
 * Example: "2026-11-12" -> "Thu, 12 Nov 2026"
 */
export const formatISTDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(Date.UTC(year, month, day, 12, 0, 0));
      return d.toLocaleDateString('en-IN', {
        timeZone: IST_TIMEZONE,
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

/**
 * Validates that a selected date string (YYYY-MM-DD) is not in the past in IST
 */
export const isFutureOrTodayIST = (dateStr: string): boolean => {
  if (!dateStr) return false;
  const today = getTodayIST();
  return dateStr >= today;
};

/**
 * Converts a 12-hour time string like "10:30 AM" into minutes from midnight
 */
export const parseTimeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const match = timeStr.trim().match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

export interface AppointmentCountdown {
  diffDays: number;
  isToday: boolean;
  isTomorrow: boolean;
  isOverdue: boolean;
  isUpcoming: boolean;
  countdownLabel: string;
  badgeBg: string;
  badgeColor: string;
  badgeIcon: string;
}

/**
 * Calculates countdown from current IST date to appointment date
 * Returns "Today", "Tomorrow", "X days left", or "Overdue (Date Passed)"
 */
export const calculateAppointmentCountdown = (
  dateStr?: string,
  timeStr?: string
): AppointmentCountdown => {
  if (!dateStr) {
    return {
      diffDays: 0,
      isToday: false,
      isTomorrow: false,
      isOverdue: false,
      isUpcoming: false,
      countdownLabel: 'No Date Set',
      badgeBg: '#F1F5F9',
      badgeColor: '#64748B',
      badgeIcon: '📅',
    };
  }

  const todayStr = getTodayIST();

  // Compare calendar dates (midnight to midnight)
  const [tYear, tMonth, tDay] = todayStr.split('-').map(Number);
  const [aYear, aMonth, aDay] = dateStr.split('-').map(Number);

  const todayDate = new Date(Date.UTC(tYear, tMonth - 1, tDay));
  const apptDate = new Date(Date.UTC(aYear, aMonth - 1, aDay));

  const diffMs = apptDate.getTime() - todayDate.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      diffDays,
      isToday: false,
      isTomorrow: false,
      isOverdue: true,
      isUpcoming: false,
      countdownLabel: overdueDays === 1 ? '1 day overdue' : `${overdueDays} days overdue`,
      badgeBg: '#FEF2F2',
      badgeColor: '#DC2626',
      badgeIcon: '⚠️',
    };
  }

  if (diffDays === 0) {
    return {
      diffDays: 0,
      isToday: true,
      isTomorrow: false,
      isOverdue: false,
      isUpcoming: true,
      countdownLabel: 'Today',
      badgeBg: '#FEE2E2',
      badgeColor: '#B91C1C',
      badgeIcon: '🚨',
    };
  }

  if (diffDays === 1) {
    return {
      diffDays: 1,
      isToday: false,
      isTomorrow: true,
      isOverdue: false,
      isUpcoming: true,
      countdownLabel: 'Tomorrow',
      badgeBg: '#FEF3C7',
      badgeColor: '#B45309',
      badgeIcon: '⏳',
    };
  }

  return {
    diffDays,
    isToday: false,
    isTomorrow: false,
    isOverdue: false,
    isUpcoming: true,
    countdownLabel: `${diffDays} days left`,
    badgeBg: '#E0F2FE',
    badgeColor: '#0284C7',
    badgeIcon: '📅',
  };
};


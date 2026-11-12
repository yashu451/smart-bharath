import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from 'react-native';
import { getTodayIST, formatISTDate } from '@/utils/date-time';
import {
  checkAppointmentDateAvailability,
  OFFICIAL_HOLIDAYS,
  DateAvailabilityResult,
} from '@/constants/official-holidays';

interface CalendarDatePickerProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  minDate?: string; // YYYY-MM-DD (defaults to today in IST)
  errorMessage?: string;
  stateCode?: string; // 'ALL', 'KA', 'TN', 'MH', 'DL', 'UP'
  districtName?: string;
  onDateAvailabilityChange?: (availability: DateAvailabilityResult) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarDatePicker: React.FC<CalendarDatePickerProps> = ({
  selectedDate,
  onSelectDate,
  minDate = getTodayIST(),
  errorMessage,
  stateCode = 'ALL',
  districtName = '',
  onDateAvailabilityChange,
}) => {
  // Current view month & year state
  const initialDate = selectedDate ? new Date(`${selectedDate}T00:00:00`) : new Date(`${minDate}T00:00:00`);
  const [currentYear, setCurrentYear] = useState<number>(initialDate.getFullYear() || 2026);
  const [currentMonth, setCurrentMonth] = useState<number>(initialDate.getMonth() || 10); // 0-indexed
  const [holidayNotice, setHolidayNotice] = useState<string | null>(null);

  const todayIST = getTodayIST();

  const handlePrevMonth = () => {
    setHolidayNotice(null);
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    setHolidayNotice(null);
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Calculate calendar days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarCells: Array<{ day: number; dateStr: string; isCurrentMonth: boolean }> = [];

  // Blank filler cells before the 1st
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push({ day: 0, dateStr: '', isCurrentMonth: false });
  }

  // Days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(currentMonth + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    const dateStr = `${currentYear}-${mm}-${dd}`;
    calendarCells.push({ day: d, dateStr, isCurrentMonth: true });
  }

  // Month-specific Gazetted Holidays for the currently viewed month
  const monthHolidays = OFFICIAL_HOLIDAYS.filter((h) => {
    if (h.year !== currentYear) return false;
    const parts = h.date.split('-');
    const m = parseInt(parts[1], 10) - 1;
    if (m !== currentMonth) return false;
    if (h.state === 'ALL') return true;
    if (stateCode && stateCode !== 'ALL' && h.state === stateCode) return true;
    return false;
  });

  const handleCellPress = (cellDateStr: string, isPastDate: boolean, availability: DateAvailabilityResult) => {
    if (isPastDate) {
      setHolidayNotice('Selected date is in the past. Please select today or a future working date.');
      return;
    }
    if (!availability.available) {
      setHolidayNotice(availability.reason || 'Government offices are closed on this date.');
      return;
    }
    setHolidayNotice(null);
    onSelectDate(cellDateStr);
    if (onDateAvailabilityChange) {
      onDateAvailabilityChange(availability);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1, minWidth: 200 }}>
          <Text style={styles.headerTitle}>Select Appointment Date</Text>
          <Text style={styles.headerSubtitle}>
            Holiday-aware schedule • Indian Standard Time (IST)
          </Text>
        </View>

        {/* Month Navigation */}
        <View style={styles.navControls}>
          <TouchableOpacity
            onPress={handlePrevMonth}
            style={styles.navButton}
            activeOpacity={0.7}
            accessibilityLabel="Previous month"
          >
            <Text style={styles.navButtonText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.monthYearPill}>
            <Text style={styles.monthYearText}>
              {MONTH_NAMES[currentMonth]} {currentYear}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleNextMonth}
            style={styles.navButton}
            activeOpacity={0.7}
            accessibilityLabel="Next month"
          >
            <Text style={styles.navButtonText}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Weekday headers */}
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((w, idx) => (
          <View key={w} style={styles.weekdayCell}>
            <Text
              style={[
                styles.weekdayText,
                idx === 0 && { color: '#EF4444' }, // Red for Sunday
                idx === 6 && { color: '#F97316' }, // Orange for Saturday
              ]}
            >
              {w}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {calendarCells.map((cell, index) => {
          if (!cell.isCurrentMonth) {
            return <View key={`empty-${index}`} style={styles.dayCell} />;
          }

          const isPastDate = cell.dateStr < minDate;
          const isToday = cell.dateStr === todayIST;
          const isSelected = cell.dateStr === selectedDate;

          const availability = checkAppointmentDateAvailability(cell.dateStr, stateCode, districtName);
          const isHoliday = !!availability.holidayName;
          const isSundayOff = !!availability.isSunday;
          const isSatClosed = !!availability.isSecondFourthSaturday;
          const isClosed = !availability.available;

          const isDisabled = isPastDate || isClosed;

          return (
            <TouchableOpacity
              key={cell.dateStr}
              onPress={() => handleCellPress(cell.dateStr, isPastDate, availability)}
              style={[
                styles.dayCell,
                isSelected && styles.dayCellSelected,
                isToday && !isSelected && styles.dayCellToday,
                isHoliday && !isSelected && !isPastDate && styles.dayCellHoliday,
                (isSundayOff || isSatClosed) && !isSelected && !isPastDate && styles.dayCellWeekendClosed,
                isPastDate && styles.dayCellPast,
              ]}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.dayText,
                  isSelected && styles.dayTextSelected,
                  isToday && !isSelected && styles.dayTextToday,
                  isHoliday && !isSelected && styles.dayTextHoliday,
                  isSundayOff && !isSelected && { color: '#DC2626' },
                  isSatClosed && !isSelected && { color: '#B45309' },
                  isPastDate && styles.dayTextPast,
                ]}
              >
                {cell.day}
              </Text>

              {/* Tag / Indicator below day number */}
              {isHoliday && !isSelected && (
                <View style={styles.holidayTagPill}>
                  <Text style={styles.holidayTagText} numberOfLines={1}>
                    Holiday
                  </Text>
                </View>
              )}

              {isSundayOff && !isSelected && (
                <Text style={styles.closedTag}>Sunday</Text>
              )}

              {isSatClosed && !isSelected && (
                <Text style={styles.satClosedTag}>Closed</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Holiday / Closed Day Alert Banner when tapped */}
      {holidayNotice ? (
        <View style={styles.holidayAlertBanner}>
          <Text style={styles.holidayAlertIcon}>ℹ️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.holidayAlertTitle}>Date Not Available for Booking</Text>
            <Text style={styles.holidayAlertText}>{holidayNotice}</Text>
          </View>
          <TouchableOpacity onPress={() => setHolidayNotice(null)} style={styles.holidayAlertClose}>
            <Text style={{ fontSize: 12, fontWeight: '900', color: '#B45309' }}>✕</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Selected Date Confirmation Pill */}
      {selectedDate ? (
        <View style={styles.selectedPill}>
          <Text style={styles.selectedPillIcon}>🗓️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.selectedPillText}>
              Selected Date: <Text style={{ fontWeight: '900', color: '#14532D' }}>{formatISTDate(selectedDate)} (IST)</Text>
            </Text>
            <Text style={styles.selectedPillSub}>
              🟢 Official Working Day • Counter Hours: 09:00 AM – 04:00 PM IST
            </Text>
          </View>
        </View>
      ) : null}

      {/* Validation Error Message */}
      {errorMessage ? (
        <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
      ) : null}

      {/* Calendar Visual Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#14532D' }]} />
          <Text style={styles.legendLabel}>Working Day</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendLabel}>Gazetted Holiday</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendLabel}>Sunday / 2nd-4th Sat</Text>
        </View>
      </View>

      {/* Gazetted Public Holidays for This Month */}
      {monthHolidays.length > 0 && (
        <View style={styles.monthHolidaysBox}>
          <View style={styles.monthHolidaysHeader}>
            <Text style={styles.monthHolidaysTitle}>
              🏛️ Verified Public Holidays in {MONTH_NAMES[currentMonth]} {currentYear}
            </Text>
          </View>
          {monthHolidays.map((h, idx) => (
            <View key={idx} style={styles.monthHolidayItem}>
              <View style={styles.monthHolidayDateBadge}>
                <Text style={styles.monthHolidayDateText}>{h.date.split('-')[2]}</Text>
                <Text style={styles.monthHolidayMonthText}>{MONTH_NAMES[currentMonth].slice(0, 3)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.monthHolidayName}>{h.name}</Text>
                <Text style={styles.monthHolidaySource}>Source: {h.source}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Direct Native Date Input on Web */}
      {Platform.OS === 'web' && (
        <View style={styles.nativeWebInputRow}>
          <Text style={styles.nativeWebLabel}>System Calendar Picker:</Text>
          <input
            type="date"
            min={minDate}
            value={selectedDate}
            onChange={(e: any) => {
              if (e.target && e.target.value) {
                const val = e.target.value;
                const check = checkAppointmentDateAvailability(val, stateCode, districtName);
                if (check.available) {
                  onSelectDate(val);
                  setHolidayNotice(null);
                } else {
                  setHolidayNotice(check.reason || 'Selected date is a holiday or weekend closure.');
                }
              }
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '12px',
              border: '1px solid #CADDCB',
              backgroundColor: '#FFFFFF',
              color: '#14532D',
              fontSize: '12px',
              fontWeight: '700',
              fontFamily: 'inherit',
              cursor: 'pointer',
              outline: 'none',
            }}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#CADDCB',
    padding: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    flexWrap: 'wrap',
    gap: 8,
  },
  headerTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#14532D',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  navControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EDF5EE',
    borderWidth: 1,
    borderColor: '#CADDCB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#14532D',
    lineHeight: 22,
  },
  monthYearPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#EDF5EE',
  },
  monthYearText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#14532D',
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8,
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    borderRadius: 12,
  },
  dayCellSelected: {
    backgroundColor: '#14532D',
    shadowColor: '#14532D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  dayCellHoliday: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  dayCellWeekendClosed: {
    backgroundColor: '#F8FAFC',
    opacity: 0.75,
  },
  dayCellPast: {
    opacity: 0.35,
  },
  dayText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  dayTextToday: {
    color: '#047857',
    fontWeight: '900',
  },
  dayTextHoliday: {
    color: '#B45309',
    fontWeight: '900',
  },
  dayTextPast: {
    color: '#94A3B8',
  },
  holidayTagPill: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: -2,
  },
  holidayTagText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  closedTag: {
    fontSize: 8,
    fontWeight: '800',
    color: '#EF4444',
    marginTop: -2,
  },
  satClosedTag: {
    fontSize: 8,
    fontWeight: '800',
    color: '#D97706',
    marginTop: -2,
  },
  holidayAlertBanner: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  holidayAlertIcon: {
    fontSize: 16,
  },
  holidayAlertTitle: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#92400E',
    marginBottom: 2,
  },
  holidayAlertText: {
    fontSize: 11.5,
    color: '#B45309',
    lineHeight: 16,
    fontWeight: '600',
  },
  holidayAlertClose: {
    padding: 4,
  },
  selectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 12,
    gap: 10,
  },
  selectedPillIcon: {
    fontSize: 20,
  },
  selectedPillText: {
    fontSize: 13,
    color: '#065F46',
  },
  selectedPillSub: {
    fontSize: 11,
    color: '#047857',
    fontWeight: '700',
    marginTop: 2,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
    marginTop: 8,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  monthHolidaysBox: {
    marginTop: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  monthHolidaysHeader: {
    marginBottom: 8,
  },
  monthHolidaysTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#14532D',
  },
  monthHolidayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  monthHolidayDateBadge: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignItems: 'center',
    minWidth: 38,
  },
  monthHolidayDateText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#92400E',
  },
  monthHolidayMonthText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B45309',
    textTransform: 'uppercase',
  },
  monthHolidayName: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  monthHolidaySource: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  nativeWebInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexWrap: 'wrap',
    gap: 8,
  },
  nativeWebLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
  },
});

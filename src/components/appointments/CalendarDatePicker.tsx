import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from 'react-native';
import { getTodayIST, formatISTDate } from '@/utils/date-time';

interface CalendarDatePickerProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  minDate?: string; // YYYY-MM-DD (defaults to today in IST)
  errorMessage?: string;
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
}) => {
  // Current view month & year state
  const initialDate = selectedDate ? new Date(`${selectedDate}T00:00:00`) : new Date(`${minDate}T00:00:00`);
  const [currentYear, setCurrentYear] = useState<number>(initialDate.getFullYear() || 2026);
  const [currentMonth, setCurrentMonth] = useState<number>(initialDate.getMonth() || 10); // 0-indexed

  const todayIST = getTodayIST();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
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

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerTitle}>Select Appointment Date</Text>
          <Text style={styles.headerSubtitle}>Valid future dates in Indian Standard Time (IST)</Text>
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
                idx === 0 && { color: '#EF4444' }, // Red for Sunday (Closed)
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
          const isSunday = new Date(`${cell.dateStr}T12:00:00Z`).getUTCDay() === 0;
          const isToday = cell.dateStr === todayIST;
          const isSelected = cell.dateStr === selectedDate;
          const isDisabled = isPastDate || isSunday;

          return (
            <TouchableOpacity
              key={cell.dateStr}
              disabled={isDisabled}
              onPress={() => onSelectDate(cell.dateStr)}
              style={[
                styles.dayCell,
                isSelected && styles.dayCellSelected,
                isToday && !isSelected && styles.dayCellToday,
                isDisabled && styles.dayCellDisabled,
              ]}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.dayText,
                  isSelected && styles.dayTextSelected,
                  isToday && !isSelected && styles.dayTextToday,
                  isDisabled && styles.dayTextDisabled,
                  isSunday && !isDisabled && { color: '#EF4444' },
                ]}
              >
                {cell.day}
              </Text>
              {isSunday && (
                <Text style={styles.closedTag}>Closed</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Direct Native Date Input on Web */}
      {Platform.OS === 'web' && (
        <View style={styles.nativeWebInputRow}>
          <Text style={styles.nativeWebLabel}>Or pick directly from system calendar:</Text>
          <input
            type="date"
            min={minDate}
            value={selectedDate}
            onChange={(e: any) => {
              if (e.target && e.target.value) {
                onSelectDate(e.target.value);
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

      {/* Selected Date Confirmation Pill */}
      {selectedDate ? (
        <View style={styles.selectedPill}>
          <Text style={styles.selectedPillIcon}>🗓️</Text>
          <Text style={styles.selectedPillText}>
            Scheduled for: <Text style={{ fontWeight: '900', color: '#14532D' }}>{formatISTDate(selectedDate)} (IST)</Text>
          </Text>
        </View>
      ) : null}

      {/* Validation Error Message */}
      {errorMessage ? (
        <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
      ) : null}
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
    fontSize: 13,
    fontWeight: '800',
    color: '#14532D',
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  navControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EDF5EE',
    borderWidth: 1,
    borderColor: '#CADDCB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#14532D',
    lineHeight: 20,
  },
  monthYearPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#EDF5EE',
  },
  monthYearText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#14532D',
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 6,
    marginBottom: 6,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 10,
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
    height: 40,
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
  dayCellDisabled: {
    opacity: 0.35,
  },
  dayText: {
    fontSize: 12,
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
  dayTextDisabled: {
    color: '#94A3B8',
  },
  closedTag: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#EF4444',
    marginTop: -2,
  },
  nativeWebInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexWrap: 'wrap',
    gap: 8,
  },
  nativeWebLabel: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
  },
  selectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    marginTop: 10,
    gap: 6,
  },
  selectedPillIcon: {
    fontSize: 14,
  },
  selectedPillText: {
    fontSize: 11,
    color: '#065F46',
  },
  errorText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#DC2626',
    marginTop: 8,
  },
});


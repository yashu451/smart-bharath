import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { dashboardApi } from '@/services/api';
import { CalendarDatePicker } from '@/components/appointments/CalendarDatePicker';
import { calculateAppointmentCountdown, isFutureOrTodayIST } from '@/utils/date-time';
import {
  checkAppointmentDateAvailability,
  OFFICIAL_APPOINTMENT_TIME_SLOTS,
} from '@/constants/official-holidays';
import {
  rescheduleAppointmentNotification,
  cancelAppointmentNotification,
  checkAndDeliverAppointmentReminders,
} from '@/services/notificationService';

const RESCHEDULE_TIME_SLOTS = OFFICIAL_APPOINTMENT_TIME_SLOTS;

export interface ActivityRecord {
  _id: string;
  type: 'appointment' | 'grievance' | 'scheme' | 'document' | 'assistant' | 'service' | 'other';
  title: string;
  subtitle?: string;
  token?: string;
  status: string;
  statusColor?: string;
  statusBg?: string;
  icon?: string;
  route?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
}

const FILTER_TABS: Array<{ key: string; label: string; icon: string }> = [
  { key: 'all', label: 'All Activities', icon: '📋' },
  { key: 'appointment', label: 'Appointments', icon: '📅' },
  { key: 'grievance', label: 'Grievances', icon: '📢' },
  { key: 'scheme', label: 'Schemes', icon: '🌾' },
  { key: 'document', label: 'Documents', icon: '📁' },
  { key: 'assistant', label: 'AI Assistant', icon: '🤖' },
];

export default function MyAppointmentsScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Rescheduling state
  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<ActivityRecord | null>(null);
  const [newDate, setNewDate] = useState<string>('');
  const [newTime, setNewTime] = useState<string>('');
  const [rescheduleError, setRescheduleError] = useState<string>('');
  const [isRescheduling, setIsRescheduling] = useState<boolean>(false);

  // Fetch real activities strictly for authenticated user from MongoDB
  const fetchActivities = useCallback(async (filterType: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await dashboardApi.getActivities(filterType);
      if (res.success && Array.isArray(res.activities)) {
        setActivities(res.activities);
      } else {
        setActivities([]);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to load activities. Please verify your connection.');
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reload activities whenever screen comes into focus or filter changes
  useFocusEffect(
    useCallback(() => {
      fetchActivities(selectedFilter);
      checkAndDeliverAppointmentReminders();
    }, [fetchActivities, selectedFilter])
  );

  const handleFilterChange = (key: string) => {
    setSelectedFilter(key);
    fetchActivities(key);
  };

  const handleCancelAppointment = (id: string, title: string) => {
    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel "${title}"? This action cannot be undone.`,
      [
        { text: 'No, Keep It', style: 'cancel' },
        {
          text: 'Yes, Cancel Booking',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await dashboardApi.cancelActivity(id);
              if (res.success) {
                cancelAppointmentNotification(id, title);
                Alert.alert('Booking Cancelled', 'Your appointment has been cancelled successfully.');
                fetchActivities(selectedFilter);
              } else {
                Alert.alert('Notice', res.message || 'Could not cancel booking.');
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to cancel appointment.');
            }
          },
        },
      ]
    );
  };

  const handleOpenReschedule = (act: ActivityRecord) => {
    const meta = act.metadata || {};
    setRescheduleTarget(act);
    setNewDate(meta.date || '');
    setNewTime(meta.time || '10:00 AM');
    setRescheduleError('');
    setRescheduleModalVisible(true);
  };

  const handleConfirmReschedule = async () => {
    if (!rescheduleTarget) return;

    if (!newDate) {
      setRescheduleError('Please choose a new appointment date.');
      return;
    }

    if (!isFutureOrTodayIST(newDate)) {
      setRescheduleError('Selected appointment date cannot be in the past. Please pick today or a future date.');
      return;
    }

    const meta = rescheduleTarget.metadata || {};
    const dateCheck = checkAppointmentDateAvailability(newDate, meta.state || 'ALL', meta.district || '');
    if (!dateCheck.available) {
      setRescheduleError(dateCheck.reason || 'Selected date is not an official public working day.');
      return;
    }

    if (!newTime) {
      setRescheduleError('Please select a time slot.');
      return;
    }

    setIsRescheduling(true);
    setRescheduleError('');

    try {
      const updatedMeta = {
        ...meta,
        date: newDate,
        time: newTime,
      };
      const updatedSubtitle = `${meta.service || 'Office Visit'} • ${newDate}, ${newTime}`;

      const res = await dashboardApi.updateActivity(rescheduleTarget._id, {
        subtitle: updatedSubtitle,
        metadata: updatedMeta,
        status: 'Upcoming',
        statusColor: '#000080',
        statusBg: '#EEF2FF',
      });

      if (res.success) {
        await rescheduleAppointmentNotification(rescheduleTarget._id, {
          officeName: rescheduleTarget.title,
          date: newDate,
          time: newTime,
          serviceName: meta.service || rescheduleTarget.title,
          token: rescheduleTarget.token || '',
        });

        setRescheduleModalVisible(false);
        setRescheduleTarget(null);
        Alert.alert(
          'Appointment Rescheduled',
          `Your appointment has been rescheduled to ${newDate} at ${newTime} (IST). Gatepass token remains confirmed.`
        );
        fetchActivities(selectedFilter);
      } else {
        setRescheduleError(res.message || 'Failed to reschedule appointment.');
      }
    } catch (err: any) {
      setRescheduleError(err.message || 'Network error while rescheduling.');
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleViewGatepass = (act: ActivityRecord) => {
    const meta = act.metadata || {};
    router.push({
      pathname: '/appointments/confirmation',
      params: {
        deptId: meta.deptId || 'passport',
        service: meta.service || act.subtitle || 'Public Office Appointment',
        location: meta.location || 'Central Civic Center',
        date: meta.date || '',
        time: meta.time || '',
        purpose: meta.purpose || '',
        bookingId: meta.bookingId || act.token?.replace(/^Token:\s*/i, '').trim() || act._id,
        token: meta.verificationToken || act.token?.replace(/^Token:\s*/i, '').trim() || '',
        qrDataUrl: meta.qrCodeDataUrl || '',
        state: meta.state || 'ALL',
        district: meta.district || '',
      },
    } as any);
  };

  const handleViewDetails = (act: ActivityRecord) => {
    const meta = act.metadata || {};
    const lines: string[] = [
      `Category: ${act.type.toUpperCase()}`,
      `Title: ${act.title}`,
    ];

    if (act.token) lines.push(`Reference / Token: ${act.token}`);
    if (meta.service) lines.push(`Service: ${meta.service}`);
    if (meta.location) lines.push(`Location / Office: ${meta.location}`);
    if (meta.date) lines.push(`Scheduled Date: ${meta.date}`);
    if (meta.time) lines.push(`Slot: ${meta.time}`);
    if (meta.subject) lines.push(`Subject: ${meta.subject}`);
    if (meta.description) lines.push(`Details: ${meta.description}`);
    if (act.status) lines.push(`Current Status: ${act.status}`);

    Alert.alert(
      `${act.title} Details`,
      lines.join('\n\n'),
      [{ text: 'Close', style: 'cancel' }]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#E6F0E8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#E6F0E8" />

      {/* Header Bar */}
      <View className="px-6 py-4 flex-row items-center border-b border-[#CADDCB] bg-[#EDF5EE]">
        <View className="max-w-5xl w-full mx-auto flex-row items-center">
          <TouchableOpacity
            onPress={() => router.replace('/home')}
            className="w-12 h-12 rounded-2xl bg-[#E0EDE1] border border-[#CADDCB] justify-center items-center mr-4 shadow-xs"
            activeOpacity={0.7}
          >
            <Text className="text-[#14532D] font-black text-xl">←</Text>
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-black text-[#14532D]">Activity Center</Text>
            <Text className="text-xs font-bold text-[#4B6350] uppercase tracking-widest mt-0.5">Smart Bharat Official Services</Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 130 }}>
        <View className="max-w-5xl w-full mx-auto">
          {/* Title Details with Orange Indicator */}
          <View className="mb-6 flex-row items-center">
            <View className="w-1.5 h-8 rounded-full bg-[#F97316] mr-3.5" />
            <View>
              <Text className="text-3xl font-black text-[#14532D] tracking-tight">Your Activities</Text>
              <Text className="text-base font-medium text-slate-600 mt-1">
                Monitor and manage your booked visits, complaints & welfare schemes
              </Text>
            </View>
          </View>

          {/* Filter Chips Bar */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-7 flex-row"
            contentContainerStyle={{ paddingVertical: 4 }}
          >
            {FILTER_TABS.map((tab) => {
              const isActive = selectedFilter === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => handleFilterChange(tab.key)}
                  className={`px-5 py-3 rounded-2xl mr-3 flex-row items-center border ${
                    isActive
                      ? 'bg-[#14532D] border-[#14532D] shadow-xs'
                      : 'bg-[#EDF5EE] border-[#CADDCB]'
                  }`}
                  activeOpacity={0.7}
                >
                  <Text className="text-base mr-2">{tab.icon}</Text>
                  <Text
                    className={`text-sm font-black ${
                      isActive ? 'text-white' : 'text-slate-700'
                    }`}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Main Content Area */}
          {isLoading ? (
            <View className="py-24 items-center justify-center">
              <ActivityIndicator size="large" color="#14532D" />
              <Text className="text-sm text-slate-500 font-bold mt-3">
                Loading your verified activities...
              </Text>
            </View>
          ) : errorMessage ? (
            <View className="bg-white border border-red-100 rounded-3xl p-8 items-center my-4 shadow-sm">
              <Text className="text-3xl mb-2">⚠️</Text>
              <Text className="text-base font-bold text-slate-800 text-center">Unable to load activities</Text>
              <Text className="text-sm text-slate-500 text-center mt-1 mb-5">{errorMessage}</Text>
              <TouchableOpacity
                onPress={() => fetchActivities(selectedFilter)}
                className="bg-[#14532D] px-7 py-3.5 rounded-2xl shadow-sm"
              >
                <Text className="text-white text-sm font-bold">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : activities.length === 0 ? (
            /* Proper Empty State Matching Reference System */
            <View
              style={{
                shadowColor: '#14532D',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.04,
                shadowRadius: 10,
                elevation: 2,
              }}
              className="bg-[#F3F8F4] border border-[#CADDCB] rounded-3xl p-10 items-center my-4"
            >
              <View className="w-18 h-18 rounded-3xl bg-[#ECFDF5] border border-[#A7F3D0] justify-center items-center mb-4 p-4">
                <Text className="text-4xl">📋</Text>
              </View>
              <Text className="text-2xl font-black text-[#14532D] text-center tracking-tight">
                No Activities Found
              </Text>
              <Text className="text-sm text-slate-600 text-center mt-2 leading-relaxed max-w-sm font-medium">
                {selectedFilter === 'all'
                  ? "You haven't made any requests yet. Explore our services to get started!"
                  : `You currently have no ${selectedFilter} records.`}
              </Text>
              <TouchableOpacity
                onPress={() => router.replace('/home')}
                className="mt-7 bg-[#14532D] px-7 py-4 rounded-2xl shadow-sm"
                activeOpacity={0.8}
              >
                <Text className="text-white font-black text-sm uppercase tracking-wider">
                  Explore Services
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Real User-Specific Activities List */
            <View className="space-y-4">
              {activities.map((act) => {
                const meta = act.metadata || {};
                const isUpcomingAppointment =
                  act.type === 'appointment' && act.status === 'Upcoming';
                const isAppointment = act.type === 'appointment';
                const apptCountdown =
                  isAppointment && meta.date
                    ? calculateAppointmentCountdown(meta.date, meta.time)
                    : null;

                return (
                  <View
                    key={act._id}
                    style={{
                      shadowColor: '#14532D',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.04,
                      shadowRadius: 10,
                      elevation: 2,
                    }}
                    className="bg-[#F3F8F4] border border-[#CADDCB] rounded-3xl p-6 mb-4"
                  >
                    {/* Card Top Row: Token and Status Badge */}
                    <View className="flex-row justify-between items-center mb-3.5">
                      <Text className="text-xs font-black text-[#4B6350] uppercase tracking-widest">
                        {act.token || act._id.slice(-8).toUpperCase()}
                      </Text>

                      <View className="flex-row items-center gap-2">
                        {/* Dynamic Countdown Pill for Appointments */}
                        {apptCountdown && act.status !== 'Cancelled' ? (
                          <View
                            style={{
                              backgroundColor: apptCountdown.isToday
                                ? '#FEE2E2'
                                : apptCountdown.isTomorrow
                                ? '#FEF3C7'
                                : apptCountdown.isOverdue
                                ? '#FEE2E2'
                                : '#E0F2FE',
                              borderColor: apptCountdown.isToday
                                ? '#EF4444'
                                : apptCountdown.isTomorrow
                                ? '#F59E0B'
                                : apptCountdown.isOverdue
                                ? '#EF4444'
                                : '#38BDF8',
                            }}
                            className="px-3 py-1 rounded-full border"
                          >
                            <Text
                              style={{
                                color: apptCountdown.isToday
                                  ? '#DC2626'
                                  : apptCountdown.isTomorrow
                                  ? '#B45309'
                                  : apptCountdown.isOverdue
                                  ? '#DC2626'
                                  : '#0369A1',
                              }}
                              className="text-xs font-black uppercase tracking-wide"
                            >
                              {apptCountdown.isToday
                                ? '🚨 Today'
                                : apptCountdown.isTomorrow
                                ? '⏳ Tomorrow'
                                : apptCountdown.countdownLabel}
                            </Text>
                          </View>
                        ) : null}

                        <View
                          style={{
                            backgroundColor: act.statusBg || '#ECFDF5',
                            borderColor: act.statusColor ? `${act.statusColor}33` : '#A7F3D0',
                          }}
                          className="px-3 py-1 rounded-full border"
                        >
                          <Text
                            style={{ color: act.statusColor || '#14532D' }}
                            className="text-xs font-black uppercase tracking-wide"
                          >
                            {act.status}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Title, Icon and Category */}
                    <View className="flex-row items-center space-x-3 pb-3.5 border-b border-[#CADDCB]">
                      <Text className="text-3xl mr-3">{act.icon || '📋'}</Text>
                      <View className="flex-1">
                        <Text className="text-xs font-black text-[#F97316] uppercase tracking-widest">
                          {meta.deptName || meta.category || act.type.toUpperCase()}
                        </Text>
                        <Text className="text-lg font-black text-[#14532D] mt-1">
                          {act.title}
                        </Text>
                      </View>
                    </View>

                    {/* Scheduling / Metadata Details */}
                    <View className="py-3.5 space-y-2">
                      {act.subtitle ? (
                        <View className="flex-row justify-between mb-1.5">
                          <Text className="text-sm font-semibold text-slate-500">Details</Text>
                          <Text className="text-sm font-bold text-slate-800 text-right flex-1 ml-4">
                            {act.subtitle}
                          </Text>
                        </View>
                      ) : null}

                      {meta.location ? (
                        <View className="flex-row justify-between mb-1.5">
                          <Text className="text-sm font-semibold text-slate-500">Location</Text>
                          <Text className="text-sm font-bold text-slate-800 text-right flex-1 ml-4">
                            {meta.location}
                          </Text>
                        </View>
                      ) : null}

                      {meta.date ? (
                        <View className="flex-row justify-between mb-1.5">
                          <Text className="text-sm font-semibold text-slate-500">Scheduled</Text>
                          <Text className="text-sm font-bold text-slate-800">
                            {meta.date} {meta.time ? `• ${meta.time}` : ''} (IST)
                          </Text>
                        </View>
                      ) : null}

                      {act.createdAt ? (
                        <View className="flex-row justify-between mb-1.5">
                          <Text className="text-sm font-semibold text-slate-500">Recorded</Text>
                          <Text className="text-sm font-bold text-slate-700">
                            {new Date(act.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Action Buttons Footer */}
                    <View className="pt-3.5 border-t border-[#CADDCB] mt-1">
                      {isUpcomingAppointment ? (
                        <View className="w-full">
                          <View className="flex-row justify-between mb-3 gap-3">
                            <TouchableOpacity
                              onPress={() => handleViewGatepass(act)}
                              style={{ minHeight: 52 }}
                              className="flex-1 py-3.5 px-4 rounded-2xl justify-center items-center border border-[#CADDCB] bg-[#EDF5EE]"
                              activeOpacity={0.7}
                            >
                              <Text className="text-[#14532D] text-base font-black">View Gatepass</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() => handleOpenReschedule(act)}
                              style={{ minHeight: 52 }}
                              className="flex-1 py-3.5 px-4 rounded-2xl justify-center items-center bg-[#14532D]"
                              activeOpacity={0.8}
                            >
                              <Text className="text-white text-base font-black">Reschedule 🗓️</Text>
                            </TouchableOpacity>
                          </View>

                          <TouchableOpacity
                            onPress={() => handleCancelAppointment(act._id, act.title)}
                            style={{ minHeight: 50 }}
                            className="w-full py-3.5 px-4 border border-red-200 bg-red-50/70 rounded-2xl justify-center items-center"
                            activeOpacity={0.7}
                          >
                            <Text className="text-red-600 text-base font-black">Cancel Appointment</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View className="flex-row justify-between gap-3">
                          <TouchableOpacity
                            onPress={() => handleViewDetails(act)}
                            style={{ minHeight: 52 }}
                            className={`py-3.5 px-4 rounded-2xl justify-center items-center ${
                              act.type === 'grievance' || act.type === 'document' || act.type === 'scheme'
                                ? 'flex-1'
                                : 'w-full'
                            } border border-[#CADDCB] bg-[#EDF5EE]`}
                            activeOpacity={0.7}
                          >
                            <Text className="text-[#14532D] text-base font-black">View Details</Text>
                          </TouchableOpacity>

                          {act.type === 'grievance' && (
                            <TouchableOpacity
                              onPress={() => {
                                const tokenVal = meta.complaintId || (act.token ? act.token.replace('Token: ', '').trim() : '');
                                router.push({
                                  pathname: '/grievances/track',
                                  params: { token: tokenVal },
                                } as any);
                              }}
                              style={{ minHeight: 48 }}
                              className="flex-1 py-3.5 px-4 border border-amber-200 bg-amber-50/70 rounded-2xl justify-center items-center"
                              activeOpacity={0.7}
                            >
                              <Text className="text-amber-800 text-sm font-black">Track Status →</Text>
                            </TouchableOpacity>
                          )}

                          {act.type === 'document' && (
                            <TouchableOpacity
                              onPress={() => router.push('/digilocker/documents' as any)}
                              style={{ minHeight: 48 }}
                              className="flex-1 py-3.5 px-4 border border-indigo-200 bg-indigo-50/70 rounded-2xl justify-center items-center"
                              activeOpacity={0.7}
                            >
                              <Text className="text-indigo-800 text-sm font-black">DigiLocker →</Text>
                            </TouchableOpacity>
                          )}

                          {act.type === 'scheme' && (
                            <TouchableOpacity
                              onPress={() => {
                                if (meta.schemeId) {
                                  router.push({ pathname: '/schemes/details', params: { id: meta.schemeId } } as any);
                                } else {
                                  router.push('/schemes/recommendations' as any);
                                }
                              }}
                              style={{ minHeight: 48 }}
                              className="flex-1 py-3.5 px-4 border border-emerald-200 bg-emerald-50/70 rounded-2xl justify-center items-center"
                              activeOpacity={0.7}
                            >
                              <Text className="text-emerald-800 text-sm font-black">View Portal →</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Return Button */}
          <TouchableOpacity
            onPress={() => router.replace('/home')}
            style={{ minHeight: 52 }}
            className="mt-7 border border-[#CADDCB] py-4 px-6 rounded-2xl justify-center items-center bg-[#EDF5EE] shadow-xs"
            activeOpacity={0.7}
          >
            <Text className="text-[#14532D] font-black text-sm uppercase tracking-wider">
              Return to Dashboard
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* RESCHEDULE APPOINTMENT MODAL */}
      <Modal
        visible={rescheduleModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRescheduleModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 18 }}>
          <View style={{ width: '100%', maxWidth: 520, maxHeight: '90%', backgroundColor: '#F3F8F4', borderRadius: 24, borderWidth: 1, borderColor: '#CADDCB', padding: 20 }}>
            {/* Modal Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: '900', color: '#14532D' }}>Reschedule Office Visit</Text>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#4B6350', marginTop: 2 }}>
                  {rescheduleTarget?.title} • {rescheduleTarget?.metadata?.service || 'Appointment'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setRescheduleModalVisible(false)}
                style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#E0EDE1', justifyContent: 'center', alignItems: 'center' }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 13, fontWeight: '900', color: '#14532D' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
              {/* Interactive Calendar Date Picker with IST constraints & Holiday Awareness */}
              <CalendarDatePicker
                selectedDate={newDate}
                onSelectDate={(dt) => {
                  setNewDate(dt);
                  setRescheduleError('');
                }}
                stateCode={rescheduleTarget?.metadata?.state || 'ALL'}
                districtName={rescheduleTarget?.metadata?.district || ''}
                errorMessage={rescheduleError}
              />

              {/* Time Slots Picker */}
              <View style={{ marginTop: 14, backgroundColor: '#EDF5EE', borderRadius: 18, borderWidth: 1, borderColor: '#CADDCB', padding: 14 }}>
                <Text style={{ fontSize: 13, fontWeight: '900', color: '#14532D', marginBottom: 10 }}>
                  Available Time Slots (IST) *
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {RESCHEDULE_TIME_SLOTS.map((slot) => {
                    const isSelected = newTime === slot;
                    return (
                      <TouchableOpacity
                        key={slot}
                        onPress={() => {
                          setNewTime(slot);
                          setRescheduleError('');
                        }}
                        style={{
                          minHeight: 42,
                          paddingHorizontal: 14,
                          paddingVertical: 10,
                          borderRadius: 14,
                          backgroundColor: isSelected ? '#14532D' : '#F3F8F4',
                          borderWidth: 1,
                          borderColor: isSelected ? '#14532D' : '#CADDCB',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={{
                            fontSize: 12.5,
                            fontWeight: '800',
                            color: isSelected ? '#FFFFFF' : '#334155',
                          }}
                        >
                          {slot}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {rescheduleError ? (
                <Text style={{ color: '#DC2626', fontSize: 11, fontWeight: '700', marginTop: 10, marginLeft: 2 }}>
                  {rescheduleError}
                </Text>
              ) : null}

              {/* Action Buttons */}
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 18 }}>
                <TouchableOpacity
                  onPress={() => setRescheduleModalVisible(false)}
                  style={{
                    flex: 1,
                    minHeight: 50,
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: '#CADDCB',
                    backgroundColor: '#EDF5EE',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: '#4B6350', fontSize: 14, fontWeight: '800' }}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleConfirmReschedule}
                  disabled={isRescheduling}
                  style={{
                    flex: 2,
                    minHeight: 52,
                    paddingVertical: 14,
                    paddingHorizontal: 20,
                    borderRadius: 16,
                    backgroundColor: '#14532D',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  activeOpacity={0.85}
                >
                  {isRescheduling ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Confirm Reschedule →
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

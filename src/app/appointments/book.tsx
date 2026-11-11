import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { DEPARTMENTS_DB } from '@/constants/appointment-departments';
import { dashboardApi } from '@/services/api';
import { CalendarDatePicker } from '@/components/appointments/CalendarDatePicker';
import { isFutureOrTodayIST, getTodayIST } from '@/utils/date-time';
import { scheduleAppointmentNotification, requestNotificationPermission, getNotificationStatus } from '@/services/notificationService';

const LOCATIONS_BY_DEPT: { [key: string]: string[] } = {
  passport: [
    'Passport Seva Kendra (PSK) - Central Region',
    'Post Office PSK (POPSK) - North Hub',
    'Regional Passport Office (RPO) - South Wing',
    'Passport Seva Camp - Sector 62',
  ],
  rto: [
    'RTO Zonal Office, Sector 10',
    'Automated Driving Test Track - North Bay',
    'Sub-Divisional RTO Campus - Sector 4',
    'Central Motor Transport Office',
  ],
  aadhaar: [
    'Aadhaar Seva Kendra, Connaught Place',
    'General Post Office (GPO) Aadhaar Center',
    'Zonal Civic Center Camp',
    'State Bank District Branch ASK',
  ],
};

const TIME_SLOTS = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
];

export default function BookAppointmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const dept = DEPARTMENTS_DB.find((d) => d.id === params.deptId) || DEPARTMENTS_DB[0];
  const selectedService = (params.service as string) || 'General Office Inquiry';

  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  // Error validations
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleConfirmBooking = async () => {
    const newErrors: { [key: string]: string } = {};

    if (!selectedLocation) newErrors.location = 'Please select a Preferred Office Location.';
    if (!selectedDate) {
      newErrors.date = 'Please select an Appointment Date.';
    } else if (!isFutureOrTodayIST(selectedDate)) {
      newErrors.date = 'Selected appointment date cannot be in the past. Please select today or a future date.';
    }
    if (!selectedTime) newErrors.time = 'Please select an Available Time Slot.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Alert.alert('Missing Selections', 'Please fill out all the required booking selections.');
      return;
    }

    setIsBooking(true);
    const randomId = `APT-SB-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const res = await dashboardApi.createActivity({
        type: 'appointment',
        title: `${dept.name}`,
        subtitle: `${selectedService} • ${selectedDate}, ${selectedTime}`,
        token: `Token: ${randomId}`,
        status: 'Upcoming',
        statusColor: '#000080',
        statusBg: '#EEF2FF',
        icon: dept.icon || '🛂',
        route: '/appointments/my-appointments',
        metadata: {
          deptId: dept.id,
          deptName: dept.name,
          service: selectedService,
          location: selectedLocation,
          date: selectedDate,
          time: selectedTime,
          bookingId: randomId,
          purpose,
        },
      });

      if (!res.success) {
        throw new Error(res.message || 'Server was unable to save appointment booking.');
      }

      // Schedule local browser reminder notification for this appointment
      try {
        const activityId = (res as any)?.activity?._id || randomId;
        await scheduleAppointmentNotification({
          id: activityId,
          officeName: dept.name,
          date: selectedDate,
          time: selectedTime,
          serviceName: selectedService,
          token: randomId,
        });
      } catch (notifErr) {
        console.warn('[Booking] Notification scheduling warning:', notifErr);
      }

      setIsBooking(false);
      setErrors({});
      router.push({
        pathname: '/appointments/confirmation',
        params: {
          deptId: dept.id,
          service: selectedService,
          location: selectedLocation,
          date: selectedDate,
          time: selectedTime,
          purpose,
          bookingId: randomId,
        },
      } as any);
    } catch (err: any) {
      setIsBooking(false);
      Alert.alert(
        'Booking Failed',
        err.message || 'Unable to confirm appointment booking. Please check your connection and retry.'
      );
    }
  };

  const locations = LOCATIONS_BY_DEPT[dept.id] || LOCATIONS_BY_DEPT.aadhaar;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#E6F0E8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#E6F0E8" />

      {/* Header bar */}
      <View className="px-6 py-4 flex-row items-center border-b border-[#CADDCB] bg-[#EDF5EE]">
        <View className="max-w-4xl w-full mx-auto flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-12 h-12 rounded-2xl bg-[#E0EDE1] border border-[#CADDCB] justify-center items-center mr-4 shadow-xs"
            activeOpacity={0.7}
          >
            <Text className="text-[#14532D] font-black text-xl">←</Text>
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-black text-[#14532D]">Book Appointment</Text>
            <Text className="text-xs font-bold text-[#4B6350] uppercase tracking-widest mt-0.5">
              {dept.name} • Office Visit Slot
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 130 }}>
        <View className="max-w-4xl w-full mx-auto">
          {/* Summary Card */}
          <View
            style={{
              shadowColor: '#14532D',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 10,
              elevation: 2,
            }}
            className="bg-[#F3F8F4] border border-[#CADDCB] p-6 rounded-3xl mb-5"
          >
            <View className="flex-row items-center space-x-2.5">
              <View className="w-16 h-16 bg-[#F0FDFA] border border-[#BAE6FD] rounded-2xl justify-center items-center mr-4">
                <Text className="text-3xl">{dept.icon}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs font-black text-[#0284C7] uppercase tracking-wider">
                  {dept.name}
                </Text>
                <Text className="text-lg font-black text-[#14532D] mt-0.5">
                  {selectedService}
                </Text>
              </View>
            </View>
          </View>

          {/* Location Dropdown Picker */}
          <View
            style={{
              shadowColor: '#14532D',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 10,
              elevation: 2,
            }}
            className="bg-[#F3F8F4] border border-[#CADDCB] p-6 rounded-3xl mb-5"
          >
            <Text className="text-sm font-black text-slate-800 mb-2.5">Preferred Office Location *</Text>
            <TouchableOpacity
              onPress={() => setShowLocationDropdown(!showLocationDropdown)}
              className={`w-full px-4 py-4 bg-[#EDF5EE] border ${
                errors.location ? 'border-red-400 bg-red-50/20' : 'border-[#CADDCB]'
              } rounded-2xl flex-row justify-between items-center`}
              activeOpacity={0.7}
            >
              <Text className={`text-sm font-bold ${selectedLocation ? 'text-slate-900' : 'text-slate-400'}`}>
                {selectedLocation || 'Select Office Location'}
              </Text>
              <Text className="text-slate-500 text-sm">{showLocationDropdown ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {showLocationDropdown && (
              <View className="bg-[#F3F8F4] border border-[#CADDCB] rounded-2xl mt-2 overflow-hidden shadow-xs">
                {locations.map((loc, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      setSelectedLocation(loc);
                      setShowLocationDropdown(false);
                      setErrors((prev) => ({ ...prev, location: '' }));
                    }}
                    className="px-4 py-3.5 border-b border-[#CADDCB] last:border-b-0"
                    activeOpacity={0.7}
                  >
                    <Text className="text-sm font-bold text-slate-800">{loc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {errors.location ? (
              <Text className="text-red-500 text-xs ml-1 mt-1 font-semibold">{errors.location}</Text>
            ) : null}
          </View>

          {/* Real Date Selection with IST Calendar & Validation */}
          <CalendarDatePicker
            selectedDate={selectedDate}
            onSelectDate={(dt) => {
              setSelectedDate(dt);
              setErrors((prev) => ({ ...prev, date: '' }));
            }}
            errorMessage={errors.date}
          />

          {/* Select Time Slot Section */}
          <View
            style={{
              shadowColor: '#14532D',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 10,
              elevation: 2,
            }}
            className="bg-[#F3F8F4] border border-[#CADDCB] p-6 rounded-3xl mb-5"
          >
            <Text className="text-sm font-black text-slate-800 mb-3">Available Time Slot *</Text>
            <View className="flex-row flex-wrap">
              {TIME_SLOTS.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  onPress={() => {
                    setSelectedTime(slot);
                    setErrors((prev) => ({ ...prev, time: '' }));
                  }}
                  activeOpacity={0.7}
                  className={`px-4.5 py-3 rounded-2xl border ${
                    selectedTime === slot
                      ? 'bg-[#14532D] border-[#14532D]'
                      : 'bg-[#EDF5EE] border-[#CADDCB]'
                  } mr-2.5 mb-2.5`}
                >
                  <Text
                    className={`text-sm font-black ${
                      selectedTime === slot ? 'text-white' : 'text-slate-700'
                    }`}
                  >
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.time ? (
              <Text className="text-red-500 text-xs ml-1 mt-1 font-semibold">{errors.time}</Text>
            ) : null}
          </View>

          {/* Purpose / Remarks (Optional) */}
          <View
            style={{
              shadowColor: '#14532D',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 10,
              elevation: 2,
            }}
            className="bg-[#F3F8F4] border border-[#CADDCB] p-6 rounded-3xl mb-6"
          >
            <Text className="text-sm font-black text-slate-800 mb-2">Remarks or Specific Purpose (Optional)</Text>
            <TextInput
              placeholder="e.g. Bringing supporting documents for urgent address renewal"
              placeholderTextColor="#94A3B8"
              value={purpose}
              onChangeText={setPurpose}
              className="w-full px-4 py-3.5 bg-[#EDF5EE] border border-[#CADDCB] rounded-2xl text-slate-900 font-semibold text-base"
            />
          </View>

          {/* Notification & IST Timings Notice */}
          <View className="bg-[#EDF5EE] border border-[#CADDCB] rounded-2xl p-4.5 mb-6 flex-row items-center">
            <Text className="text-2xl mr-3">🔔</Text>
            <View className="flex-1">
              <Text className="text-sm font-black text-[#14532D]">Local Visit Reminders Active</Text>
              <Text className="text-xs font-medium text-[#4B6350] mt-0.5 leading-5">
                All dates follow Indian Standard Time (IST). You'll receive a local reminder on your visit day with your gatepass token.
              </Text>
            </View>
          </View>

          {/* Confirm Booking CTA in Forest Green */}
          <TouchableOpacity
            onPress={handleConfirmBooking}
            disabled={isBooking}
            activeOpacity={0.85}
            className="w-full py-4.5 bg-[#14532D] rounded-2xl justify-center items-center shadow-xs"
          >
            {isBooking ? (
              <View className="flex-row items-center space-x-2">
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text className="text-white text-base font-black uppercase tracking-wider ml-2">
                  Securing Appointment...
                </Text>
              </View>
            ) : (
              <Text className="text-white text-base font-black uppercase tracking-wider">
                Confirm & Generate Gatepass Ticket →
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

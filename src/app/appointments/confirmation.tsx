import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { DEPARTMENTS_DB } from '@/constants/appointment-departments';
import { formatISTDate, calculateAppointmentCountdown, getTodayIST } from '@/utils/date-time';

export default function AppointmentConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const dept = DEPARTMENTS_DB.find((d) => d.id === params.deptId) || DEPARTMENTS_DB[0];
  const selectedService = (params.service as string) || 'General Office Inquiry';
  const selectedLocation = (params.location as string) || 'Central Civic Center';
  const selectedDate = (params.date as string) || getTodayIST();
  const selectedTime = (params.time as string) || '09:00 AM';
  const bookingId = (params.bookingId as string) || 'APT-SB-804918';

  const [tokenNumber, setTokenNumber] = useState('');

  useEffect(() => {
    const hash = bookingId.split('-').pop() || '100';
    const num = parseInt(hash.replace(/[^0-9]/g, ''), 10) || 418;
    setTokenNumber(`TKN-${(num % 900) + 100}`);
  }, [bookingId]);

  const readableDate = formatISTDate(selectedDate);
  const countdown = calculateAppointmentCountdown(selectedDate, selectedTime);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#E6F0E8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#E6F0E8" />

      {/* Header bar */}
      <View className="px-6 py-4 flex-row items-center border-b border-[#CADDCB] bg-[#EDF5EE]">
        <View className="max-w-lg w-full mx-auto flex-row items-center">
          <TouchableOpacity
            onPress={() => router.replace('/home')}
            className="w-12 h-12 rounded-2xl bg-[#E0EDE1] border border-[#CADDCB] justify-center items-center mr-4 shadow-xs"
            activeOpacity={0.7}
          >
            <Text className="text-[#14532D] font-black text-xl">←</Text>
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-black text-[#14532D]">Booking Pass</Text>
            <Text className="text-xs font-bold text-[#4B6350] uppercase tracking-widest mt-0.5">
              Digital Entry Ticket & QR Token
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 130, alignItems: 'center' }}>
        <View className="w-full max-w-lg items-center">
          {/* Green Check Badge */}
          <View className="w-20 h-20 rounded-3xl bg-[#ECFDF5] border border-[#A7F3D0] justify-center items-center mb-4">
            <Text className="text-[#10B981] text-4xl font-black">✓</Text>
          </View>

          <Text className="text-3xl font-black text-[#14532D] text-center tracking-tight">
            Appointment Booked
          </Text>
          <Text className="text-xs font-black text-[#10B981] uppercase tracking-widest mt-1.5 text-center">
            Verification Complete • e-Gate Pass Generated
          </Text>

          {/* Appointment Ticket Card */}
          <View
            style={{
              shadowColor: '#14532D',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.08,
              shadowRadius: 16,
              elevation: 3,
            }}
            className="bg-[#F3F8F4] border border-[#CADDCB] rounded-3xl w-full mt-7 overflow-hidden"
          >
            {/* Top Bar Header in Forest Green */}
            <View className="bg-[#14532D] px-6 py-5 flex-row items-center">
              <Text className="text-3xl mr-3.5">{dept.icon}</Text>
              <View className="flex-1">
                <Text className="text-[10px] font-black text-emerald-200 uppercase tracking-widest">
                  Smart Bharat Digital Gatepass
                </Text>
                <Text className="text-base font-black text-white mt-0.5">{dept.name}</Text>
              </View>
            </View>

            {/* Ticket Info Body */}
            <View className="p-6 space-y-4">
              <View className="flex-row justify-between items-center pb-3.5 border-b border-[#CADDCB]">
                <View className="flex-1 pr-2">
                  <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reference ID</Text>
                  <Text className="text-sm font-black text-[#14532D] mt-0.5">{bookingId}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gate Token</Text>
                  <Text className="text-base font-black text-[#F97316] mt-0.5">{tokenNumber}</Text>
                </View>
              </View>

              <View className="py-1">
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">Service Requested</Text>
                <Text className="text-base font-black text-[#14532D] mt-0.5">{selectedService}</Text>
              </View>

              <View className="py-1">
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">Office Center</Text>
                <Text className="text-sm font-semibold text-slate-800 mt-0.5">{selectedLocation}</Text>
              </View>

              <View className="flex-row justify-between py-1 items-center">
                <View>
                  <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scheduled Date (IST)</Text>
                  <Text className="text-sm font-black text-[#14532D] mt-0.5">{readableDate}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">Time Slot</Text>
                  <Text className="text-sm font-black text-[#10B981] mt-0.5">{selectedTime}</Text>
                </View>
              </View>

              {/* Dynamic Countdown Pill on Confirmation Ticket */}
              <View className="py-1 flex-row items-center justify-between">
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">Appointment Status</Text>
                <View
                  style={{
                    backgroundColor: countdown.isToday
                      ? '#FEE2E2'
                      : countdown.isTomorrow
                      ? '#FEF3C7'
                      : '#E0F2FE',
                    borderColor: countdown.isToday
                      ? '#EF4444'
                      : countdown.isTomorrow
                      ? '#F59E0B'
                      : '#38BDF8',
                  }}
                  className="px-3 py-1 rounded-full border"
                >
                  <Text
                    style={{
                      color: countdown.isToday
                        ? '#DC2626'
                        : countdown.isTomorrow
                        ? '#B45309'
                        : '#0369A1',
                    }}
                    className="text-xs font-black uppercase tracking-wide"
                  >
                    {countdown.isToday
                      ? '🚨 Today'
                      : countdown.isTomorrow
                      ? '⏳ Tomorrow'
                      : countdown.countdownLabel}
                  </Text>
                </View>
              </View>

              {/* Local Notification Notice */}
              <View className="bg-[#EDF5EE] border border-[#CADDCB] rounded-xl p-3.5 flex-row items-center">
                <Text className="text-lg mr-2.5">🔔</Text>
                <Text className="text-xs text-[#4B6350] font-medium flex-1">
                  Local reminder notification is scheduled for your visit morning in IST.
                </Text>
              </View>

              {/* QR Representation */}
              <View className="mt-3 p-5 bg-[#EDF5EE] border border-dashed border-[#CADDCB] rounded-2xl items-center">
                <View className="w-28 h-28 bg-[#F3F8F4] border border-[#CADDCB] rounded-2xl justify-center items-center shadow-xs">
                  <Text className="text-4xl">🏁</Text>
                </View>
                <Text className="text-xs text-slate-600 font-medium text-center mt-2.5">
                  Scan this digital gatepass QR at the reception gate.
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="w-full mt-7 space-y-3.5">
            <TouchableOpacity
              onPress={() => router.push('/appointments/my-appointments' as any)}
              activeOpacity={0.85}
              className="w-full py-4.5 bg-[#14532D] rounded-2xl justify-center items-center shadow-xs"
            >
              <Text className="text-white text-base font-black uppercase tracking-wider">
                View in Activity Center →
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.replace('/home')}
              activeOpacity={0.7}
              className="w-full py-4 border border-[#CADDCB] bg-[#EDF5EE] rounded-2xl justify-center items-center shadow-xs"
            >
              <Text className="text-[#14532D] text-sm font-black uppercase tracking-wider">
                Back to Dashboard
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

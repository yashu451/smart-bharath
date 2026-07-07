import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { DEPARTMENTS_DB } from '@/constants/appointment-departments';

const DATES_LABELS: { [key: string]: string } = {
  '2026-07-08': 'Wed 08 Jul',
  '2026-07-09': 'Thu 09 Jul',
  '2026-07-10': 'Fri 10 Jul',
  '2026-07-13': 'Mon 13 Jul',
  '2026-07-14': 'Tue 14 Jul',
};

export default function AppointmentConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Find department, fallback to Aadhaar
  const dept = DEPARTMENTS_DB.find((d) => d.id === params.deptId) || DEPARTMENTS_DB[0];
  const selectedService = (params.service as string) || 'General Office Inquiry';
  const selectedLocation = (params.location as string) || 'Central Civic Center';
  const selectedDate = (params.date as string) || '2026-07-08';
  const selectedTime = (params.time as string) || '09:00 AM';
  const bookingId = (params.bookingId as string) || 'APT-SB-804918';

  // Generate static token number and instructions
  const [tokenNumber, setTokenNumber] = useState('');

  useEffect(() => {
    // Generate a fixed token number based on Booking Reference
    const hash = bookingId.split('-').pop() || '100';
    const num = parseInt(hash.replace(/[^0-9]/g, ''), 10) || 418;
    setTokenNumber(`TKN-${(num % 900) + 100}`);
  }, [bookingId]);

  const readableDate = DATES_LABELS[selectedDate] || selectedDate;

  const instructions = [
    'Please arrive at least 15 minutes before your scheduled slot.',
    'Present the entry ticket QR Code at the security desk upon arrival.',
    'Ensure you carry your physical Aadhaar card and required documents.',
    'Follow social distancing protocols inside the office premises.',
  ];

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header bar */}
      <View className="px-6 py-4 flex-row items-center border-b border-slate-100 bg-white">
        <TouchableOpacity
          onPress={() => router.replace('/home')}
          className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/60 justify-center items-center mr-3"
        >
          <Text className="text-slate-700 font-bold text-lg">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800">Booking Summary</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 50 }}>
        
        <View className="items-center py-4">
          
          {/* Green Check Badge */}
          <View className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-500 justify-center items-center mb-4">
            <Text className="text-emerald-600 text-2xl font-bold">✓</Text>
          </View>

          <Text className="text-xl font-extrabold text-slate-850 text-center px-4">
            ✅ Appointment Successfully Booked
          </Text>
          <Text className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-1.5 text-center">
            Verification complete • e-Gate pass generated
          </Text>

          {/* Appointment Summary Card */}
          <View 
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 }}
            className="bg-white border border-slate-150 rounded-3xl w-full max-w-sm mt-6 overflow-hidden"
          >
            {/* Top Bar Header */}
            <View className="bg-bharat-navy px-5 py-4 flex-row items-center">
              <Text className="text-xl mr-3">{dept.icon}</Text>
              <View className="flex-1">
                <Text className="text-[8px] font-bold text-white/60 uppercase tracking-widest">
                  Smart Bharat Booking Ticket
                </Text>
                <Text className="text-xs font-bold text-white mt-0.5">{dept.name}</Text>
              </View>
            </View>

            {/* Ticket Info Body */}
            <View className="p-6 space-y-4">
              
              <View className="flex-row justify-between">
                <View className="flex-1 pr-4">
                  <Text className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Appointment ID</Text>
                  <Text className="text-xs font-extrabold text-slate-800 mt-0.5">{bookingId}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Token Number</Text>
                  <Text className="text-xs font-extrabold text-bharat-accent mt-0.5">{tokenNumber}</Text>
                </View>
              </View>

              <View className="border-t border-slate-100 pt-3.5">
                <Text className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Service</Text>
                <Text className="text-xs font-extrabold text-slate-850 mt-0.5">{selectedService}</Text>
              </View>

              <View className="border-t border-slate-100 pt-3.5">
                <Text className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Office Address</Text>
                <Text className="text-xs font-extrabold text-slate-800 mt-0.5 leading-normal">
                  {selectedLocation}
                </Text>
              </View>

              <View className="flex-row justify-between border-t border-slate-100 pt-3.5">
                <View>
                  <Text className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Date</Text>
                  <Text className="text-xs font-extrabold text-slate-800 mt-0.5">{readableDate}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Time</Text>
                  <Text className="text-xs font-extrabold text-slate-800 mt-0.5">{selectedTime}</Text>
                </View>
              </View>

              {/* Instructions Section */}
              <View className="border-t border-slate-100 pt-3.5">
                <Text className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Instructions for the visit
                </Text>
                <View className="space-y-1.5">
                  {instructions.map((inst, idx) => (
                    <View key={idx} className="flex-row items-start space-x-1.5">
                      <Text className="text-bharat-accent text-[9px] font-bold mt-0.5">•</Text>
                      <Text className="text-[10px] text-slate-600 font-semibold leading-normal flex-1">
                        {inst}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Barcode/QR pass */}
              <View className="border border-slate-100 bg-slate-50/50 p-4 rounded-2xl items-center mt-2">
                <View className="w-20 h-20 bg-white border border-slate-200 justify-center items-center rounded-xl relative">
                  <Text className="text-3xl">🎫</Text>
                  <View className="absolute top-1 left-1 w-2 h-2 bg-black" />
                  <View className="absolute top-1 right-1 w-2 h-2 bg-black" />
                  <View className="absolute bottom-1 left-1 w-2 h-2 bg-black" />
                </View>
                <Text className="text-[8px] text-slate-400 font-semibold text-center mt-2.5 leading-normal">
                  Show this gatepass QR at reception gate scanner.
                </Text>
              </View>

            </View>
          </View>

          {/* Action Buttons Container */}
          <View className="w-full max-w-sm mt-8 space-y-3">
            {/* Primary Back to Dashboard */}
            <TouchableOpacity
              onPress={() => router.replace('/home')}
              style={{ shadowColor: '#4A90E2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 }}
              className="w-full py-4 bg-bharat-accent rounded-xl justify-center items-center"
            >
              <Text className="text-white text-base font-bold">Back to Dashboard</Text>
            </TouchableOpacity>

            {/* Secondary View My Appointments */}
            <TouchableOpacity
              onPress={() => router.push('/appointments/my-appointments' as any)}
              className="w-full py-3.5 border border-slate-250 bg-white rounded-xl justify-center items-center"
            >
              <Text className="text-slate-700 text-xs font-bold">View My Appointments</Text>
            </TouchableOpacity>
          </View>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, StatusBar, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { DEPARTMENTS_DB } from '@/constants/appointment-departments';

const DATES = [
  { label: 'Wed 08 Jul', value: '2026-07-08' },
  { label: 'Thu 09 Jul', value: '2026-07-09' },
  { label: 'Fri 10 Jul', value: '2026-07-10' },
  { label: 'Mon 13 Jul', value: '2026-07-13' },
  { label: 'Tue 14 Jul', value: '2026-07-14' },
];

const TIME_SLOTS = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '02:00 PM',
  '03:00 PM',
];

const LOCATIONS_BY_DEPT: { [key: string]: string[] } = {
  aadhaar: ['Aadhaar Seva Kendra, Connaught Place', 'Aadhaar Center, Metro Station Block B', 'District HQ UIDAI Counter'],
  passport: ['Passport Seva Kendra (PSK) - Central Region', 'Passport Seva Kendra (PSK) - South Zone', 'Post Office PSK Counter'],
  rto: ['RTO Zonal Office, Sector 10', 'Regional Transport Office, Wazirpur', 'RTO Inspection Ground Counter'],
  revenue: ['Sub-Divisional Magistrate (SDM) Office', 'District Collectorate Office Counter 3', 'Tehsil Revenue Court Block'],
  municipal: ['Municipal Corporation HQ, Civic Center', 'Zonal Office Ward 4, Sector 7', 'Town Hall Public Desk'],
  electricity: ['Electricity Division Office, Substation A', 'Billing Circle Counter, Sector 12', 'Discom Complaint Kiosk'],
  water: ['Water Board Zonal Office, Main Road', 'Water Board Bill Collection Desk', 'DJB Supply Division Head Office'],
  police: ['District Police Headquarters, Room 12', 'Local Police Station Desk A', 'SP Clearance Certificate Office'],
  'social-welfare': ['District Social Welfare Office Desk 4', 'Directorate of Social Welfare, Main HQ', 'Civic Pension Help Desk'],
  agriculture: ['District Agriculture Office, Krishi Bhawan', 'Sub-Divisional Agriculture Kiosk', 'Seed Subsidy Distribution Hub'],
};

export default function BookAppointmentScreen() {
  const router = useRouter();
  const { deptId, service } = useLocalSearchParams();

  // Find department details, fallback to Aadhaar
  const dept = DEPARTMENTS_DB.find((d) => d.id === deptId) || DEPARTMENTS_DB[0];
  const selectedService = (service as string) || 'General Office Inquiry';

  // Selection states
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  // Error validations
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleConfirmBooking = () => {
    const newErrors: { [key: string]: string } = {};

    if (!selectedLocation) newErrors.location = 'Please select a Preferred Office Location.';
    if (!selectedDate) newErrors.date = 'Please select an Appointment Date.';
    if (!selectedTime) newErrors.time = 'Please select an Available Time Slot.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Alert.alert('Missing Selections', 'Please fill out all the required booking selections.');
      return;
    }

    // Generate random Reference ID
    const randomId = `APT-SB-${Math.floor(100000 + Math.random() * 900000)}`;

    // Clear errors and navigate to confirmation screen passing query params
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
      }
    } as any);
  };

  const locations = LOCATIONS_BY_DEPT[dept.id] || LOCATIONS_BY_DEPT.aadhaar;

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header bar */}
      <View className="px-6 py-4 flex-row items-center border-b border-slate-100 bg-white">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/60 justify-center items-center mr-3"
        >
          <Text className="text-slate-700 font-bold text-lg">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800">Book Appointment</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 50 }}>
        
        <View className="space-y-6">
          
          {/* Summary Banner */}
          <View className="bg-slate-50 border border-slate-150 p-5 rounded-2xl">
            <View className="flex-row items-center space-x-2.5 mb-2">
              <Text className="text-xl">{dept.icon}</Text>
              <Text className="text-[9px] font-extrabold text-slate-450 uppercase tracking-wider">
                {dept.name}
              </Text>
            </View>
            <Text className="text-base font-bold text-slate-800">{selectedService}</Text>
          </View>

          {/* Location Dropdown Picker */}
          <View className="space-y-1">
            <Text className="text-xs font-bold text-slate-500 ml-1">Preferred Office Location *</Text>
            <TouchableOpacity
              onPress={() => setShowLocationDropdown(!showLocationDropdown)}
              className={`w-full px-4 py-3.5 bg-slate-50 border ${
                errors.location ? 'border-red-400' : 'border-slate-200'
              } rounded-[16px] flex-row justify-between items-center`}
            >
              <Text className={`font-semibold ${selectedLocation ? 'text-slate-800' : 'text-slate-400'}`}>
                {selectedLocation || 'Select Office Location'}
              </Text>
              <Text className="text-slate-400 text-xs">{showLocationDropdown ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {showLocationDropdown && (
              <View className="bg-white border border-slate-200 rounded-2xl mt-1 overflow-hidden shadow-md">
                {locations.map((loc, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      setSelectedLocation(loc);
                      setShowLocationDropdown(false);
                      setErrors((prev) => ({ ...prev, location: '' }));
                    }}
                    className="px-4 py-3 border-b border-slate-100"
                  >
                    <Text className="font-semibold text-slate-700">{loc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {errors.location ? (
              <Text className="text-red-500 text-[10px] ml-1 font-semibold">{errors.location}</Text>
            ) : null}
          </View>

          {/* Select Date Section */}
          <View className="border-t border-slate-100 pt-5">
            <Text className="text-xs font-bold text-slate-500 ml-1 mb-3">Appointment Date *</Text>
            <View className="flex-row flex-wrap mt-1">
              {DATES.map((dt) => (
                <TouchableOpacity
                  key={dt.value}
                  onPress={() => {
                    setSelectedDate(dt.value);
                    setErrors((prev) => ({ ...prev, date: '' }));
                  }}
                  className={`px-4 py-2.5 rounded-full border ${
                    selectedDate === dt.value
                      ? 'bg-bharat-accent border-bharat-accent text-white'
                      : 'bg-white border-slate-200'
                  } mr-2.5 mb-2.5`}
                >
                  <Text className={`text-xs font-bold ${
                    selectedDate === dt.value ? 'text-white' : 'text-slate-650'
                  }`}>
                    {dt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.date ? (
              <Text className="text-red-500 text-[10px] ml-1 font-semibold mt-1">{errors.date}</Text>
            ) : null}
          </View>

          {/* Select Time Section */}
          <View className="border-t border-slate-100 pt-5">
            <Text className="text-xs font-bold text-slate-500 ml-1 mb-3">Available Time Slot *</Text>
            <View className="flex-row flex-wrap mt-1">
              {TIME_SLOTS.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  onPress={() => {
                    setSelectedTime(slot);
                    setErrors((prev) => ({ ...prev, time: '' }));
                  }}
                  className={`px-4 py-2.5 rounded-full border ${
                    selectedTime === slot
                      ? 'bg-bharat-navy border-bharat-navy'
                      : 'bg-white border-slate-200'
                  } mr-2.5 mb-2.5`}
                >
                  <Text className={`text-xs font-bold ${
                    selectedTime === slot ? 'text-white' : 'text-slate-650'
                  }`}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.time ? (
              <Text className="text-red-500 text-[10px] ml-1 font-semibold mt-1">{errors.time}</Text>
            ) : null}
          </View>

          {/* Purpose of Visit (Optional) Field */}
          <View className="border-t border-slate-100 pt-5">
            <Text className="text-xs font-bold text-slate-500 ml-1">Purpose of Visit (Optional)</Text>
            <TextInput
              placeholder="Enter purpose of visit or comments"
              placeholderTextColor="#94A3B8"
              value={purpose}
              onChangeText={setPurpose}
              multiline={true}
              numberOfLines={3}
              style={{ textAlignVertical: 'top' }}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-[16px] text-slate-800 font-semibold mt-1.5 h-24"
            />
          </View>

          {/* Confirm Booking Button */}
          <TouchableOpacity
            onPress={handleConfirmBooking}
            style={{ shadowColor: '#4A90E2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 }}
            className="w-full py-4 bg-bharat-accent rounded-xl justify-center items-center mt-6"
          >
            <Text className="text-white text-base font-bold">Confirm Appointment</Text>
          </TouchableOpacity>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

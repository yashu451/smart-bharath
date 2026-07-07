import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router';

interface AppointmentRecord {
  id: string;
  deptName: string;
  icon: string;
  service: string;
  location: string;
  date: string;
  time: string;
  token: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
}

const INITIAL_APPOINTMENTS: AppointmentRecord[] = [
  {
    id: 'APT-SB-482019',
    deptName: 'Passport Office',
    icon: '🛂',
    service: 'New Passport',
    location: 'Passport Seva Kendra (PSK) - Central Region',
    date: 'Wed 08 Jul',
    time: '10:30 AM',
    token: 'TKN-528',
    status: 'Upcoming',
  },
  {
    id: 'APT-SB-391048',
    deptName: 'Transport Department (RTO)',
    icon: '🚗',
    service: 'Driving Licence Test',
    location: 'RTO Zonal Office, Sector 10',
    date: '28-Jun-2026',
    time: '11:30 AM',
    token: 'TKN-214',
    status: 'Completed',
  },
  {
    id: 'APT-SB-290481',
    deptName: 'Aadhaar Services',
    icon: '🪪',
    service: 'Biometric Profile Update',
    location: 'Aadhaar Seva Kendra, Connaught Place',
    date: '15-May-2026',
    time: '02:30 PM',
    token: 'TKN-810',
    status: 'Completed',
  },
  {
    id: 'APT-SB-190471',
    deptName: 'Municipal Corporation',
    icon: '🏢',
    service: 'Birth Certificate Registry',
    location: 'Municipal Corporation HQ, Civic Center',
    date: '12-Apr-2026',
    time: '09:30 AM',
    token: 'TKN-305',
    status: 'Cancelled',
  },
];

export default function MyAppointmentsScreen() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<AppointmentRecord[]>(INITIAL_APPOINTMENTS);

  const handleCancelAppointment = (id: string) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this office visit booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            setAppointments((prev) =>
              prev.map((app) => (app.id === id ? { ...app, status: 'Cancelled' } : app))
            );
            Alert.alert('Booking Cancelled', 'Your scheduled visit has been cancelled successfully.');
          },
        },
      ]
    );
  };

  const handleReschedule = (app: AppointmentRecord) => {
    Alert.alert(
      'Reschedule Appointment',
      `To reschedule "${app.service}", please choose another date/time slot. In final releases, calendar reallocation interfaces will open here.`,
      [{ text: 'OK' }]
    );
  };

  const handleViewDetails = (app: AppointmentRecord) => {
    Alert.alert(
      'Appointment Details',
      `ID: ${app.id}\nToken: ${app.token}\nDepartment: ${app.deptName}\nService: ${app.service}\nLocation: ${app.location}\nDate: ${app.date}\nTime: ${app.time}\nStatus: ${app.status}\n\nPresent this verification ticket at the office gate.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-slate-50">
      <StatusBar barStyle="dark-content" />

      {/* Header bar */}
      <View className="px-6 py-4 flex-row items-center border-b border-slate-100 bg-white">
        <TouchableOpacity
          onPress={() => router.replace('/home')}
          className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/60 justify-center items-center mr-3"
        >
          <Text className="text-slate-700 font-bold text-lg">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800">My Appointments</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
        
        {/* Title Details */}
        <View className="mb-6">
          <Text className="text-2xl font-extrabold text-bharat-dark">Track Office Visits</Text>
          <Text className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">
            Monitor and manage your scheduled government appointments
          </Text>
        </View>

        {/* Appointments List */}
        <View className="space-y-5">
          {appointments.map((app) => (
            <View
              key={app.id}
              style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 1 }}
              className="bg-white border border-slate-100 rounded-2xl p-5"
            >
              {/* Card top row: badge and ID */}
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-[9px] font-bold text-slate-400">{app.id}</Text>
                
                <View className={`px-2 py-0.5 rounded-md border ${
                  app.status === 'Upcoming'
                    ? 'bg-blue-50 border-blue-200/50'
                    : app.status === 'Completed'
                      ? 'bg-slate-50 border-slate-200/50'
                      : 'bg-red-50 border-red-200/50'
                }`}>
                  <Text className={`text-[8px] font-extrabold uppercase ${
                    app.status === 'Upcoming'
                      ? 'text-blue-600'
                      : app.status === 'Completed'
                        ? 'text-slate-500'
                        : 'text-red-500'
                  }`}>
                    {app.status}
                  </Text>
                </View>
              </View>

              {/* Department and Service */}
              <View className="flex-row items-center space-x-2.5 pb-3 border-b border-slate-100">
                <Text className="text-xl">{app.icon}</Text>
                <View className="flex-1">
                  <Text className="text-[8px] font-extrabold text-slate-450 uppercase tracking-wide">
                    {app.deptName}
                  </Text>
                  <Text className="text-sm font-bold text-slate-800 mt-0.5">{app.service}</Text>
                </View>
              </View>

              {/* Scheduling Details */}
              <View className="py-3 space-y-2">
                <View className="flex-row justify-between">
                  <Text className="text-[10px] font-semibold text-slate-400">Office</Text>
                  <Text className="text-[10px] font-bold text-slate-750 text-right flex-1 ml-6 leading-normal">
                    {app.location}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-[10px] font-semibold text-slate-400">Appointment Date</Text>
                  <Text className="text-[10px] font-bold text-slate-750">{app.date}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-[10px] font-semibold text-slate-400">Time</Text>
                  <Text className="text-[10px] font-bold text-slate-750">{app.time}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-[10px] font-semibold text-slate-400">Token Number</Text>
                  <Text className="text-[10px] font-bold text-bharat-accent">{app.token}</Text>
                </View>
              </View>

              {/* Action buttons footer */}
              <View className="flex-row justify-between pt-3 border-t border-slate-100 mt-2 flex-wrap">
                {/* View Details always present */}
                <TouchableOpacity
                  onPress={() => handleViewDetails(app)}
                  className={`py-2 rounded-lg justify-center items-center ${
                    app.status === 'Upcoming' ? 'w-[30%]' : 'w-full'
                  } border border-slate-200 bg-white`}
                >
                  <Text className="text-slate-600 text-[10px] font-bold">View Details</Text>
                </TouchableOpacity>

                {/* Cancel & Reschedule only if Upcoming */}
                {app.status === 'Upcoming' && (
                  <>
                    <TouchableOpacity
                      onPress={() => handleReschedule(app)}
                      className="w-[30%] py-2 bg-bharat-navy rounded-lg justify-center items-center"
                    >
                      <Text className="text-white text-[10px] font-bold">Reschedule</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleCancelAppointment(app.id)}
                      className="w-[30%] py-2 border border-red-200 bg-red-50/20 rounded-lg justify-center items-center"
                    >
                      <Text className="text-red-650 text-[10px] font-bold">Cancel</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Return Button */}
        <TouchableOpacity
          onPress={() => router.replace('/home')}
          className="mt-6 border border-slate-250 py-3.5 rounded-xl justify-center items-center bg-white"
        >
          <Text className="text-slate-500 font-bold text-sm">Return to Dashboard</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { DEPARTMENTS_DB, DepartmentItem } from '@/constants/appointment-departments';

export default function SelectDepartmentScreen() {
  const router = useRouter();

  const handleSelectDepartment = (deptId: string) => {
    router.push({
      pathname: '/appointments/choose-service',
      params: { deptId }
    } as any);
  };

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
        <Text className="text-lg font-bold text-slate-800">Smart Bharat</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
        
        {/* Title details */}
        <View className="mb-6">
          <Text className="text-2xl font-extrabold text-bharat-dark">Book an Office Visit</Text>
          <Text className="text-xs font-semibold text-slate-400 mt-1.5 uppercase tracking-wider leading-normal">
            Choose the government department you want to visit.
          </Text>
        </View>

        {/* 2-column or 1-column responsive card list */}
        <View className="space-y-4">
          {DEPARTMENTS_DB.map((dept: DepartmentItem) => (
            <TouchableOpacity
              key={dept.id}
              onPress={() => handleSelectDepartment(dept.id)}
              style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 1 }}
              className="bg-white border border-slate-100 p-5 rounded-2xl flex-row items-center"
            >
              {/* Modern icon */}
              <View className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl justify-center items-center mr-4">
                <Text className="text-2xl">{dept.icon}</Text>
              </View>

              {/* Text metadata */}
              <View className="flex-1 pr-2">
                <Text className="text-sm font-bold text-slate-800">{dept.name}</Text>
                <Text className="text-[10px] text-slate-400 mt-1 font-semibold leading-relaxed">
                  {dept.description}
                </Text>
              </View>

              {/* Action forward indicator */}
              <Text className="text-slate-300 font-bold text-sm ml-2">→</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Safety notice disclaimer */}
        <View className="bg-slate-50 border border-slate-150 p-4 rounded-xl items-center mt-6">
          <Text className="text-[9px] text-slate-400 font-semibold text-center leading-normal">
            Secure digital bookings are verified using Aadhaar e-KYC to eliminate long queues.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

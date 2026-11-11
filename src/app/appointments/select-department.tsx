import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { DEPARTMENTS_DB, DepartmentItem } from '@/constants/appointment-departments';

export default function SelectDepartmentScreen() {
  const router = useRouter();

  const handleSelectDepartment = (deptId: string) => {
    router.push({
      pathname: '/appointments/choose-service',
      params: { deptId },
    } as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#E6F0E8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#E6F0E8" />

      {/* Header bar */}
      <View className="px-6 py-4 flex-row items-center border-b border-[#CADDCB] bg-[#EDF5EE]">
        <View className="max-w-4xl w-full mx-auto flex-row items-center">
          <TouchableOpacity
            onPress={() => router.replace('/home')}
            className="w-12 h-12 rounded-2xl bg-[#E0EDE1] border border-[#CADDCB] justify-center items-center mr-4 shadow-xs"
            activeOpacity={0.7}
          >
            <Text className="text-[#14532D] font-black text-xl">←</Text>
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-black text-[#14532D]">Office Visits</Text>
            <Text className="text-xs font-bold text-[#4B6350] uppercase tracking-widest mt-0.5">
              Book In-Person Appointments & e-Tokens
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 130 }}>
        <View className="max-w-4xl w-full mx-auto">
          {/* Title details with Orange Indicator */}
          <View className="mb-6 flex-row items-center">
            <View className="w-1.5 h-8 rounded-full bg-[#F97316] mr-3.5" />
            <View>
              <Text className="text-3xl font-black text-[#14532D] tracking-tight">Select Department</Text>
              <Text className="text-base font-medium text-slate-600 mt-1">
                Choose the regional public service office you wish to visit
              </Text>
            </View>
          </View>

          {/* Department cards list */}
          <View className="space-y-4">
            {DEPARTMENTS_DB.map((dept: DepartmentItem) => (
              <TouchableOpacity
                key={dept.id}
                onPress={() => handleSelectDepartment(dept.id)}
                activeOpacity={0.75}
                style={{
                  shadowColor: '#14532D',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.04,
                  shadowRadius: 10,
                  elevation: 2,
                }}
                className="bg-[#F3F8F4] border border-[#CADDCB] p-6 rounded-3xl flex-row items-center mb-4"
              >
                {/* Sky Cyan icon container */}
                <View className="w-14 h-14 bg-[#F0FDFA] border border-[#BAE6FD] rounded-2xl justify-center items-center mr-4">
                  <Text className="text-3xl">{dept.icon}</Text>
                </View>

                {/* Text metadata */}
                <View className="flex-1 pr-3">
                  <Text className="text-lg font-black text-[#14532D]">{dept.name}</Text>
                  <Text className="text-sm text-slate-600 mt-1 font-medium leading-relaxed" numberOfLines={2}>
                    {dept.description}
                  </Text>
                </View>

                {/* Action forward indicator */}
                <View className="bg-[#EDF5EE] border border-[#CADDCB] px-3.5 py-2 rounded-xl">
                  <Text className="text-sm font-bold text-[#14532D]">→</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Safety notice disclaimer */}
          <View className="bg-[#F3F8F4] border border-[#CADDCB] p-5 rounded-2xl items-center mt-6 shadow-xs">
            <Text className="text-xs text-slate-600 font-semibold text-center leading-relaxed">
              🛡️ Verified appointments receive digital entry QR gatepasses to bypass physical queue lines.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

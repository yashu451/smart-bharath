import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { COMPLAINT_CATEGORIES } from '@/constants/grievance-routing';

export default function GrievancesHomeScreen() {
  const router = useRouter();

  const handleCategoryPress = (categoryLabel: string) => {
    router.push({
      pathname: '/grievances/report',
      params: { category: categoryLabel },
    } as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#E6F0E8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#E6F0E8" />

      {/* Header bar */}
      <View className="px-6 py-4 flex-row items-center border-b border-[#CADDCB] bg-[#EDF5EE]">
        <TouchableOpacity
          onPress={() => router.replace('/home')}
          className="w-11 h-11 rounded-2xl bg-[#E0EDE1] border border-[#CADDCB] justify-center items-center mr-3.5 shadow-xs"
          activeOpacity={0.7}
        >
          <Text className="text-[#14532D] font-black text-lg">←</Text>
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-base font-black text-[#14532D]">Grievance Guidance & Tracking</Text>
          <Text className="text-[10px] font-bold text-[#4B6350] uppercase tracking-widest mt-0.5">
            Public Complaints Navigator & Insights
          </Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
        {/* Important Official Disclaimer Notice */}
        <View className="bg-[#FFFBEB] border border-[#FDE68A] p-4 rounded-3xl mb-5 flex-row items-start">
          <Text className="text-xl mr-3 mt-0.5">ℹ️</Text>
          <View className="flex-1">
            <Text className="text-xs font-black text-amber-900 mb-1">
              Official Government Submission Notice
            </Text>
            <Text className="text-[11px] text-amber-800 leading-relaxed font-medium">
              Smart Bharat guides you to the correct government portal (CPGRAMS, Janaspandana, CM Helpline), explains filing requirements, and tracks your waiting periods. Official complaints are processed directly by designated government authorities.
            </Text>
          </View>
        </View>

        {/* Action Cards (2 Columns) */}
        <View className="flex-row justify-between mb-5">
          <TouchableOpacity
            onPress={() => router.push('/grievances/report' as any)}
            activeOpacity={0.85}
            className="w-[48%] bg-[#14532D] p-5 rounded-3xl shadow-xs justify-between"
          >
            <View>
              <Text className="text-2xl mb-2">🧭</Text>
              <Text className="text-sm font-black text-white leading-tight">
                Find Official Portal & Guidance
              </Text>
              <Text className="text-[10.5px] text-emerald-200 mt-1.5 leading-snug font-medium">
                Identify correct authority, rules & direct portal link
              </Text>
            </View>
            <Text className="text-[11px] font-black text-amber-300 mt-3">Start Guidance →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/grievances/track' as any)}
            activeOpacity={0.85}
            className="w-[48%] bg-[#F3F8F4] border border-[#CADDCB] p-5 rounded-3xl shadow-xs justify-between"
          >
            <View>
              <Text className="text-2xl mb-2">📋</Text>
              <Text className="text-sm font-black text-[#14532D] leading-tight">
                My Complaints & Tracking
              </Text>
              <Text className="text-[10.5px] text-slate-500 mt-1.5 leading-snug font-medium">
                Track reference numbers, waiting days & timeline alerts
              </Text>
            </View>
            <Text className="text-[11px] font-black text-[#F97316] mt-3">View Complaints →</Text>
          </TouchableOpacity>
        </View>

        {/* Title details with Orange Indicator */}
        <View className="mb-4 flex-row items-center">
          <View className="w-1 h-5 rounded-full bg-[#F97316] mr-2.5" />
          <View>
            <Text className="text-lg font-black text-[#14532D] tracking-tight">Select Complaint Category</Text>
            <Text className="text-xs font-semibold text-slate-500 mt-0.5">
              Choose your issue to receive state-specific portal recommendations
            </Text>
          </View>
        </View>

        {/* Categories Grid (2 Columns) */}
        <View className="flex-row flex-wrap justify-between mb-5">
          {COMPLAINT_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => handleCategoryPress(cat.label)}
              activeOpacity={0.75}
              style={{
                shadowColor: '#14532D',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.04,
                shadowRadius: 10,
                elevation: 2,
              }}
              className="w-[48%] bg-[#F3F8F4] border border-[#CADDCB] rounded-3xl p-4 mb-3.5 flex-col justify-between"
            >
              <View>
                <View className="w-10 h-10 rounded-2xl bg-[#FFF7ED] border border-[#FED7AA] justify-center items-center mb-2.5">
                  <Text className="text-xl">{cat.icon}</Text>
                </View>
                <Text className="text-xs font-black text-[#14532D] leading-tight">
                  {cat.label}
                </Text>
              </View>
              <Text className="text-[10.5px] font-black text-[#F97316] mt-2.5">Get Guidance →</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Add Existing Button */}
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/grievances/report', params: { mode: 'save_only' } } as any)}
          activeOpacity={0.8}
          className="border border-[#CADDCB] py-3.5 px-4 rounded-2xl justify-center items-center bg-[#EDF5EE]"
        >
          <Text className="text-xs font-bold text-[#14532D]">
            Already filed a complaint? + Save Reference Number
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

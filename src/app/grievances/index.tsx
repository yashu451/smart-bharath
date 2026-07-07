import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { GRIEVANCE_CATEGORIES, GrievanceCategory } from '@/constants/grievance-categories';

export default function GrievancesHomeScreen() {
  const router = useRouter();

  const handleCategoryPress = (categoryId: string) => {
    router.push({
      pathname: '/grievances/report',
      params: { category: categoryId }
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
          <Text className="text-2xl font-extrabold text-bharat-dark">Civic Grievances</Text>
          <Text className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">
            Report and track public issues in your locality.
          </Text>
        </View>

        {/* Categories Grid (2 Columns) */}
        <View className="flex-row flex-wrap justify-between mt-2 mb-6">
          {GRIEVANCE_CATEGORIES.map((cat: GrievanceCategory) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => handleCategoryPress(cat.id)}
              style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 1 }}
              className="w-[48%] bg-white border border-slate-100 rounded-2xl p-4 mb-4 flex-col justify-between"
            >
              {/* Category Icon and Header */}
              <View>
                <View 
                  style={{ backgroundColor: `${cat.color}15` }}
                  className="w-9 h-9 rounded-lg justify-center items-center mb-3"
                >
                  <Text className="text-lg">{cat.icon}</Text>
                </View>
                <Text className="text-sm font-bold text-slate-800 leading-tight">
                  {cat.title}
                </Text>
                <Text className="text-[10px] text-slate-400 font-semibold leading-relaxed mt-2">
                  {cat.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Buttons Container */}
        <View className="space-y-4 pt-4 border-t border-slate-100">
          <TouchableOpacity
            onPress={() => router.push('/grievances/report' as any)}
            style={{ shadowColor: '#4A90E2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 }}
            className="w-full py-4 bg-bharat-accent rounded-xl justify-center items-center"
          >
            <Text className="text-white text-base font-bold">Report New Issue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/grievances/track' as any)}
            className="w-full py-4 border border-slate-250 bg-white rounded-xl justify-center items-center"
          >
            <Text className="text-slate-700 text-base font-bold">Track Existing Complaint</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

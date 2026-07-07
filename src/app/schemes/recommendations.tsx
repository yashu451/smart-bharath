import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { MOCK_SCHEMES_DB, SchemeItem } from '@/constants/mock-schemes';

export default function RecommendedSchemesScreen() {
  const router = useRouter();

  const handleViewDetails = (schemeId: string) => {
    router.push({
      pathname: '/schemes/details',
      params: { id: schemeId }
    } as any);
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
        <Text className="text-lg font-bold text-slate-800">Smart Bharat</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
        
        {/* Title Details */}
        <View className="mb-6">
          <Text className="text-2xl font-extrabold text-bharat-dark">Recommended Schemes</Text>
          <Text className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">
            Personalized government programs matched by AI
          </Text>
        </View>

        {/* List of Matched Scheme Cards */}
        <View className="space-y-4">
          {MOCK_SCHEMES_DB.map((scheme: SchemeItem) => (
            <View
              key={scheme.id}
              style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}
              className="bg-white border border-slate-100 rounded-2xl p-5"
            >
              {/* Card top details */}
              <View className="flex-row justify-between items-start">
                <View className="flex-1 pr-4">
                  <View className="bg-slate-100 px-2.5 py-0.5 rounded self-start mb-2">
                    <Text className="text-[8px] font-extrabold text-slate-500 uppercase tracking-wide">
                      {scheme.category}
                    </Text>
                  </View>
                  <Text className="text-base font-bold text-slate-800 leading-snug">
                    {scheme.name}
                  </Text>
                  <Text className="text-[9px] font-semibold text-slate-450 uppercase tracking-tight mt-1">
                    {scheme.authority}
                  </Text>
                </View>
                
                {/* Eligibility Status badge */}
                <View className={`px-2.5 py-1 rounded-full border ${
                  scheme.status === 'Eligible' 
                    ? 'bg-emerald-50 border-emerald-200/50' 
                    : 'bg-amber-50 border-amber-200/50'
                }`}>
                  <Text className={`text-[9px] font-extrabold ${
                    scheme.status === 'Eligible' ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {scheme.status}
                  </Text>
                </View>
              </View>

              {/* Description body */}
              <Text className="text-[11px] text-slate-550 leading-normal mt-3 font-medium">
                {scheme.description}
              </Text>

              {/* Benefits highlight */}
              <View className="bg-slate-50/70 border border-slate-100 p-3.5 rounded-xl my-4">
                <Text className="text-[8px] font-bold text-slate-450 uppercase tracking-wider">Estimated Benefits</Text>
                <Text className="text-xs font-extrabold text-bharat-navy/90 mt-0.5">
                  {scheme.benefits}
                </Text>
              </View>

              {/* View Details Action Button */}
              <TouchableOpacity
                onPress={() => handleViewDetails(scheme.id)}
                className="w-full py-2.5 bg-bharat-navy rounded-xl justify-center items-center"
              >
                <Text className="text-white text-xs font-bold">View Details</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Disclaimer/Beta Notice */}
        <View className="bg-white border border-slate-200/80 p-4 rounded-xl items-center mt-6">
          <Text className="text-[9px] text-slate-400 font-semibold text-center leading-normal">
            Beta Note: Live linkages to State and Union Ministry portals will load active applications in final production releases.
          </Text>
        </View>

        {/* Dashboard return shortcut */}
        <TouchableOpacity
          onPress={() => router.replace('/home')}
          className="mt-6 border border-slate-200 py-3 rounded-xl justify-center items-center bg-white"
        >
          <Text className="text-slate-500 font-bold text-sm">Return to Dashboard</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  const handleLogout = () => {
    // Navigate back to the entry splash screen
    router.replace('/');
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-slate-50">
      <StatusBar barStyle="dark-content" />

      {/* Modern Top Header bar */}
      <View className="bg-white px-6 py-4 flex-row justify-between items-center border-b border-slate-100">
        <View className="flex-row items-center space-x-3">
          {/* Logo Crest */}
          <View className="w-8 h-8 rounded-lg bg-bharat-navy justify-center items-center rotate-45">
            <View className="w-2.5 h-2.5 rounded-full bg-bharat-accent -rotate-45" />
          </View>
          <Text className="text-xl font-extrabold text-bharat-dark ml-2">Smart Bharat</Text>
        </View>
        <View className="bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
          <Text className="text-xs font-bold text-emerald-600">Verified Citizen</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
        
        {/* Welcome Section */}
        <View className="mb-8">
          <Text className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Namaste
          </Text>
          <Text className="text-3xl font-extrabold text-bharat-dark mt-1">
            Rajesh Kumar
          </Text>
          <Text className="text-sm text-slate-500 mt-2 font-medium">
            How can your AI Civic Companion assist you today?
          </Text>
        </View>

        {/* AI Quick Query Card */}
        <View className="bg-gradient-to-r from-bharat-navy to-bharat-dark p-6 rounded-2xl mb-6 bg-bharat-navy shadow-md shadow-bharat-navy/20">
          <View className="flex-row justify-between items-start">
            <View className="flex-1 pr-4">
              <Text className="text-white text-lg font-bold">Smart AI Assistant</Text>
              <Text className="text-slate-300 text-xs mt-1.5 leading-relaxed font-medium">
                Ask about government schemes, calculate taxes, or draft local letters using instant AI guidance.
              </Text>
            </View>
            <View className="bg-white/10 p-2 rounded-xl">
              <Text className="text-lg">🤖</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            onPress={() => router.push('/assistant' as any)}
            className="bg-white mt-5 py-3 rounded-xl justify-center items-center"
          >
            <Text className="text-bharat-navy text-sm font-bold">Ask AI Now</Text>
          </TouchableOpacity>
        </View>

        {/* Core Services Grid */}
        <Text className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
          Core Services
        </Text>
        
        <View className="flex-row flex-wrap justify-between">
          {/* Card 1: DigiLocker */}
          <TouchableOpacity 
            onPress={() => router.push('/digilocker' as any)}
            className="w-[48%] bg-white p-5 rounded-2xl mb-4 border border-slate-100 shadow-sm"
          >
            <Text className="text-2xl mb-2">📁</Text>
            <Text className="text-slate-800 font-bold text-sm">DigiLocker</Text>
            <Text className="text-slate-400 text-[10px] mt-1 font-medium">Access verified government certificates</Text>
          </TouchableOpacity>

          {/* Card 2: Grievance Portal */}
          <TouchableOpacity 
            onPress={() => router.push('/grievances' as any)}
            className="w-[48%] bg-white p-5 rounded-2xl mb-4 border border-slate-100 shadow-sm"
          >
            <Text className="text-2xl mb-2">📢</Text>
            <Text className="text-slate-800 font-bold text-sm">Civic Grievances</Text>
            <Text className="text-slate-400 text-[10px] mt-1 font-medium">Report civic issues and monitor fixes</Text>
          </TouchableOpacity>

          {/* Card 3: Welfare Schemes */}
          <TouchableOpacity 
            onPress={() => router.push('/schemes/questionnaire' as any)}
            className="w-[48%] bg-white p-5 rounded-2xl mb-4 border border-slate-100 shadow-sm"
          >
            <Text className="text-2xl mb-2">🌾</Text>
            <Text className="text-slate-800 font-bold text-sm">Scheme Finder</Text>
            <Text className="text-slate-400 text-[10px] mt-1 font-medium">Find personalized welfare schemes</Text>
          </TouchableOpacity>

          {/* Card 4: Appointments */}
          <TouchableOpacity 
            onPress={() => router.push('/appointments/select-department' as any)}
            className="w-[48%] bg-white p-5 rounded-2xl mb-4 border border-slate-100 shadow-sm"
          >
            <Text className="text-2xl mb-2">📅</Text>
            <Text className="text-slate-800 font-bold text-sm">Office Visits</Text>
            <Text className="text-slate-400 text-[10px] mt-1 font-medium">Book appointments at local offices</Text>
          </TouchableOpacity>
        </View>

        {/* Info Banner */}
        <View className="bg-white p-4 rounded-xl border border-slate-200/80 mt-2 flex-row items-center space-x-3">
          <Text className="text-lg">💡</Text>
          <Text className="text-slate-500 text-xs font-semibold flex-1 leading-normal ml-2">
            Tip: You can now link your Aadhaar directly via Face Auth inside settings.
          </Text>
        </View>

        {/* Logout Section */}
        <TouchableOpacity
          onPress={handleLogout}
          className="mt-8 border border-red-200 py-3 rounded-xl justify-center items-center bg-red-50/50"
        >
          <Text className="text-red-500 font-bold text-sm">Logout / Reset Splash Screen</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

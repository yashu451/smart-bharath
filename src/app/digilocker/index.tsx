import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function DigiLockerHomeScreen() {
  const router = useRouter();

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
        <Text className="text-lg font-bold text-slate-800">Smart Bharat</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 40, justifyContent: 'space-between' }}>
        
        {/* Core Info Section */}
        <View className="items-center mt-6">
          
          {/* DigiLocker Abstract Secure Logo */}
          <View className="w-24 h-24 bg-blue-50 border border-blue-100 rounded-3xl justify-center items-center mb-6 shadow-sm relative">
            <Text className="text-5xl">📁</Text>
            {/* Overlay Lock badge */}
            <View 
              style={{ shadowColor: '#000080', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 }}
              className="absolute -bottom-2 -right-2 w-9 h-9 bg-bharat-navy rounded-full justify-center items-center"
            >
              <Text className="text-white text-base">🔒</Text>
            </View>
          </View>

          {/* Title & Branding */}
          <Text className="text-3xl font-extrabold text-bharat-dark tracking-tight">
            DigiLocker
          </Text>
          <Text className="text-xs font-semibold text-slate-400 mt-1.5 uppercase tracking-widest text-center">
            Secure Digital Document Wallet
          </Text>

          {/* Description Card */}
          <View className="bg-slate-50 border border-slate-150 p-6 rounded-2xl mt-8">
            <Text className="text-slate-600 text-sm font-medium leading-relaxed text-center">
              DigiLocker is a secure document wallet integrated with India's national digital locker system.
            </Text>
            <View className="h-px bg-slate-200/80 my-4" />
            <Text className="text-slate-500 text-xs font-medium leading-relaxed">
              • Access official documents like Aadhaar Card, PAN Card, Driving Licence, and academic certificates directly from verified issuers.
            </Text>
            <Text className="text-slate-500 text-xs font-medium leading-relaxed mt-2.5">
              • Verified credentials can be shared instantly and securely with public departments and authenticated services.
            </Text>
          </View>
        </View>

        {/* Action Button Area */}
        <View className="mt-12 space-y-4">
          <TouchableOpacity
            onPress={() => router.push('/digilocker/verify' as any)}
            style={{ shadowColor: '#4A90E2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 }}
            className="w-full py-4 bg-bharat-accent rounded-xl justify-center items-center"
          >
            <Text className="text-white text-base font-bold">Get Started</Text>
          </TouchableOpacity>

          <Text className="text-center text-[10px] text-slate-400 font-semibold px-4">
            Authorized by Ministry of Electronics & IT (MeitY), Government of India
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

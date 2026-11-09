import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';

export default function VerifyIdentityScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#E6F0E8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#E6F0E8" />

      {/* Header bar */}
      <View className="px-6 py-4 flex-row items-center border-b border-[#CADDCB] bg-[#EDF5EE]">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-11 h-11 rounded-2xl bg-[#E0EDE1] border border-[#CADDCB] justify-center items-center mr-3.5 shadow-xs"
          activeOpacity={0.7}
        >
          <Text className="text-[#14532D] font-black text-lg">←</Text>
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-base font-black text-[#14532D]">DigiLocker Integration</Text>
          <Text className="text-[10px] font-bold text-[#4B6350] uppercase tracking-widest mt-0.5">
            National Gateway Status
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          padding: 24,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            shadowColor: '#14532D',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.05,
            shadowRadius: 16,
            elevation: 3,
          }}
          className="w-full max-w-md bg-[#F3F8F4] border border-[#CADDCB] rounded-3xl p-8 items-center"
        >
          <View className="w-16 h-16 bg-[#FFFBEB] border border-[#FDE68A] rounded-3xl justify-center items-center mb-5">
            <Text className="text-3xl">🏛️</Text>
          </View>

          <View className="bg-[#FFFBEB] border border-[#FDE68A] px-3.5 py-1 rounded-full mb-3">
            <Text className="text-[9px] font-black text-amber-900 uppercase tracking-widest">
              Coming Soon – Official Integration Required
            </Text>
          </View>

          <Text className="text-2xl font-black text-[#14532D] text-center tracking-tight mb-2">
            Government Repo Integration
          </Text>

          <Text className="text-slate-600 text-xs font-medium text-center leading-relaxed mb-6">
            Smart Bharat is integrating with the official National DigiLocker API ecosystem. Direct e-KYC certificate fetching from government databases will be activated upon formal production authorization from the Ministry of Electronics & IT (MeitY).
          </Text>

          <View className="w-full bg-[#EDF5EE] border border-[#CADDCB] p-4 rounded-2xl mb-6">
            <Text className="text-xs font-black text-[#14532D] mb-1">
              What you can do right now:
            </Text>
            <Text className="text-[11px] text-slate-600 leading-relaxed font-medium">
              You can upload, preview, and organize your personal identity proofs, academic credentials, and receipts directly from your device using your private Document Wallet.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.replace('/digilocker/documents' as any)}
            activeOpacity={0.85}
            className="w-full py-4 bg-[#14532D] rounded-2xl justify-center items-center shadow-xs mb-3"
          >
            <Text className="text-white text-xs font-black uppercase tracking-wider">
              Open My Document Wallet →
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace('/home')}
            activeOpacity={0.7}
            className="w-full py-3 rounded-2xl justify-center items-center"
          >
            <Text className="text-[#4B6350] text-xs font-bold">Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

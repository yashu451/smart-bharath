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
        <View className="max-w-xl w-full mx-auto flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-12 h-12 rounded-2xl bg-[#E0EDE1] border border-[#CADDCB] justify-center items-center mr-4 shadow-xs"
            activeOpacity={0.7}
          >
            <Text className="text-[#14532D] font-black text-xl">←</Text>
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-black text-[#14532D]">DigiLocker Integration</Text>
            <Text className="text-xs font-bold text-[#4B6350] uppercase tracking-widest mt-0.5">
              National Gateway Status
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          padding: 24,
          paddingBottom: 130,
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
          className="w-full max-w-xl bg-[#F3F8F4] border border-[#CADDCB] rounded-3xl p-9 items-center"
        >
          <View className="w-20 h-20 bg-[#FFFBEB] border border-[#FDE68A] rounded-3xl justify-center items-center mb-6">
            <Text className="text-4xl">🏛️</Text>
          </View>

          <View className="bg-[#FFFBEB] border border-[#FDE68A] px-4 py-1.5 rounded-full mb-3.5">
            <Text className="text-xs font-black text-amber-900 uppercase tracking-widest">
              Coming Soon – Official Integration Required
            </Text>
          </View>

          <Text className="text-3xl font-black text-[#14532D] text-center tracking-tight mb-2.5">
            Government Repo Integration
          </Text>

          <Text className="text-slate-700 text-sm font-medium text-center leading-relaxed mb-7">
            Smart Bharat is integrating with the official National DigiLocker API ecosystem. Direct e-KYC certificate fetching from government databases will be activated upon formal production authorization from the Ministry of Electronics & IT (MeitY).
          </Text>

          <View className="w-full bg-[#EDF5EE] border border-[#CADDCB] p-5 rounded-2xl mb-7">
            <Text className="text-sm font-black text-[#14532D] mb-1.5">
              What you can do right now:
            </Text>
            <Text className="text-xs text-slate-700 leading-relaxed font-medium">
              You can upload, preview, and organize your personal identity proofs, academic credentials, and receipts directly from your device using your private Document Wallet.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.replace('/digilocker/documents' as any)}
            activeOpacity={0.85}
            className="w-full py-4.5 bg-[#14532D] rounded-2xl justify-center items-center shadow-xs mb-3.5"
          >
            <Text className="text-white text-base font-black uppercase tracking-wider">
              Open My Document Wallet →
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace('/home')}
            activeOpacity={0.7}
            className="w-full py-3.5 rounded-2xl justify-center items-center"
          >
            <Text className="text-[#4B6350] text-sm font-black">Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

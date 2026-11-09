import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';

export default function DigiLockerHomeScreen() {
  const router = useRouter();

  const handleFetchFromDigiLocker = () => {
    Alert.alert(
      'Coming Soon – Official Integration Required',
      'Direct fetching from government repositories (UIDAI, CBSE, Income Tax) requires official MeitY production API onboarding.\n\nIn the meantime, you can upload, store, and manage your personal documents securely in your Document Wallet.',
      [
        { text: 'Go to Wallet', onPress: () => router.push('/digilocker/documents' as any) },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#E6F0E8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#E6F0E8" />

      {/* Header Bar */}
      <View className="px-6 py-4 flex-row items-center border-b border-[#CADDCB] bg-[#EDF5EE]">
        <TouchableOpacity
          onPress={() => router.replace('/home')}
          className="w-11 h-11 rounded-2xl bg-[#E0EDE1] border border-[#CADDCB] justify-center items-center mr-3.5 shadow-xs"
          activeOpacity={0.7}
        >
          <Text className="text-[#14532D] font-black text-lg">←</Text>
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-base font-black text-[#14532D]">DigiLocker Wallet</Text>
          <Text className="text-[10px] font-bold text-[#4B6350] uppercase tracking-widest mt-0.5">
            Personal Document Storage
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingVertical: 32,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Core Info Section */}
        <View className="w-full max-w-md items-center">
          {/* DigiLocker Icon Badge in Lavender / Forest Green */}
          <View className="w-20 h-20 bg-[#EEF2FF] border border-[#C7D2FE] rounded-3xl justify-center items-center mb-5 shadow-xs relative">
            <Text className="text-4xl">📁</Text>
            <View className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-[#14532D] rounded-full justify-center items-center border-2 border-white">
              <Text className="text-white text-xs">🔒</Text>
            </View>
          </View>

          {/* Title & Branding */}
          <Text className="text-2xl font-black text-[#14532D] tracking-tight text-center">
            Personal Document Wallet
          </Text>
          <Text className="text-xs font-semibold text-slate-500 mt-1 text-center">
            Secure Private Storage for Citizen Certificates & IDs
          </Text>

          {/* Description Card */}
          <View
            style={{
              shadowColor: '#14532D',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 10,
              elevation: 2,
            }}
            className="w-full bg-[#F3F8F4] border border-[#CADDCB] p-6 rounded-3xl mt-6"
          >
            <View className="flex-row items-center mb-3">
              <View className="w-2 h-2 rounded-full bg-[#6366F1] mr-2" />
              <Text className="text-xs font-black text-[#14532D] uppercase tracking-wider">
                Private Cloud Vault
              </Text>
            </View>
            <Text className="text-slate-600 text-xs font-medium leading-relaxed">
              Store, view, and organize your personal identity proofs, educational marksheet credentials, and utility certificates securely under your account.
            </Text>
            <View className="h-px bg-[#CADDCB] my-3.5" />
            <Text className="text-slate-600 text-xs font-medium leading-relaxed">
              • Upload PDF, JPG, and PNG documents from your device anytime.
            </Text>
            <Text className="text-slate-600 text-xs font-medium leading-relaxed mt-2">
              • Zero public URLs — files are strictly private to your authenticated account.
            </Text>
          </View>

          {/* Integration Status Notice */}
          <View className="w-full bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-4 mt-4">
            <View className="flex-row items-center mb-1.5">
              <Text className="text-base mr-2">🏛️</Text>
              <Text className="text-xs font-bold text-amber-900">
                Official DigiLocker Sync Status
              </Text>
            </View>
            <Text className="text-[11px] text-amber-800 leading-relaxed font-medium">
              Direct fetching from government issuing authorities is <Text className="font-bold">Coming Soon – Official Integration Required</Text>. Production API onboarding with MeitY is underway.
            </Text>
          </View>
        </View>

        {/* Action Buttons Area */}
        <View className="w-full max-w-md mt-6 space-y-3">
          <TouchableOpacity
            onPress={() => router.push('/digilocker/documents' as any)}
            activeOpacity={0.85}
            className="w-full py-4 bg-[#14532D] rounded-2xl justify-center items-center shadow-xs"
          >
            <Text className="text-white text-xs font-black uppercase tracking-wider">
              Open My Document Wallet →
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleFetchFromDigiLocker}
            activeOpacity={0.7}
            className="w-full py-3.5 border border-[#CADDCB] bg-[#EDF5EE] rounded-2xl justify-center items-center shadow-xs"
          >
            <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider">
              Fetch from DigiLocker (Coming Soon)
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

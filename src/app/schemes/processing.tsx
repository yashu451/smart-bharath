import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { storage } from '@/services/storage';

const STEPS = [
  'Analyzing citizen profile parameters',
  'Querying Central Government Schemes',
  'Evaluating State Welfare Guidelines',
  'Matching Direct Benefit Criteria',
  'Preparing Personalized Recommendations',
];

export default function AIProcessingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    // Persist profile to storage for session resilience
    if (params && Object.keys(params).length > 0) {
      try {
        storage.setItem('smart_bharat_scheme_profile', JSON.stringify(params));
      } catch (e) {
        console.warn('Could not persist scheme profile to storage:', e);
      }
    }

    const timers = [
      setTimeout(() => setCurrentStep(2), 600),
      setTimeout(() => setCurrentStep(3), 1200),
      setTimeout(() => setCurrentStep(4), 1800),
      setTimeout(() => setCurrentStep(5), 2400),
      setTimeout(() => setCurrentStep(6), 3000),
      setTimeout(() => {
        router.replace({
          pathname: '/schemes/recommendations',
          params: params as any,
        } as any);
      }, 3400),
    ];

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [params, router]);

  const getStepStatus = (index: number) => {
    const stepNumber = index + 1;
    if (currentStep > stepNumber) return 'completed';
    if (currentStep === stepNumber) return 'active';
    return 'pending';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#E6F0E8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#E6F0E8" />

      {/* Header bar */}
      <View className="px-6 py-4 flex-row items-center border-b border-[#CADDCB] bg-[#EDF5EE]">
        <View className="max-w-xl w-full mx-auto flex-1">
          <Text className="text-xl font-black text-[#14532D]">AI Eligibility Engine</Text>
          <Text className="text-xs font-bold text-[#4B6350] uppercase tracking-widest mt-0.5">
            Smart Bharat National Database Match
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 24,
          paddingBottom: 130,
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Core Loading Section */}
        <View className="items-center mb-8 max-w-lg">
          <View className="w-20 h-20 bg-[#ECFDF5] border border-[#A7F3D0] rounded-3xl justify-center items-center mb-5">
            <ActivityIndicator size="small" color="#14532D" />
          </View>
          <Text className="text-2xl font-black text-[#14532D] text-center tracking-tight leading-snug">
            Matching the Best Schemes for Your Profile...
          </Text>
          <Text className="text-sm font-semibold text-slate-600 mt-2 text-center">
            Cross-referencing 1,400+ Central and State welfare initiatives
          </Text>
        </View>

        {/* Vertical Steps Checklist */}
        <View
          style={{
            shadowColor: '#14532D',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.04,
            shadowRadius: 10,
            elevation: 2,
          }}
          className="bg-[#F3F8F4] border border-[#CADDCB] rounded-3xl p-7 space-y-4 max-w-lg w-full"
        >
          {STEPS.map((stepText, idx) => {
            const status = getStepStatus(idx);
            return (
              <View key={idx} className="flex-row items-center space-x-3 py-1">
                {status === 'completed' ? (
                  <View className="w-7 h-7 rounded-full bg-[#ECFDF5] border border-[#10B981] justify-center items-center mr-3.5">
                    <Text className="text-[#10B981] text-sm font-black">✓</Text>
                  </View>
                ) : status === 'active' ? (
                  <View className="w-7 h-7 rounded-full bg-[#FAF9F6] border border-[#14532D] justify-center items-center mr-3.5">
                    <ActivityIndicator size="small" color="#14532D" />
                  </View>
                ) : (
                  <View className="w-7 h-7 rounded-full bg-[#FAF9F6] border border-[#E2E8F0] justify-center items-center mr-3.5">
                    <View className="w-2 h-2 bg-slate-300 rounded-full" />
                  </View>
                )}

                <Text
                  className={`text-sm flex-1 ${
                    status === 'completed'
                      ? 'text-slate-400 font-semibold'
                      : status === 'active'
                      ? 'text-[#14532D] font-black'
                      : 'text-slate-400 font-medium'
                  }`}
                >
                  {stepText}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Security assurance footer */}
        <Text className="text-center text-xs text-slate-500 font-semibold mt-8">
          🔒 Secure End-to-End Encryption • Zero Third-Party Tracking
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

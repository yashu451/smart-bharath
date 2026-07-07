import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

const STEPS = [
  'Analysing user profile',
  'Checking Central Government Schemes',
  'Checking State Government Schemes',
  'Matching Eligibility',
  'Preparing Recommendations',
];

export default function AIProcessingScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    // Increment steps sequentially to simulate AI processing progress
    const timers = [
      setTimeout(() => setCurrentStep(2), 600),
      setTimeout(() => setCurrentStep(3), 1200),
      setTimeout(() => setCurrentStep(4), 1800),
      setTimeout(() => setCurrentStep(5), 2400),
      setTimeout(() => setCurrentStep(6), 3000),
      // Automatically route to recommendations page at the end of progress
      setTimeout(() => {
        router.replace('/schemes/recommendations' as any);
      }, 3500),
    ];

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, []);

  const getStepStatus = (index: number) => {
    const stepNumber = index + 1;
    if (currentStep > stepNumber) return 'completed';
    if (currentStep === stepNumber) return 'active';
    return 'pending';
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header bar */}
      <View className="px-6 py-4 flex-row items-center border-b border-slate-100 bg-white">
        <Text className="text-lg font-bold text-slate-800">AI Scheme Finder</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 40, flexGrow: 1, justifyContent: 'center' }}>
        
        {/* Core Loading Section */}
        <View className="items-center mb-10">
          <ActivityIndicator size="large" color="#4A90E2" className="mb-6" />
          <Text className="text-2xl font-extrabold text-slate-800 text-center leading-normal">
            Finding the best government schemes for you...
          </Text>
          <Text className="text-xs font-semibold text-slate-400 mt-2 uppercase tracking-widest text-center">
            AI eligibility engine matches your parameters
          </Text>
        </View>

        {/* Vertical Steps Checklist */}
        <View className="bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-4 max-w-sm w-full align-self-center self-center">
          {STEPS.map((stepText, idx) => {
            const status = getStepStatus(idx);
            return (
              <View key={idx} className="flex-row items-center space-x-3.5 py-1">
                {status === 'completed' ? (
                  <View className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-500 justify-center items-center mr-3">
                    <Text className="text-emerald-600 text-xs font-extrabold">✓</Text>
                  </View>
                ) : status === 'active' ? (
                  <View className="w-6 h-6 rounded-full bg-blue-50 border border-bharat-accent justify-center items-center mr-3">
                    <ActivityIndicator size="small" color="#4A90E2" />
                  </View>
                ) : (
                  <View className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200 justify-center items-center mr-3">
                    <View className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                  </View>
                )}
                
                <Text className={`text-sm flex-1 ${
                  status === 'completed'
                    ? 'text-slate-400 font-semibold'
                    : status === 'active'
                      ? 'text-slate-850 font-extrabold'
                      : 'text-slate-300 font-medium'
                }`}>
                  {stepText}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Small security assurance footer */}
        <Text className="text-center text-[10px] text-slate-400 font-semibold mt-10">
          Secure AI evaluation • Data processed locally
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

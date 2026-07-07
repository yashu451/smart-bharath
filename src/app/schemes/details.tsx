import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, StatusBar, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MOCK_SCHEMES_DB, SchemeItem } from '@/constants/mock-schemes';

export default function SchemeDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Find document based on route ID parameter, fallback to PM Scholarship
  const scheme: SchemeItem = MOCK_SCHEMES_DB.find((s) => s.id === id) || MOCK_SCHEMES_DB[0];

  // Button interaction states
  const [isApplying, setIsApplying] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleApply = () => {
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      Alert.alert(
        'Application Started',
        `Linked e-KYC credentials. Redirecting to secure portal for final signature.`,
        [{ text: 'OK' }]
      );
    }, 1200);
  };

  const handleShare = () => {
    Alert.alert(
      'Share Scheme',
      `Direct sharing link generated:\nhttps://smartbharat.gov.in/schemes/${scheme.id}`,
      [{ text: 'OK' }]
    );
  };

  const handleSaveToggle = () => {
    setIsSaved(!isSaved);
    // Display brief feedback alert
    Alert.alert(
      isSaved ? 'Scheme Removed' : 'Scheme Saved',
      isSaved ? 'Removed from your saved schemes.' : 'Saved to your profile. Access it anytime from your dashboard.',
      [{ text: 'OK' }]
    );
  };

  const handleVisitWebsite = () => {
    Alert.alert(
      'Redirecting to Portal',
      `You are navigating to the official website:\n${scheme.officialWebsite}\n\n(Smart Bharat secures this connection)`,
      [{ text: 'Open Portal' }, { text: 'Cancel', style: 'cancel' }]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header bar */}
      <View className="px-6 py-4 flex-row justify-between items-center border-b border-slate-100 bg-white">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/60 justify-center items-center mr-3"
          >
            <Text className="text-slate-700 font-bold text-lg">←</Text>
          </TouchableOpacity>
          <Text className="text-lg font-bold text-slate-800">Smart Bharat</Text>
        </View>
        
        {/* Header Save Button */}
        <TouchableOpacity
          onPress={handleSaveToggle}
          className={`w-10 h-10 rounded-full border ${
            isSaved ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200/60'
          } justify-center items-center`}
        >
          <Text className="text-lg">{isSaved ? '★' : '☆'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 50 }}>
        
        {/* Scheme Hero Header Card */}
        <View 
          style={{ 
            backgroundColor: scheme.color, 
            shadowColor: scheme.color,
            shadowOffset: { width: 0, height: 4 }, 
            shadowOpacity: 0.15, 
            shadowRadius: 6, 
            elevation: 4,
            borderRadius: 20
          }}
          className="w-full p-6 mb-6"
        >
          <View className="bg-white/20 px-2.5 py-0.5 rounded self-start mb-3">
            <Text className="text-[9px] font-extrabold text-white uppercase tracking-wider">
              {scheme.category}
            </Text>
          </View>
          
          <Text className="text-xl font-bold text-white leading-snug">
            {scheme.name}
          </Text>
          <Text className="text-[9px] font-semibold text-white/70 uppercase mt-1 leading-normal">
            {scheme.authority}
          </Text>

          {/* Benefits Panel */}
          <View className="bg-white/10 border border-white/20 rounded-xl p-4 mt-5">
            <Text className="text-[8px] font-bold text-white/60 uppercase tracking-widest">
              Estimated Benefits
            </Text>
            <Text className="text-base font-extrabold text-white mt-1">
              {scheme.benefits}
            </Text>
          </View>
        </View>

        {/* Important Dates Banner */}
        {scheme.importantDates ? (
          <View className="bg-amber-50 border border-amber-200/50 rounded-2xl p-4 mb-6 flex-row items-center">
            <Text className="text-lg mr-3">📅</Text>
            <View className="flex-1">
              <Text className="text-[9px] font-extrabold text-amber-500 uppercase tracking-wider">Timeline</Text>
              <Text className="text-xs font-bold text-amber-700 mt-0.5">{scheme.importantDates}</Text>
            </View>
          </View>
        ) : null}

        {/* 1. Description */}
        <View className="mb-6">
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            Description
          </Text>
          <Text className="text-xs text-slate-650 leading-relaxed font-medium">
            {scheme.description} This national initiative forms a key part of public support services, facilitating easy financial transfers and targeted resources to eligible citizens directly.
          </Text>
        </View>

        {/* 2. Eligibility Criteria */}
        <View className="mb-6">
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Eligibility Criteria
          </Text>
          <View className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 space-y-2.5">
            {scheme.eligibilityCriteria.map((crit, idx) => (
              <View key={idx} className="flex-row items-start space-x-2">
                <Text className="text-bharat-accent text-xs font-bold mt-0.5">•</Text>
                <Text className="text-xs text-slate-700 font-semibold leading-normal flex-1">
                  {crit}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 3. Required Documents */}
        <View className="mb-6">
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Required Documents
          </Text>
          <View className="border border-slate-200 rounded-2xl p-5 space-y-3.5">
            {scheme.requiredDocuments.map((docName, idx) => (
              <View key={idx} className="flex-row items-center justify-between">
                <Text className="text-xs text-slate-700 font-semibold leading-normal flex-1 mr-4">
                  {docName}
                </Text>
                {/* Simulated check badge */}
                {docName.includes('DigiLocker') ? (
                  <Text className="text-[10px] font-bold text-emerald-600">✓ Linked</Text>
                ) : (
                  <Text className="text-[10px] font-bold text-slate-400">Upload</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* 4. Application Process */}
        <View className="mb-8">
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Application Process
          </Text>
          <View className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 space-y-3">
            {scheme.applicationProcess.map((stepMsg, idx) => (
              <Text key={idx} className="text-xs text-slate-650 leading-relaxed font-semibold">
                {stepMsg}
              </Text>
            ))}
          </View>
        </View>

        {/* 5. Utility & Action Buttons Section */}
        <View className="space-y-4 pt-4 border-t border-slate-100">
          
          {/* Main Apply Button */}
          <TouchableOpacity
            onPress={handleApply}
            disabled={isApplying}
            style={{ shadowColor: '#4A90E2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 }}
            className="w-full py-4 bg-bharat-accent rounded-xl justify-center items-center"
          >
            <Text className="text-white text-base font-bold">
              {isApplying ? 'Processing Application...' : 'Apply Now'}
            </Text>
          </TouchableOpacity>

          {/* Secondary Buttons Row */}
          <View className="flex-row justify-between">
            {/* Official Website */}
            <TouchableOpacity
              onPress={handleVisitWebsite}
              className="w-[48%] py-3.5 border border-slate-250 bg-white rounded-xl justify-center items-center"
            >
              <Text className="text-slate-750 text-xs font-bold">Official Website</Text>
            </TouchableOpacity>

            {/* Share */}
            <TouchableOpacity
              onPress={handleShare}
              className="w-[48%] py-3.5 border border-slate-250 bg-white rounded-xl justify-center items-center"
            >
              <Text className="text-slate-750 text-xs font-bold">Share Scheme</Text>
            </TouchableOpacity>
          </View>

          {/* Inline Save button inside sheet */}
          <TouchableOpacity
            onPress={handleSaveToggle}
            className={`w-full py-3.5 border rounded-xl justify-center items-center ${
              isSaved ? 'bg-amber-50 border-amber-250' : 'bg-white border-slate-250'
            }`}
          >
            <Text className={`text-xs font-bold ${isSaved ? 'text-amber-600' : 'text-slate-600'}`}>
              {isSaved ? '★ Saved to Profile' : '☆ Save Scheme'}
            </Text>
          </TouchableOpacity>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

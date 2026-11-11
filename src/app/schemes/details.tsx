import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MOCK_SCHEMES_DB, SchemeItem } from '@/constants/mock-schemes';
import { dashboardApi, schemeApi } from '@/services/api';

export default function SchemeDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Find document based on route ID parameter, fallback to PM Scholarship
  const scheme: SchemeItem = MOCK_SCHEMES_DB.find((s) => s.id === id) || MOCK_SCHEMES_DB[0];

  // Button interaction states
  const [isSaved, setIsSaved] = useState(false);

  // Check persisted saved state on mount from MongoDB backend
  useEffect(() => {
    let isMounted = true;
    if (scheme && scheme.id) {
      schemeApi
        .checkIsSaved(scheme.id)
        .then((res) => {
          if (isMounted && res && res.success) {
            setIsSaved(!!res.isSaved);
          }
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [scheme?.id]);

  // Helper to open external official government URLs in browser
  const openExternalUrl = async (url: string) => {
    if (!url) return;
    try {
      if (Platform.OS === 'web') {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          await Linking.openURL(url);
        }
      }
    } catch (err) {
      console.warn('Failed to open external url:', err);
      try {
        await Linking.openURL(url);
      } catch {
        Alert.alert('Portal Link', `Official portal URL:\n${url}`);
      }
    }
  };

  const handleApply = async () => {
    if (!scheme.hasOnlineApplication || !scheme.applicationUrl) {
      Alert.alert(
        'Online Application Link Unavailable',
        scheme.applicationNotice ||
          'This scheme currently does not have an online application portal. Please visit the designated branch or government office to apply in person.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      await schemeApi.recordApplication({
        schemeId: scheme.id,
        name: scheme.name,
        category: scheme.category,
        applicationUrl: scheme.applicationUrl,
      });
    } catch (err: any) {
      console.warn('Could not record scheme activity:', err.message);
    }

    // Opens the scheme's verified official application portal in the external browser
    openExternalUrl(scheme.applicationUrl);
  };

  const handleShare = () => {
    Alert.alert(
      'Share Scheme',
      `Official portal link for ${scheme.name}:\n${scheme.applicationUrl || scheme.officialWebsite}`,
      [{ text: 'OK' }]
    );
  };

  const handleSaveToggle = async () => {
    const nextState = !isSaved;
    setIsSaved(nextState);
    try {
      if (nextState) {
        await schemeApi.saveScheme({
          schemeId: scheme.id,
          name: scheme.name,
          category: scheme.category,
          description: scheme.description,
          applicationUrl: scheme.applicationUrl || undefined,
          officialWebsite: scheme.officialWebsite,
          benefits: scheme.benefits,
          eligibility: Array.isArray(scheme.eligibilityCriteria) ? scheme.eligibilityCriteria.join(', ') : '',
          hasOnlineApplication: scheme.hasOnlineApplication,
        });
        Alert.alert('Scheme Saved', 'Saved to your profile and centralized activity history. Access it anytime.');
      } else {
        await schemeApi.removeSavedScheme(scheme.id);
        Alert.alert('Scheme Removed', 'Removed from your saved schemes.');
      }
    } catch (err: any) {
      console.warn('Could not update saved scheme in database:', err.message);
    }
  };

  const handleVisitWebsite = () => {
    if (scheme.officialWebsite) {
      openExternalUrl(scheme.officialWebsite);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#E6F0E8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#E6F0E8" />

      {/* Header bar */}
      <View className="px-6 py-4 border-b border-[#CADDCB] bg-[#EDF5EE]">
        <View className="max-w-4xl w-full mx-auto flex-row justify-between items-center">
          <View className="flex-row items-center flex-1 mr-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-11 h-11 rounded-2xl bg-[#E0EDE1] border border-[#CADDCB] justify-center items-center mr-3.5 shadow-xs"
              activeOpacity={0.7}
            >
              <Text className="text-[#14532D] font-black text-lg">←</Text>
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-xl font-black text-[#14532D]" numberOfLines={1}>
                {scheme.name}
              </Text>
              <Text className="text-xs font-bold text-[#4B6350] tracking-wider mt-0.5">
                Scheme Details & Application
              </Text>
            </View>
          </View>

          {/* Header Save Button */}
          <TouchableOpacity
            onPress={handleSaveToggle}
            className={`w-11 h-11 rounded-2xl border ${
              isSaved ? 'bg-amber-50 border-amber-300' : 'bg-[#EDF5EE] border-[#CADDCB] shadow-xs'
            } justify-center items-center`}
            activeOpacity={0.7}
          >
            <Text className="text-lg">{isSaved ? '★' : '☆'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 130 }}>
        <View className="max-w-4xl w-full mx-auto">
          {/* Scheme Hero Header Card in Forest Green Gradient */}
          <View
            style={{
              backgroundColor: '#14532D',
              shadowColor: '#14532D',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.12,
              shadowRadius: 16,
              elevation: 3,
              borderRadius: 28,
            }}
            className="w-full p-6 mb-5"
          >
            <View className="bg-white/20 px-3.5 py-1 rounded-xl self-start mb-3">
              <Text className="text-xs font-black text-white uppercase tracking-wider">
                {scheme.category}
              </Text>
            </View>

            <Text className="text-2xl font-black text-white leading-snug">
              {scheme.name}
            </Text>
            <Text className="text-xs font-bold text-white/80 uppercase mt-1 leading-normal">
              {scheme.authority}
            </Text>

            {/* Benefits Panel */}
            <View className="bg-white/15 border border-white/25 rounded-2xl p-4.5 mt-4">
              <Text className="text-xs font-black text-white/70 uppercase tracking-widest">
                Direct Benefit & Financial Subsidy
              </Text>
              <Text className="text-lg font-black text-white mt-1">
                {scheme.benefits}
              </Text>
            </View>
          </View>

          {/* Official Application Portal Verification Card */}
          {scheme.hasOnlineApplication && scheme.applicationUrl ? (
            <View className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl p-4.5 mb-5 flex-row items-center justify-between">
              <View className="flex-row items-center flex-1 mr-3">
                <Text className="text-2xl mr-3">🌐</Text>
                <View className="flex-1">
                  <Text className="text-xs font-black text-[#14532D] uppercase tracking-wider">
                    Verified Government Application Portal 🇮🇳
                  </Text>
                  <Text className="text-sm font-bold text-slate-800 mt-1" numberOfLines={1}>
                    {scheme.applicationUrl}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleApply}
                className="bg-[#14532D] px-4 py-2 rounded-xl"
                activeOpacity={0.8}
              >
                <Text className="text-white text-xs font-black">Open ↗</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Important Dates Banner */}
          {scheme.importantDates ? (
            <View className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-4.5 mb-5 flex-row items-center">
              <Text className="text-2xl mr-3">📅</Text>
              <View className="flex-1">
                <Text className="text-xs font-black text-amber-800 uppercase tracking-wider">Timeline</Text>
                <Text className="text-sm font-bold text-amber-900 mt-0.5">{scheme.importantDates}</Text>
              </View>
            </View>
          ) : null}

          {/* 1. Description */}
          <View
            style={{
              shadowColor: '#14532D',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 10,
              elevation: 2,
            }}
            className="bg-[#F3F8F4] border border-[#CADDCB] rounded-3xl p-6 mb-5"
          >
            <Text className="text-base font-black text-[#14532D] uppercase tracking-wider mb-2.5">
              Overview & Description
            </Text>
            <Text className="text-sm text-slate-600 leading-relaxed font-medium">
              {scheme.description}
            </Text>
          </View>

          {/* 2. Eligibility Criteria */}
          <View
            style={{
              shadowColor: '#14532D',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 10,
              elevation: 2,
            }}
            className="bg-[#F3F8F4] border border-[#CADDCB] rounded-3xl p-6 mb-5"
          >
            <Text className="text-base font-black text-[#14532D] uppercase tracking-wider mb-3">
              Eligibility Criteria
            </Text>
            <View className="space-y-2.5">
              {scheme.eligibilityCriteria.map((crit, idx) => (
                <View key={idx} className="flex-row items-start space-x-2 py-1">
                  <Text className="text-[#10B981] text-sm font-black mr-2">•</Text>
                  <Text className="text-sm text-slate-700 font-semibold leading-normal flex-1">
                    {crit}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* 3. Required Documents */}
          <View
            style={{
              shadowColor: '#14532D',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 10,
              elevation: 2,
            }}
            className="bg-[#F3F8F4] border border-[#CADDCB] rounded-3xl p-6 mb-5"
          >
            <Text className="text-base font-black text-[#14532D] uppercase tracking-wider mb-3">
              Required Documents
            </Text>
            <View className="space-y-3">
              {scheme.requiredDocuments.map((docName, idx) => (
                <View key={idx} className="flex-row items-center justify-between py-2 border-b border-[#CADDCB] last:border-b-0">
                  <Text className="text-sm text-slate-700 font-semibold leading-normal flex-1 mr-4">
                    {docName}
                  </Text>
                  {docName.includes('DigiLocker') ? (
                    <View className="bg-[#ECFDF5] px-3 py-1 rounded-full border border-[#A7F3D0]">
                      <Text className="text-xs font-black text-[#10B981]">✓ DigiLocker Linked</Text>
                    </View>
                  ) : (
                    <Text className="text-xs font-bold text-slate-400">Required</Text>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* 4. Application Process */}
          <View
            style={{
              shadowColor: '#14532D',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 10,
              elevation: 2,
            }}
            className="bg-[#F3F8F4] border border-[#CADDCB] rounded-3xl p-6 mb-6"
          >
            <Text className="text-base font-black text-[#14532D] uppercase tracking-wider mb-3">
              Official Application Guidelines
            </Text>
            <View className="space-y-2.5">
              {scheme.applicationProcess.map((stepMsg, idx) => (
                <Text key={idx} className="text-sm text-slate-600 leading-relaxed font-medium">
                  {stepMsg}
                </Text>
              ))}
            </View>
          </View>

          {/* 5. Utility & Action Buttons Section */}
          <View className="space-y-3.5 pt-2">
            {scheme.hasOnlineApplication && scheme.applicationUrl ? (
              /* Active Apply Now Button */
              <View>
                <TouchableOpacity
                  onPress={handleApply}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: '#14532D',
                    shadowColor: '#14532D',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 10,
                    elevation: 3,
                  }}
                  className="w-full py-4.5 rounded-2xl justify-center items-center flex-row"
                >
                  <Text className="text-white text-base font-black uppercase tracking-wider mr-2">
                    Apply Now on Official Portal
                  </Text>
                  <Text className="text-white text-lg font-black">↗</Text>
                </TouchableOpacity>
                <View className="flex-row items-center justify-center mt-2.5">
                  <Text className="text-xs font-semibold text-slate-500">
                    Opens official portal:{' '}
                    <Text className="font-bold text-[#14532D]">
                      {scheme.applicationUrl.replace('https://', '').split('/')[0]}
                    </Text>{' '}
                    🇮🇳
                  </Text>
                </View>
              </View>
            ) : (
              /* Online Application Unavailable State */
              <View className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <View className="flex-row items-center mb-2">
                  <View className="w-6 h-6 rounded-full bg-amber-200 justify-center items-center mr-2">
                    <Text className="text-amber-900 text-xs font-black">ℹ</Text>
                  </View>
                  <Text className="text-sm font-black text-amber-900 uppercase tracking-wider">
                    Online application link unavailable
                  </Text>
                </View>
                <Text className="text-sm text-amber-800 font-medium leading-relaxed">
                  {scheme.applicationNotice ||
                    'This scheme requires offline application at your nearest designated government department, Post Office, or bank branch.'}
                </Text>
                <View className="mt-3.5 bg-white/80 border border-amber-200 rounded-xl py-3 px-4 flex-row items-center justify-between">
                  <Text className="text-xs font-bold text-amber-900">Application Mode</Text>
                  <Text className="text-xs font-black text-amber-700 uppercase">Offline / In-Person Only</Text>
                </View>
              </View>
            )}

            {/* Secondary Buttons Row */}
            <View className="flex-row justify-between pt-1">
              {/* Official Website */}
              <TouchableOpacity
                onPress={handleVisitWebsite}
                activeOpacity={0.7}
                className="w-[48%] py-4 border border-[#CADDCB] bg-[#EDF5EE] rounded-2xl justify-center items-center shadow-xs flex-row"
              >
                <Text className="text-slate-700 text-sm font-bold mr-1">Official Website</Text>
                <Text className="text-slate-500 text-sm">↗</Text>
              </TouchableOpacity>

              {/* Share */}
              <TouchableOpacity
                onPress={handleShare}
                activeOpacity={0.7}
                className="w-[48%] py-4 border border-[#CADDCB] bg-[#EDF5EE] rounded-2xl justify-center items-center shadow-xs flex-row"
              >
                <Text className="text-slate-700 text-sm font-bold mr-1">Share Portal</Text>
                <Text className="text-slate-500 text-sm">🔗</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

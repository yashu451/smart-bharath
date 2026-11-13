import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MOCK_SCHEMES_DB, SchemeItem } from '@/constants/mock-schemes';
import { dashboardApi, schemeApi } from '@/services/api';
import { storage } from '@/services/storage';
import {
  evaluateSchemeEligibility,
  CitizenProfile,
  EvaluatedScheme,
  EligibilityResult,
} from '@/utils/schemeEligibility';

export default function RecommendedSchemesScreen() {
  const router = useRouter();
  const rawParams = useLocalSearchParams();

  // Active tab: 'recommended' or 'all'
  const [activeTab, setActiveTab] = useState<'recommended' | 'all'>('recommended');
  
  // Profile & Evaluation State
  const [profile, setProfile] = useState<CitizenProfile | null>(null);
  const [evaluation, setEvaluation] = useState<EligibilityResult>(() =>
    evaluateSchemeEligibility(null, MOCK_SCHEMES_DB)
  );

  // Load and evaluate profile on mount or params change
  useEffect(() => {
    let resolvedProfile: CitizenProfile | null = null;

    // 1. Try URL parameters first
    if (rawParams && Object.keys(rawParams).length > 0 && rawParams.age) {
      resolvedProfile = {
        age: rawParams.age as string,
        state: rawParams.state as string,
        district: rawParams.district as string,
        gender: rawParams.gender as string,
        occupation: rawParams.occupation as string,
        income: rawParams.income as string,
        student: rawParams.student as string,
        farmer: rawParams.farmer as string,
        senior: rawParams.senior as string,
        disabled: rawParams.disabled as string,
        caste: rawParams.caste as string,
      };
    } else {
      // 2. Try storage persistence
      try {
        const storedStr = storage.getItem('smart_bharat_scheme_profile');
        if (storedStr) {
          const parsed = JSON.parse(storedStr);
          if (parsed && (parsed.age || parsed.occupation)) {
            resolvedProfile = parsed;
          }
        }
      } catch (e) {
        console.warn('Could not parse stored scheme profile:', e);
      }
    }

    // Check if pre-evaluated schemes exist from processing screen
    let preEvaluated: EligibilityResult | null = null;
    try {
      const cached = storage.getItem('smart_bharat_evaluated_schemes');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.eligibleSchemes)) {
          preEvaluated = parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read cached evaluated schemes:', e);
    }

    setProfile(resolvedProfile);
    const evalResult = preEvaluated || evaluateSchemeEligibility(resolvedProfile, MOCK_SCHEMES_DB);
    setEvaluation(evalResult);

    // If profile is missing required criteria, default tab to all schemes or stay recommended
    if (!evalResult.hasProfile) {
      // Keep recommended to display the incomplete profile prompt clearly
      setActiveTab('recommended');
    }

    // Optional background sync with backend API
    if (resolvedProfile && evalResult.hasProfile) {
      schemeApi.evaluateSchemes(resolvedProfile).catch(() => {
        // Local evaluation is the verified client-side source of truth
      });
    }
  }, [rawParams]);

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

  const handleApplyNow = (url: string | null | undefined, scheme: SchemeItem | EvaluatedScheme) => {
    if (!url || !scheme.hasOnlineApplication) {
      Alert.alert(
        'Online Application Link Unavailable',
        scheme.applicationNotice ||
          'This scheme currently does not have an online application portal. Please visit the designated branch or government office to apply in person.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Persist scheme application in MongoDB Activity history
    dashboardApi
      .createActivity({
        type: 'scheme',
        title: `${scheme.name} Application`,
        subtitle: `Applied via official portal • Token: SCH-${Math.floor(100000 + Math.random() * 900000)}`,
        token: `Token: SCH-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'Submitted',
        statusColor: '#16A34A',
        statusBg: '#DCFCE7',
        icon: '🌾',
        route: '/schemes/details',
        metadata: {
          schemeId: scheme.id,
          schemeName: scheme.name,
          category: scheme.category,
          applicationUrl: url,
        },
      })
      .catch((err) => console.warn('Could not save scheme activity to backend:', err));

    openExternalUrl(url);
  };

  const handleViewDetails = (schemeId: string) => {
    router.push({
      pathname: '/schemes/details',
      params: { id: schemeId },
    } as any);
  };

  // Format currency
  const formatRupees = (amount?: number | string) => {
    if (amount === undefined || amount === null || amount === '') return 'N/A';
    const num = Number(amount);
    return isNaN(num) ? String(amount) : `₹${num.toLocaleString('en-IN')}`;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#E6F0E8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#E6F0E8" />

      {/* Header bar */}
      <View className="px-6 py-4 flex-row items-center border-b border-[#CADDCB] bg-[#EDF5EE]">
        <View className="max-w-5xl w-full mx-auto flex-row items-center">
          <TouchableOpacity
            onPress={() => router.replace('/home')}
            className="w-11 h-11 rounded-2xl bg-[#E0EDE1] border border-[#CADDCB] justify-center items-center mr-3.5 shadow-xs"
            activeOpacity={0.7}
          >
            <Text className="text-[#14532D] font-black text-lg">←</Text>
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-black text-[#14532D]">Recommended Schemes</Text>
            <Text className="text-xs font-bold text-[#4B6350] tracking-wider mt-0.5">
              Verified Eligibility-Based Matching
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 130 }}>
        <View className="max-w-5xl w-full mx-auto">
          {/* Title Header with Orange Indicator */}
          <View className="mb-5 flex-row items-center justify-between flex-wrap gap-2">
            <View className="flex-row items-center">
              <View className="w-1.5 h-8 rounded-full bg-[#F97316] mr-3.5" />
              <View>
                <Text className="text-3xl font-black text-[#14532D] tracking-tight">
                  {activeTab === 'recommended' ? 'Your Eligible Schemes' : 'Central Schemes Catalog'}
                </Text>
                <Text className="text-base font-medium text-slate-600 mt-1">
                  {activeTab === 'recommended'
                    ? 'Strictly verified based on your age, income, and occupation'
                    : 'Complete official database of central welfare programs'}
                </Text>
              </View>
            </View>

            {/* Retake Questionnaire Action Button */}
            <TouchableOpacity
              onPress={() => router.push('/schemes/questionnaire' as any)}
              className="px-4 py-2.5 rounded-xl border border-[#CADDCB] bg-[#EDF5EE] flex-row items-center shadow-xs"
              activeOpacity={0.7}
            >
              <Text className="text-[#14532D] font-bold text-xs uppercase mr-1">
                Edit Questionnaire ✏️
              </Text>
            </TouchableOpacity>
          </View>

          {/* Citizen Profile Summary Banner (When profile exists) */}
          {evaluation.hasProfile && profile && (
            <View className="mb-6 bg-[#EDF5EE] border border-[#CADDCB] rounded-2xl p-4 flex-row flex-wrap items-center justify-between gap-3 shadow-xs">
              <View className="flex-1 min-w-[260px]">
                <Text className="text-xs font-black uppercase text-[#14532D] tracking-wider mb-1">
                  Verified Profile Parameters
                </Text>
                <View className="flex-row flex-wrap gap-2 mt-1">
                  <View className="bg-white/80 border border-[#CADDCB] px-3 py-1 rounded-lg">
                    <Text className="text-xs font-bold text-slate-700">
                      Age: <Text className="font-black text-[#14532D]">{profile.age || 'N/A'}</Text>
                    </Text>
                  </View>
                  <View className="bg-white/80 border border-[#CADDCB] px-3 py-1 rounded-lg">
                    <Text className="text-xs font-bold text-slate-700">
                      Occupation: <Text className="font-black text-[#14532D]">{profile.occupation || 'N/A'}</Text>
                    </Text>
                  </View>
                  <View className="bg-white/80 border border-[#CADDCB] px-3 py-1 rounded-lg">
                    <Text className="text-xs font-bold text-slate-700">
                      Income: <Text className="font-black text-[#14532D]">{formatRupees(profile.income)}</Text>
                    </Text>
                  </View>
                  {profile.state && (
                    <View className="bg-white/80 border border-[#CADDCB] px-3 py-1 rounded-lg">
                      <Text className="text-xs font-bold text-slate-700">
                        State: <Text className="font-black text-[#14532D]">{profile.state}</Text>
                      </Text>
                    </View>
                  )}
                  {profile.student === 'yes' && (
                    <View className="bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-lg">
                      <Text className="text-xs font-black text-emerald-800">Student</Text>
                    </View>
                  )}
                  {profile.farmer === 'yes' && (
                    <View className="bg-amber-50 border border-amber-300 px-3 py-1 rounded-lg">
                      <Text className="text-xs font-black text-amber-800">Farmer</Text>
                    </View>
                  )}
                </View>
              </View>
              <View className="bg-[#14532D] px-4 py-2 rounded-xl">
                <Text className="text-white text-xs font-bold">
                  Matches: <Text className="font-black text-sm text-[#FDE047]">{evaluation.eligibleSchemes.length}</Text> / {evaluation.totalEvaluated}
                </Text>
              </View>
            </View>
          )}

          {/* Tab Navigation: Recommended vs Browse All */}
          <View className="flex-row bg-[#DFEBD7] p-1.5 rounded-2xl mb-6 border border-[#CADDCB]">
            <TouchableOpacity
              onPress={() => setActiveTab('recommended')}
              activeOpacity={0.8}
              className={`flex-1 py-3.5 px-4 rounded-xl items-center justify-center ${
                activeTab === 'recommended'
                  ? 'bg-[#14532D] shadow-sm'
                  : 'bg-transparent'
              }`}
            >
              <Text
                className={`font-black text-sm uppercase tracking-wider ${
                  activeTab === 'recommended' ? 'text-white' : 'text-[#14532D]'
                }`}
              >
                Recommended For You ({evaluation.hasProfile ? evaluation.eligibleSchemes.length : '0'})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('all')}
              activeOpacity={0.8}
              className={`flex-1 py-3.5 px-4 rounded-xl items-center justify-center ${
                activeTab === 'all'
                  ? 'bg-[#14532D] shadow-sm'
                  : 'bg-transparent'
              }`}
            >
              <Text
                className={`font-black text-sm uppercase tracking-wider ${
                  activeTab === 'all' ? 'text-white' : 'text-[#14532D]'
                }`}
              >
                Browse All Schemes ({MOCK_SCHEMES_DB.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* TAB 1: RECOMMENDED SCHEMES */}
          {activeTab === 'recommended' && (
            <>
              {/* CASE A: Incomplete Profile Questionnaire */}
              {!evaluation.hasProfile && (
                <View className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-8 mb-6 shadow-sm items-center text-center">
                  <View className="w-16 h-16 rounded-full bg-amber-100 border border-amber-300 items-center justify-center mb-4">
                    <Text className="text-2xl">📋</Text>
                  </View>
                  <Text className="text-2xl font-black text-amber-950 text-center mb-2">
                    Eligibility Questionnaire Required
                  </Text>
                  <Text className="text-base font-medium text-amber-800 text-center max-w-xl leading-relaxed mb-4">
                    To show verified recommendations instead of guessing or assuming your eligibility, Smart Bharat requires your basic profile details:
                  </Text>
                  <View className="flex-row flex-wrap justify-center gap-2 mb-6">
                    {evaluation.missingFields.map((field) => (
                      <View key={field} className="bg-amber-100 border border-amber-300 px-3.5 py-1.5 rounded-lg">
                        <Text className="text-xs font-black text-amber-900">Missing: {field}</Text>
                      </View>
                    ))}
                  </View>
                  <View className="flex-row gap-3 w-full max-w-md">
                    <TouchableOpacity
                      onPress={() => router.push('/schemes/questionnaire' as any)}
                      activeOpacity={0.85}
                      style={{
                        backgroundColor: '#14532D',
                        minHeight: 52,
                        shadowColor: '#14532D',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.15,
                        shadowRadius: 8,
                        elevation: 3,
                      }}
                      className="flex-1 py-4 px-6 rounded-2xl justify-center items-center"
                    >
                      <Text className="text-white text-base font-black uppercase tracking-wider">
                        Complete Questionnaire →
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    onPress={() => setActiveTab('all')}
                    className="mt-4 py-2"
                  >
                    <Text className="text-[#14532D] font-bold text-sm underline">
                      Or browse all {MOCK_SCHEMES_DB.length} schemes without recommendations
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* CASE B: Completed Profile, but Zero Matching Schemes Found */}
              {evaluation.hasProfile && evaluation.eligibleSchemes.length === 0 && (
                <View className="bg-[#F3F8F4] border border-[#CADDCB] rounded-3xl p-8 mb-6 shadow-sm items-center text-center">
                  <View className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 items-center justify-center mb-4">
                    <Text className="text-2xl">🔍</Text>
                  </View>
                  <Text className="text-2xl font-black text-[#14532D] text-center mb-2">
                    No Eligible Schemes Found
                  </Text>
                  <Text className="text-base font-medium text-slate-600 text-center max-w-xl leading-relaxed mb-5">
                    Based on your verified answers (Age: {profile?.age || 'N/A'}, Occupation: {profile?.occupation || 'N/A'}, Annual Income: {formatRupees(profile?.income)}), you do not currently meet the mandatory eligibility conditions for any of the 8 central government schemes in our catalog.
                  </Text>
                  <View className="bg-amber-50 border border-amber-200 rounded-2xl p-4 max-w-xl w-full mb-6">
                    <Text className="text-xs font-black text-amber-900 uppercase tracking-wider mb-1">
                      ℹ Why No Schemes Matched:
                    </Text>
                    <Text className="text-xs text-amber-800 leading-relaxed font-medium">
                      Schemes like PM-KISAN strictly require landholding farmer families; PM Scholarship requires enrolled higher education students; PM-SVANidhi requires daily wage micro-vendors; and Ayushman Bharat requires families within priority low-income thresholds (≤ ₹2.5L) or senior citizens aged 70+.
                    </Text>
                  </View>
                  <View className="flex-row flex-wrap gap-3.5 justify-center w-full max-w-md">
                    <TouchableOpacity
                      onPress={() => router.push('/schemes/questionnaire' as any)}
                      activeOpacity={0.85}
                      style={{
                        backgroundColor: '#14532D',
                        minHeight: 52,
                        shadowColor: '#14532D',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.15,
                        shadowRadius: 8,
                        elevation: 3,
                      }}
                      className="flex-1 py-4 px-6 rounded-2xl justify-center items-center"
                    >
                      <Text className="text-white text-base font-black uppercase tracking-wider">
                        Review / Re-run Questionnaire 🔄
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setActiveTab('all')}
                      activeOpacity={0.7}
                      style={{ minHeight: 52 }}
                      className="flex-1 py-4 px-6 border border-[#CADDCB] bg-[#EDF5EE] rounded-2xl justify-center items-center shadow-xs"
                    >
                      <Text className="text-[#14532D] text-sm font-black uppercase tracking-wider">
                        Browse All Schemes →
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* CASE C: Verified Eligible Schemes List */}
              {evaluation.hasProfile && evaluation.eligibleSchemes.length > 0 && (
                <View className="space-y-5">
                  {evaluation.eligibleSchemes.map((scheme: EvaluatedScheme) => (
                    <View
                      key={scheme.id}
                      style={{
                        shadowColor: '#14532D',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.05,
                        shadowRadius: 10,
                        elevation: 2,
                      }}
                      className="bg-[#F3F8F4] border-2 border-[#10B981]/50 rounded-3xl p-6 mb-5"
                    >
                      {/* Card top details */}
                      <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-1 pr-4">
                          <View className="bg-[#ECFDF5] border border-[#A7F3D0] px-3.5 py-1 rounded-xl self-start mb-2.5">
                            <Text className="text-xs font-black text-[#10B981] uppercase tracking-wider">
                              {scheme.category}
                            </Text>
                          </View>
                          <Text className="text-xl font-black text-[#14532D] leading-snug">
                            {scheme.name}
                          </Text>
                          <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                            {scheme.authority}
                          </Text>
                        </View>

                        {/* Verified Eligible Status badge */}
                        <View className="px-3.5 py-1.5 rounded-full border bg-[#ECFDF5] border-[#A7F3D0] flex-row items-center">
                          <Text className="text-emerald-700 text-xs font-black mr-1">✓</Text>
                          <Text className="text-xs font-black uppercase text-[#10B981]">
                            Verified Match
                          </Text>
                        </View>
                      </View>

                      {/* Explicit Why You Match Explanation (Requirement 6) */}
                      {scheme.matchReason && (
                        <View className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 my-3 flex-row items-start">
                          <Text className="text-emerald-700 font-bold text-base mr-2 mt-0.5">💡</Text>
                          <View className="flex-1">
                            <Text className="text-xs font-black text-emerald-900 uppercase tracking-wider mb-0.5">
                              Why You Are Eligible:
                            </Text>
                            <Text className="text-sm font-semibold text-emerald-950 leading-relaxed">
                              {scheme.matchReason}
                            </Text>
                          </View>
                        </View>
                      )}

                      {/* Description body */}
                      <Text className="text-sm text-slate-600 leading-relaxed mt-2 font-medium">
                        {scheme.description}
                      </Text>

                      {/* Benefits highlight */}
                      <View className="bg-[#ECFDF5]/60 border border-[#A7F3D0] p-4.5 rounded-2xl my-4">
                        <Text className="text-xs font-black text-[#10B981] uppercase tracking-widest">
                          Key Direct Benefit
                        </Text>
                        <Text className="text-sm font-black text-[#14532D] mt-1">
                          {scheme.benefits}
                        </Text>
                      </View>

                      {/* Action Buttons Section */}
                      <View className="gap-3 mt-2">
                        {scheme.hasOnlineApplication && scheme.applicationUrl ? (
                          <View>
                            <TouchableOpacity
                              onPress={() => handleApplyNow(scheme.applicationUrl, scheme)}
                              activeOpacity={0.85}
                              style={{
                                backgroundColor: '#14532D',
                                minHeight: 56,
                                shadowColor: '#14532D',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.15,
                                shadowRadius: 10,
                                elevation: 3,
                              }}
                              className="w-full py-4.5 px-6 rounded-2xl justify-center items-center flex-row"
                            >
                              <Text className="text-white text-base font-black uppercase tracking-wider mr-2">
                                Apply Now on Official Portal
                              </Text>
                              <Text className="text-white text-lg font-black">↗</Text>
                            </TouchableOpacity>
                            <Text className="text-xs font-medium text-slate-500 text-center mt-2">
                              Portal: <Text className="font-bold text-[#14532D]">{scheme.applicationUrl.replace('https://', '').split('/')[0]}</Text> 🇮🇳
                            </Text>
                          </View>
                        ) : (
                          <View
                            style={{ minHeight: 48 }}
                            className="w-full py-3.5 px-4 bg-amber-50 border border-amber-200 rounded-2xl flex-row items-center justify-between"
                          >
                            <View className="flex-row items-center flex-1 mr-2">
                              <Text className="text-amber-800 text-sm mr-2">ℹ</Text>
                              <Text className="text-sm font-bold text-amber-900" numberOfLines={1}>
                                Online application link unavailable
                              </Text>
                            </View>
                            <Text className="text-xs font-black text-amber-700 uppercase">Offline Only</Text>
                          </View>
                        )}

                        <TouchableOpacity
                          onPress={() => handleViewDetails(scheme.id)}
                          activeOpacity={0.7}
                          style={{ minHeight: 50 }}
                          className="w-full py-4 px-6 border border-[#CADDCB] bg-[#EDF5EE] rounded-2xl justify-center items-center shadow-xs"
                        >
                          <Text className="text-[#14532D] text-sm font-black uppercase tracking-wider">
                            View Scheme Details & Criteria →
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          {/* TAB 2: BROWSE ALL SCHEMES (Requirement 11: keep complete catalogue available) */}
          {activeTab === 'all' && (
            <View className="space-y-5">
              <View className="bg-[#EDF5EE] border border-[#CADDCB] p-4 rounded-2xl mb-4">
                <Text className="text-sm font-bold text-[#14532D]">
                  Showing all {MOCK_SCHEMES_DB.length} central government schemes in the catalog.
                </Text>
                <Text className="text-xs text-slate-600 mt-1">
                  Citizens can review criteria and apply for any scheme on the official portal.
                </Text>
              </View>

              {MOCK_SCHEMES_DB.map((scheme: SchemeItem) => {
                // Check if this scheme is eligible under current evaluation
                const isEligible = evaluation.hasProfile
                  ? evaluation.eligibleSchemes.some((s) => s.id === scheme.id)
                  : null;
                const matchReason = evaluation.eligibleSchemes.find((s) => s.id === scheme.id)?.matchReason;
                const unmet = evaluation.ineligibleSchemes.find((s) => s.id === scheme.id)?.unmetCriteria;

                return (
                  <View
                    key={scheme.id}
                    style={{
                      shadowColor: '#14532D',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.04,
                      shadowRadius: 10,
                      elevation: 2,
                    }}
                    className={`bg-[#F3F8F4] border rounded-3xl p-6 mb-5 ${
                      isEligible === true
                        ? 'border-[#10B981]/50'
                        : 'border-[#CADDCB]'
                    }`}
                  >
                    {/* Card top details */}
                    <View className="flex-row justify-between items-start mb-2">
                      <View className="flex-1 pr-4">
                        <View className="bg-[#ECFDF5] border border-[#A7F3D0] px-3.5 py-1 rounded-xl self-start mb-2.5">
                          <Text className="text-xs font-black text-[#10B981] uppercase tracking-wider">
                            {scheme.category}
                          </Text>
                        </View>
                        <Text className="text-xl font-black text-[#14532D] leading-snug">
                          {scheme.name}
                        </Text>
                        <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                          {scheme.authority}
                        </Text>
                      </View>

                      {/* Eligibility Status badge */}
                      {evaluation.hasProfile ? (
                        <View
                          className={`px-3.5 py-1.5 rounded-full border ${
                            isEligible
                              ? 'bg-[#ECFDF5] border-[#A7F3D0]'
                              : 'bg-slate-100 border-slate-300'
                          }`}
                        >
                          <Text
                            className={`text-xs font-black uppercase ${
                              isEligible ? 'text-[#10B981]' : 'text-slate-600'
                            }`}
                          >
                            {isEligible ? 'Eligible' : 'Not Eligible'}
                          </Text>
                        </View>
                      ) : (
                        <View className="px-3.5 py-1.5 rounded-full border bg-slate-100 border-slate-300">
                          <Text className="text-xs font-bold uppercase text-slate-600">
                            Central Scheme
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Why match / unmet criteria notes */}
                    {isEligible && matchReason && (
                      <View className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 my-2.5">
                        <Text className="text-xs font-bold text-emerald-900">
                          ✓ Matches your profile: {matchReason}
                        </Text>
                      </View>
                    )}
                    {isEligible === false && unmet && unmet.length > 0 && (
                      <View className="bg-slate-100 border border-slate-300 rounded-xl p-3 my-2.5">
                        <Text className="text-xs font-bold text-slate-700">
                          ℹ Criteria requirement: {unmet[0]}
                        </Text>
                      </View>
                    )}

                    {/* Description body */}
                    <Text className="text-sm text-slate-600 leading-relaxed mt-2.5 font-medium">
                      {scheme.description}
                    </Text>

                    {/* Benefits highlight */}
                    <View className="bg-[#ECFDF5]/60 border border-[#A7F3D0] p-4.5 rounded-2xl my-4">
                      <Text className="text-xs font-black text-[#10B981] uppercase tracking-widest">
                        Key Direct Benefit
                      </Text>
                      <Text className="text-sm font-black text-[#14532D] mt-1">
                        {scheme.benefits}
                      </Text>
                    </View>

                    {/* Action Buttons Section */}
                    <View className="gap-3 mt-2">
                      {scheme.hasOnlineApplication && scheme.applicationUrl ? (
                        <View>
                          <TouchableOpacity
                            onPress={() => handleApplyNow(scheme.applicationUrl, scheme)}
                            activeOpacity={0.85}
                            style={{
                              backgroundColor: '#14532D',
                              minHeight: 56,
                              shadowColor: '#14532D',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.15,
                              shadowRadius: 10,
                              elevation: 3,
                            }}
                            className="w-full py-4.5 px-6 rounded-2xl justify-center items-center flex-row"
                          >
                            <Text className="text-white text-base font-black uppercase tracking-wider mr-2">
                              Apply Now on Official Portal
                            </Text>
                            <Text className="text-white text-lg font-black">↗</Text>
                          </TouchableOpacity>
                          <Text className="text-xs font-medium text-slate-500 text-center mt-2">
                            Portal: <Text className="font-bold text-[#14532D]">{scheme.applicationUrl.replace('https://', '').split('/')[0]}</Text> 🇮🇳
                          </Text>
                        </View>
                      ) : (
                        <View
                          style={{ minHeight: 48 }}
                          className="w-full py-3.5 px-4 bg-amber-50 border border-amber-200 rounded-2xl flex-row items-center justify-between"
                        >
                          <View className="flex-row items-center flex-1 mr-2">
                            <Text className="text-amber-800 text-sm mr-2">ℹ</Text>
                            <Text className="text-sm font-bold text-amber-900" numberOfLines={1}>
                              Online application link unavailable
                            </Text>
                          </View>
                          <Text className="text-xs font-black text-amber-700 uppercase">Offline Only</Text>
                        </View>
                      )}

                      <TouchableOpacity
                        onPress={() => handleViewDetails(scheme.id)}
                        activeOpacity={0.7}
                        style={{ minHeight: 50 }}
                        className="w-full py-4 px-6 border border-[#CADDCB] bg-[#EDF5EE] rounded-2xl justify-center items-center shadow-xs"
                      >
                        <Text className="text-[#14532D] text-sm font-black uppercase tracking-wider">
                          View Scheme Details & Criteria →
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Bottom Retake Questionnaire Button */}
          <TouchableOpacity
            onPress={() => router.push('/schemes/questionnaire' as any)}
            style={{ minHeight: 52 }}
            className="mt-6 border border-[#CADDCB] py-4.5 px-6 rounded-2xl justify-center items-center bg-[#EDF5EE] shadow-xs"
            activeOpacity={0.7}
          >
            <Text className="text-[#14532D] font-black text-base uppercase tracking-wider">
              Re-run Eligibility Questionnaire 🔄
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
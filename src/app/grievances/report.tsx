import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { INDIAN_STATES, COMPLAINT_CATEGORIES, StateOption } from '@/constants/grievance-routing';
import { grievanceApi, GrievanceGuidance } from '@/services/api';

export default function GrievanceGuidanceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Mode: 'guide' (default flow) or 'save_only' (quick log of already filed complaint)
  const isDirectSave = params.mode === 'save_only';

  // Step state: 1 = Details Input, 2 = Portal Guidance & Official Link, 3 = Save Reference Number
  const [currentStep, setCurrentStep] = useState<number>(isDirectSave ? 3 : 1);

  // Form Fields
  const [selectedState, setSelectedState] = useState<string>('Karnataka');
  const [district, setDistrict] = useState<string>('Bengaluru Urban');
  const [city, setCity] = useState<string>('');
  const [category, setCategory] = useState<string>((params.category as string) || 'Roads, Potholes & Streetlights');
  const [title, setTitle] = useState<string>('');
  const [exactLocation, setExactLocation] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  // Save Reference Step Fields
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [portalName, setPortalName] = useState<string>('');
  const [portalUrl, setPortalUrl] = useState<string>('https://pgportal.gov.in');
  const [trackingUrl, setTrackingUrl] = useState<string>('https://pgportal.gov.in/Status');
  const [authorityName, setAuthorityName] = useState<string>('');
  const [expectedTimelineDays, setExpectedTimelineDays] = useState<string>('30');
  const [officialNotice, setOfficialNotice] = useState<string>('Standard 30-day timeline under Citizen Charter.');
  const [submissionDate, setSubmissionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [initialNote, setInitialNote] = useState<string>('');

  // UI States
  const [isLoadingGuidance, setIsLoadingGuidance] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [guidance, setGuidance] = useState<GrievanceGuidance | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentStateObj = INDIAN_STATES.find((s) => s.value === selectedState) || INDIAN_STATES[0];

  // Helper to open external official government URLs in browser
  const openExternalUrl = async (url: string) => {
    if (!url) return;
    try {
      if (Platform.OS === 'web') {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        await Linking.openURL(url);
      }
    } catch {
      Alert.alert('Official Portal Link', `Official portal URL:\n${url}`);
    }
  };

  // Step 1 -> Step 2: Fetch Guidance
  const handleAnalyzeAndGuide = async () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Please provide a brief complaint title.';
    if (!description.trim()) errs.description = 'Please describe the problem.';
    if (!selectedState) errs.state = 'Please select your State.';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setIsLoadingGuidance(true);

    try {
      const res = await grievanceApi.getGuidance({
        state: selectedState,
        district: district.trim(),
        city: city.trim(),
        category,
        description: description.trim(),
        exactLocation: exactLocation.trim(),
      });

      if (res.success && res.guidance) {
        setGuidance(res.guidance);
        setPortalName(res.guidance.portalName);
        setPortalUrl(res.guidance.portalUrl);
        setTrackingUrl(res.guidance.trackingUrl);
        setAuthorityName(res.guidance.authorityName);
        setExpectedTimelineDays(String(res.guidance.expectedTimelineDays || 30));
        setOfficialNotice(res.guidance.officialTimelineNotice);
        setCurrentStep(2);
      } else {
        throw new Error(res.message || 'Unable to identify official portal.');
      }
    } catch (err: any) {
      Alert.alert('Guidance Error', err.message || 'Could not analyze complaint. Please check your connection.');
    } finally {
      setIsLoadingGuidance(false);
    }
  };

  // Step 2 -> Step 3: Proceed to save reference number
  const handleProceedToSaveRef = () => {
    setCurrentStep(3);
  };

  // Step 3: Save complaint reference number in MongoDB
  const handleSaveComplaint = async () => {
    const errs: Record<string, string> = {};
    if (!referenceNumber.trim()) errs.referenceNumber = 'Official Reference / Token Number is required.';
    if (!title.trim()) errs.title = 'Complaint Title is required.';
    if (!portalName.trim()) errs.portalName = 'Government Portal Name is required.';
    if (!selectedState) errs.state = 'State is required.';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSaving(true);
    setErrors({});

    try {
      const res = await grievanceApi.createGrievance({
        title: title.trim(),
        category,
        state: selectedState,
        district: district.trim(),
        city: city.trim(),
        exactLocation: exactLocation.trim(),
        description: description.trim() || title.trim(),
        authorityName: authorityName || 'Designated Government Authority',
        portalName: portalName.trim(),
        portalUrl: portalUrl.trim(),
        trackingUrl: trackingUrl.trim(),
        referenceNumber: referenceNumber.trim(),
        submissionDate,
        expectedTimelineDays: Number(expectedTimelineDays) || 30,
        officialTimelineNotice: officialNotice,
        initialNote: initialNote.trim(),
      });

      if (res.success) {
        Alert.alert(
          'Complaint Recorded',
          `Reference ${referenceNumber.trim()} has been saved in your personal tracking dashboard.`,
          [
            {
              text: 'View My Complaints',
              onPress: () => router.replace('/grievances/track' as any),
            },
          ]
        );
      } else {
        throw new Error(res.message || 'Server was unable to save complaint.');
      }
    } catch (err: any) {
      Alert.alert('Saving Error', err.message || 'Failed to save complaint. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#E6F0E8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#E6F0E8" />

      {/* Header bar */}
      <View className="px-6 py-4 flex-row items-center border-b border-[#CADDCB] bg-[#EDF5EE]">
        <TouchableOpacity
          onPress={() => (currentStep > 1 && !isDirectSave ? setCurrentStep(currentStep - 1) : router.back())}
          className="w-11 h-11 rounded-2xl bg-[#E0EDE1] border border-[#CADDCB] justify-center items-center mr-3.5 shadow-xs"
          activeOpacity={0.7}
        >
          <Text className="text-[#14532D] font-black text-lg">←</Text>
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-base font-black text-[#14532D]">
            {currentStep === 1
              ? 'Complaint Guidance'
              : currentStep === 2
              ? 'Official Portal Recommendation'
              : 'Save Complaint Reference'}
          </Text>
          <Text className="text-[10px] font-bold text-[#4B6350] uppercase tracking-widest mt-0.5">
            Step {currentStep} of 3 • Citizen Guidance System
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
          {/* STEP 1: COMPLAINT DETAILS & LOCATION FORM */}
          {currentStep === 1 && (
            <View>
              {/* Important Explanatory Banner */}
              <View className="bg-[#EDF5EE] border border-[#CADDCB] p-4 rounded-3xl mb-5">
                <Text className="text-xs font-black text-[#14532D] mb-1">
                  How Smart Bharat Helps You:
                </Text>
                <Text className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  We determine whether your issue falls under Central Government (CPGRAMS), State (Janaspandana, CM Helpline), or Local Municipality (BBMP, GCC), show filing steps, and provide the direct official portal link.
                </Text>
              </View>

              {/* Form Container */}
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
                {/* 1. State Selector */}
                <View className="mb-4">
                  <Text className="text-xs font-black text-[#14532D] uppercase tracking-wider mb-2">
                    1. Select State or Central Jurisdiction *
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                    {INDIAN_STATES.map((st) => {
                      const isSelected = selectedState === st.value;
                      return (
                        <TouchableOpacity
                          key={st.value}
                          onPress={() => {
                            setSelectedState(st.value);
                            setDistrict(st.popularDistricts[0] || '');
                          }}
                          className={`px-3.5 py-2 rounded-2xl mr-2 border ${
                            isSelected
                              ? 'bg-[#14532D] border-[#14532D]'
                              : 'bg-[#EDF5EE] border-[#CADDCB]'
                          }`}
                        >
                          <Text
                            className={`text-xs font-black ${
                              isSelected ? 'text-white' : 'text-[#14532D]'
                            }`}
                          >
                            {st.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* 2. District & City */}
                <View className="mb-4">
                  <Text className="text-xs font-black text-[#14532D] uppercase tracking-wider mb-2">
                    2. Select District / City *
                  </Text>
                  {/* Quick Select District Pills for the Selected State */}
                  {currentStateObj.popularDistricts && currentStateObj.popularDistricts.length > 0 && (
                    <View className="mb-2.5">
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                        {currentStateObj.popularDistricts.map((d) => {
                          const isSelected = district.toLowerCase() === d.toLowerCase();
                          return (
                            <TouchableOpacity
                              key={d}
                              onPress={() => setDistrict(d)}
                              className={`px-3 py-1.5 rounded-xl mr-2 border ${
                                isSelected
                                  ? 'bg-[#14532D] border-[#14532D]'
                                  : 'bg-[#EDF5EE] border-[#CADDCB]'
                              }`}
                            >
                              <Text
                                className={`text-[11px] font-bold ${
                                  isSelected ? 'text-white' : 'text-[#14532D]'
                                }`}
                              >
                                {d}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </View>
                  )}
                  <TextInput
                    placeholder="e.g. Mysuru, Bengaluru Urban, Coimbatore, Chennai"
                    placeholderTextColor="#94A3B8"
                    value={district}
                    onChangeText={setDistrict}
                    className="w-full px-4 py-3 bg-[#EDF5EE] border border-[#CADDCB] rounded-2xl text-slate-900 font-semibold text-xs"
                  />
                </View>

                {/* 3. Category Selector */}
                <View className="mb-4">
                  <Text className="text-xs font-black text-[#14532D] uppercase tracking-wider mb-2">
                    3. Complaint Category *
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                    {COMPLAINT_CATEGORIES.map((c) => {
                      const isSelected = category === c.label;
                      return (
                        <TouchableOpacity
                          key={c.id}
                          onPress={() => setCategory(c.label)}
                          className={`px-3 py-2 rounded-2xl mr-2 border flex-row items-center ${
                            isSelected
                              ? 'bg-[#14532D] border-[#14532D]'
                              : 'bg-[#EDF5EE] border-[#CADDCB]'
                          }`}
                        >
                          <Text className="text-xs mr-1.5">{c.icon}</Text>
                          <Text
                            className={`text-[11px] font-black ${
                              isSelected ? 'text-white' : 'text-[#14532D]'
                            }`}
                          >
                            {c.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* 4. Title */}
                <View className="mb-4">
                  <Text className="text-xs font-black text-[#14532D] uppercase tracking-wider mb-1.5">
                    4. Brief Title *
                  </Text>
                  <TextInput
                    placeholder="e.g. Broken water pipeline on 5th Cross Road"
                    placeholderTextColor="#94A3B8"
                    value={title}
                    onChangeText={(t) => {
                      setTitle(t);
                      if (errors.title) setErrors({ ...errors, title: '' });
                    }}
                    className={`w-full px-4 py-3 bg-[#EDF5EE] border ${
                      errors.title ? 'border-red-400' : 'border-[#CADDCB]'
                    } rounded-2xl text-slate-900 font-bold text-xs`}
                  />
                  {errors.title ? <Text className="text-red-500 text-[10px] mt-1 ml-1 font-bold">{errors.title}</Text> : null}
                </View>

                {/* 5. Exact Location */}
                <View className="mb-4">
                  <Text className="text-xs font-black text-[#14532D] uppercase tracking-wider mb-1.5">
                    5. Exact Street Location / Ward / Landmark
                  </Text>
                  <TextInput
                    placeholder="e.g. Near Metro Pillar 142, Ward 150, Koramangala"
                    placeholderTextColor="#94A3B8"
                    value={exactLocation}
                    onChangeText={setExactLocation}
                    className="w-full px-4 py-3 bg-[#EDF5EE] border border-[#CADDCB] rounded-2xl text-slate-900 font-semibold text-xs"
                  />
                </View>

                {/* 6. Problem Description */}
                <View className="mb-2">
                  <Text className="text-xs font-black text-[#14532D] uppercase tracking-wider mb-1.5">
                    6. Problem Description *
                  </Text>
                  <TextInput
                    placeholder="Describe the severity, how long it has persisted, and hazards to traffic or public safety..."
                    placeholderTextColor="#94A3B8"
                    value={description}
                    onChangeText={(t) => {
                      setDescription(t);
                      if (errors.description) setErrors({ ...errors, description: '' });
                    }}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    className={`w-full px-4 py-3 bg-[#EDF5EE] border ${
                      errors.description ? 'border-red-400' : 'border-[#CADDCB]'
                    } rounded-2xl text-slate-900 font-medium text-xs`}
                    style={{ minHeight: 90 }}
                  />
                  {errors.description ? <Text className="text-red-500 text-[10px] mt-1 ml-1 font-bold">{errors.description}</Text> : null}
                </View>
              </View>

              {/* Action Button */}
              <TouchableOpacity
                onPress={handleAnalyzeAndGuide}
                disabled={isLoadingGuidance}
                activeOpacity={0.85}
                className="w-full py-4 bg-[#14532D] rounded-2xl justify-center items-center shadow-xs"
              >
                {isLoadingGuidance ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text className="text-white text-xs font-black uppercase tracking-wider ml-2">
                      Identifying Official Portal...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-white text-xs font-black uppercase tracking-wider">
                    Identify Official Portal & Guidance →
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2: GUIDANCE & DIRECT OFFICIAL PORTAL LAUNCH */}
          {currentStep === 2 && guidance && (
            <View>
              {/* Highlight Card */}
              <View
                style={{
                  shadowColor: '#14532D',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.06,
                  shadowRadius: 16,
                  elevation: 3,
                }}
                className="bg-[#F3F8F4] border border-[#CADDCB] rounded-3xl p-6 mb-5"
              >
                {/* Authority Header & Jurisdiction Level */}
                <View className="flex-row items-center gap-2 mb-3 flex-wrap">
                  <View
                    className={`px-3.5 py-1.5 rounded-xl self-start ${
                      guidance.isDistrictSpecific
                        ? 'bg-[#ECFDF5] border border-[#A7F3D0]'
                        : 'bg-[#FFF7ED] border border-[#FED7AA]'
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-black uppercase tracking-wider ${
                        guidance.isDistrictSpecific ? 'text-[#10B981]' : 'text-[#D97706]'
                      }`}
                    >
                      {guidance.isDistrictSpecific
                        ? `📍 Verified District Authority (${district || 'Local'})`
                        : (guidance.jurisdictionLevel || 'Verified State Alternative')}
                    </Text>
                  </View>
                </View>

                <Text className="text-lg font-black text-[#14532D] leading-snug mb-1">
                  {guidance.authorityName}
                </Text>

                <View className="bg-[#EDF5EE] p-3.5 rounded-2xl border border-[#CADDCB] my-3">
                  <Text className="text-[10px] font-black text-[#4B6350] uppercase tracking-widest mb-1">
                    Recommended Official Portal:
                  </Text>
                  <Text className="text-sm font-black text-[#14532D]">
                    {guidance.portalName}
                  </Text>
                  <Text className="text-[11px] text-[#0284C7] font-bold mt-1">
                    Official URL: {guidance.portalUrl}
                  </Text>
                </View>

                {/* Why Appropriate */}
                <View className="mb-4">
                  <Text className="text-xs font-black text-[#14532D] mb-1">
                    Why this portal is appropriate:
                  </Text>
                  <Text className="text-xs text-slate-600 leading-relaxed font-medium">
                    {guidance.whyAppropriate}
                  </Text>
                </View>

                {/* Official Timeline Banner */}
                <View className="bg-[#FFFBEB] border border-[#FDE68A] p-3.5 rounded-2xl mb-4">
                  <View className="flex-row items-center mb-1">
                    <Text className="text-base mr-2">⏱️</Text>
                    <Text className="text-xs font-black text-amber-900">
                      Published Official Timeline: {guidance.expectedTimelineDays} Days
                    </Text>
                  </View>
                  <Text className="text-[11px] text-amber-800 font-medium leading-relaxed">
                    {guidance.officialTimelineNotice}
                  </Text>
                </View>

                {/* Official Helpline */}
                {guidance.helpline ? (
                  <View className="bg-[#EEF2FF] border border-[#C7D2FE] p-3 rounded-2xl mb-4 flex-row items-center">
                    <Text className="text-base mr-2.5">📞</Text>
                    <View className="flex-1">
                      <Text className="text-[10px] font-bold text-[#6366F1] uppercase tracking-wider">
                        Official Government Helpline
                      </Text>
                      <Text className="text-xs font-black text-[#4338CA]">
                        {guidance.helpline}
                      </Text>
                    </View>
                  </View>
                ) : null}

                {/* Filing Steps */}
                <View className="mb-2">
                  <Text className="text-xs font-black text-[#14532D] mb-2">
                    Official Filing Instructions:
                  </Text>
                  {guidance.filingInstructions.map((step, idx) => (
                    <Text key={idx} className="text-[11px] text-slate-600 mb-1.5 leading-relaxed font-medium">
                      {step}
                    </Text>
                  ))}
                </View>
              </View>

              {/* Available Verified Alternative Option (if present) */}
              {guidance.alternative && (
                <View
                  style={{
                    shadowColor: '#14532D',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.04,
                    shadowRadius: 10,
                    elevation: 2,
                  }}
                  className="bg-[#FAF8F5] border border-[#CADDCB] rounded-3xl p-5 mb-5"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="bg-[#EEF2FF] border border-[#C7D2FE] px-2.5 py-1 rounded-xl">
                      <Text className="text-[9.5px] font-black text-[#4338CA] uppercase tracking-wide">
                        Alternative Official Option
                      </Text>
                    </View>
                    <Text className="text-[10px] font-bold text-slate-500">
                      ⏱️ {guidance.alternative.expectedTimelineDays} Days
                    </Text>
                  </View>

                  <Text className="text-sm font-black text-[#14532D]">
                    {guidance.alternative.authorityName}
                  </Text>
                  <Text className="text-xs font-bold text-slate-700 mt-0.5">
                    {guidance.alternative.portalName}
                  </Text>
                  <Text className="text-[11px] text-slate-600 font-medium mt-1.5 leading-snug">
                    {guidance.alternative.whyAppropriate}
                  </Text>

                  <View className="flex-row items-center justify-between mt-3.5 pt-3 border-t border-[#CADDCB]">
                    <Text className="text-[10.5px] font-bold text-[#4338CA]">
                      📞 {guidance.alternative.helpline}
                    </Text>
                    <TouchableOpacity
                      onPress={() => openExternalUrl(guidance.alternative!.portalUrl)}
                      className="px-3.5 py-1.5 bg-[#14532D] rounded-xl"
                      activeOpacity={0.8}
                    >
                      <Text className="text-[10px] font-black text-white uppercase">Open Alternative ↗</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Big Continue to Official Portal Button */}
              <TouchableOpacity
                onPress={() => openExternalUrl(guidance.portalUrl)}
                activeOpacity={0.85}
                className="w-full py-4 bg-[#14532D] rounded-2xl justify-center items-center shadow-xs mb-3 flex-row"
              >
                <Text className="text-white text-xs font-black uppercase tracking-wider mr-2">
                  Continue to Official Government Portal
                </Text>
                <Text className="text-white text-sm">➔</Text>
              </TouchableOpacity>

              {/* Proceed to Record Token */}
              <TouchableOpacity
                onPress={handleProceedToSaveRef}
                activeOpacity={0.75}
                className="w-full py-3.5 border border-[#14532D] bg-[#EDF5EE] rounded-2xl justify-center items-center"
              >
                <Text className="text-[#14532D] text-xs font-black uppercase tracking-wider">
                  Submitted? Save Complaint Reference Number →
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 3: SAVE COMPLAINT REFERENCE NUMBER */}
          {currentStep === 3 && (
            <View>
              {/* Notice */}
              <View className="bg-[#EDF5EE] border border-[#CADDCB] p-4 rounded-3xl mb-5">
                <Text className="text-xs font-black text-[#14532D] mb-1">
                  Save Complaint Details for Personal Tracking:
                </Text>
                <Text className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  Enter the official registration / reference number given to you by the government portal. Smart Bharat will calculate your waiting days and alert you when follow-up is due.
                </Text>
              </View>

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
                {/* Reference Number */}
                <View className="mb-4">
                  <Text className="text-xs font-black text-[#14532D] uppercase tracking-wider mb-1.5">
                    Official Complaint / Reference Number *
                  </Text>
                  <TextInput
                    placeholder="e.g. DARPG/E/2026/81920 or BBMP-2026-99120"
                    placeholderTextColor="#94A3B8"
                    value={referenceNumber}
                    onChangeText={(t) => {
                      setReferenceNumber(t.toUpperCase());
                      if (errors.referenceNumber) setErrors({ ...errors, referenceNumber: '' });
                    }}
                    className={`w-full px-4 py-3.5 bg-[#EDF5EE] border ${
                      errors.referenceNumber ? 'border-red-400' : 'border-[#CADDCB]'
                    } rounded-2xl text-slate-900 font-mono font-black text-sm`}
                  />
                  {errors.referenceNumber ? (
                    <Text className="text-red-500 text-[10px] mt-1 ml-1 font-bold">{errors.referenceNumber}</Text>
                  ) : null}
                </View>

                {/* Title */}
                <View className="mb-4">
                  <Text className="text-xs font-black text-[#14532D] uppercase tracking-wider mb-1.5">
                    Complaint Title *
                  </Text>
                  <TextInput
                    placeholder="e.g. Pothole repair on Ring Road"
                    placeholderTextColor="#94A3B8"
                    value={title}
                    onChangeText={setTitle}
                    className="w-full px-4 py-3 bg-[#EDF5EE] border border-[#CADDCB] rounded-2xl text-slate-900 font-bold text-xs"
                  />
                </View>

                {/* Government Portal Name */}
                <View className="mb-4">
                  <Text className="text-xs font-black text-[#14532D] uppercase tracking-wider mb-1.5">
                    Government Portal Name *
                  </Text>
                  <TextInput
                    placeholder="e.g. CPGRAMS / BBMP Sahaaya / CM Helpline"
                    placeholderTextColor="#94A3B8"
                    value={portalName}
                    onChangeText={setPortalName}
                    className="w-full px-4 py-3 bg-[#EDF5EE] border border-[#CADDCB] rounded-2xl text-slate-900 font-bold text-xs"
                  />
                </View>

                {/* Submission Date */}
                <View className="mb-4">
                  <Text className="text-xs font-black text-[#14532D] uppercase tracking-wider mb-1.5">
                    Date of Official Submission (YYYY-MM-DD)
                  </Text>
                  <TextInput
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#94A3B8"
                    value={submissionDate}
                    onChangeText={setSubmissionDate}
                    className="w-full px-4 py-3 bg-[#EDF5EE] border border-[#CADDCB] rounded-2xl text-slate-900 font-mono font-bold text-xs"
                  />
                </View>

                {/* Expected Timeline */}
                <View className="mb-4">
                  <Text className="text-xs font-black text-[#14532D] uppercase tracking-wider mb-1.5">
                    Published Resolution Timeline (Days)
                  </Text>
                  <TextInput
                    placeholder="30"
                    placeholderTextColor="#94A3B8"
                    value={expectedTimelineDays}
                    onChangeText={setExpectedTimelineDays}
                    keyboardType="number-pad"
                    className="w-full px-4 py-3 bg-[#EDF5EE] border border-[#CADDCB] rounded-2xl text-slate-900 font-bold text-xs"
                  />
                </View>

                {/* Initial Personal Notes */}
                <View className="mb-2">
                  <Text className="text-xs font-black text-[#14532D] uppercase tracking-wider mb-1.5">
                    Initial Tracking Note (Optional)
                  </Text>
                  <TextInput
                    placeholder="e.g. Awaiting field inspection report from ward office..."
                    placeholderTextColor="#94A3B8"
                    value={initialNote}
                    onChangeText={setInitialNote}
                    multiline
                    numberOfLines={2}
                    className="w-full px-4 py-3 bg-[#EDF5EE] border border-[#CADDCB] rounded-2xl text-slate-900 font-medium text-xs"
                  />
                </View>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                onPress={handleSaveComplaint}
                disabled={isSaving}
                activeOpacity={0.85}
                className="w-full py-4 bg-[#14532D] rounded-2xl justify-center items-center shadow-xs"
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="text-white text-xs font-black uppercase tracking-wider">
                    Save Complaint & Start Tracking →
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

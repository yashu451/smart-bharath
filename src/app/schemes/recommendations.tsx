import React from 'react';
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
import { useRouter } from 'expo-router';
import { MOCK_SCHEMES_DB, SchemeItem } from '@/constants/mock-schemes';
import { dashboardApi } from '@/services/api';

export default function RecommendedSchemesScreen() {
  const router = useRouter();

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

  const handleApplyNow = (url: string | null | undefined, scheme: SchemeItem) => {
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#E6F0E8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#E6F0E8" />

      {/* Header bar */}
      <View className="px-6 py-4 flex-row items-center border-b border-[#CADDCB] bg-[#EDF5EE]">
        <TouchableOpacity
          onPress={() => router.replace('/home')}
          className="w-11 h-11 rounded-2xl bg-[#E0EDE1] border border-[#CADDCB] justify-center items-center mr-3.5 shadow-xs"
          activeOpacity={0.7}
        >
          <Text className="text-[#14532D] font-black text-lg">←</Text>
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-base font-black text-[#14532D]">Recommended Schemes</Text>
          <Text className="text-[10px] font-bold text-[#4B6350] uppercase tracking-widest mt-0.5">
            AI Matched Government Programs
          </Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        {/* Title Details with Orange Indicator */}
        <View className="mb-5 flex-row items-center">
          <View className="w-1 h-6 rounded-full bg-[#F97316] mr-3" />
          <View>
            <Text className="text-2xl font-black text-[#14532D] tracking-tight">Your Eligible Schemes</Text>
            <Text className="text-xs font-semibold text-slate-500 mt-0.5">
              Verified matches based on your age, state, and occupation
            </Text>
          </View>
        </View>

        {/* List of Matched Scheme Cards */}
        <View className="space-y-4">
          {MOCK_SCHEMES_DB.map((scheme: SchemeItem) => (
            <View
              key={scheme.id}
              style={{
                shadowColor: '#14532D',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.04,
                shadowRadius: 10,
                elevation: 2,
              }}
              className="bg-[#F3F8F4] border border-[#CADDCB] rounded-3xl p-6 mb-4"
            >
              {/* Card top details */}
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1 pr-3">
                  <View className="bg-[#ECFDF5] border border-[#A7F3D0] px-3 py-1 rounded-xl self-start mb-2">
                    <Text className="text-[9px] font-black text-[#10B981] uppercase tracking-wider">
                      {scheme.category}
                    </Text>
                  </View>
                  <Text className="text-base font-black text-[#14532D] leading-snug">
                    {scheme.name}
                  </Text>
                  <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                    {scheme.authority}
                  </Text>
                </View>

                {/* Eligibility Status badge */}
                <View
                  className={`px-3 py-1 rounded-full border ${
                    scheme.status === 'Eligible'
                      ? 'bg-[#ECFDF5] border-[#A7F3D0]'
                      : 'bg-[#FFFBEB] border-[#FDE68A]'
                  }`}
                >
                  <Text
                    className={`text-[9px] font-black uppercase ${
                      scheme.status === 'Eligible' ? 'text-[#10B981]' : 'text-amber-700'
                    }`}
                  >
                    {scheme.status}
                  </Text>
                </View>
              </View>

              {/* Description body */}
              <Text className="text-xs text-slate-600 leading-relaxed mt-2 font-medium">
                {scheme.description}
              </Text>

              {/* Benefits highlight */}
              <View className="bg-[#ECFDF5]/50 border border-[#A7F3D0] p-4 rounded-2xl my-4">
                <Text className="text-[9px] font-black text-[#10B981] uppercase tracking-widest">
                  Key Direct Benefit
                </Text>
                <Text className="text-xs font-black text-[#14532D] mt-0.5">
                  {scheme.benefits}
                </Text>
              </View>

              {/* Action Buttons Section */}
              <View className="space-y-2 mt-2">
                {scheme.hasOnlineApplication && scheme.applicationUrl ? (
                  <View>
                    <TouchableOpacity
                      onPress={() => handleApplyNow(scheme.applicationUrl, scheme)}
                      activeOpacity={0.85}
                      style={{
                        backgroundColor: '#14532D',
                        shadowColor: '#14532D',
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.12,
                        shadowRadius: 8,
                        elevation: 2,
                      }}
                      className="w-full py-3.5 rounded-2xl justify-center items-center flex-row"
                    >
                      <Text className="text-white text-xs font-black uppercase tracking-wider mr-1.5">
                        Apply Now on Official Portal
                      </Text>
                      <Text className="text-white text-sm font-black">↗</Text>
                    </TouchableOpacity>
                    <Text className="text-[10px] font-semibold text-slate-400 text-center mt-1.5">
                      Portal: <Text className="font-bold text-[#14532D]">{scheme.applicationUrl.replace('https://', '').split('/')[0]}</Text> 🇮🇳
                    </Text>
                  </View>
                ) : (
                  <View className="w-full py-2.5 px-3 bg-amber-50 border border-amber-200 rounded-xl flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1 mr-2">
                      <Text className="text-amber-800 text-xs mr-1.5">ℹ</Text>
                      <Text className="text-[11px] font-bold text-amber-900" numberOfLines={1}>
                        Online application link unavailable
                      </Text>
                    </View>
                    <Text className="text-[10px] font-black text-amber-700 uppercase">Offline Only</Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={() => handleViewDetails(scheme.id)}
                  activeOpacity={0.7}
                  className="w-full py-3 border border-[#CADDCB] bg-[#EDF5EE] rounded-2xl justify-center items-center shadow-xs mt-1"
                >
                  <Text className="text-[#14532D] text-xs font-bold uppercase tracking-wider">
                    View Scheme Details & Criteria →
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Retake Questionnaire Link */}
        <TouchableOpacity
          onPress={() => router.push('/schemes/questionnaire' as any)}
          className="mt-6 border border-[#CADDCB] py-4 rounded-2xl justify-center items-center bg-[#EDF5EE] shadow-xs"
          activeOpacity={0.7}
        >
          <Text className="text-[#14532D] font-black text-xs uppercase tracking-wider">
            Re-run Eligibility Questionnaire
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

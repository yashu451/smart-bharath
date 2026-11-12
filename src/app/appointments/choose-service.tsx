import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { DEPARTMENTS_DB } from '@/constants/appointment-departments';

const SERVICES_BY_DEPT: { [key: string]: string[] } = {
  aadhaar: [
    'New Aadhaar Enrolment',
    'Biometric Update (Photo/Fingerprints)',
    'Mobile Number/Email Update',
    'Name/Address/DOB Correction',
  ],
  passport: [
    'New Passport Application',
    'Passport Renewal & Re-issue',
    'Address Change in Passport',
    'Police Verification Appointment',
  ],
  rto: [
    'Permanent Driving Licence Test',
    'Learner\'s Licence Test Slot',
    'Vehicle Registration (RC)',
    'Vehicle Ownership Transfer',
  ],
  revenue: [
    'Income Certificate Request',
    'Caste Certificate Verification',
    'Land Records / Khatauni Copy',
    'Property Registration Registry',
  ],
  municipal: [
    'Birth Certificate Registry',
    'Death Certificate Registry',
    'Property Tax Assessment',
    'Trade Licence Application',
  ],
  electricity: [
    'New Connection Meter Request',
    'Load Change Sanction',
    'Billing Dispute Audit',
    'Meter Replacement Inquiry',
  ],
  water: [
    'New Water Connection Request',
    'Sewage Disposal Approval',
    'Billing Dispute Inquiry',
    'Supply Leakage Redressal',
  ],
  police: [
    'Character Certificate Verification',
    'Tenant Verification Records',
    'Domestic Help Clearance',
    'Event Permission NOC',
  ],
  'social-welfare': [
    'Old Age Pension Application',
    'Disability Card (UDID) Registration',
    'Widow Allowance Scheme Setup',
    'Family Welfare Benefits Audit',
  ],
  agriculture: [
    'Seed Subsidies Allotment',
    'Soil Health Testing Request',
    'Farming Machinery Allocation',
    'Crop Loss Compensation Claim',
  ],
};

export default function ChooseServiceScreen() {
  const router = useRouter();
  const { deptId } = useLocalSearchParams();

  const dept = DEPARTMENTS_DB.find((d) => d.id === deptId) || DEPARTMENTS_DB[0];
  const services = SERVICES_BY_DEPT[dept.id] || SERVICES_BY_DEPT.aadhaar;

  const handleSelectService = (serviceName: string) => {
    router.push({
      pathname: '/appointments/book',
      params: {
        deptId: dept.id,
        service: serviceName,
      },
    } as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#E6F0E8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#E6F0E8" />

      {/* Header bar */}
      <View className="px-6 py-4 flex-row items-center border-b border-[#CADDCB] bg-[#EDF5EE]">
        <View className="max-w-4xl w-full mx-auto flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-12 h-12 rounded-2xl bg-[#E0EDE1] border border-[#CADDCB] justify-center items-center mr-4 shadow-xs"
            activeOpacity={0.7}
          >
            <Text className="text-[#14532D] font-black text-xl">←</Text>
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-black text-[#14532D]">{dept.name}</Text>
            <Text className="text-xs font-bold text-[#4B6350] uppercase tracking-widest mt-0.5">
              Select Appointment Purpose
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 130 }}>
        <View className="max-w-4xl w-full mx-auto">
          {/* Title Details with Orange Indicator */}
          <View className="mb-6 flex-row items-center">
            <View className="w-1.5 h-8 rounded-full bg-[#F97316] mr-3.5" />
            <View>
              <Text className="text-3xl font-black text-[#14532D] tracking-tight">Available Services</Text>
              <Text className="text-base font-medium text-slate-600 mt-1">
                Select the specific service requirement for your office visit
              </Text>
            </View>
          </View>

          {/* Services List */}
          <View className="space-y-4">
            {services.map((serviceName: string, idx: number) => (
              <TouchableOpacity
                key={idx}
                onPress={() => handleSelectService(serviceName)}
                activeOpacity={0.75}
                style={{
                  shadowColor: '#14532D',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.04,
                  shadowRadius: 10,
                  elevation: 2,
                }}
                className="bg-[#F3F8F4] border border-[#CADDCB] p-6 rounded-3xl flex-row items-center justify-between mb-4"
              >
                <View className="flex-1 mr-4">
                  <Text className="text-lg font-black text-[#14532D] leading-snug">
                    {serviceName}
                  </Text>
                  <Text className="text-sm text-slate-600 font-medium mt-1">
                    Slot allocation available • In-person verification
                  </Text>
                </View>

                <View
                  style={{ minHeight: 48 }}
                  className="bg-[#ECFDF5] border border-[#A7F3D0] px-5 py-3 rounded-2xl justify-center items-center"
                >
                  <Text className="text-sm font-black text-[#14532D]">Book Slot →</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

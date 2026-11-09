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
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-11 h-11 rounded-2xl bg-[#E0EDE1] border border-[#CADDCB] justify-center items-center mr-3.5 shadow-xs"
          activeOpacity={0.7}
        >
          <Text className="text-[#14532D] font-black text-lg">←</Text>
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-base font-black text-[#14532D]">{dept.name}</Text>
          <Text className="text-[10px] font-bold text-[#4B6350] uppercase tracking-widest mt-0.5">
            Select Appointment Purpose
          </Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
        {/* Title Details with Orange Indicator */}
        <View className="mb-5 flex-row items-center">
          <View className="w-1 h-6 rounded-full bg-[#F97316] mr-3" />
          <View>
            <Text className="text-2xl font-black text-[#14532D] tracking-tight">Available Services</Text>
            <Text className="text-xs font-semibold text-slate-500 mt-0.5">
              Select the specific service requirement for your office visit
            </Text>
          </View>
        </View>

        {/* Services List */}
        <View className="space-y-3.5">
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
              className="bg-[#F3F8F4] border border-[#CADDCB] p-5 rounded-3xl flex-row items-center justify-between mb-3.5"
            >
              <View className="flex-1 mr-3">
                <Text className="text-sm font-black text-[#14532D] leading-snug">
                  {serviceName}
                </Text>
                <Text className="text-[10px] text-slate-500 font-medium mt-1">
                  Slot allocation available • In-person verification
                </Text>
              </View>

              <View className="bg-[#ECFDF5] border border-[#A7F3D0] px-4 py-2 rounded-xl">
                <Text className="text-xs font-bold text-[#14532D]">Book Slot →</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

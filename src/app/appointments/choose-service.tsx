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
    'New Passport',
    'Passport Renewal',
    'Address Change',
    'Police Verification',
  ],
  rto: [
    'Driving Licence',
    'Learner\'s Licence',
    'Vehicle Registration',
    'RC Transfer',
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

  // Find department details, fallback to Aadhaar
  const dept = DEPARTMENTS_DB.find((d) => d.id === deptId) || DEPARTMENTS_DB[0];
  const services = SERVICES_BY_DEPT[dept.id] || SERVICES_BY_DEPT.aadhaar;

  const handleSelectService = (serviceName: string) => {
    router.push({
      pathname: '/appointments/book',
      params: { 
        deptId: dept.id,
        service: serviceName,
      }
    } as any);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header bar */}
      <View className="px-6 py-4 flex-row items-center border-b border-slate-100 bg-white">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/60 justify-center items-center mr-3"
        >
          <Text className="text-slate-700 font-bold text-lg">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800">Smart Bharat</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
        
        {/* Title Details */}
        <View className="mb-6">
          <View className="flex-row items-center space-x-2.5 mb-2">
            <Text className="text-2xl">{dept.icon}</Text>
            <Text className="text-[10px] font-extrabold text-bharat-accent uppercase tracking-wider">
              {dept.name}
            </Text>
          </View>
          <Text className="text-2xl font-extrabold text-bharat-dark">Choose Service</Text>
          <Text className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">
            Choose the service you require to book an office visit.
          </Text>
        </View>

        {/* Services List */}
        <View className="space-y-4">
          {services.map((service, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => handleSelectService(service)}
              style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 1 }}
              className="bg-white border border-slate-100 p-5 rounded-2xl flex-row items-center justify-between"
            >
              <Text className="text-xs font-bold text-slate-750 flex-1 pr-6 leading-normal">
                {service}
              </Text>
              <Text className="text-slate-350 text-base font-bold">→</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Return Button */}
        <TouchableOpacity
          onPress={() => router.replace('/appointments/select-department' as any)}
          className="mt-6 border border-slate-200 py-3.5 rounded-xl justify-center items-center bg-white"
        >
          <Text className="text-slate-555 font-bold text-xs">Choose Different Department</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

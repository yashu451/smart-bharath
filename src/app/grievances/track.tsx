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
} from 'react-native';
import { useRouter } from 'expo-router';

export default function TrackComplaintScreen() {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState('');
  const [trackingError, setTrackingError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  const handleSearch = () => {
    if (!trackingId.trim()) {
      setTrackingError('Reference ID is required.');
      return;
    }
    
    setIsLoading(true);
    setTrackingError('');
    setShowStatus(false);

    // Simulate database status fetch
    setTimeout(() => {
      setIsLoading(false);
      setShowStatus(true);
    }, 1200);
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
        <Text className="text-lg font-bold text-slate-800">Track Complaint Status</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
          
          <View className="space-y-6 flex-1">
            <View>
              <Text className="text-2xl font-extrabold text-bharat-dark">Track Grievance</Text>
              <Text className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">
                Enter reference code to search updates
              </Text>
            </View>

            {/* Reference ID search form */}
            <View className="flex-row items-end space-x-3.5 mt-2">
              <View className="flex-1 space-y-1">
                <Text className="text-xs font-bold text-slate-500 ml-1">Reference ID</Text>
                <TextInput
                  placeholder="SB-GRV-123456"
                  placeholderTextColor="#94A3B8"
                  value={trackingId}
                  onChangeText={(text) => {
                    setTrackingId(text.toUpperCase());
                    setTrackingError('');
                  }}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[16px] text-slate-800 font-mono font-bold"
                />
              </View>

              <TouchableOpacity
                onPress={handleSearch}
                disabled={isLoading}
                className="py-3 px-6 bg-bharat-navy rounded-[16px] justify-center items-center"
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="text-white text-sm font-bold">Search</Text>
                )}
              </TouchableOpacity>
            </View>

            {trackingError ? (
              <Text className="text-red-500 text-[10px] ml-1 font-semibold">{trackingError}</Text>
            ) : null}

            {/* Status Tracking Results Timeline */}
            {showStatus && (
              <View className="mt-8 pt-6 border-t border-slate-100">
                <Text className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">
                  Resolution Roadmap
                </Text>

                {/* Vertical Timeline Steps */}
                <View className="space-y-6 pl-2">
                  
                  {/* Step 1: Registered */}
                  <View className="flex-row items-start relative">
                    {/* Vertical connecting line */}
                    <View className="absolute left-3.5 top-7 bottom-[-24] w-[2px] bg-emerald-500" />
                    
                    <View className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-500 justify-center items-center mr-4 z-10">
                      <Text className="text-emerald-500 text-[10px] font-bold">✓</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-slate-800">Complaint Registered</Text>
                      <Text className="text-[10px] text-slate-400 font-semibold mt-1">
                        07-Jul-2026 | Logged securely by Citizen
                      </Text>
                    </View>
                  </View>

                  {/* Step 2: Assigned */}
                  <View className="flex-row items-start relative">
                    {/* Vertical connecting line */}
                    <View className="absolute left-3.5 top-7 bottom-[-24] w-[2px] bg-emerald-500" />
                    
                    <View className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-500 justify-center items-center mr-4 z-10">
                      <Text className="text-emerald-500 text-[10px] font-bold">✓</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-slate-800">Assigned to Ward Officer</Text>
                      <Text className="text-[10px] text-slate-400 font-semibold mt-1">
                        07-Jul-2026 | Allocated to Ward Officer Rajesh Pathak (Zone 4)
                      </Text>
                    </View>
                  </View>

                  {/* Step 3: Inspection */}
                  <View className="flex-row items-start relative">
                    {/* Vertical connecting line */}
                    <View className="absolute left-3.5 top-7 bottom-[-24] w-[2px] bg-slate-200" />
                    
                    <View className="w-7 h-7 rounded-full bg-blue-50 border border-bharat-accent justify-center items-center mr-4 z-10">
                      <View className="w-2.5 h-2.5 bg-bharat-accent rounded-full animate-pulse" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-slate-800">Inspection & Field Review</Text>
                      <Text className="text-[10px] text-slate-500 font-bold mt-1">
                        In Progress | Municipal crew dispatch scheduled within 24 hours
                      </Text>
                    </View>
                  </View>

                  {/* Step 4: Closed */}
                  <View className="flex-row items-start">
                    <View className="w-7 h-7 rounded-full bg-slate-50 border border-slate-300 justify-center items-center mr-4 z-10">
                      <Text className="text-slate-400 text-xs font-extrabold">-</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-slate-400">Resolution & Closeout</Text>
                      <Text className="text-[10px] text-slate-400 font-semibold mt-1">
                        Pending inspections closeout approvals
                      </Text>
                    </View>
                  </View>

                </View>
              </View>
            )}

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { GRIEVANCE_CATEGORIES } from '@/constants/grievance-categories';

export default function ReportIssueScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams();

  // Find category detail if passed
  const selectedCat = GRIEVANCE_CATEGORIES.find((c) => c.id === category);

  // Form states
  const [subject, setSubject] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  
  // Interaction states
  const [isLoading, setIsLoading] = useState(false);
  const [complaintId, setComplaintId] = useState('');

  const isFormValid = subject.trim() !== '' && location.trim() !== '' && description.trim() !== '';

  const handleSubmit = () => {
    if (!isFormValid) return;
    setIsLoading(true);

    // Simulate database write
    setTimeout(() => {
      setIsLoading(false);
      // Generate a mock complaint reference code
      const generatedId = `SB-GRV-${Math.floor(100000 + Math.random() * 900000)}`;
      setComplaintId(generatedId);
    }, 1500);
  };

  const handleReturn = () => {
    router.replace('/grievances' as any);
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
        <Text className="text-lg font-bold text-slate-800">
          {complaintId ? 'Complaint Submitted' : 'Report Civic Issue'}
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
          
          {complaintId ? (
            /* Success confirmation screen */
            <View className="flex-1 justify-center items-center py-16">
              <View className="w-20 h-20 bg-emerald-50 border border-emerald-200 rounded-full justify-center items-center mb-6 shadow-sm">
                <Text className="text-emerald-500 text-3xl font-extrabold">✓</Text>
              </View>
              <Text className="text-2xl font-extrabold text-slate-800 text-center">
                Grievance Submitted
              </Text>
              
              <View className="bg-slate-50 border border-slate-200 p-5 rounded-2xl w-full my-6 items-center">
                <Text className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                  Reference Tracking ID
                </Text>
                <Text className="text-xl font-mono font-extrabold text-bharat-navy tracking-widest mt-1.5">
                  {complaintId}
                </Text>
              </View>

              <Text className="text-slate-500 text-sm font-medium text-center leading-relaxed px-4 mb-8">
                Your complaint has been successfully dispatched to the local municipal ward officer. You can monitor the progress using your tracking code.
              </Text>

              <TouchableOpacity
                onPress={handleReturn}
                style={{ shadowColor: '#4A90E2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 }}
                className="w-full py-4 bg-bharat-accent rounded-xl justify-center items-center"
              >
                <Text className="text-white text-base font-bold">Back to Grievances</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Complaint Submission Form */
            <View className="space-y-6 flex-1">
              
              {/* Category indicator */}
              <View>
                <Text className="text-2xl font-extrabold text-bharat-dark">Lodge Complaint</Text>
                {selectedCat ? (
                  <View className="flex-row items-center mt-2.5">
                    <View 
                      style={{ backgroundColor: `${selectedCat.color}15` }}
                      className="px-3 py-1.5 rounded-lg flex-row items-center border border-slate-100"
                    >
                      <Text className="text-xs mr-1">{selectedCat.icon}</Text>
                      <Text className="text-xs font-bold text-slate-700">{selectedCat.title}</Text>
                    </View>
                  </View>
                ) : (
                  <Text className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">
                    Select a category to report
                  </Text>
                )}
              </View>

              {/* Form Input fields */}
              <View className="space-y-5 mt-4">
                
                {/* Subject Field */}
                <View className="space-y-1">
                  <Text className="text-xs font-bold text-slate-500 ml-1">Subject / Issue Title</Text>
                  <TextInput
                    placeholder="Briefly name the public issue"
                    placeholderTextColor="#94A3B8"
                    value={subject}
                    onChangeText={setSubject}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[16px] text-slate-800 font-medium"
                  />
                </View>

                {/* Location Field */}
                <View className="space-y-1">
                  <Text className="text-xs font-bold text-slate-500 ml-1">Locality & Ward Address</Text>
                  <TextInput
                    placeholder="Enter ward sector, landmarks, street name"
                    placeholderTextColor="#94A3B8"
                    value={location}
                    onChangeText={setLocation}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[16px] text-slate-800 font-medium"
                  />
                </View>

                {/* Description Field */}
                <View className="space-y-1">
                  <Text className="text-xs font-bold text-slate-500 ml-1">Problem Description</Text>
                  <TextInput
                    placeholder="Provide full description of the issue (e.g. leaking hydrant since 2 days)"
                    placeholderTextColor="#94A3B8"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    style={{ textAlignVertical: 'top' }}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[16px] text-slate-800 font-medium h-28"
                  />
                </View>

              </View>

              {/* Submit button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!isFormValid || isLoading}
                style={{ shadowColor: '#4A90E2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 }}
                className={`w-full py-4 rounded-xl justify-center items-center ${
                  isFormValid ? 'bg-bharat-accent' : 'bg-slate-200'
                }`}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className={`text-base font-bold ${isFormValid ? 'text-white' : 'text-slate-400'}`}>
                    Submit Complaint
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

import React, { useState, useRef } from 'react';
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

export default function VerifyIdentityScreen() {
  const router = useRouter();
  const navTimerRef = useRef<any>(null);
  const [aadhaar, setAadhaar] = useState('');
  const [aadhaarError, setAadhaarError] = useState('');
  const [consent, setConsent] = useState(false);
  
  // State for flow progression
  const [step, setStep] = useState(1); // 1 = Enter Aadhaar, 2 = Enter OTP, 3 = Success
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);

  const handleAadhaarChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setAadhaar(cleaned);
    if (!cleaned) {
      setAadhaarError('Aadhaar number is required.');
    } else if (cleaned.length !== 12) {
      setAadhaarError('Aadhaar must be exactly 12 digits.');
    } else {
      setAadhaarError('');
    }
  };

  const handleSendOtp = () => {
    if (aadhaar.length !== 12 || !consent) return;
    setIsLoading(true);
    
    // Simulate API request delay
    setTimeout(() => {
      setIsLoading(false);
      setStep(2); // Go to OTP step
    }, 1200);
  };

  const handleVerifyOtp = () => {
    if (otp.length !== 6) {
      setOtpError('OTP must be exactly 6 digits.');
      return;
    }
    setIsLoading(true);
    setOtpError('');

    // Simulate OTP verify request delay
    setTimeout(() => {
      setIsLoading(false);
      setStep(3); // Go to Success step
      
      // Auto-navigate to My Documents after showing success
      navTimerRef.current = setTimeout(() => {
        router.replace('/digilocker/documents' as any);
      }, 3000);
    }, 1500);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar barStyle="dark-content" />
      
      {/* Header bar */}
      <View className="px-6 py-4 flex-row items-center border-b border-slate-100 bg-white">
        <TouchableOpacity
          onPress={() => {
            if (step === 2) {
              setStep(1); // Back to Aadhaar input
            } else {
              router.back();
            }
          }}
          className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/60 justify-center items-center mr-3"
        >
          <Text className="text-slate-700 font-bold text-lg">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800">
          {step === 3 ? 'Verification Successful' : 'Verify Identity'}
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 40, justifyContent: 'space-between' }}>
          
          {step === 1 && (
            /* Step 1: Aadhaar Input Form */
            <View className="space-y-6 flex-1">
              <View>
                <Text className="text-2xl font-extrabold text-bharat-dark">Aadhaar e-KYC</Text>
                <Text className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">
                  Step 1 of 2: Enter Aadhaar Details
                </Text>
              </View>

              <Text className="text-slate-500 text-sm font-medium leading-relaxed">
                Provide your 12-digit Aadhaar number to verify your citizen profile. A secure 6-digit OTP will be sent to your Aadhaar-registered mobile number.
              </Text>

              {/* Aadhaar Input Field */}
              <View className="space-y-1 mt-4">
                <Text className="text-xs font-bold text-slate-500 ml-1">Aadhaar Number</Text>
                <TextInput
                  placeholder="0000 0000 0000"
                  placeholderTextColor="#94A3B8"
                  value={aadhaar}
                  onChangeText={handleAadhaarChange}
                  keyboardType="numeric"
                  maxLength={12}
                  className={`w-full px-4 py-3 bg-slate-50 border ${
                    aadhaarError ? 'border-red-400' : 'border-slate-200'
                  } rounded-[16px] text-slate-800 font-medium`}
                />
                {aadhaarError ? (
                  <Text className="text-red-500 text-[10px] ml-1 font-semibold">{aadhaarError}</Text>
                ) : null}
              </View>

              {/* Consent Checkbox */}
              <TouchableOpacity 
                onPress={() => setConsent(!consent)}
                className="flex-row items-start space-x-3 mt-4 ml-1"
              >
                <View className={`w-5 h-5 rounded border ${
                  consent ? 'bg-bharat-accent border-bharat-accent' : 'border-slate-350 bg-white'
                } justify-center items-center mr-2`}
                >
                  {consent && <Text className="text-white text-xs font-bold">✓</Text>}
                </View>
                <Text className="text-xs text-slate-400 font-medium leading-normal flex-1">
                  I hereby give my consent to share my Aadhaar identity details with Smart Bharat for e-KYC document retrieval purposes.
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
            /* Step 2: OTP Verification */
            <View className="space-y-6 flex-1">
              <View>
                <Text className="text-2xl font-extrabold text-bharat-dark">Enter OTP</Text>
                <Text className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">
                  Step 2 of 2: OTP Validation
                </Text>
              </View>

              <Text className="text-slate-500 text-sm font-medium leading-relaxed">
                A 6-digit OTP has been sent to the Aadhaar-registered mobile number ending in <Text className="font-bold text-bharat-dark">••••••99</Text>.
              </Text>

              {/* OTP Input Field */}
              <View className="space-y-1 mt-4">
                <Text className="text-xs font-bold text-slate-500 ml-1">One Time Password (OTP)</Text>
                <TextInput
                  placeholder="Enter 6-digit OTP (e.g. 123456)"
                  placeholderTextColor="#94A3B8"
                  value={otp}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/[^0-9]/g, '');
                    setOtp(cleaned);
                    setOtpError('');
                  }}
                  keyboardType="numeric"
                  maxLength={6}
                  className={`w-full px-4 py-3 bg-slate-50 border ${
                    otpError ? 'border-red-400' : 'border-slate-200'
                  } rounded-[16px] text-slate-800 font-medium`}
                />
                {otpError ? (
                  <Text className="text-red-500 text-[10px] ml-1 font-semibold">{otpError}</Text>
                ) : null}
              </View>

              <View className="flex-row justify-between items-center py-2 px-1">
                <Text className="text-xs text-slate-400 font-medium">Didn't receive code?</Text>
                <TouchableOpacity>
                  <Text className="text-xs font-bold text-bharat-accent">Resend OTP</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {step === 3 && (
            /* Step 3: Success Screen */
            <View className="flex-1 justify-center items-center py-12">
              <View className="w-20 h-20 bg-emerald-50 border border-emerald-255 rounded-full justify-center items-center mb-6 shadow-sm">
                <Text className="text-emerald-500 text-3xl font-extrabold">✓</Text>
              </View>
              <Text className="text-2xl font-extrabold text-slate-800 text-center">
                e-KYC Verified Successfully
              </Text>
              <Text className="text-slate-500 text-sm font-medium text-center mt-3 leading-relaxed px-4">
                Your citizen profile is authenticated. Your DigiLocker is now active and linked to Smart Bharat.
              </Text>
              <Text className="text-[11px] text-slate-400 font-semibold mt-8 mb-6">
                Redirecting to My Documents...
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (navTimerRef.current) clearTimeout(navTimerRef.current);
                  router.replace('/digilocker/documents' as any);
                }}
                style={{ shadowColor: '#4A90E2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 }}
                className="w-full py-4 bg-bharat-accent rounded-xl justify-center items-center"
              >
                <Text className="text-white text-base font-bold">Continue</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Action Button Area */}
          {step !== 3 && (
            <View className="mt-8">
              {step === 1 ? (
                <TouchableOpacity
                  onPress={handleSendOtp}
                  disabled={aadhaar.length !== 12 || !consent || isLoading}
                  style={{ shadowColor: '#4A90E2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 }}
                  className={`w-full py-4 rounded-xl justify-center items-center ${
                    aadhaar.length === 12 && consent ? 'bg-bharat-accent' : 'bg-slate-200'
                  }`}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text className={`text-base font-bold ${
                      aadhaar.length === 12 && consent ? 'text-white' : 'text-slate-400'
                    }`}>
                      Verify Aadhaar
                    </Text>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleVerifyOtp}
                  disabled={otp.length !== 6 || isLoading}
                  style={{ shadowColor: '#4A90E2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 }}
                  className={`w-full py-4 rounded-xl justify-center items-center ${
                    otp.length === 6 ? 'bg-bharat-accent' : 'bg-slate-200'
                  }`}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text className={`text-base font-bold ${
                      otp.length === 6 ? 'text-white' : 'text-slate-400'
                    }`}>
                      Verify OTP
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

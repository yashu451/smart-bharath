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
import { authApi } from '@/services/api';
import { saveAuthData } from '@/services/storage';

export default function AuthScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [pinError, setPinError] = useState('');

  // Handle Aadhaar / Mobile number input without blocking typing or premature validation
  const handleIdentifierChange = (text: string) => {
    const cleanText = text.replace(/[^0-9]/g, '').slice(0, 12);
    setIdentifier(cleanText);
    if (validationError) {
      setValidationError('');
    }
  };

  // Handle Secure PIN input without blocking typing
  const handlePinChange = (text: string) => {
    const cleanText = text.replace(/[^0-9]/g, '').slice(0, 6);
    setPin(cleanText);
    if (pinError) {
      setPinError('');
    }
  };

  // Perform validation only when user submits the form
  const handleLogin = () => {
    let hasError = false;

    // Validate Identifier
    const cleanId = identifier.trim();
    if (!cleanId) {
      setValidationError('Please enter your Aadhaar or Mobile number.');
      hasError = true;
    } else if (cleanId.length !== 10 && cleanId.length !== 12) {
      setValidationError('Enter a valid 10-digit mobile number or 12-digit Aadhaar number.');
      hasError = true;
    } else {
      setValidationError('');
    }

    // Validate PIN
    const cleanPin = pin.trim();
    if (!cleanPin) {
      setPinError('Please enter your 6-digit Secure PIN.');
      hasError = true;
    } else if (cleanPin.length !== 6) {
      setPinError('PIN must be exactly 6 digits.');
      hasError = true;
    } else {
      setPinError('');
    }

    if (hasError) return;

    setIsLoading(true);
    setValidationError('');
    setPinError('');

    authApi
      .login(cleanId, cleanPin)
      .then((response) => {
        setIsLoading(false);
        if (response.success && response.token) {
          saveAuthData(response.token, response.user);
          router.replace('/home');
        } else {
          setValidationError(response.message || 'Login failed. Please verify credentials.');
        }
      })
      .catch((error: any) => {
        setIsLoading(false);
        const errorMsg = error.message || 'Authentication error. Please check your connection.';
        if (errorMsg.toLowerCase().includes('pin') || errorMsg.toLowerCase().includes('password')) {
          setPinError(errorMsg);
        } else {
          setValidationError(errorMsg);
        }
      });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#E6F0E8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#E6F0E8" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingVertical: 36,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Main Elevated Card with Soft Sage-Cream & Forest Green Aesthetics */}
          <View
            style={{
              shadowColor: '#14532D',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.08,
              shadowRadius: 24,
              elevation: 4,
            }}
            className="w-full max-w-md bg-[#F3F8F4] border border-[#CADDCB] rounded-3xl p-8 my-auto relative"
          >
            {/* Back to Public Landing Page Button */}
            <TouchableOpacity
              onPress={() => router.replace('/')}
              className="absolute top-5 left-5 w-9 h-9 rounded-xl bg-[#E0EDE1] border border-[#CADDCB] justify-center items-center z-10"
              activeOpacity={0.7}
              accessibilityLabel="Back to Home"
            >
              <Text className="text-[#14532D] font-black text-sm">←</Text>
            </TouchableOpacity>

            {/* National Gateway Header Badge */}
            <View className="items-center mb-6">
              <View className="px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/60 mb-4 flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-[#F97316] mr-2" />
                <Text className="text-[10px] font-extrabold text-[#F97316] uppercase tracking-widest">
                  National Citizen Gateway
                </Text>
              </View>

              {/* National Emblem Icon in Deep Forest Green */}
              <View className="w-16 h-16 rounded-2xl bg-[#14532D] justify-center items-center shadow-md relative mb-3.5">
                <Text className="text-2xl">🏛️</Text>
                <View className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F59E0B] border-2 border-white" />
              </View>

              <Text className="text-2xl font-black text-[#14532D] tracking-tight">
                Smart Bharat <Text className="text-xl">🇮🇳</Text>
              </Text>
              <Text className="text-xs font-semibold text-slate-500 mt-1 text-center">
                Unified Portal for Citizen Welfare & Public Services
              </Text>
            </View>

            {/* Input Form Fields */}
            <View className="space-y-4 mb-6">
              {/* Identifier Input */}
              <View className="mb-4">
                <Text className="text-xs font-bold text-slate-700 mb-1.5 ml-0.5">
                  Aadhaar or Registered Mobile
                </Text>
                <TextInput
                  placeholder="10-digit mobile or 12-digit Aadhaar"
                  placeholderTextColor="#94A3B8"
                  value={identifier}
                  onChangeText={handleIdentifierChange}
                  keyboardType="number-pad"
                  inputMode="numeric"
                  maxLength={12}
                  autoCapitalize="none"
                  autoCorrect={false}
                  className={`w-full px-4 py-3.5 bg-[#EDF5EE] border ${
                    validationError ? 'border-red-400 bg-red-50/20' : 'border-[#CADDCB]'
                  } rounded-2xl text-slate-900 font-semibold text-sm`}
                />
                {validationError ? (
                  <Text className="text-red-500 text-[11px] mt-1.5 ml-1 font-semibold">
                    {validationError}
                  </Text>
                ) : null}
              </View>

              {/* PIN Input */}
              <View className="mb-2">
                <View className="flex-row justify-between items-center mb-1.5">
                  <Text className="text-xs font-bold text-slate-700 ml-0.5">
                    Secure PIN / Password
                  </Text>
                  <TouchableOpacity activeOpacity={0.7}>
                    <Text className="text-xs font-bold text-[#14532D]">Forgot PIN?</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  placeholder="Enter 6-digit Secure PIN"
                  placeholderTextColor="#94A3B8"
                  value={pin}
                  onChangeText={handlePinChange}
                  secureTextEntry
                  keyboardType="number-pad"
                  inputMode="numeric"
                  maxLength={6}
                  autoCapitalize="none"
                  autoCorrect={false}
                  className={`w-full px-4 py-3.5 bg-[#EDF5EE] border ${
                    pinError ? 'border-red-400 bg-red-50/20' : 'border-[#CADDCB]'
                  } rounded-2xl text-slate-900 font-semibold text-sm`}
                />
                {pinError ? (
                  <Text className="text-red-500 text-[11px] mt-1.5 ml-1 font-semibold">
                    {pinError}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Action Buttons */}
            <View className="space-y-3">
              <TouchableOpacity
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.85}
                className={`w-full py-4 rounded-2xl justify-center items-center ${
                  isLoading ? 'bg-slate-300' : 'bg-[#14532D]'
                } shadow-sm`}
              >
                {isLoading ? (
                  <View className="flex-row items-center space-x-2">
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text className="text-sm font-bold text-white ml-2">Authenticating...</Text>
                  </View>
                ) : (
                  <Text className="text-sm font-bold text-white uppercase tracking-wider">
                    Sign In Securely →
                  </Text>
                )}
              </TouchableOpacity>

              <View className="flex-row justify-center items-center pt-3">
                <Text className="text-xs text-slate-500 font-medium">Don't have an account?</Text>
                <TouchableOpacity onPress={() => router.push('/register' as any)} className="ml-1.5">
                  <Text className="text-xs font-black text-[#F97316]">Register as Citizen</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Official Footer Text */}
          <Text className="text-[11px] text-slate-400 font-medium text-center mt-6">
            Digital India Initiative • Ministry of Electronics & IT
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

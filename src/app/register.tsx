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

export default function RegisterScreen() {
  const router = useRouter();

  // Form Field States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Validation Error States
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Password Visibility States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loading State
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Clean input handlers that do not block typing or show premature errors
  const handleNameChange = (text: string) => {
    setName(text);
    if (nameError) setNameError('');
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) setEmailError('');
    if (submitError) setSubmitError('');
  };

  const handleMobileChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 10);
    setMobile(cleaned);
    if (mobileError) setMobileError('');
    if (submitError) setSubmitError('');
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) setPasswordError('');
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (confirmPasswordError) setConfirmPasswordError('');
  };

  const handleRegister = () => {
    let hasError = false;

    if (!name.trim()) {
      setNameError('Full name cannot be empty.');
      hasError = true;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email address is required.');
      hasError = true;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address.');
      hasError = true;
    }

    if (!mobile.trim()) {
      setMobileError('Mobile number is required.');
      hasError = true;
    } else if (mobile.length !== 10) {
      setMobileError('Mobile number must be exactly 10 digits.');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Secure PIN/Password is required.');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('Password/PIN must be at least 6 characters.');
      hasError = true;
    }

    if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match.');
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);
    setSubmitError('');

    authApi
      .register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        mobile: mobile.trim(),
        password,
        pin: password.length === 6 && /^\d+$/.test(password) ? password : undefined,
      })
      .then((response) => {
        setIsLoading(false);
        if (response.success && response.token) {
          saveAuthData(response.token, response.user);
          setIsSuccess(true);
          setTimeout(() => {
            router.replace('/home');
          }, 1200);
        } else {
          setSubmitError(response.message || 'Registration failed. Please try again.');
        }
      })
      .catch((error: any) => {
        setIsLoading(false);
        setSubmitError(error.message || 'Registration failed. Please try again.');
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
            paddingVertical: 32,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Main Elevated Card with Soft Sage-Cream Surfaces */}
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

            {/* Top Emblem & Header */}
            <View className="items-center mb-6">
              <View className="px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/60 mb-3 flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-[#F97316] mr-2" />
                <Text className="text-[10px] font-extrabold text-[#F97316] uppercase tracking-widest">
                  Citizen Enrollment
                </Text>
              </View>

              {/* National Emblem in Forest Green */}
              <View className="w-16 h-16 rounded-2xl bg-[#14532D] justify-center items-center shadow-md relative mb-3">
                <Text className="text-2xl">🏛️</Text>
                <View className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F59E0B] border-2 border-white" />
              </View>

              <Text className="text-2xl font-black text-[#14532D] tracking-tight">
                Create Citizen Account <Text className="text-xl">🇮🇳</Text>
              </Text>
              <Text className="text-xs font-semibold text-slate-500 mt-1 text-center">
                Access welfare schemes, certificates and public appointments
              </Text>
            </View>

            {/* Success State Overlay */}
            {isSuccess ? (
              <View className="py-12 items-center">
                <View className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full justify-center items-center mb-4">
                  <Text className="text-[#10B981] text-2xl font-bold">✓</Text>
                </View>
                <Text className="text-lg font-black text-[#14532D]">Account Verified & Created!</Text>
                <Text className="text-xs text-slate-500 mt-1">Directing to citizen dashboard...</Text>
              </View>
            ) : (
              /* Registration Form */
              <View className="space-y-3.5 mb-5">
                {submitError ? (
                  <View className="p-3 bg-red-50 border border-red-200 rounded-2xl mb-2">
                    <Text className="text-red-600 text-xs font-bold text-center">
                      {submitError}
                    </Text>
                  </View>
                ) : null}

                {/* Full Name */}
                <View className="mb-3">
                  <Text className="text-xs font-bold text-slate-700 mb-1 ml-0.5">Full Name (as per ID)</Text>
                  <TextInput
                    placeholder="Enter full name"
                    placeholderTextColor="#94A3B8"
                    value={name}
                    onChangeText={handleNameChange}
                    className={`w-full px-4 py-3 bg-[#EDF5EE] border ${
                      nameError ? 'border-red-400 bg-red-50/20' : 'border-[#CADDCB]'
                    } rounded-2xl text-slate-900 font-semibold text-sm`}
                  />
                  {nameError ? (
                    <Text className="text-red-500 text-[11px] mt-1 ml-1 font-semibold">{nameError}</Text>
                  ) : null}
                </View>

                {/* Email Address */}
                <View className="mb-3">
                  <Text className="text-xs font-bold text-slate-700 mb-1 ml-0.5">Email Address</Text>
                  <TextInput
                    placeholder="name@example.com"
                    placeholderTextColor="#94A3B8"
                    value={email}
                    onChangeText={handleEmailChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className={`w-full px-4 py-3 bg-[#EDF5EE] border ${
                      emailError ? 'border-red-400 bg-red-50/20' : 'border-[#CADDCB]'
                    } rounded-2xl text-slate-900 font-semibold text-sm`}
                  />
                  {emailError ? (
                    <Text className="text-red-500 text-[11px] mt-1 ml-1 font-semibold">{emailError}</Text>
                  ) : null}
                </View>

                {/* Mobile Number */}
                <View className="mb-3">
                  <Text className="text-xs font-bold text-slate-700 mb-1 ml-0.5">10-Digit Mobile Number</Text>
                  <TextInput
                    placeholder="Enter mobile number"
                    placeholderTextColor="#94A3B8"
                    value={mobile}
                    onChangeText={handleMobileChange}
                    keyboardType="number-pad"
                    inputMode="numeric"
                    maxLength={10}
                    className={`w-full px-4 py-3 bg-[#EDF5EE] border ${
                      mobileError ? 'border-red-400 bg-red-50/20' : 'border-[#CADDCB]'
                    } rounded-2xl text-slate-900 font-semibold text-sm`}
                  />
                  {mobileError ? (
                    <Text className="text-red-500 text-[11px] mt-1 ml-1 font-semibold">{mobileError}</Text>
                  ) : null}
                </View>

                {/* Secure Password / PIN */}
                <View className="mb-3">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-xs font-bold text-slate-700 ml-0.5">Create Secure PIN / Password</Text>
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Text className="text-xs font-bold text-[#14532D]">
                        {showPassword ? 'Hide' : 'Show'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    placeholder="Min 6 digits or characters"
                    placeholderTextColor="#94A3B8"
                    value={password}
                    onChangeText={handlePasswordChange}
                    secureTextEntry={!showPassword}
                    className={`w-full px-4 py-3 bg-[#EDF5EE] border ${
                      passwordError ? 'border-red-400 bg-red-50/20' : 'border-[#CADDCB]'
                    } rounded-2xl text-slate-900 font-semibold text-sm`}
                  />
                  {passwordError ? (
                    <Text className="text-red-500 text-[11px] mt-1 ml-1 font-semibold">{passwordError}</Text>
                  ) : null}
                </View>

                {/* Confirm Password */}
                <View className="mb-4">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-xs font-bold text-slate-700 ml-0.5">Confirm PIN / Password</Text>
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                      <Text className="text-xs font-bold text-[#14532D]">
                        {showConfirmPassword ? 'Hide' : 'Show'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    placeholder="Re-enter password"
                    placeholderTextColor="#94A3B8"
                    value={confirmPassword}
                    onChangeText={handleConfirmPasswordChange}
                    secureTextEntry={!showConfirmPassword}
                    className={`w-full px-4 py-3 bg-[#EDF5EE] border ${
                      confirmPasswordError ? 'border-red-400 bg-red-50/20' : 'border-[#CADDCB]'
                    } rounded-2xl text-slate-900 font-semibold text-sm`}
                  />
                  {confirmPasswordError ? (
                    <Text className="text-red-500 text-[11px] mt-1 ml-1 font-semibold">{confirmPasswordError}</Text>
                  ) : null}
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleRegister}
                  disabled={isLoading}
                  activeOpacity={0.85}
                  className={`w-full py-4 rounded-2xl justify-center items-center ${
                    isLoading ? 'bg-slate-300' : 'bg-[#14532D]'
                  } shadow-sm`}
                >
                  {isLoading ? (
                    <View className="flex-row items-center space-x-2">
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text className="text-sm font-bold text-white ml-2">Enrolling Citizen...</Text>
                    </View>
                  ) : (
                    <Text className="text-sm font-bold text-white uppercase tracking-wider">
                      Create Account →
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Return to Login */}
                <View className="flex-row justify-center items-center pt-3">
                  <Text className="text-xs text-slate-500 font-medium">Already registered?</Text>
                  <TouchableOpacity onPress={() => router.push('/auth' as any)} className="ml-1.5">
                    <Text className="text-xs font-black text-[#F97316]">Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Official Footer */}
          <Text className="text-[11px] text-slate-400 font-medium text-center mt-6">
            Digital India Initiative • Ministry of Electronics & IT
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

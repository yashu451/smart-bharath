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

  // Field validation functions
  const validateName = (text: string) => {
    setName(text);
    if (!text.trim()) {
      setNameError('Full name cannot be empty.');
    } else {
      setNameError('');
    }
  };

  const validateEmail = (text: string) => {
    setEmail(text);
    setSubmitError('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!text.trim()) {
      setEmailError('Email address is required.');
    } else if (!emailRegex.test(text)) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError('');
    }
  };

  const validateMobile = (text: string) => {
    // Only allow digits
    const cleaned = text.replace(/[^0-9]/g, '');
    setMobile(cleaned);
    setSubmitError('');
    if (!cleaned) {
      setMobileError('Mobile number is required.');
    } else if (cleaned.length !== 10) {
      setMobileError('Mobile number must be exactly 10 digits.');
    } else {
      setMobileError('');
    }
  };

  const validatePassword = (text: string) => {
    setPassword(text);
    if (!text) {
      setPasswordError('Password is required.');
      return;
    }
    
    const hasUpper = /[A-Z]/.test(text);
    const hasLower = /[a-z]/.test(text);
    const hasNumber = /\d/.test(text);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(text);
    const hasMinLength = text.length >= 8;

    if (!hasMinLength) {
      setPasswordError('Password must be at least 8 characters long.');
    } else if (!hasUpper) {
      setPasswordError('Include at least one uppercase letter.');
    } else if (!hasLower) {
      setPasswordError('Include at least one lowercase letter.');
    } else if (!hasNumber) {
      setPasswordError('Include at least one number.');
    } else if (!hasSpecial) {
      setPasswordError('Include at least one special character.');
    } else {
      setPasswordError('');
    }

    // Re-validate confirmation password matching
    if (confirmPassword && text !== confirmPassword) {
      setConfirmPasswordError('Confirm password does not match.');
    } else if (confirmPassword && text === confirmPassword) {
      setConfirmPasswordError('');
    }
  };

  const validateConfirmPassword = (text: string) => {
    setConfirmPassword(text);
    if (!text) {
      setConfirmPasswordError('Please confirm your password.');
    } else if (text !== password) {
      setConfirmPasswordError('Confirm password does not match.');
    } else {
      setConfirmPasswordError('');
    }
  };

  // Check if form is fully valid
  const isFormValid =
    name.trim() !== '' &&
    email.trim() !== '' &&
    mobile.length === 10 &&
    password.length >= 8 &&
    confirmPassword === password &&
    !nameError &&
    !emailError &&
    !mobileError &&
    !passwordError &&
    !confirmPasswordError;

  const handleRegister = () => {
    if (!isFormValid) return;
    setIsLoading(true);
    setSubmitError('');

    // Simulated registration submit delay
    setTimeout(() => {
      // Mock database of already existing test accounts
      const mockExistingEmails = ['existing@gmail.com', 'admin@bharat.gov.in', 'test@gmail.com'];
      const mockExistingMobiles = ['9999999999', '9876543210'];

      if (
        mockExistingEmails.includes(email.trim().toLowerCase()) ||
        mockExistingMobiles.includes(mobile.trim())
      ) {
        setIsLoading(false);
        setSubmitError('Account already exists. Please login.');
      } else {
        setIsLoading(false);
        setIsSuccess(true);
        // Auto-login: Redirect directly to the Home Dashboard
        setTimeout(() => {
          router.replace('/home');
        }, 1500);
      }
    }, 1500);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Header */}
          <View className="items-center mt-4">
            <View className="w-12 h-12 rounded-xl bg-bharat-navy justify-center items-center rotate-45 shadow-sm shadow-bharat-navy/10">
              <View className="w-3.5 h-3.5 rounded-full bg-bharat-accent -rotate-45" />
            </View>
            <Text className="text-2xl font-extrabold text-bharat-dark mt-4 tracking-tight">
              Smart Bharat
            </Text>
            <Text className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-widest">
              Create your Smart Bharat Account
            </Text>
          </View>

          {/* Success State Overlay */}
          {isSuccess ? (
            <View className="flex-1 justify-center items-center py-20">
              <View className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full justify-center items-center mb-4">
                <Text className="text-emerald-500 text-2xl font-bold">✓</Text>
              </View>
              <Text className="text-xl font-bold text-slate-800">Account Created!</Text>
              <Text className="text-sm text-slate-400 mt-1">Logging you in and redirecting...</Text>
            </View>
          ) : (
            /* Registration Form */
            <View className="mt-8 space-y-5">
              
              {/* Form level error message */}
              {submitError ? (
                <View className="p-3.5 bg-red-50 border border-red-100 rounded-2xl">
                  <Text className="text-red-500 text-xs font-bold text-center">
                    {submitError}
                  </Text>
                </View>
              ) : null}
              
              {/* Full Name */}
              <View className="space-y-1">
                <Text className="text-xs font-bold text-slate-500 ml-1">Full Name</Text>
                <TextInput
                  placeholder="Enter your full name"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={validateName}
                  className={`w-full px-4 py-3 bg-slate-50 border ${
                    nameError ? 'border-red-400' : 'border-slate-200'
                  } rounded-[16px] text-slate-800 font-medium`}
                />
                {nameError ? (
                  <Text className="text-red-500 text-[10px] ml-1 font-semibold">{nameError}</Text>
                ) : null}
              </View>

              {/* Email Address */}
              <View className="space-y-1">
                <Text className="text-xs font-bold text-slate-500 ml-1">Email Address</Text>
                <TextInput
                  placeholder="example@gmail.com"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={validateEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className={`w-full px-4 py-3 bg-slate-50 border ${
                    emailError ? 'border-red-400' : 'border-slate-200'
                  } rounded-[16px] text-slate-800 font-medium`}
                />
                {emailError ? (
                  <Text className="text-red-500 text-[10px] ml-1 font-semibold">{emailError}</Text>
                ) : null}
              </View>

              {/* Mobile Number */}
              <View className="space-y-1">
                <Text className="text-xs font-bold text-slate-500 ml-1">Mobile Number</Text>
                <TextInput
                  placeholder="Enter 10-digit mobile number"
                  placeholderTextColor="#94A3B8"
                  value={mobile}
                  onChangeText={validateMobile}
                  keyboardType="numeric"
                  maxLength={10}
                  className={`w-full px-4 py-3 bg-slate-50 border ${
                    mobileError ? 'border-red-400' : 'border-slate-200'
                  } rounded-[16px] text-slate-800 font-medium`}
                />
                {mobileError ? (
                  <Text className="text-red-500 text-[10px] ml-1 font-semibold">{mobileError}</Text>
                ) : null}
              </View>

              {/* Password */}
              <View className="space-y-1">
                <Text className="text-xs font-bold text-slate-500 ml-1">Password</Text>
                <View className="relative justify-center">
                  <TextInput
                    placeholder="Enter your password"
                    placeholderTextColor="#94A3B8"
                    value={password}
                    onChangeText={validatePassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    className={`w-full pl-4 pr-12 py-3 bg-slate-50 border ${
                      passwordError ? 'border-red-400' : 'border-slate-200'
                    } rounded-[16px] text-slate-800 font-medium`}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-4 px-2 py-1"
                  >
                    <Text className="text-xs font-bold text-bharat-accent">
                      {showPassword ? 'Hide' : 'Show'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {passwordError ? (
                  <Text className="text-red-500 text-[10px] ml-1 font-semibold leading-normal">
                    {passwordError}
                  </Text>
                ) : null}
              </View>

              {/* Confirm Password */}
              <View className="space-y-1">
                <Text className="text-xs font-bold text-slate-500 ml-1">Confirm Password</Text>
                <View className="relative justify-center">
                  <TextInput
                    placeholder="Confirm your password"
                    placeholderTextColor="#94A3B8"
                    value={confirmPassword}
                    onChangeText={validateConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    className={`w-full pl-4 pr-12 py-3 bg-slate-50 border ${
                      confirmPasswordError ? 'border-red-400' : 'border-slate-200'
                    } rounded-[16px] text-slate-800 font-medium`}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 px-2 py-1"
                  >
                    <Text className="text-xs font-bold text-bharat-accent">
                      {showConfirmPassword ? 'Hide' : 'Show'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {confirmPasswordError ? (
                  <Text className="text-red-500 text-[10px] ml-1 font-semibold">
                    {confirmPasswordError}
                  </Text>
                ) : null}
              </View>

              {/* Form Submission Button */}
              <TouchableOpacity
                onPress={handleRegister}
                disabled={!isFormValid || isLoading}
                style={{ shadowColor: '#4A90E2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 }}
                className={`w-full py-3.5 mt-4 rounded-xl justify-center items-center ${
                  isFormValid ? 'bg-bharat-accent' : 'bg-slate-200'
                }`}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className={`text-base font-bold ${isFormValid ? 'text-white' : 'text-slate-400'}`}>
                    Create Account
                  </Text>
                )}
              </TouchableOpacity>

              {/* Secondary Navigation Option */}
              <View className="flex-row justify-center items-center py-4">
                <Text className="text-xs text-slate-400 font-medium">Already have an account?</Text>
                <TouchableOpacity onPress={() => router.replace('/auth')} className="ml-1.5">
                  <Text className="text-xs font-bold text-bharat-accent">Login</Text>
                </TouchableOpacity>
              </View>

            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

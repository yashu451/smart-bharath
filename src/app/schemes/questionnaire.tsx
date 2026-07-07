import React, { useState, useEffect } from 'react';
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

// Dropdown Mock Options
const STATE_DISTRICTS: { [key: string]: string[] } = {
  'Delhi': ['New Delhi', 'Central Delhi', 'South Delhi', 'North Delhi'],
  'Maharashtra': ['Mumbai City', 'Pune', 'Nagpur', 'Thane'],
  'Karnataka': ['Bengaluru Urban', 'Mysuru', 'Hubballi', 'Mangaluru'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'],
  'Uttar Pradesh': ['Lucknow', 'Gautam Buddha Nagar (Noida)', 'Kanpur', 'Varanasi'],
};

const OCCUPATIONS = [
  'Salaried Employee',
  'Self-Employed / Business Owner',
  'Agriculturist / Farmer',
  'Student',
  'Unemployed',
  'Retired / Pensioner',
  'Daily Wage Labourer',
];

const CASTES = ['General', 'OBC', 'SC', 'ST'];

export default function EligibilityQuestionnaireScreen() {
  const router = useRouter();

  // Form Field States
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [occupation, setOccupation] = useState('');
  const [income, setIncome] = useState('');
  const [isStudent, setIsStudent] = useState('');
  const [isFarmer, setIsFarmer] = useState('');
  const [isSenior, setIsSenior] = useState('');
  const [isDisabled, setIsDisabled] = useState('');
  const [caste, setCaste] = useState('');

  // Dropdown visibility states
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showOccupationDropdown, setShowOccupationDropdown] = useState(false);
  const [showCasteDropdown, setShowCasteDropdown] = useState(false);

  // Field Validation Error States
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Reset district if state changes
  useEffect(() => {
    setSelectedDistrict('');
  }, [selectedState]);

  // Calculate questionnaire completion progress based on required fields
  const getProgressPercentage = () => {
    const requiredFields = [
      selectedState !== '',
      selectedDistrict !== '',
      age !== '' && !isNaN(Number(age)) && Number(age) > 0 && Number(age) <= 120,
      gender !== '',
      occupation !== '',
      income !== '' && !isNaN(Number(income)) && Number(income) >= 0,
      isStudent !== '',
      isFarmer !== '',
      isSenior !== '',
    ];
    const filledCount = requiredFields.filter(Boolean).length;
    return Math.round((filledCount / requiredFields.length) * 100);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!selectedState) newErrors.state = 'Please select your State.';
    if (!selectedDistrict) newErrors.district = 'Please select your District.';
    
    if (!age) {
      newErrors.age = 'Age is required.';
    } else {
      const parsedAge = Number(age);
      if (isNaN(parsedAge) || parsedAge <= 0 || parsedAge > 120) {
        newErrors.age = 'Please enter a valid age (1-120).';
      }
    }

    if (!gender) newErrors.gender = 'Please select your Gender.';
    if (!occupation) newErrors.occupation = 'Please select your Occupation.';

    if (!income) {
      newErrors.income = 'Annual family income is required.';
    } else {
      const parsedIncome = Number(income);
      if (isNaN(parsedIncome) || parsedIncome < 0) {
        newErrors.income = 'Please enter a valid income amount.';
      }
    }

    if (!isStudent) newErrors.student = 'Please select student status.';
    if (!isFarmer) newErrors.farmer = 'Please select farmer status.';
    if (!isSenior) newErrors.senior = 'Please select senior citizen status.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFindSchemes = () => {
    if (!validateForm()) return;
    
    // Save selections as query params for AI matching mock
    router.push({
      pathname: '/schemes/processing',
      params: {
        state: selectedState,
        district: selectedDistrict,
        age,
        gender,
        occupation,
        income,
        student: isStudent,
        farmer: isFarmer,
        senior: isSenior,
        disabled: isDisabled,
        caste,
      }
    } as any);
  };

  const progress = getProgressPercentage();

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header bar */}
      <View className="px-6 py-4 flex-row items-center border-b border-slate-100 bg-white">
        <TouchableOpacity
          onPress={() => router.replace('/home')}
          className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/60 justify-center items-center mr-3"
        >
          <Text className="text-slate-700 font-bold text-lg">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800">Smart Bharat</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 50 }}>
          
          {/* Title Segment */}
          <View className="mb-4">
            <Text className="text-2xl font-extrabold text-bharat-dark">Find Government Schemes</Text>
            <Text className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1.5 leading-normal">
              Answer a few questions so AI can recommend the best government schemes for you.
            </Text>
          </View>

          {/* Form Progress indicator */}
          <View className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Profile Completion
              </Text>
              <Text className="text-xs font-bold text-bharat-accent">{progress}%</Text>
            </View>
            <View className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <View style={{ width: `${progress}%` }} className="h-full bg-bharat-accent rounded-full" />
            </View>
          </View>

          {/* Questionnaire Input Fields */}
          <View className="space-y-6">

            {/* State Picker Dropdown */}
            <View className="space-y-1">
              <Text className="text-xs font-bold text-slate-500 ml-1">State *</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowStateDropdown(!showStateDropdown);
                  setShowDistrictDropdown(false);
                  setShowOccupationDropdown(false);
                  setShowCasteDropdown(false);
                }}
                className={`w-full px-4 py-3.5 bg-slate-50 border ${
                  errors.state ? 'border-red-400' : 'border-slate-200'
                } rounded-[16px] flex-row justify-between items-center`}
              >
                <Text className={`font-semibold ${selectedState ? 'text-slate-800' : 'text-slate-400'}`}>
                  {selectedState || 'Select your State'}
                </Text>
                <Text className="text-slate-400 text-xs">{showStateDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              
              {showStateDropdown && (
                <View className="bg-white border border-slate-200 rounded-2xl mt-1 overflow-hidden shadow-md">
                  {Object.keys(STATE_DISTRICTS).map((st) => (
                    <TouchableOpacity
                      key={st}
                      onPress={() => {
                        setSelectedState(st);
                        setShowStateDropdown(false);
                      }}
                      className="px-4 py-3 border-b border-slate-100"
                    >
                      <Text className="font-semibold text-slate-700">{st}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {errors.state ? (
                <Text className="text-red-500 text-[10px] ml-1 font-semibold">{errors.state}</Text>
              ) : null}
            </View>

            {/* District Picker Dropdown */}
            <View className="space-y-1">
              <Text className="text-xs font-bold text-slate-500 ml-1">District *</Text>
              <TouchableOpacity
                onPress={() => {
                  if (!selectedState) return;
                  setShowDistrictDropdown(!showDistrictDropdown);
                  setShowStateDropdown(false);
                  setShowOccupationDropdown(false);
                  setShowCasteDropdown(false);
                }}
                disabled={!selectedState}
                className={`w-full px-4 py-3.5 bg-slate-50 border ${
                  !selectedState ? 'bg-slate-100 border-slate-200/50' : errors.district ? 'border-red-400' : 'border-slate-200'
                } rounded-[16px] flex-row justify-between items-center`}
              >
                <Text className={`font-semibold ${selectedDistrict ? 'text-slate-800' : 'text-slate-400'}`}>
                  {!selectedState ? 'Select State First' : selectedDistrict || 'Select your District'}
                </Text>
                <Text className="text-slate-400 text-xs">{showDistrictDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {showDistrictDropdown && selectedState && (
                <View className="bg-white border border-slate-200 rounded-2xl mt-1 overflow-hidden shadow-md">
                  {STATE_DISTRICTS[selectedState].map((dt) => (
                    <TouchableOpacity
                      key={dt}
                      onPress={() => {
                        setSelectedDistrict(dt);
                        setShowDistrictDropdown(false);
                      }}
                      className="px-4 py-3 border-b border-slate-100"
                    >
                      <Text className="font-semibold text-slate-700">{dt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {errors.district ? (
                <Text className="text-red-500 text-[10px] ml-1 font-semibold">{errors.district}</Text>
              ) : null}
            </View>

            {/* Age Field */}
            <View className="space-y-1">
              <Text className="text-xs font-bold text-slate-500 ml-1">Age *</Text>
              <TextInput
                placeholder="Enter your age"
                placeholderTextColor="#94A3B8"
                value={age}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, '');
                  setAge(cleaned);
                  setErrors((prev) => ({ ...prev, age: '' }));
                }}
                keyboardType="numeric"
                maxLength={3}
                className={`w-full px-4 py-3.5 bg-slate-50 border ${
                  errors.age ? 'border-red-400' : 'border-slate-200'
                } rounded-[16px] text-slate-800 font-semibold`}
              />
              {errors.age ? (
                <Text className="text-red-500 text-[10px] ml-1 font-semibold">{errors.age}</Text>
              ) : null}
            </View>

            {/* Gender Choice Chips */}
            <View className="space-y-1">
              <Text className="text-xs font-bold text-slate-500 ml-1">Gender *</Text>
              <View className="flex-row space-x-3 mt-1 flex-wrap">
                {['Male', 'Female', 'Other'].map((g) => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => {
                      setGender(g);
                      setErrors((prev) => ({ ...prev, gender: '' }));
                    }}
                    className={`px-5 py-2.5 rounded-full border ${
                      gender === g
                        ? 'bg-bharat-accent border-bharat-accent text-white'
                        : 'bg-slate-55/40 border-slate-200'
                    } mr-2`}
                  >
                    <Text className={`font-bold text-xs ${gender === g ? 'text-white' : 'text-slate-600'}`}>
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.gender ? (
                <Text className="text-red-500 text-[10px] ml-1 font-semibold mt-1">{errors.gender}</Text>
              ) : null}
            </View>

            {/* Occupation Picker Dropdown */}
            <View className="space-y-1">
              <Text className="text-xs font-bold text-slate-500 ml-1">Occupation *</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowOccupationDropdown(!showOccupationDropdown);
                  setShowStateDropdown(false);
                  setShowDistrictDropdown(false);
                  setShowCasteDropdown(false);
                }}
                className={`w-full px-4 py-3.5 bg-slate-50 border ${
                  errors.occupation ? 'border-red-400' : 'border-slate-200'
                } rounded-[16px] flex-row justify-between items-center`}
              >
                <Text className={`font-semibold ${occupation ? 'text-slate-800' : 'text-slate-400'}`}>
                  {occupation || 'Select your Occupation'}
                </Text>
                <Text className="text-slate-400 text-xs">{showOccupationDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {showOccupationDropdown && (
                <View className="bg-white border border-slate-200 rounded-2xl mt-1 overflow-hidden shadow-md">
                  {OCCUPATIONS.map((occ) => (
                    <TouchableOpacity
                      key={occ}
                      onPress={() => {
                        setOccupation(occ);
                        setShowOccupationDropdown(false);
                      }}
                      className="px-4 py-3 border-b border-slate-100"
                    >
                      <Text className="font-semibold text-slate-700">{occ}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {errors.occupation ? (
                <Text className="text-red-500 text-[10px] ml-1 font-semibold">{errors.occupation}</Text>
              ) : null}
            </View>

            {/* Annual Income Field */}
            <View className="space-y-1">
              <Text className="text-xs font-bold text-slate-500 ml-1">Annual Family Income (₹) *</Text>
              <TextInput
                placeholder="Enter annual family income in ₹"
                placeholderTextColor="#94A3B8"
                value={income}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, '');
                  setIncome(cleaned);
                  setErrors((prev) => ({ ...prev, income: '' }));
                }}
                keyboardType="numeric"
                className={`w-full px-4 py-3.5 bg-slate-50 border ${
                  errors.income ? 'border-red-400' : 'border-slate-200'
                } rounded-[16px] text-slate-800 font-semibold`}
              />
              {errors.income ? (
                <Text className="text-red-500 text-[10px] ml-1 font-semibold">{errors.income}</Text>
              ) : null}
            </View>

            {/* Demographic Indicators: Student, Farmer, Senior */}
            <View className="space-y-4 border-t border-slate-100 pt-5 mt-4">
              
              {/* Student toggle */}
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-xs font-bold text-slate-650">Are you a Student? *</Text>
                  {errors.student ? (
                    <Text className="text-red-500 text-[9px] font-semibold mt-0.5">{errors.student}</Text>
                  ) : null}
                </View>
                <View className="flex-row">
                  {['Yes', 'No'].map((ans) => (
                    <TouchableOpacity
                      key={`student-${ans}`}
                      onPress={() => {
                        setIsStudent(ans);
                        setErrors((prev) => ({ ...prev, student: '' }));
                      }}
                      className={`px-4 py-1.5 rounded-lg border ${
                        isStudent === ans
                          ? 'bg-bharat-navy border-bharat-navy'
                          : 'bg-white border-slate-200'
                      } ml-2`}
                    >
                      <Text className={`text-xs font-bold ${isStudent === ans ? 'text-white' : 'text-slate-550'}`}>
                        {ans}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Farmer toggle */}
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-xs font-bold text-slate-650">Are you a Farmer? *</Text>
                  {errors.farmer ? (
                    <Text className="text-red-500 text-[9px] font-semibold mt-0.5">{errors.farmer}</Text>
                  ) : null}
                </View>
                <View className="flex-row">
                  {['Yes', 'No'].map((ans) => (
                    <TouchableOpacity
                      key={`farmer-${ans}`}
                      onPress={() => {
                        setIsFarmer(ans);
                        setErrors((prev) => ({ ...prev, farmer: '' }));
                      }}
                      className={`px-4 py-1.5 rounded-lg border ${
                        isFarmer === ans
                          ? 'bg-bharat-navy border-bharat-navy'
                          : 'bg-white border-slate-200'
                      } ml-2`}
                    >
                      <Text className={`text-xs font-bold ${isFarmer === ans ? 'text-white' : 'text-slate-550'}`}>
                        {ans}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Senior Citizen toggle */}
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-xs font-bold text-slate-650">Are you a Senior Citizen? *</Text>
                  {errors.senior ? (
                    <Text className="text-red-500 text-[9px] font-semibold mt-0.5">{errors.senior}</Text>
                  ) : null}
                </View>
                <View className="flex-row">
                  {['Yes', 'No'].map((ans) => (
                    <TouchableOpacity
                      key={`senior-${ans}`}
                      onPress={() => {
                        setIsSenior(ans);
                        setErrors((prev) => ({ ...prev, senior: '' }));
                      }}
                      className={`px-4 py-1.5 rounded-lg border ${
                        isSenior === ans
                          ? 'bg-bharat-navy border-bharat-navy'
                          : 'bg-white border-slate-200'
                      } ml-2`}
                    >
                      <Text className={`text-xs font-bold ${isSenior === ans ? 'text-white' : 'text-slate-550'}`}>
                        {ans}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Person with Disability (Optional) */}
              <View className="flex-row justify-between items-center">
                <Text className="text-xs font-bold text-slate-500">Person with Disability (Optional)</Text>
                <View className="flex-row">
                  {['Yes', 'No'].map((ans) => (
                    <TouchableOpacity
                      key={`disabled-${ans}`}
                      onPress={() => setIsDisabled(ans)}
                      className={`px-4 py-1.5 rounded-lg border ${
                        isDisabled === ans
                          ? 'bg-bharat-navy border-bharat-navy'
                          : 'bg-white border-slate-200'
                      } ml-2`}
                    >
                      <Text className={`text-xs font-bold ${isDisabled === ans ? 'text-white' : 'text-slate-550'}`}>
                        {ans}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Caste Category Picker Dropdown (Optional) */}
            <View className="space-y-1 border-t border-slate-100 pt-5 mt-4">
              <Text className="text-xs font-bold text-slate-500 ml-1">Caste Category (Optional)</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCasteDropdown(!showCasteDropdown);
                  setShowStateDropdown(false);
                  setShowDistrictDropdown(false);
                  setShowOccupationDropdown(false);
                }}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-[16px] flex-row justify-between items-center"
              >
                <Text className={`font-semibold ${caste ? 'text-slate-800' : 'text-slate-400'}`}>
                  {caste || 'Select Category'}
                </Text>
                <Text className="text-slate-400 text-xs">{showCasteDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {showCasteDropdown && (
                <View className="bg-white border border-slate-200 rounded-2xl mt-1 overflow-hidden shadow-md">
                  {CASTES.map((cst) => (
                    <TouchableOpacity
                      key={cst}
                      onPress={() => {
                        setCaste(cst);
                        setShowCasteDropdown(false);
                      }}
                      className="px-4 py-3 border-b border-slate-100"
                    >
                      <Text className="font-semibold text-slate-700">{cst}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

          </View>

          {/* Action submit button */}
          <TouchableOpacity
            onPress={handleFindSchemes}
            style={{ shadowColor: '#4A90E2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 }}
            className="w-full py-4 bg-bharat-accent rounded-xl justify-center items-center mt-8"
          >
            <Text className="text-white text-base font-bold">Find My Schemes</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

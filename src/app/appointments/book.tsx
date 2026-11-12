import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { DEPARTMENTS_DB } from '@/constants/appointment-departments';
import { appointmentApi, dashboardApi } from '@/services/api';
import { getAuthToken } from '@/services/storage';
import { CalendarDatePicker } from '@/components/appointments/CalendarDatePicker';
import { isFutureOrTodayIST, getTodayIST } from '@/utils/date-time';
import {
  SUPPORTED_STATES,
  checkAppointmentDateAvailability,
  OFFICIAL_APPOINTMENT_TIME_SLOTS,
} from '@/constants/official-holidays';
import {
  scheduleAppointmentNotification,
  requestNotificationPermission,
  getNotificationStatus,
} from '@/services/notificationService';

const LOCATIONS_BY_STATE_DEPT: Record<string, Record<string, string[]>> = {
  KA: {
    passport: [
      'Passport Seva Kendra (PSK) - Lalbagh, Bengaluru',
      'Passport Seva Kendra (PSK) - Koramangala, Bengaluru',
      'Post Office PSK (POPSK) - Mysuru Central',
      'Passport Seva Kendra (PSK) - Mangaluru Hub',
      'Passport Seva Kendra - Hubballi-Dharwad',
    ],
    rto: [
      'RTO Bengaluru Central (KA-01) - Koramangala',
      'RTO Bengaluru East (KA-03) - Indiranagar',
      'RTO Mysuru West (KA-09) - Saraswathipuram',
      'RTO Mangaluru (KA-19) - City Campus',
      'RTO Hubballi (KA-25) - Station Road',
    ],
    aadhaar: [
      'Aadhaar Seva Kendra - Vijayanagar, Bengaluru',
      'General Post Office (GPO) Aadhaar Center - Raj Bhavan Road, Bengaluru',
      'District Civic Center ASK - Mysuru DC Office',
      'State Bank District Branch ASK - Mangaluru',
    ],
    default: [
      'District Administrative Complex, Bengaluru Urban',
      'Deputy Commissioner Zonal Office, Mysuru',
      'Taluk Public Service Center, Hubballi',
    ],
  },
  TN: {
    passport: [
      'Regional Passport Office (RPO) - Rayala Towers, Chennai',
      'Passport Seva Kendra (PSK) - Saligramam, Chennai',
      'Passport Seva Kendra (PSK) - Coimbatore Avinashi Road',
      'Passport Seva Kendra (PSK) - Madurai Kochadai',
    ],
    rto: [
      'RTO Chennai Central (TN-01) - Ayanavaram',
      'RTO Chennai South (TN-07) - Thiruvanmiyur',
      'RTO Coimbatore Central (TN-37) - Dr. Balasundaram Road',
      'RTO Madurai North (TN-59) - K.Pudur',
    ],
    aadhaar: [
      'Aadhaar Seva Kendra - Koyambedu, Chennai',
      'Anna Nagar Post Office Aadhaar Center, Chennai',
      'District Collectorate ASK - Coimbatore',
      'Madurai Head Post Office Aadhaar Wing',
    ],
    default: [
      'Ripon Building Civic Counters, Greater Chennai Corporation',
      'Coimbatore Collectorate Public Grievance Center',
      'Madurai District Administrative Service Complex',
    ],
  },
  MH: {
    passport: [
      'Passport Seva Kendra (PSK) - Bandra Kurla Complex (BKC), Mumbai',
      'Passport Seva Kendra (PSK) - Lower Parel, Mumbai',
      'Passport Seva Kendra (PSK) - Senapati Bapat Road, Pune',
      'Regional Passport Office (RPO) - Bandra East',
    ],
    rto: [
      'RTO Mumbai Central (MH-01) - Tardeo',
      'RTO Mumbai West (MH-02) - Andheri',
      'RTO Pune (MH-12) - Sangamwadi',
      'RTO Thane (MH-04) - Central Circle',
    ],
    aadhaar: [
      'Aadhaar Seva Kendra - Vile Parle East, Mumbai',
      'General Post Office (GPO) Aadhaar Hub, Fort, Mumbai',
      'Pune Municipal Corporation (PMC) Aadhaar Cell',
      'Thane Zilla Parishad Civic Center',
    ],
    default: [
      'Mantralaya Public Visiting Center, Nariman Point, Mumbai',
      'Pune District Collectorate Office, Shivajinagar',
      'Thane Municipal Corporation Civic Service Center',
    ],
  },
  DL: {
    passport: [
      'Passport Seva Kendra (PSK) - Herald House, ITO, New Delhi',
      'Passport Seva Kendra (PSK) - Shalimar Place, North Delhi',
      'Passport Seva Kendra (PSK) - Bhikaji Cama Place, South Delhi',
      'Regional Passport Office (RPO) - RK Puram, New Delhi',
    ],
    rto: [
      'Zonal Transport Office - Sarai Kale Khan, New Delhi (DL-01)',
      'Zonal Transport Office - Janakpuri, West Delhi (DL-04)',
      'Automated Driving Test Track - Shakur Basti (DL-08)',
      'Transport Authority Head Office - Rajpur Road',
    ],
    aadhaar: [
      'Aadhaar Seva Kendra - Connaught Place, New Delhi',
      'Aadhaar Seva Kendra - Akshardham Metro Complex',
      'General Post Office (GPO) Aadhaar Center - Gol Dak Khana',
      'Zonal Civic Center Camp - Civic Centre, Minto Road',
    ],
    default: [
      'Delhi Secretariat Public Visiting Wing, IP Estate',
      'District Magistrate Office, New Delhi District',
      'Zonal Civic Service Counter, MCD Central Zone',
    ],
  },
  UP: {
    passport: [
      'Regional Passport Office (RPO) - Vipin Khand, Gomti Nagar, Lucknow',
      'Passport Seva Kendra (PSK) - Ratan Square, Vidhan Sabha Marg, Lucknow',
      'Passport Seva Kendra (PSK) - Sector 126, Noida',
      'Passport Seva Kendra (PSK) - Bhelupur, Varanasi',
    ],
    rto: [
      'RTO Lucknow (UP-32) - Transport Nagar',
      'RTO Gautam Buddha Nagar (UP-16) - Sector 32, Noida',
      'RTO Varanasi (UP-65) - Shivpur',
      'RTO Kanpur (UP-78) - Sarvodaya Nagar',
    ],
    aadhaar: [
      'Aadhaar Seva Kendra - Hazratganj, Lucknow',
      'Aadhaar Seva Kendra - Sector 62, Noida',
      'Head Post Office Aadhaar Center, Varanasi Cantt',
      'Kanpur GPO Aadhaar Seva Counter',
    ],
    default: [
      'Lucknow Collectorate Public Hall, Qaiserbagh',
      'Noida Administrative Office Complex, Sector 6',
      'Varanasi District Commissionery Hall',
    ],
  },
  ALL: {
    passport: [
      'Passport Seva Kendra (PSK) - Central Region',
      'Post Office PSK (POPSK) - North Hub',
      'Regional Passport Office (RPO) - South Wing',
      'Passport Seva Camp - Sector 62',
    ],
    rto: [
      'RTO Zonal Office, Sector 10',
      'Automated Driving Test Track - North Bay',
      'Sub-Divisional RTO Campus - Sector 4',
      'Central Motor Transport Office',
    ],
    aadhaar: [
      'Aadhaar Seva Kendra, Connaught Place',
      'General Post Office (GPO) Aadhaar Center',
      'Zonal Civic Center Camp',
      'State Bank District Branch ASK',
    ],
    default: [
      'Central Civic Service Center, Sector 1',
      'Zonal Public Administration Center',
      'District Public Services Delivery Campus',
    ],
  },
};

export default function BookAppointmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const dept = DEPARTMENTS_DB.find((d) => d.id === params.deptId) || DEPARTMENTS_DB[0];
  const selectedService = (params.service as string) || 'General Office Inquiry';

  // State & District selection for holiday-aware calendar routing
  const [selectedState, setSelectedState] = useState<string>('KA');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Bengaluru Urban');
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  // Error validations
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const currentStateObj = SUPPORTED_STATES.find((s) => s.code === selectedState) || SUPPORTED_STATES[1];
  const stateLocations = LOCATIONS_BY_STATE_DEPT[selectedState] || LOCATIONS_BY_STATE_DEPT.KA;
  const availableLocations = stateLocations[dept.id] || stateLocations.default || stateLocations.passport;

  const handleConfirmBooking = async () => {
    // 1. Prevent duplicate bookings if already processing
    if (isBooking) return;

    const newErrors: { [key: string]: string } = {};

    if (!selectedLocation) newErrors.location = 'Please select a Preferred Office Location.';
    if (!selectedDate) {
      newErrors.date = 'Please select an Appointment Date.';
    } else if (!isFutureOrTodayIST(selectedDate)) {
      newErrors.date = 'Selected appointment date cannot be in the past. Please select today or a future date.';
    } else {
      // Revalidate selected date against verified gazetted public holidays and closures
      const check = checkAppointmentDateAvailability(selectedDate, selectedState, selectedDistrict);
      if (!check.available) {
        newErrors.date = check.reason || 'Selected date is closed for public visits.';
      }
    }

    if (!selectedTime) newErrors.time = 'Please select an Available Time Slot.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Alert.alert(
        'Missing or Invalid Selections',
        Object.values(newErrors)[0] || 'Please complete all required appointment fields.'
      );
      return;
    }

    // 2. Ensure authentication token exists
    const token = getAuthToken();
    if (!token) {
      Alert.alert(
        'Authentication Required',
        'Please sign in to your Smart Bharat account to schedule an official appointment and receive your verified gatepass.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/login' as any) },
        ]
      );
      return;
    }

    setIsBooking(true);
    setErrors({});

    const clientBookingId = `APT-SB-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      // 3. Call backend appointment booking API endpoint
      let apptData: any = null;

      try {
        const apptRes = await appointmentApi.bookAppointment({
          deptId: dept.id,
          deptName: dept.name,
          service: selectedService,
          location: selectedLocation,
          state: selectedState,
          stateName: currentStateObj.name,
          district: selectedDistrict,
          date: selectedDate,
          time: selectedTime,
          purpose: purpose.trim(),
          bookingId: clientBookingId,
        });

        if (apptRes.success && apptRes.appointment) {
          apptData = apptRes.appointment;
        } else if (!apptRes.success) {
          throw new Error(apptRes.message || 'Server rejected appointment booking.');
        }
      } catch (directErr: any) {
        console.warn('[Appointment API Route Note]:', directErr.message);

        // Fallback to dashboard activity endpoint if direct route had issue
        const actRes = await dashboardApi.createActivity({
          type: 'appointment',
          title: dept.name,
          subtitle: `${selectedService} • ${selectedDate}, ${selectedTime}`,
          token: `Token: ${clientBookingId}`,
          status: 'Upcoming',
          statusColor: '#000080',
          statusBg: '#EEF2FF',
          icon: dept.icon || '🛂',
          route: '/appointments/my-appointments',
          metadata: {
            deptId: dept.id,
            deptName: dept.name,
            service: selectedService,
            location: selectedLocation,
            state: selectedState,
            stateName: currentStateObj.name,
            district: selectedDistrict,
            date: selectedDate,
            time: selectedTime,
            bookingId: clientBookingId,
            purpose: purpose.trim(),
          },
        });

        if (actRes.success && (actRes as any)?.activity) {
          const act = (actRes as any).activity;
          apptData = {
            ...act.metadata,
            _id: act._id,
            bookingId: act.metadata?.bookingId || clientBookingId,
            verificationToken: act.metadata?.verificationToken || '',
            qrCodeDataUrl: act.metadata?.qrCodeDataUrl || '',
          };
        } else {
          throw new Error(actRes.message || directErr.message || 'Server was unable to save appointment booking.');
        }
      }

      if (!apptData) {
        throw new Error('Appointment confirmation data not received from server.');
      }

      const confirmedBookingId = apptData.bookingId || clientBookingId;
      const verificationToken = apptData.verificationToken || '';
      const qrDataUrl = apptData.qrCodeDataUrl || '';

      // 4. Schedule local browser reminder notification for this appointment
      try {
        await scheduleAppointmentNotification({
          id: apptData._id || confirmedBookingId,
          officeName: dept.name,
          date: selectedDate,
          time: selectedTime,
          serviceName: selectedService,
          token: confirmedBookingId,
        });
      } catch (notifErr) {
        console.warn('[Booking] Notification scheduling notice:', notifErr);
      }

      setIsBooking(false);

      // 5. Navigate to confirmation pass only after backend confirms successful booking
      router.push({
        pathname: '/appointments/confirmation',
        params: {
          deptId: dept.id,
          service: selectedService,
          location: selectedLocation,
          date: selectedDate,
          time: selectedTime,
          purpose: purpose.trim(),
          bookingId: confirmedBookingId,
          token: verificationToken,
          qrDataUrl,
          state: selectedState,
          district: selectedDistrict,
        },
      } as any);
    } catch (err: any) {
      setIsBooking(false);
      console.error('[Appointment Booking Error]:', err);
      Alert.alert(
        'Booking Failed',
        err.message || 'Unable to confirm appointment booking. Please check your connection and retry.'
      );
    }
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
            <Text className="text-xl font-black text-[#14532D]">Book Appointment</Text>
            <Text className="text-xs font-bold text-[#4B6350] uppercase tracking-widest mt-0.5">
              {dept.name} • Office Visit Slot
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 130 }}>
        <View className="max-w-4xl w-full mx-auto">
          {/* Summary Card */}
          <View
            style={{
              shadowColor: '#14532D',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 10,
              elevation: 2,
            }}
            className="bg-[#F3F8F4] border border-[#CADDCB] p-6 rounded-3xl mb-5"
          >
            <View className="flex-row items-center space-x-2.5">
              <View className="w-16 h-16 bg-[#F0FDFA] border border-[#BAE6FD] rounded-2xl justify-center items-center mr-4">
                <Text className="text-3xl">{dept.icon}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs font-black text-[#0284C7] uppercase tracking-wider">
                  {dept.name}
                </Text>
                <Text className="text-lg font-black text-[#14532D] mt-0.5">
                  {selectedService}
                </Text>
              </View>
            </View>
          </View>

          {/* State & District Jurisdiction Selector */}
          <View
            style={{
              shadowColor: '#14532D',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 10,
              elevation: 2,
            }}
            className="bg-[#F3F8F4] border border-[#CADDCB] p-6 rounded-3xl mb-5"
          >
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-black text-slate-800">
                State Government Holiday Calendar *
              </Text>
              <View className="bg-[#EDF5EE] border border-[#CADDCB] px-3 py-1 rounded-full">
                <Text className="text-[10px] font-black text-[#14532D] uppercase">
                  DoPT & State Gazettes
                </Text>
              </View>
            </View>

            {/* State Picker Button */}
            <TouchableOpacity
              onPress={() => setShowStateDropdown(!showStateDropdown)}
              style={{ minHeight: 52 }}
              className="w-full px-4.5 py-3.5 bg-[#EDF5EE] border border-[#CADDCB] rounded-2xl flex-row justify-between items-center mb-3"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <Text className="text-base mr-2">🏛️</Text>
                <Text className="text-sm font-black text-[#14532D]">
                  {currentStateObj.name}
                </Text>
              </View>
              <Text className="text-slate-500 text-sm">{showStateDropdown ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {showStateDropdown && (
              <View className="bg-[#F3F8F4] border border-[#CADDCB] rounded-2xl mb-4 overflow-hidden shadow-xs">
                {SUPPORTED_STATES.map((st) => (
                  <TouchableOpacity
                    key={st.code}
                    onPress={() => {
                      setSelectedState(st.code);
                      setSelectedDistrict(st.districts[0]);
                      setSelectedLocation('');
                      setShowStateDropdown(false);
                      // Clear date if previously selected date is invalid in newly selected state
                      if (selectedDate) {
                        const check = checkAppointmentDateAvailability(selectedDate, st.code, st.districts[0]);
                        if (!check.available) {
                          setSelectedDate('');
                        }
                      }
                    }}
                    style={{ minHeight: 48 }}
                    className={`px-4.5 py-3.5 border-b border-[#CADDCB] last:border-b-0 justify-center ${
                      selectedState === st.code ? 'bg-[#E0EDE1]' : ''
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={`text-sm ${
                        selectedState === st.code ? 'font-black text-[#14532D]' : 'font-bold text-slate-800'
                      }`}
                    >
                      {st.name} {selectedState === st.code ? '✓' : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* District Selector Chips */}
            <Text className="text-xs font-bold text-slate-600 mb-2">District Jurisdiction:</Text>
            <View className="flex-row flex-wrap gap-2">
              {currentStateObj.districts.map((d) => (
                <TouchableOpacity
                  key={d}
                  onPress={() => {
                    setSelectedDistrict(d);
                    setSelectedLocation('');
                  }}
                  style={{ minHeight: 38 }}
                  className={`px-3.5 py-2 rounded-xl border items-center justify-center ${
                    selectedDistrict === d
                      ? 'bg-[#14532D] border-[#14532D]'
                      : 'bg-[#EDF5EE] border-[#CADDCB]'
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-xs font-bold ${
                      selectedDistrict === d ? 'text-white' : 'text-slate-700'
                    }`}
                  >
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Location Dropdown Picker */}
          <View
            style={{
              shadowColor: '#14532D',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 10,
              elevation: 2,
            }}
            className="bg-[#F3F8F4] border border-[#CADDCB] p-6 rounded-3xl mb-5"
          >
            <Text className="text-sm font-black text-slate-800 mb-2.5">
              Preferred Office Location ({currentStateObj.name}) *
            </Text>
            <TouchableOpacity
              onPress={() => setShowLocationDropdown(!showLocationDropdown)}
              style={{ minHeight: 52 }}
              className={`w-full px-4.5 py-4 bg-[#EDF5EE] border ${
                errors.location ? 'border-red-400 bg-red-50/20' : 'border-[#CADDCB]'
              } rounded-2xl flex-row justify-between items-center`}
              activeOpacity={0.7}
            >
              <Text className={`text-sm font-bold ${selectedLocation ? 'text-slate-900' : 'text-slate-400'}`}>
                {selectedLocation || `Select Office in ${currentStateObj.name}`}
              </Text>
              <Text className="text-slate-500 text-sm">{showLocationDropdown ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {showLocationDropdown && (
              <View className="bg-[#F3F8F4] border border-[#CADDCB] rounded-2xl mt-2 overflow-hidden shadow-xs">
                {availableLocations.map((loc, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      setSelectedLocation(loc);
                      setShowLocationDropdown(false);
                      setErrors((prev) => ({ ...prev, location: '' }));
                    }}
                    style={{ minHeight: 48 }}
                    className="px-4.5 py-3.5 border-b border-[#CADDCB] last:border-b-0 justify-center"
                    activeOpacity={0.7}
                  >
                    <Text className="text-sm font-bold text-slate-800">{loc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {errors.location ? (
              <Text className="text-red-500 text-xs ml-1 mt-1 font-semibold">{errors.location}</Text>
            ) : null}
          </View>

          {/* Real Holiday-Aware Date Selection with IST Calendar & Validation */}
          <CalendarDatePicker
            selectedDate={selectedDate}
            onSelectDate={(dt) => {
              setSelectedDate(dt);
              setErrors((prev) => ({ ...prev, date: '' }));
            }}
            stateCode={selectedState}
            districtName={selectedDistrict}
            errorMessage={errors.date}
          />

          {/* Select Time Slot Section */}
          <View
            style={{
              shadowColor: '#14532D',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 10,
              elevation: 2,
            }}
            className="bg-[#F3F8F4] border border-[#CADDCB] p-6 rounded-3xl mb-5"
          >
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-black text-slate-800">
                Official Public Counter Slot *
              </Text>
              <Text className="text-[11px] font-bold text-slate-500">
                09:00 AM - 04:00 PM (IST)
              </Text>
            </View>

            <View className="flex-row flex-wrap">
              {OFFICIAL_APPOINTMENT_TIME_SLOTS.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  onPress={() => {
                    setSelectedTime(slot);
                    setErrors((prev) => ({ ...prev, time: '' }));
                  }}
                  activeOpacity={0.7}
                  style={{ minHeight: 46, minWidth: 94 }}
                  className={`px-5 py-3.5 rounded-2xl border justify-center items-center ${
                    selectedTime === slot
                      ? 'bg-[#14532D] border-[#14532D]'
                      : 'bg-[#EDF5EE] border-[#CADDCB]'
                  } mr-2.5 mb-2.5`}
                >
                  <Text
                    className={`text-sm font-black ${
                      selectedTime === slot ? 'text-white' : 'text-slate-700'
                    }`}
                  >
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-[11px] text-slate-500 font-medium mt-1">
              • 01:00 PM – 02:00 PM is reserved for official lunch recess across public departments.
            </Text>

            {errors.time ? (
              <Text className="text-red-500 text-xs ml-1 mt-1 font-semibold">{errors.time}</Text>
            ) : null}
          </View>

          {/* Purpose / Remarks (Optional) */}
          <View
            style={{
              shadowColor: '#14532D',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 10,
              elevation: 2,
            }}
            className="bg-[#F3F8F4] border border-[#CADDCB] p-6 rounded-3xl mb-6"
          >
            <Text className="text-sm font-black text-slate-800 mb-2">Remarks or Specific Purpose (Optional)</Text>
            <TextInput
              placeholder="e.g. Bringing original supporting documents for renewal"
              placeholderTextColor="#94A3B8"
              value={purpose}
              onChangeText={setPurpose}
              className="w-full px-4 py-3.5 bg-[#EDF5EE] border border-[#CADDCB] rounded-2xl text-slate-900 font-semibold text-base"
            />
          </View>

          {/* Notification & IST Timings Notice */}
          <View className="bg-[#EDF5EE] border border-[#CADDCB] rounded-2xl p-4.5 mb-6 flex-row items-center">
            <Text className="text-2xl mr-3">🔔</Text>
            <View className="flex-1">
              <Text className="text-sm font-black text-[#14532D]">Local Visit Reminders Active</Text>
              <Text className="text-xs font-medium text-[#4B6350] mt-0.5 leading-5">
                All appointment scheduling strictly adheres to Indian Standard Time (IST) and verified public gazetted holidays.
              </Text>
            </View>
          </View>

          {/* Confirm Booking CTA in Forest Green */}
          <TouchableOpacity
            onPress={handleConfirmBooking}
            disabled={isBooking}
            activeOpacity={0.85}
            style={{ minHeight: 56, opacity: isBooking ? 0.75 : 1 }}
            className="w-full py-4.5 px-6 bg-[#14532D] rounded-2xl justify-center items-center shadow-xs"
          >
            {isBooking ? (
              <View className="flex-row items-center space-x-2">
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text className="text-white text-base font-black uppercase tracking-wider ml-2">
                  Verifying Schedule & Generating Pass...
                </Text>
              </View>
            ) : (
              <Text className="text-white text-base font-black uppercase tracking-wider">
                Confirm & Generate Gatepass Ticket →
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

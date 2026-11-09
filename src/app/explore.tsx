import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Platform,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';

interface ServiceEntry {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  bgLight: string;
  borderLight: string;
  badge: string;
  route: string;
  params?: Record<string, string>;
  category: 'All' | 'Identity' | 'Welfare' | 'Civic' | 'Appointments' | 'Transport' | 'Agriculture';
}

const ALL_SERVICES: ServiceEntry[] = [
  {
    id: 'digilocker',
    title: 'DigiLocker Wallet',
    subtitle: 'Store, view, and organize official Aadhaar, PAN & certificates',
    icon: '📁',
    color: '#6366F1',
    bgLight: '#EEF2FF',
    borderLight: '#C7D2FE',
    badge: 'DigiLocker',
    route: '/digilocker',
    category: 'Identity',
  },
  {
    id: 'schemes',
    title: 'Scheme Finder Engine',
    subtitle: 'AI-guided eligibility checks across 1,400+ welfare programs & DBT',
    icon: '🌾',
    color: '#10B981',
    bgLight: '#ECFDF5',
    borderLight: '#A7F3D0',
    badge: 'AI Matching',
    route: '/schemes/questionnaire',
    category: 'Welfare',
  },
  {
    id: 'grievances',
    title: 'Civic Grievances & Redressal',
    subtitle: 'Lodge and track municipal issues, broken roads, sanitation & water',
    icon: '📢',
    color: '#F97316',
    bgLight: '#FFF7ED',
    borderLight: '#FED7AA',
    badge: 'CPGRAMS',
    route: '/grievances',
    category: 'Civic',
  },
  {
    id: 'track-grievance',
    title: 'Track Grievance Status',
    subtitle: 'Search real-time action reports, engineer assignments & resolution',
    icon: '🔍',
    color: '#D97706',
    bgLight: '#FFFBEB',
    borderLight: '#FDE68A',
    badge: 'Live Status',
    route: '/grievances/track',
    category: 'Civic',
  },
  {
    id: 'appointments',
    title: 'Office Visits & Booking',
    subtitle: 'Book appointment slots at PSK, RTO, Revenue & Municipal bodies',
    icon: '📅',
    color: '#0284C7',
    bgLight: '#F0FDFA',
    borderLight: '#BAE6FD',
    badge: 'e-Tokens',
    route: '/appointments/select-department',
    category: 'Appointments',
  },
  {
    id: 'passport',
    title: 'Passport Seva Kendra (PSK)',
    subtitle: 'Book slots for fresh passport, renewals & police verification',
    icon: '🛂',
    color: '#14532D',
    bgLight: '#F0FDF4',
    borderLight: '#BBF7D0',
    badge: 'Seva Kendra',
    route: '/appointments/choose-service',
    params: { deptId: 'passport' },
    category: 'Appointments',
  },
  {
    id: 'transport',
    title: 'Transport Department (RTO)',
    subtitle: 'Learning licence test, driving test slot, vehicle RC & renewals',
    icon: '🚗',
    color: '#EA580C',
    bgLight: '#FFF7ED',
    borderLight: '#FFEDD5',
    badge: 'Parivahan',
    route: '/appointments/choose-service',
    params: { deptId: 'rto' },
    category: 'Transport',
  },
  {
    id: 'revenue',
    title: 'Revenue & Land Records',
    subtitle: 'Income certificates, caste verification, registry & Khatauni copies',
    icon: '📑',
    color: '#7C3AED',
    bgLight: '#F5F3FF',
    borderLight: '#DDD6FE',
    badge: 'Tehsil SDM',
    route: '/appointments/choose-service',
    params: { deptId: 'revenue' },
    category: 'Appointments',
  },
  {
    id: 'agriculture',
    title: 'PM-KISAN & Agriculture',
    subtitle: 'Farmer financial grants, seed subsidies & soil health cards',
    icon: '🌱',
    color: '#059669',
    bgLight: '#ECFDF5',
    borderLight: '#A7F3D0',
    badge: 'PM-KISAN',
    route: '/schemes/recommendations',
    category: 'Agriculture',
  },
  {
    id: 'assistant',
    title: 'Smart Bharat AI Assistant',
    subtitle: 'Multilingual conversational civic guidance in 22 Indian languages',
    icon: '🤖',
    color: '#14532D',
    bgLight: '#ECFDF5',
    borderLight: '#A7F3D0',
    badge: '22 Languages',
    route: '/assistant',
    category: 'Welfare',
  },
  {
    id: 'activity',
    title: 'Activity Center & History',
    subtitle: 'Track all your personal appointments, grievances, and schemes',
    icon: '📋',
    color: '#4F46E5',
    bgLight: '#EEF2FF',
    borderLight: '#C7D2FE',
    badge: 'Official',
    route: '/activity',
    category: 'Identity',
  },
];

const CATEGORY_TABS: Array<'All' | 'Identity' | 'Welfare' | 'Civic' | 'Appointments' | 'Transport' | 'Agriculture'> = [
  'All',
  'Identity',
  'Welfare',
  'Civic',
  'Appointments',
  'Transport',
  'Agriculture',
];

export default function ServicesDirectoryScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Identity' | 'Welfare' | 'Civic' | 'Appointments' | 'Transport' | 'Agriculture'>('All');

  const filteredServices = ALL_SERVICES.filter((svc) => {
    const matchesSearch =
      svc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      svc.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      svc.badge.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || svc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#E6F0E8" />

      {/* Header bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace('/home')}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>Services Directory</Text>
          <Text style={styles.headerTagline}>National Citizen Gateway • Ministry of Electronics & IT</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title details with Orange Indicator */}
        <View style={styles.titleSection}>
          <View style={styles.orangeIndicator} />
          <View style={styles.titleTexts}>
            <Text style={styles.sectionTitle}>Public Services Catalog</Text>
            <Text style={styles.sectionSubtitle}>
              Browse certified citizen services by department, welfare category & state authority
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Search all services, departments or certificates..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchClear}>
              <Text style={styles.searchClearText}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScrollView}
          contentContainerStyle={styles.chipsContainer}
        >
          {CATEGORY_TABS.map((tab) => {
            const isActive = selectedCategory === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setSelectedCategory(tab)}
                style={[styles.chip, isActive && styles.chipActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Services Cards List */}
        <View style={styles.cardsGrid}>
          {filteredServices.length === 0 ? (
            <View style={styles.emptySearchBox}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>🔍</Text>
              <Text style={styles.emptySearchTitle}>No matching services found</Text>
              <Text style={styles.emptySearchSubtitle}>
                Try adjusting your search query or reset filter category.
              </Text>
            </View>
          ) : (
            filteredServices.map((svc) => (
              <TouchableOpacity
                key={svc.id}
                onPress={() => {
                  if (svc.params) {
                    router.push({ pathname: svc.route as any, params: svc.params } as any);
                  } else {
                    router.push(svc.route as any);
                  }
                }}
                activeOpacity={0.8}
                style={[styles.serviceCard, { borderColor: svc.borderLight }]}
              >
                <View
                  style={[
                    styles.serviceIconContainer,
                    { backgroundColor: svc.bgLight, borderColor: svc.borderLight },
                  ]}
                >
                  <Text style={styles.serviceIconText}>{svc.icon}</Text>
                </View>

                <View style={styles.serviceTextGroup}>
                  <View style={styles.serviceHeaderRow}>
                    <Text style={styles.serviceTitleText}>{svc.title}</Text>
                    <View style={[styles.serviceBadge, { backgroundColor: svc.bgLight, borderColor: svc.borderLight }]}>
                      <Text style={[styles.serviceBadgeText, { color: svc.color }]}>
                        {svc.badge}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.serviceSubtitleText}>{svc.subtitle}</Text>
                </View>

                <View
                  style={[
                    styles.serviceArrowCircle,
                    { backgroundColor: svc.bgLight, borderColor: svc.borderLight },
                  ]}
                >
                  <Text style={[styles.serviceArrowText, { color: svc.color }]}>→</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Decorative Bottom Tricolor Wave Ribbons */}
      <View style={styles.bottomTricolorWaves} pointerEvents="none">
        <View style={[styles.tricolorWaveBand, { backgroundColor: '#FF9933' }]} />
        <View style={[styles.tricolorWaveBand, { backgroundColor: '#FFFFFF' }]} />
        <View style={[styles.tricolorWaveBand, { backgroundColor: '#138808' }]} />
      </View>

      {/* FLOATING BOTTOM NAVIGATION BAR */}
      <View style={styles.floatingNavContainer}>
        {/* Home Tab */}
        <TouchableOpacity
          style={styles.navTab}
          onPress={() => router.replace('/home')}
          activeOpacity={0.7}
        >
          <View style={styles.navTabPill}>
            <Text style={styles.navTabIcon}>🏠</Text>
            <Text style={styles.navTabLabel}>Home</Text>
          </View>
        </TouchableOpacity>

        {/* Services Tab - Active */}
        <TouchableOpacity
          style={styles.navTab}
          activeOpacity={0.7}
        >
          <View style={[styles.navTabPill, styles.navTabPillActive]}>
            <Text style={[styles.navTabIcon, styles.navTabIconActive]}>🏛️</Text>
            <Text style={[styles.navTabLabel, styles.navTabLabelActive]}>Services</Text>
          </View>
          <View style={styles.activeTabIndicator} />
        </TouchableOpacity>

        {/* Activity Tab */}
        <TouchableOpacity
          style={styles.navTab}
          onPress={() => router.push('/appointments/my-appointments' as any)}
          activeOpacity={0.7}
        >
          <View style={styles.navTabPill}>
            <Text style={styles.navTabIcon}>📋</Text>
            <Text style={styles.navTabLabel}>Activity</Text>
          </View>
        </TouchableOpacity>

        {/* Profile Tab */}
        <TouchableOpacity
          style={styles.navTab}
          onPress={() => router.replace('/home')}
          activeOpacity={0.7}
        >
          <View style={styles.navTabPill}>
            <Text style={styles.navTabIcon}>👤</Text>
            <Text style={styles.navTabLabel}>Profile</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E6F0E8',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#CADDCB',
    backgroundColor: '#EDF5EE',
    ...Platform.select({
      ios: {
        shadowColor: '#14532D',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: '#E0EDE1',
    borderWidth: 1,
    borderColor: '#CADDCB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  backButtonText: {
    color: '#14532D',
    fontWeight: '900',
    fontSize: 18,
  },
  headerTitleGroup: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#14532D',
  },
  headerTagline: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4B6350',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 110,
  },
  titleSection: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  orangeIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
    backgroundColor: '#F97316',
    marginRight: 12,
  },
  titleTexts: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#14532D',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B6350',
    marginTop: 2,
    lineHeight: 17,
  },
  searchBar: {
    backgroundColor: '#F3F8F4',
    borderWidth: 1,
    borderColor: '#CADDCB',
    borderRadius: 20,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#14532D',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#0F172A',
    height: '100%',
  },
  searchClear: {
    padding: 6,
  },
  searchClearText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '800',
  },
  chipsScrollView: {
    marginBottom: 18,
  },
  chipsContainer: {
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#CADDCB',
    backgroundColor: '#EDF5EE',
  },
  chipActive: {
    backgroundColor: '#14532D',
    borderColor: '#14532D',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B6350',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  cardsGrid: {
    gap: 12,
  },
  emptySearchBox: {
    backgroundColor: '#F3F8F4',
    borderWidth: 1,
    borderColor: '#CADDCB',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
  },
  emptySearchTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#14532D',
    marginBottom: 4,
  },
  emptySearchSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#14532D',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  serviceIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  serviceIconText: {
    fontSize: 24,
  },
  serviceTextGroup: {
    flex: 1,
    paddingRight: 8,
  },
  serviceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  serviceTitleText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
    flex: 1,
  },
  serviceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    marginLeft: 6,
  },
  serviceBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  serviceSubtitleText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    fontWeight: '500',
    marginTop: 2,
  },
  serviceArrowCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceArrowText: {
    fontSize: 15,
    fontWeight: '900',
  },
  bottomTricolorWaves: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 8,
    flexDirection: 'row',
  },
  tricolorWaveBand: {
    flex: 1,
    height: '100%',
    opacity: 0.7,
  },
  floatingNavContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 36,
    borderWidth: 1,
    borderColor: '#EFECE6',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#14532D',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
      },
      android: {
        elevation: 8,
      },
      default: {},
    }),
  },
  navTab: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  navTabPill: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
  },
  navTabPillActive: {
    backgroundColor: '#ECFDF5',
  },
  navTabIcon: {
    fontSize: 18,
    color: '#94A3B8',
  },
  navTabIconActive: {
    color: '#14532D',
    transform: [{ scale: 1.1 }],
  },
  navTabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 2,
  },
  navTabLabelActive: {
    fontWeight: '900',
    color: '#14532D',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#14532D',
  },
});

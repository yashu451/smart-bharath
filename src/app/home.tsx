import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Modal,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { dashboardApi, grievanceApi, GrievanceInsightsData } from '@/services/api';
import { getStoredUser, getAuthToken, clearAuthData } from '@/services/storage';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { DesignSystem } from '@/constants/design-system';
import { AshokaEmblem } from '@/components/home/AshokaEmblem';
import { QuickActionWatermark } from '@/components/home/QuickActionWatermark';
import { EmptyStateIllustration } from '@/components/home/EmptyStateIllustration';
import { BottomTricolorWaves } from '@/components/home/BottomTricolorWaves';
import { calculateAppointmentCountdown } from '@/utils/date-time';
import {
  checkAndDeliverAppointmentReminders,
  getNotificationStatus,
  requestNotificationPermission,
} from '@/services/notificationService';

// Search catalog item definition
interface SearchItem {
  id: string;
  title: string;
  category: 'Service' | 'Scheme' | 'Document' | 'Department';
  icon: string;
  route: string;
  params?: Record<string, string>;
  description: string;
}

const SEARCH_DIRECTORY: SearchItem[] = [
  {
    id: 'digilocker',
    title: 'DigiLocker Wallet',
    category: 'Document',
    icon: '📁',
    route: '/digilocker',
    description: 'Access Aadhaar, PAN, Driving Licence and certificates',
  },
  {
    id: 'scheme-finder',
    title: 'Scheme Finder (Welfare)',
    category: 'Scheme',
    icon: '🌾',
    route: '/schemes/questionnaire',
    description: 'Find welfare subsidies and financial benefits',
  },
  {
    id: 'civic-grievance',
    title: 'Civic Grievances Portal',
    category: 'Service',
    icon: '📢',
    route: '/grievances',
    description: 'Report potholes, water, waste and public issues',
  },
  {
    id: 'track-grievance',
    title: 'Track Grievance Status',
    category: 'Service',
    icon: '🔍',
    route: '/grievances/track',
    description: 'Check real-time resolution status of your complaint',
  },
  {
    id: 'office-visits',
    title: 'Office Visits & Appointments',
    category: 'Department',
    icon: '📅',
    route: '/appointments/select-department',
    description: 'Book official visits at regional government offices',
  },
  {
    id: 'my-appointments',
    title: 'My Booked Appointments',
    category: 'Service',
    icon: '🛂',
    route: '/appointments/my-appointments',
    description: 'View upcoming Passport, RTO and Aadhaar tokens',
  },
  {
    id: 'ai-assistant',
    title: 'Smart AI Civic Assistant',
    category: 'Service',
    icon: '🤖',
    route: '/assistant',
    description: 'Multilingual AI guidance on government schemes and rules',
  },
  {
    id: 'passport-office',
    title: 'Passport Seva Kendra (PSK)',
    category: 'Department',
    icon: '🛂',
    route: '/appointments/choose-service',
    params: { deptId: 'passport' },
    description: 'Apply for fresh passport, renewals and police verification',
  },
  {
    id: 'rto-transport',
    title: 'Transport Department (RTO)',
    category: 'Department',
    icon: '🚗',
    route: '/appointments/choose-service',
    params: { deptId: 'rto' },
    description: 'Driving licence tests, renewal and vehicle RC transfers',
  },
  {
    id: 'pm-scholarship',
    title: 'PM Scholarship Scheme',
    category: 'Scheme',
    icon: '🎓',
    route: '/schemes/details',
    params: { id: 'pm-scholarship' },
    description: 'Education assistance for wards of armed forces personnel',
  },
  {
    id: 'pm-kisan',
    title: 'PM-KISAN Samman Nidhi',
    category: 'Scheme',
    icon: '🌾',
    route: '/schemes/details',
    params: { id: 'pm-kisan' },
    description: 'Direct financial assistance of ₹6,000/year to farmers',
  },
  {
    id: 'aadhaar-services',
    title: 'Aadhaar Services (UIDAI)',
    category: 'Document',
    icon: '🪪',
    route: '/appointments/choose-service',
    params: { deptId: 'aadhaar' },
    description: 'Biometrics update, demographics correction and linkage',
  },
];

// Explore Categories
const SERVICE_CATEGORIES = [
  {
    id: 'cat-identity',
    title: 'Identity & Certificates',
    subtitle: 'Aadhaar, PAN, Driving Licence & Marksheets',
    icon: '🪪',
    accentColor: '#6366F1',
    bgColor: '#EEF2FF',
    badge: 'DigiLocker',
    route: '/digilocker',
  },
  {
    id: 'cat-schemes',
    title: 'Welfare Schemes & DBT',
    subtitle: 'Check eligibility across central & state benefits',
    icon: '🌾',
    accentColor: '#10B981',
    bgColor: '#ECFDF5',
    badge: 'AI Matching',
    route: '/schemes/questionnaire',
  },
  {
    id: 'cat-grievances',
    title: 'Civic Grievances & Redressal',
    subtitle: 'Report municipal issues, broken roads & water',
    icon: '📢',
    accentColor: '#F97316',
    bgColor: '#FFF7ED',
    badge: 'CPGRAMS',
    route: '/grievances',
  },
  {
    id: 'cat-appointments',
    title: 'Office Visits & Booking',
    subtitle: 'Passport Seva, RTO, Revenue & Municipal bodies',
    icon: '📅',
    accentColor: '#0284C7',
    bgColor: '#F0FDFA',
    badge: 'Token System',
    route: '/appointments/select-department',
  },
  {
    id: 'cat-transport',
    title: 'Transport & Driving Licence',
    subtitle: 'Learning licence test, vehicle RC & renewals',
    icon: '🚗',
    accentColor: '#F59E0B',
    bgColor: '#FEF3C7',
    badge: 'Parivahan',
    route: '/appointments/choose-service',
    params: { deptId: 'rto' },
  },
  {
    id: 'cat-passport',
    title: 'Passport & Consular Services',
    subtitle: 'Book appointment for fresh passport & renewals',
    icon: '🛂',
    accentColor: '#14532D',
    bgColor: '#F0FDF4',
    badge: 'Seva Kendra',
    route: '/appointments/choose-service',
    params: { deptId: 'passport' },
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  // States
  const [activeTab, setActiveTab] = useState<'home' | 'services' | 'activity' | 'profile'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Authenticated User & Personalized Dashboard State
  const [user, setUser] = useState<any>(getStoredUser());
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [overdueAppointments, setOverdueAppointments] = useState<any[]>([]);
  const [notificationStatus, setNotificationStatus] = useState<ReturnType<typeof getNotificationStatus> | null>(null);
  const [dashboardStats, setDashboardStats] = useState({
    total: 0,
    appointments: 0,
    grievances: 0,
    schemes: 0,
    documents: 0,
  });
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [grievanceInsights, setGrievanceInsights] = useState<GrievanceInsightsData | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);

  // Load personalized dashboard data for the authenticated user strictly from backend
  const loadPersonalizedData = useCallback(async () => {
    try {
      const local = getStoredUser();
      if (local) setUser(local);

      // Perform historical migration of any local scheduled appointments
      try {
        if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
          const rawNotifs = window.localStorage.getItem('smart_bharat_scheduled_notifications');
          if (rawNotifs) {
            const notifs = JSON.parse(rawNotifs);
            if (Array.isArray(notifs) && notifs.length > 0) {
              const historyItems = notifs.map((n: any) => ({
                type: 'appointment',
                title: n.officeName || 'Office Visit',
                subtitle: `${n.serviceName || 'General Office Inquiry'} • ${n.date}, ${n.time}`,
                token: n.token || `Token: ${n.appointmentId || 'APT'}`,
                status: 'Upcoming',
                statusColor: '#000080',
                statusBg: '#EEF2FF',
                icon: '📅',
                route: '/appointments/my-appointments',
                metadata: {
                  date: n.date,
                  time: n.time,
                  service: n.serviceName,
                  location: n.officeName,
                },
                createdAt: n.scheduledAt || new Date().toISOString(),
              }));
              await dashboardApi.migrateHistory(historyItems);
            }
          }
        }
      } catch (migErr) {
        // Migration proceeds quietly without blocking dashboard
      }

      const [dashRes, insightsRes] = await Promise.allSettled([
        dashboardApi.getDashboard(),
        grievanceApi.getInsights(),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value.success) {
        if (dashRes.value.user) setUser(dashRes.value.user);
        if (Array.isArray(dashRes.value.recentActivities)) {
          // Strictly exclude AI Assistant chat messages and chat-history events from Recent Activities
          const verifiedRecent = dashRes.value.recentActivities.filter(
            (act: any) => act.type !== 'assistant' && act.type !== 'chat' && !act.route?.includes('/assistant')
          );
          setRecentActivities(verifiedRecent);
          setUnreadNotifications(verifiedRecent.length > 0 ? Math.min(verifiedRecent.length, 5) : 0);
        }
        if (Array.isArray(dashRes.value.upcomingAppointments)) {
          setUpcomingAppointments(dashRes.value.upcomingAppointments);
        }
        if (Array.isArray(dashRes.value.overdueAppointments)) {
          setOverdueAppointments(dashRes.value.overdueAppointments);
        }
        if (dashRes.value.stats) setDashboardStats(dashRes.value.stats);
      }

      if (insightsRes.status === 'fulfilled' && insightsRes.value.success) {
        setGrievanceInsights(insightsRes.value as unknown as GrievanceInsightsData);
      }
    } catch (err) {
      const local = getStoredUser();
      if (local) setUser(local);
    } finally {
      setIsLoadingDashboard(false);
      setIsLoadingInsights(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const token = getAuthToken();
      if (!token) {
        router.replace('/');
        return;
      }
      setActiveTab('home');
      loadPersonalizedData();
      checkAndDeliverAppointmentReminders();
      setNotificationStatus(getNotificationStatus());
    }, [loadPersonalizedData, router])
  );

  const userInitials = (user?.name || 'Citizen')
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'Y';

  // Search Results filtering
  const filteredSearch = searchQuery.trim()
    ? SEARCH_DIRECTORY.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleLogout = () => {
    clearAuthData();
    setShowProfile(false);
    router.replace('/');
  };

  const handleNavigate = (route: string, params?: Record<string, string>) => {
    setSearchQuery('');
    if (params) {
      router.push({ pathname: route as any, params } as any);
    } else {
      router.push(route as any);
    }
  };

  const scrollToServices = () => {
    setActiveTab('services');
    scrollViewRef.current?.scrollTo({ y: 720, animated: true });
  };

  const scrollToHome = () => {
    setActiveTab('home');
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#E6F0E8" />

      {/* TOP HEADER */}
      <View style={styles.header}>
        <View style={styles.headerInner}>
          {/* Logo and Brand Title with Official Ashoka Lion Capital Emblem */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={scrollToHome}
            style={styles.brandingContainer}
          >
            {/* Ashoka Emblem */}
            <View style={styles.emblemContainer}>
              <AshokaEmblem size={32} />
            </View>
            <View style={styles.brandTextGroup}>
              <View style={styles.brandTitleRow}>
                <Text style={styles.brandTitle}>Smart Bharat</Text>
                <Text style={{ fontSize: 16, marginLeft: 6 }}>🇮🇳</Text>
              </View>
              <Text style={styles.brandTagline}>National Citizen Gateway</Text>
            </View>
          </TouchableOpacity>

          {/* Right Actions: Notification & Forest Green Citizen Avatar */}
          <View style={styles.headerRightActions}>
            {/* Notification Bell */}
            <TouchableOpacity
              onPress={() => setShowNotifications(true)}
              style={styles.iconButton}
              activeOpacity={0.7}
              accessibilityLabel="Notifications"
            >
              <Text style={styles.actionIconText}>🔔</Text>
              {unreadNotifications > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{unreadNotifications}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Citizen Avatar with Forest Green Background */}
            <TouchableOpacity
              onPress={() => setShowProfile(true)}
              style={styles.avatarButton}
              activeOpacity={0.8}
              accessibilityLabel="Citizen Profile"
            >
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{userInitials}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* MAIN VERTICAL SCROLL CONTENT */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dashboardContainer}>
          {/* 1. HERO SECTION (Redesigned with Local India Gate & Tricolor Illustration) */}
          <View style={styles.heroBannerContainer}>
            <LinearGradient
              colors={['#042914', '#084325', '#0E5C35', '#14532D']}
              start={{ x: 0, y: 0.2 }}
              end={{ x: 1, y: 0.8 }}
              style={styles.heroBannerGradient}
            >
              {/* Left Content Area */}
              <View style={styles.heroLeftContent}>
                <View style={styles.heroGovPill}>
                  <View style={styles.heroGovPillDot} />
                  <Text style={styles.heroGovPillText}>NATIONAL CITIZEN GATEWAY 🇮🇳</Text>
                </View>

                <Text style={styles.heroTitle}>
                  Welcome to <Text style={styles.heroTitleHighlight}>Smart Bharat</Text>
                </Text>
                <Text style={styles.heroSubtitle}>
                  Your one-stop unified platform for all government services, welfare schemes and digital citizen certificates.
                </Text>

                <TouchableOpacity
                  onPress={() => router.push('/explore' as any)}
                  activeOpacity={0.85}
                  style={styles.heroCtaButton}
                >
                  <Text style={styles.heroCtaText}>Explore Services →</Text>
                </TouchableOpacity>
              </View>

              {/* Large High-Quality Indian-Themed Illustration on the Right */}
              <View style={styles.heroRightImageWrapper}>
                <Image
                  source={require('../../assets/images/hero-india-gate.png')}
                  style={styles.heroBannerImage}
                  resizeMode="cover"
                />
                {/* Smooth left-edge gradient overlay to blend into forest green */}
                <LinearGradient
                  colors={['#084325', 'rgba(8, 67, 37, 0.75)', 'rgba(8, 67, 37, 0)']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.heroImageBlendGradient}
                  pointerEvents="none"
                />
              </View>
            </LinearGradient>
          </View>

          {/* 2. QUICK ACTIONS (5 DISTINCT COLOURFUL CARDS WITH REDESIGNED AI ASSISTANT) */}
          <View style={styles.sectionContainer}>
            <SectionHeading
              title="Quick Actions"
              subtitle="Access popular services instantly"
              actionText="View All →"
              onActionPress={() => router.push('/explore' as any)}
            />

            {/* Redesigned Large AI Assistant Feature Card */}
            <TouchableOpacity
              onPress={() => router.push('/assistant')}
              activeOpacity={0.88}
              style={styles.aiActionCard}
            >
              <LinearGradient
                colors={['#F5F3FF', '#EDE9FE', '#DDD6FE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.aiActionGradient}
              >
                {/* Background Ambient Glow */}
                <View style={styles.aiGlowCircle} />

                {/* Left Text & Action Area */}
                <View style={styles.aiActionLeftContent}>
                  <View style={styles.aiFeatureBadge}>
                    <View style={styles.aiFeatureBadgeDot} />
                    <Text style={styles.aiFeatureBadgeText}>AI POWERED • 22 LANGUAGES</Text>
                  </View>

                  <Text style={styles.aiActionTitle}>Your AI Government Assistant</Text>

                  <Text style={styles.aiActionDesc}>
                    Get instant guidance on government services, schemes and applications.
                  </Text>

                  <View style={styles.aiActionBottomRow}>
                    <View style={styles.startChattingButton}>
                      <Text style={styles.startChattingText}>Start Chatting</Text>
                      <Text style={styles.startChattingArrow}>➔</Text>
                    </View>
                    <Text style={styles.aiInstantHelpTag}>⚡ Instant guidance</Text>
                  </View>
                </View>

                {/* Right Friendly AI Bot 3D Illustration */}
                <View style={styles.aiBotWrapper}>
                  <View style={styles.aiBotGlowHalo} />
                  <Image
                    source={require('../../assets/images/ai-assistant-bot.png')}
                    style={styles.aiBotImage}
                    resizeMode="contain"
                  />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.quickActionsGrid}>
              {/* Card 1: DigiLocker (Lavender/Periwinkle Card) */}
              <TouchableOpacity
                onPress={() => router.push('/digilocker' as any)}
                activeOpacity={0.8}
                style={[styles.colorfulCard, { borderColor: '#C7D2FE', backgroundColor: '#EEF2FF' }]}
              >
                <LinearGradient
                  colors={['#EEF2FF', '#E0E7FF']}
                  style={styles.cardGradientInner}
                >
                  <QuickActionWatermark type="digilocker" color="#6366F1" />
                  <View style={styles.cardHeaderArea}>
                    <View style={[styles.cardIconBox, { backgroundColor: '#4F46E5' }]}>
                      <Text style={styles.cardEmoji}>📁</Text>
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>DigiLocker</Text>
                      <Text style={styles.cardSubtitle}>Your documents,{'\n'}digitally</Text>
                    </View>
                  </View>
                  <View style={styles.cardBottomRow}>
                    <View style={styles.cardCircleArrow}>
                      <Text style={[styles.arrowText, { color: '#4F46E5' }]}>→</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Card 2: Scheme Finder (Mint/Emerald Card) */}
              <TouchableOpacity
                onPress={() => router.push('/schemes/questionnaire' as any)}
                activeOpacity={0.8}
                style={[styles.colorfulCard, { borderColor: '#A7F3D0', backgroundColor: '#ECFDF5' }]}
              >
                <LinearGradient
                  colors={['#ECFDF5', '#D1FAE5']}
                  style={styles.cardGradientInner}
                >
                  <QuickActionWatermark type="schemes" color="#10B981" />
                  <View style={styles.cardHeaderArea}>
                    <View style={[styles.cardIconBox, { backgroundColor: '#10B981' }]}>
                      <Text style={styles.cardEmoji}>🌾</Text>
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>Scheme Finder</Text>
                      <Text style={styles.cardSubtitle}>Find eligible schemes{'\n'}for you</Text>
                    </View>
                  </View>
                  <View style={styles.cardBottomRow}>
                    <View style={styles.cardCircleArrow}>
                      <Text style={[styles.arrowText, { color: '#10B981' }]}>→</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Card 3: Civic Grievances (Peach/Coral Card) */}
              <TouchableOpacity
                onPress={() => router.push('/grievances' as any)}
                activeOpacity={0.8}
                style={[styles.colorfulCard, { borderColor: '#FED7AA', backgroundColor: '#FFF7ED' }]}
              >
                <LinearGradient
                  colors={['#FFF7ED', '#FFEDD5']}
                  style={styles.cardGradientInner}
                >
                  <QuickActionWatermark type="grievances" color="#F97316" />
                  <View style={styles.cardHeaderArea}>
                    <View style={[styles.cardIconBox, { backgroundColor: '#F97316' }]}>
                      <Text style={styles.cardEmoji}>📢</Text>
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>Civic Grievances</Text>
                      <Text style={styles.cardSubtitle}>Raise and track issues</Text>
                    </View>
                  </View>
                  <View style={styles.cardBottomRow}>
                    <View style={styles.cardCircleArrow}>
                      <Text style={[styles.arrowText, { color: '#F97316' }]}>→</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Card 4: Office Visits (Sky/Cyan Card) */}
              <TouchableOpacity
                onPress={() => router.push('/appointments/select-department' as any)}
                activeOpacity={0.8}
                style={[styles.colorfulCard, { borderColor: '#BAE6FD', backgroundColor: '#F0FDFA' }]}
              >
                <LinearGradient
                  colors={['#F0FDFA', '#CFFAFE']}
                  style={styles.cardGradientInner}
                >
                  <QuickActionWatermark type="appointments" color="#0284C7" />
                  <View style={styles.cardHeaderArea}>
                    <View style={[styles.cardIconBox, { backgroundColor: '#0284C7' }]}>
                      <Text style={styles.cardEmoji}>📅</Text>
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>Office Visits</Text>
                      <Text style={styles.cardSubtitle}>Book slots at PSK,{'\n'}RTO & more</Text>
                    </View>
                  </View>
                  <View style={styles.cardBottomRow}>
                    <View style={styles.cardCircleArrow}>
                      <Text style={[styles.arrowText, { color: '#0284C7' }]}>→</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Card 5: AI Assistant (Purple/Indigo Card) */}
              <TouchableOpacity
                onPress={() => router.push('/assistant')}
                activeOpacity={0.8}
                style={[styles.colorfulCard, { borderColor: '#DDD6FE', backgroundColor: '#F5F3FF' }]}
              >
                <LinearGradient
                  colors={['#F5F3FF', '#EDE9FE']}
                  style={styles.cardGradientInner}
                >
                  <QuickActionWatermark type="assistant" color="#7C3AED" />
                  <View style={styles.cardHeaderArea}>
                    <View style={[styles.cardIconBox, { backgroundColor: '#7C3AED' }]}>
                      <Text style={styles.cardEmoji}>🤖</Text>
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>AI Assistant</Text>
                      <Text style={styles.cardSubtitle}>Ask questions,{'\n'}instant guidance</Text>
                    </View>
                  </View>
                  <View style={styles.cardBottomRow}>
                    <View style={styles.cardCircleArrow}>
                      <Text style={[styles.arrowText, { color: '#7C3AED' }]}>→</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* 3. UPCOMING OFFICE VISITS & REAL-TIME DASHBOARD COUNTDOWN */}
          <View style={styles.sectionContainer}>
            <SectionHeading
              title="Upcoming Office Visits"
              subtitle="Real-time appointment countdown & gatepass tokens (IST)"
              actionText={
                upcomingAppointments.length > 0 || overdueAppointments.length > 0
                  ? "All Bookings →"
                  : "+ Book Visit Slot →"
              }
              onActionPress={() =>
                router.push(
                  upcomingAppointments.length > 0 || overdueAppointments.length > 0
                    ? ('/appointments/my-appointments' as any)
                    : ('/appointments/select-department' as any)
                )
              }
            />

            {/* Overdue Appointments Alerts (Shown Separately) */}
            {overdueAppointments.length > 0 && (
              <View style={{ marginBottom: 12 }}>
                {overdueAppointments.map((act) => {
                  const meta = act.metadata || {};
                  const countdown = act.countdown || calculateAppointmentCountdown(meta.date, meta.time);
                  return (
                    <View key={`overdue-${act._id || act.id}`} style={styles.overdueApptCard}>
                      <View style={styles.overdueApptHeader}>
                        <View style={styles.overdueBadge}>
                          <Text style={styles.overdueBadgeText}>⚠️ OVERDUE APPOINTMENT</Text>
                        </View>
                        <Text style={styles.overdueCountdownText}>
                          {countdown.countdownLabel || 'Visit date has passed'}
                        </Text>
                      </View>
                      <Text style={styles.overdueApptTitle}>{act.title}</Text>
                      <Text style={styles.overdueApptSub}>
                        {meta.service || act.subtitle || 'General Inquiry'} • Scheduled: {meta.date} at {meta.time || 'Office hours'} (IST)
                      </Text>
                      <View style={styles.overdueApptActions}>
                        <TouchableOpacity
                          onPress={() => router.push('/appointments/my-appointments' as any)}
                          style={styles.overdueRescheduleBtn}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.overdueRescheduleBtnText}>Reschedule Past Appointment ➔</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Upcoming Appointments List with Dynamic Countdown */}
            {upcomingAppointments.length > 0 ? (
              <View style={{ marginBottom: 4 }}>
                {upcomingAppointments.map((act) => {
                  const meta = act.metadata || {};
                  const countdown = act.countdown || calculateAppointmentCountdown(meta.date, meta.time);
                  const isToday = countdown.isToday;
                  const isTomorrow = countdown.isTomorrow;

                  return (
                    <View key={act._id || act.id} style={styles.upcomingApptCard}>
                      <View style={styles.upcomingApptTopRow}>
                        <View style={styles.upcomingApptDeptBadge}>
                          <Text style={styles.upcomingApptIcon}>{act.icon || '🛂'}</Text>
                          <Text style={styles.upcomingApptDeptName} numberOfLines={1}>
                            {meta.deptName || act.title}
                          </Text>
                        </View>

                        {/* Dynamic IST Countdown Pill */}
                        {isToday ? (
                          <View style={styles.countdownPillToday}>
                            <Text style={styles.countdownPillTodayText}>🚨 Today</Text>
                          </View>
                        ) : isTomorrow ? (
                          <View style={styles.countdownPillTomorrow}>
                            <Text style={styles.countdownPillTomorrowText}>⏳ Tomorrow</Text>
                          </View>
                        ) : (
                          <View style={styles.countdownPillUpcoming}>
                            <Text style={styles.countdownPillUpcomingText}>
                              🗓️ {countdown.countdownLabel || (countdown.diffDays + ' days left')}
                            </Text>
                          </View>
                        )}
                      </View>

                      <Text style={styles.upcomingApptServiceTitle}>
                        {meta.service || act.subtitle || 'Official Appointment Slot'}
                      </Text>

                      {/* Details Box */}
                      <View style={styles.upcomingApptDetailsBox}>
                        {meta.location ? (
                          <View style={styles.upcomingApptDetailRow}>
                            <Text style={styles.upcomingApptDetailLabel}>📍 Office Location:</Text>
                            <Text style={styles.upcomingApptDetailVal} numberOfLines={1}>
                              {meta.location}
                            </Text>
                          </View>
                        ) : null}

                        <View style={styles.upcomingApptDetailRow}>
                          <Text style={styles.upcomingApptDetailLabel}>🕒 Scheduled Slot (IST):</Text>
                          <Text style={styles.upcomingApptDetailVal}>
                            {meta.date} • {meta.time || 'Standard Hours'}
                          </Text>
                        </View>

                        <View style={styles.upcomingApptDetailRow}>
                          <Text style={styles.upcomingApptDetailLabel}>🎟️ Gatepass Token:</Text>
                          <Text style={styles.upcomingApptTokenVal}>
                            {act.token || `Token: ${meta.bookingId || act._id?.slice(-8)}`}
                          </Text>
                        </View>
                      </View>

                      {/* Action Buttons */}
                      <View style={styles.upcomingApptActionsRow}>
                        <TouchableOpacity
                          onPress={() => router.push('/appointments/my-appointments' as any)}
                          style={styles.upcomingApptPrimaryBtn}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.upcomingApptPrimaryBtnText}>View Token & Details ↗</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => router.push('/appointments/my-appointments' as any)}
                          style={styles.upcomingApptSecondaryBtn}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.upcomingApptSecondaryBtnText}>Reschedule Slot</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : overdueAppointments.length === 0 ? (
              /* Empty state if 0 upcoming visits */
              <View style={styles.upcomingEmptyBox}>
                <View style={styles.upcomingEmptyIcon}>
                  <Text style={{ fontSize: 22 }}>📅</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.upcomingEmptyTitle}>No Upcoming Office Visits</Text>
                  <Text style={styles.upcomingEmptySub}>
                    Book verified appointment slots at Passport Seva Kendra (PSK), RTO, or UIDAI Aadhaar Center.
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => router.push('/appointments/select-department' as any)}
                  style={styles.upcomingEmptyBtn}
                  activeOpacity={0.8}
                >
                  <Text style={styles.upcomingEmptyBtnText}>+ Book Slot</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>

          {/* 3. YOUR CITIZEN INSIGHTS SECTION (Personalized Waiting-Period Analysis & Charter Alerts) */}
          <View style={styles.sectionContainer}>
            <SectionHeading
              title="Your Citizen Insights"
              subtitle="Personal waiting-period analysis & official charter alerts"
              actionText={grievanceInsights?.hasData ? "My Complaints →" : undefined}
              onActionPress={grievanceInsights?.hasData ? () => router.push('/grievances/track' as any) : undefined}
            />

            {isLoadingInsights ? (
              <View style={styles.insightsBox}>
                <View style={{ paddingVertical: 28, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#14532D" />
                  <Text style={{ fontSize: 12, color: '#64748B', marginTop: 10, fontWeight: '600' }}>
                    Analyzing your citizen records & charter timelines...
                  </Text>
                </View>
              </View>
            ) : !grievanceInsights?.hasData ? (
              /* Genuine Citizen Empty State for New Users */
              <View style={styles.insightsBox}>
                <View style={styles.insightsEmptyInner}>
                  <View style={styles.insightsEmptyIconBadge}>
                    <Text style={{ fontSize: 28 }}>📊</Text>
                  </View>
                  <Text style={styles.insightsEmptyTitle}>No Complaints Recorded Yet</Text>
                  <Text style={styles.insightsEmptySubtitle}>
                    When you log civic grievances submitted through official portals (CPGRAMS, Janaspandana, CM Helpline), Smart Bharat calculates waiting days, tracks published Citizen Charter timelines, and notifies you when deadlines are exceeded.
                  </Text>

                  <View style={styles.insightsEmptyActions}>
                    <TouchableOpacity
                      onPress={() => router.push('/grievances/report' as any)}
                      style={styles.insightsPrimaryBtn}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.insightsPrimaryBtnText}>Find Official Portal & Guidance →</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => router.push({ pathname: '/grievances/report', params: { step: '3' } } as any)}
                      style={styles.insightsSecondaryBtn}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.insightsSecondaryBtnText}>+ Save Reference Number</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.insightsNoticePill}>
                    <Text style={styles.insightsNoticeText}>
                      🛡️ 100% Citizen-Facing. No fake data or simulated officers. All metrics derive strictly from your saved records.
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              /* Active Personalized Insights for Citizen with Records */
              <View style={styles.insightsBox}>
                {/* 1. Overdue Charter Timeline Alert Banner (if overdueCount > 0) */}
                {grievanceInsights.stats.overdueCount > 0 && (
                  <View style={styles.overdueAlertBanner}>
                    <Text style={{ fontSize: 20, marginRight: 10 }}>⚠️</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.overdueAlertTitle}>
                        Citizen Charter Notice: {grievanceInsights.stats.overdueCount} {grievanceInsights.stats.overdueCount === 1 ? 'Complaint' : 'Complaints'} Exceeded Timeline
                      </Text>
                      <Text style={styles.overdueAlertText}>
                        These complaints have exceeded published government timelines. Under the Citizen Charter, you are entitled to file a First Appeal or contact nodal officers.
                      </Text>
                    </View>
                  </View>
                )}

                {/* 2. 4 Key Metrics Cards */}
                <View style={styles.metricsGrid}>
                  <View style={[styles.metricCard, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
                    <View style={styles.metricHeader}>
                      <Text style={styles.metricIcon}>⏳</Text>
                      <Text style={[styles.metricNum, { color: '#B45309' }]}>
                        {grievanceInsights.stats.awaitingUpdates}
                      </Text>
                    </View>
                    <Text style={styles.metricLabel}>Open Complaints</Text>
                    <Text style={styles.metricSub}>Awaiting dept action</Text>
                  </View>

                  <View style={[styles.metricCard, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                    <View style={styles.metricHeader}>
                      <Text style={styles.metricIcon}>⏱️</Text>
                      <Text style={[styles.metricNum, { color: '#1D4ED8' }]}>
                        {grievanceInsights.stats.averageWaitingDays}d
                      </Text>
                    </View>
                    <Text style={styles.metricLabel}>Average Waiting</Text>
                    <Text style={styles.metricSub}>Elapsed waiting days</Text>
                  </View>

                  <View style={[styles.metricCard, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                    <View style={styles.metricHeader}>
                      <Text style={styles.metricIcon}>✅</Text>
                      <Text style={[styles.metricNum, { color: '#047857' }]}>
                        {grievanceInsights.stats.markedResolved}
                      </Text>
                    </View>
                    <Text style={styles.metricLabel}>Marked Resolved</Text>
                    <Text style={styles.metricSub}>Citizen confirmed</Text>
                  </View>

                  <View
                    style={[
                      styles.metricCard,
                      {
                        backgroundColor: grievanceInsights.stats.overdueCount > 0 ? '#FEF2F2' : '#F0FDF4',
                        borderColor: grievanceInsights.stats.overdueCount > 0 ? '#FECACA' : '#BBF7D0',
                      },
                    ]}
                  >
                    <View style={styles.metricHeader}>
                      <Text style={styles.metricIcon}>⚠️</Text>
                      <Text
                        style={[
                          styles.metricNum,
                          { color: grievanceInsights.stats.overdueCount > 0 ? '#DC2626' : '#15803D' },
                        ]}
                      >
                        {grievanceInsights.stats.overdueCount}
                      </Text>
                    </View>
                    <Text style={styles.metricLabel}>Overdue Alerts</Text>
                    <Text style={styles.metricSub}>Exceeding charter</Text>
                  </View>
                </View>

                {/* 3. Waiting-Period Distribution Brackets */}
                <View style={styles.insightsSubSection}>
                  <View style={styles.insightsSubHeader}>
                    <Text style={styles.insightsSubTitle}>Waiting-Period Distribution</Text>
                    <Text style={styles.insightsSubBadge}>Real Elapsed Days</Text>
                  </View>

                  <View style={styles.bracketRows}>
                    <View style={styles.bracketRow}>
                      <View style={styles.bracketLabelGroup}>
                        <View style={[styles.bracketDot, { backgroundColor: '#10B981' }]} />
                        <Text style={styles.bracketName}>&lt; 15 Days (Fresh Filing)</Text>
                      </View>
                      <Text style={styles.bracketCount}>{grievanceInsights.waitingBuckets.under15} complaints</Text>
                    </View>

                    <View style={styles.bracketRow}>
                      <View style={styles.bracketLabelGroup}>
                        <View style={[styles.bracketDot, { backgroundColor: '#F59E0B' }]} />
                        <Text style={styles.bracketName}>15–30 Days (Under Review)</Text>
                      </View>
                      <Text style={styles.bracketCount}>{grievanceInsights.waitingBuckets.days15to30} complaints</Text>
                    </View>

                    <View style={styles.bracketRow}>
                      <View style={styles.bracketLabelGroup}>
                        <View style={[styles.bracketDot, { backgroundColor: '#EF4444' }]} />
                        <Text style={styles.bracketName}>&gt; 30 Days (Overdue Alert)</Text>
                      </View>
                      <Text style={[styles.bracketCount, { color: grievanceInsights.waitingBuckets.over30 > 0 ? '#DC2626' : '#64748B' }]}>
                        {grievanceInsights.waitingBuckets.over30} complaints
                      </Text>
                    </View>
                  </View>
                </View>

                {/* 4. Category Breakdown (if available) */}
                {grievanceInsights.byCategory && grievanceInsights.byCategory.length > 0 && (
                  <View style={styles.insightsSubSection}>
                    <View style={styles.insightsSubHeader}>
                      <Text style={styles.insightsSubTitle}>Complaints by Category</Text>
                      <Text style={styles.insightsSubBadge}>Personal Distribution</Text>
                    </View>

                    <View style={styles.categoryBarsContainer}>
                      {grievanceInsights.byCategory.map((cat, i) => (
                        <View key={i} style={styles.categoryBarRow}>
                          <View style={styles.categoryBarLabelRow}>
                            <Text style={styles.categoryBarName}>{cat.name}</Text>
                            <Text style={styles.categoryBarCount}>
                              {cat.count} ({cat.percentage}%)
                            </Text>
                          </View>
                          <View style={styles.categoryBarTrack}>
                            <View
                              style={[
                                styles.categoryBarFill,
                                {
                                  width: `${Math.max(8, cat.percentage)}%`,
                                  backgroundColor: cat.color || '#14532D',
                                },
                              ]}
                            />
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* 5. Longest-Waiting Complaint Spotlight Card */}
                {grievanceInsights.longestWaiting && (
                  <View style={styles.spotlightCard}>
                    <View style={styles.spotlightHeader}>
                      <View style={styles.spotlightTag}>
                        <Text style={styles.spotlightTagText}>⏱️ LONGEST PENDING COMPLAINT</Text>
                      </View>
                      <Text style={styles.spotlightRef}>Ref #{grievanceInsights.longestWaiting.referenceNumber}</Text>
                    </View>

                    <Text style={styles.spotlightTitle}>{grievanceInsights.longestWaiting.title}</Text>

                    <View style={styles.spotlightMetaRow}>
                      <View style={styles.spotlightMetaItem}>
                        <Text style={styles.spotlightMetaLabel}>Portal:</Text>
                        <Text style={styles.spotlightMetaVal} numberOfLines={1}>
                          {grievanceInsights.longestWaiting.portalName}
                        </Text>
                      </View>
                      <View style={styles.spotlightMetaItem}>
                        <Text style={styles.spotlightMetaLabel}>Waiting:</Text>
                        <Text style={[styles.spotlightMetaVal, { color: '#B45309', fontWeight: '800' }]}>
                          {grievanceInsights.longestWaiting.daysElapsed} days
                        </Text>
                      </View>
                      <View style={styles.spotlightMetaItem}>
                        <Text style={styles.spotlightMetaLabel}>Standard:</Text>
                        <Text style={styles.spotlightMetaVal}>
                          {grievanceInsights.longestWaiting.expectedTimelineDays} days
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => router.push('/grievances/track' as any)}
                      style={styles.spotlightActionBtn}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.spotlightActionBtnText}>Track & Update Follow-up Details ➔</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* 6. AI Recommendations / Actionable Next Steps (if overdue) */}
                {grievanceInsights.aiRecommendations && grievanceInsights.aiRecommendations.length > 0 && (
                  <View style={styles.aiRecommendationsBox}>
                    <View style={styles.aiRecHeaderRow}>
                      <Text style={{ fontSize: 18, marginRight: 8 }}>💡</Text>
                      <Text style={styles.aiRecHeaderTitle}>Actionable Next Steps (Official Citizen Charter)</Text>
                    </View>

                    {grievanceInsights.aiRecommendations.slice(0, 2).map((rec, idx) => (
                      <View key={rec.id || idx} style={styles.aiRecItem}>
                        <View style={styles.aiRecBadgeRow}>
                          <Text style={styles.aiRecRefNumber}>Ref #{rec.referenceNumber}</Text>
                          <Text style={styles.aiRecOverduePill}>+{rec.daysOverdue} Days Overdue</Text>
                        </View>
                        <Text style={styles.aiRecText}>{rec.recommendation}</Text>
                        <TouchableOpacity
                          onPress={() => router.push('/grievances/track' as any)}
                          style={styles.aiRecBtn}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.aiRecBtnText}>Check Appeal / Follow-up Options →</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>

          {/* 4. RECENT ACTIVITY SECTION (Matches Reference Image Empty & Active States) */}
          <View style={styles.sectionContainer}>
            <SectionHeading
              title="Recent Activity"
              subtitle="Your active requests & view history"
              actionText="View All →"
              onActionPress={() => router.push('/appointments/my-appointments' as any)}
            />

            <View style={styles.activityBox}>
              {isLoadingDashboard ? (
                <View style={{ paddingVertical: 28, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#14532D" />
                  <Text style={{ fontSize: 12, color: '#64748B', marginTop: 10, fontWeight: '600' }}>
                    Loading your verified activities...
                  </Text>
                </View>
              ) : recentActivities.length === 0 ? (
                /* Exact Empty State as Shown in Reference Image */
                <View style={styles.emptyStateContainer}>
                  <EmptyStateIllustration size={58} />
                  <Text style={styles.emptyStateTitle}>No Recent Activities</Text>
                  <Text style={styles.emptyStateSubtitle}>
                    You haven't made any requests yet. Explore our services to get started!
                  </Text>
                </View>
              ) : (
                recentActivities.map((act) => (
                  <TouchableOpacity
                    key={act._id || act.id}
                    style={styles.activityCard}
                    onPress={() => router.push((act.route || '/appointments/my-appointments') as any)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.activityIconBox}>
                      <Text style={styles.activityIcon}>{act.icon || '📋'}</Text>
                    </View>

                    <View style={styles.activityDetails}>
                      <View style={styles.activityTitleRow}>
                        <Text style={styles.activityTitle}>{act.title}</Text>
                        <View
                          style={[
                            styles.statusPill,
                            { backgroundColor: act.statusBg || '#ECFDF5' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusPillText,
                              { color: act.statusColor || '#14532D' },
                            ]}
                          >
                            {act.status || 'Active'}
                          </Text>
                        </View>
                      </View>
                      {act.subtitle ? (
                        <Text style={styles.activitySubtitle}>{act.subtitle}</Text>
                      ) : null}
                      {act.token ? (
                        <Text style={styles.activityToken}>{act.token}</Text>
                      ) : null}
                    </View>

                    <Text style={styles.cardChevron}>›</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Decorative Bottom Tricolor Wave Ribbons as in Reference Image */}
      <BottomTricolorWaves />

      {/* 4. FLOATING BOTTOM NAVIGATION BAR (Exact Match to Reference Image) */}
      <View style={styles.floatingNavContainer}>
        {/* Home Tab */}
        <TouchableOpacity
          style={styles.navTab}
          onPress={scrollToHome}
          activeOpacity={0.7}
        >
          <View style={[styles.navTabPill, activeTab === 'home' && styles.navTabPillActive]}>
            <Text style={[styles.navTabIcon, activeTab === 'home' && styles.navTabIconActive]}>
              🏠
            </Text>
            <Text style={[styles.navTabLabel, activeTab === 'home' && styles.navTabLabelActive]}>
              Home
            </Text>
          </View>
        </TouchableOpacity>

        {/* Services Tab - Opens Dedicated Services Tab */}
        <TouchableOpacity
          style={styles.navTab}
          onPress={() => router.push('/explore' as any)}
          activeOpacity={0.7}
        >
          <View style={styles.navTabPill}>
            <Text style={styles.navTabIcon}>🏛️</Text>
            <Text style={styles.navTabLabel}>Services</Text>
          </View>
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
          onPress={() => setShowProfile(true)}
          activeOpacity={0.7}
        >
          <View style={styles.navTabPill}>
            <Text style={styles.navTabIcon}>👤</Text>
            <Text style={styles.navTabLabel}>Profile</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Floating AI Chat Button at Bottom-Right (Above Bottom Navigation) */}
      <TouchableOpacity
        style={styles.floatingAiButton}
        onPress={() => router.push('/assistant')}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={['#4F46E5', '#6366F1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.floatingAiGradient}
        >
          <Text style={styles.floatingAiIcon}>🤖</Text>
          <Text style={styles.floatingAiLabel}>Ask AI</Text>
          <View style={styles.floatingAiDot} />
        </LinearGradient>
      </TouchableOpacity>

      {/* NOTIFICATIONS MODAL */}
      <Modal
        visible={showNotifications}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleGroup}>
                <Text style={styles.modalHeaderTitle}>Notifications</Text>
                {unreadNotifications > 0 && (
                  <View style={styles.modalCountBadge}>
                    <Text style={styles.modalCountBadgeText}>{unreadNotifications} New</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                onPress={() => setShowNotifications(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Browser Notification Permission Banner */}
              <View style={{ backgroundColor: '#EDF5EE', borderRadius: 14, borderWidth: 1, borderColor: '#CADDCB', padding: 12, marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#14532D' }}>
                    {notificationStatus?.permission === 'granted' ? '🔔 Browser Alerts Active' : '🔔 Appointment Notifications'}
                  </Text>
                  <View style={{ backgroundColor: notificationStatus?.permission === 'granted' ? '#DCFCE7' : '#FEF3C7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                    <Text style={{ fontSize: 9.5, fontWeight: '800', color: notificationStatus?.permission === 'granted' ? '#15803D' : '#B45309' }}>
                      {notificationStatus?.permission === 'granted' ? 'Enabled' : 'Permission Required'}
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 10.5, color: '#4B6350', lineHeight: 15, marginBottom: notificationStatus?.permission !== 'granted' ? 8 : 0 }}>
                  {notificationStatus?.limitationNote || 'Receive morning alerts for your scheduled office visits in Indian Standard Time (IST).'}
                </Text>
                {notificationStatus?.permission !== 'granted' && (
                  <TouchableOpacity
                    onPress={async () => {
                      const res = await requestNotificationPermission();
                      setNotificationStatus(getNotificationStatus());
                    }}
                    style={{ backgroundColor: '#14532D', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, alignSelf: 'flex-start' }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 10.5, fontWeight: '800' }}>Enable Visit Alerts</Text>
                  </TouchableOpacity>
                )}
              </View>

              {recentActivities.length === 0 ? (
                <View style={{ paddingVertical: 40, alignItems: 'center', paddingHorizontal: 20 }}>
                  <Text style={{ fontSize: 32, marginBottom: 12 }}>🔔</Text>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: '#14532D', textAlign: 'center' }}>
                    No Notifications Yet
                  </Text>
                  <Text style={{ fontSize: 11, color: '#64748B', textAlign: 'center', marginTop: 6, lineHeight: 18 }}>
                    When you book appointments, file civic grievances, or apply for welfare schemes, your real-time status updates will appear here.
                  </Text>
                </View>
              ) : (
                recentActivities.slice(0, 5).map((act, index) => (
                  <TouchableOpacity
                    key={act._id || act.id || index}
                    style={styles.notifItem}
                    onPress={() => {
                      setShowNotifications(false);
                      router.push((act.route || '/appointments/my-appointments') as any);
                    }}
                  >
                    <View style={[styles.notifIconBox, { backgroundColor: act.statusBg || '#F0FDFA' }]}>
                      <Text style={styles.notifIcon}>{act.icon || '📋'}</Text>
                    </View>
                    <View style={styles.notifContent}>
                      <View style={styles.notifTopRow}>
                        <Text style={styles.notifTitle} numberOfLines={1}>{act.title}</Text>
                        <Text style={styles.notifTime}>{act.status || 'Active'}</Text>
                      </View>
                      <Text style={styles.notifMessage} numberOfLines={2}>
                        {act.subtitle || act.token || `Status: ${act.status}`}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.markReadButton}
                onPress={() => {
                  setUnreadNotifications(0);
                  setShowNotifications(false);
                }}
              >
                <Text style={styles.markReadText}>Mark all as read</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* CITIZEN PROFILE MODAL */}
      <Modal
        visible={showProfile}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProfile(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Citizen Profile</Text>
              <TouchableOpacity
                onPress={() => setShowProfile(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.profileCard}>
                <View style={styles.profileAvatarLarge}>
                  <Text style={styles.profileAvatarLargeText}>{userInitials}</Text>
                </View>
                <Text style={styles.profileName}>{user?.name || 'Citizen'}</Text>
                <Text style={styles.profileAadhaar}>
                  {user?.mobile ? `Mobile: ${user.mobile}` : user?.email ? `Email: ${user.email}` : 'Verified Citizen'}
                </Text>
                <View style={styles.profileVerifiedBadge}>
                  <Text style={styles.profileVerifiedText}>
                    {user?.isAadhaarVerified ? '✓ Verified Indian Citizen' : '🇮🇳 Registered Citizen Profile'}
                  </Text>
                </View>
              </View>

              {/* Citizen Stats */}
              <View style={styles.profileStatsRow}>
                <View style={styles.profileStatItem}>
                  <Text style={styles.profileStatNum}>{dashboardStats.documents}</Text>
                  <Text style={styles.profileStatLabel}>Linked Docs</Text>
                </View>
                <View style={styles.profileStatDivider} />
                <View style={styles.profileStatItem}>
                  <Text style={styles.profileStatNum}>{dashboardStats.appointments}</Text>
                  <Text style={styles.profileStatLabel}>Upcoming Appt</Text>
                </View>
                <View style={styles.profileStatDivider} />
                <View style={styles.profileStatItem}>
                  <Text style={styles.profileStatNum}>{dashboardStats.grievances}</Text>
                  <Text style={styles.profileStatLabel}>Grievance</Text>
                </View>
              </View>

              {/* Navigation Links inside Profile */}
              <View style={styles.profileMenu}>
                <TouchableOpacity
                  style={styles.profileMenuItem}
                  onPress={() => {
                    setShowProfile(false);
                    router.push('/digilocker' as any);
                  }}
                >
                  <Text style={styles.profileMenuIcon}>📁</Text>
                  <Text style={styles.profileMenuText}>My DigiLocker Documents</Text>
                  <Text style={styles.cardChevron}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.profileMenuItem}
                  onPress={() => {
                    setShowProfile(false);
                    router.push('/appointments/my-appointments' as any);
                  }}
                >
                  <Text style={styles.profileMenuIcon}>📅</Text>
                  <Text style={styles.profileMenuText}>My Scheduled Appointments</Text>
                  <Text style={styles.cardChevron}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.profileMenuItem}
                  onPress={() => {
                    setShowProfile(false);
                    router.push('/grievances/track' as any);
                  }}
                >
                  <Text style={styles.profileMenuIcon}>📢</Text>
                  <Text style={styles.profileMenuText}>Track Registered Grievance</Text>
                  <Text style={styles.cardChevron}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.profileMenuItem}
                  onPress={() => {
                    setShowProfile(false);
                    router.push('/assistant' as any);
                  }}
                >
                  <Text style={styles.profileMenuIcon}>🤖</Text>
                  <Text style={styles.profileMenuText}>AI Civic Companion</Text>
                  <Text style={styles.cardChevron}>›</Text>
                </TouchableOpacity>
              </View>

              {/* Logout Button */}
              <TouchableOpacity
                onPress={handleLogout}
                style={styles.profileLogoutButton}
              >
                <Text style={styles.profileLogoutText}>Sign Out / Reset Session</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* FLOATING AI ASSISTANT QUICK-ACTION BUTTON */}
      <TouchableOpacity
        style={styles.floatingAiButton}
        onPress={() => router.push('/assistant')}
        activeOpacity={0.85}
        accessibilityLabel="Ask AI Civic Assistant"
      >
        <LinearGradient
          colors={['#7C3AED', '#4F46E5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.floatingAiGradient}
        >
          <Text style={styles.floatingAiIcon}>🤖</Text>
          <Text style={styles.floatingAiLabel}>Ask AI</Text>
          <View style={styles.floatingAiDot} />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E6F0E8',
  },
  header: {
    backgroundColor: '#EDF5EE',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#CADDCB',
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
  headerInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: 1240,
    width: '100%',
    marginHorizontal: 'auto',
  },
  brandingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emblemContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  brandTextGroup: {
    justifyContent: 'center',
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  brandTagline: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B6350',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0EDE1',
    borderWidth: 1,
    borderColor: '#CADDCB',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  actionIconText: {
    fontSize: 19,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#EDF5EE',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  avatarButton: {
    position: 'relative',
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#14532D', // Deep Forest Green avatar
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CADDCB',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#E6F0E8',
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 130,
    alignItems: 'center',
  },
  dashboardContainer: {
    maxWidth: 1240,
    width: '100%',
  },

  // HERO BANNER
  heroBannerContainer: {
    marginBottom: 26,
    borderRadius: 26,
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#0A3D24',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.16,
        shadowRadius: 20,
      },
      android: {
        elevation: 6,
      },
      default: {},
    }),
  },
  heroBannerGradient: {
    paddingVertical: Platform.OS === 'web' ? 40 : 26,
    paddingHorizontal: Platform.OS === 'web' ? 40 : 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: Platform.OS === 'web' ? 280 : 240,
    position: 'relative',
    overflow: 'hidden',
  },
  heroLeftContent: {
    flex: 1,
    maxWidth: Platform.OS === 'web' ? 580 : 330,
    zIndex: 3,
  },
  heroGovPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  heroGovPillDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
    marginRight: 7,
  },
  heroGovPillText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FEF3C7',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: Platform.OS === 'web' ? 36 : 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    lineHeight: Platform.OS === 'web' ? 44 : 32,
  },
  heroTitleHighlight: {
    color: '#F59E0B',
  },
  heroSubtitle: {
    fontSize: Platform.OS === 'web' ? 16 : 14,
    fontWeight: '500',
    color: '#D1FAE5',
    marginTop: 10,
    marginBottom: 22,
    lineHeight: Platform.OS === 'web' ? 24 : 20,
  },
  heroCtaButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 26,
    paddingVertical: 13,
    borderRadius: 22,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 3,
  },
  heroCtaText: {
    color: '#0F172A',
    fontSize: 15.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  heroRightImageWrapper: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: Platform.OS === 'web' ? '54%' : '60%',
    height: '100%',
    overflow: 'hidden',
    zIndex: 1,
  },
  heroBannerImage: {
    width: '100%',
    height: '100%',
  },
  heroImageBlendGradient: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 90,
    zIndex: 2,
  },
  heroRightGraphic: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  monumentGraphicBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  monumentEmoji: {
    fontSize: 34,
  },
  tricolorRibbon: {
    flexDirection: 'row',
    width: 32,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    overflow: 'hidden',
  },
  ribbonBand: {
    flex: 1,
    height: '100%',
  },

  // SEARCH
  searchSection: {
    marginBottom: 20,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFECE6',
    borderRadius: 20,
    paddingHorizontal: 18,
    height: 56,
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
    fontSize: 18,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
    height: '100%',
  },
  clearSearchButton: {
    padding: 6,
  },
  clearSearchText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#94A3B8',
  },
  searchResultsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EFECE6',
    marginTop: 8,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#14532D',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
      default: {},
    }),
  },
  searchResultsHeader: {
    backgroundColor: '#FBF9F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EFECE6',
  },
  searchResultsCount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  noResultsBox: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EFECE6',
  },
  searchResultIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  searchResultIcon: {
    fontSize: 18,
  },
  searchResultDetails: {
    flex: 1,
  },
  searchResultTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  searchCategoryPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  searchCategoryText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#14532D',
    textTransform: 'uppercase',
  },
  searchResultDesc: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  searchArrow: {
    fontSize: 18,
    fontWeight: '700',
    color: '#CBD5E1',
    marginLeft: 8,
  },

  // SECTION COMMON
  sectionContainer: {
    marginBottom: 24,
  },

  // PROMINENT AI ASSISTANT CARD IN QUICK ACTIONS
  aiActionCard: {
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#C4B5FD',
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#F5F3FF',
    ...Platform.select({
      ios: {
        shadowColor: '#4338CA',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
      },
      android: {
        elevation: 4,
      },
      default: {},
    }),
  },
  aiActionGradient: {
    paddingVertical: Platform.OS === 'web' ? 26 : 20,
    paddingHorizontal: Platform.OS === 'web' ? 28 : 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: Platform.OS === 'web' ? 175 : 190,
    position: 'relative',
    overflow: 'hidden',
  },
  aiGlowCircle: {
    position: 'absolute',
    right: 20,
    top: -50,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(199, 210, 254, 0.45)',
  },
  aiActionLeftContent: {
    flex: 1,
    marginRight: 16,
    zIndex: 2,
  },
  aiFeatureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  aiFeatureBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6366F1',
    marginRight: 6,
  },
  aiFeatureBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#4338CA',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  aiActionTitle: {
    fontSize: Platform.OS === 'web' ? 25 : 21,
    fontWeight: '900',
    color: '#1E1B4B',
    letterSpacing: -0.3,
    lineHeight: Platform.OS === 'web' ? 32 : 27,
    marginBottom: 6,
  },
  aiActionDesc: {
    fontSize: 15,
    fontWeight: '500',
    color: '#475569',
    lineHeight: 22,
    marginBottom: 16,
    maxWidth: 520,
  },
  aiActionBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  startChattingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  startChattingText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '900',
    letterSpacing: 0.3,
    marginRight: 6,
  },
  startChattingArrow: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '900',
  },
  aiInstantHelpTag: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6366F1',
  },
  aiBotWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    width: Platform.OS === 'web' ? 140 : 110,
    height: Platform.OS === 'web' ? 140 : 110,
  },
  aiBotGlowHalo: {
    position: 'absolute',
    width: Platform.OS === 'web' ? 140 : 110,
    height: Platform.OS === 'web' ? 140 : 110,
    borderRadius: 70,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
  },
  aiBotImage: {
    width: Platform.OS === 'web' ? 135 : 105,
    height: Platform.OS === 'web' ? 135 : 105,
  },

  // QUICK ACTIONS (5 COLOURFUL CARDS AS IN REFERENCE IMAGE)
  quickActionsGrid: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  colorfulCard: {
    flex: Platform.OS === 'web' ? 1 : 1,
    minWidth: Platform.OS === 'web' ? 180 : '46%',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
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
  cardGradientInner: {
    padding: 18,
    minHeight: 126,
    justifyContent: 'space-between',
    position: 'relative',
  },
  cardHeaderArea: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    zIndex: 1,
  },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardEmoji: {
    fontSize: 20,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17.5,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 3,
    lineHeight: 18,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    zIndex: 1,
  },
  cardCircleArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  arrowText: {
    fontSize: 14,
    fontWeight: '900',
  },

  // CITIZEN INSIGHTS STYLES
  insightsBox: {
    backgroundColor: '#F3F8F4',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#CADDCB',
    padding: 20,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#14532D',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  insightsEmptyInner: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  insightsEmptyIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E6F0E8',
    borderWidth: 1,
    borderColor: '#CADDCB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightsEmptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#14532D',
    marginBottom: 6,
    textAlign: 'center',
  },
  insightsEmptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 500,
    marginBottom: 18,
  },
  insightsEmptyActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 14,
  },
  insightsPrimaryBtn: {
    backgroundColor: '#14532D',
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  insightsPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  insightsSecondaryBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CADDCB',
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  insightsSecondaryBtnText: {
    color: '#14532D',
    fontSize: 14,
    fontWeight: '700',
  },
  insightsNoticePill: {
    backgroundColor: '#E6F0E8',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 4,
  },
  insightsNoticeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#14532D',
    textAlign: 'center',
  },

  // ACTIVE INSIGHTS STYLES
  overdueAlertBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
  },
  overdueAlertTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 2,
  },
  overdueAlertText: {
    fontSize: 13,
    color: '#B91C1C',
    lineHeight: 18,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18,
  },
  metricCard: {
    flex: Platform.OS === 'web' ? 1 : 1,
    minWidth: Platform.OS === 'web' ? 180 : '46%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricIcon: {
    fontSize: 20,
  },
  metricNum: {
    fontSize: 24,
    fontWeight: '900',
  },
  metricLabel: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },

  // SUBSECTIONS
  insightsSubSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 14,
  },
  insightsSubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightsSubTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  insightsSubBadge: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#14532D',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  bracketRows: {
    gap: 8,
  },
  bracketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  bracketLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bracketDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bracketName: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
  },
  bracketCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },

  // CATEGORY PROGRESS BARS
  categoryBarsContainer: {
    gap: 10,
  },
  categoryBarRow: {
    marginBottom: 4,
  },
  categoryBarLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryBarName: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#334155',
  },
  categoryBarCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  categoryBarTrack: {
    height: 7,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 4,
  },

  // SPOTLIGHT CARD
  spotlightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    padding: 16,
    marginBottom: 14,
  },
  spotlightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  spotlightTag: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  spotlightTagText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#C2410C',
    letterSpacing: 0.3,
  },
  spotlightRef: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#64748B',
  },
  spotlightTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  spotlightMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  spotlightMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  spotlightMetaLabel: {
    fontSize: 12.5,
    color: '#64748B',
  },
  spotlightMetaVal: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  spotlightActionBtn: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  spotlightActionBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#C2410C',
  },

  // AI RECOMMENDATIONS
  aiRecommendationsBox: {
    backgroundColor: '#F5F3FF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#DDD6FE',
    padding: 16,
  },
  aiRecHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiRecHeaderTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#4338CA',
  },
  aiRecItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    padding: 12,
    marginBottom: 8,
  },
  aiRecBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  aiRecRefNumber: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#4338CA',
  },
  aiRecOverduePill: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  aiRecText: {
    fontSize: 13.5,
    color: '#334155',
    lineHeight: 19,
    marginBottom: 8,
  },
  aiRecBtn: {
    alignSelf: 'flex-start',
  },
  aiRecBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4F46E5',
  },

  // UPCOMING APPOINTMENTS & DASHBOARD COUNTDOWN STYLES
  upcomingApptCard: {
    backgroundColor: '#F3F8F4',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#CADDCB',
    padding: 18,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#14532D',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  upcomingApptTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  upcomingApptDeptBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  upcomingApptIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  upcomingApptDeptName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#14532D',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  countdownPillToday: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1.5,
    borderColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countdownPillTodayText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  countdownPillTomorrow: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countdownPillTomorrowText: {
    color: '#B45309',
    fontSize: 12,
    fontWeight: '900',
  },
  countdownPillUpcoming: {
    backgroundColor: '#E0F2FE',
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countdownPillUpcomingText: {
    color: '#0369A1',
    fontSize: 12,
    fontWeight: '900',
  },
  upcomingApptServiceTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  upcomingApptDetailsBox: {
    backgroundColor: '#EDF5EE',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CADDCB',
    padding: 14,
    marginBottom: 12,
    gap: 8,
  },
  upcomingApptDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upcomingApptDetailLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#4B6350',
    width: 160,
  },
  upcomingApptDetailVal: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  upcomingApptTokenVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000080',
    flex: 1,
  },
  upcomingApptActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  upcomingApptPrimaryBtn: {
    flex: 1,
    backgroundColor: '#14532D',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  upcomingApptPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  upcomingApptSecondaryBtn: {
    borderWidth: 1,
    borderColor: '#CADDCB',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  upcomingApptSecondaryBtnText: {
    color: '#14532D',
    fontSize: 14,
    fontWeight: '800',
  },
  overdueApptCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FCD34D',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },
  overdueApptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  overdueBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  overdueBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#DC2626',
  },
  overdueCountdownText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#B45309',
  },
  overdueApptTitle: {
    fontSize: 15.5,
    fontWeight: '900',
    color: '#92400E',
    marginBottom: 2,
  },
  overdueApptSub: {
    fontSize: 13,
    color: '#78350F',
    marginBottom: 8,
  },
  overdueApptActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  overdueRescheduleBtn: {
    backgroundColor: '#FDE68A',
    borderWidth: 1,
    borderColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  overdueRescheduleBtnText: {
    color: '#92400E',
    fontSize: 12.5,
    fontWeight: '800',
  },
  upcomingEmptyBox: {
    backgroundColor: '#F3F8F4',
    borderWidth: 1,
    borderColor: '#CADDCB',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  upcomingEmptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EDF5EE',
    borderWidth: 1,
    borderColor: '#CADDCB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  upcomingEmptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#14532D',
  },
  upcomingEmptySub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 18,
  },
  upcomingEmptyBtn: {
    backgroundColor: '#14532D',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  upcomingEmptyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  // RECENT ACTIVITIES (SOFT SAGE-CREAM SURFACE AS IN REFERENCE IMAGE)
  activityBox: {
    backgroundColor: '#F3F8F4',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#CADDCB',
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#14532D',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  emptyStateContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtitle: {
    fontSize: 14.5,
    color: '#4B6350',
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 20,
    fontWeight: '500',
  },
  activityCard: {
    backgroundColor: '#EDF5EE',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CADDCB',
    marginBottom: 10,
  },
  activityIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#DCEADC',
    borderWidth: 1,
    borderColor: '#CADDCB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityIcon: {
    fontSize: 20,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  activityTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  statusPillText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  activitySubtitle: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  activityToken: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 2,
  },
  cardChevron: {
    fontSize: 20,
    fontWeight: '700',
    color: '#CBD5E1',
    marginLeft: 8,
  },

  // AI BANNER CARD
  aiBannerCard: {
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0A3D24',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 14,
      },
      android: {
        elevation: 4,
      },
      default: {},
    }),
  },
  aiBannerGradient: {
    padding: 20,
  },
  aiBannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  aiSparkleBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  aiSparkleBadgeText: {
    color: '#FDE68A',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  aiBannerTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  aiBannerSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#D1FAE5',
    lineHeight: 20,
    marginBottom: 14,
  },
  aiAskButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  aiAskButtonText: {
    color: '#14532D',
    fontSize: 14,
    fontWeight: '900',
  },

  // EXPLORE SERVICES
  servicesGrid: {
    gap: 12,
  },
  serviceCategoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#EFECE6',
    ...Platform.select({
      ios: {
        shadowColor: '#14532D',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  serviceCatLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceCatIconBox: {
    width: 46,
    height: 46,
    borderRadius: 16,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  serviceCatIcon: {
    fontSize: 22,
  },
  serviceCatTexts: {
    flex: 1,
  },
  serviceCatHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serviceCatTitle: {
    fontSize: 16.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  serviceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  serviceBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  serviceCatSubtitle: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },

  greetingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  greetingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
    marginRight: 6,
  },
  greetingPillText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.2,
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

  // FLOATING BOTTOM NAVIGATION (PILL ACTIVE STATE AS IN REFERENCE IMAGE)
  floatingNavContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 20 : (Platform.OS === 'ios' ? 24 : 16),
    left: 20,
    right: 20,
    maxWidth: 680,
    marginHorizontal: 'auto',
    backgroundColor: '#F3F8F4',
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#CADDCB',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 14,
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#14532D',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.10,
        shadowRadius: 18,
      },
      android: {
        elevation: 8,
      },
      default: {
        boxShadow: '0 8px 24px rgba(20, 83, 45, 0.08)',
      },
    }),
  },
  navTab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTabPill: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 22,
  },
  navTabPillActive: {
    backgroundColor: '#D1FAE5', // Mint pill active state
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  navTabIcon: {
    fontSize: 20,
    color: '#64748B',
  },
  navTabIconActive: {
    color: '#14532D', // Forest Green
  },
  navTabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  navTabLabelActive: {
    fontWeight: '800',
    color: '#14532D',
  },

  // FLOATING AI CHAT BUTTON AT BOTTOM RIGHT
  floatingAiButton: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'web' ? 95 : (Platform.OS === 'ios' ? 100 : 90),
    borderRadius: 28,
    overflow: 'hidden',
    zIndex: 25,
    ...Platform.select({
      ios: {
        shadowColor: '#4338CA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      default: {
        boxShadow: '0 6px 20px rgba(79, 70, 229, 0.35)',
        cursor: 'pointer',
      },
    }),
  },
  floatingAiGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  floatingAiIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  floatingAiLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  floatingAiDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
    marginLeft: 6,
  },

  // MODALS COMMON
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#EFECE6',
  },
  modalHeaderTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  modalCountBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  modalCountBadgeText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#14532D',
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },
  modalScroll: {
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  // NOTIFICATION ITEMS
  notifItem: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EFECE6',
  },
  notifIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  notifIcon: {
    fontSize: 18,
  },
  notifContent: {
    flex: 1,
  },
  notifTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  notifTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  notifTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  notifMessage: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 18,
  },
  modalFooter: {
    paddingHorizontal: 22,
    paddingTop: 12,
  },
  markReadButton: {
    backgroundColor: '#FBF9F5',
    borderWidth: 1,
    borderColor: '#EFECE6',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  markReadText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#14532D',
  },
  // PROFILE MODAL
  profileCard: {
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#EFECE6',
  },
  profileAvatarLarge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#14532D',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#A7F3D0',
  },
  profileAvatarLargeText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  profileAadhaar: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  profileVerifiedBadge: {
    marginTop: 8,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  profileVerifiedText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#14532D',
  },
  profileStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EFECE6',
  },
  profileStatItem: {
    alignItems: 'center',
  },
  profileStatNum: {
    fontSize: 22,
    fontWeight: '900',
    color: '#14532D',
  },
  profileStatLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  profileStatDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#EFECE6',
  },
  profileMenu: {
    paddingVertical: 12,
  },
  profileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#FBF9F5',
  },
  profileMenuIcon: {
    fontSize: 18,
    marginRight: 14,
  },
  profileMenuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  profileLogoutButton: {
    marginTop: 16,
    marginBottom: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    minHeight: 52,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileLogoutText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#DC2626',
  },
});

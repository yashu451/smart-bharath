import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  StyleSheet,
  Image,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { getAuthToken, getStoredUser } from '@/services/storage';

export default function PublicLandingScreen() {
  const router = useRouter();

  // Authentication State for Returning Users
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const checkAuth = useCallback(() => {
    const token = getAuthToken();
    const user = getStoredUser();
    if (token) {
      setIsAuthenticated(true);
      setCurrentUser(user);
    } else {
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkAuth();
    }, [checkAuth])
  );

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleEnterDashboard = () => {
    router.push('/home' as any);
  };

  const handleLogin = () => {
    router.push('/auth' as any);
  };

  const handleRegister = () => {
    router.push('/register' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#EDF5EE" />

      {/* 1. TOP NATIONAL BANNER STRIP */}
      <View style={styles.topGovStrip}>
        <View style={styles.topGovInner}>
          <View style={styles.topGovLeft}>
            <Text style={styles.topGovEmblem}>🏛️</Text>
            <Text style={styles.topGovText}>
              GOVERNMENT OF INDIA • NATIONAL CITIZEN PORTAL
            </Text>
          </View>
          <View style={styles.topGovRight}>
            <Text style={styles.topGovLangText}>Digital India Initiative 🇮🇳</Text>
          </View>
        </View>
      </View>

      {/* 2. MAIN NAVIGATION HEADER */}
      <View style={styles.mainNav}>
        <View style={styles.mainNavInner}>
          {/* Brand Logo & Name */}
          <View style={styles.brandRow}>
            <View style={styles.emblemBox}>
              <Text style={styles.emblemEmoji}>🏛️</Text>
              <View style={styles.emblemDot} />
            </View>
            <View>
              <View style={styles.brandTitleRow}>
                <Text style={styles.brandTitle}>Smart Bharat</Text>
                <Text style={styles.brandFlag}>🇮🇳</Text>
              </View>
              <Text style={styles.brandSubtitle}>
                National Citizen Gateway • Govt of India
              </Text>
            </View>
          </View>

          {/* Right Action Buttons */}
          <View style={styles.navActionsRow}>
            {isAuthenticated ? (
              <View style={styles.returningUserRow}>
                <View style={styles.userBadgePill}>
                  <Text style={styles.userBadgeDot}>●</Text>
                  <Text style={styles.userBadgeName} numberOfLines={1}>
                    {currentUser?.name || 'Citizen'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleEnterDashboard}
                  activeOpacity={0.85}
                  style={styles.navDashboardBtn}
                >
                  <Text style={styles.navDashboardBtnText}>Go to Dashboard →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.authButtonsRow}>
                <TouchableOpacity
                  onPress={handleLogin}
                  activeOpacity={0.75}
                  style={styles.navLoginBtn}
                >
                  <Text style={styles.navLoginBtnText}>Sign In</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleRegister}
                  activeOpacity={0.85}
                  style={styles.navRegisterBtn}
                >
                  <Text style={styles.navRegisterBtnText}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* 3. SCROLLABLE LANDING CONTENT */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.maxContainer}>
          {/* GRAND HERO SECTION */}
          <View style={styles.heroWrapper}>
            <LinearGradient
              colors={['#042914', '#084325', '#0E5C35', '#14532D']}
              start={{ x: 0, y: 0.2 }}
              end={{ x: 1, y: 0.8 }}
              style={styles.heroGradient}
            >
              {/* Left Column Text & CTAs */}
              <View style={styles.heroLeftCol}>
                <View style={styles.heroBadgePill}>
                  <View style={styles.heroBadgeDot} />
                  <Text style={styles.heroBadgeText}>
                    ONE NATION • ONE GATEWAY 🇮🇳
                  </Text>
                </View>

                <Text style={styles.heroHeading}>
                  One Nation.{'\n'}
                  <Text style={styles.heroHeadingHighlight}>One Gateway.</Text>
                </Text>

                <Text style={styles.heroDescription}>
                  Smart Bharat connects 1.4 billion citizens to verified government
                  welfare subsidies, DigiLocker certificates, civic complaint
                  tracking, and regional office appointments in one secure platform.
                </Text>

                {/* Primary Action Buttons */}
                <View style={styles.heroCtaRow}>
                  {isAuthenticated ? (
                    <TouchableOpacity
                      onPress={handleEnterDashboard}
                      activeOpacity={0.85}
                      style={styles.heroPrimaryBtn}
                    >
                      <Text style={styles.heroPrimaryBtnText}>
                        Enter Citizen Dashboard →
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <>
                      <TouchableOpacity
                        onPress={handleRegister}
                        activeOpacity={0.85}
                        style={styles.heroPrimaryBtn}
                      >
                        <Text style={styles.heroPrimaryBtnText}>
                          Citizen Sign Up ➔
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={handleLogin}
                        activeOpacity={0.75}
                        style={styles.heroSecondaryBtn}
                      >
                        <Text style={styles.heroSecondaryBtnText}>
                          Sign In to Portal →
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>

                {/* Trust Metrics Row */}
                <View style={styles.heroMetricsGrid}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricVal}>1,400+</Text>
                    <Text style={styles.metricLabel}>Welfare Schemes</Text>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricItem}>
                    <Text style={styles.metricVal}>100%</Text>
                    <Text style={styles.metricLabel}>Paperless Wallet</Text>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricItem}>
                    <Text style={styles.metricVal}>22</Text>
                    <Text style={styles.metricLabel}>Indian Languages</Text>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricItem}>
                    <Text style={styles.metricVal}>24/7</Text>
                    <Text style={styles.metricLabel}>Online Tracking</Text>
                  </View>
                </View>
              </View>

              {/* Right Column India Gate & Tricolor Illustration */}
              <View style={styles.heroRightCol}>
                <Image
                  source={require('../../assets/images/hero-india-gate.png')}
                  style={styles.heroArtImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={[
                    '#084325',
                    'rgba(8, 67, 37, 0.75)',
                    'rgba(8, 67, 37, 0)',
                  ]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.heroArtBlendGradient}
                  pointerEvents="none"
                />
              </View>
            </LinearGradient>
          </View>

          {/* 4. OVERVIEW OF KEY CITIZEN SERVICES (5 COLOURFUL CARDS) */}
          <View style={styles.sectionArea}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionOrangeBar} />
                <View>
                  <Text style={styles.sectionTitle}>
                    Key Citizen Capabilities
                  </Text>
                  <Text style={styles.sectionSubtitle}>
                    All major central and state government services unified in one portal
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.featuresGrid}>
              {/* Feature 1: AI Assistant */}
              <TouchableOpacity
                onPress={() => (isAuthenticated ? router.push('/assistant') : handleLogin())}
                activeOpacity={0.85}
                style={[styles.featureCard, { borderColor: '#C7D2FE', backgroundColor: '#EEF2FF' }]}
              >
                <View style={[styles.cardIconBox, { backgroundColor: '#4F46E5' }]}>
                  <Text style={styles.cardIconEmoji}>🤖</Text>
                </View>
                <View style={styles.cardBadge}>
                  <Text style={[styles.cardBadgeText, { color: '#4F46E5' }]}>AI POWERED</Text>
                </View>
                <Text style={styles.cardHeading}>Smart AI Assistant</Text>
                <Text style={styles.cardDesc}>
                  Multilingual AI civic companion trained on government rules. Ask questions in Hindi, Kannada, Tamil, or English for instant answers.
                </Text>
                <Text style={[styles.cardActionLink, { color: '#4F46E5' }]}>
                  Ask AI Assistant →
                </Text>
              </TouchableOpacity>

              {/* Feature 2: DigiLocker Wallet */}
              <TouchableOpacity
                onPress={() => (isAuthenticated ? router.push('/digilocker' as any) : handleLogin())}
                activeOpacity={0.85}
                style={[styles.featureCard, { borderColor: '#C7D2FE', backgroundColor: '#EEF2FF' }]}
              >
                <View style={[styles.cardIconBox, { backgroundColor: '#4338CA' }]}>
                  <Text style={styles.cardIconEmoji}>📁</Text>
                </View>
                <View style={styles.cardBadge}>
                  <Text style={[styles.cardBadgeText, { color: '#4338CA' }]}>MEITY VERIFIED</Text>
                </View>
                <Text style={styles.cardHeading}>DigiLocker Document Wallet</Text>
                <Text style={styles.cardDesc}>
                  Upload, store, and access government-issued IDs, educational certificates, and driving licences legally valid under the IT Act.
                </Text>
                <Text style={[styles.cardActionLink, { color: '#4338CA' }]}>
                  Open Document Wallet →
                </Text>
              </TouchableOpacity>

              {/* Feature 3: Welfare Scheme Finder */}
              <TouchableOpacity
                onPress={() => (isAuthenticated ? router.push('/schemes/questionnaire' as any) : handleLogin())}
                activeOpacity={0.85}
                style={[styles.featureCard, { borderColor: '#A7F3D0', backgroundColor: '#ECFDF5' }]}
              >
                <View style={[styles.cardIconBox, { backgroundColor: '#10B981' }]}>
                  <Text style={styles.cardIconEmoji}>🌾</Text>
                </View>
                <View style={styles.cardBadge}>
                  <Text style={[styles.cardBadgeText, { color: '#047857' }]}>DIRECT BENEFIT</Text>
                </View>
                <Text style={styles.cardHeading}>Welfare Scheme Finder</Text>
                <Text style={styles.cardDesc}>
                  Answer 4 quick eligibility questions to discover agricultural subsidies, student scholarships, and healthcare benefits tailored to you.
                </Text>
                <Text style={[styles.cardActionLink, { color: '#047857' }]}>
                  Find Eligible Schemes →
                </Text>
              </TouchableOpacity>

              {/* Feature 4: Civic Grievances */}
              <TouchableOpacity
                onPress={() => (isAuthenticated ? router.push('/grievances' as any) : handleLogin())}
                activeOpacity={0.85}
                style={[styles.featureCard, { borderColor: '#FED7AA', backgroundColor: '#FFF7ED' }]}
              >
                <View style={[styles.cardIconBox, { backgroundColor: '#F97316' }]}>
                  <Text style={styles.cardIconEmoji}>📢</Text>
                </View>
                <View style={styles.cardBadge}>
                  <Text style={[styles.cardBadgeText, { color: '#C2410C' }]}>REAL-TIME TRACKING</Text>
                </View>
                <Text style={styles.cardHeading}>Civic Grievances Portal</Text>
                <Text style={styles.cardDesc}>
                  Report municipal issues including potholes, sanitation, water leakage, and streetlights with real-time tracking token until resolution.
                </Text>
                <Text style={[styles.cardActionLink, { color: '#C2410C' }]}>
                  Lodge Public Complaint →
                </Text>
              </TouchableOpacity>

              {/* Feature 5: Office Visits */}
              <TouchableOpacity
                onPress={() => (isAuthenticated ? router.push('/appointments/select-department' as any) : handleLogin())}
                activeOpacity={0.85}
                style={[styles.featureCard, { borderColor: '#BAE6FD', backgroundColor: '#F0FDFA' }]}
              >
                <View style={[styles.cardIconBox, { backgroundColor: '#0284C7' }]}>
                  <Text style={styles.cardIconEmoji}>📅</Text>
                </View>
                <View style={styles.cardBadge}>
                  <Text style={[styles.cardBadgeText, { color: '#0369A1' }]}>ZERO WAITING TIME</Text>
                </View>
                <Text style={styles.cardHeading}>Office Visits & Gatepass</Text>
                <Text style={styles.cardDesc}>
                  Book guaranteed time slots at Passport Seva Kendras (PSK), Transport RTOs, and Revenue Offices with digital tokens.
                </Text>
                <Text style={[styles.cardActionLink, { color: '#0284C7' }]}>
                  Schedule Office Visit →
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 5. HOW IT WORKS SECTION (3 SIMPLE STEPS) */}
          <View style={styles.howItWorksArea}>
            <View style={styles.sectionHeaderCenter}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>SIMPLE • TRANSPARENT • PAPERLESS</Text>
              </View>
              <Text style={styles.howHeading}>How Smart Bharat Works</Text>
              <Text style={styles.howSubtitle}>
                Access verified public services and welfare programs in three seamless steps
              </Text>
            </View>

            <View style={styles.stepsRow}>
              {/* Step 1 */}
              <View style={styles.stepCard}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>01</Text>
                </View>
                <View style={styles.stepIconCircle}>
                  <Text style={styles.stepEmoji}>🪪</Text>
                </View>
                <Text style={styles.stepTitle}>Create Citizen Account</Text>
                <Text style={styles.stepText}>
                  Register in under 60 seconds using your Mobile Number to activate your verified citizen identity.
                </Text>
              </View>

              {/* Step 2 */}
              <View style={styles.stepCard}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>02</Text>
                </View>
                <View style={styles.stepIconCircle}>
                  <Text style={styles.stepEmoji}>🏛️</Text>
                </View>
                <Text style={styles.stepTitle}>Access Verified Services</Text>
                <Text style={styles.stepText}>
                  Explore matched welfare subsidies, manage documents, book appointment slots, or report civic issues.
                </Text>
              </View>

              {/* Step 3 */}
              <View style={styles.stepCard}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>03</Text>
                </View>
                <View style={styles.stepIconCircle}>
                  <Text style={styles.stepEmoji}>📱</Text>
                </View>
                <Text style={styles.stepTitle}>Track & Receive Updates</Text>
                <Text style={styles.stepText}>
                  Receive official tracking tokens and monitor real-time progress updates directly from your dashboard.
                </Text>
              </View>
            </View>
          </View>

          {/* 6. CALL TO ACTION ENROLLMENT CARD */}
          <View style={styles.ctaBanner}>
            <LinearGradient
              colors={['#0F5932', '#14532D', '#166534']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaBannerGradient}
            >
              <View style={styles.ctaLeft}>
                <Text style={styles.ctaTitle}>Ready to Experience Smart Bharat?</Text>
                <Text style={styles.ctaDesc}>
                  Join fellow citizens across India. Registration is free, secure, and officially compliant.
                </Text>
              </View>

              <View style={styles.ctaRightButtons}>
                {isAuthenticated ? (
                  <TouchableOpacity
                    onPress={handleEnterDashboard}
                    activeOpacity={0.85}
                    style={styles.ctaGoldButton}
                  >
                    <Text style={styles.ctaGoldButtonText}>Open Citizen Dashboard ➔</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <TouchableOpacity
                      onPress={handleRegister}
                      activeOpacity={0.85}
                      style={styles.ctaGoldButton}
                    >
                      <Text style={styles.ctaGoldButtonText}>Sign Up as Citizen ➔</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleLogin}
                      activeOpacity={0.75}
                      style={styles.ctaGhostButton}
                    >
                      <Text style={styles.ctaGhostButtonText}>Sign In</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </LinearGradient>
          </View>

          {/* 7. GOVERNMENT OFFICIAL FOOTER */}
          <View style={styles.footerContainer}>
            {/* National Tricolor Top Bar */}
            <View style={styles.footerTricolorBar}>
              <View style={[styles.tricolorBand, { backgroundColor: '#FF9933' }]} />
              <View style={[styles.tricolorBand, { backgroundColor: '#FFFFFF' }]} />
              <View style={[styles.tricolorBand, { backgroundColor: '#138808' }]} />
            </View>

            <View style={styles.footerInner}>
              <View style={styles.footerBrandRow}>
                <View style={styles.footerEmblemBox}>
                  <Text style={styles.footerEmblemEmoji}>🏛️</Text>
                </View>
                <View>
                  <Text style={styles.footerBrandTitle}>Smart Bharat 🇮🇳</Text>
                  <Text style={styles.footerBrandDesc}>
                    National Citizen Gateway • Digital India Initiative • Ministry of Electronics & IT
                  </Text>
                </View>
              </View>

              {/* Help & Support Links */}
              <View style={styles.footerHelplinesRow}>
                <View style={styles.helplinePill}>
                  <Text style={styles.helplineTag}>Emergency</Text>
                  <Text style={styles.helplineVal}>112</Text>
                </View>
                <View style={styles.helplinePill}>
                  <Text style={styles.helplineTag}>Citizen Support</Text>
                  <Text style={styles.helplineVal}>1915</Text>
                </View>
                <View style={styles.helplinePill}>
                  <Text style={styles.helplineTag}>Cyber Helpline</Text>
                  <Text style={styles.helplineVal}>1930</Text>
                </View>
                <View style={styles.helplinePill}>
                  <Text style={styles.helplineTag}>DigiLocker</Text>
                  <Text style={styles.helplineVal}>support@digilocker.gov.in</Text>
                </View>
              </View>

              <View style={styles.footerDivider} />

              <View style={styles.footerBottomRow}>
                <Text style={styles.footerCopyright}>
                  © 2026 Government of India. All rights reserved. Designed & Developed for Smart Bharat.
                </Text>
                <Text style={styles.footerStandardNotice}>
                  Strictly Compliant with National e-Governance Standards
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E6F0E8',
  },

  // TOP GOV STRIP
  topGovStrip: {
    backgroundColor: '#EDF5EE',
    borderBottomWidth: 1,
    borderBottomColor: '#CADDCB',
    paddingVertical: 7,
    paddingHorizontal: 20,
  },
  topGovInner: {
    maxWidth: 1240,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topGovLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topGovEmblem: {
    fontSize: 14,
    marginRight: 8,
  },
  topGovText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#14532D',
    letterSpacing: 0.6,
  },
  topGovRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topGovLangText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B6350',
  },

  // MAIN NAV
  mainNav: {
    backgroundColor: '#EDF5EE',
    borderBottomWidth: 1,
    borderBottomColor: '#CADDCB',
    paddingVertical: 14,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  mainNavInner: {
    maxWidth: 1240,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emblemBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#14532D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#CADDCB',
  },
  emblemEmoji: {
    fontSize: 22,
  },
  emblemDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#F59E0B',
    borderWidth: 1.5,
    borderColor: '#EDF5EE',
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
  brandFlag: {
    fontSize: 16,
    marginLeft: 6,
  },
  brandSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B6350',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 2,
  },
  navActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navLoginBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#E0EDE1',
    borderWidth: 1,
    borderColor: '#CADDCB',
  },
  navLoginBtnText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#14532D',
  },
  navRegisterBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#14532D',
    shadowColor: '#14532D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  navRegisterBtnText: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  returningUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0EDE1',
    borderWidth: 1,
    borderColor: '#CADDCB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  userBadgeDot: {
    fontSize: 9,
    color: '#10B981',
    marginRight: 6,
  },
  userBadgeName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#14532D',
    maxWidth: 140,
  },
  navDashboardBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#14532D',
    shadowColor: '#14532D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  navDashboardBtnText: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  // SCROLL CONTENT
  scrollContainer: {
    flex: 1,
    backgroundColor: '#E6F0E8',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 70,
    alignItems: 'center',
  },
  maxContainer: {
    maxWidth: 1240,
    width: '100%',
  },

  // HERO SECTION
  heroWrapper: {
    borderRadius: 26,
    overflow: 'hidden',
    marginBottom: 36,
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
  heroGradient: {
    paddingVertical: Platform.OS === 'web' ? 48 : 32,
    paddingHorizontal: Platform.OS === 'web' ? 44 : 26,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: Platform.OS === 'web' ? 340 : 280,
    position: 'relative',
    overflow: 'hidden',
  },
  heroLeftCol: {
    flex: 1,
    maxWidth: Platform.OS === 'web' ? 620 : 360,
    zIndex: 3,
  },
  heroBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  heroBadgeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FEF3C7',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heroHeading: {
    fontSize: Platform.OS === 'web' ? 44 : 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.6,
    lineHeight: Platform.OS === 'web' ? 52 : 38,
  },
  heroHeadingHighlight: {
    color: '#F59E0B',
  },
  heroDescription: {
    fontSize: Platform.OS === 'web' ? 17 : 15,
    fontWeight: '500',
    color: '#D1FAE5',
    marginTop: 12,
    marginBottom: 24,
    lineHeight: Platform.OS === 'web' ? 26 : 22,
  },
  heroCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 28,
  },
  heroPrimaryBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 3,
  },
  heroPrimaryBtnText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  heroSecondaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 26,
    paddingVertical: 13,
    borderRadius: 20,
  },
  heroSecondaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  heroMetricsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.18)',
    gap: 20,
  },
  metricItem: {
    alignItems: 'flex-start',
  },
  metricVal: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FEF3C7',
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A7F3D0',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroRightCol: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: Platform.OS === 'web' ? '54%' : '60%',
    height: '100%',
    overflow: 'hidden',
    zIndex: 1,
  },
  heroArtImage: {
    width: '100%',
    height: '100%',
  },
  heroArtBlendGradient: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 100,
    zIndex: 2,
  },

  // SECTION AREA
  sectionArea: {
    marginBottom: 44,
  },
  sectionHeader: {
    marginBottom: 24,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionOrangeBar: {
    width: 5,
    height: 40,
    borderRadius: 2.5,
    backgroundColor: '#F97316',
    marginRight: 14,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#14532D',
    letterSpacing: -0.4,
  },
  sectionSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 4,
    lineHeight: 22,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  featureCard: {
    flex: 1,
    minWidth: Platform.OS === 'web' ? 340 : '100%',
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 26,
    ...Platform.select({
      ios: {
        shadowColor: '#14532D',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  cardIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIconEmoji: {
    fontSize: 24,
  },
  cardBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardBadgeText: {
    fontSize: 11.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cardHeading: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  cardDesc: {
    fontSize: 15,
    fontWeight: '500',
    color: '#475569',
    lineHeight: 22,
    marginBottom: 18,
  },
  cardActionLink: {
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  // HOW IT WORKS
  howItWorksArea: {
    marginBottom: 44,
    backgroundColor: '#F3F8F4',
    borderWidth: 1,
    borderColor: '#CADDCB',
    borderRadius: 28,
    paddingVertical: 36,
    paddingHorizontal: 28,
  },
  sectionHeaderCenter: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepBadge: {
    backgroundColor: '#E0EDE1',
    borderWidth: 1,
    borderColor: '#CADDCB',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
    marginBottom: 12,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#14532D',
    letterSpacing: 0.8,
  },
  howHeading: {
    fontSize: 28,
    fontWeight: '900',
    color: '#14532D',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  howSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 580,
    lineHeight: 24,
  },
  stepsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  stepCard: {
    flex: 1,
    minWidth: Platform.OS === 'web' ? 300 : '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CADDCB',
    borderRadius: 22,
    padding: 24,
    position: 'relative',
  },
  stepNumberBadge: {
    position: 'absolute',
    top: 18,
    right: 18,
    backgroundColor: '#EDF5EE',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#14532D',
  },
  stepIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EDF5EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepEmoji: {
    fontSize: 26,
  },
  stepTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
  },
  stepText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 22,
  },

  // CTA BANNER
  ctaBanner: {
    borderRadius: 26,
    overflow: 'hidden',
    marginBottom: 44,
    ...Platform.select({
      ios: {
        shadowColor: '#14532D',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
      default: {},
    }),
  },
  ctaBannerGradient: {
    paddingVertical: 36,
    paddingHorizontal: 32,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    alignItems: Platform.OS === 'web' ? 'center' : 'flex-start',
    justifyContent: 'space-between',
    gap: 24,
  },
  ctaLeft: {
    flex: 1,
    maxWidth: 620,
  },
  ctaTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  ctaDesc: {
    fontSize: 16,
    fontWeight: '500',
    color: '#D1FAE5',
    marginTop: 8,
    lineHeight: 24,
  },
  ctaRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 14,
  },
  ctaGoldButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 2,
  },
  ctaGoldButtonText: {
    color: '#0F172A',
    fontSize: 15.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  ctaGhostButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 20,
  },
  ctaGhostButtonText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '800',
  },

  // FOOTER
  footerContainer: {
    backgroundColor: '#EDF5EE',
    borderWidth: 1,
    borderColor: '#CADDCB',
    borderRadius: 26,
    overflow: 'hidden',
  },
  footerTricolorBar: {
    flexDirection: 'row',
    height: 5,
    width: '100%',
  },
  tricolorBand: {
    flex: 1,
    height: '100%',
  },
  footerInner: {
    padding: 28,
  },
  footerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },
  footerEmblemBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#14532D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  footerEmblemEmoji: {
    fontSize: 20,
  },
  footerBrandTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0F172A',
  },
  footerBrandDesc: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B6350',
    marginTop: 2,
  },
  footerHelplinesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 22,
  },
  helplinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0EDE1',
    borderWidth: 1,
    borderColor: '#CADDCB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  helplineTag: {
    fontSize: 12,
    fontWeight: '800',
    color: '#14532D',
    marginRight: 6,
  },
  helplineVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  footerDivider: {
    height: 1,
    backgroundColor: '#CADDCB',
    marginBottom: 18,
  },
  footerBottomRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    justifyContent: 'space-between',
    alignItems: Platform.OS === 'web' ? 'center' : 'flex-start',
    gap: 8,
  },
  footerCopyright: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  footerStandardNotice: {
    fontSize: 12.5,
    color: '#14532D',
    fontWeight: '700',
  },
});

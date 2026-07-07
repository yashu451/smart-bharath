import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

// Simulated login check function (can be replaced with real auth check later)
const checkSessionStatus = async (): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  // Change to true to test the logged-in user flow
  const isLoggedIn = false;
  return isLoggedIn;
};

export default function SplashScreen() {
  const router = useRouter();

  // Animation values
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Logo Scale & Fade in
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 20,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Text Fade in with small delay
    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 1000,
      delay: 500,
      useNativeDriver: true,
    }).start();

    // 3. Ring Rotation (continuous rotation)
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 15000,
        useNativeDriver: true,
      })
    ).start();

    // 4. Custom loading progress bar filling up
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2300,
      useNativeDriver: false,
    }).start();

    // 5. Navigate based on session check after splash duration
    const performRouting = async () => {
      const isLoggedIn = await checkSessionStatus();
      // Ensure splash shows for at least 2.5 seconds (2500ms)
      setTimeout(() => {
        if (isLoggedIn) {
          router.replace('/home');
        } else {
          router.replace('/auth');
        }
      }, 500);
    };

    performRouting();
  }, []);

  // Interpolations
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <LinearGradient
      colors={['#FFFFFF', '#F0F5FC']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <StatusBar barStyle="dark-content" />

      {/* Main Visual Content wrapper */}
      <View style={styles.content}>
        {/* Abstract Dynamic Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: logoScale }],
              opacity: logoOpacity,
            },
          ]}
        >
          {/* Rotating Outer Connectivity Ring & Orbital Nodes */}
          <Animated.View style={[styles.outerRing, { transform: [{ rotate }] }]}>
            {/* Inner Diagonal Ring */}
            <View style={styles.diagonalRing} />

            {/* Orbiting data nodes representing AI / Citizens */}
            <View style={[styles.node, styles.saffronNode]} />
            <View style={[styles.node, styles.greenNode]} />
            <View style={[styles.node, styles.blueNode]} />
          </Animated.View>

          {/* Middle Governance Shield & AI Pulsing Core */}
          <View style={styles.governanceShield}>
            <View style={styles.governanceCrest}>
              <View style={styles.aiCoreGlow} />
            </View>
          </View>
        </Animated.View>

        {/* Text Details (Title and Subtitle) */}
        <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
          <Text style={styles.title}>Smart Bharat</Text>
          <Text style={styles.subtitle}>Your AI Civic Companion</Text>
        </Animated.View>
      </View>

      {/* Bottom Loading Progress Bar */}
      <View style={styles.loaderContainer}>
        <View style={styles.progressBarBg}>
          <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
        </View>
        <Text style={styles.versionText}>v1.0.0 (Secure Beta)</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  logoContainer: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  outerRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  diagonalRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.25)',
    transform: [{ rotate: '45deg' }],
  },
  node: {
    position: 'absolute',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1.5,
    elevation: 2,
  },
  saffronNode: {
    width: 10,
    height: 10,
    backgroundColor: '#FF9933',
    top: -5,
  },
  greenNode: {
    width: 8,
    height: 8,
    backgroundColor: '#138808',
    bottom: 20,
    right: 5,
  },
  blueNode: {
    width: 7,
    height: 7,
    backgroundColor: '#4A90E2',
    bottom: 25,
    left: 8,
  },
  governanceShield: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 128, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  governanceCrest: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#000080',
    transform: [{ rotate: '45deg' }],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000080',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  aiCoreGlow: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4A90E2',
    transform: [{ rotate: '-45deg' }],
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#0B132B',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginTop: 8,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  progressBarBg: {
    width: 140,
    height: 3,
    backgroundColor: '#E2E8F0',
    borderRadius: 1.5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 1.5,
  },
  versionText: {
    fontSize: 10,
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
});

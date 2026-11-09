import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';

export function BottomTricolorWaves() {
  if (Platform.OS === 'web') {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 90,
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        <svg
          viewBox="0 0 1200 90"
          preserveAspectRatio="none"
          style={{ width: '100%', height: '100%' }}
        >
          <defs>
            {/* Rolling Hills Gradient */}
            <linearGradient id="hillSageGrad1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D5E8D7" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#C4DFC7" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="hillSageGrad2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#CCE3CF" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#BAD7BE" stopOpacity="1" />
            </linearGradient>

            {/* Tricolor Ribbon Gradients */}
            <linearGradient id="bottomSaffron" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FF9933" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#F97316" stopOpacity="0.85" />
              <stop offset="65%" stopColor="#F97316" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#FF9933" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="bottomGreen" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#138808" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#16A34A" stopOpacity="0.85" />
              <stop offset="65%" stopColor="#16A34A" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#138808" stopOpacity="0.95" />
            </linearGradient>
          </defs>

          {/* Background Soft Sage Rolling Hills Layer 1 */}
          <path
            d="M 0 65 Q 160 30 360 52 Q 600 25 840 50 Q 1040 28 1200 60 L 1200 90 L 0 90 Z"
            fill="url(#hillSageGrad1)"
          />

          {/* Background Soft Sage Rolling Hills Layer 2 */}
          <path
            d="M 0 72 Q 220 40 480 62 Q 720 38 980 60 L 1200 68 L 1200 90 L 0 90 Z"
            fill="url(#hillSageGrad2)"
          />

          {/* Flowing Tricolor Wave Ribbons */}
          {/* Saffron Wave */}
          <path
            d="M 0 76 C 180 52, 380 72, 600 62 C 820 52, 1020 72, 1200 65 L 1200 75 C 1020 82, 820 62, 600 72 C 380 82, 180 62, 0 86 Z"
            fill="url(#bottomSaffron)"
          />

          {/* White Wave */}
          <path
            d="M 0 81 C 180 58, 380 77, 600 67 C 820 57, 1020 77, 1200 71 L 1200 79 C 1020 85, 820 66, 600 75 C 380 85, 180 67, 0 90 Z"
            fill="#FFFFFF"
            opacity="0.92"
          />

          {/* Green Wave */}
          <path
            d="M 0 86 C 180 64, 380 82, 600 73 C 820 63, 1020 82, 1200 76 L 1200 90 L 0 90 Z"
            fill="url(#bottomGreen)"
          />

          {/* Decorative Corner Botanical Foliage (Bottom-Left) */}
          <g transform="translate(10, 30)">
            <path
              d="M 0 55 C 8 35, 28 20, 48 18 C 36 28, 25 42, 20 58 Z"
              fill="#15803D"
            />
            <path
              d="M 12 58 C 24 38, 46 28, 68 28 C 54 38, 42 50, 35 60 Z"
              fill="#F59E0B"
              opacity="0.9"
            />
            <path
              d="M 26 60 C 38 45, 58 38, 78 40 C 64 48, 52 56, 46 62 Z"
              fill="#166534"
            />
          </g>

          {/* Decorative Corner Botanical Foliage (Bottom-Right) */}
          <g transform="translate(1130, 32)">
            <path
              d="M 60 55 C 52 35, 32 20, 12 18 C 24 28, 35 42, 40 58 Z"
              fill="#15803D"
            />
            <path
              d="M 48 58 C 36 38, 14 28, -8 28 C 6 38, 18 50, 25 60 Z"
              fill="#22C55E"
              opacity="0.85"
            />
            <path
              d="M 34 60 C 22 45, 2 38, -18 40 C -4 48, 8 56, 14 62 Z"
              fill="#166534"
            />
          </g>
        </svg>
      </div>
    );
  }

  return (
    <View style={styles.nativeWaveBar} pointerEvents="none">
      <View style={[styles.band, { backgroundColor: '#FF9933' }]} />
      <View style={[styles.band, { backgroundColor: '#FFFFFF' }]} />
      <View style={[styles.band, { backgroundColor: '#138808' }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  nativeWaveBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 8,
    flexDirection: 'row',
  },
  band: {
    flex: 1,
    height: '100%',
    opacity: 0.85,
  },
});

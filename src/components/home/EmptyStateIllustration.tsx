import React from 'react';
import { View, Platform, Text, StyleSheet } from 'react-native';

export function EmptyStateIllustration({ size = 56 }: { size?: number }) {
  if (Platform.OS === 'web') {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#ECFDF5',
          border: '1.5px solid #A7F3D0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <svg
          viewBox="0 0 100 100"
          style={{ width: '68%', height: '68%' }}
          fill="none"
        >
          {/* Left Laurel Leaves */}
          <path
            d="M 18 56 C 14 44, 20 32, 28 26 C 28 34, 24 46, 26 54"
            fill="#10B981"
            opacity="0.8"
          />
          <path
            d="M 12 70 C 8 60, 12 50, 18 45 C 20 52, 18 64, 18 70"
            fill="#059669"
            opacity="0.7"
          />

          {/* Right Laurel Leaves */}
          <path
            d="M 82 56 C 86 44, 80 32, 72 26 C 72 34, 76 46, 74 54"
            fill="#10B981"
            opacity="0.8"
          />
          <path
            d="M 88 70 C 92 60, 88 50, 82 45 C 80 52, 82 64, 82 70"
            fill="#059669"
            opacity="0.7"
          />

          {/* Clipboard Board Body */}
          <rect
            x="26"
            y="22"
            width="48"
            height="62"
            rx="6"
            fill="#FFFFFF"
            stroke="#14532D"
            strokeWidth="3.5"
          />

          {/* Clipboard Top Clip */}
          <rect
            x="38"
            y="15"
            width="24"
            height="12"
            rx="3"
            fill="#047857"
            stroke="#14532D"
            strokeWidth="2.5"
          />
          <circle cx="50" cy="18" r="2" fill="#FFFFFF" />

          {/* Green Checkmark */}
          <path
            d="M 37 54 L 46 64 L 64 42"
            stroke="#10B981"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Little Checkmark Star / Sparkle */}
          <circle cx="68" cy="36" r="2.5" fill="#F59E0B" />
        </svg>
      </div>
    );
  }

  return (
    <View style={styles.nativeCircle}>
      <Text style={{ fontSize: 28 }}>📋</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  nativeCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});


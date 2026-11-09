import React from 'react';
import { View, Platform, StyleSheet, Text } from 'react-native';

export function AshokaEmblem({ size = 38 }: { size?: number }) {
  if (Platform.OS === 'web') {
    return (
      <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg
          viewBox="0 0 100 115"
          style={{ width: '100%', height: '100%' }}
          fill="#1E293B"
        >
          {/* Top 3 Lions Heads Silhouette */}
          {/* Central Lion */}
          <path d="M 44 8 C 44 4, 56 4, 56 8 C 60 8, 62 12, 60 16 C 62 20, 60 26, 56 30 C 56 38, 44 38, 44 30 C 40 26, 38 20, 40 16 C 38 12, 40 8, 44 8 Z" />
          <circle cx="47" cy="18" r="1.5" fill="#FFFFFF" />
          <circle cx="53" cy="18" r="1.5" fill="#FFFFFF" />
          <path d="M 46 24 Q 50 26 54 24" stroke="#FFFFFF" strokeWidth="1.2" fill="none" />

          {/* Left Lion Head & Mane */}
          <path d="M 28 14 C 28 10, 38 10, 39 16 C 41 22, 38 28, 33 32 C 26 34, 22 28, 24 22 C 22 18, 25 14, 28 14 Z" />
          <circle cx="30" cy="22" r="1.2" fill="#FFFFFF" />

          {/* Right Lion Head & Mane */}
          <path d="M 72 14 C 72 10, 62 10, 61 16 C 59 22, 62 28, 67 32 C 74 34, 78 28, 76 22 C 78 18, 75 14, 72 14 Z" />
          <circle cx="70" cy="22" r="1.2" fill="#FFFFFF" />

          {/* Lions Bodies & Paws Upper Section */}
          <path d="M 22 34 L 78 34 L 74 58 L 26 58 Z" />
          {/* Mane Curls Details */}
          <path d="M 32 38 Q 36 44 32 50" stroke="#FFFFFF" strokeWidth="1" fill="none" opacity="0.4" />
          <path d="M 50 36 Q 50 44 50 52" stroke="#FFFFFF" strokeWidth="1" fill="none" opacity="0.4" />
          <path d="M 68 38 Q 64 44 68 50" stroke="#FFFFFF" strokeWidth="1" fill="none" opacity="0.4" />

          {/* Front Paws Standing */}
          <rect x="30" y="58" width="8" height="12" rx="2" />
          <rect x="42" y="58" width="6" height="12" rx="1.5" />
          <rect x="52" y="58" width="6" height="12" rx="1.5" />
          <rect x="62" y="58" width="8" height="12" rx="2" />

          {/* Abacus Platform Bar */}
          <rect x="14" y="70" width="72" height="6" rx="2" />

          {/* Ashoka Chakra in Center of Abacus */}
          <circle cx="50" cy="84" r="9" stroke="#1E293B" strokeWidth="2" fill="#FFFFFF" />
          <circle cx="50" cy="84" r="2" fill="#1E293B" />
          {/* Chakra Spokes */}
          <line x1="50" y1="76" x2="50" y2="92" stroke="#1E293B" strokeWidth="0.8" />
          <line x1="42" y1="84" x2="58" y2="84" stroke="#1E293B" strokeWidth="0.8" />
          <line x1="44" y1="78" x2="56" y2="90" stroke="#1E293B" strokeWidth="0.8" />
          <line x1="56" y1="78" x2="44" y2="90" stroke="#1E293B" strokeWidth="0.8" />

          {/* Galloping Horse on Left */}
          <path d="M 22 81 C 24 78, 30 78, 34 83 C 32 87, 24 88, 22 81 Z" />

          {/* Bull on Right */}
          <path d="M 78 81 C 76 78, 70 78, 66 83 C 68 87, 76 88, 78 81 Z" />

          {/* Inverted Lotus Bell Base */}
          <path d="M 20 96 C 26 108, 74 108, 80 96 Z" fill="#1E293B" />
          <path d="M 16 94 L 84 94 L 80 97 L 20 97 Z" />
          {/* Base Plinth */}
          <rect x="18" y="108" width="64" height="4" rx="2" />
        </svg>
      </div>
    );
  }

  return (
    <View style={styles.nativeContainer}>
      <Text style={{ fontSize: size * 0.7 }}>🏛️</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  nativeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});


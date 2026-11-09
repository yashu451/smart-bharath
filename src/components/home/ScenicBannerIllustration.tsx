import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';

export function ScenicBannerIllustration() {
  if (Platform.OS === 'web') {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <svg
          viewBox="0 0 460 170"
          preserveAspectRatio="xMaxYMid slice"
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            right: 0,
            top: 0,
          }}
        >
          <defs>
            {/* Sun Glow Gradient */}
            <radialGradient id="sunGlow" cx="62%" cy="45%" r="45%">
              <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#D97706" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0B4D2B" stopOpacity="0" />
            </radialGradient>

            {/* India Gate Sandstone Gradient */}
            <linearGradient id="sandstoneGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="45%" stopColor="#E2A64B" />
              <stop offset="100%" stopColor="#C47D28" />
            </linearGradient>

            {/* Gate Shadow Gradient */}
            <linearGradient id="gateArchShadow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5B3310" />
              <stop offset="80%" stopColor="#301A06" />
              <stop offset="100%" stopColor="#0B4D2B" />
            </linearGradient>

            {/* Foliage Green Gradients */}
            <linearGradient id="foliageGrad1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22C55E" />
              <stop offset="100%" stopColor="#14532D" />
            </linearGradient>
            <linearGradient id="foliageGrad2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#16A34A" />
              <stop offset="100%" stopColor="#064E3B" />
            </linearGradient>

            {/* Tricolor Ribbon Gradients */}
            <linearGradient id="saffronGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F97316" stopOpacity="0.8" />
              <stop offset="35%" stopColor="#FF9933" />
              <stop offset="70%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>
            <linearGradient id="whiteGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
              <stop offset="40%" stopColor="#FFFFFF" />
              <stop offset="75%" stopColor="#F1F5F9" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>
            <linearGradient id="greenGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#15803D" stopOpacity="0.8" />
              <stop offset="35%" stopColor="#138808" />
              <stop offset="70%" stopColor="#16A34A" />
              <stop offset="100%" stopColor="#14532D" />
            </linearGradient>
          </defs>

          {/* Golden Atmosphere Glow behind India Gate */}
          <ellipse cx="280" cy="85" rx="130" ry="75" fill="url(#sunGlow)" />

          {/* Flying Birds in Sky */}
          <g fill="#E2E8F0" opacity="0.85">
            {/* Bird 1 */}
            <path d="M 175 42 Q 182 36 189 40 Q 196 36 203 42 Q 196 40 189 45 Q 182 40 175 42 Z" transform="scale(0.7) translate(30, 10)" />
            {/* Bird 2 */}
            <path d="M 210 32 Q 216 27 222 30 Q 228 27 234 32 Q 228 30 222 34 Q 216 30 210 32 Z" transform="scale(0.65) translate(80, 5)" />
            {/* Bird 3 */}
            <path d="M 235 48 Q 240 44 246 47 Q 252 44 257 48 Q 252 46 246 50 Q 240 46 235 48 Z" transform="scale(0.6) translate(110, 20)" />
            {/* Bird 4 */}
            <path d="M 255 36 Q 259 33 264 35 Q 269 33 273 36 Q 269 35 264 38 Q 259 35 255 36 Z" transform="scale(0.55) translate(140, 12)" />
          </g>

          {/* Background Rolling Hills / Distant Tree Line */}
          <path
            d="M 120 170 Q 160 135 210 145 Q 250 130 300 142 Q 350 128 410 148 L 460 142 L 460 170 Z"
            fill="url(#foliageGrad2)"
            opacity="0.8"
          />

          {/* Lush Tree Clusters Left of Monument */}
          <g>
            <circle cx="150" cy="152" r="22" fill="url(#foliageGrad1)" />
            <circle cx="172" cy="148" r="26" fill="url(#foliageGrad2)" />
            <circle cx="192" cy="154" r="20" fill="url(#foliageGrad1)" />
            <circle cx="210" cy="150" r="24" fill="url(#foliageGrad2)" />
            <circle cx="230" cy="155" r="18" fill="url(#foliageGrad1)" />
          </g>

          {/* Lush Tree Clusters Right of Monument */}
          <g>
            <circle cx="340" cy="156" r="20" fill="url(#foliageGrad1)" />
            <circle cx="358" cy="150" r="24" fill="url(#foliageGrad2)" />
            <circle cx="380" cy="152" r="22" fill="url(#foliageGrad1)" />
            <circle cx="405" cy="148" r="26" fill="url(#foliageGrad2)" />
            <circle cx="435" cy="154" r="28" fill="url(#foliageGrad1)" />
          </g>

          {/* Detailed India Gate Monument (Sandstone/Warm Ochre) */}
          <g id="indiaGate" transform="translate(248, 48)">
            {/* Monument Stepped Plinth / Base */}
            <rect x="0" y="88" width="76" height="5" rx="1.5" fill="#C47D28" />
            <rect x="3" y="84" width="70" height="4" fill="#D97706" />
            <rect x="6" y="80" width="64" height="4" fill="#E2A64B" />

            {/* Main Pylons (Left and Right Blocks) */}
            <rect x="8" y="24" width="60" height="56" rx="2" fill="url(#sandstoneGrad)" />

            {/* Left Pylon Recessed Panels */}
            <rect x="12" y="32" width="12" height="40" rx="1" fill="#C47D28" opacity="0.3" />
            <rect x="14" y="34" width="8" height="36" fill="#FDE68A" opacity="0.25" />

            {/* Right Pylon Recessed Panels */}
            <rect x="52" y="32" width="12" height="40" rx="1" fill="#C47D28" opacity="0.3" />
            <rect x="54" y="34" width="8" height="36" fill="#FDE68A" opacity="0.25" />

            {/* Grand Central Archway */}
            <path
              d="M 28 80 L 28 46 Q 38 32 48 46 L 48 80 Z"
              fill="url(#gateArchShadow)"
            />
            {/* Inner Arch Trim / Moulding */}
            <path
              d="M 26 80 L 26 45 Q 38 28 50 45 L 50 80"
              stroke="#FDE68A"
              strokeWidth="1.5"
              fill="none"
              opacity="0.9"
            />
            {/* Archway Keystone */}
            <polygon points="36,33 40,33 41,37 35,37" fill="#FDE68A" />

            {/* Entablature & Cornice Layers */}
            <rect x="6" y="20" width="64" height="4" fill="#C47D28" />
            <rect x="4" y="16" width="68" height="4" fill="#FDE68A" />
            <rect x="8" y="12" width="60" height="4" fill="#E2A64B" />

            {/* Attic / Upper Top Tier with Inscription Band */}
            <rect x="11" y="4" width="54" height="8" rx="1" fill="url(#sandstoneGrad)" />
            {/* Central Attic Inscription Panel */}
            <rect x="16" y="6" width="44" height="4" fill="#92400E" opacity="0.4" />

            {/* Top Cenotaph Dome / Shallow Bowl Finial */}
            <ellipse cx="38" cy="3" rx="14" ry="2.5" fill="#FDE68A" />
            <ellipse cx="38" cy="1.5" rx="8" ry="1.5" fill="#C47D28" />
          </g>

          {/* Foreground Low Foliage Accents */}
          <g>
            <circle cx="242" cy="164" r="14" fill="#15803D" />
            <circle cx="260" cy="166" r="12" fill="#22C55E" />
            <circle cx="312" cy="165" r="13" fill="#16A34A" />
            <circle cx="330" cy="163" r="16" fill="#14532D" />
          </g>

          {/* Elegant Sweeping Indian Tricolor Ribbon (Flows dynamically behind/across right side) */}
          <g id="tricolorRibbon" opacity="0.95">
            {/* Saffron Band */}
            <path
              d="M 210 108 
                 C 255 76, 310 92, 350 78 
                 C 390 64, 420 86, 460 76 
                 L 460 90 
                 C 420 100, 390 78, 350 92 
                 C 310 106, 255 90, 210 122 Z"
              fill="url(#saffronGrad)"
            />
            {/* White Band */}
            <path
              d="M 210 122 
                 C 255 90, 310 106, 350 92 
                 C 390 78, 420 100, 460 90 
                 L 460 104 
                 C 420 114, 390 92, 350 106 
                 C 310 120, 255 104, 210 136 Z"
              fill="url(#whiteGrad)"
            />
            {/* Green Band */}
            <path
              d="M 210 136 
                 C 255 104, 310 120, 350 106 
                 C 390 92, 420 114, 460 104 
                 L 460 118 
                 C 420 128, 390 106, 350 120 
                 C 310 134, 255 118, 210 150 Z"
              fill="url(#greenGrad)"
            />
          </g>
        </svg>
      </div>
    );
  }

  // Native iOS / Android Fallback
  return (
    <View style={styles.nativeFallback}>
      <View style={styles.monumentBox}>
        <View style={styles.monumentPillarLeft} />
        <View style={styles.monumentArch} />
        <View style={styles.monumentPillarRight} />
      </View>
      <View style={styles.nativeTricolorBar}>
        <View style={[styles.nativeBand, { backgroundColor: '#FF9933' }]} />
        <View style={[styles.nativeBand, { backgroundColor: '#FFFFFF' }]} />
        <View style={[styles.nativeBand, { backgroundColor: '#138808' }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nativeFallback: {
    position: 'absolute',
    right: 14,
    bottom: 12,
    alignItems: 'center',
    opacity: 0.9,
  },
  monumentBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: 60,
    height: 48,
    marginBottom: 6,
  },
  monumentPillarLeft: {
    width: 14,
    height: 48,
    backgroundColor: '#FDE68A',
    borderRadius: 2,
  },
  monumentArch: {
    flex: 1,
    height: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 3,
    borderColor: '#FDE68A',
    borderBottomWidth: 0,
    marginHorizontal: 2,
  },
  monumentPillarRight: {
    width: 14,
    height: 48,
    backgroundColor: '#FDE68A',
    borderRadius: 2,
  },
  nativeTricolorBar: {
    flexDirection: 'row',
    width: 70,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  nativeBand: {
    flex: 1,
    height: '100%',
  },
});


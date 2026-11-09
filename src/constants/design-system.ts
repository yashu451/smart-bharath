export const DesignSystem = {
  colors: {
    // Primary Soft Sage-Green Application Background (#E6F0E8)
    sageBg: '#E6F0E8',
    sageLight: '#EDF5EE',
    sageMuted: '#DCEADC',
    sageBorder: '#CADDCB',
    sageSurface: '#F3F8F4',

    // Complementary Surfaces
    creamSurface: '#FBF9F4',
    cardBg: '#F5FAF5',
    inputBg: '#EDF5EE',
    border: '#CADDCB',
    borderLight: '#D8E6D9',

    // Primary Deep Forest Green
    forest: '#14532D',
    forestDark: '#0A3D24',
    forestHero: '#084325',
    forestLight: '#ECFDF5',
    forestBorder: '#A7F3D0',

    // Saffron & Warm Accents
    saffron: '#F97316',
    saffronWarm: '#EA580C',
    saffronGold: '#F59E0B',
    saffronLight: '#FFF7ED',

    // Card Themed Accents (from reference image)
    lavender: {
      bg: '#EEF2FF',
      gradient: ['#EEF2FF', '#E0E7FF'] as const,
      border: '#C7D2FE',
      iconBg: '#6366F1',
      text: '#4338CA',
    },
    mint: {
      bg: '#ECFDF5',
      gradient: ['#ECFDF5', '#D1FAE5'] as const,
      border: '#A7F3D0',
      iconBg: '#10B981',
      text: '#065F46',
    },
    peach: {
      bg: '#FFF7ED',
      gradient: ['#FFF7ED', '#FFEDD5'] as const,
      border: '#FED7AA',
      iconBg: '#F97316',
      text: '#9A3412',
    },
    sky: {
      bg: '#F0FDFA',
      gradient: ['#F0FDFA', '#CFFAFE'] as const,
      border: '#BAE6FD',
      iconBg: '#0284C7',
      text: '#075985',
    },
    rose: {
      bg: '#FFF1F2',
      gradient: ['#FFF1F2', '#FFE4E6'] as const,
      border: '#FECDD3',
      iconBg: '#F43F5E',
      text: '#9F1239',
    },

    // Text Hierarchy
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',
    textOnDark: '#FFFFFF',
    textOnDarkMuted: '#D1FAE5',

    // Status Badges
    statusActiveBg: '#ECFDF5',
    statusActiveText: '#10B981',
    statusPendingBg: '#FFFBEB',
    statusPendingText: '#D97706',
    statusActionBg: '#FEF2F2',
    statusActionText: '#EF4444',
  },

  shadows: {
    hero: {
      shadowColor: '#0A3D24',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 18,
      elevation: 6,
    },
    card: {
      shadowColor: '#14532D',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    floating: {
      shadowColor: '#14532D',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.10,
      shadowRadius: 18,
      elevation: 8,
    },
  },
};

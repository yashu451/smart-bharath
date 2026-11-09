/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#F5FAF5',
          100: '#EDF5EE',
          200: '#DCEADC',
          300: '#CADDCB',
          400: '#B2CDB4',
          500: '#94B797',
          DEFAULT: '#E6F0E8',
          bg: '#E6F0E8',       // Main Soft Sage-Green Application Background
          surface: '#F3F8F4',  // Light Sage Surface
          card: '#F6FAF6',     // Card Tint
          border: '#CADDCB',   // Sage Border
        },
        cream: {
          50: '#FDFBF7',
          100: '#FAF7F0',
          200: '#F5EFE4',
          DEFAULT: '#FBF9F4',  // Warm Cream Surface
          card: '#FBF9F4',
        },
        forest: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
          950: '#052E16',
          primary: '#14532D',   // Deep Forest Green
          dark: '#0B3B20',      // Ultra deep forest
          hero: '#0A4426',      // Hero banner forest
        },
        ivory: {
          50: '#FDFBF7',
          100: '#FAF7F2',
          200: '#F5EFE6',
          300: '#EFE6D8',
          bg: '#E6F0E8',        // Sage-green app background
          card: '#F6FAF6',
          border: '#CADDCB',
        },
        saffron: {
          light: '#FFF7ED',
          DEFAULT: '#F97316',
          warm: '#EA580C',
          gold: '#F59E0B',
        },
        mint: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          DEFAULT: '#10B981',
          dark: '#059669',
        },
        lavender: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          DEFAULT: '#6366F1',
          dark: '#4F46E5',
        },
        peach: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          DEFAULT: '#F97316',
          dark: '#EA580C',
        },
        skyTeal: {
          50: '#F0FDFA',
          100: '#CFFAFE',
          200: '#BAE6FD',
          DEFAULT: '#0284C7',
          dark: '#0369A1',
        },
      },
    },
  },
  plugins: [],
};

import React from 'react';
import { Platform } from 'react-native';

interface WatermarkProps {
  type: 'digilocker' | 'schemes' | 'grievances' | 'appointments' | 'assistant';
  color: string;
}

export function QuickActionWatermark({ type, color }: WatermarkProps) {
  if (Platform.OS !== 'web') return null;

  return (
    <div
      style={{
        position: 'absolute',
        right: -8,
        bottom: -6,
        width: 82,
        height: 82,
        pointerEvents: 'none',
        opacity: 0.12,
        zIndex: 0,
      }}
    >
      {type === 'assistant' && (
        <svg viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="6" style={{ width: '100%', height: '100%' }}>
          <rect x="22" y="30" width="56" height="46" rx="14" />
          <line x1="50" y1="16" x2="50" y2="30" strokeWidth="6" strokeLinecap="round" />
          <circle cx="50" cy="14" r="5" fill={color} />
          <circle cx="38" cy="50" r="5" fill={color} />
          <circle cx="62" cy="50" r="5" fill={color} />
          <path d="M 38 64 Q 50 72 62 64" strokeWidth="5" strokeLinecap="round" />
          <rect x="12" y="44" width="8" height="18" rx="4" fill={color} />
          <rect x="80" y="44" width="8" height="18" rx="4" fill={color} />
        </svg>
      )}
      {type === 'digilocker' && (
        <svg viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="6" style={{ width: '100%', height: '100%' }}>
          <rect x="18" y="22" width="64" height="68" rx="8" />
          <path d="M 32 38 L 68 38" strokeWidth="6" strokeLinecap="round" />
          <path d="M 32 52 L 58 52" strokeWidth="6" strokeLinecap="round" />
          <path d="M 32 66 L 48 66" strokeWidth="6" strokeLinecap="round" />
          <circle cx="68" cy="66" r="10" strokeWidth="5" />
        </svg>
      )}

      {type === 'schemes' && (
        <svg viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="5" style={{ width: '100%', height: '100%' }}>
          <polygon points="50,15 15,35 85,35" strokeWidth="6" strokeLinejoin="round" />
          <rect x="22" y="38" width="8" height="42" rx="2" />
          <rect x="40" y="38" width="8" height="42" rx="2" />
          <rect x="58" y="38" width="8" height="42" rx="2" />
          <rect x="76" y="38" width="8" height="42" rx="2" />
          <rect x="12" y="80" width="80" height="8" rx="2" />
        </svg>
      )}

      {type === 'grievances' && (
        <svg viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="6" style={{ width: '100%', height: '100%' }}>
          <path d="M 24 55 L 42 55 L 68 76 L 68 24 L 42 45 L 24 45 Z" strokeLinejoin="round" strokeLinecap="round" />
          <path d="M 76 38 C 82 44, 82 56, 76 62" strokeLinecap="round" />
          <path d="M 84 30 C 94 40, 94 60, 84 70" strokeLinecap="round" />
          <rect x="36" y="55" width="8" height="20" rx="3" strokeWidth="5" />
        </svg>
      )}

      {type === 'appointments' && (
        <svg viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="6" style={{ width: '100%', height: '100%' }}>
          <rect x="18" y="24" width="64" height="62" rx="10" />
          <line x1="32" y1="14" x2="32" y2="28" strokeLinecap="round" strokeWidth="7" />
          <line x1="68" y1="14" x2="68" y2="28" strokeLinecap="round" strokeWidth="7" />
          <line x1="18" y1="42" x2="82" y2="42" strokeWidth="5" />
          <circle cx="34" cy="56" r="4" fill={color} />
          <circle cx="50" cy="56" r="4" fill={color} />
          <circle cx="66" cy="56" r="4" fill={color} />
          <circle cx="34" cy="72" r="4" fill={color} />
          <circle cx="50" cy="72" r="4" fill={color} />
        </svg>
      )}
    </div>
  );
}


import { DefaultTheme } from 'styled-components/native';
import { Platform, Dimensions } from 'react-native';
import Colors from '../constants/Colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Color System (Premium Dark Mode) ───
export const colors = {
  primary: {
    main: Colors.primary, // #E65000
    light: '#FF8A33',
    dark: '#AC3900',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#FFFFFF',
    light: '#FFFFFF',
    dark: '#A0A0A0',
    contrastText: '#000000',
  },
  background: {
    default: '#121212', // Strict Dark
    paper: '#1E1E1E',   // Card Surface
    subtle: '#242424',  // Elevated Surface
    elevated: '#2C2C2C', // Modal/Floating
    dark: '#000000',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#A0A0A0',
    tertiary: '#666666',
    disabled: '#444444',
    inverse: '#000000',
    link: Colors.primary,
    brand: Colors.primary,
  },
  border: {
    default: '#2C2C2C',
    muted: '#1E1E1E',
    focus: Colors.primary,
    light: '#333333',
  },
  status: {
    success: '#4CAF50',
    warning: '#FFA000',
    error: '#D32F2F',
    info: '#2196F3',
  },
  // Legacy support & Missing Keys
  accent: {
    main: Colors.primary,
    light: '#FF8A33',
    dark: '#AC3900',
    blue: '#2196F3',
    purple: '#9C27B0',
    gold: '#FFD700',
    contrastText: '#FFFFFF',
  },
  mobileDe: {
    background: '#121212',
    surface: '#1E1E1E',
    surfaceHighlight: '#242424',
    primary: Colors.primary,
    text: '#FFFFFF',
    textSecondary: '#A0A0A0',
    textTertiary: '#666666',
    success: '#4CAF50',
    purple: '#7B2FBE',
    purpleHover: '#9C27B0'
  },
  brand: {
    orange: Colors.primary,
    orangeLight: '#FF8A33',
    dark: '#000000',
    light: '#FFFFFF',
    glass: 'rgba(255,255,255,0.1)',
    glassDark: 'rgba(0,0,0,0.5)',
  },
  gradient: {
    primary: ['#E65000', '#FF8A33'] as const,
    brand: ['#E65000', '#FF8A33'] as const,
    premium: ['#121212', '#1E1E1E'] as const,
    dark: ['#000000', '#121212'] as const,
    hero: ['#121212', '#1E1E1E'] as const,
    card: ['#1E1E1E', '#242424'] as const,
    glass: ['rgba(255,255,255,0.1)', 'rgba(0,0,0,0.5)'] as const,
    sunset: ['#E65000', '#FF5722'] as const,
  },
  glassmorphism: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: 'rgba(255, 255, 255, 0.1)',
  },
};

// ─── Typography ─────────────────────────────────
export const typography = {
  fontFamily: {
    regular: Platform.select({ ios: 'System', android: 'Roboto', default: 'System' }),
    medium: Platform.select({ ios: 'System', android: 'Roboto', default: 'System' }),
    bold: Platform.select({ ios: 'System', android: 'Roboto', default: 'System' }),
    mono: 'SpaceMono',
  },
  sizes: {
    '2xs': 10,
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
    '6xl': 56,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '900',
  },
};

// ─── Spacing Scale ──────────────────────────────
export const spacing = {
  '2xs': '2px',
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '40px',
  '3xl': '48px',
  '4xl': '56px',
  '5xl': '64px',
  '6xl': '80px',
};

// ─── Border Radius ──────────────────────────────
export const borderRadius = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  round: '9999px',
};

// ─── Shadows ────────────────────────────────────
/**
 * Cross-platform shadow helper.
 * iOS uses shadow* props, Android uses elevation, Web uses boxShadow.
 */
function createShadow(
  color: string,
  offsetX: number,
  offsetY: number,
  opacity: number,
  radius: number,
  elevation: number,
): Record<string, any> {
  return Platform.select({
    ios: { shadowColor: color, shadowOffset: { width: offsetX, height: offsetY }, shadowOpacity: opacity, shadowRadius: radius },
    android: { elevation },
    default: { boxShadow: `${offsetX}px ${offsetY}px ${radius}px rgba(0, 0, 0, ${opacity})` },
  }) as Record<string, any>;
}

export const shadows = {
  none: {},
  xs: createShadow('#000', 0, 1, 0.18, 1.0, 1),
  sm: createShadow('#000', 0, 2, 0.25, 3.84, 2),
  md: createShadow('#000', 0, 5, 0.34, 6.27, 5),
  lg: createShadow('#000', 0, 9, 0.48, 11.95, 9),
  xl: createShadow('#000', 0, 12, 0.58, 16.00, 12),
  card: createShadow('#000', 0, 2, 0.25, 3.84, 3),
  premium: createShadow(Colors.primary, 0, 4, 0.30, 4.65, 8),
};

// ─── Combined Theme ─────────────────────────────
export const theme: DefaultTheme = {
  mode: 'dark',
  colors,
  typography: typography as any,
  spacing,
  shadows,
  borderRadius,
  screen: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  } as any,
  zIndex: {
    base: 0,
    card: 1,
    sticky: 10,
    dropdown: 100,
    modal: 1000,
    toast: 2000,
    tooltip: 3000,
  }
};

export default theme;

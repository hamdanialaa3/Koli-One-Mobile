import { DefaultTheme } from 'styled-components/native';
import { Platform } from 'react-native';

// Professional Mobile Palette (Based on Web Project Koli One)
export const colors = {
  primary: {
    main: '#003366',        // Dark Blue (Web Unified)
    light: '#0055AA',
    dark: '#002244',
    contrastText: '#ffffff'
  },
  secondary: {
    main: '#FF7900',        // Signature Orange (from old primary)
    light: '#33DDBB',
    dark: '#00AA88',
    contrastText: '#ffffff'
  },
  accent: {
    main: '#00D4AA',        // Tech Green (from old secondary)
    light: '#9580FF',
    dark: '#624ECC',
    contrastText: '#ffffff'
  },
  brand: {
    dark: '#003366',        // Dark Blue (unified)
    light: '#F8F9FA',       // Clean Light Background
    glass: 'rgba(255, 255, 255, 0.1)',
  },
  background: {
    default: '#F8F9FA',     // Clean Light
    paper: '#ffffff',
    subtle: '#F0F2F5',      // Added for photo placeholders
    dark: '#003366',
  },
  text: {
    primary: '#003366',     // Dark Blue (unified)
    secondary: '#666666',
    disabled: '#999999',
    inverse: '#ffffff'
  },
  border: {
    default: '#E2E8F0',
    muted: '#CBD5E1',
    focus: '#003366'
  },
  status: {
    success: '#28A745',
    warning: '#FFC107',
    error: '#DC3545',
    info: '#7B61FF'
  },
  glassmorphism: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  }
};

// Typography Scale (React Native)
export const typography = {
  sizes: {
    xs: '12px',
    sm: '14px',
    md: '16px', // Base
    lg: '18px',
    xl: '20px',
    xxl: '24px',
    xxxl: '30px'
  },
  weights: {
    regular: '400',
    medium: '500',
    bold: '700',
    black: '900'
  }
};

// Spacing
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px'
};

// Border Radius
export const borderRadius = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  round: '9999px'
};

export const shadows = {
  sm: Platform.select({
    web: {
      boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.18)',
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1
    }
  }),
  md: Platform.select({
    web: {
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)', // Web Premium Shadow
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5
    }
  })
};

export const theme: DefaultTheme = {
  mode: 'light',
  colors,
  typography,
  spacing,
  shadows,
  borderRadius
};

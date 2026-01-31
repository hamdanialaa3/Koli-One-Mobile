import { DefaultTheme } from 'styled-components/native';
import { Platform } from 'react-native';

// Professional Mobile Palette (Based on Web Project)
export const colors = {
  primary: {
    main: '#003366',        // Dark Blue
    light: '#0066CC',       // Light Blue
    dark: '#002244',        // Darker Blue
    contrastText: '#ffffff'
  },
  secondary: {
    main: '#CC0000',        // Red (Action)
    light: '#FF3333',
    dark: '#990000',
    contrastText: '#ffffff'
  },
  accent: {
    main: '#FF7900',        // Orange (Mobile Highlight)
    light: '#FF9433',
    dark: '#E56D00',
    contrastText: '#ffffff'
  },
  background: {
    default: '#f4f4f4',
    paper: '#ffffff',
    dark: '#f0f0f0',
  },
  text: {
    primary: '#333333',
    secondary: '#666666',
    disabled: '#999999',
    inverse: '#ffffff'
  },
  border: {
    default: '#E2E8F0',
    muted: '#CBD5E1',
    focus: '#0066CC'
  },
  status: {
    success: '#28A745',
    warning: '#FFC107',
    error: '#CC0000',
    info: '#0066CC'
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
      boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
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

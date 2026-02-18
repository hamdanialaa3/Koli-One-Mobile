// src/types/styled.d.ts
import 'styled-components/native';

declare module 'styled-components/native' {
    export interface DefaultTheme {
        mode: 'light' | 'dark';
        colors: {
            primary: {
                main: string;
                light: string;
                dark: string;
                contrastText: string;
            };
            secondary: {
                main: string;
                light: string;
                dark: string;
                contrastText: string;
            };
            accent: {
                main: string;
                light: string;
                dark: string;
                contrastText: string;
            };
            background: {
                default: string;
                paper: string;
                subtle: string;
                elevated: string;
                dark: string;
                overlay: string;
            };
            text: {
                primary: string;
                secondary: string;
                tertiary: string;
                disabled: string;
                inverse: string;
                link: string;
                brand: string;
            };
            border: {
                default: string;
                muted: string;
                focus: string;
                light: string;
            };
            status: {
                success: string;
                warning: string;
                error: string;
                info: string;
            };
            mobileDe: {
                background: string;
                surface: string;
                surfaceHighlight: string;
                primary: string;
                text: string;
                textSecondary: string;
                textTertiary: string;
                success: string;
                purple: string;
                purpleHover: string;
            };
            brand: {
                orange: string;
                orangeLight: string;
                dark: string;
                light: string;
                glass: string;
                glassDark: string;
            };
            gradient: {
                primary: readonly [string, string];
                brand: readonly [string, string];
                premium: readonly [string, string];
                dark: readonly [string, string];
                hero: readonly [string, string];
                card: readonly [string, string];
                glass: readonly [string, string];
                sunset: readonly [string, string];
            };
            glassmorphism: {
                background: string;
                border: string;
            };
        };
        typography: {
            sizes: {
                '2xs': number;
                xs: number;
                sm: number;
                md: number;
                lg: number;
                xl: number;
                '2xl': number;
                '3xl': number;
                '4xl': number;
                '5xl': number;
                '6xl': number;
            };
            weights: {
                regular: string;
                medium: string;
                semibold: string;
                bold: string;
                black: string;
            };
            lineHeights: {
                tight: number;
                normal: number;
                relaxed: number;
            };
        };
        spacing: {
            '2xs': string;
            xs: string;
            sm: string;
            md: string;
            lg: string;
            xl: string;
            '2xl': string;
            '3xl': string;
            '4xl': string;
            '5xl': string;
            '6xl': string;
        };
        borderRadius: {
            xs: string;
            sm: string;
            md: string;
            lg: string;
            xl: string;
            '2xl': string;
            '3xl': string;
            round: string;
        };
        shadows: {
            none: any;
            xs: any;
            sm: any;
            md: any;
            lg: any;
            xl: any;
            card: any;
            premium: any;
        };
        screen: {
            width: number;
            height: number;
            isSmall: boolean;
            isMedium: boolean;
            isLarge: boolean;
        };
        zIndex: {
            base: number;
            card: number;
            sticky: number;
            dropdown: number;
            modal: number;
            toast: number;
            tooltip: number;
        };
    }
}

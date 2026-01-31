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
                dark: string;
            };
            text: {
                primary: string;
                secondary: string;
                disabled: string;
                inverse: string;
            };
            border: {
                default: string;
                muted: string;
                focus: string;
            };
            status: {
                success: string;
                warning: string;
                error: string;
                info: string;
            };
        };
        typography: {
            sizes: {
                xs: string;
                sm: string;
                md: string;
                lg: string;
                xl: string;
                xxl: string;
                xxxl: string;
            };
            weights: {
                regular: string;
                medium: string;
                bold: string;
                black: string;
            };
        };
        spacing: {
            xs: string;
            sm: string;
            md: string;
            lg: string;
            xl: string;
            xxl: string;
        };
        borderRadius: {
            xs: string;
            sm: string;
            md: string;
            lg: string;
            xl: string;
            round: string;
        };
        shadows: {
            sm: {
                shadowColor?: string;
                shadowOffset?: { width: number; height: number };
                shadowOpacity?: number;
                shadowRadius?: number;
                elevation?: number;
                boxShadow?: string;
            };
            md: {
                shadowColor?: string;
                shadowOffset?: { width: number; height: number };
                shadowOpacity?: number;
                shadowRadius?: number;
                elevation?: number;
                boxShadow?: string;
            };
        };
    }
}

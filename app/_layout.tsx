import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';
import { theme } from '../src/styles/theme';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { LanguageProvider } from '../src/contexts/LanguageContext';
import { useNotifications } from '../src/hooks/useNotifications';
import { ONBOARDING_STORAGE_KEY } from '../src/constants/onboarding';
import { logger } from '../src/services/logger-service';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <LanguageProvider>
        <RootLayoutNav />
      </LanguageProvider>
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  // Register push notifications
  useNotifications(user?.uid);

  // Check if onboarding is completed
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const onboardingData = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
        
        if (!onboardingData) {
          // First time user - show onboarding
          logger.info('First time user detected, showing onboarding');
          router.replace('/onboarding');
        } else {
          logger.info('Onboarding already completed');
        }
      } catch (error) {
        logger.error('Failed to check onboarding status', error);
      } finally {
        setOnboardingChecked(true);
      }
    };

    // Only check once on app load
    if (!onboardingChecked) {
      checkOnboarding();
    }
  }, [onboardingChecked]);

  // Handle authentication-based navigation
  useEffect(() => {
    if (loading || !onboardingChecked) return;
    
    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';
    
    // Don't interfere with onboarding flow
    if (inOnboarding) return;
    
    if (!user && !inAuthGroup) {
      // User is not signed in and trying to access protected route
      // Allow access to tabs but show login prompts when needed
    } else if (user && inAuthGroup) {
      // User is signed in but on auth screen, redirect to tabs
      router.replace('/(tabs)');
    }
  }, [user, loading, segments, onboardingChecked]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StyledThemeProvider theme={theme}>
        <Stack>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          <Stack.Screen name="car/[id]" options={{ presentation: 'card' }} />
          <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
        </Stack>
      </StyledThemeProvider>
    </ThemeProvider>
  );
}

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useColorScheme } from '@/components/useColorScheme';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';
import { theme } from '../src/styles/theme';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { LanguageProvider } from '../src/contexts/LanguageContext';
import { useNotifications } from '../src/hooks/useNotifications';
import { ErrorBoundary } from '../src/components/shared/ErrorBoundary';
import { initSentry, setSentryUser } from '../src/services/sentry';

// Initialize Sentry as early as possible
initSentry();

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <ErrorBoundary>
        <AuthProvider>
          <LanguageProvider>
            <RootLayoutNav />
          </LanguageProvider>
        </AuthProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useNotifications(user?.uid);

  // Set Sentry user context on auth changes
  useEffect(() => {
    setSentryUser(user?.uid || null, user?.email || undefined);
  }, [user]);

  // First-launch onboarding detection
  useEffect(() => {
    if (loading) return;
    const checkOnboarding = async () => {
      try {
        const onboardingData = await AsyncStorage.getItem('onboarding_completed');
        if (!onboardingData && !user) {
          router.replace('/onboarding');
          return;
        }
      } catch {}
    };
    checkOnboarding();
  }, [loading]);

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  const screenOpts = { headerShown: false };
  const modalOpts = { ...screenOpts, presentation: 'modal' as const, animation: 'slide_from_bottom' as const };
  const cardOpts = { ...screenOpts, animation: 'slide_from_right' as const };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StyledThemeProvider theme={theme}>
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          {/* Core */}
          <Stack.Screen name="index" options={screenOpts} />
          <Stack.Screen name="(tabs)" options={screenOpts} />
          <Stack.Screen name="(auth)" options={screenOpts} />

          {/* Car */}
          <Stack.Screen name="car/[id]" options={{ ...screenOpts, animation: 'slide_from_bottom' }} />
          <Stack.Screen name="car/[id]/history" options={cardOpts} />

          {/* Chat */}
          <Stack.Screen name="chat/[id]" options={cardOpts} />

          {/* Discovery */}
          <Stack.Screen name="notifications" options={cardOpts} />
          <Stack.Screen name="price-alerts" options={cardOpts} />
          <Stack.Screen name="social" options={cardOpts} />
          <Stack.Screen name="finance" options={cardOpts} />
          <Stack.Screen name="dealers" options={cardOpts} />
          <Stack.Screen name="saved-searches" options={cardOpts} />
          <Stack.Screen name="my-reviews" options={cardOpts} />
          <Stack.Screen name="VisualSearch" options={modalOpts} />
          <Stack.Screen name="advanced-search" options={modalOpts} />
          <Stack.Screen name="all-cars" options={cardOpts} />
          <Stack.Screen name="brand-gallery" options={cardOpts} />
          <Stack.Screen name="top-brands" options={cardOpts} />

          {/* Profile */}
          <Stack.Screen name="profile/[id]" options={cardOpts} />
          <Stack.Screen name="profile/edit" options={cardOpts} />
          <Stack.Screen name="profile/settings" options={cardOpts} />
          <Stack.Screen name="profile/admin-sections" options={cardOpts} />
          <Stack.Screen name="profile/my-ads" options={cardOpts} />
          <Stack.Screen name="profile/favorites" options={cardOpts} />
          <Stack.Screen name="profile/drafts" options={cardOpts} />
          <Stack.Screen name="profile/dashboard" options={cardOpts} />
          <Stack.Screen name="profile/analytics" options={cardOpts} />
          <Stack.Screen name="profile/campaigns" options={cardOpts} />
          <Stack.Screen name="profile/consultations" options={cardOpts} />
          <Stack.Screen name="profile/saved-searches" options={cardOpts} />
          <Stack.Screen name="profile/users" options={cardOpts} />
          <Stack.Screen name="profile/following" options={cardOpts} />
          <Stack.Screen name="profile/billing" options={cardOpts} />
          <Stack.Screen name="profile/subscription" options={cardOpts} />
          <Stack.Screen name="profile/edit-listing/[id]" options={cardOpts} />

          {/* AI */}
          <Stack.Screen name="ai/advisor" options={cardOpts} />
          <Stack.Screen name="ai/valuation" options={modalOpts} />
          <Stack.Screen name="ai/history" options={cardOpts} />
          <Stack.Screen name="ai/analysis" options={modalOpts} />

          {/* Marketplace */}
          <Stack.Screen name="marketplace/index" options={cardOpts} />
          <Stack.Screen name="marketplace/[productId]" options={cardOpts} />
          <Stack.Screen name="marketplace/cart" options={modalOpts} />
          <Stack.Screen name="marketplace/checkout" options={cardOpts} />

          {/* Dealer */}
          <Stack.Screen name="dealer/[slug]" options={cardOpts} />
          <Stack.Screen name="dealer/register" options={cardOpts} />

          {/* Blog */}
          <Stack.Screen name="blog/index" options={cardOpts} />
          <Stack.Screen name="blog/[slug]" options={cardOpts} />

          {/* Social */}
          <Stack.Screen name="social/create-post" options={modalOpts} />

          {/* Finance */}
          <Stack.Screen name="financing/compare" options={cardOpts} />

          {/* New Features */}
          <Stack.Screen name="garage" options={cardOpts} />
          <Stack.Screen name="map-search" options={cardOpts} />
          <Stack.Screen name="auctions" options={cardOpts} />
          <Stack.Screen name="events" options={cardOpts} />
          <Stack.Screen name="stories" options={cardOpts} />

          {/* Compare & Report */}
          <Stack.Screen name="compare" options={cardOpts} />
          <Stack.Screen name="report" options={modalOpts} />
          <Stack.Screen name="faq" options={cardOpts} />

          {/* Marketplace extras */}
          <Stack.Screen name="marketplace/order-success" options={{ ...screenOpts, animation: 'fade' }} />

          {/* Legal */}
          <Stack.Screen name="privacy-policy" options={cardOpts} />
          <Stack.Screen name="terms-of-service" options={cardOpts} />
          <Stack.Screen name="about" options={cardOpts} />
          <Stack.Screen name="contact" options={cardOpts} />
          <Stack.Screen name="help" options={cardOpts} />
          <Stack.Screen name="data-deletion" options={cardOpts} />
          <Stack.Screen name="onboarding" options={{ ...screenOpts, animation: 'fade' }} />
        </Stack>
      </StyledThemeProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

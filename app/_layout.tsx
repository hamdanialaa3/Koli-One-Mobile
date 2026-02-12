import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';
import { theme } from '../src/styles/theme';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { LanguageProvider } from '../src/contexts/LanguageContext';
import { useNotifications } from '../src/hooks/useNotifications';
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

  // Register push notifications
  useNotifications(user?.uid);

  // Handle authentication-based navigation
  useEffect(() => {
    if (loading) return;
    
    const inAuthGroup = segments[0] === '(auth)';
    
    if (!user && !inAuthGroup) {
      // User is not signed in - allow access to tabs but show login prompts when needed
    } else if (user && inAuthGroup) {
      // User is signed in but on auth screen, redirect to tabs
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StyledThemeProvider theme={theme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          <Stack.Screen name="car/[id]" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="notifications" options={{ headerShown: false }} />
          <Stack.Screen name="price-alerts" options={{ headerShown: false }} />
          <Stack.Screen name="social" options={{ headerShown: false }} />
          <Stack.Screen name="finance" options={{ headerShown: false }} />
          <Stack.Screen name="dealers" options={{ headerShown: false }} />
          <Stack.Screen name="saved-searches" options={{ headerShown: false }} />
          <Stack.Screen name="my-reviews" options={{ headerShown: false }} />
          <Stack.Screen name="privacy-policy" options={{ headerShown: false }} />
          <Stack.Screen name="terms-of-service" options={{ headerShown: false }} />
          <Stack.Screen name="VisualSearch" options={{ headerShown: false }} />
          <Stack.Screen name="profile/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="profile/edit" options={{ headerShown: false }} />
          <Stack.Screen name="profile/settings" options={{ headerShown: false }} />
          <Stack.Screen name="profile/my-ads" options={{ headerShown: false }} />
          <Stack.Screen name="profile/favorites" options={{ headerShown: false }} />
          <Stack.Screen name="profile/drafts" options={{ headerShown: false }} />
          <Stack.Screen name="profile/dashboard" options={{ headerShown: false }} />
          <Stack.Screen name="profile/analytics" options={{ headerShown: false }} />
          <Stack.Screen name="profile/campaigns" options={{ headerShown: false }} />
          <Stack.Screen name="profile/consultations" options={{ headerShown: false }} />
          <Stack.Screen name="profile/saved-searches" options={{ headerShown: false }} />
          <Stack.Screen name="profile/users" options={{ headerShown: false }} />
          <Stack.Screen name="profile/edit-listing/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="about" options={{ headerShown: false }} />
          <Stack.Screen name="contact" options={{ headerShown: false }} />
          <Stack.Screen name="help" options={{ headerShown: false }} />
          <Stack.Screen name="data-deletion" options={{ headerShown: false }} />
        </Stack>
      </StyledThemeProvider>
    </ThemeProvider>
  );
}

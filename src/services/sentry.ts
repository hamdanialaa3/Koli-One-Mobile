/**
 * Sentry Crash Reporting — Production visibility for mobile app
 *
 * Configure DSN via EXPO_PUBLIC_SENTRY_DSN env variable.
 * Without a DSN, Sentry reports are silently discarded (dev safe).
 */
import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || '';

export function initSentry(): void {
  if (!DSN) {
    // No DSN configured — skip init (dev / CI)
    return;
  }

  Sentry.init({
    dsn: DSN,
    environment: __DEV__ ? 'development' : 'production',
    release: `${Constants.expoConfig?.slug ?? 'koli-one'}@${Constants.expoConfig?.version ?? '1.0.0'}`,
    dist: Constants.expoConfig?.extra?.eas?.buildNumber ?? '1',
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,
    debug: __DEV__,
    enabled: !__DEV__, // Only send in production
    beforeSend(event) {
      // Strip PII from breadcrumbs if needed
      return event;
    },
  });
}

/**
 * Identify the current user for Sentry error context.
 * Call after login / auth state change.
 */
export function setSentryUser(uid: string | null, email?: string): void {
  if (!DSN) return;
  if (uid) {
    Sentry.setUser({ id: uid, email });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Capture a non-fatal exception manually.
 */
export function captureException(err: unknown, context?: Record<string, unknown>): void {
  if (!DSN) return;
  if (context) {
    Sentry.withScope(scope => {
      Object.entries(context).forEach(([key, val]) => {
        scope.setExtra(key, val);
      });
      Sentry.captureException(err);
    });
  } else {
    Sentry.captureException(err);
  }
}

export { Sentry };

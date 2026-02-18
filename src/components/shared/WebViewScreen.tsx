/**
 * WebViewScreen Component
 * Unified WebView wrapper for displaying web pages inside the mobile app
 * 
 * Features:
 * - Loads koli.one or mobilbg.eu pages
 * - Injects Firebase auth token for seamless session sharing
 * - Intercepts navigation for deep linking
 * - Progress indicator
 * - Error handling with retry
 * - Pull-to-refresh
 * - Share functionality
 */

import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Share,
  Platform,
  Linking
} from 'react-native';
import WebView from 'react-native-webview';
import { WebViewNavigation } from 'react-native-webview/lib/WebViewTypes';
import { useRouter } from 'expo-router';
import { useWebViewAuth } from '../../hooks/useWebViewAuth';
import { logger } from '../../services/logger-service';
import { ArrowLeft, Share2, RefreshCw, AlertCircle } from 'lucide-react-native';

// Web Fallback Component (for development)
const WebFallback: React.FC<{ url: string; title?: string }> = ({ url, title }) => {
  const handleOpenInNewTab = () => {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      padding: 40,
      textAlign: 'center',
      backgroundColor: '#F9FAFB'
    }}>
      <div style={{
        fontSize: 64,
        marginBottom: 24
      }}>🌐</div>
      
      <h2 style={{
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 12
      }}>
        WebView Preview Mode
      </h2>
      
      <p style={{
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 8,
        maxWidth: 500
      }}>
        WebView is available on <strong>iOS and Android only</strong>.
        The website blocks iframe embedding for security.
      </p>
      
      <p style={{
        fontSize: 14,
        color: '#9CA3AF',
        marginBottom: 24
      }}>
        Target: <code style={{
          backgroundColor: '#E5E7EB',
          padding: '4px 8px',
          borderRadius: 4,
          fontFamily: 'monospace'
        }}>{url}</code>
      </p>

      <div style={{
        display: 'flex',
        gap: 16,
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button
          onClick={handleOpenInNewTab}
          style={{
            backgroundColor: '#1E40AF',
            color: 'white',
            padding: '12px 24px',
            borderRadius: 8,
            border: 'none',
            fontSize: 16,
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <span>🔗</span>
          Open in New Tab
        </button>
      </div>

      <div style={{
        marginTop: 32,
        padding: 16,
        backgroundColor: '#FEF3C7',
        borderRadius: 8,
        maxWidth: 600
      }}>
        <p style={{
          fontSize: 14,
          color: '#92400E',
          margin: 0
        }}>
          💡 <strong>To test WebView:</strong> Run <code>npm start</code> and press <strong>a</strong> (Android) or <strong>i</strong> (iOS), or scan QR with Expo Go
        </p>
      </div>
    </div>
  );
};

interface WebViewScreenProps {
  url: string;
  title?: string;
  onNavigationStateChange?: (state: WebViewNavigation) => void;
  showHeader?: boolean;
}

const BASE_URL = 'https://koli.one';
const MOBILBG_URL = 'https://mobilbg.eu';

export const WebViewScreen: React.FC<WebViewScreenProps> = ({
  url,
  title,
  onNavigationStateChange,
  showHeader = true
}) => {
  const webViewRef = useRef<WebView>(null);
  const router = useRouter();
  const { injectedJavaScript, isReady, error: authError } = useWebViewAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(url);
  const [pageTitle, setPageTitle] = useState(title || '');

  // Handle navigation state changes
  const handleNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
    setCurrentUrl(navState.url);
    setPageTitle(navState.title || title || '');
    setLoading(navState.loading);

    // Intercept internal navigation for deep linking
    if (navState.url.startsWith(BASE_URL) || navState.url.startsWith(MOBILBG_URL)) {
      const path = navState.url.replace(BASE_URL, '').replace(MOBILBG_URL, '');
      
      // Route specific paths to native screens
      if (path.startsWith('/car/')) {
        const match = path.match(/\/car\/(\d+)\/(\d+)/);
        if (match) {
          logger.info('[WebView] Intercepting car detail navigation', { path });
          // router.push(`/car/${match[1]}_${match[2]}`); // Uncomment to enable native car details
        }
      } else if (path === '/search') {
        // router.push('/(tabs)/search'); // Uncomment to switch to native search
      }
    }

    onNavigationStateChange?.(navState);
  }, [title, onNavigationStateChange]);

  // Handle external links (tel:, mailto:, whatsapp:, etc.)
  const handleShouldStartLoadWithRequest = useCallback((request: any): boolean => {
    const { url: requestUrl } = request;

    // Allow internal navigation
    if (requestUrl.startsWith(BASE_URL) || requestUrl.startsWith(MOBILBG_URL) || requestUrl.startsWith('http')) {
      return true;
    }

    // Handle special URL schemes
    if (
      requestUrl.startsWith('tel:') ||
      requestUrl.startsWith('mailto:') ||
      requestUrl.startsWith('whatsapp:') ||
      requestUrl.startsWith('sms:')
    ) {
      Linking.openURL(requestUrl).catch(err => {
        logger.error('[WebView] Failed to open URL', { url: requestUrl, error: err });
      });
      return false;
    }

    return true;
  }, []);

  // Handle errors
  const handleError = useCallback((syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    logger.error('[WebView] Load error', { url: currentUrl, error: nativeEvent });
    setError('Failed to load page. Please check your connection.');
    setLoading(false);
  }, [currentUrl]);

  // Reload page
  const handleReload = useCallback(() => {
    setError(null);
    setLoading(true);
    webViewRef.current?.reload();
  }, []);

  // Go back
  const handleGoBack = useCallback(() => {
    if (canGoBack) {
      webViewRef.current?.goBack();
    } else {
      router.back();
    }
  }, [canGoBack, router]);

  // Share current page
  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `${pageTitle}\n${currentUrl}`,
        url: currentUrl
      });
    } catch (err) {
      logger.error('[WebView] Share failed', { error: err });
    }
  }, [pageTitle, currentUrl]);

  // Show loading state
  if (!isReady && !authError) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1E40AF" />
        <Text style={styles.statusText}>Initializing...</Text>
      </View>
    );
  }

  // Show auth error
  if (authError) {
    return (
      <View style={styles.centerContainer}>
        <AlertCircle size={48} color="#EF4444" />
        <Text style={styles.errorTitle}>Authentication Error</Text>
        <Text style={styles.errorText}>{authError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      {showHeader && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={handleGoBack}>
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          
          <View style={styles.headerTitle}>
            <Text style={styles.headerTitleText} numberOfLines={1}>
              {pageTitle}
            </Text>
            <Text style={styles.headerUrl} numberOfLines={1}>
              {currentUrl.replace('https://', '')}
            </Text>
          </View>

          <TouchableOpacity style={styles.headerButton} onPress={handleReload}>
            <RefreshCw size={20} color="#1F2937" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Share2 size={20} color="#1F2937" />
          </TouchableOpacity>
        </View>
      )}

      {/* Loading bar */}
      {loading && (
        <View style={styles.loadingBar}>
          <View style={styles.loadingBarFill} />
        </View>
      )}

      {/* Error state */}
      {error ? (
        <View style={styles.errorContainer}>
          <AlertCircle size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Unable to Load Page</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleReload}>
            <RefreshCw size={20} color="#FFF" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : Platform.OS === 'web' ? (
        // Web Fallback: Show message (koli.one blocks iframe)
        <WebFallback url={url} title={title} />
      ) : (
        // Mobile: Use WebView for iOS/Android
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          injectedJavaScript={injectedJavaScript}
          onNavigationStateChange={handleNavigationStateChange}
          onError={handleError}
          onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
          startInLoadingState
          javaScriptEnabled
          domStorageEnabled
          sharedCookiesEnabled
          thirdPartyCookiesEnabled={Platform.OS === 'android'}
          cacheEnabled
          allowsBackForwardNavigationGestures={Platform.OS === 'ios'}
          style={styles.webview}
          contentMode="mobile"
          pullToRefreshEnabled
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3
      },
      android: {
        elevation: 4
      }
    })
  },
  headerButton: {
    padding: 8,
    marginHorizontal: 4
  },
  headerTitle: {
    flex: 1,
    marginHorizontal: 12
  },
  headerTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2
  },
  headerUrl: {
    fontSize: 12,
    color: '#6B7280'
  },
  loadingBar: {
    height: 3,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden'
  },
  loadingBarFill: {
    height: '100%',
    width: '30%',
    backgroundColor: '#1E40AF'
  },
  webview: {
    flex: 1
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F9FAFB'
  },
  statusText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E40AF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600'
  }
});

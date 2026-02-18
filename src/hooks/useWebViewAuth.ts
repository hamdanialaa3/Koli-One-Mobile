/**
 * useWebViewAuth Hook
 * Generates injected JavaScript to authenticate WebView with Firebase token
 * 
 * Features:
 * - Retrieves Firebase ID token from authenticated user
 * - Injects token into WebView localStorage for seamless session sharing
 * - Auto-refreshes token before expiry
 * - Handles unauthenticated state gracefully
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { logger } from '../services/logger-service';

interface UseWebViewAuthReturn {
  injectedJavaScript: string;
  isReady: boolean;
  error: string | null;
}

const BASE_URL = 'https://koli.one';
const MOBILBG_URL = 'https://mobilbg.eu';

export const useWebViewAuth = (): UseWebViewAuthReturn => {
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Firebase ID token
  const fetchToken = useCallback(async () => {
    if (!user) {
      setToken(null);
      setIsReady(true);
      return;
    }

    try {
      const idToken = await user.getIdToken(true); // force refresh
      setToken(idToken);
      setIsReady(true);
      setError(null);
      logger.info('[useWebViewAuth] Token fetched successfully');
    } catch (err: any) {
      logger.error('[useWebViewAuth] Failed to fetch token', err);
      setError(err.message || 'Failed to get authentication token');
      setIsReady(false);
    }
  }, [user]);

  // Initial token fetch
  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  // Refresh token every 30 minutes (Firebase tokens expire in 1 hour)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      logger.info('[useWebViewAuth] Refreshing token...');
      fetchToken();
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [user, fetchToken]);

  // Generate injected JavaScript
  const injectedJavaScript = `
    (function() {
      try {
        // 🔥 Inject Firebase Auth Token into localStorage
        const firebaseToken = ${token ? `"${token}"` : 'null'};
        
        if (firebaseToken) {
          // Store token for web app to use
          localStorage.setItem('firebase_mobile_token', firebaseToken);
          localStorage.setItem('firebase_mobile_token_timestamp', Date.now().toString());
          
          // Optional: Auto-signin via postMessage to parent web app
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'AUTH_TOKEN_INJECTED',
              token: firebaseToken,
              timestamp: Date.now()
            }));
          }
          
          logger.info('[WebView] Firebase token injected successfully');
        } else {
          // Clear any existing tokens if user is logged out
          localStorage.removeItem('firebase_mobile_token');
          localStorage.removeItem('firebase_mobile_token_timestamp');
          logger.info('[WebView] User not authenticated, tokens cleared');
        }
      } catch (err) {
        logger.error('[WebView] Token injection failed', err);
      }
      
      // Return true to signal injection complete
      true;
    })();
  `;

  return {
    injectedJavaScript,
    isReady,
    error
  };
};

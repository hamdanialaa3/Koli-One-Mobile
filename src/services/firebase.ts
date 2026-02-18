// src/services/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, initializeAuth, Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getDatabase, Database } from 'firebase/database';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { logger } from './logger-service';

// Secure persistence implementation using expo-secure-store
// Auth tokens are stored encrypted on-device instead of plain AsyncStorage
const secureStorePersistence = {
  type: 'LOCAL' as const,
  _isAvailable: () => Promise.resolve(true),
  _set: async (key: string, value: string) => {
    try {
      // SecureStore has a 2048 byte value limit — fall back to AsyncStorage for large values
      if (value.length > 2048) {
        await AsyncStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch {
      await AsyncStorage.setItem(key, value);
    }
  },
  _get: async (key: string) => {
    try {
      const secureVal = await SecureStore.getItemAsync(key);
      if (secureVal !== null) return secureVal;
      // Fall back to AsyncStorage (migration path from old installs)
      return await AsyncStorage.getItem(key);
    } catch {
      return await AsyncStorage.getItem(key);
    }
  },
  _remove: async (key: string) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // ignore — may not exist in SecureStore
    }
    await AsyncStorage.removeItem(key);
  },
};

// Load Firebase configuration from Expo config (set in app.config.ts via .env)
// Firebase API keys are NOT secret — they are designed for client-side use.
// Security is enforced via Firebase Security Rules, not by hiding the key.
const extra = Constants.expoConfig?.extra ?? {};

const firebaseConfig = {
    apiKey: extra.firebaseApiKey || '',
    authDomain: extra.firebaseAuthDomain || `${extra.firebaseProjectId || 'fire-new-globul'}.firebaseapp.com`,
    projectId: extra.firebaseProjectId || 'fire-new-globul',
    storageBucket: extra.firebaseStorageBucket || `${extra.firebaseProjectId || 'fire-new-globul'}.firebasestorage.app`,
    messagingSenderId: extra.firebaseMessagingSenderId || '',
    appId: extra.firebaseAppId || '',
    measurementId: extra.firebaseMeasurementId || '',
    databaseURL: extra.firebaseDatabaseURL || ''
};

// Initialize variables
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let rtdb: Database;
let analytics: Analytics | undefined;

// Analytics disabled to prevent 403 Forbidden
/*
isSupported().then(supported => {
    if (supported && app) {
        try {
            analytics = getAnalytics(app);
            logger.info('✅ Firebase Analytics initialized');
        } catch (err) {
            logger.warn('⚠️ Firebase Analytics failed to initialize (likely domain restriction):', { error: err });
        }
    }
});
*/

try {
    if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);

        // Firestore Initialization
        if (Platform.OS === 'web') {
            auth = getAuth(app);
            db = getFirestore(app);
            rtdb = getDatabase(app);
        } else {
            // � Use initializeAuth with SecureStore-backed persistence for encrypted token storage
            auth = initializeAuth(app, {
                persistence: secureStorePersistence as any
            });
            db = initializeFirestore(app, {
                localCache: persistentLocalCache()
            });
            rtdb = getDatabase(app);
        }

    } else {
        app = getApp();
        auth = getAuth(app);
        db = getFirestore(app);
        rtdb = getDatabase(app);
    }

    storage = getStorage(app);

    logger.info(`Firebase initialized successfully on ${Platform.OS}`);
} catch (error) {
    logger.error('Firebase initialization error', error);
}

export { app, auth, db, storage, rtdb, analytics };

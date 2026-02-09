// src/services/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, initializeAuth, Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getDatabase, Database } from 'firebase/database';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { logger } from './logger-service';

// Koli One Firebase Configuration
const validateFirebaseConfig = () => {
  const apiKey = process.env.FIREBASE_API_KEY || process.env.REACT_APP_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error('FIREBASE_API_KEY environment variable is not set. Please configure it in your .env file.');
  }
  return {
    apiKey,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "fire-new-globul.firebaseapp.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "fire-new-globul",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "fire-new-globul.firebasestorage.app",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "973379297533",
    appId: process.env.FIREBASE_APP_ID || "1:973379297533:web:59c6534d61a29cae5d9e94",
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-TDRZ4Z3D7Z",
    databaseURL: process.env.FIREBASE_DATABASE_URL || "https://fire-new-globul-default-rtdb.europe-west1.firebasedatabase.app"
  };
};

const firebaseConfig = validateFirebaseConfig();

// Initialize variables
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let rtdb: Database;
let analytics: Analytics | undefined;

isSupported().then(supported => {
    if (supported && app) {
        analytics = getAnalytics(app);
    }
});

try {
    if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);

        // Firestore Initialization
        if (Platform.OS === 'web') {
            auth = getAuth(app);
            db = getFirestore(app);
            rtdb = getDatabase(app);
        } else {
            // Note: getReactNativePersistence is handled by firebase directly in latest versions
            // or through initializeAuth if needed. For now using getAuth if standard works.
            auth = getAuth(app);
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

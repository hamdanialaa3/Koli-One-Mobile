// src/services/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, initializeAuth, Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getDatabase, Database } from 'firebase/database';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Koli One Firebase Configuration
const firebaseConfig = {
    apiKey: "***REMOVED_FIREBASE_KEY***",
    authDomain: "fire-new-globul.firebaseapp.com",
    projectId: "fire-new-globul",
    storageBucket: "fire-new-globul.firebasestorage.app",
    messagingSenderId: "973379297533",
    appId: "1:973379297533:web:59c6534d61a29cae5d9e94",
    measurementId: "G-TDRZ4Z3D7Z",
    databaseURL: "https://fire-new-globul-default-rtdb.europe-west1.firebasedatabase.app"
};

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

    console.log(`✅ Firebase initialized successfully on ${Platform.OS}`);
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
}

export { app, auth, db, storage, rtdb, analytics };

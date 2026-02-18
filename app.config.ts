
import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: "Koli One",
    slug: "koli-one",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "kolione",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
        image: "./assets/images/splash-icon.png",
        resizeMode: "contain",
        backgroundColor: "#7B2FBE"
    },
    ios: {
        supportsTablet: true,
        bundleIdentifier: "com.hamdani.kolione",
        googleServicesFile: "./GoogleService-Info.plist",
        infoPlist: {
            CFBundleURLTypes: [
                {
                    CFBundleURLSchemes: [
                        "com.googleusercontent.apps.973379297533-auto"
                    ]
                }
            ],
            LSApplicationQueriesSchemes: [
                "googlechrome",
                "comgooglegemail"
            ],
            ITSAppUsesNonExemptEncryption: false,
            NSUserTrackingUsageDescription: "This identifier will be used to track your activity across apps and websites to deliver personalized advertisements and improve our marketing efforts."
        }
    },
    android: {
        package: "com.hamdani.kolione",
        googleServicesFile: "./google-services.json",
        adaptiveIcon: {
            foregroundImage: "./assets/images/adaptive-icon.png",
            backgroundColor: "#7B2FBE"
        },
        edgeToEdgeEnabled: true,
        predictiveBackGestureEnabled: false,
        permissions: [
            "android.permission.INTERNET",
            "android.permission.ACCESS_NETWORK_STATE",
            "android.permission.CAMERA",
            "android.permission.RECORD_AUDIO",
            "com.google.android.gms.permission.AD_ID"
        ]
    },
    web: {
        bundler: "metro",
        output: "static",
        favicon: "./assets/images/favicon.png"
    },
    plugins: [
        "expo-router",
        [
            "@react-native-google-signin/google-signin",
            {
                iosUrlScheme: "com.googleusercontent.apps.973379297533-auto"
            }
        ],
        [
            "expo-camera",
            {
                cameraPermission: "Allow Koli One to access your camera to scan cars for AI analysis."
            }
        ],
        "expo-tracking-transparency",
        [
            "react-native-google-mobile-ads",
            {
                androidAppId: process.env.ADMOB_ANDROID_APP_ID || "ca-app-pub-3940256099942544~3347511713", // Test ID
                iosAppId: process.env.ADMOB_IOS_APP_ID || "ca-app-pub-3940256099942544~1458002511" // Test ID
            }
        ],
        [
            "expo-build-properties",
            {
                android: {
                    compileSdkVersion: 35,
                    targetSdkVersion: 35,
                    minSdkVersion: 24,
                    buildToolsVersion: "35.0.0"
                },
                ios: {
                    deploymentTarget: "15.1"
                }
            }
        ],
        [
            "@sentry/react-native/expo",
            {
                organization: process.env.SENTRY_ORG || "koli-one",
                project: process.env.SENTRY_PROJECT || "koli-one-mobile"
            }
        ]
    ],
    experiments: {
        typedRoutes: true
    },
    extra: {
        eas: {
            projectId: "a2efe325-74d5-4772-a200-0d44d16b484e"
        },
        firebaseProjectId: process.env.FIREBASE_PROJECT_ID || "",
        firebaseApiKey: process.env.FIREBASE_API_KEY || "",
        firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN || "",
        firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET || "",
        firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
        firebaseAppId: process.env.FIREBASE_APP_ID || "",
        firebaseMeasurementId: process.env.FIREBASE_MEASUREMENT_ID || "",
        firebaseDatabaseURL: process.env.FIREBASE_DATABASE_URL || "",
        algoliaAppId: process.env.ALGOLIA_APP_ID || "",
        algoliaSearchApiKey: process.env.ALGOLIA_SEARCH_API_KEY || "",
        algoliaIndexName: process.env.ALGOLIA_INDEX_NAME || "cars",
        router: {}
    },
    owner: "hamdanialaa"
});

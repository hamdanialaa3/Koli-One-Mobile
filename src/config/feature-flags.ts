// src/config/feature-flags.ts
/**
 * Feature Flags for Koli One Mobile App
 * 
 * Controls feature visibility and gradual rollout for the mobile app.
 * These flags are specific to the mobile app's Expo Router architecture.
 */

export const FEATURE_FLAGS = {
    // ==========================================
    // Core Features
    // ==========================================

    /** Enable in-app messaging */
    MESSAGING_ENABLED: true,

    /** Enable push notifications */
    PUSH_NOTIFICATIONS_ENABLED: true,

    /** Enable Google Sign-In */
    GOOGLE_SIGN_IN_ENABLED: true,

    /** Enable Facebook Sign-In */
    FACEBOOK_SIGN_IN_ENABLED: false,

    // ==========================================
    // AI Features
    // ==========================================

    /** Enable AI Price Estimator on car detail screen */
    AI_PRICE_ESTIMATOR: true,

    /** Enable Visual Search (camera AI) */
    VISUAL_SEARCH: true,

    /** Enable VIN check feature */
    VIN_CHECK: true,

    // ==========================================
    // Social & Community
    // ==========================================

    /** Enable social feed */
    SOCIAL_FEED: true,

    /** Enable user reviews system */
    REVIEWS: true,

    /** Enable dealer directory */
    DEALERS: true,

    // ==========================================
    // Commerce
    // ==========================================

    /** Enable finance calculator */
    FINANCE_CALCULATOR: true,

    /** Enable price drop alerts */
    PRICE_ALERTS: true,

    /** Enable saved searches */
    SAVED_SEARCHES: true,

    // ==========================================
    // Map & Location
    // ==========================================

    /** Enable map view of listings */
    MAP_VIEW: true,

    /** Enable location-based search */
    LOCATION_SEARCH: true,

    // ==========================================
    // Experimental / Future
    // ==========================================

    /** Enable AI Car Advisor chatbot */
    AI_ADVISOR: true,

    /** Enable auction feature */
    AUCTIONS: false,

    /** Enable car history reports */
    CAR_HISTORY: false,

    /** Enable parts marketplace */
    PARTS_MARKETPLACE: false,
} as const;

/**
 * Check if a feature is enabled
 */
export const isFeatureEnabled = (flag: keyof typeof FEATURE_FLAGS): boolean => {
    return FEATURE_FLAGS[flag];
};

/**
 * Get all enabled features (useful for debugging)
 */
export const getEnabledFeatures = (): string[] => {
    return Object.entries(FEATURE_FLAGS)
        .filter(([_, enabled]) => enabled)
        .map(([name]) => name);
};

export default FEATURE_FLAGS;

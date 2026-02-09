// src/config/feature-flags.ts
/**
 * Feature Flags System for Safe Refactoring
 * 
 * Purpose: Enable gradual rollout of architectural changes with instant rollback capability
 * 
 * Usage:
 * - Set flag to `true` to enable new feature
 * - Set flag to `false` to use legacy code
 * - Deploy with flags OFF, then gradually enable in production
 * 
 * Strategy:
 * 1. Deploy code with flags OFF (inactive)
 * 2. Enable for 10% of users
 * 3. Monitor for 48 hours
 * 4. If stable → Enable for 100%
 * 5. After 2 weeks of stability → Remove legacy code
 */

export const FEATURE_FLAGS = {
    // ==========================================
    // Week 1: Quick Wins
    // ==========================================

    /**
     * USE_UNIFIED_AUTH_GUARD
     * 
     * Consolidates 3 separate guard components into one:
     * - ProtectedRoute → AuthGuard
     * - AdminRoute → AuthGuard
     * - AuthGuard (old) → AuthGuard (new)
     * 
     * Benefits:
     * - Single source of truth for auth logic
     * - Consistent API across the app
     * - Easier to maintain and test
     * 
     * Rollout: Week 1, Day 1-2
     * ✅ STATUS: ACTIVE (Nov 26, 2025)
     */
    USE_UNIFIED_AUTH_GUARD: true,

    /**
     * USE_CLEAN_NAMING
     * 
     * Removes temporary suffixes from component names:
     * - VehicleDataPageUnified → VehicleDataPage
     * - ImagesPageUnified → ImagesPage
     * - UnifiedContactPage → ContactPage
     * - UnifiedEquipmentPage → EquipmentPage
     * 
     * Benefits:
     * - Professional naming convention
     * - Clearer codebase
     * - Better developer experience
     * 
     * Rollout: Week 1, Day 3
     * ⏳ STATUS: PENDING (Future)
     */
    USE_CLEAN_NAMING: false,

    /**
     * USE_EXTRACTED_PROVIDERS
     * 
     * Extracts provider stack from App.tsx into AppProviders.tsx
     * 
     * Benefits:
     * - App.tsx reduced from 909 → ~50 lines
     * - Provider order documented and protected
     * - Easier to test provider hierarchy
     * 
     * Rollout: Week 1, Day 4
     * ✅ STATUS: ACTIVE (Nov 26, 2025)
     */
    USE_EXTRACTED_PROVIDERS: true,

    // ==========================================
    // Week 2: Route Extraction
    // ==========================================

    /**
     * USE_EXTRACTED_ROUTES
     * 
     * Master flag for all route extraction features
     * If false, all route-specific flags below are ignored
     * 
     * Rollout: Week 2, Day 1-5
     * ✅ STATUS: ACTIVE (Nov 26, 2025)
     */
    USE_EXTRACTED_ROUTES: true,

    /**
     * USE_AUTH_ROUTES
     * 
     * Extracts authentication routes into auth.routes.tsx
     * Includes: Login, Register, Verification, OAuth Callback
     * 
     * Rollout: Week 2, Day 1-2
     * ✅ STATUS: ACTIVE (Nov 26, 2025)
     */
    USE_AUTH_ROUTES: true,

    /**
     * USE_SELL_ROUTES
     * 
     * Extracts sell workflow routes into sell.routes.tsx
     * Includes: ~25 routes for vehicle selling process
     * 
     * Rollout: Week 2, Day 3
     * ✅ STATUS: ACTIVE (Nov 26, 2025)
     */
    USE_SELL_ROUTES: true,

    /**
     * USE_ADMIN_ROUTES
     * 
     * Extracts admin routes into admin.routes.tsx
     * Includes: Admin dashboard, Super admin, Management
     * 
     * Rollout: Week 2, Day 4
     * ✅ STATUS: ACTIVE (Nov 26, 2025)
     */
    USE_ADMIN_ROUTES: true,

    /**
     * USE_MAIN_ROUTES
     * 
     * Extracts main application routes into main.routes.tsx
     * Includes: Home, Cars, Profile, Messages, etc.
     * 
     * Rollout: Week 2, Day 5
     * ✅ STATUS: ACTIVE (Nov 26, 2025)
     */
    USE_MAIN_ROUTES: true,

    /**
     * USE_DEALER_ROUTES
     * 
     * Extracts dealer routes into dealer.routes.tsx
     * Includes: Dealer pages, Dashboard, Registration
     * 
     * Rollout: Week 2, Day 5
     * ✅ STATUS: ACTIVE (Nov 26, 2025)
     */
    USE_DEALER_ROUTES: true,


    // ==========================================
    // Week 3: React Router Outlets
    // ==========================================

    /**
     * USE_ROUTER_OUTLET_LAYOUTS
     * 
     * Replaces wrapper-based layouts with React Router Outlet pattern
     * 
     * Benefits:
     * - Follows React Router best practices
     * - Better performance (fewer re-renders)
     * - Cleaner code structure
     * 
     * Rollout: Week 3, Day 1-5
     */
    USE_ROUTER_OUTLET_LAYOUTS: false,

    // ==========================================
    // Future Features (NOT RECOMMENDED YET)
    // ==========================================

    /**
     * USE_DOMAIN_FOLDERS
     * 
     * Restructures folders from numbered (01_, 02_) to domain-based
     * 
     * ⚠️ WARNING: High risk of Git merge conflicts
     * ⚠️ Requires updating 200+ import statements
     * ⚠️ NOT RECOMMENDED - Current structure works well
     * 
     * Status: CANCELLED
     */
    USE_DOMAIN_FOLDERS: false,
} as const;

/**
 * Type-safe feature flag checker
 * 
 * @param flag - Feature flag name
 * @returns boolean - Whether the feature is enabled
 * 
 * @example
 * if (isFeatureEnabled('USE_UNIFIED_AUTH_GUARD')) {
 *   return <NewAuthGuard />;
 * }
 * return <LegacyAuthGuard />;
 */
export const isFeatureEnabled = (flag: keyof typeof FEATURE_FLAGS): boolean => {
    return FEATURE_FLAGS[flag];
};

/**
 * Get all enabled features
 * Useful for debugging and monitoring
 * 
 * @returns Array of enabled feature names
 */
export const getEnabledFeatures = (): string[] => {
    return Object.entries(FEATURE_FLAGS)
        .filter(([_, enabled]) => enabled)
        .map(([name]) => name);
};

/**
 * Feature flag metadata for monitoring
 */
export const FEATURE_FLAG_METADATA = {
    USE_UNIFIED_AUTH_GUARD: {
        week: 1,
        day: '1-2',
        risk: 'low',
        impact: 'medium',
    },
    USE_CLEAN_NAMING: {
        week: 1,
        day: '3',
        risk: 'low',
        impact: 'low',
    },
    USE_EXTRACTED_PROVIDERS: {
        week: 1,
        day: '4',
        risk: 'medium',
        impact: 'high',
    },
    USE_EXTRACTED_ROUTES: {
        week: 2,
        day: '1-5',
        risk: 'medium',
        impact: 'high',
    },
    USE_AUTH_ROUTES: {
        week: 2,
        day: '1-2',
        risk: 'low',
        impact: 'medium',
    },
    USE_SELL_ROUTES: {
        week: 2,
        day: '3-4',
        risk: 'medium',
        impact: 'high',
    },
    USE_ADMIN_ROUTES: {
        week: 2,
        day: '3-4',
        risk: 'low',
        impact: 'medium',
    },
    USE_ROUTER_OUTLET_LAYOUTS: {
        week: 3,
        day: '1-5',
        risk: 'medium',
        impact: 'high',
    },
    USE_DOMAIN_FOLDERS: {
        week: null,
        day: null,
        risk: 'very-high',
        impact: 'very-high',
    },
} as const;

export default FEATURE_FLAGS;

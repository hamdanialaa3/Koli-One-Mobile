// src/types/user/bulgarian-user.types.ts
import { Timestamp } from 'firebase/firestore';

export interface BaseProfile {
    uid: string;
    email: string;
    displayName: string;
    firstName?: string;
    lastName?: string;
    photoURL?: string;
    coverImage?: string;
    numericId?: number;
    phoneNumber?: string;
    phoneCountryCode: '+359';
    pushToken?: string;
    location?: {
        city: string;
        region: string;
        country: 'Bulgaria';
        coordinates?: {
            latitude: number;
            longitude: number;
        };
    };
    preferredLanguage: 'bg' | 'en';
    currency: 'EUR';
    profileType: 'private' | 'dealer' | 'company';
    planTier: PlanTier;
    permissions: ProfilePermissions;
    verification: {
        email: boolean;
        phone: boolean;
        id: boolean;
        business: boolean;
    };
    stats: {
        totalListings: number;
        activeListings: number;
        totalViews: number;
        totalMessages: number;
        trustScore: number;
    };
    quotaStats?: {
        listingsCreatedThisMonth: number;
        flexEditsUsedThisMonth: number;
        lastMonthReset: string;
    };
    socialLinks?: {
        facebook?: string;
        twitter?: string;
        tiktok?: string;
        linkedin?: string;
        youtube?: string;
        instagram?: string;
    };
    bio?: string;
    about?: string;
    gallery?: string[];
    favorites?: string[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
    lastLoginAt?: Timestamp;
    isActive: boolean;
    isBanned: boolean;
    isVerified?: boolean;
}

export interface DealerProfile extends BaseProfile {
    profileType: 'dealer';
    planTier: 'dealer';
    dealershipRef?: `dealerships/${string}`;
    dealerSnapshot?: {
        nameBG: string;
        nameEN: string;
        logo?: string;
        status: 'pending' | 'verified' | 'rejected';
        address?: string;
        phone?: string;
        website?: string;
    };
}

export interface PrivateProfile extends BaseProfile {
    profileType: 'private';
    planTier: 'free' | 'dealer' | 'company';
    egn?: string;
}

export interface CompanyProfile extends BaseProfile {
    profileType: 'company';
    planTier: 'company';
    companyRef?: `companies/${string}`;
    companySnapshot?: {
        nameBG: string;
        nameEN: string;
        logo?: string;
        status: 'pending' | 'verified' | 'rejected';
        address?: string;
        phone?: string;
        website?: string;
        vatNumber?: string;
    };
    teamMembers?: {
        uid: string;
        role: 'admin' | 'agent' | 'viewer';
        addedAt: Timestamp;
        status: 'active' | 'invited' | 'disabled';
    }[];
}

export type BulgarianUser = PrivateProfile | DealerProfile | CompanyProfile;
export type PlanTier = 'free' | 'dealer' | 'company';

export interface ProfilePermissions {
    canAddListings: boolean;
    maxListings: number;
    maxMonthlyListings: number;
    canEditLockedFields: boolean;
    maxFlexEditsPerMonth: number;
    canBulkUpload: boolean;
    bulkUploadLimit: number;
    canCloneListing: boolean;
    hasAnalytics: boolean;
    hasAdvancedAnalytics: boolean;
    hasTeam: boolean;
    canExportData: boolean;
    hasPrioritySupport: boolean;
    canUseQuickReplies: boolean;
    canBulkEdit: boolean;
    canImportCSV: boolean;
    canUseAPI: boolean;
    themeMode: 'standard' | 'dealer-led' | 'company-led';
}

// ==================== TYPE GUARDS ====================
/**
 * Type guard to check if a user is a dealer
 */
export function isDealerProfile(user: BulgarianUser): user is DealerProfile {
    return user.profileType === 'dealer';
}

/**
 * Type guard to check if a user is a company
 */
export function isCompanyProfile(user: BulgarianUser): user is CompanyProfile {
    return user.profileType === 'company';
}

/**
 * Type guard to check if a user is a private user
 */
export function isPrivateProfile(user: BulgarianUser): user is PrivateProfile {
    return user.profileType === 'private';
}

/**
 * Type guard to check if a user is a business (dealer or company)
 */
export function isBusinessProfile(user: BulgarianUser): user is DealerProfile | CompanyProfile {
    return user.profileType === 'dealer' || user.profileType === 'company';
}

// ==================== HELPER TYPES ====================
export type ProfileType = BulgarianUser['profileType'];
export type ProfileStatus = 'pending' | 'verified' | 'rejected';
export type BillingInterval = 'monthly' | 'annual';

/**
 * Partial update type for user profiles
 */
export type BulgarianUserUpdate = Partial<Omit<BulgarianUser, 'uid' | 'createdAt'>>;

/**
 * Creation data for new users
 */
export type BulgarianUserCreateData = Omit<
    BulgarianUser,
    'uid' | 'createdAt' | 'updatedAt' | 'stats' | 'verification'
> & {
    stats?: Partial<BaseProfile['stats']>;
    verification?: Partial<BaseProfile['verification']>;
};

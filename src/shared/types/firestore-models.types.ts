/**
 * Firestore Base Models — Shared document interfaces.
 */

export type AccountType = 'private' | 'dealer' | 'company';
export type SubscriptionTier = 'free' | 'dealer' | 'company';

export interface BaseDocument {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt: any; // Firebase Timestamp
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updatedAt: any;
}

export interface UserBase extends BaseDocument {
  // Numeric ID System
  numericId: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  numericIdAssignedAt?: any;

  // Identity
  uid: string;
  email: string;
  displayName?: string;
  phone?: string;
  photoURL?: string;

  // Account
  accountType: AccountType;
  subscriptionTier: SubscriptionTier;
  isVerified: boolean;
  isActive: boolean;

  // Stats
  listingsCount: number;
  favoritesCount: number;
  reviewsCount: number;
  rating?: number;

  // Timestamps
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lastLoginAt: any;

  // Push
  fcmTokens?: string[];
}

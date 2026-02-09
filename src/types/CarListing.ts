/**
 * CarListing types — Re-exported from @koli-one/shared.
 *
 * This file delegates to the shared package (single source of truth).
 * Mobile-specific extensions are below the re-exports.
 *
 * @version 3.0.0 — Unified with shared/
 * @see shared/src/types/car-listing.types.ts
 */

// Re-export everything from the canonical shared package
export type {
  VehicleStatus,
  FuelType,
  TransmissionType,
  VehicleCollectionName,
  LocationData,
  Coordinates,
  CarListing,
  CarStory,
  CarListingFilters,
  CarListingSearchResult,
} from '@koli-one/shared';

// ── Mobile-specific extensions ──────────────────────────────

export interface CarListingFormData {
  step: number;
  isComplete: boolean;
  validationErrors?: { [key: string]: string };
  [key: string]: unknown;
}

export interface CarListingStats {
  totalListings: number;
  activeListings: number;
  soldListings: number;
  averagePrice: number;
}

export interface CarListingAnalytics {
  views: number;
  favorites: number;
  inquiries: number;
  lastViewed?: any;
}

export interface CarListingMessage {
  id: string;
  listingId: string;
  senderId: string;
  receiverId: string;
  message: string;
  type: 'text' | 'image' | 'file';
  isRead: boolean;
  createdAt: any;
  readAt?: any;
}

export interface CarListingFavorite {
  id: string;
  userId: string;
  listingId: string;
  createdAt: any;
}

export interface CarListingInquiry {
  id: string;
  listingId: string;
  inquirerId: string;
  inquirerName: string;
  inquirerPhone: string;
  message: string;
  status: 'pending' | 'replied' | 'closed';
  createdAt: any;
}

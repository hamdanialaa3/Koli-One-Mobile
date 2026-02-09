import { Timestamp } from 'firebase/firestore';

// ------------------------------------------------------------------
// 1. SHARED USER TYPES
// ------------------------------------------------------------------

export type AccountType = 'private' | 'dealer' | 'company';
export type SubscriptionTier = 'free' | 'dealer' | 'company';

export interface User {
  // Integers: Numeric ID System
  numericId: number;              // 1, 2, 3...
  numericIdAssignedAt?: Timestamp;

  // Identity
  uid: string;
  email: string;
  displayName?: string;
  phone?: string;
  photoURL?: string;

  // Account Status
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
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;
  
  // System
  fcmTokens?: string[];
}

// ------------------------------------------------------------------
// 2. SHARED CAR TYPES
// ------------------------------------------------------------------

export type VehicleStatus = 'active' | 'sold' | 'draft' | 'expired' | 'deleted';
export type VehicleCollectionName = 
  | 'passenger_cars' 
  | 'suvs' 
  | 'vans' 
  | 'motorcycles' 
  | 'trucks' 
  | 'buses';

export interface CarListing {
  // IDs (CRITICAL)
  id?: string;                    // Firestore Document ID
  numericId: number;              // Car's sequential ID (e.g. 5)
  carNumericId?: number;          // Alias for numericId
  sellerNumericId: number;        // Owner's sequential ID (e.g. 100)
  sellerId: string;               // Owner's Firebase UID

  // Basic Info
  vehicleType: string;            // passenger_car, suv, etc.
  make: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  currency: 'EUR';             
  
  // Technical
  fuelType: string;
  transmission: string;
  power?: number;                 // HP
  engineSize?: number;            // cc

  // Visuals
  images: string[];
  
  // Location
  city: string;
  region: string;
  
  // Status
  status: VehicleStatus;
  isActive: boolean;
  isSold: boolean;
  
  // Timestamps
  createdAt: Timestamp | any;
  updatedAt: Timestamp | any;
}

// ------------------------------------------------------------------
// 3. COLLECTIONS MAP
// ------------------------------------------------------------------

export const getCollectionName = (vehicleType: string): VehicleCollectionName => {
  const type = vehicleType.toLowerCase();
  switch (type) {
    case 'suv': return 'suvs';
    case 'van': return 'vans';
    case 'motorcycle': return 'motorcycles';
    case 'truck': return 'trucks';
    case 'bus': return 'buses';
    case 'car': 
    default: return 'passenger_cars';
  }
};

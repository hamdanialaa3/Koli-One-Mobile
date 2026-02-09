import { Timestamp } from 'firebase/firestore';

export type VehicleFuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'lpg' | 'cng' | 'hydrogen' | 'other';
export type VehicleTransmission = 'manual' | 'automatic' | 'semi-automatic';
export type VehicleCondition = 'new' | 'used' | 'parts';

export const VEHICLE_COLLECTIONS = [
    'passenger_cars',
    'suvs',
    'motorcycles',
    'trucks',
    'vans',
    'buses',
    'construction_machines',
    'agricultural_machines',
    'trailers',
    'campers',
    'forklifts',
    'boats'
];

export interface UnifiedCar {
    id: string;
    make: string;
    model: string;
    price: number;
    currency: string;
    year: number;
    mileage: number;
    power: number;
    fuelType: VehicleFuelType;
    transmission: VehicleTransmission;
    bodyType?: string;
    color?: string;
    engineSize?: number;

    // Images
    images: string[];
    featuredImageIndex?: number;

    // Location
    location?: {
        cityName?: string;
        cityNameBg?: string;
        cityNameEn?: string;
        regionName?: string;
        countryCode?: string;
    };
    locationData?: {
        cityName?: string;
        regionName?: string;
    };

    // Status
    status: 'draft' | 'published' | 'active' | 'sold' | 'archived' | 'deleted';
    isActive?: boolean;
    isSold?: boolean;
    isFeatured?: boolean;
    isVip?: boolean;
    isPromo?: boolean;

    // Metadata
    sellerId: string;
    sellerNumericId?: number;
    carNumericId?: number;
    numericId?: number;
    createdAt: Date;
    updatedAt: Date;

    // Stats
    viewCount?: number;
    favoriteCount?: number;
}

export interface CarFilters {
    make?: string;
    model?: string;
    minPrice?: number;
    maxPrice?: number;
    minYear?: number;
    maxYear?: number;
    fuelType?: VehicleFuelType;
    transmission?: VehicleTransmission;
    bodyType?: string;
    locationData?: {
        regionName?: string;
    };
    isActive?: boolean;
    isSold?: boolean;
}

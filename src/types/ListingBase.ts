/**
 * Unified Listing Base Model
 * The Single Source of Truth for a Car Listing across the Mobile App.
 * Ensures strict types for UI consumption independent of backend collection variations.
 */

export interface ListingBase {
    id: string;

    // Core Info
    title: string;          // Constructed from Make + Model if missing
    make: string;
    model: string;
    year: number;
    price: number;
    currency: string;       // Normalized to 'EUR' or 'BGN'

    // Specs
    mileage: number;
    fuelType: string;
    transmission: string;
    bodyType?: string;
    power?: number;
    color?: string;

    // Media
    images: string[];

    // Location
    location: string;       // Normalized city/region string
    coordinates?: {
        lat: number;
        lng: number;
    };

    // Metadata
    createdAt: number;      // Unix timestamp (ms)
    status: 'active' | 'sold' | 'draft';
    condition: 'used' | 'new'; // Normalized

    // Seller
    sellerType: string;
    sellerId: string;
    sellerNumericId?: number;
    sellerName?: string;
    sellerPhone?: string;
    description?: string;

    // Parity fields
    carNumericId?: number;
    engineSize?: number;
    doorCount?: number;
    seatCount?: number;
    interiorColor?: string;
    interiorMaterial?: string;
    vin?: string;
    city?: string;
    region?: string;
}

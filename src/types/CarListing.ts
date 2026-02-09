/**
 * CarListing.ts
 * Mobile Types - Synchronized with web/src/types/CarListing.ts
 * @version 2.0.0
 * @sync web/src/types/CarListing.ts
 */

export interface CarListing {
    // === Basic Information ===
    id?: string;
    vin?: string; // Vehicle Identification Number

    // === Numeric ID System (for clean URLs) ===
    numericId?: number;           // Unique numeric ID per seller
    carNumericId?: number;        // Alias for numericId
    sellerNumericId?: number;     // Seller's numeric ID
    ownerNumericId?: number;      // Alias for sellerNumericId
    userCarSequenceId?: number;   // Alias for carNumericId

    // === Vehicle Details ===
    vehicleType: string;
    make: string;
    model: string;
    makeOther?: string;        // Custom brand when make is "__other__"
    modelOther?: string;       // Custom model when model is "__other__"
    year: number;
    mileage: number;
    fuelType: string;
    fuelTypeOther?: string;    // Custom fuel type
    transmission: string;
    power?: number;            // in hp
    powerKW?: number;          // in kW
    engineSize?: number;       // Cubic Capacity in cm³
    color?: string;
    exteriorColor?: string;    // Alias for color
    colorOther?: string;       // Custom color
    doors?: string;
    numberOfDoors?: number;
    seats?: string;
    numberOfSeats?: number;
    condition?: string;
    accidentHistory?: boolean;
    serviceHistory?: boolean;
    fullServiceHistory?: boolean;
    description?: string;

    // === Seller Information ===
    sellerType: string;
    sellerName: string;
    sellerEmail?: string;
    sellerPhone: string;
    sellerId: string;          // REQUIRED for security rules
    companyName?: string;

    // === Location ===
    location?: string;
    city: string;
    region: string;
    postalCode?: string;
    locationData?: {
        cityName?: string;
        regionName?: string;
        cityId?: number;
        regionId?: number;
    };
    coordinates?: {
        lat: number;
        lng: number;
    };
    latitude?: number;         // Alias for coordinates.lat
    longitude?: number;        // Alias for coordinates.lng

    // === Technical Specifications ===
    engineType?: string;
    driveType?: string;
    fuelConsumption?: number;  // l/100km
    co2Emissions?: number;
    euroStandard?: string;
    weight?: number;
    trunkVolume?: number;
    fuelTankCapacity?: number;

    // === Equipment ===
    features?: string[];
    safetyEquipment?: string[];
    comfortEquipment?: string[];
    infotainmentEquipment?: string[];
    exteriorEquipment?: string[];
    interiorEquipment?: string[];
    extras?: string[];

    // === Interior ===
    interiorColor?: string;
    interiorMaterial?: string;
    airbags?: string;
    airConditioning?: string;

    // === Images ===
    images?: string[];

    // === Pricing ===
    price: number;
    currency: string;
    priceType?: string;
    negotiable?: boolean;
    financing?: boolean;
    tradeIn?: boolean;
    warranty?: boolean;
    warrantyMonths?: number;
    paymentMethods?: string[];

    // === Contact ===
    preferredContact?: string[];
    availableHours?: string;

    // === Offer Details ===
    hasVideo?: boolean;
    videoUrl?: string;
    vatReclaimable?: boolean;
    nonSmoker?: boolean;

    // === System Fields ===
    createdAt?: any;           // Firebase Timestamp
    updatedAt?: any;           // Firebase Timestamp
    status: 'active' | 'sold' | 'draft' | 'expired' | 'deleted';
    views?: number;
    favorites?: number;
    isFeatured?: boolean;
    isUrgent?: boolean;
    expiresAt?: any;

    // === Edit Limits ===
    editStats?: {
        makeModelChangeCount: number;
    };

    // === Stories System ===
    stories?: CarStory[];
    hasStories?: boolean;

    // === Body Type (for filters) ===
    bodyType?: string;
}

// === Story Type (synchronized with web) ===
export interface CarStory {
    id: string;
    carId: string;
    sellerId: string;
    videoUrl: string;
    thumbnailUrl?: string;
    duration: number;          // in seconds, max 15
    caption?: string;
    createdAt: any;
    expiresAt: any;            // 24 hours from creation
    views: number;
    isActive: boolean;
}

// === Form Data ===
export interface CarListingFormData extends Partial<CarListing> {
    step: number;
    isComplete: boolean;
    validationErrors?: { [key: string]: string };
}

// === Filters ===
export interface CarListingFilters {
    vehicleType?: string;
    make?: string;
    model?: string;
    yearFrom?: number;
    yearTo?: number;
    mileageFrom?: number;
    mileageTo?: number;
    priceFrom?: number;
    priceTo?: number;
    fuelType?: string;
    transmission?: string;
    location?: string;
    region?: string;
    features?: string[];
    sellerType?: string;
    sortBy?: 'price' | 'year' | 'mileage' | 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

// === Search Result ===
export interface CarListingSearchResult {
    listings: CarListing[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

// === Stats ===
export interface CarListingStats {
    totalListings: number;
    activeListings: number;
    soldListings: number;
    averagePrice: number;
}

// === Analytics ===
export interface CarListingAnalytics {
    views: number;
    favorites: number;
    inquiries: number;
    lastViewed?: any;
}

// === Message ===
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

// === Favorite ===
export interface CarListingFavorite {
    id: string;
    userId: string;
    listingId: string;
    createdAt: any;
}

// === Inquiry ===
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

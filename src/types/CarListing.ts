export interface CarListing {
    id?: string;
    vin?: string;
    numericId?: number;
    carNumericId?: number;
    sellerNumericId?: number;
    vehicleType: string;
    make: string;
    model: string;
    year: number;
    mileage: number;
    fuelType: string;
    transmission: string;
    power?: number;
    color?: string;
    description?: string;
    price: number;
    currency: string;
    sellerType: string;
    sellerName: string;
    sellerId: string;
    sellerPhone: string;
    city: string;
    region: string;
    images?: string[];
    status: 'active' | 'sold' | 'draft';
    createdAt?: any;
    locationData?: {
        cityName?: string;
        regionName?: string;
    };
    coordinates?: {
        lat: number;
        lng: number;
    };
    latitude?: number;
    longitude?: number;
    // Extended properties for parity
    bodyType?: string;
    engineSize?: number;
    doorCount?: number;
    seatCount?: number;
    interiorColor?: string;
    interiorMaterial?: string;
    condition?: string;
}

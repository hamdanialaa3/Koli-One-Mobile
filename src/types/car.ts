export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'lpg' | 'cng' | 'hydrogen' | 'other';
export type TransmissionType = 'manual' | 'automatic' | 'semi-automatic';

export interface CarSummary {
    id: string;
    slug: string;
    title: string;
    priceTotal: number;
    priceCurrency: 'EUR' | 'BGN';
    isLeasing: boolean;
    fuelType: FuelType;
    horsepower: number;
    transmission: TransmissionType;
    mileageKm: number;
    locationCity: string;
    locationPostalCode?: string;
    imageUrl: string;
    firstRegistration?: string;
    priceBadge?: 'great_price' | 'good_price' | 'fair_price' | null;
    sellerNumericId?: number;
    carNumericId?: number;
}

/**
 * Unified Filter Types
 * Source of Truth for Search/Filter State across Web and Mobile.
 * Designed to match Web URL parameters (mk, md, pr, etc.)
 */

export interface FilterState {
    make?: string;          // Maps to 'mk'
    model?: string;         // Maps to 'md'
    generation?: string;    // Maps to 'gen'

    priceMin?: number;      // Maps to 'pf' (priceFrom)
    priceMax?: number;      // Maps to 'pt' (priceTo)

    yearMin?: number;       // Maps to 'yf' (yearFrom)
    yearMax?: number;       // Maps to 'yt' (yearTo)

    mileageMax?: number;    // Maps to 'ml'

    fuelType?: string;      // Maps to 'fuel'
    bodyType?: string;      // Maps to 'body'
    transmission?: string;  // Maps to 'trans'
    driveType?: string;     // Maps to 'drive'
    color?: string;         // Maps to 'clr'

    location?: string;      // Maps to 'loc'

    // Sort
    sort?: 'price_asc' | 'price_desc' | 'year_desc' | 'year_asc' | 'recent' | 'mileage_asc';

    // Pagination
    page?: number;
    limit?: number;
}

export interface FilterOption {
    label: string;
    value: string | number;
    count?: number;
}

export interface FilterMapping {
    webParam: string;
    mobileKey: keyof FilterState;
    type: 'string' | 'number' | 'array';
}

export const DEFAULT_FILTER_STATE: FilterState = {
    sort: 'recent',
    page: 1,
    limit: 20
};

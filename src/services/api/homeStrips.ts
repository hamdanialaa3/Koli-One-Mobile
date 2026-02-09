import { ListingBase } from '../../types/ListingBase';
import { getBrowsingHistory } from '../history/browsingHistory';
import { getFeaturedCars, getNewCarsLast24Hours } from '../car/unified-car-queries';
import { UnifiedCar } from '../car/unified-car-types';

/**
 * Maps properties from UnifiedCar (Web/Firestore model) to ListingBase (Mobile App model)
 */
function mapUnifiedCarToListing(car: UnifiedCar): ListingBase {
    const title = [car.make, car.model].filter(Boolean).join(' ');

    // Ensure images array is valid
    const images = car.images && car.images.length > 0 ? car.images : [];
    if (images.length === 0) {
        // images.push('https://via.placeholder.com/400x300?text=No+Image'); // Optional: Add placeholder if empty
    }

    // Location mapping
    const city = car.location?.cityName || car.locationData?.cityName || car.location?.cityNameBg || '';
    const region = car.location?.regionName || car.locationData?.regionName || '';
    const location = [city, region].filter(Boolean).join(', ');

    return {
        id: car.id,
        title,
        make: car.make,
        model: car.model,
        year: car.year,
        price: car.price || 0,
        currency: car.currency || 'EUR',
        mileage: car.mileage,
        fuelType: car.fuelType,
        transmission: car.transmission,
        bodyType: car.bodyType,
        power: car.power,
        color: car.color,
        images: images,
        location,
        coordinates: undefined, // Add if UnifiedCar has lat/lng
        createdAt: car.createdAt instanceof Date ? car.createdAt.getTime() : new Date().getTime(),
        status: (car.status === 'published' || car.status === 'active') ? 'active' : 'sold', // Simply mapping
        condition: (car as any).condition || 'used',
        sellerType: 'private', // Default, UnifiedCar might not have this explicitly
        sellerId: car.sellerId,
        sellerNumericId: car.sellerNumericId,
        carNumericId: car.carNumericId,
        engineSize: car.engineSize,
        city,
        region
    };
}

// ============================================================================
// RECENTLY VIEWED (Returns ListingBase[])
// ============================================================================
export async function getRecentlyViewedCars(): Promise<ListingBase[]> {
    try {
        const history = await getBrowsingHistory();
        if (!history || history.length === 0) return [];

        return history
            .slice(0, 10)
            .map((item) => mapUnifiedCarToListing(item.listing))
            .filter((car) => car.id);
    } catch {
        return [];
    }
}

// ============================================================================
// FEATURED CARS (Returns ListingBase[])
// ============================================================================
export async function getFeaturedListings(limit: number = 8): Promise<ListingBase[]> {
    try {
        const featured = await getFeaturedCars(limit);
        return featured.map(mapUnifiedCarToListing).filter(c => c.id);
    } catch {
        return [];
    }
}

// ============================================================================
// TOP DEALS (Returns ListingBase[])
// ============================================================================
export async function getTopDealsForUser(): Promise<ListingBase[]> {
    try {
        const [featured, newest] = await Promise.all([
            getFeaturedCars(8).catch(() => [] as UnifiedCar[]),
            getNewCarsLast24Hours(12).catch(() => [] as UnifiedCar[]),
        ]);

        const seenIds = new Set<string>();
        const merged: UnifiedCar[] = [];

        // Prioritize featured, then newest
        for (const car of [...featured, ...newest]) {
            if (!seenIds.has(car.id) && (car.price || 0) > 0) {
                seenIds.add(car.id);
                merged.push(car);
            }
        }

        return merged
            .slice(0, 10)
            .map(mapUnifiedCarToListing)
            .filter((car) => car.id);
    } catch {
        return [];
    }
}

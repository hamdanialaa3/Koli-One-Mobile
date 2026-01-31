import { ListingBase } from '../../types/ListingBase';

/**
 * Listing Normalizer
 * Converts raw Firestore data into strict ListingBase objects.
 * Handles missing fields, date conversions, and format standardization.
 */
export class ListingNormalizer {

    static normalize(raw: any): ListingBase {
        const data = raw || {};

        // 1. ID Handling
        const id = data.id || 'unknown_id';

        // 2. Make/Model Titles
        const make = data.make || 'Unknown Make';
        const model = data.model || 'Unknown Model';
        const title = data.title || `${make} ${model}`; // AI/Fallback title

        // 3. Price & Currency
        const price = Number(data.price) || 0;
        const currency = data.currency || 'EUR';

        // 4. Dates (Firestore Timestamp -> Number)
        let createdAt = Date.now();
        if (data.createdAt) {
            if (typeof data.createdAt === 'number') {
                createdAt = data.createdAt;
            } else if (data.createdAt.toMillis) {
                // Firestore Timestamp
                createdAt = data.createdAt.toMillis();
            } else if (data.createdAt.seconds) {
                createdAt = data.createdAt.seconds * 1000;
            }
        }

        // 5. Location
        const location = data.city || data.locationData?.cityName || 'Bulgaria';

        // 6. Condition
        // If 'condition' field missing, simple heuristic or default to 'used'
        const condition = (data.condition === 'new' || data.isNew) ? 'new' : 'used';

        return {
            id,
            title,
            make,
            model,
            year: Number(data.year) || new Date().getFullYear(),
            price,
            currency,
            mileage: Number(data.mileage) || 0,
            fuelType: data.fuelType || 'Other',
            transmission: data.transmission || 'Manual',
            bodyType: data.bodyType,
            power: data.power,
            color: data.color,
            images: Array.isArray(data.images) ? data.images : [],
            location,
            coordinates: data.coordinates,
            createdAt,
            status: data.status || 'active',
            condition,
            sellerType: data.sellerType || 'private',
            sellerId: data.sellerId || '',
            sellerNumericId: data.sellerNumericId,
            sellerName: data.sellerName || 'Private Seller',
            sellerPhone: data.sellerPhone,
            description: data.description,
            carNumericId: data.carNumericId || data.numericId,
            engineSize: data.engineSize,
            doorCount: data.doors || data.doorCount,
            seatCount: data.seats || data.seatCount,
            interiorColor: data.interiorColor,
            interiorMaterial: data.interiorMaterial,
            vin: data.vin,
            city: data.city,
            region: data.region,
        };
    }

    /**
     * Batch normalize an array of raw docs
     */
    static normalizeAll(rawList: any[]): ListingBase[] {
        if (!Array.isArray(rawList)) return [];
        return rawList.map(item => this.normalize(item));
    }
}

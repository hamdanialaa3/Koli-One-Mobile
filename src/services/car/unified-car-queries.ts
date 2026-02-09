import {
    collection,
    doc,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    getDoc,
    DocumentSnapshot,
    Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { logger } from '../logger-service';
import { UnifiedCar, CarFilters, VEHICLE_COLLECTIONS } from './unified-car-types';

/**
 * Map Firestore document to UnifiedCar
 */
export function mapDocToCar(doc: DocumentSnapshot): UnifiedCar {
    const data = doc.data();

    if (!data) {
        logger.error('Document has no data', new Error(`Document ${doc.id} has no data`), { docId: doc.id });
        throw new Error(`Document ${doc.id} has no data`);
    }

    const car = {
        id: doc.id,
        ...data,
        price: (data.netPrice !== undefined && !isNaN(Number(data.netPrice))) ? Number(data.netPrice) :
            (data.finalPrice !== undefined && !isNaN(Number(data.finalPrice))) ? Number(data.finalPrice) :
                (data.price !== undefined && !isNaN(Number(data.price))) ? Number(data.price) : 0,

        sellerNumericId: data.sellerNumericId ? Number(data.sellerNumericId) : undefined,
        carNumericId: data.carNumericId ? Number(data.carNumericId) : (data.numericId ? Number(data.numericId) : undefined),
        numericId: data.numericId ? Number(data.numericId) : (data.carNumericId ? Number(data.carNumericId) : undefined),

        featuredImageIndex: typeof data.featuredImageIndex === 'number' ? data.featuredImageIndex : 0,

        createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : (data?.createdAt instanceof Date ? data.createdAt : new Date()),
        updatedAt: data?.updatedAt?.toDate ? data.updatedAt.toDate() : (data?.updatedAt instanceof Date ? data.updatedAt : new Date())
    } as UnifiedCar;

    if (car.isActive === undefined || car.isActive === null) {
        car.isActive = car.status === 'active';
    }
    if (car.isSold === undefined || car.isSold === null) {
        car.isSold = car.status === 'sold';
    }

    return car;
}

/**
 * Get featured cars for HomePage
 */
export async function getFeaturedCars(limitCount: number = 4): Promise<UnifiedCar[]> {
    try {
        const allCars: UnifiedCar[] = [];
        const allCollections = [...VEHICLE_COLLECTIONS, 'listings'];

        // Using Promise.allSettled to avoid failing entire query if one collection fails
        const results = await Promise.allSettled(allCollections.map(async (collectionName) => {
            try {
                const q = query(
                    collection(db, collectionName),
                    orderBy('createdAt', 'desc'),
                    limit(limitCount * 4)
                );
                const snapshot = await getDocs(q);
                return snapshot.docs
                    .map((doc: any) => mapDocToCar(doc))
                    .filter((car: any) => {
                        const isActive = car.isActive !== false;
                        const status = (car as any).status;
                        const isPublished = status === 'published' || status === 'active';
                        const isFeatured = (car as any).isFeatured === true;
                        return (isActive || isPublished) && isFeatured;
                    });
            } catch (error) {
                logger.warn(`Error querying ${collectionName} for featured cars`, { error });
                return [];
            }
        }));

        results.forEach(result => {
            if (result.status === 'fulfilled') {
                allCars.push(...result.value);
            }
        });

        const uniqueCarsMap = new Map<string, UnifiedCar>();
        allCars.forEach(car => {
            if (!uniqueCarsMap.has(car.id)) {
                uniqueCarsMap.set(car.id, car);
            }
        });
        const uniqueCars = Array.from(uniqueCarsMap.values());

        const sorted = uniqueCars.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        return sorted.slice(0, limitCount);
    } catch (error) {
        logger.error('Error getting featured cars', error as Error);
        return [];
    }
}

/**
 * Get new cars from last 24 hours
 */
export async function getNewCarsLast24Hours(limitCount: number = 12): Promise<UnifiedCar[]> {
    try {
        const allCars: UnifiedCar[] = [];
        const last24Hours = new Date();
        last24Hours.setHours(last24Hours.getHours() - 24);
        const timestamp24HoursAgo = Timestamp.fromDate(last24Hours);

        const results = await Promise.allSettled(VEHICLE_COLLECTIONS.map(async (collectionName) => {
            try {
                const q = query(
                    collection(db, collectionName),
                    where('createdAt', '>=', timestamp24HoursAgo),
                    orderBy('createdAt', 'desc'),
                    limit(limitCount * 4)
                );
                const snapshot = await getDocs(q);
                return snapshot.docs
                    .map((doc: any) => mapDocToCar(doc))
                    .filter((car: any) => {
                        const isActive = car.isActive !== false;
                        const status = (car as any).status;
                        const isPublished = status === 'published' || status === 'active';
                        return (isActive || isPublished);
                    });
            } catch (error) {
                logger.warn(`Error querying ${collectionName} for new cars`, { error });
                return [];
            }
        }));

        results.forEach(result => {
            if (result.status === 'fulfilled') {
                allCars.push(...result.value);
            }
        });

        const sorted = allCars.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        return sorted.slice(0, limitCount);
    } catch (error) {
        logger.error('Error getting new cars from last 24 hours', error as Error);
        return [];
    }
}

/**
 * Get similar cars (for recommendations)
 */
export async function getSimilarCars(carId: string, limitCount: number = 6): Promise<UnifiedCar[]> {
    try {
        const car = await getCarById(carId);
        if (!car) return [];

        const allCars: UnifiedCar[] = [];

        const results = await Promise.allSettled(VEHICLE_COLLECTIONS.map(async (collectionName) => {
            try {
                let q = query(
                    collection(db, collectionName),
                    where('make', '==', car.make),
                    where('model', '==', car.model),
                    orderBy('createdAt', 'desc'),
                    limit(limitCount * 2)
                );

                let snapshot = await getDocs(q).catch(() => null);

                if (!snapshot || snapshot.empty) {
                    q = query(
                        collection(db, collectionName),
                        where('make', '==', car.make),
                        orderBy('createdAt', 'desc'),
                        limit(limitCount * 2)
                    );
                    snapshot = await getDocs(q).catch(() => null);
                }

                if (snapshot && !snapshot.empty) {
                    return snapshot.docs
                        .map((doc: any) => mapDocToCar(doc))
                        .filter(c => c.id !== carId && c.isActive !== false);
                }
                return [];
            } catch (error) {
                logger.warn(`Error querying similar cars from ${collectionName}`, { error });
                return [];
            }
        }));

        results.forEach(result => {
            if (result.status === 'fulfilled') {
                allCars.push(...result.value);
            }
        });

        const uniqueCars = Array.from(
            new Map(allCars.map((car: any) => [car.id, car])).values()
        );

        return uniqueCars.slice(0, limitCount);
    } catch (error) {
        logger.error('Error getting similar cars', error as Error);
        return [];
    }
}

/**
 * Get car by ID
 */
export async function getCarById(carId: string): Promise<UnifiedCar | null> {
    if (!carId || carId.trim() === '') return null;

    try {
        const searchPromises = VEHICLE_COLLECTIONS.map(async (collectionName) => {
            try {
                const docRef = doc(db, collectionName, carId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    return mapDocToCar(docSnap);
                }
                return null;
            } catch (error) {
                return null;
            }
        });

        const results = await Promise.all(searchPromises);
        return results.find(result => result !== null) || null;
    } catch (error) {
        logger.error('Error getting car by ID', error as Error, { carId });
        return null;
    }
}

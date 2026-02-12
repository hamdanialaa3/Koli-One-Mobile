import { db } from './firebase';
import { collection, query, where, getDocs, limit, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
// import { CarListing } from '../types/CarListing'; // Deprecated in Phase 4
import { ListingBase } from '../types/ListingBase';
import { ListingNormalizer } from './normalization/ListingNormalizer';
import { logger } from './logger-service';

/**
 * All vehicle collections synchronized with web
 * Matches web/src/services/search/multi-collection-helper.ts
 */
export const VEHICLE_COLLECTIONS = [
    'cars',             // Legacy collection
    'passenger_cars',   // Personal cars
    'suvs',             // SUVs/Jeeps
    'vans',             // Vans/Cargo
    'motorcycles',      // Motorcycles
    'trucks',           // Trucks
    'buses'             // Buses
] as const;

export type VehicleCollection = typeof VEHICLE_COLLECTIONS[number];

export class ListingService {
    /**
     * Fetch all active listings from Firestore
     */
    /**
     * Helper: Safe Execute with Error Handling
     */
    private static async safeExecute<T>(
        operation: string,
        promise: Promise<T>,
        fallback: T
    ): Promise<T> {
        try {
            return await promise;
        } catch (error) {
            logger.warn(`Error in ${operation}`, { error });
            // TODO: Log to analytics/crashlytics here
            return fallback;
        }
    }

    /**
     * Fetch all active listings from Firestore (all vehicle collections)
     */
    static async getListings(): Promise<ListingBase[]> {
        return this.safeExecute('getListings', (async () => {
            const listings: any[] = [];

            for (const collName of VEHICLE_COLLECTIONS) {
                try {
                    const q = query(
                        collection(db, collName),
                        where('status', '==', 'active'),
                        limit(20)
                    );

                    const querySnapshot = await getDocs(q);
                    querySnapshot.forEach((doc) => {
                        listings.push({ id: doc.id, ...doc.data() });
                    });
                } catch (e) {
                    // Collection might not exist, continue with others
                }
            }
            return ListingNormalizer.normalizeAll(listings);
        })(), []);
    }

    /**
     * Get a single listing by ID (searches all vehicle collections)
     */
    static async getListingById(id: string): Promise<ListingBase | null> {
        for (const collName of VEHICLE_COLLECTIONS) {
            try {
                const docRef = doc(db, collName, id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    return ListingNormalizer.normalize({ id: docSnap.id, ...docSnap.data() });
                }
            } catch (e) {
                // Continue with next collection
            }
        }
        return null;
    }

    /**
     * Get all listings for a specific user (all vehicle collections)
     */
    static async getUserListings(userId: string): Promise<ListingBase[]> {
        return this.safeExecute('getUserListings', (async () => {
            let allListings: any[] = [];

            for (const collName of VEHICLE_COLLECTIONS) {
                try {
                    const q = query(
                        collection(db, collName),
                        where('sellerId', '==', userId),
                        limit(50)
                    );
                    const snap = await getDocs(q);
                    snap.forEach(doc => allListings.push({ id: doc.id, ...doc.data() }));
                } catch (e) {
                    // Collection might not exist, continue
                }
            }

            return ListingNormalizer.normalizeAll(allListings);
        })(), []);
    }

    /**
     * Get global platform stats for Hero section
     * Fetches real counts from all Firestore vehicle collections
     */
    static async getGlobalStats() {
        try {
            let totalListings = 0;
            
            // Count active listings across all vehicle collections
            for (const collName of VEHICLE_COLLECTIONS) {
                try {
                    const q = query(
                        collection(db, collName),
                        where('status', '==', 'active')
                    );
                    const snapshot = await getDocs(q);
                    totalListings += snapshot.size;
                } catch (e) {
                    // Collection might not exist, continue
                }
            }
            
            // Count dealers (users with profileType 'dealer')
            let totalDealers = 0;
            try {
                const dealersQuery = query(
                    collection(db, 'users'),
                    where('profileType', '==', 'dealer'),
                    where('isActive', '==', true)
                );
                const dealersSnapshot = await getDocs(dealersQuery);
                totalDealers = dealersSnapshot.size;
            } catch (e) {
                totalDealers = 0;
            }
            
            // Format numbers for display
            const formatNumber = (num: number): string => {
                if (num >= 1000) {
                    return num.toLocaleString('bg-BG');
                }
                return num.toString();
            };
            
            return {
                totalListings: formatNumber(totalListings),
                totalDealers: formatNumber(totalDealers),
                trustScore: "98%" // This is a brand value, not a dynamic metric
            };
        } catch (error) {
            logger.error('Error fetching stats', error);
            return { totalListings: "0", totalDealers: "0", trustScore: "98%" };
        }
    }

    /**
     * Get categories with active listing counts (real data from Firestore)
     */
    static async getCategories() {
        const categoryDefs = [
            { id: 'suv', label: 'Джипове (SUV)', collection: 'suvs', minPrice: 12500 },
            { id: 'sedan', label: 'Седани', collection: 'passenger_cars', vehicleType: 'sedan', minPrice: 8900 },
            { id: 'electric', label: 'Електромобили', collection: 'passenger_cars', fuelType: 'electric', minPrice: 22000 },
            { id: 'station_wagon', label: 'Комби', collection: 'passenger_cars', vehicleType: 'station_wagon', minPrice: 6500 }
        ];
        
        const categories = await Promise.all(categoryDefs.map(async (cat) => {
            let count = 0;
            let lowestPrice = cat.minPrice;
            
            try {
                let q;
                if (cat.vehicleType) {
                    q = query(
                        collection(db, cat.collection),
                        where('status', '==', 'active'),
                        where('vehicleType', '==', cat.vehicleType)
                    );
                } else if (cat.fuelType) {
                    q = query(
                        collection(db, cat.collection),
                        where('status', '==', 'active'),
                        where('fuelType', '==', cat.fuelType)
                    );
                } else {
                    q = query(
                        collection(db, cat.collection),
                        where('status', '==', 'active')
                    );
                }
                
                const snapshot = await getDocs(q);
                count = snapshot.size;
                
                // Find lowest price
                snapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.price && data.price < lowestPrice) {
                        lowestPrice = data.price;
                    }
                });
            } catch (e) {
                // Use defaults if query fails
            }
            
            return {
                id: cat.id,
                label: cat.label,
                count: count > 0 ? count.toLocaleString('bg-BG') : '0',
                price: `от ${lowestPrice.toLocaleString('bg-BG')} €`,
                image: this.getCategoryImage(cat.id)
            };
        }));
        
        return categories;
    }
    
    /**
     * Get category placeholder images
     */
    private static getCategoryImage(categoryId: string): string {
        const images: Record<string, string> = {
            'suv': 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=600&q=80',
            'sedan': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80',
            'electric': 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=600&q=80',
            'station_wagon': 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80'
        };
        return images[categoryId] || images['sedan'];
    }

    /**
     * Get multiple listings by IDs efficiently
     * Optimizes N+1 reads by querying collections in parallel with 'in' operator
     */
    /**
     * Get multiple listings by IDs efficiently
     */
    static async getListingsByIds(ids: string[]): Promise<ListingBase[]> {
        return this.safeExecute('getListingsByIds', (async () => {
            if (!ids || ids.length === 0) return [];

            const collections = ['passenger_cars', 'cars', 'suvs'];
            const results: any[] = [];
            const safeIds = ids.slice(0, 10);
            const { documentId } = require('firebase/firestore');

            const promises = collections.map(colName => {
                const q = query(
                    collection(db, colName),
                    where(documentId(), 'in', safeIds)
                );
                return getDocs(q);
            });

            const snapshots = await Promise.all(promises);

            snapshots.forEach(snap => {
                snap.forEach(doc => {
                    results.push({ id: doc.id, ...doc.data() });
                });
            });

            return ListingNormalizer.normalizeAll(results);
        })(), []);
    }
    /**
     * Unified Search Method
     * Uses the UnifiedFilterEngine to run parity-compliant queries
     */
    /**
     * Unified Search Method
     * Uses the UnifiedFilterEngine to run parity-compliant queries
     */
    static async search(filters: import('./search/UnifiedFilterTypes').FilterState): Promise<ListingBase[]> {
        return this.safeExecute('search', (async () => {
            const { UnifiedFilterEngine } = require('./search/UnifiedFilterEngine');

            const constraints = UnifiedFilterEngine.buildSearchQuery(filters);
            const sortConstraints = UnifiedFilterEngine.buildSortQuery(filters.sort);

            const targetCollections = filters.bodyType
                ? [this.mapCategoryToCollection(filters.bodyType)]
                : ['passenger_cars', 'cars', 'suvs'];

            const promises = targetCollections.map(async (collectionName) => {
                if (!collectionName) return [];

                const collRef = collection(db, collectionName);
                const finalQuery = query(
                    collRef,
                    where('status', '==', 'active'),
                    ...constraints,
                    ...sortConstraints,
                    limit(filters.limit || 20)
                );

                const snap = await getDocs(finalQuery);
                return snap.docs.map(d => ({ id: d.id, ...d.data() }));
            });

            const resultsArrays = await Promise.all(promises);
            const allDocs = resultsArrays.flat();

            return this.clientSideSort(ListingNormalizer.normalizeAll(allDocs), filters.sort);
        })(), []);
    }

    private static mapCategoryToCollection(catId: string): string | null {
        switch (catId) {
            case 'suv': return 'suvs';
            case 'sedan': case 'hatchback': return 'passenger_cars';
            // Add more mappings as project grows
            default: return 'passenger_cars';
        }
    }

    private static clientSideSort(docs: ListingBase[], sortType: string = 'recent'): ListingBase[] {
        return docs.sort((a, b) => {
            if (sortType.includes('price_asc')) return (a.price || 0) - (b.price || 0);
            if (sortType.includes('price_desc')) return (b.price || 0) - (a.price || 0);
            if (sortType.includes('year_desc')) return (b.year || 0) - (a.year || 0);
            if (sortType.includes('year_asc')) return (a.year || 0) - (b.year || 0);
            // Default recent
            return b.createdAt - a.createdAt;
        });
    }

    /**
     * Update an existing listing
     */
    static async updateListing(id: string, updates: Partial<ListingBase>): Promise<void> {
        const collections = ['passenger_cars', 'cars', 'suvs'];
        for (const collName of collections) {
            const docRef = doc(db, collName, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                await updateDoc(docRef, {
                    ...updates,
                    updatedAt: serverTimestamp()
                });
                return;
            }
        }
        throw new Error("Listing not found for update");
    }

    /**
     * Delete a listing
     */
    static async deleteListing(id: string): Promise<void> {
        const collections = ['passenger_cars', 'cars', 'suvs'];
        for (const collName of collections) {
            const docRef = doc(db, collName, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                await updateDoc(docRef, { status: 'deleted' }); // Soft delete
                return;
            }
        }
    }
}


import { db } from './firebase';
import { collection, query, where, getDocs, limit, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
// import { CarListing } from '../types/CarListing'; // Deprecated in Phase 4
import { ListingBase } from '../types/ListingBase';
import { ListingNormalizer } from './normalization/ListingNormalizer';

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
            console.warn(`[ListingService] Error in ${operation}:`, error);
            // TODO: Log to analytics/crashlytics here
            return fallback;
        }
    }

    /**
     * Fetch all active listings from Firestore
     */
    static async getListings(): Promise<ListingBase[]> {
        return this.safeExecute('getListings', (async () => {
            const listings: any[] = [];
            const collections = ['passenger_cars', 'cars', 'suvs'];

            for (const collName of collections) {
                const q = query(
                    collection(db, collName),
                    where('status', '==', 'active'),
                    limit(20)
                );

                const querySnapshot = await getDocs(q);
                querySnapshot.forEach((doc) => {
                    listings.push({ id: doc.id, ...doc.data() });
                });
            }
            return ListingNormalizer.normalizeAll(listings);
        })(), []);
    }

    /**
     * Get a single listing by ID
     */
    /**
     * Get a single listing by ID
     */
    static async getListingById(id: string): Promise<ListingBase | null> {
        // Since we don't know the collection, we check common ones
        const collections = ['passenger_cars', 'cars', 'suvs'];

        for (const collName of collections) {
            const docRef = doc(db, collName, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return ListingNormalizer.normalize({ id: docSnap.id, ...docSnap.data() });
            }
        }
        return null;
    }

    /**
     * Get all listings for a specific user
     */
    static async getUserListings(userId: string): Promise<ListingBase[]> {
        return this.safeExecute('getUserListings', (async () => {
            const collections = ['passenger_cars', 'cars', 'suvs'];
            let allListings: any[] = [];

            for (const collName of collections) {
                const q = query(
                    collection(db, collName),
                    where('sellerId', '==', userId),
                    limit(50)
                );
                const snap = await getDocs(q);
                snap.forEach(doc => allListings.push({ id: doc.id, ...doc.data() }));
            }

            return ListingNormalizer.normalizeAll(allListings);
        })(), []);
    }

    /**
     * Get global platform stats for Hero section
     */
    static async getGlobalStats() {
        // In a real app with uniform "counters" collection is best. 
        // For parity MVP without backend functions, we'll estimate or count.
        try {
            // Mocking "real" stats for MVP parity or doing a light fetch
            return {
                totalListings: "15,420", // TODO: Replace with server count
                totalDealers: "520",
                trustScore: "98%"
            };
        } catch (error) {
            console.error("Error fetching stats:", error);
            return { totalListings: "15,000+", totalDealers: "500+", trustScore: "98%" };
        }
    }

    /**
     * Get categories with active listing counts
     */
    static async getCategories() {
        // Return the static categories but we could async fetch counts here
        return [
            {
                id: 'suv',
                label: 'Джипове (SUV)',
                count: '1,240', // TODO: dynamic count
                price: 'от 12,500 €',
                image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=600&q=80'
            },
            {
                id: 'sedan',
                label: 'Седани',
                count: '2,850',
                price: 'от 8,900 €',
                image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80'
            },
            {
                id: 'electric',
                label: 'Електромобили',
                count: '450',
                price: 'от 22,000 €',
                image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=600&q=80'
            },
            {
                id: 'station_wagon',
                label: 'Комби',
                count: '1,100',
                price: 'от 6,500 €',
                image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80'
            }
        ];
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

            const targetCollections = filters.category
                ? [this.mapCategoryToCollection(filters.category)]
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


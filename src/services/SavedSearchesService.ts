import { db, auth } from './firebase';
import { 
    collection, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    getDocs, 
    query, 
    where, 
    orderBy,
    Timestamp 
} from 'firebase/firestore';
import { logger } from './logger-service';

/**
 * TASK-07: Saved Searches Service
 * 
 * Manages user's saved searches for price drop alerts.
 * When a car's price drops and matches a saved search, the user receives a push notification.
 */

export interface SavedSearch {
    id?: string;
    userId: string;
    userFirebaseId: string;
    // Search criteria
    make?: string;
    model?: string;
    yearMin?: number;
    yearMax?: number;
    priceMax?: number;
    mileageMax?: number;
    categories?: string[];         // e.g., ['new', 'used']
    fuelTypes?: string[];          // e.g., ['gasoline', 'diesel', 'electric']
    transmissions?: string[];      // e.g., ['automatic', 'manual']
    bodyTypes?: string[];          // e.g., ['sedan', 'suv', 'hatchback']
    regions?: string[];            // e.g., ['Sofia', 'Plovdiv', 'Varna']
    // Metadata
    searchName: string;            // User-defined name for this search
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    notificationsEnabled: boolean;
}

export interface PriceAlert {
    id?: string;
    userId: string;
    userFirebaseId: string;
    carId: string;
    carNumericId: number;
    carMake: string;
    carModel: string;
    oldPrice: number;
    newPrice: number;
    discount: number;
    discountPercent: number;
    notificationSent: boolean;
    notificationSentAt?: string;
    createdAt: string;
    isRead: boolean;
}

export class SavedSearchesService {
    private static collectionName = 'saved_searches';
    private static alertsCollectionName = 'price_alerts';

    /**
     * Create a new saved search
     */
    static async createSavedSearch(
        searchCriteria: Omit<SavedSearch, 'id' | 'userId' | 'userFirebaseId' | 'createdAt' | 'updatedAt'>
    ): Promise<string> {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('User must be authenticated to save searches');
        }

        try {
            // Get user's numeric ID from profile
            const userDoc = await getDocs(
                query(
                    collection(db, 'users'),
                    where('firebaseUserId', '==', currentUser.uid)
                )
            );

            if (userDoc.empty) {
                throw new Error('User profile not found');
            }

            const userProfile = userDoc.docs[0].data();
            const userId = userProfile.numericId;

            const now = new Date().toISOString();
            const savedSearchData: Omit<SavedSearch, 'id'> = {
                ...searchCriteria,
                userId,
                userFirebaseId: currentUser.uid,
                createdAt: now,
                updatedAt: now,
                isActive: true,
                notificationsEnabled: true
            };

            const docRef = await addDoc(
                collection(db, this.collectionName),
                savedSearchData
            );

            logger.info('Saved search created', { searchId: docRef.id });
            return docRef.id;
        } catch (error) {
            logger.error('Error creating saved search', error);
            throw error;
        }
    }

    /**
     * Get all saved searches for current user
     */
    static async getUserSavedSearches(): Promise<SavedSearch[]> {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            return [];
        }

        try {
            const q = query(
                collection(db, this.collectionName),
                where('userFirebaseId', '==', currentUser.uid),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as SavedSearch));
        } catch (error) {
            logger.error('Error fetching saved searches', error);
            return [];
        }
    }

    /**
     * Update a saved search
     */
    static async updateSavedSearch(
        searchId: string,
        updates: Partial<Omit<SavedSearch, 'id' | 'userId' | 'userFirebaseId' | 'createdAt'>>
    ): Promise<void> {
        try {
            const docRef = doc(db, this.collectionName, searchId);
            await updateDoc(docRef, {
                ...updates,
                updatedAt: new Date().toISOString()
            });

            logger.info('Saved search updated', { searchId });
        } catch (error) {
            logger.error('Error updating saved search', error);
            throw error;
        }
    }

    /**
     * Toggle notifications for a saved search
     */
    static async toggleNotifications(searchId: string, enabled: boolean): Promise<void> {
        await this.updateSavedSearch(searchId, { notificationsEnabled: enabled });
    }

    /**
     * Delete a saved search
     */
    static async deleteSavedSearch(searchId: string): Promise<void> {
        try {
            const docRef = doc(db, this.collectionName, searchId);
            await deleteDoc(docRef);

            logger.info('Saved search deleted', { searchId });
        } catch (error) {
            logger.error('Error deleting saved search', error);
            throw error;
        }
    }

    /**
     * Get price alerts for current user
     */
    static async getUserPriceAlerts(limit = 50): Promise<PriceAlert[]> {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            return [];
        }

        try {
            const q = query(
                collection(db, this.alertsCollectionName),
                where('userFirebaseId', '==', currentUser.uid),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const alerts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                isRead: doc.data().isRead || false
            } as PriceAlert));

            return alerts.slice(0, limit);
        } catch (error) {
            logger.error('Error fetching price alerts', error);
            return [];
        }
    }

    /**
     * Mark price alert as read
     */
    static async markAlertAsRead(alertId: string): Promise<void> {
        try {
            const docRef = doc(db, this.alertsCollectionName, alertId);
            await updateDoc(docRef, { isRead: true });

            logger.info('Alert marked as read', { alertId });
        } catch (error) {
            logger.error('Error marking alert as read', error);
        }
    }

    /**
     * Mark all alerts as read for current user
     */
    static async markAllAlertsAsRead(): Promise<void> {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        try {
            const q = query(
                collection(db, this.alertsCollectionName),
                where('userFirebaseId', '==', currentUser.uid),
                where('isRead', '==', false)
            );

            const snapshot = await getDocs(q);
            const updates = snapshot.docs.map(doc => 
                updateDoc(doc.ref, { isRead: true })
            );

            await Promise.all(updates);
            logger.info('All alerts marked as read', { count: updates.length });
        } catch (error) {
            logger.error('Error marking all alerts as read', error);
        }
    }

    /**
     * Get unread alerts count
     */
    static async getUnreadAlertsCount(): Promise<number> {
        const currentUser = auth.currentUser;
        if (!currentUser) return 0;

        try {
            const q = query(
                collection(db, this.alertsCollectionName),
                where('userFirebaseId', '==', currentUser.uid),
                where('isRead', '==', false)
            );

            const snapshot = await getDocs(q);
            return snapshot.size;
        } catch (error) {
            logger.error('Error getting unread count', error);
            return 0;
        }
    }

    /**
     * Generate a user-friendly description of search criteria
     */
    static getSearchDescription(search: SavedSearch): string {
        const parts: string[] = [];

        if (search.make) {
            parts.push(search.make);
            if (search.model) parts.push(search.model);
        } else {
            parts.push('Всички марки');
        }

        if (search.yearMin || search.yearMax) {
            if (search.yearMin && search.yearMax) {
                parts.push(`${search.yearMin}-${search.yearMax}`);
            } else if (search.yearMin) {
                parts.push(`от ${search.yearMin}`);
            } else if (search.yearMax) {
                parts.push(`до ${search.yearMax}`);
            }
        }

        if (search.priceMax) {
            parts.push(`до €${search.priceMax.toLocaleString()}`);
        }

        if (search.bodyTypes?.length) {
            parts.push(search.bodyTypes.join(', '));
        }

        if (search.regions?.length) {
            parts.push(search.regions.join(', '));
        }

        return parts.join(' • ');
    }
}

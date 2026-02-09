import { db, auth } from './firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    doc,
    getDoc,
    onSnapshot,
    collection,
    query,
    where,
    addDoc,
    deleteDoc,
    getDocs,
    serverTimestamp,
    updateDoc,
    increment
} from 'firebase/firestore';
import { BulgarianUser } from '../types/user/bulgarian-user.types';
import { CarListing } from '../types/CarListing';
import { logger } from './logger-service';

export interface AppNotification {
    id: string;
    type: 'message' | 'price_drop' | 'favorite' | 'system';
    title: string;
    message: string;
    read: boolean;
    timestamp: any;
    data?: any;
}

export class PlatformSyncService {
    /**
     * Listen to user statistics in real-time
     * Syncs: activeListings, totalViews, totalMessages
     */
    static subscribeToUserStats(userId: string, callback: (stats: any) => void) {
        return onSnapshot(doc(db, 'users', userId), (doc) => {
            if (doc.exists()) {
                const data = doc.data() as BulgarianUser;
                callback(data.stats);
            }
        });
    }

    /**
     * Sync Favorites Logic (Ported from Web)
     */
    static async toggleFavorite(car: CarListing): Promise<boolean> {
        if (!auth.currentUser) throw new Error("Auth required");
        const userId = auth.currentUser.uid;

        const favQuery = query(
            collection(db, 'favorites'),
            where('userId', '==', userId),
            where('carId', '==', car.id)
        );

        const snapshot = await getDocs(favQuery);

        if (!snapshot.empty) {
            // Remove
            await deleteDoc(doc(db, 'favorites', snapshot.docs[0].id));
            return false;
        } else {
            // Add
            await addDoc(collection(db, 'favorites'), {
                userId,
                carId: car.id,
                carData: {
                    make: car.make,
                    model: car.model,
                    price: car.price,
                    year: car.year,
                    image: car.images?.[0] || '',
                    mileage: car.mileage,
                    location: `${car.city}, ${car.region}`
                },
                addedAt: serverTimestamp(),
                originalPrice: car.price,
                notifyOnPriceChange: true
            });
            return true;
        }
    }

    /**
     * Check if car is favorited by current user
     */
    static async isFavorite(carId: string): Promise<boolean> {
        if (!auth.currentUser) return false;
        const q = query(
            collection(db, 'favorites'),
            where('userId', '==', auth.currentUser.uid),
            where('carId', '==', carId)
        );
        const snap = await getDocs(q);
        return !snap.empty;
    }

    /**
     * Listen for unread notifications count
     */
    static subscribeToUnreadNotifications(userId: string, callback: (count: number) => void) {
        const q = query(
            collection(db, `users/${userId}/notifications`),
            where('read', '==', false)
        );
        return onSnapshot(q, (snap) => {
            callback(snap.size);
        });
    }

    /**
     * Get user's favorited cars
     */
    static async getUserFavorites(userId: string): Promise<any[]> {
        const q = query(collection(db, 'favorites'), where('userId', '==', userId));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    /**
     * Track recently viewed car (Local Storage for performance)
     */
    static async addToHistory(carId: string) {
        try {
            const historyJson = await AsyncStorage.getItem('browsing_history');
            let history: string[] = historyJson ? JSON.parse(historyJson) : [];

            // Remove if already exists and move to front
            history = history.filter(id => id !== carId);
            history.unshift(carId);

            // Keep only last 10
            const recent = history.slice(0, 10);
            await AsyncStorage.setItem('browsing_history', JSON.stringify(recent));
        } catch (e) {
            logger.error('Failed to update history', e);
        }
    }

    /**
     * Get recently viewed car IDs
     */
    static async getHistory(): Promise<string[]> {
        try {
            const historyJson = await AsyncStorage.getItem('browsing_history');
            return historyJson ? JSON.parse(historyJson) : [];
        } catch (e) {
            return [];
        }
    }

    /**
     * Clear history
     */
    static async clearHistory() {
        await AsyncStorage.removeItem('browsing_history');
    }

    /**
     * Increment view count (World-Class Tracking)
     */
    static async trackCarView(carId: string, collectionName: string = 'passenger_cars') {
        // Track locally
        await this.addToHistory(carId);

        const carRef = doc(db, collectionName, carId);
        try {
            await updateDoc(carRef, {
                views: increment(1)
            });
        } catch (e) {
            logger.warn('View tracking failed (might be legacy doc structure)');
        }
    }
}

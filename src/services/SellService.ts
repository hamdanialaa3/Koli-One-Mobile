import { db, auth, storage } from './firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc, query, where, getDocs, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { VehicleFormData } from '../types/sellTypes';
import { logger } from './logger-service';
import { retry } from '../utils/retry';

export class SellService {
    /**
     * Submit a new listing to Firestore
     * Aligning with web logic by saving to specific collections based on vehicle type
     */
    /**
     * Submit a new listing to Firestore
     * ✅ UPDATED: Used Numeric Car System for atomic creation with strict numeric IDs
     */
    static async submitListing(data: Partial<VehicleFormData>): Promise<string> {
        if (!auth.currentUser) throw new Error("Authentication required");

        logger.info('Submitting listing via NumericCarSystem', { type: data.vehicleType });

        try {
            // Import dynamically to avoid circular dependencies if any, or just standard import
            const { numericCarSystemService } = await import('./numeric-car-system.service');

            const carData = {
                ...data,
                // Ensure numeric values are numbers
                price: Number(data.price) || 0,
                mileage: Number(data.mileage) || 0,
                power: Number(data.power) || 0,
                year: Number(data.year) || new Date().getFullYear(),
            };

            // Delegate to the atomic service
            // This handles: ID generation, Collection selection, User stats update, Transaction safety
            const createdCar = await numericCarSystemService.createCarAtomic(carData);

            logger.info('Listing submitted successfully', { id: createdCar.id });
            return createdCar.id!;

        } catch (error) {
            logger.error('Error submitting listing', error);
            throw error;
        }
    }

    /**
     * Upload multiple images to Firebase Storage
     */
    static async uploadImages(uris: string[]): Promise<string[]> {
        if (!auth.currentUser) throw new Error("Authentication required");

        const uploadPromises = uris.map(async (uri) => {
            try {
                // If it's already a remote URL, skip upload
                if (uri.startsWith('http')) return uri;

                const response = await fetch(uri);
                const blob = await response.blob();
                const filename = `listings/${auth.currentUser?.uid}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
                const storageRef = ref(storage, filename);

                await uploadBytes(storageRef, blob);
                return await getDownloadURL(storageRef);
            } catch (error) {
                logger.error('Error uploading image', error);
                return null;
            }
        });

        const results = await Promise.all(uploadPromises);
        return results.filter((url): url is string => url !== null);
    }
    /**
     * Resumable upload with progress tracking
     */
    static async uploadImageResumable(uri: string, options: { onProgress: (p: number) => void; signal: AbortSignal }): Promise<string> {
        if (!auth.currentUser) throw new Error("Authentication required");
        if (options.signal.aborted) throw new Error("Aborted");

        // Simulating resumable upload for now as Firebase JS SDK mostly handles this automatically
        // in a real environment we might use uploadBytesResumable

        try {
            if (uri.startsWith('http')) {
                options.onProgress(100);
                return uri;
            }

            const response = await fetch(uri);
            const blob = await response.blob();
            const filename = `listings/${auth.currentUser?.uid}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
            const storageRef = ref(storage, filename);

            const uploadTask = uploadBytes(storageRef, blob);

            // Initial progress
            options.onProgress(10);

            await uploadTask;
            options.onProgress(100);

            return await getDownloadURL(storageRef);
        } catch (error) {
            logger.error('Error uploading image resumable', error);
            throw error;
        }
    }
}


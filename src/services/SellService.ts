import { db, auth, storage } from './firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc, query, where, getDocs, limit } from 'firebase/firestore';
import { ref, uploadBytes, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
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

        return retry(async () => {
            if (uri.startsWith('http')) {
                options.onProgress(100);
                return uri;
            }

            const response = await fetch(uri);
            const blob = await response.blob();
            const filename = `listings/${auth.currentUser?.uid}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
            const storageRef = ref(storage, filename);

            return new Promise<string>((resolve, reject) => {
                const uploadTask = uploadBytesResumable(storageRef, blob);

                // Wire abort signal to cancel the upload
                const onAbort = () => {
                    uploadTask.cancel();
                    reject(new Error('Upload aborted'));
                };
                options.signal.addEventListener('abort', onAbort, { once: true });

                uploadTask.on(
                    'state_changed',
                    (snapshot) => {
                        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                        options.onProgress(progress);
                    },
                    (error) => {
                        options.signal.removeEventListener('abort', onAbort);
                        logger.error('Resumable upload error', error);
                        reject(error);
                    },
                    async () => {
                        options.signal.removeEventListener('abort', onAbort);
                        try {
                            const url = await getDownloadURL(uploadTask.snapshot.ref);
                            options.onProgress(100);
                            resolve(url);
                        } catch (e) {
                            reject(e);
                        }
                    }
                );
            });
        }, 3, 1000);
    }
}


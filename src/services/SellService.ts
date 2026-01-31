import { db, auth, storage } from './firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc, query, where, getDocs, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { VehicleFormData } from '../types/sellTypes';

export class SellService {
    /**
     * Submit a new listing to Firestore
     * Aligning with web logic by saving to specific collections based on vehicle type
     */
    static async submitListing(data: Partial<VehicleFormData>): Promise<string> {
        if (!auth.currentUser) throw new Error("Authentication required");

        const listingData = {
            ...data,
            sellerId: auth.currentUser.uid,
            userId: auth.currentUser.uid, // Required for security rules
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            status: 'active',
            isActive: true,
            isSold: false,
            views: 0,
            favorites: 0,
            vehicleType: data.vehicleType || 'car',
            // Ensure numeric values are numbers
            price: Number(data.price) || 0,
            mileage: Number(data.mileage) || 0,
            power: Number(data.power) || 0,
            year: Number(data.year) || new Date().getFullYear(),
        };

        // Determine collection name (aligning with web's SellWorkflowCollections)
        const type = (data.vehicleType || 'car').toLowerCase();
        let collectionName = 'cars';

        if (type === 'car') collectionName = 'passenger_cars';
        else if (type === 'motorcycle') collectionName = 'motorcycles';
        else if (type === 'truck') collectionName = 'trucks';
        else if (type === 'van') collectionName = 'vans';
        else if (type === 'bus') collectionName = 'buses';

        try {
            const docRef = await addDoc(collection(db, collectionName), listingData);
            return docRef.id;
        } catch (error) {
            console.error("Error submitting listing:", error);
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
                console.error("Error uploading image:", error);
                return null;
            }
        });

        const results = await Promise.all(uploadPromises);
        return results.filter((url): url is string => url !== null);
    }
}

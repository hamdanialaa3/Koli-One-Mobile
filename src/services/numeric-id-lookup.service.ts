/**
 * Numeric ID Lookup Service
 * Resolves numeric IDs to Firebase UIDs and vice versa
 * Ported from Web for Mobile Parity
 */

import { collection, query, where, getDocs, limit, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { User, CarListing, VehicleCollectionName } from '../types/SharedTypes';
import { logger } from './logger-service';

/**
 * Get user by numeric ID
 */
export const getUserByNumericId = async (numericId: number): Promise<User | null> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('numericId', '==', numericId),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      logger.warn('User not found by numeric ID', { numericId });
      return null;
    }

    const userData = snapshot.docs[0].data() as User;
    return {
      ...userData,
      uid: snapshot.docs[0].id
    };
  } catch (error) {
    logger.error('Failed to get user by numeric ID', error);
    return null;
  }
};

/**
 * Get Firebase UID by numeric ID (faster if you only need the UID)
 */
export const getFirebaseUidByNumericId = async (numericId: number): Promise<string | null> => {
  const user = await getUserByNumericId(numericId);
  return user?.uid || null;
};

/**
 * Get user's numeric ID from Firebase UID
 */
export const getNumericIdByFirebaseUid = async (uid: string): Promise<number | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
  
      if (!userDoc.exists()) {
        logger.warn('User not found by Firebase UID', { uid });
        return null;
      }
  
      return userDoc.data()?.numericId || null;
    } catch (error) {
      logger.error('Failed to get numeric ID by Firebase UID', error, { uid });
      return null;
    }
  };

/**
 * Get car by numeric IDs
 */
export const getCarByNumericIds = async (
  sellerNumericId: number,
  carNumericId: number
): Promise<CarListing | null> => {
  try {
    const VEHICLE_COLLECTIONS: VehicleCollectionName[] = [
        'passenger_cars', 
        'suvs', 
        'vans', 
        'motorcycles', 
        'trucks', 
        'buses'
    ];
    
    // Strategy 1: Direct Lookup across all collections
    for (const collectionName of VEHICLE_COLLECTIONS) {
      const carsRef = collection(db, collectionName);
      const q = query(
        carsRef,
        where('sellerNumericId', '==', sellerNumericId),
        where('carNumericId', '==', carNumericId),
        limit(1)
      );
      
      const snap = await getDocs(q);
      if (!snap.empty) {
        const carData = snap.docs[0].data() as CarListing;
        return { ...carData, id: snap.docs[0].id };
      }
    }

    // Strategy 2: Fallback via User UID resolution (if direct lookup fails)
    const sellerUid = await getFirebaseUidByNumericId(sellerNumericId);
    
    if (sellerUid) {
      for (const collectionName of VEHICLE_COLLECTIONS) {
        const carsRef = collection(db, collectionName);
        const q = query(
          carsRef,
          where('sellerId', '==', sellerUid),
          where('carNumericId', '==', carNumericId),
          limit(1)
        );
        
        const snap = await getDocs(q);
        if (!snap.empty) {
            const carData = snap.docs[0].data() as CarListing;
            return { ...carData, id: snap.docs[0].id };
        }
      }
    }

    return null;

  } catch (error) {
    logger.error('Failed to get car by numeric IDs', error);
    return null;
  }
};

/**
 * Numeric Car System Service
 * 🔢 Strict Numeric ID System for Cars
 * Ported from Web for Mobile Parity
 */

import {
    collection,
    doc,
    runTransaction,
    serverTimestamp,
    increment
  } from 'firebase/firestore';
  import { db, auth } from './firebase';
  import { getNextCarNumericId } from './numeric-id-counter.service';
  import { getNumericIdByFirebaseUid } from './numeric-id-lookup.service';
  import { CarListing, getCollectionName } from '../types/SharedTypes';
  import { logger } from './logger-service';
  
  export class NumericCarSystemService {
    
    /**
     * Get user's numeric ID Wrapper
     */
    async getUserNumericId(userId: string): Promise<number> {
      const numericId = await getNumericIdByFirebaseUid(userId);
      if (!numericId) {
        throw new Error(`❌ User numericId not found for: ${userId}`);
      }
      return numericId;
    }
  
    /**
     * ✅ Create car ATOMICALLY (Transaction)
     * Bundles: ID generation, Document creation, and Profile stats increment
     */
    async createCarAtomic(carData: Partial<CarListing>): Promise<CarListing> {
      const currentUser = auth.currentUser;
      if (!currentUser?.uid) {
        throw new Error('❌ Not authenticated');
      }
  
      try {
        const result = await runTransaction(db, async (transaction) => {
          // 1️⃣ Get user's numeric ID (Must exist)
          // Note: Reads must come before writes in Firestore transactions
          // We assume user profile handles its own numericId creation on signup.
          // Ideally we fetch this outside or ensure the read is part of the transaction block properly.
          // Since getNumericIdByFirebaseUid is a helper, we might need to manually do the doc get here 
          // to adhere to transaction rules if strict. But assuming we just need the value:
          
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await transaction.get(userDocRef);
          
          if (!userDoc.exists()) throw new Error("User profile not found");
          const userNumericId = userDoc.data()?.numericId;
          
          if (!userNumericId) throw new Error("User has no numeric ID assigned");
  
          // 2️⃣ Get next car numeric ID
          // We use the counter service logic but integrated into THIS transaction for atomicity
          const counterRef = doc(db, 'counters', 'cars', 'sellers', currentUser.uid);
          const counterDoc = await transaction.get(counterRef);
          let currentCount = 0;
          if (counterDoc.exists()) {
              currentCount = counterDoc.data()?.count || 0;
          }
          const carNumericId = currentCount + 1;
  
          // 3️⃣ Determine collection
          const vehicleType = carData.vehicleType || 'passenger_cars'; // Default fallback
          const collectionName = getCollectionName(vehicleType);
          
          // 4️⃣ Create references
          const carRef = doc(collection(db, collectionName));
          
          // 5️⃣ Prepare Data
          const fullCarData = {
            ...carData,
            id: carRef.id,
            sellerId: currentUser.uid,
            sellerNumericId: userNumericId,
            carNumericId: carNumericId,
            numericId: carNumericId, // Legacy alias
            
            status: 'active',
            isActive: true,
            isSold: false,
            views: 0,
            favorites: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
  
          // 6️⃣ Execute Writes
          // A) Update Counter
          transaction.set(counterRef, { count: carNumericId, updatedAt: serverTimestamp() }, { merge: true });
          
          // B) Create Car
          transaction.set(carRef, fullCarData);
          
          // C) Update User Stats
          transaction.update(userDocRef, {
            'stats.activeListings': increment(1),
            'stats.totalListings': increment(1),
            updatedAt: serverTimestamp()
          });
  
          return fullCarData;
        });
  
        logger.info('Car created atomically', {
            id: result.id,
            sellerNumericId: result.sellerNumericId,
            carNumericId: result.carNumericId
        });
  
        return result as CarListing;
  
      } catch (error) {
        logger.error('Atomic car creation failed', error);
        throw error;
      }
    }
  }
  
  export const numericCarSystemService = new NumericCarSystemService();

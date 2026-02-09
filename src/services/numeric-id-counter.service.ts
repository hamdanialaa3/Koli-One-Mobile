/**
 * Numeric ID Counter Service
 * Manages auto-incrementing numeric IDs for users and cars
 * Ported from Web for Mobile Parity
 */

import { doc, runTransaction, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { logger } from './logger-service';

/**
 * Get next numeric ID for a car (per seller)
 * Format: Each seller has their own counter (seller's 1st car = 1, 2nd car = 2, etc.)
 */
export const getNextCarNumericId = async (sellerId: string): Promise<number> => {
  if (!sellerId) throw new Error("Seller ID is required for numeric ID generation");

  const counterRef = doc(db, 'counters', 'cars', 'sellers', sellerId);
  
  try {
    const newId = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      
      let currentCount = 0;
      if (counterDoc.exists()) {
        currentCount = counterDoc.data()?.count || 0;
      }
      
      const nextId = currentCount + 1;
      
      transaction.set(counterRef, { count: nextId, updatedAt: serverTimestamp() }, { merge: true });
      
      return nextId;
    });
    
    logger.info('Generated new car ID', { sellerId, numericId: newId });
    return newId;
  } catch (error) {
    logger.error('Failed to generate car numeric ID', error);
    throw new Error('Failed to generate car numeric ID');
  }
};

/**
 * Get current car count for a seller (for reference)
 */
export const getSellerCarCount = async (sellerId: string): Promise<number> => {
  const counterRef = doc(db, 'counters', 'cars', 'sellers', sellerId);
  const counterDoc = await getDoc(counterRef);
  return counterDoc.exists() ? (counterDoc.data()?.count || 0) : 0;
};

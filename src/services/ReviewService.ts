import { db, auth } from './firebase';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit as firestoreLimit,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { logger } from './logger-service';

/**
 * TASK-08: Reviews Service for Mobile
 * 
 * Manages car reviews and ratings in the mobile app.
 * Compatible with web review system.
 */

export interface Review {
    id?: string;
    sellerId: string;
    buyerId: string;
    carId?: string;
    rating: 1 | 2 | 3 | 4 | 5;
    title: string;
    comment: string;
    pros?: string[];
    cons?: string[];
    wouldRecommend: boolean;
    transactionType: 'purchase' | 'inquiry' | 'viewing';
    verifiedPurchase: boolean;
    status: 'pending' | 'approved' | 'rejected';
    helpful: number;
    notHelpful: number;
    reportCount: number;
    createdAt: Date | Timestamp;
    updatedAt: Date | Timestamp;
    moderatedAt?: Date | Timestamp;
    moderatedBy?: string;
    response?: {
        text: string;
        createdAt: Date | Timestamp;
        userId: string;
    };
    // Populated fields
    reviewerName?: string;
    reviewerPhoto?: string;
    verified?: boolean;
}

export interface ReviewStats {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: {
        5: number;
        4: number;
        3: number;
        2: number;
        1: number;
    };
    recommendationRate: number;
    verifiedPurchaseRate: number;
}

export interface SubmitReviewData {
    sellerId: string;
    carId?: string;
    rating: 1 | 2 | 3 | 4 | 5;
    title: string;
    comment: string;
    pros?: string[];
    cons?: string[];
    wouldRecommend: boolean;
    transactionType: 'purchase' | 'inquiry' | 'viewing';
    verifiedPurchase: boolean;
}

export class ReviewService {
    private static readonly COLLECTION = 'reviews';
    private static readonly MAX_REVIEW_LENGTH = 1000;
    private static readonly MIN_REVIEW_LENGTH = 20;

    /**
     * Submit a new review
     */
    static async submitReview(data: SubmitReviewData): Promise<{ success: boolean; message: string; reviewId?: string }> {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            return { success: false, message: 'Трябва да влезете, за да напишете отзив' };
        }

        try {
            // Validate review
            const validation = this.validateReview(data);
            if (!validation.valid) {
                return { success: false, message: validation.message! };
            }

            // Check if user already reviewed this seller
            const existing = await this.hasUserReviewedSeller(currentUser.uid, data.sellerId);
            if (existing) {
                return {
                    success: false,
                    message: 'Вече сте написали отзив за този продавач'
                };
            }

            // Create review
            const reviewData: Omit<Review, 'id'> = {
                ...data,
                buyerId: currentUser.uid,
                status: 'pending',
                helpful: 0,
                notHelpful: 0,
                reportCount: 0,
                createdAt: serverTimestamp() as Timestamp,
                updatedAt: serverTimestamp() as Timestamp
            };

            const docRef = await addDoc(collection(db, this.COLLECTION), reviewData);

            logger.info('Review submitted', { reviewId: docRef.id });

            return {
                success: true,
                message: 'Отзивът ви е изпратен и чака одобрение',
                reviewId: docRef.id
            };
        } catch (error) {
            logger.error('Error submitting review', error);
            return {
                success: false,
                message: 'Грешка при изпращане на отзива'
            };
        }
    }

    /**
     * Get reviews for a seller
     */
    static async getSellerReviews(sellerId: string, limitCount = 20): Promise<Review[]> {
        try {
            const q = query(
                collection(db, this.COLLECTION),
                where('sellerId', '==', sellerId),
                where('status', '==', 'approved'),
                orderBy('createdAt', 'desc'),
                firestoreLimit(limitCount)
            );

            const snapshot = await getDocs(q);
            const reviews: Review[] = [];

            for (const doc of snapshot.docs) {
                const data = doc.data();
                const review: Review = {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
                    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
                } as Review;

                // Fetch reviewer info
                const reviewerData = await this.getReviewerInfo(data.buyerId);
                review.reviewerName = reviewerData.name;
                review.reviewerPhoto = reviewerData.photo;

                reviews.push(review);
            }

            return reviews;
        } catch (error) {
            logger.error('Error fetching seller reviews', error);
            return [];
        }
    }

    /**
     * Get reviews for a car
     */
    static async getCarReviews(carId: string, limitCount = 20): Promise<Review[]> {
        try {
            const q = query(
                collection(db, this.COLLECTION),
                where('carId', '==', carId),
                where('status', '==', 'approved'),
                orderBy('createdAt', 'desc'),
                firestoreLimit(limitCount)
            );

            const snapshot = await getDocs(q);
            const reviews: Review[] = [];

            for (const doc of snapshot.docs) {
                const data = doc.data();
                const review: Review = {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
                    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
                } as Review;

                // Fetch reviewer info
                const reviewerData = await this.getReviewerInfo(data.buyerId);
                review.reviewerName = reviewerData.name;
                review.reviewerPhoto = reviewerData.photo;

                reviews.push(review);
            }

            return reviews;
        } catch (error) {
            logger.error('Error fetching car reviews', error);
            return [];
        }
    }

    /**
     * Get seller review statistics
     */
    static async getSellerStats(sellerId: string): Promise<ReviewStats> {
        try {
            const q = query(
                collection(db, this.COLLECTION),
                where('sellerId', '==', sellerId),
                where('status', '==', 'approved')
            );

            const snapshot = await getDocs(q);
            const reviews = snapshot.docs.map(doc => doc.data() as Review);

            if (reviews.length === 0) {
                return {
                    totalReviews: 0,
                    averageRating: 0,
                    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
                    recommendationRate: 0,
                    verifiedPurchaseRate: 0
                };
            }

            const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
            let totalRating = 0;
            let recommendCount = 0;
            let verifiedCount = 0;

            reviews.forEach(review => {
                distribution[review.rating]++;
                totalRating += review.rating;
                if (review.wouldRecommend) recommendCount++;
                if (review.verifiedPurchase) verifiedCount++;
            });

            return {
                totalReviews: reviews.length,
                averageRating: totalRating / reviews.length,
                ratingDistribution: distribution,
                recommendationRate: (recommendCount / reviews.length) * 100,
                verifiedPurchaseRate: (verifiedCount / reviews.length) * 100
            };
        } catch (error) {
            logger.error('Error fetching seller stats', error);
            return {
                totalReviews: 0,
                averageRating: 0,
                ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
                recommendationRate: 0,
                verifiedPurchaseRate: 0
            };
        }
    }

    /**
     * Mark review as helpful
     */
    static async markHelpful(reviewId: string, helpful: boolean): Promise<void> {
        try {
            const reviewRef = doc(db, this.COLLECTION, reviewId);
            const reviewDoc = await getDoc(reviewRef);

            if (!reviewDoc.exists()) {
                throw new Error('Review not found');
            }

            const data = reviewDoc.data();
            if (helpful) {
                await updateDoc(reviewRef, { helpful: (data.helpful || 0) + 1 });
            } else {
                await updateDoc(reviewRef, { notHelpful: (data.notHelpful || 0) + 1 });
            }

            logger.info('Review marked', { reviewId, helpful });
        } catch (error) {
            logger.error('Error marking review', error);
        }
    }

    /**
     * Report a review
     */
    static async reportReview(reviewId: string, reason: string): Promise<void> {
        try {
            const reviewRef = doc(db, this.COLLECTION, reviewId);
            const reviewDoc = await getDoc(reviewRef);

            if (!reviewDoc.exists()) {
                throw new Error('Review not found');
            }

            const data = reviewDoc.data();
            await updateDoc(reviewRef, {
                reportCount: (data.reportCount || 0) + 1
            });

            // Create report document
            await addDoc(collection(db, 'review_reports'), {
                reviewId,
                reason,
                reportedBy: auth.currentUser?.uid,
                createdAt: serverTimestamp()
            });

            logger.info('Review reported', { reviewId });
        } catch (error) {
            logger.error('Error reporting review', error);
        }
    }

    // ==================== PRIVATE METHODS ====================

    private static validateReview(data: SubmitReviewData): { valid: boolean; message?: string } {
        if (data.rating < 1 || data.rating > 5) {
            return { valid: false, message: 'Рейтингът трябва да е между 1 и 5' };
        }

        if (!data.comment || data.comment.trim().length < this.MIN_REVIEW_LENGTH) {
            return { valid: false, message: `Отзивът трябва да е поне ${this.MIN_REVIEW_LENGTH} символа` };
        }

        if (data.comment.length > this.MAX_REVIEW_LENGTH) {
            return { valid: false, message: `Отзивът не може да е повече от ${this.MAX_REVIEW_LENGTH} символа` };
        }

        return { valid: true };
    }

    private static async hasUserReviewedSeller(buyerId: string, sellerId: string): Promise<boolean> {
        try {
            const q = query(
                collection(db, this.COLLECTION),
                where('buyerId', '==', buyerId),
                where('sellerId', '==', sellerId),
                firestoreLimit(1)
            );

            const snapshot = await getDocs(q);
            return !snapshot.empty;
        } catch (error) {
            logger.error('Error checking existing review', error);
            return false;
        }
    }

    private static async getReviewerInfo(buyerId: string): Promise<{ name: string; photo?: string }> {
        try {
            const userDoc = await getDoc(doc(db, 'users', buyerId));
            if (userDoc.exists()) {
                const data = userDoc.data();
                return {
                    name: data.displayName || data.name || 'Анонимен',
                    photo: data.photoURL || data.profilePicture
                };
            }
            return { name: 'Анонимен' };
        } catch (error) {
            logger.error('Error fetching reviewer info', error);
            return { name: 'Анонимен' };
        }
    }
}

import { db, auth } from './firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { AIQuota, SubscriptionPlan, FeatureKey } from '../types/subscription.types';
import { logger } from './logger-service';

export class SubscriptionService {
    private static instance: SubscriptionService;

    // Default Plan (Free)
    private readonly defaultQuota: Omit<AIQuota, 'userId'> = {
        tier: 'free',
        dailyImageAnalysis: 5,
        dailyPriceSuggestions: 3,
        dailyChatMessages: 10,
        dailyProfileAnalysis: 2,
        usedImageAnalysis: 0,
        usedPriceSuggestions: 0,
        usedChatMessages: 0,
        usedProfileAnalysis: 0,
        lastResetDate: new Date().toISOString().split('T')[0],
        totalCost: 0
    };

    private constructor() { }

    static getInstance(): SubscriptionService {
        if (!SubscriptionService.instance) {
            SubscriptionService.instance = new SubscriptionService();
        }
        return SubscriptionService.instance;
    }

    /**
     * Get current user quota
     */
    async getUserQuota(): Promise<AIQuota> {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('User not authenticated');
        }

        const quotaRef = doc(db, 'ai_quotas', currentUser.uid);
        const snapshot = await getDoc(quotaRef);

        if (snapshot.exists()) {
            return snapshot.data() as AIQuota;
        }

        // Return default free quota if not found
        return {
            userId: currentUser.uid,
            ...this.defaultQuota
        };
    }

    /**
     * Subscribe to quota changes (Real-time)
     */
    subscribeToQuota(callback: (quota: AIQuota) => void): () => void {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            return () => { };
        }

        const quotaRef = doc(db, 'ai_quotas', currentUser.uid);

        return onSnapshot(quotaRef, (doc) => {
            if (doc.exists()) {
                callback(doc.data() as AIQuota);
            } else {
                callback({
                    userId: currentUser.uid,
                    ...this.defaultQuota
                });
            }
        });
    }

    /**
     * Check if feature is accessible
     * Returns true if allowed, false if limit reached
     */
    async canAccessFeature(feature: FeatureKey): Promise<boolean> {
        try {
            const quota = await this.getUserQuota();
            const today = new Date().toISOString().split('T')[0];

            // If new day, logically it should be allowed (backend will reset on write, but frontend can be optimistic)
            if (quota.lastResetDate !== today) {
                return true;
            }

            const dailyKey = `daily${feature}` as keyof AIQuota;
            const usedKey = `used${feature}` as keyof AIQuota;

            const limit = quota[dailyKey] as number;
            const used = quota[usedKey] as number;

            if (limit === -1) return true; // Unlimited

            return used < limit;
        } catch (error) {
            logger.error('Error checking access', error);
            // Default to conservative allow for free tier limits if error
            return false;
        }
    }

    /**
     * Get available plans (Hardcoded for MVP parity with Web)
     */
    getPlans(): SubscriptionPlan[] {
        return [
            {
                id: 'free',
                name: 'Starter',
                price: 0,
                currency: 'BGN',
                features: ['5 Image Analyses/day', '10 Chat Messages/day', 'Basic Support'],
                limits: { imageAnalysis: 5, priceSuggestions: 3, chatMessages: 10 }
            },
            {
                id: 'pro',
                name: 'Professional',
                price: 29.99,
                currency: 'BGN',
                features: ['Unlimited Image Analysis', 'Advanced AI Chat', 'Priority Support', 'Verified Dealer Badge'],
                limits: { imageAnalysis: -1, priceSuggestions: 50, chatMessages: 100 }
            },
            {
                id: 'dealer',
                name: 'Dealer Enterprise',
                price: 99.99,
                currency: 'BGN',
                features: ['All Pro Features', 'API Access', 'Dedicated Account Manager', 'Bulk Uploads'],
                limits: { imageAnalysis: -1, priceSuggestions: -1, chatMessages: -1 }
            }
        ];
    }
}

export const subscriptionService = SubscriptionService.getInstance();

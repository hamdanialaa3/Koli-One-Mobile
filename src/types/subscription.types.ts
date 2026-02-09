export interface AIQuota {
    userId: string;
    tier: 'free' | 'pro' | 'dealer' | 'enterprise';

    // Daily Limits
    dailyImageAnalysis: number;     // e.g., 5
    dailyPriceSuggestions: number;   // e.g., 3
    dailyChatMessages: number;       // e.g., 10
    dailyProfileAnalysis: number;    // e.g., 2

    // Usage Tracking
    usedImageAnalysis: number;
    usedPriceSuggestions: number;
    usedChatMessages: number;
    usedProfileAnalysis: number;

    lastResetDate: string;          // ISO Date YYYY-MM-DD
    totalCost: number;

    // Subscription Details
    subscriptionId?: string;
    subscriptionStatus?: 'active' | 'canceled' | 'past_due';
    periodEnd?: Date;
}

export type FeatureKey = 'ImageAnalysis' | 'PriceSuggestions' | 'ChatMessages' | 'ProfileAnalysis';

export interface SubscriptionPlan {
    id: 'free' | 'pro' | 'dealer';
    name: string;
    price: number;
    currency: string;
    features: string[];
    limits: {
        imageAnalysis: number; // -1 for unlimited
        priceSuggestions: number;
        chatMessages: number;
    };
}

// AI Quota & Billing System Types
// نظام الحصص والفوترة للذكاء الاصطناعي

export type AITier = 'free' | 'basic' | 'premium' | 'enterprise';

export interface AIQuota {
    userId: string;
    tier: AITier;

    // Daily limits
    dailyImageAnalysis: number;
    dailyPriceSuggestions: number;
    dailyChatMessages: number;
    dailyProfileAnalysis: number;

    // Usage tracking
    usedImageAnalysis: number;
    usedPriceSuggestions: number;
    usedChatMessages: number;
    usedProfileAnalysis: number;

    // Reset tracking
    lastResetDate: string; // ISO date

    // Billing
    totalCost: number; // in EUR
    lastBillingDate: string;
}

export interface AIUsageLog {
    id: string;
    userId: string;
    feature: 'image_analysis' | 'price_suggestion' | 'chat' | 'profile_analysis';
    timestamp: number;
    cost: number; // in EUR
    tier: AITier;
    success: boolean;
    metadata?: any;
}

export interface AITierConfig {
    tier: AITier;
    name: {
        bg: string;
        en: string;
        ar: string;
    };
    price: {
        monthly: number; // EUR
        perUse: number; // EUR per request
    };
    limits: {
        dailyImageAnalysis: number;
        dailyPriceSuggestions: number;
        dailyChatMessages: number;
        dailyProfileAnalysis: number;
    };
    features: string[];
    model: 'gemini-pro' | 'gemini-pro-advanced';
}

export interface AIPaymentIntent {
    userId: string;
    amount: number; // EUR
    tier: AITier;
    period: 'monthly' | 'pay-as-you-go';
    status: 'pending' | 'completed' | 'failed';
    createdAt: number;
}

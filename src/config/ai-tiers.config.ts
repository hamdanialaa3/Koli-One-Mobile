// AI Tier Configuration
// تكوين مستويات الذكاء الاصطناعي

import { AITierConfig } from '../types/ai-quota.types';

export const AI_TIER_CONFIGS: Record<string, AITierConfig> = {
    free: {
        tier: 'free',
        name: {
            bg: 'Безплатен',
            en: 'Free',
            ar: 'مجاني'
        },
        price: {
            monthly: 0,
            perUse: 0
        },
        limits: {
            dailyImageAnalysis: 5,        // 5 تحليلات صور يومياً
            dailyPriceSuggestions: 3,     // 3 اقتراحات أسعار يومياً
            dailyChatMessages: 20,        // 20 رسالة محادثة يومياً
            dailyProfileAnalysis: 1       // تحليل ملف واحد يومياً
        },
        features: [
            'Basic car image recognition',
            'Simple price suggestions',
            'Limited chat support',
            'Basic profile analysis'
        ],
        model: 'gemini-pro'
    },

    basic: {
        tier: 'basic',
        name: {
            bg: 'Основен',
            en: 'Basic',
            ar: 'أساسي'
        },
        price: {
            monthly: 9.99,
            perUse: 0.02  // 2 سنت لكل طلب
        },
        limits: {
            dailyImageAnalysis: 50,
            dailyPriceSuggestions: 30,
            dailyChatMessages: 200,
            dailyProfileAnalysis: 10
        },
        features: [
            'Advanced car recognition',
            'Market-based pricing',
            'Priority chat support',
            'Detailed profile insights',
            'Usage analytics'
        ],
        model: 'gemini-pro'
    },

    premium: {
        tier: 'premium',
        name: {
            bg: 'Премиум',
            en: 'Premium',
            ar: 'مميز'
        },
        price: {
            monthly: 29.99,
            perUse: 0.015  // 1.5 سنت لكل طلب
        },
        limits: {
            dailyImageAnalysis: 200,
            dailyPriceSuggestions: 100,
            dailyChatMessages: 1000,
            dailyProfileAnalysis: 50
        },
        features: [
            'AI-powered bulk analysis',
            'Real-time market trends',
            '24/7 AI assistant',
            'Advanced profile optimization',
            'Competitor analysis',
            'Custom AI training'
        ],
        model: 'gemini-pro-advanced'
    },

    enterprise: {
        tier: 'enterprise',
        name: {
            bg: 'Корпоративен',
            en: 'Enterprise',
            ar: 'للشركات'
        },
        price: {
            monthly: 99.99,
            perUse: 0.01  // 1 سنت لكل طلب
        },
        limits: {
            dailyImageAnalysis: -1,  // Unlimited
            dailyPriceSuggestions: -1,
            dailyChatMessages: -1,
            dailyProfileAnalysis: -1
        },
        features: [
            'Unlimited AI requests',
            'Dedicated AI model',
            'API access',
            'White-label solutions',
            'Priority support',
            'Custom integrations',
            'Advanced analytics dashboard'
        ],
        model: 'gemini-pro-advanced'
    },
};

// Cost calculation for pay-as-you-go
export const calculateAICost = (tier: string, requestCount: number): number => {
    const config = AI_TIER_CONFIGS[tier];
    if (!config || tier === 'free') return 0;

    return requestCount * config.price.perUse;
};

// Check if user has exceeded quota
export const hasExceededQuota = (
    used: number,
    limit: number
): boolean => {
    if (limit === -1) return false; // Unlimited
    return used >= limit;
};

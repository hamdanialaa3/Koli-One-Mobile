/**
 * AI Quota & Billing System — Shared Types
 */

export type AITier = 'free' | 'basic' | 'pro' | 'premium' | 'dealer' | 'enterprise';

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
  lastResetDate: string; // ISO date YYYY-MM-DD

  // Billing
  totalCost: number; // in EUR
  lastBillingDate?: string;

  // Subscription (optional)
  subscriptionId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due';
  periodEnd?: Date;
}

export type FeatureKey = 'ImageAnalysis' | 'PriceSuggestions' | 'ChatMessages' | 'ProfileAnalysis';

export interface AIUsageLog {
  id: string;
  userId: string;
  feature: 'image_analysis' | 'price_suggestion' | 'chat' | 'profile_analysis';
  timestamp: number;
  cost: number;
  tier: AITier;
  success: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any;
}

export interface AITierConfig {
  tier: AITier;
  name: { bg: string; en: string; ar: string };
  price: {
    monthly: number;
    perUse: number;
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

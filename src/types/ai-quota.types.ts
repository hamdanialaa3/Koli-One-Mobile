/**
 * AI Quota types — Re-exported from @koli-one/shared.
 * @version 3.0.0 — Unified with shared/
 */
export type {
  AITier,
  AIQuota,
  FeatureKey,
  AIUsageLog,
  AITierConfig,
} from '@koli-one/shared';

// Mobile-specific: Subscription plan display
export interface SubscriptionPlan {
  id: 'free' | 'pro' | 'dealer';
  name: string;
  price: number;
  currency: string;
  features: string[];
  limits: {
    imageAnalysis: number;
    priceSuggestions: number;
    chatMessages: number;
  };
}

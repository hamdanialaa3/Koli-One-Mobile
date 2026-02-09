/**
 * Subscription types — Re-exported from @koli-one/shared.
 * @version 2.0.0 — Unified with shared/
 *
 * AIQuota, FeatureKey come from shared.
 * SubscriptionPlan stays local (mobile billing UI only).
 */

export type { AIQuota, FeatureKey } from '@koli-one/shared';

/** Mobile-specific subscription plan for billing UI */
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

/**
 * Firestore base models — Re-exported from @koli-one/shared.
 * @version 3.0.0 — Unified with shared/
 */
export type {
  AccountType,
  SubscriptionTier,
  BaseDocument,
  UserBase,
} from '@koli-one/shared';

// Re-export local types that are mobile-specific
export type { BulgarianUser } from './user/bulgarian-user.types';
export type { DealershipInfo } from './dealership/dealership.types';

// Backward compat: Car extends BaseDocument (simplified for mobile)
import type { BaseDocument } from '@koli-one/shared';
export interface Car extends BaseDocument {
  make: string;
  model: string;
  year: number;
  price: number;
  currency: 'EUR';
}

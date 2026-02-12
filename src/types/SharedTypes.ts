/**
 * SharedTypes — Re-exported from @koli-one/shared + local types.
 * @version 3.0.0 — Unified with shared/
 * 
 * This barrel file provides backward compatibility for existing imports.
 */

// Re-export shared types
export type {
  AccountType,
  SubscriptionTier,
  UserBase as User,
} from '../shared';

export type {
  VehicleStatus,
  VehicleCollectionName,
  CarListing,
} from '../shared';

export { getCollectionName } from '../shared';

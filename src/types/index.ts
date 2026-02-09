/**
 * Mobile types barrel — canonical re-exports.
 * @version 2.0.0 — Unified with @koli-one/shared
 */

// Core car & listing types (re-exports shared + mobile extensions)
export * from './CarListing';

// Firestore base models (re-exports shared + mobile extensions)
export * from './firestore-models';

// Bulgarian user types (mobile-only)
export * from './user/bulgarian-user.types';

// Dealership types (mobile-only)
export * from './dealership/dealership.types';

// Shared types barrel (AccountType, User, getCollectionName)
export * from './SharedTypes';

// Story types (re-exports shared + backward-compat alias)
export { CarStory } from './story.types';
export type { Story, StoryType, StoryAuthorInfo } from './story.types';

// AI & subscription types (re-exports shared + mobile SubscriptionPlan)
export * from './subscription.types';

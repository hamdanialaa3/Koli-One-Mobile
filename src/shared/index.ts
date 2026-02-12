/**
 * @koli-one/shared — Canonical shared types
 *
 * This package is the SINGLE SOURCE OF TRUTH for types and constants
 * shared between web/ and mobile_new/.
 *
 * Rules:
 * 1. Any change here MUST be reflected in both platforms
 * 2. Web-specific extensions go in web/src/types/
 * 3. Mobile-specific extensions go in mobile_new/src/types/
 * 4. This package contains ONLY platform-agnostic types
 */

// Types
export * from './types/car-listing.types';
export * from './types/car-summary.types';
export * from './types/story.types';
export * from './types/ai-quota.types';
export * from './types/firestore-models.types';
export * from './types/numeric-id.types';

// Constants
export * from './constants/social-links';
export * from './constants/vehicle-collections';

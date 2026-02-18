/**
 * featureFlags.ts — Runtime Feature Flag System
 *
 * Reads flags from Firestore `config/feature_flags` document.
 * Falls back to defaults if offline or document doesn't exist.
 *
 * Usage:
 *   const flags = await FeatureFlags.load();
 *   if (flags.phoneAuth) { ... }
 */

import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { logger } from './logger-service';

export interface FeatureFlagSet {
  /** Enable phone number authentication */
  phoneAuth: boolean;
  /** Enable story creation (create.tsx) */
  storyCreation: boolean;
  /** Enable AI valuation screen */
  aiValuation: boolean;
  /** Enable dealer registration form */
  dealerRegistration: boolean;
  /** Enable social post creation */
  socialPosts: boolean;
  /** Enable real-time typing indicators in chat */
  typingIndicators: boolean;
  /** Enable offer accept/reject in messaging */
  offerFlow: boolean;
  /** Enable VIN history check */
  vinCheck: boolean;
  /** Enable Algolia search (vs Firestore-only fallback) */
  algoliaSearch: boolean;
}

const DEFAULTS: FeatureFlagSet = {
  phoneAuth: true,
  storyCreation: true,
  aiValuation: true,
  dealerRegistration: true,
  socialPosts: true,
  typingIndicators: true,
  offerFlow: true,
  vinCheck: true,
  algoliaSearch: true,
};

let _cached: FeatureFlagSet | null = null;
let _loadedAt = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export class FeatureFlags {
  /**
   * Load flags from Firestore, with local caching.
   * Returns defaults if Firestore is unreachable.
   */
  static async load(): Promise<FeatureFlagSet> {
    if (_cached && Date.now() - _loadedAt < CACHE_TTL) {
      return _cached;
    }

    try {
      const snap = await getDoc(doc(db, 'config', 'feature_flags'));
      if (snap.exists()) {
        _cached = { ...DEFAULTS, ...(snap.data() as Partial<FeatureFlagSet>) };
      } else {
        _cached = { ...DEFAULTS };
      }
      _loadedAt = Date.now();
    } catch (err) {
      logger.error('FeatureFlags load failed, using defaults', err);
      _cached = { ...DEFAULTS };
    }

    return _cached;
  }

  /** Force-refresh flags on next call to load() */
  static invalidate(): void {
    _cached = null;
    _loadedAt = 0;
  }

  /** Synchronous access to last loaded flags (or defaults) */
  static current(): FeatureFlagSet {
    return _cached ?? { ...DEFAULTS };
  }

  /** Check a single flag synchronously */
  static isEnabled(flag: keyof FeatureFlagSet): boolean {
    return (FeatureFlags.current())[flag];
  }
}

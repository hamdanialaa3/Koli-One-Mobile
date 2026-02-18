/**
 * useMobileSectionVisibility.ts
 * 
 * Reads homepage section visibility from the SAME Firestore document
 * used by the web app (`app_settings/homepage_sections`).
 * 
 * This means:
 * - Changes made in the web admin panel apply to mobile instantly
 * - The mobile admin screen writes to the same document
 * - Fail-open: if no config exists, all sections are visible
 * 
 * Uses AsyncStorage as a local cache so the first paint is instant.
 */

import { useEffect, useState, useCallback } from 'react';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types (mirrored from web) ──────────────────────

export interface HomepageSection {
  key: string;
  label: string;
  description: string;
  visible: boolean;
  order: number;
  category: 'main' | 'floating' | 'conditional';
}

export interface HomepageSectionsConfig {
  sections: HomepageSection[];
  updatedAt: string;
  updatedBy: string;
}

// ─── Firestore path (same as web) ──────────────────

const SECTION_VISIBILITY_PATH = {
  collection: 'app_settings',
  docId: 'homepage_sections',
} as const;

const CACHE_KEY = '@koli_section_visibility';

// ─── Default sections (mirrors web defaults) ───────

export const DEFAULT_MOBILE_SECTIONS: HomepageSection[] = [
  { key: 'hero', label: 'Hero Section', description: 'Main hero banner with search', visible: true, order: 1, category: 'main' },
  { key: 'smart_recommendations', label: 'Smart Recommendations', description: 'AI-powered car recommendations', visible: true, order: 2, category: 'main' },
  { key: 'ai_analysis_banner', label: 'AI Analysis Banner', description: 'Promotional banner for AI analysis', visible: true, order: 3, category: 'main' },
  { key: 'hero_strips', label: 'Hero Strips', description: 'Recently Viewed + Top Deals carousels', visible: true, order: 4, category: 'main' },
  { key: 'visual_search', label: 'Visual Search Teaser', description: 'Image-based search teaser', visible: true, order: 5, category: 'main' },
  { key: 'vehicle_classifications', label: 'Vehicle Classifications', description: 'Browse by vehicle type/class', visible: true, order: 6, category: 'main' },
  { key: 'life_moments', label: 'Life Moments Browse', description: 'Browse cars by life context', visible: true, order: 7, category: 'main' },
  { key: 'categories', label: 'Categories Section', description: 'Vehicle body type categories with cars', visible: true, order: 8, category: 'main' },
  { key: 'popular_brands', label: 'Popular Brands', description: 'Brand logos grid', visible: true, order: 9, category: 'main' },
  { key: 'most_demanded', label: 'Most Demanded', description: 'Trending/popular categories', visible: true, order: 10, category: 'main' },
  { key: 'featured_showcase', label: 'Featured Showcase', description: 'Premium/VIP car listings', visible: true, order: 11, category: 'main' },
  { key: 'smart_sell', label: 'Smart Sell CTA', description: 'Sell-your-car CTA section', visible: true, order: 12, category: 'main' },
  { key: 'dealers', label: 'Dealers Spotlight', description: 'Featured dealers section', visible: true, order: 13, category: 'main' },
  { key: 'trust_stats', label: 'Trust & Stats', description: 'Trust indicators and statistics', visible: true, order: 14, category: 'main' },
  { key: 'social', label: 'Social Experience', description: 'Social media integration', visible: true, order: 15, category: 'main' },
  { key: 'loyalty', label: 'Loyalty & Signup', description: 'Loyalty program + signup CTA', visible: true, order: 16, category: 'main' },
  { key: 'recent_browsing', label: 'Recent Browsing', description: 'Recently viewed cars (browsing history)', visible: true, order: 17, category: 'conditional' },
];

// ─── Hook ─────────────────────────────────────────

export function useMobileSectionVisibility() {
  const [sections, setSections] = useState<HomepageSection[]>(DEFAULT_MOBILE_SECTIONS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from cache first, then subscribe to Firestore
  useEffect(() => {
    let isActive = true;

    // 1. Try local cache for instant first paint
    AsyncStorage.getItem(CACHE_KEY).then((cached) => {
      if (!isActive || !cached) return;
      try {
        const parsed = JSON.parse(cached) as HomepageSection[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSections(parsed);
        }
      } catch {
        // corrupt cache — ignore
      }
    });

    // 2. Subscribe to Firestore for real-time updates
    const ref = doc(db, SECTION_VISIBILITY_PATH.collection, SECTION_VISIBILITY_PATH.docId);

    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!isActive) return;

        if (!snap.exists()) {
          // No config yet — use defaults (fail-open)
          setSections(DEFAULT_MOBILE_SECTIONS);
          setIsLoaded(true);
          return;
        }

        const data = snap.data() as HomepageSectionsConfig;
        if (!data.sections || !Array.isArray(data.sections)) {
          setSections(DEFAULT_MOBILE_SECTIONS);
          setIsLoaded(true);
          return;
        }

        // Merge with mobile defaults: for each mobile section,
        // pick up visibility & order from Firestore if the key exists there
        const firestoreMap = new Map(data.sections.map((s) => [s.key, s]));
        const merged = DEFAULT_MOBILE_SECTIONS.map((defaultSec) => {
          const remote = firestoreMap.get(defaultSec.key);
          if (remote) {
            return {
              ...defaultSec,
              visible: remote.visible,
              order: remote.order,
            };
          }
          return defaultSec; // new mobile-only section — show by default
        }).sort((a, b) => a.order - b.order);

        setSections(merged);
        setIsLoaded(true);

        // Cache for next launch
        AsyncStorage.setItem(CACHE_KEY, JSON.stringify(merged)).catch(() => {});
      },
      () => {
        if (!isActive) return;
        // On error — fail open
        setSections(DEFAULT_MOBILE_SECTIONS);
        setIsLoaded(true);
      },
    );

    return () => {
      isActive = false;
      unsub();
    };
  }, []);

  /**
   * Check if a section should be visible.
   * Fail-open: unknown keys default to visible.
   */
  const isVisible = useCallback(
    (key: string): boolean => {
      const section = sections.find((s) => s.key === key);
      return section ? section.visible : true;
    },
    [sections],
  );

  return { sections, isLoaded, isVisible };
}

// ─── Admin Utility: Update section visibility ─────

export async function updateMobileSectionVisibility(
  sections: HomepageSection[],
  adminEmail: string,
): Promise<void> {
  const ref = doc(db, SECTION_VISIBILITY_PATH.collection, SECTION_VISIBILITY_PATH.docId);

  // Read existing Firestore doc to preserve web-only sections
  const snap = await getDoc(ref);
  let allSections = sections;

  if (snap.exists()) {
    const data = snap.data() as HomepageSectionsConfig;
    const mobileKeys = new Set(sections.map((s) => s.key));
    // Keep any web-only sections that aren't in our mobile list
    const webOnly = (data.sections || []).filter((s) => !mobileKeys.has(s.key));
    allSections = [...sections, ...webOnly];
  }

  const config: HomepageSectionsConfig = {
    sections: allSections,
    updatedAt: new Date().toISOString(),
    updatedBy: adminEmail,
  };

  await setDoc(ref, config, { merge: false });

  // Update local cache
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(sections));
}

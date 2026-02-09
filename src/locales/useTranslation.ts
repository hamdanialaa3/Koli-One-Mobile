/**
 * useTranslation Hook - Bulgarian/English i18n with AsyncStorage
 * 
 * Usage:
 * ```
 * const { t, language, setLanguage } = useTranslation();
 * 
 * // Simple translation
 * <Text>{t('common.loading')}</Text>  // "Loading..." or "Зареждане..."
 * 
 * // Nested translation
 * <Text>{t('home.hero.title')}</Text>
 * 
 * // Change language
 * setLanguage('en');  // or 'bg'
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import translations, { Language } from './index';
import { logger } from '../services/logger-service';

const STORAGE_KEY = 'app_language';
const DEFAULT_LANGUAGE: Language = 'bg';

export function useTranslation() {
  const [language, setLang] = useState<Language>(DEFAULT_LANGUAGE);
  const [isLoading, setIsLoading] = useState(true);

  // Load language from AsyncStorage on mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored && (stored === 'bg' || stored === 'en')) {
          setLang(stored as Language);
        }
      } catch (error) {
        logger.error('Failed to load language preference', error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguage();
  }, []);

  // Save language to AsyncStorage when it changes
  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem(STORAGE_KEY, language).catch((error) => {
        logger.error('Failed to save language preference', error as Error);
      });
    }
  }, [language, isLoading]);

  /**
   * Translate a key (supports nested keys like "home.hero.title")
   */
  const t = useCallback((key: string, fallback?: string): string => {
    const parts = key.split('.');
    let current: any = translations[language];

    for (const p of parts) {
      if (current && typeof current === 'object' && p in current) {
        current = current[p];
      } else {
        logger.warn(`Translation missing: ${key} (lang: ${language})`);
        return fallback || key; // Return the key itself as fallback
      }
    }

    // If result is array, join with newlines
    if (Array.isArray(current)) {
      return current.join('\n');
    }

    return typeof current === 'string' ? current : (fallback || key);
  }, [language]);

  /**
   * Change language (bg or en)
   */
  const setLanguage = useCallback((newLang: Language) => {
    setLang(newLang);
    logger.info(`Language changed to: ${newLang}`);
  }, []);

  /**
   * Toggle between BG and EN
   */
  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'bg' ? 'en' : 'bg');
  }, [language, setLanguage]);

  return { 
    t, 
    language, 
    setLanguage, 
    toggleLanguage,
    isLoading 
  };
}

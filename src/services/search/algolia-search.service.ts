/**
 * Algolia Search Service - Ultra-Fast Search Integration (Mobile)
 * خدمة Algolia للبحث السريع - نسخة الموبايل
 * 
 * Benefits:
 * - Sub-50ms search response time
 * - Typo tolerance (BMW → BWM still works)
 * - Faceted search (filters)
 * - Geo-search support
 */

import { liteClient as algoliasearch } from 'algoliasearch/lite';
import Constants from 'expo-constants';
import { logger } from '../logger-service';

interface AlgoliaSearchParams {
  query: string;
  filters?: string;
  facetFilters?: string[][];
  numericFilters?: string[];
  hitsPerPage?: number;
  page?: number;
}

interface AlgoliaSearchResult {
  cars: any[];
  totalHits: number;
  processingTime: number;
  facets?: Record<string, Record<string, number>>;
}

class AlgoliaSearchService {
  private static instance: AlgoliaSearchService;
  private client: any;
  private indexName: string = 'cars';
  private isInitialized = false;

  private constructor() {
    // Get Algolia config from expo-constants
    const extra = Constants.expoConfig?.extra;
    const appId = extra?.algoliaAppId;
    const searchApiKey = extra?.algoliaSearchApiKey;
    this.indexName = extra?.algoliaIndexName || 'cars';

    if (appId && searchApiKey && appId !== 'REPLACE_WITH_ALGOLIA_APP_ID') {
      try {
        this.client = algoliasearch(appId, searchApiKey);
        this.isInitialized = true;
        logger.info('✅ Algolia initialized', { indexName: this.indexName });
      } catch (error) {
        logger.error('❌ Algolia initialization failed', error as Error);
      }
    } else {
      logger.warn('⚠️ Algolia not configured (missing app.config.js vars)');
    }
  }

  static getInstance(): AlgoliaSearchService {
    if (!this.instance) {
      this.instance = new AlgoliaSearchService();
    }
    return this.instance;
  }

  /**
   * Check if Algolia is available
   */
  isAvailable(): boolean {
    return this.isInitialized;
  }

  /**
   * 🔍 SEARCH - Main search method
   */
  async search(params: AlgoliaSearchParams): Promise<AlgoliaSearchResult> {
    if (!this.isInitialized) {
      throw new Error('Algolia not initialized');
    }

    try {
      logger.debug('🔍 Algolia search', { query: params.query });

      const searchParams: any = {
        query: params.query,
        hitsPerPage: params.hitsPerPage || 50,
        page: params.page || 0,
        attributesToRetrieve: ['*'],
        attributesToHighlight: ['make', 'model'],
        typoTolerance: true,
        removeWordsIfNoResults: 'allOptional'
      };

      // Add filters
      if (params.filters) {
        searchParams.filters = params.filters;
      }

      if (params.facetFilters) {
        searchParams.facetFilters = params.facetFilters;
      }

      if (params.numericFilters) {
        searchParams.numericFilters = params.numericFilters;
      }

      const result = await this.client.searchSingleIndex({
        indexName: this.indexName,
        searchParams: { ...searchParams, query: params.query }
      });

      const cars = (result.hits || []).map((hit: any) => ({
        id: hit.objectID,
        ...hit,
        _highlightResult: undefined // Remove Algolia metadata
      }));

      logger.info('✅ Algolia search completed', {
        query: params.query,
        hits: result.nbHits,
        time: result.processingTimeMS
      });

      return {
        cars,
        totalHits: result.nbHits || 0,
        processingTime: result.processingTimeMS || 0,
        facets: result.facets
      };

    } catch (error) {
      logger.error('❌ Algolia search failed', error as Error);
      throw error;
    }
  }

  /**
   * 🎯 AUTOCOMPLETE - Get instant suggestions
   */
  async autocomplete(
    query: string,
    maxResults: number = 10
  ): Promise<{ makes: string[]; models: string[] }> {
    if (!this.isInitialized) {
      return { makes: [], models: [] };
    }

    try {
      const result = await this.client.searchSingleIndex({
        indexName: this.indexName,
        searchParams: {
          query,
          hitsPerPage: maxResults,
          attributesToRetrieve: ['make', 'model'],
          distinct: true
        }
      });

      const makes = new Set<string>();
      const models = new Set<string>();

      result.hits.forEach((hit: any) => {
        if (hit.make) makes.add(hit.make);
        if (hit.model) models.add(hit.model);
      });

      return {
        makes: Array.from(makes),
        models: Array.from(models)
      };

    } catch (error) {
      logger.error('Algolia autocomplete failed', error as Error);
      return { makes: [], models: [] };
    }
  }

  /**
   * 📊 FACETED SEARCH - Get facets for filters
   */
  async getFacets(
    query: string = '',
    facetNames: string[] = ['make', 'fuelType', 'transmission', 'city']
  ): Promise<Record<string, Record<string, number>>> {
    if (!this.isInitialized) {
      return {};
    }

    try {
      const result = await this.client.searchSingleIndex({
        indexName: this.indexName,
        searchParams: {
          query,
          facets: facetNames,
          hitsPerPage: 0 // We only want facets
        }
      });

      return result.facets || {};

    } catch (error) {
      logger.error('Get facets failed', error as Error);
      return {};
    }
  }

  /**
   * 🌍 GEO SEARCH - Search near location
   */
  async searchNear(
    latitude: number,
    longitude: number,
    radiusMeters: number = 50000, // 50km default
    query: string = ''
  ): Promise<AlgoliaSearchResult> {
    if (!this.isInitialized) {
      throw new Error('Algolia not initialized');
    }

    try {
      const result = await this.client.searchSingleIndex({
        indexName: this.indexName,
        searchParams: {
          query,
          aroundLatLng: `${latitude},${longitude}`,
          aroundRadius: radiusMeters,
          hitsPerPage: 50
        }
      });

      return {
        cars: result.hits,
        totalHits: result.nbHits,
        processingTime: result.processingTimeMS
      };

    } catch (error) {
      logger.error('Geo search failed', error as Error);
      throw error;
    }
  }

  /**
   * 🔢 SEARCH BY NUMERIC ID
   */
  async searchById(carNumericId: number, sellerNumericId: number): Promise<any | null> {
    if (!this.isInitialized) {
      return null;
    }

    try {
      const filters = `carNumericId:${carNumericId} AND sellerNumericId:${sellerNumericId}`;
      const result = await this.client.searchSingleIndex({
        indexName: this.indexName,
        searchParams: { query: '', filters, hitsPerPage: 1 }
      });

      if (result.hits.length > 0) {
        return result.hits[0];
      }

      return null;

    } catch (error) {
      logger.error('Search by ID failed', error as Error);
      return null;
    }
  }

  /**
   * 📈 TRENDING SEARCHES - Get popular searches
   */
  async getTrendingSearches(limit: number = 10): Promise<string[]> {
    // Mock data for now (would use Algolia Insights API in production)
    return [
      'BMW X5',
      'Audi A4',
      'Mercedes C220',
      'Golf 7',
      'Toyota Corolla',
      'VW Passat',
      'Honda Civic',
      'Ford Focus'
    ].slice(0, limit);
  }
}

export const algoliaSearchService = AlgoliaSearchService.getInstance();
export default algoliaSearchService;

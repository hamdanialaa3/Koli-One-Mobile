import { useState, useCallback } from 'react';
import { FilterState, DEFAULT_FILTER_STATE } from '../services/search/UnifiedFilterTypes';
import { ListingService } from '../services/ListingService';
import { UnifiedFilterEngine } from '../services/search/UnifiedFilterEngine';
import { algoliaSearchService } from '../services/search/algolia-search.service';
import { logger } from '../services/logger-service';

export const useMobileSearch = (initialFilters: FilterState = {}) => {
    const [filters, setFilters] = useState<FilterState>({
        ...DEFAULT_FILTER_STATE,
        ...initialFilters
    });

    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    const updateFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
        setFilters(prev => {
            const next = { ...prev, [key]: value };

            // Logic Parity with Web: Reset dependent fields
            if (key === 'make') {
                next.model = undefined;
                next.generation = undefined;
            }
            if (key === 'model') {
                next.generation = undefined;
            }

            return next;
        });
    }, []);

    const resetFilters = useCallback(() => {
        setFilters(DEFAULT_FILTER_STATE);
    }, []);

    const search = useCallback(async () => {
        setLoading(true);
        try {
            // Try Algolia first if available (fast search)
            if (algoliaSearchService.isAvailable()) {
                logger.info('🔍 Using Algolia search');

                // Build Algolia filters from FilterState
                const algoliaFilters: string[] = [];
                if (filters.make) algoliaFilters.push(`make:"${filters.make}"`);
                if (filters.model) algoliaFilters.push(`model:"${filters.model}"`);
                if (filters.fuelType) algoliaFilters.push(`fuelType:"${filters.fuelType}"`);
                if (filters.transmission) algoliaFilters.push(`transmission:"${filters.transmission}"`);
                if (filters.color) algoliaFilters.push(`color:"${filters.color}"`);
                if (filters.location) algoliaFilters.push(`city:"${filters.location}"`);

                const numericFilters: string[] = [];
                if (filters.priceMin !== undefined) numericFilters.push(`price >= ${filters.priceMin}`);
                if (filters.priceMax !== undefined) numericFilters.push(`price <= ${filters.priceMax}`);
                if (filters.yearMin !== undefined) numericFilters.push(`year >= ${filters.yearMin}`);
                if (filters.yearMax !== undefined) numericFilters.push(`year <= ${filters.yearMax}`);
                if (filters.mileageMax !== undefined) numericFilters.push(`mileage <= ${filters.mileageMax}`);

                const result = await algoliaSearchService.search({
                    query: filters.model || '',
                    filters: algoliaFilters.join(' AND '),
                    numericFilters,
                    hitsPerPage: 50
                });

                setResults(result.cars);
                setTotalCount(result.totalHits);
            } else {
                // Fallback to Firestore (slower but works offline)
                logger.info('📂 Using Firestore search (Algolia not available)');
                const data = await ListingService.search(filters);
                setResults(data);
                setTotalCount(data.length);
            }
        } catch (error) {
            logger.error('Search failed', error as Error);

            // Fallback to Firestore on Algolia error
            try {
                const data = await ListingService.search(filters);
                setResults(data);
                setTotalCount(data.length);
            } catch (fallbackError) {
                logger.error('Firestore fallback also failed', fallbackError as Error);
                setResults([]);
            }
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Convenient mapping for UI that might use "query" string
    const setSearchQuery = useCallback((text: string) => {
        // Simple heuristic for single search bar:
        // If it matches a Make, set Make. Else set Model? 
        // For MVP parity without Algolia, we'll map text to 'model' as a partial search 
        // OR just keep a 'keywords' field if added.
        // For strict parity with the Engine we built:
        if (!text) {
            updateFilter('model', undefined);
            return;
        }
        updateFilter('model', text); // Mapping free text to model for now
    }, [updateFilter]);

    return {
        filters,
        results,
        loading,
        totalCount,
        updateFilter,
        resetFilters,
        search,
        setSearchQuery
    };
};

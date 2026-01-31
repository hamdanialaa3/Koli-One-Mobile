import { useState, useCallback } from 'react';
import { FilterState, DEFAULT_FILTER_STATE } from '../services/search/UnifiedFilterTypes';
import { ListingService } from '../services/ListingService';
import { UnifiedFilterEngine } from '../services/search/UnifiedFilterEngine';

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
            const data = await ListingService.search(filters);
            setResults(data);
            setTotalCount(data.length); // In a real paginated API this would be from metadata
        } catch (error) {
            console.error("Search failed:", error);
            setResults([]);
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

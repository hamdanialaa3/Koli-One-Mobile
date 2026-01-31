import {
    query,
    where,
    orderBy,
    limit,
    startAfter,
    QueryConstraint,
    DocumentSnapshot
} from 'firebase/firestore';
import { FilterState, DEFAULT_FILTER_STATE } from './UnifiedFilterTypes';

/**
 * Unified Filter Engine
 * The "Brain" that translates FilterState into Firestore Queries.
 * Ensures parity with Web Search logic.
 */
export class UnifiedFilterEngine {

    /**
     * Normalize filters to ensure valid data types and remove empty values.
     */
    static normalizeFilters(filters: FilterState): FilterState {
        const cleaned: FilterState = { ...DEFAULT_FILTER_STATE, ...filters };

        // Clean strings
        if (!cleaned.make) delete cleaned.make;
        if (!cleaned.model) delete cleaned.model;
        if (!cleaned.fuelType) delete cleaned.fuelType;
        if (!cleaned.bodyType) delete cleaned.bodyType;
        if (!cleaned.transmission) delete cleaned.transmission;

        // Clean numbers
        if (cleaned.priceMin && cleaned.priceMin < 0) delete cleaned.priceMin;
        if (cleaned.priceMax && cleaned.priceMax <= 0) delete cleaned.priceMax;

        return cleaned;
    }

    /**
     * Build Firestore Query Constraints from FilterState
     */
    static buildSearchQuery(filters: FilterState): QueryConstraint[] {
        const constraints: QueryConstraint[] = [];
        const normalized = this.normalizeFilters(filters);

        // Exact Matches
        if (normalized.make) constraints.push(where('make', '==', normalized.make));
        if (normalized.model) constraints.push(where('model', '==', normalized.model));
        if (normalized.fuelType) constraints.push(where('fuelType', '==', normalized.fuelType));
        if (normalized.bodyType) constraints.push(where('bodyType', '==', normalized.bodyType));
        if (normalized.transmission) constraints.push(where('transmission', '==', normalized.transmission));

        // Ranges
        if (normalized.priceMin) constraints.push(where('price', '>=', Number(normalized.priceMin)));
        if (normalized.priceMax) constraints.push(where('price', '<=', Number(normalized.priceMax)));

        if (normalized.yearMin) constraints.push(where('year', '>=', Number(normalized.yearMin)));
        if (normalized.yearMax) constraints.push(where('year', '<=', Number(normalized.yearMax)));

        // Note: Firestore requires composite indexes for multiple range filters.
        // If 'price' and 'year' are both filtered by range, we need an index.
        // For MVP without custom indexes, we might filter one range on client-side if needed,
        // but here we assume indexes exist (as they should for parity).

        return constraints;
    }

    /**
     * Build Sort Constraints
     */
    static buildSortQuery(sort: FilterState['sort'] = 'recent'): QueryConstraint[] {
        switch (sort) {
            case 'price_asc': return [orderBy('price', 'asc')];
            case 'price_desc': return [orderBy('price', 'desc')];
            case 'year_asc': return [orderBy('year', 'asc')];
            case 'year_desc': return [orderBy('year', 'desc')];
            case 'mileage_asc': return [orderBy('mileage', 'asc')];
            // 'recent' usually implies createdAt desc
            case 'recent': default: return [orderBy('createdAt', 'desc')];
        }
    }

    /**
     * Map Web URL Parameters to Mobile FilterState
     * e.g. ?mk=BMW&md=320&pf=10000 -> { make: 'BMW', model: '320', priceMin: 10000 }
     */
    static mapWebFiltersToMobile(params: Record<string, string>): FilterState {
        const filters: FilterState = {};

        if (params.mk) filters.make = params.mk;
        if (params.md) filters.model = params.md;
        if (params.gen) filters.generation = params.gen;

        if (params.pf) filters.priceMin = Number(params.pf);
        if (params.pt) filters.priceMax = Number(params.pt);

        if (params.yf) filters.yearMin = Number(params.yf);
        if (params.yt) filters.yearMax = Number(params.yt);

        if (params.fuel) filters.fuelType = params.fuel;
        if (params.body) filters.bodyType = params.body;
        if (params.trans) filters.transmission = params.trans;

        if (params.sort) filters.sort = params.sort as FilterState['sort'];

        return this.normalizeFilters(filters);
    }

    /**
     * Map Mobile FilterState to Web URL Parameters (for sharing links)
     */
    static mapMobileFiltersToWeb(filters: FilterState): string {
        const params = new URLSearchParams();
        const norm = this.normalizeFilters(filters);

        if (norm.make) params.set('mk', norm.make);
        if (norm.model) params.set('md', norm.model);

        if (norm.priceMin) params.set('pf', String(norm.priceMin));
        if (norm.priceMax) params.set('pt', String(norm.priceMax));

        if (norm.yearMin) params.set('yf', String(norm.yearMin));
        if (norm.yearMax) params.set('yt', String(norm.yearMax));

        if (norm.fuelType) params.set('fuel', norm.fuelType);
        if (norm.sort) params.set('sort', norm.sort);

        return params.toString();
    }
}

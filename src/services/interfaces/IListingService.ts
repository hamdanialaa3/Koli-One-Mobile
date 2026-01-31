import { ListingBase } from '../../types/ListingBase';
import { FilterState } from '../search/UnifiedFilterTypes';

/**
 * Service Contract for Listing Data
 * Defines the strict boundary between UI and Data Layer.
 * Any backend implementation (Firebase, REST, GraphQL) must satisfy this contract.
 */
export interface IListingService {
    /**
     * Get recent listings from default collections
     */
    getListings(): Promise<ListingBase[]>;

    /**
     * Get a single listing by ID, searching all known collections
     */
    getListingById(id: string): Promise<ListingBase | null>;

    /**
     * Efficiently fetch multiple listings by ID (e.g. for Favorites/History)
     */
    getListingsByIds(ids: string[]): Promise<ListingBase[]>;

    /**
     * Unified Search: Apply filters, sort, and search logic
     */
    search(filters: FilterState): Promise<ListingBase[]>;

    /**
     * Get global platform statistics (e.g. total cars, dealers)
     */
    getGlobalStats(): Promise<{
        totalListings: string;
        totalDealers: string;
        trustScore: string;
    }>;

    /**
     * Get categories with dynamic counts
     */
    getCategories(): Promise<Array<{
        id: string;
        label: string;
        count: string;
        price: string;
        image: string;
    }>>;
}

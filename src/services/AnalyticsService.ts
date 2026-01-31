import { logEvent } from 'firebase/analytics';
import { analytics } from './firebase';

/**
 * AnalyticsService provides a unified way to track user events
 * for business insights and performance monitoring.
 */
export class AnalyticsService {
    /**
     * Log when a user performs a search
     */
    static logSearch(query: string, filters: any) {
        if (analytics) {
            logEvent(analytics, 'search_listings', {
                search_term: query,
                ...filters
            });
        }
    }

    /**
     * Log when a user views a specific listing
     */
    static logViewListing(listingId: string, make: string, model: string) {
        if (analytics) {
            logEvent(analytics, 'view_listing', {
                listing_id: listingId,
                make,
                model
            });
        }
    }

    /**
     * Log when a user adds a car to favorites
     */
    static logAddToFavorites(listingId: string) {
        if (analytics) {
            logEvent(analytics, 'add_to_favorites', {
                listing_id: listingId
            });
        }
    }

    /**
     * Log when a user starts the sell wizard
     */
    static logStartSell() {
        if (analytics) {
            logEvent(analytics, 'start_sell_wizard', {});
        }
    }

    /**
     * Log when a user completes the sell process
     */
    static logCompleteSell(listingId: string) {
        if (analytics) {
            logEvent(analytics, 'complete_sell_wizard', {
                listing_id: listingId
            });
        }
    }
}

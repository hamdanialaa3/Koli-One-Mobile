import { logEvent } from 'firebase/analytics';
import { analytics } from './firebase';
import { logger } from './logger-service';

/**
 * AnalyticsService provides a unified way to track user events
 * for business insights and performance monitoring.
 *
 * Firebase Analytics is currently disabled (domain restriction / 403).
 * All methods gracefully no-op when analytics is undefined.
 * Events are logged to logger-service for dev visibility.
 */
export class AnalyticsService {
    private static safeLog(eventName: string, params: Record<string, any>) {
        if (!analytics) {
            // Analytics disabled — silent no-op (logged once at startup in firebase.ts)
            return;
        }
        try {
            logEvent(analytics, eventName, params);
        } catch (err) {
            logger.warn(`Analytics event "${eventName}" failed`, { error: err });
        }
    }

    /**
     * Log when a user performs a search
     */
    static logSearch(query: string, filters: any) {
        this.safeLog('search_listings', { search_term: query, ...filters });
    }

    /**
     * Log when a user views a specific listing
     */
    static logViewListing(listingId: string, make: string, model: string) {
        this.safeLog('view_listing', { listing_id: listingId, make, model });
    }

    /**
     * Log when a user adds a car to favorites
     */
    static logAddToFavorites(listingId: string) {
        this.safeLog('add_to_favorites', { listing_id: listingId });
    }

    /**
     * Log when a user starts the sell wizard
     */
    static logStartSell() {
        this.safeLog('start_sell_wizard', {});
    }

    /**
     * Log when a user completes the sell process
     */
    static logCompleteSell(listingId: string) {
        this.safeLog('complete_sell_wizard', { listing_id: listingId });
    }

    /**
     * Log generic custom event
     */
    static logEvent(name: string, params: Record<string, any> = {}) {
        this.safeLog(name, params);
    }
}

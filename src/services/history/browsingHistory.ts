import AsyncStorage from '@react-native-async-storage/async-storage';
import { UnifiedCar } from '../car/unified-car-types';
import { logger } from '../logger-service';

const HISTORY_KEY = 'browsing_history';
const MAX_HISTORY = 20;

export interface HistoryItem {
    listing: UnifiedCar;
    viewedAt: Date;
}

export const addToHistory = async (car: UnifiedCar) => {
    try {
        const jsonValue = await AsyncStorage.getItem(HISTORY_KEY);
        let history: HistoryItem[] = jsonValue != null ? JSON.parse(jsonValue) : [];

        // Parse dates back from JSON strings
        history = history.map(item => ({
            ...item,
            viewedAt: new Date(item.viewedAt)
        }));

        // Remove if existing
        history = history.filter(item => item.listing.id !== car.id);

        // Add to front
        history.unshift({
            listing: car,
            viewedAt: new Date()
        });

        // Limit
        if (history.length > MAX_HISTORY) {
            history = history.slice(0, MAX_HISTORY);
        }

        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
        logger.error('Failed to save browsing history', e as Error);
    }
};

export const getBrowsingHistory = async (): Promise<HistoryItem[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(HISTORY_KEY);
        if (jsonValue == null) return [];

        const rawHistory = JSON.parse(jsonValue);
        // Parse dates back, filter out corrupt entries where listing is missing
        return rawHistory
            .filter((item: any) => item && item.listing)
            .map((item: any) => ({
                ...item,
                viewedAt: new Date(item.viewedAt),
                listing: {
                    ...item.listing,
                    createdAt: item.listing.createdAt ? new Date(item.listing.createdAt) : new Date(),
                    updatedAt: item.listing.updatedAt ? new Date(item.listing.updatedAt) : new Date()
                }
            }));
    } catch (e) {
        logger.error('Failed to load browsing history', e as Error);
        return [];
    }
};

export const clearBrowsingHistory = async () => {
    try {
        await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (e) {
        logger.error('Failed to clear browsing history', e as Error);
    }
}

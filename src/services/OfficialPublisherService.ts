// axios replaced with fetch for compatibility
// import axios from 'axios';
import { Platform } from 'react-native';
import { logger } from './logger-service';

// In PROD, this comes from an env variable.
// For Local Dev (Android/iOS), Use local machine IP, not localhost.
// Replace with your machine's IP (e.g. 192.168.1.x) if testing on physical device.
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3005' : 'http://localhost:3005';

export const OfficialPublisherService = {
    publishAd: async (adId: string, adData: any) => {
        try {
            const response = await fetch(`${API_URL}/webhooks/ad-published`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ad_id: adId,
                    content: {
                        description: `${adData.make} ${adData.model} - ${adData.price} BGN. ${adData.description || ''}`,
                        images: adData.images || []
                    }
                })
            });
            const data = await response.json();
            return data;
        } catch (error: any) {
            logger.error('Publish Error', error);
            throw error;
        }
    }
};

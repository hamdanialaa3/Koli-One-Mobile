// axios replaced with fetch for compatibility
// import axios from 'axios';
import { logger } from './logger-service';

// Production Cloud Functions URL. Override with EXPO_PUBLIC_API_URL env var for local dev.
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://europe-west1-fire-new-globul.cloudfunctions.net';

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

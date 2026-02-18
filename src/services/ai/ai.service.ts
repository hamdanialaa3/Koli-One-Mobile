// src/services/ai/ai.service.ts
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../firebase';
import { logger } from '../logger-service';

export interface CarData {
    make: string;
    model: string;
    year: number;
    fuelType?: string;
    mileage?: number;
    price?: number;
    currency?: string;
    city?: string;
    equipment?: string[];
    condition?: string;
}

export interface AIResponse {
    success: boolean;
    content: string;
}

class AIService {
    private functions = getFunctions(app, 'europe-west1'); // Match backend region

    /**
     * Generates a professional car description using the backend AI Router (DeepSeek/Gemini)
     */
    async generateCarDescription(carData: CarData, language: 'bg' | 'en' = 'bg'): Promise<string> {
        try {
            const generateDescFunction = httpsCallable(this.functions, 'aiGenerateCarDescription');

            const response = await generateDescFunction({
                ...carData,
                language,
                style: 'professional'
            });

            const data = response.data as any; // Type depends on backend return
            return data.content || data.description || '';
        } catch (error) {
            logger.error('AI Service Error', error);
            throw error;
        }
    }


    /**
     * Analyzes an image to identify car details using Gemini Vision (Hybrid AI Engine)
     */
    async analyzeCarImage(base64Image: string, price?: number): Promise<Partial<CarData>> {
        try {
            // Call the hybrid AI engine (Gemini Vision + DeepSeek Logic)
            const evaluateCarFunction = httpsCallable(this.functions, 'evaluateCar');

            // Note: marketAvg is optional, backend defaults to 50000 if not provided
            const response = await evaluateCarFunction({
                imageBase64: base64Image,
                price: price || 0
            });

            const result = response.data as any;
            const details = result.carDetails || {};

            // Map AI response to mobile app CarData structure
            return {
                make: details.make || '',
                model: details.model || '',
                year: details.year ? parseInt(details.year.toString()) : undefined,
                equipment: details.color ? [details.color] : [], // Store color in features/equipment temporarily
                condition: details.condition || 'Good'
            } as Partial<CarData>;

        } catch (error) {
            logger.error('AI Vision Error', error);
            // Return empty object on failure so the app doesn't crash, just doesn't autofill
            return {};
        }
    }

    /**
     * Get AI-powered price suggestion using Gemini via Cloud Function
     */
    async getPriceSuggestion(params: {
        make: string;
        model: string;
        year: number;
        mileage?: number;
        condition?: string;
        location?: string;
        fuelType?: string;
    }): Promise<{
        minPrice: number;
        avgPrice: number;
        maxPrice: number;
        confidence: number;
        reasoning: string;
        marketTrend: string;
        similarCount: number;
    }> {
        try {
            const fn = httpsCallable(this.functions, 'geminiPriceSuggestion');
            const response = await fn(params);
            const data = response.data as any;
            return {
                minPrice: data.minPrice ?? 0,
                avgPrice: data.avgPrice ?? 0,
                maxPrice: data.maxPrice ?? 0,
                confidence: data.confidence ?? 80,
                reasoning: data.reasoning ?? '',
                marketTrend: data.marketTrend ?? 'stable',
                similarCount: data.similarCount ?? 0,
            };
        } catch (error) {
            logger.error('AI Price Suggestion Error', error);
            throw error;
        }
    }

    /**
     * Check user's AI quota
     */
    async checkQuota(): Promise<{ remaining: number; limit: number; resetsAt: string }> {
        try {
            const fn = httpsCallable(this.functions, 'aiQuotaCheck');
            const response = await fn({});
            const data = response.data as any;
            return {
                remaining: data.remaining ?? 0,
                limit: data.limit ?? 10,
                resetsAt: data.resetsAt ?? '',
            };
        } catch (error) {
            logger.error('AI Quota Check Error', error);
            throw error;
        }
    }

}

export const aiService = new AIService();

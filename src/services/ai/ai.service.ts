// src/services/ai/ai.service.ts
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../firebase';

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
            console.error('AI Service Error:', error);
            throw error;
        }
    }

    /**
     * Analyzes an image to identify car details (Future implementation via Gemini Vision)
     * This would call a cloud function that wraps Gemini Vision API
     */
    async analyzeCarImage(base64Image: string): Promise<Partial<CarData>> {
        try {
            // Placeholder for Phase 5.2 - Image Recognition
            // const analyzeImageFunction = httpsCallable(this.functions, 'aiAnalyzeCarImage');
            // const response = await analyzeImageFunction({ image: base64Image });
            // return response.data as Partial<CarData>;
            return {};
        } catch (error) {
            console.error('AI Vision Error:', error);
            return {};
        }
    }
}

export const aiService = new AIService();

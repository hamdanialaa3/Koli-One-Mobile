import { collection, query, where, getDocs, orderBy, limit as firestoreLimit } from 'firebase/firestore';
import { db } from './firebase';
import { logger } from './logger-service';

// ==================== TYPES ====================

export interface PriceEstimateInput {
  make: string;
  model: string;
  year: number;
  mileage: number;
  fuelType?: string;
  transmission?: string;
  location?: string;
}

export interface PriceEstimateResult {
  min: number;          // 25th percentile (pessimistic)
  fair: number;         // Median (50th percentile)
  max: number;          // 75th percentile (optimistic)
  average: number;      // Mean price
  sampleSize: number;   // How many similar cars found
  confidence: 'high' | 'medium' | 'low';  // Based on sample size
  similarCars: SimilarCar[];
}

export interface SimilarCar {
  id: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  location?: string;
  similarityScore: number;  // 0-100
}

// ==================== CONSTANTS ====================

const VEHICLE_COLLECTIONS = [
  'passenger_cars',
  'suvs',
  'vans',
  'motorcycles',
  'trucks',
  'buses'
];

// Minimum sample size for reliable estimation
const MIN_SAMPLE_SIZE_HIGH = 15;
const MIN_SAMPLE_SIZE_MEDIUM = 5;

// ==================== SERVICE CLASS ====================

/**
 * Price Estimator Service
 * Calculates fair market price for cars based on real market data
 * 
 * Algorithm:
 * 1. Find similar cars (same make, model, year ±1, similar mileage)
 * 2. Calculate similarity score (0-100) for each car
 * 3. Extract prices from top similar cars
 * 4. Calculate percentiles: P25, P50 (median), P75
 * 5. Return price range: [P25, P50, P75]
 */
class PriceEstimatorService {
  private static instance: PriceEstimatorService;

  private constructor() { }

  public static getInstance(): PriceEstimatorService {
    if (!PriceEstimatorService.instance) {
      PriceEstimatorService.instance = new PriceEstimatorService();
    }
    return PriceEstimatorService.instance;
  }

  /**
   * Estimate fair market price for a car
   */
  public async estimatePrice(input: PriceEstimateInput): Promise<PriceEstimateResult> {
    logger.info('PriceEstimator: Starting price estimation', {
      make: input.make,
      model: input.model,
      year: input.year
    });

    try {
      // 1. Find similar cars
      const similarCars = await this.findSimilarCars(input);

      if (similarCars.length === 0) {
        logger.warn('PriceEstimator: No similar cars found, using fallback');
        return this.getFallbackEstimate(input);
      }

      // 2. Extract prices from top similar cars
      const prices = similarCars
        .slice(0, 30) // Top 30 most similar
        .map(car => car.price)
        .filter(price => price > 0)
        .sort((a, b) => a - b);

      if (prices.length === 0) {
        logger.warn('PriceEstimator: No valid prices found, using fallback');
        return this.getFallbackEstimate(input);
      }

      // 3. Calculate percentiles
      const min = this.calculatePercentile(prices, 25);   // P25 (pessimistic)
      const fair = this.calculatePercentile(prices, 50);  // P50 (median)
      const max = this.calculatePercentile(prices, 75);   // P75 (optimistic)
      const average = Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length);

      // 4. Determine confidence level
      const confidence = this.determineConfidence(prices.length);

      logger.info('PriceEstimator: Estimation complete', {
        min,
        fair,
        max,
        sampleSize: prices.length,
        confidence
      });

      return {
        min,
        fair,
        max,
        average,
        sampleSize: prices.length,
        confidence,
        similarCars: similarCars.slice(0, 5) // Return top 5 for display
      };
    } catch (error) {
      logger.error('PriceEstimator: Error estimating price', error as Error, { input });
      throw error;
    }
  }

  /**
   * Find similar cars in Firestore collections
   */
  private async findSimilarCars(input: PriceEstimateInput): Promise<SimilarCar[]> {
    const allCars: SimilarCar[] = [];

    // Query each collection in parallel
    const queryPromises = VEHICLE_COLLECTIONS.map(async (collectionName) => {
      try {
        // Base query: same make, active, not sold
        const constraints = [
          where('make', '==', input.make),
          where('isActive', '==', true),
          where('isSold', '==', false)
        ];

        // Add model filter if provided
        if (input.model) {
          constraints.push(where('model', '==', input.model));
        }

        // Add fuel type filter if provided
        if (input.fuelType) {
          constraints.push(where('fuelType', '==', input.fuelType));
        }

        const q = query(
          collection(db, collectionName),
          ...constraints,
          orderBy('createdAt', 'desc'),
          firestoreLimit(50) // Limit per collection
        );

        const snapshot = await getDocs(q);

        const cars = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            const similarityScore = this.calculateSimilarityScore(input, data);

            // Only include cars with similarity > 30
            if (similarityScore <= 30 || !data.price || data.price <= 0) return null;

            const car: SimilarCar = {
              id: doc.id,
              make: data.make || '',
              model: data.model || '',
              year: data.year || 0,
              mileage: data.mileage || data.kilometers || data.km || 0,
              price: data.price || 0,
              location: data.location || data.city || '',
              similarityScore
            };

            return car;
          })
          .filter((car): car is SimilarCar => car !== null);

        return cars;
      } catch (error) {
        logger.warn(`PriceEstimator: Error querying ${collectionName}`, { error });
        return [];
      }
    });

    const results = await Promise.all(queryPromises);
    results.forEach(cars => {
      if (cars && Array.isArray(cars)) {
        allCars.push(...cars);
      }
    });

    // Remove duplicates by ID
    const uniqueCars = Array.from(
      new Map(allCars.map(car => [car.id, car])).values()
    );

    // Sort by similarity score (highest first)
    return uniqueCars.sort((a, b) => b.similarityScore - a.similarityScore);
  }

  /**
   * Calculate similarity score between input and car data
   * Score: 0-100 (higher = more similar)
   */
  private calculateSimilarityScore(input: PriceEstimateInput, carData: any): number {
    let score = 0;

    // Make match: 30 points (required, already filtered)
    if (carData.make === input.make) score += 30;

    // Model match: 25 points
    if (carData.model === input.model) score += 25;

    // Year proximity: 20 points (within 2 years = full, each year beyond = -5)
    if (carData.year && input.year) {
      const yearDiff = Math.abs(carData.year - input.year);
      if (yearDiff <= 1) score += 20;
      else if (yearDiff === 2) score += 15;
      else if (yearDiff === 3) score += 10;
      else score += Math.max(0, 10 - (yearDiff - 3) * 3);
    }

    // Fuel type match: 10 points
    if (input.fuelType && carData.fuelType === input.fuelType) score += 10;

    // Transmission match: 5 points
    if (input.transmission && carData.transmission === input.transmission) score += 5;

    // Mileage proximity: 10 points (within 20% = full)
    if (carData.mileage && input.mileage) {
      const mileageDiff = Math.abs(carData.mileage - input.mileage) / input.mileage;
      if (mileageDiff <= 0.2) score += 10;
      else score += Math.max(0, 10 - mileageDiff * 30);
    }

    return Math.min(score, 100);
  }

  /**
   * Calculate percentile from sorted array
   */
  private calculatePercentile(sortedPrices: number[], percentile: number): number {
    const index = (percentile / 100) * (sortedPrices.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;

    if (lower === upper) {
      return Math.round(sortedPrices[lower]);
    }

    // Linear interpolation
    const interpolated = sortedPrices[lower] * (1 - weight) + sortedPrices[upper] * weight;
    return Math.round(interpolated);
  }

  /**
   * Determine confidence level based on sample size
   */
  private determineConfidence(sampleSize: number): 'high' | 'medium' | 'low' {
    if (sampleSize >= MIN_SAMPLE_SIZE_HIGH) return 'high';
    if (sampleSize >= MIN_SAMPLE_SIZE_MEDIUM) return 'medium';
    return 'low';
  }

  /**
   * Get fallback estimate when no similar cars found
   * Uses basic depreciation formula
   */
  private getFallbackEstimate(input: PriceEstimateInput): PriceEstimateResult {
    // Very basic estimation based on age and mileage
    const basePrice = 15000; // Base price for average car
    const age = new Date().getFullYear() - input.year;
    const ageDepreciation = age * 1200; // €1200 per year
    const mileageDepreciation = (input.mileage / 1000) * 50; // €50 per 1000km

    const estimatedPrice = Math.max(2000, basePrice - ageDepreciation - mileageDepreciation);
    const fair = Math.round(estimatedPrice);
    const min = Math.round(fair * 0.85); // -15%
    const max = Math.round(fair * 1.15); // +15%

    return {
      min,
      fair,
      max,
      average: fair,
      sampleSize: 0,
      confidence: 'low',
      similarCars: []
    };
  }

  /**
   * Compare car price against estimate (for badges)
   */
  public comparePriceToEstimate(carPrice: number, estimate: PriceEstimateResult): {
    rating: 'great-deal' | 'good-price' | 'fair-price' | 'high-price' | 'overpriced';
    deviation: number; // Percentage from fair price
    savingsAmount?: number;
  } {
    const deviation = ((carPrice - estimate.fair) / estimate.fair) * 100;

    let rating: 'great-deal' | 'good-price' | 'fair-price' | 'high-price' | 'overpriced';
    if (deviation < -20) {
      rating = 'great-deal';     // 20%+ cheaper
    } else if (deviation < -10) {
      rating = 'good-price';     // 10-20% cheaper
    } else if (deviation <= 10) {
      rating = 'fair-price';     // Within ±10%
    } else if (deviation <= 25) {
      rating = 'high-price';     // 10-25% more expensive
    } else {
      rating = 'overpriced';     // 25%+ more expensive
    }

    const result: any = {
      rating,
      deviation: Math.round(deviation * 10) / 10
    };

    if (carPrice < estimate.fair) {
      result.savingsAmount = Math.round(estimate.fair - carPrice);
    }

    return result;
  }
}

// Export singleton instance
export default PriceEstimatorService.getInstance();

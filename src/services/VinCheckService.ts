/**
 * VIN Check Service
 * خدمة فحص رقم الشاصي (VIN)
 * 
 * Integrates with:
 * - NHTSA API (free) for VIN validation + vehicle specs
 * - Firestore for ownership count + accident history (crowdsourced)
 * 
 * Location: Bulgaria | Languages: BG/EN
 * Created: February 2026
 */

import { db } from './firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { logger } from './logger-service';

// ==================== INTERFACES ====================

export interface VinCheckResult {
  vin: string;
  isValid: boolean;
  
  // NHTSA Data (Vehicle Specs)
  vehicleInfo?: {
    make: string;
    model: string;
    year: number;
    manufacturer: string;
    plantCountry?: string;
    vehicleType?: string;
    engineSize?: string;
    fuelType?: string;
  };
  
  // Firestore Data (History)
  historyInfo?: {
    ownershipCount: number;
    hasAccidentHistory: boolean;
    accidentSeverity: 'none' | 'minor' | 'moderate' | 'severe';
    lastOwnerChange?: Date;
    source: 'crowdsourced' | 'seller_provided' | 'unavailable';
  };
  
  // Trust Score
  trustScore: {
    overall: number; // 0-100
    level: 'excellent' | 'good' | 'fair' | 'poor';
    badge: string; // "🟢 هذه السيارة نظيفة" or "⚠️ تاريخ حوادث"
    badgeBG: string;
    recommendationBuyer: string;
    recommendationBuyerBG: string;
  };
  
  checkedAt: Date;
  error?: string;
}

interface NHTSAResponse {
  Results: Array<{
    Variable: string;
    Value: string | null;
  }>;
  Message?: string;
}

// ==================== SERVICE CLASS ====================

class VinCheckService {
  private static instance: VinCheckService;
  
  private readonly NHTSA_API_BASE = 'https://vpic.nhtsa.dot.gov/api';
  private readonly CACHE_COLLECTION = 'vin_checks';
  private readonly CACHE_DURATION_DAYS = 30;
  
  private constructor() {}
  
  static getInstance(): VinCheckService {
    if (!VinCheckService.instance) {
      VinCheckService.instance = new VinCheckService();
    }
    return VinCheckService.instance;
  }
  
  // ==================== PUBLIC METHODS ====================
  
  /**
   * Check VIN and return comprehensive report
   * فحص رقم الشاصي وإرجاع تقرير شامل
   */
  async checkVin(vin: string): Promise<VinCheckResult> {
    try {
      logger.info('Starting VIN check', { vin: vin.substring(0, 8) + '...' });
      
      // Step 1: Validate VIN format
      const validationError = this.validateVinFormat(vin);
      if (validationError) {
        return this.createErrorResult(vin, validationError);
      }
      
      // Step 2: Check cache
      const cachedResult = await this.getCachedResult(vin);
      if (cachedResult) {
        logger.info('Returning cached VIN result', { vin: vin.substring(0, 8) + '...' });
        return cachedResult;
      }
      
      // Step 3: Fetch from NHTSA API
      const vehicleInfo = await this.fetchNHTSAData(vin);
      
      // Step 4: Fetch history from Firestore
      const historyInfo = await this.fetchHistoryFromFirestore(vin);
      
      // Step 5: Calculate trust score
      const trustScore = this.calculateTrustScore(historyInfo);
      
      // Step 6: Create result
      const result: VinCheckResult = {
        vin,
        isValid: true,
        vehicleInfo,
        historyInfo,
        trustScore,
        checkedAt: new Date(),
      };
      
      // Step 7: Cache result
      await this.cacheResult(result);
      
      logger.info('VIN check completed', { 
        vin: vin.substring(0, 8) + '...',
        trustScore: trustScore.overall 
      });
      
      return result;
      
    } catch (error) {
      logger.error('VIN check failed', error as Error, { vin: vin.substring(0, 8) + '...' });
      return this.createErrorResult(vin, 'Failed to check VIN. Please try again.');
    }
  }
  
  /**
   * Get cached result if available and fresh
   * الحصول على نتيجة محفوظة مسبقاً
   */
  private async getCachedResult(vin: string): Promise<VinCheckResult | null> {
    try {
      const docRef = doc(db, this.CACHE_COLLECTION, vin);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      const data = docSnap.data();
      const checkedAt = data.checkedAt?.toDate();
      
      if (!checkedAt) {
        return null;
      }
      
      // Check if cache is still fresh (30 days)
      const daysSince = (Date.now() - checkedAt.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSince > this.CACHE_DURATION_DAYS) {
        return null;
      }
      
      return data as VinCheckResult;
      
    } catch (error) {
      logger.warn('Failed to get cached VIN result', { vin: vin.substring(0, 8) + '...' });
      return null;
    }
  }
  
  // ==================== PRIVATE METHODS ====================
  
  /**
   * Validate VIN format (17 characters, no I/O/Q)
   */
  private validateVinFormat(vin: string): string | null {
    if (!vin || typeof vin !== 'string') {
      return 'رقم الشاصي مطلوب';
    }
    
    const cleanVIN = vin.toUpperCase().replace(/\s/g, '');
    
    if (cleanVIN.length !== 17) {
      return `رقم الشاصي يجب أن يحتوي على 17 حرفاً (Current: ${cleanVIN.length})`;
    }
    
    // Check for invalid characters (I, O, Q not allowed in VIN)
    if (/[IOQ]/.test(cleanVIN)) {
      return 'رقم الشاصي لا يمكن أن يحتوي على الأحرف: I, O, Q';
    }
    
    // Only alphanumeric
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(cleanVIN)) {
      return 'رقم الشاصي يحتوي على أحرف غير صحيحة';
    }
    
    return null;
  }
  
  /**
   * Fetch vehicle info from NHTSA API
   */
  private async fetchNHTSAData(vin: string): Promise<VinCheckResult['vehicleInfo']> {
    try {
      const cleanVIN = vin.toUpperCase().replace(/\s/g, '');
      const endpoint = `${this.NHTSA_API_BASE}/vehicles/DecodeVinValues/${cleanVIN}?format=json`;
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`NHTSA API error: ${response.status}`);
      }
      
      const data: NHTSAResponse = await response.json();
      
      if (!data.Results || data.Results.length === 0) {
        return undefined;
      }
      
      // Extract vehicle info from NHTSA response
      const getValue = (variableName: string): string | undefined => {
        const item = data.Results.find(r => r.Variable === variableName);
        return item?.Value || undefined;
      };
      
      const make = getValue('Make');
      const model = getValue('Model');
      const year = getValue('ModelYear');
      
      if (!make || !model || !year) {
        // VIN not found in NHTSA database
        return undefined;
      }
      
      return {
        make,
        model,
        year: parseInt(year, 10),
        manufacturer: getValue('Manufacturer') || make,
        plantCountry: getValue('PlantCountry'),
        vehicleType: getValue('VehicleType'),
        engineSize: getValue('DisplacementL'),
        fuelType: getValue('FuelTypePrimary'),
      };
      
    } catch (error) {
      logger.warn('Failed to fetch NHTSA data (non-critical)', { vin: vin.substring(0, 8) + '...' });
      return undefined;
    }
  }
  
  /**
   * Fetch ownership + accident history from Firestore (crowdsourced)
   */
  private async fetchHistoryFromFirestore(vin: string): Promise<VinCheckResult['historyInfo']> {
    try {
      const cleanVIN = vin.toUpperCase().replace(/\s/g, '');
      
      // Check for ownership records
      const ownershipRef = collection(db, 'car_ownership_records');
      const ownershipQuery = query(ownershipRef, where('vin', '==', cleanVIN));
      const ownershipSnap = await getDocs(ownershipQuery);
      
      const ownershipCount = ownershipSnap.size;
      const lastOwnerChange = !ownershipSnap.empty 
        ? ownershipSnap.docs[0].data().periodStart?.toDate() 
        : undefined;
      
      // Check for accident records
      const accidentRef = collection(db, 'car_accident_reports');
      const accidentQuery = query(accidentRef, where('vin', '==', cleanVIN));
      const accidentSnap = await getDocs(accidentQuery);
      
      const hasAccidentHistory = !accidentSnap.empty;
      let accidentSeverity: 'none' | 'minor' | 'moderate' | 'severe' = 'none';
      
      if (hasAccidentHistory) {
        // Find max severity
        let hasSevere = false;
        let hasModerate = false;
        
        accidentSnap.forEach(docSnap => {
          const severity = docSnap.data().severity;
          if (severity === 'severe') hasSevere = true;
          else if (severity === 'moderate') hasModerate = true;
        });
        
        accidentSeverity = hasSevere ? 'severe' : hasModerate ? 'moderate' : 'minor';
      }
      
      const source: 'crowdsourced' | 'seller_provided' | 'unavailable' = 
        (ownershipCount > 0 || hasAccidentHistory) ? 'crowdsourced' : 'unavailable';
      
      return {
        ownershipCount: ownershipCount || 1, // Default to 1 if no records
        hasAccidentHistory,
        accidentSeverity,
        lastOwnerChange,
        source,
      };
      
    } catch (error) {
      logger.warn('Failed to fetch history from Firestore', { vin: vin.substring(0, 8) + '...' });
      return {
        ownershipCount: 1,
        hasAccidentHistory: false,
        accidentSeverity: 'none',
        source: 'unavailable',
      };
    }
  }
  
  /**
   * Calculate trust score based on history
   */
  private calculateTrustScore(
    historyInfo?: VinCheckResult['historyInfo']
  ): VinCheckResult['trustScore'] {
    let score = 100;
    
    if (!historyInfo) {
      return {
        overall: 50,
        level: 'fair',
        badge: '⚠️ No history available',
        badgeBG: '⚠️ Няма данни за история',
        recommendationBuyer: 'Limited information available. Request seller disclosure.',
        recommendationBuyerBG: 'Ограничена информация. Искайте декларация от продавача.',
      };
    }
    
    // Deduct points for multiple owners
    score -= (historyInfo.ownershipCount - 1) * 10;
    
    // Deduct points for accidents
    if (historyInfo.hasAccidentHistory) {
      score -= historyInfo.accidentSeverity === 'severe' ? 30 :
               historyInfo.accidentSeverity === 'moderate' ? 20 : 10;
    }
    
    score = Math.max(0, Math.min(100, score));
    
    const level: 'excellent' | 'good' | 'fair' | 'poor' =
      score >= 80 ? 'excellent' :
      score >= 60 ? 'good' :
      score >= 40 ? 'fair' : 'poor';
    
    // Generate badge
    let badge: string;
    let badgeBG: string;
    
    if (level === 'excellent' || level === 'good') {
      badge = '🟢 This car is clean';
      badgeBG = '🟢 هذه السيارة نظيفة';
    } else if (historyInfo.hasAccidentHistory) {
      badge = '⚠️ Accident history';
      badgeBG = '⚠️ تاريخ حوادث';
    } else {
      badge = '⚠️ Multiple owners';
      badgeBG = '⚠️ عدة ملاك';
    }
    
    // Generate recommendations
    const recommendationBuyer = 
      level === 'excellent' || level === 'good' 
        ? 'Recommended purchase. Good vehicle history.'
        : 'Caution advised. Review history details carefully.';
    
    const recommendationBuyerBG = 
      level === 'excellent' || level === 'good'
        ? 'موصى بالشراء. تاريخ جيد للسيارة.'
        : 'توخي الحذر. راجع تفاصيل التاريخ بعناية.';
    
    return {
      overall: score,
      level,
      badge,
      badgeBG,
      recommendationBuyer,
      recommendationBuyerBG,
    };
  }
  
  /**
   * Cache VIN check result in Firestore
   */
  private async cacheResult(result: VinCheckResult): Promise<void> {
    try {
      const docRef = doc(db, this.CACHE_COLLECTION, result.vin);
      await setDoc(docRef, {
        ...result,
        checkedAt: new Date(),
      });
    } catch (error) {
      logger.warn('Failed to cache VIN result', { vin: result.vin.substring(0, 8) + '...' });
    }
  }
  
  /**
   * Create error result
   */
  private createErrorResult(vin: string, error: string): VinCheckResult {
    return {
      vin,
      isValid: false,
      trustScore: {
        overall: 0,
        level: 'poor',
        badge: '❌ Invalid VIN',
        badgeBG: '❌ رقم شاصي غير صحيح',
        recommendationBuyer: error,
        recommendationBuyerBG: error,
      },
      checkedAt: new Date(),
      error,
    };
  }
}

// Export singleton instance
export const vinCheckService = VinCheckService.getInstance();
export default VinCheckService;

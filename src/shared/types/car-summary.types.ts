/**
 * CarSummary — Lightweight card-view representation.
 * Used for listing grids, search results, and favorites.
 */

import type { FuelType } from './car-listing.types';

export interface CarSummary {
  id: string;
  slug?: string;
  title: string;
  priceTotal?: number;
  priceMonthly?: number;
  priceCurrency: 'EUR' | 'BGN';
  isLeasing: boolean;
  leasingTermMonths?: number;
  leasingKmPerYear?: number;
  firstRegistration?: string;
  fuelType: FuelType;
  horsepower: number;
  transmission: 'automatic' | 'manual' | 'semi-automatic';
  mileageKm?: number;
  consumptionCombined?: string;
  co2Combined?: string;
  locationCity: string;
  locationPostalCode?: string;
  imageUrl: string;
  priceBadge?: 'great_price' | 'good_price' | 'fair_price' | 'good' | 'very_good' | 'fair' | null;

  // Constitutional: Numeric ID System
  sellerNumericId?: number;
  carNumericId?: number;
}

/**
 * Vehicle Collection Names — Maps vehicle types to Firestore collection names.
 * Used across both web and mobile for consistent data access.
 */

import type { VehicleCollectionName } from '../types/car-listing.types';

export const VEHICLE_COLLECTIONS: Record<string, VehicleCollectionName> = {
  car: 'passenger_cars',
  passenger_car: 'passenger_cars',
  suv: 'suvs',
  van: 'vans',
  motorcycle: 'motorcycles',
  truck: 'trucks',
  bus: 'buses',
} as const;

/**
 * Get the Firestore collection name for a vehicle type.
 */
export function getCollectionName(vehicleType: string): VehicleCollectionName {
  const key = vehicleType.toLowerCase().replace(/\s+/g, '_');
  return VEHICLE_COLLECTIONS[key] ?? 'passenger_cars';
}

/**
 * All vehicle collection names for cross-collection queries.
 */
export const ALL_VEHICLE_COLLECTIONS: VehicleCollectionName[] = [
  'passenger_cars',
  'suvs',
  'vans',
  'motorcycles',
  'trucks',
  'buses',
];

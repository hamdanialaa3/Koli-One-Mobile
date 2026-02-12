/**
 * Numeric ID System — Types for constitution-compliant URL generation.
 *
 * Koli One uses numeric IDs instead of Firebase UIDs in public URLs:
 *   /car/{sellerNumericId}/{carNumericId}
 *   /profile/{numericId}
 */

export interface NumericIdAssignment {
  numericId: number;
  entityType: 'user' | 'car';
  entityId: string; // Firebase document ID
  assignedAt: number; // timestamp
}

export interface NumericIdCounter {
  currentValue: number;
  lastUpdated: number;
}

export interface NumericIdLookupResult {
  found: boolean;
  numericId?: number;
  entityId?: string;
  entityType?: 'user' | 'car';
}

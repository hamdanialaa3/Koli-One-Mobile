/**
 * CarListing — Canonical Firestore document interface.
 *
 * This is the SINGLE SOURCE OF TRUTH for the car listing schema.
 * Both web and mobile extend/subset from this contract.
 *
 * @version 2.0.0
 * @constitutional Numeric ID System enforced
 */

// ── Vehicle Status ──────────────────────────────────────────
export type VehicleStatus = 'active' | 'sold' | 'draft' | 'expired' | 'deleted';

// ── Fuel & Transmission ─────────────────────────────────────
export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'lpg' | 'cng' | 'hydrogen' | 'other';
export type TransmissionType = 'manual' | 'automatic' | 'semi-automatic';

// ── Vehicle Collection Names ────────────────────────────────
export type VehicleCollectionName =
  | 'passenger_cars'
  | 'suvs'
  | 'vans'
  | 'motorcycles'
  | 'trucks'
  | 'buses';

// ── Location Data ───────────────────────────────────────────
export interface LocationData {
  cityName?: string;
  regionName?: string;
  cityId?: number;
  regionId?: number;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

// ── Core CarListing Interface ───────────────────────────────
export interface CarListing {
  // === Identification ===
  id?: string;
  vin?: string;

  // === Numeric ID System (Constitutional Requirement) ===
  numericId?: number;
  carNumericId?: number;
  sellerNumericId?: number;
  ownerNumericId?: number;
  userCarSequenceId?: number;

  // === Vehicle Details ===
  vehicleType: string;
  make: string;
  model: string;
  makeOther?: string;
  modelOther?: string;
  year: number;
  mileage: number;
  fuelType: string;
  fuelTypeOther?: string;
  transmission: string;
  power?: number;           // HP
  powerKW?: number;         // kW
  engineSize?: number;      // cm³
  color?: string;
  exteriorColor?: string;
  colorOther?: string;
  doors?: string;
  numberOfDoors?: number;
  seats?: string;
  numberOfSeats?: number;
  condition?: string;
  accidentHistory?: boolean;
  serviceHistory?: boolean;
  fullServiceHistory?: boolean;
  description?: string;
  bodyType?: string;

  // === Technical Specifications ===
  engineType?: string;
  driveType?: string;
  fuelConsumption?: number;
  co2Emissions?: number;
  euroStandard?: string;
  weight?: number;
  trunkVolume?: number;
  fuelTankCapacity?: number;

  // === Interior ===
  interiorColor?: string;
  interiorMaterial?: string;
  airbags?: string;
  airConditioning?: string;

  // === Equipment ===
  features?: string[];
  safetyEquipment?: string[];
  comfortEquipment?: string[];
  infotainmentEquipment?: string[];
  exteriorEquipment?: string[];
  interiorEquipment?: string[];
  extras?: string[];

  // === Seller Information ===
  sellerType: string;
  sellerName: string;
  sellerEmail?: string;
  sellerPhone: string;
  sellerId: string;
  companyName?: string;

  // === Location ===
  location?: string;
  city: string;
  region: string;
  postalCode?: string;
  locationData?: LocationData;
  coordinates?: Coordinates;
  latitude?: number;
  longitude?: number;

  // === Pricing ===
  price: number;
  currency: string;
  priceType?: string;
  negotiable?: boolean;
  financing?: boolean;
  tradeIn?: boolean;
  warranty?: boolean;
  warrantyMonths?: number;
  paymentMethods?: string[];

  // === Images & Media ===
  images?: string[];
  hasVideo?: boolean;
  videoUrl?: string;

  // === Contact ===
  preferredContact?: string[];
  availableHours?: string;

  // === Offer Flags ===
  vatReclaimable?: boolean;
  nonSmoker?: boolean;

  // === System Fields ===
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt?: any; // Firebase Timestamp
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updatedAt?: any;
  status: VehicleStatus;
  views?: number;
  favorites?: number;
  isFeatured?: boolean;
  isUrgent?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expiresAt?: any;

  // === Stories System ===
  stories?: CarStory[];
  hasStories?: boolean;

  // === Edit Limits ===
  editStats?: {
    makeModelChangeCount: number;
  };
}

// ── Story (inline version for CarListing.stories) ───────────
export interface CarStory {
  id: string;
  carId?: string;
  sellerId?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  caption?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expiresAt: any;
  views: number;
  isActive: boolean;
}

// ── Filters ─────────────────────────────────────────────────
export interface CarListingFilters {
  vehicleType?: string;
  make?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  mileageFrom?: number;
  mileageTo?: number;
  priceFrom?: number;
  priceTo?: number;
  fuelType?: string;
  transmission?: string;
  location?: string;
  region?: string;
  features?: string[];
  sellerType?: string;
  sortBy?: 'price' | 'year' | 'mileage' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// ── Search Result ───────────────────────────────────────────
export interface CarListingSearchResult {
  listings: CarListing[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

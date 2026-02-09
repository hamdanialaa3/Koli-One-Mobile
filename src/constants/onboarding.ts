/**
 * Onboarding Constants
 * Data for the 3-step onboarding flow shown on first launch
 */

export const ONBOARDING_STORAGE_KEY = 'onboarding_completed';

export const BULGARIAN_CITIES = [
  'София',        // Sofia
  'Пловдив',      // Plovdiv
  'Варна',        // Varna
  'Бургас',       // Burgas
  'Русе',         // Ruse
  'Стара Загора', // Stara Zagora
  'Плевен',       // Pleven
  'Сливен',       // Sliven
  'Добрич',       // Dobrich
  'Шумен',        // Shumen
  'Перник',       // Pernik
  'Хасково',      // Haskovo
  'Ямбол',        // Yambol
  'Пазарджик',    // Pazardjik
  'Благоевград',  // Blagoevgrad
  'Велико Търново', // Veliko Tarnovo
  'Враца',        // Vratsa
  'Габрово',      // Gabrovo
  'Кърджали',     // Kardzhali
  'Кюстендил',    // Kyustendil
];

export type UserIntent = 'buy' | 'sell' | 'browse';
export type VehicleType = 'car' | 'suv' | 'motorcycle';

export interface OnboardingPreferences {
  intent: UserIntent;
  vehicleType: VehicleType;
  city: string;
  completed: boolean;
  completedAt: string;
  [key: string]: unknown; // Index signature for logger compatibility
}

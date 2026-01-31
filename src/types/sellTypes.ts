// Sell Wizard Types & Constants (Parity with Web)
// Types for the mobile sell flow

export interface VehicleFormData {
    vehicleType: string;
    make: string;
    model: string;
    variant: string;
    year: string;
    fuelType: string;
    mileage: string;
    power: string;
    transmission: string;
    driveType: string;
    doors: string;
    seats: string;
    color: string;
    condition: string;
    description: string;
    price: string;
    images: string[];
    contactName: string;
    contactPhone: string;
    saleProvince: string;
    saleCity: string;
    bodyType: string;
    equipment: {
        safety: string[];
        comfort: string[];
        infotainment: string[];
        extras: string[];
    };
}

export const FUEL_TYPES = [
    'Бензин (Petrol)', 'Дизел (Diesel)', 'Електрически (Electric)', 'Хيбрид (Hybrid)', 'Газ/Бензин (LPG)', 'Метан (CNG)', 'Водород (Hydrogen)'
];

export const TRANSMISSION_TYPES = [
    'Ръчна (Manual)', 'Автоматична (Automatic)', 'Полуавтоматична (Semi-auto)'
];

export const DRIVE_TYPES = [
    'Преден (FWD)', 'Заден (RWD)', 'Четириколесен (AWD)', '4x4 (4WD)', 'Друг (Other)'
];

export const BODY_TYPES = [
    { value: 'sedan', labelBg: 'Седан', labelEn: 'Sedan' },
    { value: 'suv', labelBg: 'Джип', labelEn: 'SUV' },
    { value: 'hatchback', labelBg: 'Хечбек', labelEn: 'Hatchback' },
    { value: 'wagon', labelBg: 'Комби', labelEn: 'Wagon' },
    { value: 'coupe', labelBg: 'Купе', labelEn: 'Coupe' },
    { value: 'convertible', labelBg: 'Кабрио', labelEn: 'Convertible' },
    { value: 'pickup', labelBg: 'Пикап', labelEn: 'Pickup' },
    { value: 'minivan', labelBg: 'Ван / Миниван', labelEn: 'Minivan' },
    { value: 'other', labelBg: 'Друг', labelEn: 'Other' }
];

export const COLORS = [
    'Черен (Black)', 'Бял (White)', 'Сребрист (Silver)', 'Сив (Gray)', 'Червен (Red)', 'Син (Blue)',
    'Зелен (Green)', 'Жълт (Yellow)', 'Оранжев (Orange)', 'Кафяв (Brown)', 'Бежов (Beige)', 'Друг (Other)'
];

export const DOOR_OPTIONS = ['2/3', '4/5', '6+'];
export const SEAT_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9+'];
export const CONDITION_OPTIONS = [
    { value: 'excellent', labelBg: 'Отлично', labelEn: 'Excellent' },
    { value: 'good', labelBg: 'Добро', labelEn: 'Good' },
    { value: 'fair', labelBg: 'Задоволително', labelEn: 'Fair' }
];

export const EQUIPMENT_CATEGORIES = {
    safety: [
        { id: 'abs', labelBg: 'ABS', labelEn: 'ABS' },
        { id: 'esp', labelBg: 'ESP', labelEn: 'ESP' },
        { id: 'airbags', labelBg: 'Еърбегове', labelEn: 'Airbags' },
        { id: 'parkingSensors', labelBg: 'Парк сензори', labelEn: 'Parking Sensors' },
    ],
    comfort: [
        { id: 'ac', labelBg: 'Климатик', labelEn: 'Air Conditioning' },
        { id: 'climate', labelBg: 'Климат контрол', labelEn: 'Climate Control' },
        { id: 'heatedSeats', labelBg: 'Отопляеми седалки', labelEn: 'Heated Seats' },
    ],
    infotainment: [
        { id: 'bluetooth', labelBg: 'Bluetooth', labelEn: 'Bluetooth' },
        { id: 'navigation', labelBg: 'Навигация', labelEn: 'Navigation' },
        { id: 'carPlay', labelBg: 'Apple CarPlay', labelEn: 'Apple CarPlay' },
    ],
    extras: [
        { id: 'ledLights', labelBg: 'LED фарове', labelEn: 'LED Lights' },
        { id: 'alloyWheels', labelBg: 'Алуминиеви джанти', labelEn: 'Alloy Wheels' },
        { id: 'keyless', labelBg: 'Безключов достъп', labelEn: 'Keyless Entry' },
    ]
};

// src/types/dealership/dealership.types.ts
import { Timestamp } from 'firebase/firestore';

export interface DealershipInfo {
    uid: string;
    dealershipNameBG: string;
    dealershipNameEN?: string;
    eik: string;
    vatNumber?: string;
    licenseNumber?: string;
    address: DealershipAddress;
    contact: DealershipContact;
    workingHours: WorkingHours;
    services: DealershipServices;
    certifications: DealershipCertifications;
    media: DealershipMedia;
    settings: DealershipSettings;
    verification: {
        status: 'pending' | 'in_review' | 'verified' | 'rejected';
        submittedAt?: Timestamp;
        reviewedAt?: Timestamp;
        reviewedBy?: string;
        notes?: string;
    };
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface DealershipAddress {
    street: string;
    city: string;
    region: string;
    postalCode: string;
    country: 'Bulgaria';
    coordinates?: {
        latitude: number;
        longitude: number;
    };
    mapUrl?: string;
    locationData?: any;
}

export interface DealershipContact {
    phone: string;
    phoneCountryCode: '+359';
    email: string;
    alternativePhone?: string;
    fax?: string;
    website?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    whatsapp?: string;
    viber?: string;
    telegram?: string;
}

export interface WorkingHours {
    monday: DaySchedule;
    tuesday: DaySchedule;
    wednesday: DaySchedule;
    thursday: DaySchedule;
    friday: DaySchedule;
    saturday: DaySchedule;
    sunday: DaySchedule;
    holidays?: string;
    notes?: string;
}

export interface DaySchedule {
    isOpen: boolean;
    openTime?: string;
    closeTime?: string;
    breakStart?: string;
    breakEnd?: string;
}

export interface DealershipServices {
    newCarSales: boolean;
    usedCarSales: boolean;
    carImport: boolean;
    tradeIn: boolean;
    financing: boolean;
    leasing: boolean;
    insurance: boolean;
    maintenance: boolean;
    repairs: boolean;
    warranty: boolean;
    carWash: boolean;
    detailing: boolean;
    homeDelivery: boolean;
    testDrive: boolean;
    onlineReservation: boolean;
    specializations: string[];
    brands: string[];
}

export interface DealershipCertifications {
    dealerLicense?: {
        number: string;
        issueDate: Timestamp;
        expiryDate: Timestamp;
        issuingAuthority: string;
    };
    brandCertifications?: BrandCertification[];
    qualityCertifications?: string[];
    awards?: Award[];
}

export interface BrandCertification {
    brand: string;
    certificateNumber: string;
    level?: string;
    issueDate: Timestamp;
    expiryDate?: Timestamp;
    documentUrl?: string;
}

export interface Award {
    title: string;
    issuedBy: string;
    year: number;
    description?: string;
    imageUrl?: string;
}

export interface DealershipMedia {
    logo?: string;
    coverImage?: string;
    galleryImages?: GalleryImage[];
    showroomImages?: string[];
    videoUrl?: string;
    virtualTourUrl?: string;
}

export interface GalleryImage {
    url: string;
    caption?: string;
    category?: 'exterior' | 'interior' | 'team' | 'cars' | 'other';
    uploadedAt: Timestamp;
    order?: number;
}

export interface DealershipSettings {
    displayLanguages: ('bg' | 'en')[];
    currency: 'EUR';
    privacySettings: PrivacySettings;
    notifications: {
        newInquiries: boolean;
        newReviews: boolean;
        weeklyReport: boolean;
        monthlyReport: boolean;
    };
    businessRules: {
        minOrderValue?: number;
        maxListings?: number;
        autoReplyEnabled: boolean;
        autoReplyMessage?: string;
    };
}

export interface PrivacySettings {
    showPhoneNumber: boolean;
    showEmail: boolean;
    showAddress: boolean;
    showWorkingHours: boolean;
    allowDirectMessages: boolean;
    allowCalls: boolean;
}

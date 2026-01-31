// src/types/firestore-models.ts
import { Timestamp } from 'firebase/firestore';
import type { BulgarianUser } from './user/bulgarian-user.types';
import type { DealershipInfo } from './dealership/dealership.types';

export type { BulgarianUser, DealershipInfo };

export interface BaseDocument {
    id: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface Car extends BaseDocument {
    make: string;
    model: string;
    year: number;
    price: number;
    currency: 'EUR';
    // ... simplified for mobile start
}

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VehicleFormData } from '../types/sellTypes';

export type ImageItem = { id: string; uri: string; status: 'idle' | 'uploading' | 'done' | 'error'; progress: number };

interface SellState {
    step: number;
    form: Partial<VehicleFormData>;
    images: ImageItem[];

    setFormData: (patch: Partial<VehicleFormData>) => void;
    addImage: (img: ImageItem) => void;
    updateImage: (id: string, patch: Partial<ImageItem>) => void;
    removeImage: (id: string) => void;
    resetForm: () => void;
    setStep: (s: number) => void;
}

const INITIAL_FORM_DATA: Partial<VehicleFormData> = {
    vehicleType: 'car',
    equipment: { safety: [], comfort: [], infotainment: [], extras: [] },
};

export const useSellStore = create<SellState>()(
    persist(
        (set) => ({
            step: 1,
            form: INITIAL_FORM_DATA,
            images: [],
            setFormData: (patch) => set((s) => ({ form: { ...s.form, ...patch } })),
            addImage: (img) => set((s) => ({ images: [...s.images, img] })),
            updateImage: (id, patch) => set((s) => ({ images: s.images.map(i => i.id === id ? { ...i, ...patch } : i) })),
            removeImage: (id) => set((s) => ({ images: s.images.filter(i => i.id !== id) })),
            resetForm: () => set({ step: 1, form: INITIAL_FORM_DATA, images: [] }),
            setStep: (s) => set({ step: s }),
        }),
        {
            name: 'sell-store',
            storage: createJSONStorage(() => AsyncStorage)
        }
    )
);

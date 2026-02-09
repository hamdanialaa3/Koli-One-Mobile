import { act } from 'react-test-renderer';
import { useSellStore } from '../useSellStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
}));

describe('useSellStore', () => {
    beforeEach(() => {
        useSellStore.getState().resetForm();
        jest.clearAllMocks();
    });

    it('should have initial state', () => {
        const state = useSellStore.getState();
        expect(state.step).toBe(1);
        expect(state.form).toEqual({
            vehicleType: 'car',
            equipment: { safety: [], comfort: [], infotainment: [], extras: [] },
        });
        expect(state.images).toEqual([]);
    });

    it('should update step', () => {
        act(() => {
            useSellStore.getState().setStep(2);
        });
        expect(useSellStore.getState().step).toBe(2);
    });

    it('should update form data', () => {
        act(() => {
            useSellStore.getState().setFormData({ make: 'Toyota', model: 'Camry' });
        });
        expect(useSellStore.getState().form.make).toBe('Toyota');
        expect(useSellStore.getState().form.model).toBe('Camry');
    });

    it('should add, update, and remove images', () => {
        const newImage = { id: '1', uri: 'file://img1.jpg', status: 'idle' as const, progress: 0 };

        // Add
        act(() => {
            useSellStore.getState().addImage(newImage);
        });
        expect(useSellStore.getState().images).toHaveLength(1);
        expect(useSellStore.getState().images[0]).toEqual(newImage);

        // Update
        act(() => {
            useSellStore.getState().updateImage('1', { status: 'uploading', progress: 50 });
        });
        expect(useSellStore.getState().images[0].status).toBe('uploading');
        expect(useSellStore.getState().images[0].progress).toBe(50);

        // Remove
        act(() => {
            useSellStore.getState().removeImage('1');
        });
        expect(useSellStore.getState().images).toHaveLength(0);
    });

    it('should reset form', () => {
        act(() => {
            useSellStore.getState().setStep(3);
            useSellStore.getState().setFormData({ make: 'Honda' });
            useSellStore.getState().addImage({ id: '2', uri: 'img2', status: 'done', progress: 100 });
        });

        act(() => {
            useSellStore.getState().resetForm();
        });

        const state = useSellStore.getState();
        expect(state.step).toBe(1);
        expect(state.form.make).toBeUndefined();
        expect(state.images).toHaveLength(0);
    });
});

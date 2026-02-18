import { SellService } from '../SellService';
import { uploadBytesResumable, getDownloadURL } from 'firebase/storage';

// Mock firebase service barrel (provides auth, db, storage)
jest.mock('../firebase', () => ({
    auth: { currentUser: { uid: 'test-user-id' } },
    db: {},
    storage: {},
}));

// Mock Firebase
jest.mock('firebase/storage', () => ({
    getStorage: jest.fn(),
    ref: jest.fn(() => ({})),
    uploadBytes: jest.fn(() => Promise.resolve()),
    uploadBytesResumable: jest.fn(() => ({
        on: jest.fn((_evt: string, _next: any, _err: any, complete: () => void) => complete()),
        snapshot: { ref: {} },
    })),
    getDownloadURL: jest.fn(() => Promise.resolve('https://firebasestorage.com/img.jpg')),
}));

jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(() => ({
        currentUser: { uid: 'test-user-id' }
    })),
}));

jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    collection: jest.fn(),
    addDoc: jest.fn(),
    serverTimestamp: jest.fn(),
}));

// Mock logger
jest.mock('../logger-service', () => ({
    logger: {
        error: jest.fn(),
        info: jest.fn(),
    }
}));

// Mock retry
jest.mock('../../utils/retry', () => ({
    retry: jest.fn((fn) => fn()),
}));


// Mock numeric-car-system.service
jest.mock('../numeric-car-system.service', () => ({
    numericCarSystemService: {
        createCarAtomic: jest.fn(() => Promise.resolve({ id: 'test-car-id' })),
    },
}));

describe('SellService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('uploadImageResumable', () => {
        it('should return URIs for already uploaded images (http)', async () => {
            const onProgress = jest.fn();
            const signal = new AbortController().signal;

            const result = await SellService.uploadImageResumable('https://example.com/img.jpg', { onProgress, signal });

            expect(result).toBe('https://example.com/img.jpg');
            expect(onProgress).toHaveBeenCalledWith(100);
        });

        it('should upload local images and return download URL', async () => {
            const onProgress = jest.fn();
            const signal = new AbortController().signal;

            // Mock fetch for blob
            global.fetch = jest.fn(() => Promise.resolve({
                blob: () => Promise.resolve(new Blob(['test'])),
            })) as any;

            const result = await SellService.uploadImageResumable('file://local.jpg', { onProgress, signal });

            expect(uploadBytesResumable).toHaveBeenCalled();
            expect(getDownloadURL).toHaveBeenCalled();
            expect(result).toBe('https://firebasestorage.com/img.jpg');
        });

        it('should throw if aborted', async () => {
            const controller = new AbortController();
            controller.abort();

            await expect(
                SellService.uploadImageResumable('file://img.jpg', { onProgress: jest.fn(), signal: controller.signal })
            ).rejects.toThrow("Aborted");
        });
    });

    describe('submitListing', () => {
        // This would require mocking more complex firestore logic and the atomic implementation
        // Skipping deep test here, focusing on upload logic which was the main change.
        it('is defined', () => {
            expect(SellService.submitListing).toBeDefined();
        });
    });
});

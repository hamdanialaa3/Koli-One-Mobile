import { useEffect, useRef } from 'react';
import { useSellStore } from '../store/useSellStore';
import { SellService } from '../services/SellService';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { logger } from '../services/logger-service';

/** Max width/height for uploaded car images */
const MAX_IMAGE_DIMENSION = 1600;
/** JPEG compression quality (0-1) */
const COMPRESSION_QUALITY = 0.8;

/**
 * Compress and resize an image before upload.
 * - Resizes to max 1600px on the longest side
 * - Compresses to JPEG quality 0.8
 * Returns the URI of the compressed image.
 */
async function compressImage(uri: string): Promise<string> {
    try {
        const result = await manipulateAsync(
            uri,
            [{ resize: { width: MAX_IMAGE_DIMENSION } }],
            { compress: COMPRESSION_QUALITY, format: SaveFormat.JPEG }
        );
        return result.uri;
    } catch (err) {
        logger.warn('Image compression failed, using original', { error: err });
        return uri; // Fallback to original if compression fails
    }
}

export function useUploadQueue() {
    const images = useSellStore(state => state.images);
    const updateImage = useSellStore(state => state.updateImage);
    const queueRef = useRef<Record<string, AbortController>>({});

    useEffect(() => {
        images.forEach(img => {
            if (img.status === 'idle') {
                updateImage(img.id, { status: 'uploading', progress: 0 });
                const controller = new AbortController();
                queueRef.current[img.id] = controller;

                // Compress then upload
                compressImage(img.uri)
                    .then(compressedUri =>
                        SellService.uploadImageResumable(compressedUri, {
                            onProgress: (p) => updateImage(img.id, { progress: p }),
                            signal: controller.signal
                        })
                    )
                    .then((downloadUrl) => updateImage(img.id, { status: 'done', progress: 100, uri: downloadUrl }))
                    .catch((err) => {
                        if (!controller.signal.aborted) {
                            logger.error('Image upload failed', { imageId: img.id, error: err });
                            updateImage(img.id, { status: 'error' });
                        }
                    });
            }
        });

        return () => {
            Object.values(queueRef.current).forEach(c => c.abort());
        };
    }, [images]);
}

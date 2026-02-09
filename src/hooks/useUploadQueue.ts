import { useEffect, useRef } from 'react';
import { useSellStore } from '../store/useSellStore';
import { SellService } from '../services/SellService';

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
                SellService.uploadImageResumable(img.uri, {
                    onProgress: (p) => updateImage(img.id, { progress: p }),
                    signal: controller.signal
                }).then((downloadUrl) => updateImage(img.id, { status: 'done', progress: 100, uri: downloadUrl }))
                    .catch(() => updateImage(img.id, { status: 'error' }));
            }
        });

        // Cleanup function to abort uploads if component unmounts or images change significantly
        // Note: We might want to keep uploads running even if this hook unmounts in a real background scenario,
        // but for now we follow the user's strict instruction which included abort on cleanup.
        return () => {
            Object.values(queueRef.current).forEach(c => c.abort());
        };
    }, [images]);
}
